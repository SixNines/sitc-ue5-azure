package internal

import (
	"github.com/loopfz/gadgeto/tonic"
	"github.com/wI2L/fizz"
	"github.com/wI2L/fizz/openapi"
)

func CreateSubrouter(fizzEngine *fizz.Fizz) {

	info := &openapi.Info{
		Title:       "UE5 Cloud Launcher",
		Description: `Server to launch UE5 cloud deployments on AWS.`,
		Version:     "1.0.0",
	}

	fizzEngine.Generator().SetSecuritySchemes(map[string]*openapi.SecuritySchemeOrRef{
		"authKey": {
			SecurityScheme: &openapi.SecurityScheme{
				Type: "apiKey",
				In:   "header",
				Name: "X-Auth-Key",
			},
		},
	})

	fizz.Security(&openapi.SecurityRequirement{
		"authKey": []string{},
	})

	fizzEngine.GET("/api/openapi", nil, fizzEngine.OpenAPI(info, "json"))
	fizzEngine.GET("/api/status", nil, tonic.Handler(Status, 200))
}
