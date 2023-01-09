package auth

import (
	"fmt"
	"net/http"

	"github.com/SixNines/sitc-sales-demo/middleware"
	"github.com/loopfz/gadgeto/tonic"
	"github.com/wI2L/fizz"
)

func CreateSubrouter(fizzEngine *fizz.Fizz) {
	authGroup := fizzEngine.Group("/api/auth", "Auth", "Endpoints for checking/refreshing tokens.")
	authGroup.Use(middleware.RestGateAdapter)

	authGroup.POST(
		"/login",
		[]fizz.OperationOption{
			fizz.Summary("Authorize Cumulus User."),
			fizz.Header("X-Auth-Token", "JWT authorization token.", nil),
			fizz.ResponseWithExamples(
				fmt.Sprintf("%v", http.StatusBadRequest),
				"Bad request",
				nil,
				nil,
				map[string]interface{}{
					"noUserName": "err. - `userName` is a required in JSON body.",
					"noPassword": "err. - `password` is a required in JSON body.",
					"sqlError":   "err. - SQLite encountered an error.",
				},
			),
		},
		tonic.Handler(AuthorizeUser, 200),
	)

	authGroup.GET(
		"/verify",
		[]fizz.OperationOption{
			fizz.Summary("Verify X-Auth-Token."),
			fizz.ResponseWithExamples(
				fmt.Sprintf("%v", http.StatusBadRequest),
				"Bad request",
				nil,
				nil,
				map[string]interface{}{
					"invalidToken": "err. - `X-Auth-Token` is invalid or has expired",
				},
			),
		},
		tonic.Handler(VerifyToken, 200),
	)

	authGroup.GET(
		"/verify/admin",
		[]fizz.OperationOption{
			fizz.Summary("Verify X-Auth-Token."),
			fizz.ResponseWithExamples(
				fmt.Sprintf("%v", http.StatusBadRequest),
				"Bad request",
				nil,
				nil,
				map[string]interface{}{
					"invalidToken": "err. - `X-Auth-Token` is invalid or has expired",
				},
			),
		},
		tonic.Handler(VerifyAdminToken, 200),
	)

}
