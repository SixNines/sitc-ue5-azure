package user

import (
	"fmt"
	"net/http"

	"github.com/SixNines/sitc-sales-demo/middleware"
	"github.com/loopfz/gadgeto/tonic"
	"github.com/wI2L/fizz"
)

func CreateSubrouter(fizzEngine *fizz.Fizz) {
	userGroup := fizzEngine.Group("/api/user", "Users", "Endpoints for managing Cumulus users.")
	userGroup.Use(middleware.RestGateAdapter)

	userGroup.GET(
		"/describe/:userName",
		[]fizz.OperationOption{
			fizz.Summary("Get a single Cumulus User by `:userName`."),
			fizz.ResponseWithExamples(
				fmt.Sprintf("%v", http.StatusBadRequest),
				"Bad request",
				nil,
				nil,
				map[string]interface{}{
					"noUserName": "err. - `userName` is a required parameter",
					"sqlError":   "err. - SQLite encountered an error.",
				},
			),
		},
		middleware.CheckJwtToken,
		tonic.Handler(GetUser, 200),
	)

	userGroup.GET(
		"/list/:limit",
		[]fizz.OperationOption{
			fizz.Summary("List up to `:limit` Cumulus Users."),
			fizz.ResponseWithExamples(
				fmt.Sprintf("%v", http.StatusBadRequest),
				"Bad request",
				nil,
				nil,
				map[string]interface{}{
					"noLimit":  "err. - `limit` is a required parameter",
					"sqlError": "err. - SQLite encountered an error.",
				},
			),
		},
		middleware.CheckJwtToken,
		tonic.Handler(ListUsers, 200),
	)

	userGroup.POST(
		"/create",
		[]fizz.OperationOption{
			fizz.Summary("Create new Cumulus User."),
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
		middleware.CheckJwtToken,
		middleware.VerifyAdminRole,
		tonic.Handler(CreateUser, 201),
	)

	userGroup.PUT(
		"/update",
		[]fizz.OperationOption{
			fizz.Summary("Update specified Cumulus User."),
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
		middleware.CheckJwtToken,
		middleware.VerifyAdminRole,
		tonic.Handler(UpdateUser, 202),
	)

	userGroup.DELETE(
		"/destroy/:userName",
		[]fizz.OperationOption{
			fizz.Summary("Delete specified Cumulus User."),
			fizz.ResponseWithExamples(
				fmt.Sprintf("%v", http.StatusBadRequest),
				"Bad request",
				nil,
				nil,
				map[string]interface{}{
					"noUserName": "err. - `userName` is a required in path.",
					"sqlError":   "err. - SQLite encountered an error.",
				},
			),
		},
		middleware.CheckJwtToken,
		middleware.VerifyAdminRole,
		tonic.Handler(DeleteUser, 200),
	)
}
