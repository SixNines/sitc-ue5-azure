package middleware

import (
	"log"
	"net/http"
	"os"

	"github.com/SixNines/sitc-sales-demo/errors"
	"github.com/gin-gonic/gin"
	"github.com/pjebs/restgate"
)

var restGateAuth *restgate.RESTGate

func CreateRestGate() {

	apiKey := os.Getenv("CUMULUS_AUTH_API_KEY")
	if apiKey == "" {
		log.Fatal("err. - No envar CUMULUS_AUTH_API_KEY found")
		os.Exit(1)
	}

	restGateAuth = restgate.New(
		"X-Auth-Key",
		"",
		restgate.Static,
		restgate.Config{
			Key: []string{
				apiKey,
			},
			HTTPSProtectionOff: true,
		},
	)

}

func RestGateAdapter(c *gin.Context) {

	nextCalled := false
	nextAdapter := func(http.ResponseWriter, *http.Request) {
		nextCalled = true
		c.Next()
	}

	restGateAuth.ServeHTTP(c.Writer, c.Request, nextAdapter)
	if !nextCalled {
		c.AbortWithStatusJSON(http.StatusUnauthorized, errors.UnauthorizedRequest())
	}
}

func VerifyAdminRole(c *gin.Context) {

	if c.Keys["role"] != "ADMIN" {
		c.AbortWithStatusJSON(http.StatusUnauthorized, errors.UnauthorizedRequest())
	}

	c.Next()

}
