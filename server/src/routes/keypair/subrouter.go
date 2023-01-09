package keypair

import (
	"fmt"
	"net/http"

	"github.com/SixNines/sitc-sales-demo/middleware"
	"github.com/loopfz/gadgeto/tonic"
	"github.com/wI2L/fizz"
)

func CreateSubrouter(fizzEngine *fizz.Fizz) {
	keyPairGroup := fizzEngine.Group("/api/keypair", "Keypairs", "Endpoints for AWS KeyPair CRUD operations.")
	keyPairGroup.Use(middleware.RestGateAdapter)
	keyPairGroup.Use(middleware.CheckJwtToken)

	keyPairGroup.POST(
		"/list",
		[]fizz.OperationOption{
			fizz.Summary("List or filter AWS KeyPairs"),
			fizz.ResponseWithExamples(
				fmt.Sprintf("%v", http.StatusBadRequest),
				"Bad request",
				nil,
				nil,
				map[string]interface{}{
					"awsFailed": "err. - AWS encountered an error.",
				},
			),
		},
		tonic.Handler(ListKeyPairs, 200),
	)

	keyPairGroup.POST(
		"/create",
		[]fizz.OperationOption{
			fizz.Summary("Create new AWS KeyPair."),
			fizz.ResponseWithExamples(
				fmt.Sprintf("%v", http.StatusBadRequest),
				"Bad request",
				nil,
				nil,
				map[string]interface{}{
					"noKeyPairName": "err. - `keyPairName` is required JSON body key/value.",
					"awsFailed":     "err. - AWS encountered an error.",
				},
			),
		},
		tonic.Handler(CreateKeyPair, 201),
	)

	keyPairGroup.DELETE(
		"/destroy/:keyPairName",
		[]fizz.OperationOption{
			fizz.Summary("Delete specified AWS KeyPair."),
			fizz.ResponseWithExamples(
				fmt.Sprintf("%v", http.StatusBadRequest),
				"Bad request",
				nil,
				nil,
				map[string]interface{}{
					"noKeyPairName": "err. - `keyPairName` is required JSON body key/value.",
					"awsFailed":     "err. - AWS encountered an error.",
				},
			),
		},
		tonic.Handler(DeleteKeyPair, 200),
	)

}
