package cli

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/SixNines/sitc-sales-demo/cache"
	"github.com/SixNines/sitc-sales-demo/config"
	"github.com/SixNines/sitc-sales-demo/database"
	"github.com/SixNines/sitc-sales-demo/models"
	"github.com/SixNines/sitc-sales-demo/routes"
	"github.com/joho/godotenv"
)

// Initiate web server
func Serve(args *CLIArgs) {

	cumulusEnvFilepath := os.Getenv("CUMULUS_ENV_FILEPATH")
	if cumulusEnvFilepath == "" {
		cumulusEnvFilepath = ".env"
	}

	err := godotenv.Load(cumulusEnvFilepath)
	if err != nil {
		log.Fatal("Error loading .env file")
		os.Exit(1)
	}

	config.CreateConfig()
	database.InitializeDatabase()
	database.DB.CreateDatabase()
	err = database.DB.AddTables(
		new(models.User),
		new(models.Stack),
		new(models.KeyPair),
	)
	if err != nil {
		log.Fatalf("err. - Could not create tables %v\n", err.Error())
		os.Exit(1)
	}

	cache.CreateCache()
	cache.EmbeddedCache.Initialize(5061)

	serverIp := os.Getenv("SERVER_IP")
	if serverIp == "" {
		serverIp = "127.0.0.1"
	}

	serverPort := ":" + fmt.Sprintf("%v", args.server.port)
	serverAddress := serverIp + serverPort
	router := routes.Router()

	srv := &http.Server{
		Addr:    serverPort,
		Handler: router,
	}

	log.Printf("Serving on - %v\n", serverAddress)

	log.Fatal(srv.ListenAndServe())
}
