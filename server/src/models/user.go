package models

import (
	"time"
)

type User struct {
	Id       int64
	UserName string `xorm:"varchar(200) not null unique"`
	Salt     string
	Password string `xorm:"varchar(200)"`
	Token    string `xorm:"varchar(200)"`
	Role     string
	Created  time.Time `xorm:"created"`
	Updated  time.Time `xorm:"updated"`
}
