package middleware

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/SixNines/sitc-sales-demo/database"
	"github.com/SixNines/sitc-sales-demo/errors"
	"github.com/SixNines/sitc-sales-demo/models"
	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
)

type Claims struct {
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.StandardClaims
}

type RefreshClaims struct {
	Username string `json:"username"`
	jwt.StandardClaims
}

type UnsignedResponse struct {
	Authorized bool        `json:"authorized"`
	Message    interface{} `json:"message"`
}

type GeneratedToken struct {
	Token  string
	Expiry time.Time
}

func CreateJwtToken(userName string, role string) (*GeneratedToken, error) {
	apiKey := os.Getenv("CUMULUS_AUTH_API_KEY")
	if apiKey == "" {
		return nil, errors.InternalError("err. - No envar CUMULUS_AUTH_API_KEY found")
	}

	tokenExpiry := time.Now().Add(15 * time.Minute)

	claims := &Claims{
		Username: userName,
		Role:     role,
		StandardClaims: jwt.StandardClaims{
			IssuedAt:  time.Now().Unix(),
			ExpiresAt: tokenExpiry.Unix(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(apiKey))
	if err != nil {
		// If there is an error in creating the JWT return an internal server error
		return nil, errors.InternalError(err.Error())
	}

	return &GeneratedToken{
		Token:  tokenString,
		Expiry: tokenExpiry,
	}, nil
}

func CreateRefreshToken(userName string) (*GeneratedToken, error) {
	apiKey := os.Getenv("CUMULUS_AUTH_API_KEY")
	if apiKey == "" {
		return nil, errors.InternalError("err. - No envar CUMULUS_AUTH_API_KEY found")
	}

	refreshExpiry := time.Now().Add(6 * time.Hour)
	refreshClaims := &RefreshClaims{
		Username: userName,
		StandardClaims: jwt.StandardClaims{
			IssuedAt:  time.Now().Unix(),
			ExpiresAt: refreshExpiry.Unix(),
		},
	}

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)

	refreshString, err := refreshToken.SignedString([]byte(apiKey))
	if err != nil {
		return nil, errors.InternalError(err.Error())
	}
	return &GeneratedToken{
		Token:  refreshString,
		Expiry: refreshExpiry,
	}, nil
}

func ParseToken(jwtToken string) (*jwt.Token, error) {
	token, err := jwt.ParseWithClaims(jwtToken, jwt.MapClaims{}, func(token *jwt.Token) (interface{}, error) {

		apiKey := os.Getenv("CUMULUS_AUTH_API_KEY")
		if apiKey == "" {
			return nil, errors.InternalError("err. - No envar CUMULUS_AUTH_API_KEY found")
		}

		if _, OK := token.Method.(*jwt.SigningMethodHMAC); !OK {
			return nil, errors.UnauthorizedRequest()
		}
		return []byte(apiKey), nil
	})

	if err != nil {
		return nil, errors.UnauthorizedRequest()
	}

	return token, nil
}

func CheckJwtToken(c *gin.Context) {
	refreshToken := c.GetHeader("X-Refresh-Token")
	refreshClaims, refreshErr := ParseToken(refreshToken)
	if refreshErr != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, UnsignedResponse{
			Message: "err. - Bad or expired refresh token.",
		})
		return
	}

	jwtToken := c.GetHeader("X-Auth-Token")

	token, err := ParseToken(jwtToken)
	if err != nil && refreshErr == nil {
		claims, OK := refreshClaims.Claims.(jwt.MapClaims)
		if !OK {
			c.AbortWithStatusJSON(http.StatusInternalServerError, UnsignedResponse{
				Authorized: false,
				Message:    "err. - Unable to parse claims.",
			})
			return
		}

		userName := fmt.Sprintf("%s", claims["username"])
		foundUser := &models.User{UserName: userName}
		_, err := database.DB.Select(foundUser)

		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, UnsignedResponse{
				Authorized: false,
				Message:    "err. - Could not create new token.",
			})
			return
		}

		newToken, newTokenErr := CreateJwtToken(userName, foundUser.Role)
		if newTokenErr != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, UnsignedResponse{
				Authorized: false,
				Message:    "err. - Could not create new token.",
			})
		}

		token, err = ParseToken(newToken.Token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, UnsignedResponse{
				Authorized: false,
				Message:    "err. - Could not create new token.",
			})
		}

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

	} else if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, UnsignedResponse{
			Authorized: false,
			Message:    "err. - Bad or expired JWT token.",
		})
		return
	}

	claims, OK := token.Claims.(jwt.MapClaims)
	if !OK {
		c.AbortWithStatusJSON(http.StatusInternalServerError, UnsignedResponse{
			Authorized: false,
			Message:    "err. - Unable to parse claims.",
		})
		return
	}

	c.Set("role", claims["role"])

	c.Next()
}
