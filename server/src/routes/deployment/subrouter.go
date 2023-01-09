package deployment

import (
	"fmt"
	"net/http"

	"github.com/SixNines/sitc-sales-demo/middleware"
	"github.com/loopfz/gadgeto/tonic"
	"github.com/wI2L/fizz"
)

func CreateSubrouter(fizzEngine *fizz.Fizz) {
	deploymentGroup := fizzEngine.Group("/api/deployment", "Deployments", "Endpoints for AWS Stack CRUD operations.")
	deploymentGroup.Use(middleware.RestGateAdapter)
	deploymentGroup.Use(middleware.CheckJwtToken)

	deploymentGroup.GET(
		"/describe/:resourceName",
		[]fizz.OperationOption{
			fizz.Summary("Get current information for a single AWS Stack."),
			fizz.ResponseWithExamples(
				fmt.Sprintf("%v", http.StatusBadRequest),
				"Bad request",
				nil,
				nil,
				map[string]interface{}{
					"noResourceName": "err. - `resourceName` is a required parameter",
					"awsFailed":      "err. - AWS encountered an error.",
				},
			),
		},
		tonic.Handler(DescribeDeployment, 200),
	)

	deploymentGroup.GET(
		"/list/:resourceStatus",
		[]fizz.OperationOption{
			fizz.Summary("List AWS Stacks and filter by Stack status."),
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
		tonic.Handler(ListDeployments, 200),
	)

	deploymentGroup.GET(
		"/state/:resourceName",
		[]fizz.OperationOption{
			fizz.Summary("Get list of latest Stack events."),
			fizz.ResponseWithExamples(
				fmt.Sprintf("%v", http.StatusBadRequest),
				"Bad request",
				nil,
				nil,
				map[string]interface{}{
					"noResourceName": "err. - `resourceName` is a required parameter",
					"awsFailed":      "err. - AWS encountered an error.",
				},
			),
		},
		tonic.Handler(GetState, 200),
	)

	deploymentGroup.POST(
		"/create",
		[]fizz.OperationOption{
			fizz.Summary("Create new AWS Stack."),
			fizz.ResponseWithExamples(
				fmt.Sprintf("%v", http.StatusBadRequest),
				"Bad request",
				nil,
				nil,
				map[string]interface{}{
					"noInstanceType":    "err. - `insntanceType` is a required field",
					"noOperatingSystem": "err. - `operatingSystem` is a required field",
					"noDiskSize":        "err. - `diskSize` is a required field",
					"noCidr":            "err. - `cidr` is a required field",
					"noPassword":        "err. - `password` is a required field",
					"noResourceName":    "err. - `resourceName` is a required fie,d",
					"awsFailed":         "err. - AWS encountered an error.",
				},
			),
		},
		tonic.Handler(CreateDeployment, 201),
	)

	deploymentGroup.DELETE(
		"/destroy/:resourceName",
		[]fizz.OperationOption{
			fizz.Summary("Delete specified Stack and all created Stack resources."),
			fizz.ResponseWithExamples(
				fmt.Sprintf("%v", http.StatusBadRequest),
				"Bad request",
				nil,
				nil,
				map[string]interface{}{
					"noResourceName": "err. - `resourceName` is a required parameter",
					"awsFailed":      "err. - AWS encountered an error.",
				},
			),
		},
		tonic.Handler(DestroyDeployment, 200),
	)

}
