package auth

import (
	"fmt"
	"os"

	"github.com/SixNines/sitc-sales-demo/database"
	"github.com/SixNines/sitc-sales-demo/errors"
	"github.com/SixNines/sitc-sales-demo/middleware"
	"github.com/SixNines/sitc-sales-demo/models"
	"github.com/SixNines/sitc-sales-demo/routes/user"
	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type AuthToken struct {
	AuthKey      string `header:"X-Auth-Key" description:"Required security header." validate:"required"`
	AuthToken    string `header:"X-Auth-Token" description:"Required JWT token header." validate:"required,jwt"`
	RefreshToken string `header:"X-Refresh-Token" description:"Required JWT refresh token header." validate:"required,jwt"`
}

type AuthCheckResponse struct {
	Authorized bool   `json:"authorized" validate:"required"`
	Message    string `json:"message" validate:"required"`
}

type AuthorizationResponse struct {
	UserName   string `json:"userName" validate:"required"`
	Authorized bool   `json:"authorized" validate:"required"`
}

func FindUser(userName string) (*models.User, error) {
	foundUser := &models.User{UserName: userName}
	_, err := database.DB.Select(foundUser)

	if err != nil {
		return nil, errors.InvalidUserNameOrPassword()
	}

	return foundUser, nil
}

func AuthorizeUser(c *gin.Context, user *user.RegisteredUser) (*AuthorizationResponse, error) {

	foundUser, err := FindUser(user.UserName)
	if err != nil {
		return nil, err
	}

	if err = bcrypt.CompareHashAndPassword([]byte(foundUser.Password), []byte(user.Password)); err != nil {
		return nil, errors.InvalidUserNameOrPassword()
	}

	apiKey := os.Getenv("CUMULUS_AUTH_API_KEY")
	if apiKey == "" {
		return nil, errors.InternalError("err. - No envar CUMULUS_AUTH_API_KEY found")
	}

	generatedToken, err := middleware.CreateJwtToken(user.UserName, foundUser.Role)
	if err != nil {
		return nil, err
	}

	refreshToken, err := middleware.CreateRefreshToken(user.UserName)
	if err != nil {
		return nil, err
	}

	c.Header("X-Refresh-Token", refreshToken.Token)
	c.SetCookie(
		"X-Refresh-Token",
		refreshToken.Token,
		int(refreshToken.Expiry.Unix()),
		"/",
		"cumulus.dev",
		false,
		false,
	)

	c.Header("X-Auth-Token", generatedToken.Token)
	c.SetCookie(
		"X-Auth-Token",
		generatedToken.Token,
		int(generatedToken.Expiry.Unix()),
		"/",
		"cumulus.dev",
		false,
		false,
	)

	return &AuthorizationResponse{
		UserName:   foundUser.UserName,
		Authorized: true,
	}, nil

}

func VerifyAdminToken(c *gin.Context, token *AuthToken) (*AuthCheckResponse, error) {

	// Make sure refresh token is valid.
	refreshToken, err := middleware.ParseToken(token.RefreshToken)
	if err != nil {
		return &AuthCheckResponse{
			Authorized: false,
			Message:    err.Error(),
		}, nil
	}

	// Parse the refresh claims.
	refreshClaims, OK := refreshToken.Claims.(jwt.MapClaims)
	if !OK {
		return nil, errors.BadRequest("err. - Unable to parse claims.")
	}

	// Parse JWT token.
	jwtToken, err := middleware.ParseToken(token.AuthToken)
	if err != nil {
		// If the refresh token is valid and the JWT is not, we need to
		// generate a new JWT.

		// Start by looking up the user specified in the token and making
		// sure they exist and are ADMIN.
		username := fmt.Sprintf("%s", refreshClaims["username"])
		foundUser, err := FindUser(username)

		if err != nil || foundUser.Role != "ADMIN" {
			return &AuthCheckResponse{
				Authorized: false,
				Message:    "err. - Unauthorized request.",
			}, nil
		}

		// Generate the new token.
		newToken, err := middleware.CreateJwtToken(username, foundUser.Role)
		if err != nil {
			return nil, errors.InternalError("err. - Could not generate new token.")
		}

		// Set the headers with the new token.
		c.Header("X-Auth-Token", newToken.Token)
		c.SetCookie(
			"X-Auth-Token",
			newToken.Token,
			int(newToken.Expiry.Unix()),
			"/",
			"cumulus.dev",
			false,
			false,
		)

	} else {

		// If the JWT token is valid, map the claims.
		claims, OK := jwtToken.Claims.(jwt.MapClaims)

		if !OK {
			return nil, errors.BadRequest("err. - Unable to parse claims.")
		}

		// Ensure the claims specify the JWT holder role is ADMIN.
		if claims["role"] != "ADMIN" {
			return &AuthCheckResponse{
				Authorized: false,
				Message:    "err. - Unauthorized request.",
			}, nil
		}

	}

	// Return that we are authorized.
	return &AuthCheckResponse{
		Authorized: true,
		Message:    "OK",
	}, nil
}

func VerifyToken(c *gin.Context, token *AuthToken) (*AuthCheckResponse, error) {

	// Make sure refresh token is valid.
	refreshToken, err := middleware.ParseToken(token.RefreshToken)
	if err != nil {
		return &AuthCheckResponse{
			Authorized: false,
			Message:    err.Error(),
		}, nil
	}

	// Parse the refresh claims.
	refreshClaims, OK := refreshToken.Claims.(jwt.MapClaims)
	if !OK {
		return nil, errors.BadRequest("err. - Unable to parse claims.")
	}

	// Parse JWT token.
	jwtToken, err := middleware.ParseToken(token.AuthToken)
	if err != nil {
		// If the refresh token is valid and the JWT is not, we need to
		// generate a new JWT.

		// Start by looking up the user specified in the token and making
		// sure they exist.
		username := fmt.Sprintf("%s", refreshClaims["username"])
		foundUser, err := FindUser(username)

		if err != nil {
			return &AuthCheckResponse{
				Authorized: false,
				Message:    "err. - Unauthorized request.",
			}, nil
		}

		// Generate the new token.
		newToken, err := middleware.CreateJwtToken(username, foundUser.Role)
		if err != nil {
			return nil, errors.InternalError("err. - Could not generate new token.")
		}

		// Set the headers with the new token.
		c.Header("X-Auth-Token", newToken.Token)
		c.SetCookie(
			"X-Auth-Token",
			newToken.Token,
			int(newToken.Expiry.Unix()),
			"/",
			"cumulus.dev",
			false,
			false,
		)

	} else {

		// If the JWT token is valid, map the claims.
		_, OK := jwtToken.Claims.(jwt.MapClaims)
		if !OK {
			return nil, errors.BadRequest("err. - Unable to parse claims.")
		}

	}

	// Return that we are authorized.
	return &AuthCheckResponse{
		Authorized: true,
		Message:    "OK",
	}, nil
}
