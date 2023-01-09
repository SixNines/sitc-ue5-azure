package instance

import (
	"fmt"
	"net/http"

	"github.com/SixNines/sitc-sales-demo/middleware"
	"github.com/loopfz/gadgeto/tonic"
	"github.com/wI2L/fizz"
)

func CreateSubrouter(fizzEngine *fizz.Fizz) {
	instancesGroup := fizzEngine.Group("/api/instance", "Instances", "Endpoints for managing AWS EC2 instances.")
	instancesGroup.Use(middleware.RestGateAdapter)
	instancesGroup.Use(middleware.CheckJwtToken)

	instancesGroup.GET(
		"/describe/:instanceId",
		[]fizz.OperationOption{
			fizz.Summary("Describe the specified AWS EC2 instance."),
			fizz.ResponseWithExamples(
				fmt.Sprintf("%v", http.StatusBadRequest),
				"Bad request",
				nil,
				nil,
				map[string]interface{}{
					"noInstanceId": "err. - `instanceId` is a required parameter",
					"awsFailed":    "err. - AWS encountered an error.",
				},
			),
		},
		tonic.Handler(DescibeInstance, 200),
	)

	instancesGroup.GET(
		"/describe/volume/:volumeId",
		[]fizz.OperationOption{
			fizz.Summary("Describe the specified AWS volume."),
			fizz.ResponseWithExamples(
				fmt.Sprintf("%v", http.StatusBadRequest),
				"Bad request",
				nil,
				nil,
				map[string]interface{}{
					"noVolumeId": "err. - `volumeId` is a required parameter",
					"awsFailed":  "err. - AWS encountered an error.",
				},
			),
		},
		tonic.Handler(DescribeInstanceVolume, 200),
	)

	instancesGroup.GET(
		"/start/:instanceId",
		[]fizz.OperationOption{
			fizz.Summary("Start the specified AWS EC2 instance."),
			fizz.ResponseWithExamples(
				fmt.Sprintf("%v", http.StatusBadRequest),
				"Bad request",
				nil,
				nil,
				map[string]interface{}{
					"noInstanceId": "err. - `instanceId` is a required parameter",
					"awsFailed":    "err. - AWS encountered an error.",
				},
			),
		},
		tonic.Handler(StartInstance, 200),
	)

	instancesGroup.GET(
		"/stop/:instanceId",
		[]fizz.OperationOption{
			fizz.Summary("Stop the specified AWS EC2 instance."),
			fizz.ResponseWithExamples(
				fmt.Sprintf("%v", http.StatusBadRequest),
				"Bad request",
				nil,
				nil,
				map[string]interface{}{
					"noInstanceId": "err. - `instanceId` is a required parameter",
					"awsFailed":    "err. - AWS encountered an error.",
				},
			),
		},
		tonic.Handler(StopInstance, 200),
	)

}
