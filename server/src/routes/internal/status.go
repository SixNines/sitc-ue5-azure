package internal

import (
	"github.com/gin-gonic/gin"
)

type StatusRequest struct{}

type StatusResponse struct {
	Message string `json:"message"`
}

func Status(c *gin.Context, status *StatusRequest) (*StatusResponse, error) {

	c.Header("Content-Type", "application/json")

	return &StatusResponse{
		Message: "OK",
	}, nil

}
