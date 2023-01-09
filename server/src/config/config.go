package config

import (
	"context"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
)

type CloudFormationConfig struct {
	Config aws.Config
}

var defaultConfig *CloudFormationConfig

func CreateConfig() {
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		log.Fatalf("unable to load SDK config, %v", err)
		os.Exit(1)
	}

	creds, err := cfg.Credentials.Retrieve(context.TODO())
	if err != nil {
		log.Fatalf("err. - %v", err)
		os.Exit(1)
	}

	if creds.AccessKeyID == "" {
		log.Fatalf("err. - no AWS AccessKeyID found.")
		os.Exit(1)
	}

	if creds.SecretAccessKey == "" {
		log.Fatalf("err. - no AWS SecretAccessKey found.")
		os.Exit(1)
	}

	defaultConfig = &CloudFormationConfig{
		Config: cfg,
	}
}

func GetConfig() aws.Config {
	return defaultConfig.Config
}
