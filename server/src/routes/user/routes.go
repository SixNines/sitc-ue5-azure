package user

import (
	"github.com/SixNines/sitc-sales-demo/database"
	"github.com/SixNines/sitc-sales-demo/errors"
	"github.com/SixNines/sitc-sales-demo/models"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type UserQuery struct {
	UserName  string `path:"userName" validate:"required"`
	AuthKey   string `header:"X-Auth-Key" description:"Required security header." validate:"required"`
	AuthToken string `header:"X-Auth-Token" description:"Required JWT token header." validate:"required,jwt"`
}

type UserList struct {
	Limit     uint32 `path:"limit" validate:"required"`
	AuthKey   string `header:"X-Auth-Key" description:"Required security header." validate:"required"`
	AuthToken string `header:"X-Auth-Token" description:"Required JWT token header." validate:"required,jwt"`
}

type RegisteredUser struct {
	UserName string `json:"userName" validate:"required"`
	Password string `json:"password" validate:"required"`
	AuthKey  string `header:"X-Auth-Key" description:"Required security header." validate:"required"`
}

type NewUser struct {
	RegisteredUser
	Role      string `json:"role" validate:"required,oneof='ADMIN' 'DEV'"`
	AuthToken string `header:"X-Auth-Token" description:"Required JWT token header." validate:"required,jwt"`
}

type UpdatedUser struct {
	NewUser
	UpdatedUserName string `json:"updatedUserName"`
}

type SecureUserResponse struct {
	Id       int64  `json:"id" validate:"required"`
	UserName string `json:"userName" validate:"required"`
	Role     string `json:"role" validate:"required"`
}

type DeletedUserResponse struct {
	Status string `json:"status" validate:"required"`
}

func GetUser(c *gin.Context, user *UserQuery) (*SecureUserResponse, error) {

	foundUser := &models.User{UserName: user.UserName}
	_, err := database.DB.Select(foundUser)

	if err != nil {
		return nil, err
	}

	return &SecureUserResponse{
		Id:       foundUser.Id,
		UserName: foundUser.UserName,
		Role:     foundUser.Role,
	}, nil

}

func ListUsers(c *gin.Context, user *UserList) ([]SecureUserResponse, error) {
	foundUsers := []models.User{}

	_, err := database.DB.List(
		user.Limit,
		&models.User{},
		&foundUsers,
	)
	if err != nil {
		return nil, err
	}

	securedUsersList := []SecureUserResponse{}
	for _, user := range foundUsers {
		securedUsersList = append(securedUsersList, SecureUserResponse{
			Id:       user.Id,
			UserName: user.UserName,
			Role:     user.Role,
		})
	}

	return securedUsersList, nil
}

func CreateUser(c *gin.Context, user *NewUser) (*SecureUserResponse, error) {

	hashed, encryptErr := bcrypt.GenerateFromPassword([]byte(user.Password), 16)
	if encryptErr != nil {
		return nil, errors.BadRequest(encryptErr.Error())
	}

	newUser := &models.User{
		UserName: user.UserName,
		Password: string(hashed),
		Role:     user.Role,
	}

	_, err := database.DB.Insert(newUser)

	if err != nil {
		return nil, err
	}

	return &SecureUserResponse{
		Id:       newUser.Id,
		UserName: newUser.UserName,
		Role:     newUser.Role,
	}, nil

}

func UpdateUser(c *gin.Context, user *UpdatedUser) (*SecureUserResponse, error) {

	if user.UpdatedUserName == "" {
		user.UpdatedUserName = user.UserName
	}

	hashed, encryptErr := bcrypt.GenerateFromPassword([]byte(user.Password), 16)
	if encryptErr != nil {
		return nil, errors.BadRequest(encryptErr.Error())
	}

	foundUser := &models.User{UserName: user.UserName}
	_, err := database.DB.Select(foundUser)

	if err != nil {
		return nil, err
	}

	updatedUser := &models.User{
		UserName: user.UpdatedUserName,
		Role:     user.Role,
		Password: string(hashed),
	}

	_, err = database.DB.Update(updatedUser, foundUser.Id)

	if err != nil {
		return nil, err
	}

	return &SecureUserResponse{
		Id:       foundUser.Id,
		UserName: updatedUser.UserName,
		Role:     updatedUser.Role,
	}, nil

}

func DeleteUser(c *gin.Context, user *UserQuery) (*DeletedUserResponse, error) {

	_, err := database.DB.Delete(&models.User{
		UserName: user.UserName,
	})
	if err != nil {
		return nil, err
	}

	return &DeletedUserResponse{
		Status: "OK",
	}, nil
}
