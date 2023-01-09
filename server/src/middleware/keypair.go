package middleware

import (
	"github.com/gin-gonic/gin"
)

func GetBeforeCreate(c *gin.Context) {

	c.Next()
}
