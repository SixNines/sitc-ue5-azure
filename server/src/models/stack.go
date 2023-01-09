package models

import (
	"time"
)

type Stack struct {
	Id           int64
	ResourceName string
	StackID      string
	Created      time.Time `xorm:"created"`
	Updated      time.Time `xorm:"updated"`
}
