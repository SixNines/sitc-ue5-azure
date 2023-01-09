package routes

import (
	"time"

	"github.com/SixNines/sitc-sales-demo/middleware"
	"github.com/SixNines/sitc-sales-demo/routes/auth"
	"github.com/SixNines/sitc-sales-demo/routes/component"
	"github.com/SixNines/sitc-sales-demo/routes/deployment"
	"github.com/SixNines/sitc-sales-demo/routes/instance"
	"github.com/SixNines/sitc-sales-demo/routes/internal"
	"github.com/SixNines/sitc-sales-demo/routes/keypair"
	"github.com/SixNines/sitc-sales-demo/routes/user"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/loopfz/gadgeto/tonic"
	"github.com/wI2L/fizz"
)

// Route declaration
func Router() *fizz.Fizz {

	router := gin.Default()
	router.HandleMethodNotAllowed = true

	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"*",
		},
		AllowMethods: []string{
			"GET",
			"POST",
			"PUT",
			"DELETE",
			"HEAD",
			"OPTIONS",
		},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Content-Length",
			"Authorization",
			"X-Auth-Key",
			"X-Auth-Token",
			"X-Refresh-Token",
		},
		ExposeHeaders: []string{
			"Content-Length",
			"Content-Type",
			"X-Auth-Token",
			"X-Refresh-Token",
		},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	middleware.CreateRestGate()

	fizzEngine := fizz.NewFromEngine(router)

	auth.CreateSubrouter(fizzEngine)
	internal.CreateSubrouter(fizzEngine)
	deployment.CreateSubrouter(fizzEngine)
	keypair.CreateSubrouter(fizzEngine)
	user.CreateSubrouter(fizzEngine)
	component.CreateSubrouter(fizzEngine)
	instance.CreateSubrouter(fizzEngine)

	tonic.SetErrorHook(middleware.HandleErrors)

	return fizzEngine
}
