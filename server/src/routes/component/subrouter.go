package component

import (
	"fmt"
	"net/http"

	"github.com/SixNines/sitc-sales-demo/middleware"
	"github.com/loopfz/gadgeto/tonic"
	"github.com/wI2L/fizz"
)

func CreateSubrouter(fizzEngine *fizz.Fizz) {
	deploymentGroup := fizzEngine.Group("/api/components", "Components", "Endpoints to retrieve information on Resources created by an AWS Stack.")
	deploymentGroup.Use(middleware.RestGateAdapter)
	deploymentGroup.Use(middleware.CheckJwtToken)

	deploymentGroup.GET(
		"/describe/:resourceName/:componentId",
		[]fizz.OperationOption{
			fizz.Summary("Get current information for a specific resource created by the specified AWS stack."),
			fizz.ResponseWithExamples(
				fmt.Sprintf("%v", http.StatusBadRequest),
				"Bad request",
				nil,
				nil,
				map[string]interface{}{
					"noResourceName": "err. - `resourceName` is a required parameter",
					"noComponentId":  "err. - `componentId` is a required parameter",
					"awsFailed":      "err. - AWS encountered an error.",
				},
			),
		},
		tonic.Handler(DescribeDeploymentComponent, 200),
	)

	deploymentGroup.GET(
		"/list/:resourceName",
		[]fizz.OperationOption{
			fizz.Summary("List resources for a single AWS stack."),
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
		tonic.Handler(ListDeploymentComponents, 200),
	)

}
