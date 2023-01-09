package cache

import (
	"bytes"
	"context"
	"encoding/gob"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/mailgun/groupcache/v2"
)

type Cache struct {
	Pool         *groupcache.HTTPPool
	Address      string
	GroupAddress string
	Server       *http.Server
	Group        *groupcache.Group
}

var EmbeddedCache *Cache

func CreateCache() {
	EmbeddedCache = &Cache{}
}

func (cache *Cache) Initialize(port int) {

	cache.Address = fmt.Sprintf("127.0.0.1:%v", port)
	cache.Pool = groupcache.NewHTTPPoolOpts(cache.Address, &groupcache.HTTPPoolOptions{})

	cache.Pool.Set(cache.Address)

	cache.Server = &http.Server{
		Addr:    cache.Address,
		Handler: cache.Pool,
	}

	log.Printf("Cache listening on: %v\n\n", cache.Address)
	// Start a HTTP server to listen for peer requests from the groupcache
	go func() {
		if err := cache.Server.ListenAndServe(); err != nil {
			log.Fatal(err)
		}
	}()
	// defer cache.Server.Shutdown(context.Background())

}

func (cache *Cache) AddGroup(groupName string, storageType []byte, groupSize int64) {
	cache.Group = groupcache.NewGroup(groupName, groupSize, groupcache.GetterFunc(
		func(ctx context.Context, id string, dest groupcache.Sink) error {
			// Set the user in the groupcache to expire after 5 minutes
			return dest.SetBytes(storageType, time.Now().Add(time.Minute*5))
		},
	))
}

func (cache *Cache) EncodeMessage(message interface{}) ([]byte, error) {

	var buffer bytes.Buffer
	enc := gob.NewEncoder(&buffer)

	err := enc.Encode(message)
	if err != nil {
		return nil, err
	}

	return buffer.Bytes(), nil

}

func (cache *Cache) DecodeMessage(message []byte) (interface{}, error) {
	var buffer bytes.Buffer
	enc := gob.NewDecoder(&buffer)

	var decoded interface{}

	err := enc.Decode(&decoded)
	if err != nil {
		return nil, err
	}

	return decoded, nil
}
