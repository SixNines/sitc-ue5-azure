package database

import (
	"fmt"
	"log"
	"os"

	"github.com/SixNines/sitc-sales-demo/errors"
	"github.com/go-xorm/xorm"
	_ "github.com/mattn/go-sqlite3"
)

type Database struct {
	Engine *xorm.Engine
}

var DB *Database

func InitializeDatabase() {
	DB = &Database{}
}

func (db *Database) CreateDatabase() {
	engine, err := xorm.NewEngine("sqlite3", "cumulus.db")
	if err != nil {
		log.Fatalf("err. - Could not create Cumulus database: %v\n", err.Error())
		os.Exit(1)
	}

	db.Engine = engine

}

func (db *Database) Close() {
	db.Engine.Close()
	db.Engine = nil
}

func (db *Database) AddTables(tables ...interface{}) error {
	db.Engine.CreateTables(tables...)
	return db.Engine.Sync2(tables...)

}

func (db *Database) Select(item interface{}) (bool, error) {
	result, err := db.Engine.Table(item).Get(item)
	if err != nil {
		return false, errors.DBError(err)
	}

	if !result {
		return false, errors.DBErrorFromString(
			fmt.Sprintf("Item not found - %v", item),
		)
	}

	return result, nil
}

func (db *Database) List(limit uint32, table interface{}, items interface{}) (bool, error) {
	err := db.Engine.Table(table).Limit(int(limit)).Find(items, table)
	if err != nil {
		return false, errors.DBError(err)
	}

	return true, nil
}

func (db *Database) Insert(item interface{}) (int64, error) {
	result, err := db.Engine.Table(item).Insert(item)
	if err != nil {
		return -1, errors.DBError(err)
	}

	return result, nil
}

func (db *Database) Exists(item interface{}) (bool, error) {
	result, err := db.Engine.Table(item).Exist(item)
	if err != nil {
		return false, errors.DBError(err)
	}

	if !result {
		return false, errors.DBErrorFromString(
			fmt.Sprintf("Item not found - %v", item),
		)
	}

	return result, nil
}

func (db *Database) Delete(item interface{}) (int64, error) {

	result, err := db.Engine.Table(item).Delete(item)
	if err != nil {
		return -1, errors.DBError(err)
	}

	return result, nil
}

func (db *Database) Update(item interface{}, id int64) (int64, error) {
	result, err := db.Engine.Table(item).ID(id).Update(item)
	if err != nil {
		return -1, errors.DBError(err)
	}

	return result, nil
}
