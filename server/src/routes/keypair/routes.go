package keypair

import (
	"context"
	"fmt"

	"github.com/SixNines/sitc-sales-demo/config"
	"github.com/SixNines/sitc-sales-demo/database"
	"github.com/SixNines/sitc-sales-demo/errors"
	"github.com/SixNines/sitc-sales-demo/models"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/ec2"
	types "github.com/aws/aws-sdk-go-v2/service/ec2/types"
	"github.com/gin-gonic/gin"
)

type AWSKeyPair struct {
	KeyPairName string `path:"keyPairName" description:"Name of AWS EC2 KeyPair to create." validate:"required"`
	AuthKey     string `header:"X-Auth-Key" description:"Required security header." validate:"required"`
	AuthToken   string `header:"X-Auth-Token" description:"Required JWT token header." validate:"required,jwt"`
}

type AWSNewKeyPair struct {
	KeyPairName string `json:"keyPairName" description:"Name of AWS EC2 KeyPair to create." validate:"required"`
	AuthKey     string `header:"X-Auth-Key" description:"Required security header." validate:"required"`
	AuthToken   string `header:"X-Auth-Token" description:"Required JWT token header." validate:"required,jwt"`
}

type AWSKeyPairFilter struct {
	Name      string   `json:"name" validate:"required"`
	Values    []string `json:"values" validate:"required"`
	AuthToken string   `header:"X-Auth-Token" description:"Required JWT token header." validate:"required,jwt"`
}

type AWSKeyPairQuery struct {
	Filters    []AWSKeyPairFilter `json:"filters"`
	KeyNames   []string           `json:"keyNames"`
	KeyPairIds []string           `json:"keyPairIds"`
	AuthKey    string             `header:"X-Auth-Key" description:"Required security header." validate:"required"`
	AuthToken  string             `header:"X-Auth-Token" description:"Required JWT token header." validate:"required,jwt"`
}

func ListKeyPairs(c *gin.Context, keypair *AWSKeyPairQuery) ([]types.KeyPairInfo, error) {

	cloudConfig := config.GetConfig()
	svc := ec2.NewFromConfig(cloudConfig)

	var awsFilters []types.Filter

	for _, filter := range keypair.Filters {
		awsFilters = append(awsFilters, types.Filter{
			Name:   aws.String(filter.Name),
			Values: filter.Values,
		})
	}

	describeKeyPair := &ec2.DescribeKeyPairsInput{
		Filters:    awsFilters,
		KeyNames:   keypair.KeyNames,
		KeyPairIds: keypair.KeyPairIds,
	}

	result, err := svc.DescribeKeyPairs(context.TODO(), describeKeyPair)
	if err != nil {
		return nil, errors.InternalError(err.Error())
	}

	keyPairs := []types.KeyPairInfo{}

	for _, keypair := range result.KeyPairs {
		found, _ := database.DB.Exists(&models.KeyPair{
			KeyPairName: *keypair.KeyName,
		})

		if found {
			keyPairs = append(keyPairs, keypair)
		}
	}

	return keyPairs, err
}

func CreateKeyPair(c *gin.Context, keypair *AWSNewKeyPair) (*ec2.CreateKeyPairOutput, error) {

	cloudConfig := config.GetConfig()
	svc := ec2.NewFromConfig(cloudConfig)

	createKeyPair := &ec2.CreateKeyPairInput{
		KeyName: aws.String(keypair.KeyPairName),
	}

	selectedKeyPair := &models.KeyPair{KeyPairName: keypair.KeyPairName}

	keypairExistsInDatabase, _ := database.DB.Select(selectedKeyPair)

	// if err != nil {
	// 	err.Error()
	// 	return nil, errors.InternalError(err.Error())
	// }

	if keypairExistsInDatabase {

		result := &ec2.CreateKeyPairOutput{
			KeyName: &keypair.KeyPairName,
		}

		return result, nil
	}

	result, err := svc.CreateKeyPair(context.TODO(), createKeyPair)

	if err != nil {
		fmt.Println(err.Error())
		return nil, errors.InternalError(err.Error())
	}

	newKeyPair := &models.KeyPair{
		KeyPairName:   *result.KeyName,
		KeyPairStack:  "",
		KeyPairStatus: "CREATED",
	}

	_, err = database.DB.Insert(newKeyPair)
	if err != nil {
		return nil, err
	}

	return result, err
}

func DeleteKeyPair(c *gin.Context, keypair *AWSKeyPair) (*ec2.DeleteKeyPairOutput, error) {

	deletedKeyPair := &models.KeyPair{KeyPairName: keypair.KeyPairName}
	_, err := database.DB.Delete(deletedKeyPair)
	if err != nil {
		return nil, err
	}

	cloudConfig := config.GetConfig()
	svc := ec2.NewFromConfig(cloudConfig)

	deleteKeyPair := &ec2.DeleteKeyPairInput{
		KeyName: aws.String(keypair.KeyPairName),
	}

	result, err := svc.DeleteKeyPair(context.TODO(), deleteKeyPair)
	if err != nil {
		return nil, errors.InternalError(err.Error())
	}

	return result, err
}
