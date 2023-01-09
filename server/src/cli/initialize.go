package cli

import (
	"fmt"
	"log"
	"os"

	"github.com/SixNines/sitc-sales-demo/database"
	"github.com/SixNines/sitc-sales-demo/models"
	"golang.org/x/crypto/bcrypt"
)

func Encrypt(key string) (string, error) {

	hashed, err := bcrypt.GenerateFromPassword([]byte(key), 16)
	if err != nil {
		return "", err
	}

	return string(hashed), nil
}

func Secure(deployKey string) {

	encryptedKey, err := Encrypt(deployKey)
	if err != nil {
		log.Fatalf("Err. - Cloud not generate key: %v\n", err)
	}

	writeErr := os.WriteFile(
		".env",
		[]byte(
			fmt.Sprintf(
				"CUMULUS_AUTH_API_KEY='%v'",
				encryptedKey,
			),
		),
		0644,
	)

	if err != nil {
		log.Fatalf("Err. - Could not save secret: %v\n", writeErr)
	}
}

func Initialize(args *CLIArgs) {

	Secure(args.init.deploymentKey)

	database.InitializeDatabase()
	database.DB.CreateDatabase()
	err := database.DB.AddTables(
		new(models.User),
		new(models.Stack),
		new(models.KeyPair),
	)

	if err != nil {
		log.Fatalf("err. - Could not create tables %v\n", err.Error())
		os.Exit(1)
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(args.init.adminPassword), 16)
	if err != nil {
		log.Fatalf("err. - Could not hash admin password %v\n", err.Error())
		os.Exit(1)
	}

	database.DB.Insert(&models.User{
		UserName: args.init.adminUserName,
		Password: string(hashed),
		Role:     "ADMIN",
	})

	database.DB.Close()
}
