package errors

import (
	"github.com/juju/errors"
)

var defaultError = errors.New("An error occured.")

func BadRequest(message string) error {
	return errors.NewBadRequest(errors.New(message), "err. - bad request")
}

func UnauthorizedRequest() error {
	return errors.NewUnauthorized(defaultError, "err. - unauthorized request")
}

func InternalError(message string) error {
	return errors.New(message)
}

func AWSError(awsError error) error {
	return errors.NewNotProvisioned(awsError, "err. - AWS encountered an error.")
}

func DBError(dbError error) error {
	return errors.NewNotFound(dbError, "err. - SQLite encountered an error.")
}

func DBErrorFromString(dbError string) error {
	return errors.NewNotFound(
		errors.New(dbError),
		"err. - SQLite encountered an error.",
	)
}

func InvalidUserNameOrPassword() error {
	return errors.NewUserNotFound(errors.New("Please try again."), "Invalid username or password")
}

func KeypairExistsError() error {
	return errors.AlreadyExists
}

func CustomError(message string) error {
	return errors.New(message)
}

type APIError struct {
	Message string `json:"message"`
}
