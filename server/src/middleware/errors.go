package middleware

import (
	"net/http"

	apiErrors "github.com/SixNines/sitc-sales-demo/errors"
	"github.com/gin-gonic/gin"
	"github.com/juju/errors"
	"github.com/loopfz/gadgeto/tonic"
)

func HandleErrors(_ *gin.Context, e error) (int, interface{}) {
	code, msg := http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError)

	if _, ok := e.(tonic.BindError); ok {
		code, msg = http.StatusBadRequest, e.Error()
	} else {
		switch {
		case errors.Is(e, errors.BadRequest), errors.Is(e, errors.NotSupported), errors.Is(e, errors.NotValid), errors.Is(e, errors.NotProvisioned):
			code, msg = http.StatusBadRequest, e.Error()
		case errors.Is(e, errors.Forbidden):
			code, msg = http.StatusForbidden, e.Error()
		case errors.Is(e, errors.MethodNotAllowed):
			code, msg = http.StatusMethodNotAllowed, e.Error()
		case errors.Is(e, errors.NotFound), errors.Is(e, errors.UserNotFound):
			code, msg = http.StatusNotFound, e.Error()
		case errors.Is(e, errors.Unauthorized):
			code, msg = http.StatusUnauthorized, e.Error()
		case errors.Is(e, errors.AlreadyExists):
			code, msg = http.StatusConflict, e.Error()
		case errors.Is(e, errors.NotImplemented):
			code, msg = http.StatusNotImplemented, e.Error()
		}
	}
	err := apiErrors.APIError{
		Message: msg,
	}
	return code, err
}
