package models

import (
	"time"
)

type KeyPair struct {
	Id            int64
	KeyPairName   string
	KeyPairStack  string
	KeyPairStatus string
	Created       time.Time `xorm:"created"`
	Updated       time.Time `xorm:"updated"`
}
