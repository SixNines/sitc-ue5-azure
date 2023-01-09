package deployment

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/SixNines/sitc-sales-demo/config"
	"github.com/SixNines/sitc-sales-demo/database"
	"github.com/SixNines/sitc-sales-demo/errors"
	"github.com/SixNines/sitc-sales-demo/models"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/cloudformation"
	cftypes "github.com/aws/aws-sdk-go-v2/service/cloudformation/types"
	"github.com/gin-gonic/gin"
)

type AWSConfig struct {
	KeyPairName     string   `json:"keyPairName" description:"Name of AWS KeyPair to use."`
	InstanceType    string   `json:"instanceType" description:"Type of EC2 instance to create." validate:"required"`
	OperatingSystem string   `json:"operatingSystem" description:"Operating system to use for EC2 instance." validate:"required"`
	Capabilities    []string `json:"capabilities" description:"Array of AWS capabilities for instance."`
	ResourceName    string   `json:"resourceName" description:"Name of AWS Cloudformation Stack." validate:"required"`
	TemplateURL     string   `json:"templateUrl" description:"URL to S3 bucket with Cloudformation template."`
	DiskSize        string   `json:"diskSize" description:"Disk size from EC2 VM." validate:"required"`
	Cidr            string   `json:"cidr" description:"Cidr for EC2 instance in VPC." validate:"required"`
	Password        string   `json:"password" description:"Admin password for EC2 instance." validate:"required"`
	AuthKey         string   `header:"X-Auth-Key" description:"Required security header." validate:"required"`
	AuthToken       string   `header:"X-Auth-Token" description:"Required JWT token header." validate:"required,jwt"`
}

type AWSDeploymentQuery struct {
	ResourceName string `path:"resourceName" description:"Name of AWS Cloudformation Stack." validate:"required"`
	AuthKey      string `header:"X-Auth-Key" description:"Required security header." validate:"required"`
	AuthToken    string `header:"X-Auth-Token" description:"Required JWT token header." validate:"required,jwt"`
}

type AWSDeploymentListQuery struct {
	ResourceStatus string `path:"resourceStatus" description:"Status of AWS Cloudformation Stack."`
	AuthKey        string `header:"X-Auth-Key" description:"Required security header." validate:"required"`
	AuthToken      string `header:"X-Auth-Token" description:"Required JWT token header." validate:"required,jwt"`
}

func DescribeDeployment(c *gin.Context, deployment *AWSDeploymentQuery) ([]cftypes.Stack, error) {
	c.Header("Content-Type", "application/json")

	_, err := database.DB.Exists(&models.Stack{
		ResourceName: deployment.ResourceName,
	})

	if err != nil {
		return nil, err
	}

	cloudConfig := config.GetConfig()
	svc := cloudformation.NewFromConfig(cloudConfig)

	describeStackReq := &cloudformation.DescribeStacksInput{
		StackName: &deployment.ResourceName,
	}

	stackDescription, err := svc.DescribeStacks(context.TODO(), describeStackReq)
	if err != nil {
		return nil, errors.AWSError(err)
	}

	return stackDescription.Stacks, nil

}

func ListDeployments(c *gin.Context, deployments *AWSDeploymentListQuery) ([]cftypes.StackSummary, error) {
	c.Header("Content-Type", "application/json")

	status := strings.ToUpper(deployments.ResourceStatus)

	var filter []cftypes.StackStatus
	if !(status == "" || status == "ALL") {
		filter = []cftypes.StackStatus{
			cftypes.StackStatus(
				*aws.String(status),
			),
		}
	}

	cloudConfig := config.GetConfig()
	svc := cloudformation.NewFromConfig(cloudConfig)

	listStacksReq := &cloudformation.ListStacksInput{StackStatusFilter: filter}
	stacks, err := svc.ListStacks(context.TODO(), listStacksReq)
	if err != nil {
		return nil, errors.AWSError(err)
	}

	cumulusStacks := []cftypes.StackSummary{}

	for _, stack := range stacks.StackSummaries {

		found, _ := database.DB.Exists(&models.Stack{
			ResourceName: *stack.StackName,
		})

		if found {
			cumulusStacks = append(cumulusStacks, stack)
		}
	}

	return cumulusStacks, nil

}

func CreateDeployment(c *gin.Context, awsConfig *AWSConfig) (*cloudformation.CreateStackOutput, error) {

	c.Header("Content-Type", "application/json")

	if awsConfig.KeyPairName == "" {
		awsConfig.KeyPairName = awsConfig.ResourceName
	}

	if awsConfig.TemplateURL == "" {
		awsConfig.TemplateURL = os.Getenv("AWS_TEMPLATE_URL")
	}
	fmt.Printf("instancetype: %s\n", awsConfig.InstanceType)
	selectedKeyPair := &models.KeyPair{KeyPairName: awsConfig.KeyPairName}
	_, err := database.DB.Select(selectedKeyPair)
	if err != nil {
		return nil, err
	}

	log.Printf("Creating deployment - %v\n", awsConfig.ResourceName)

	deploymentCapabilities := []cftypes.Capability{"CAPABILITY_IAM"}
	for _, capability := range awsConfig.Capabilities {
		deploymentCapabilities = append(deploymentCapabilities, cftypes.Capability(capability))
	}

	cloudConfig := config.GetConfig()
	svc := cloudformation.NewFromConfig(cloudConfig)

	stackInput := &cloudformation.CreateStackInput{
		Parameters: []cftypes.Parameter{
			{
				ParameterKey:   aws.String("KeyPairName"),
				ParameterValue: aws.String(awsConfig.KeyPairName),
			},
			{
				ParameterKey:   aws.String("InstanceType"),
				ParameterValue: aws.String(awsConfig.InstanceType),
			},
			{
				ParameterKey:   aws.String("OsVersion"),
				ParameterValue: aws.String(awsConfig.OperatingSystem),
			},
			{
				ParameterKey:   aws.String("DiskSize"),
				ParameterValue: aws.String(awsConfig.DiskSize),
			},
			{
				ParameterKey:   aws.String("Cidr"),
				ParameterValue: aws.String(awsConfig.Cidr),
			},
			{
				ParameterKey:   aws.String("UserPasswd"),
				ParameterValue: aws.String(awsConfig.Password),
			},
		},
		Capabilities: deploymentCapabilities,
		StackName:    aws.String(awsConfig.ResourceName),
		TemplateURL:  aws.String(awsConfig.TemplateURL),
	}

	createStackOutput, createStackErr := svc.CreateStack(context.TODO(), stackInput)
	if createStackErr != nil {
		return nil, errors.AWSError(createStackErr)
	}

	_, err = database.DB.Insert(&models.Stack{
		ResourceName: awsConfig.ResourceName,
		StackID:      *createStackOutput.StackId,
	})
	if err != nil {
		return nil, err
	}

	updatedKeyPair := &models.KeyPair{
		KeyPairName:   awsConfig.KeyPairName,
		KeyPairStack:  awsConfig.ResourceName,
		KeyPairStatus: "ACTIVE",
	}
	_, err = database.DB.Update(updatedKeyPair, selectedKeyPair.Id)
	if err != nil {
		return nil, err
	}

	log.Printf("Successfully initialized creation of deployment - %v\n", awsConfig.ResourceName)

	return createStackOutput, nil

}

func DestroyDeployment(c *gin.Context, deployment *AWSDeploymentQuery) (*cloudformation.DeleteStackOutput, error) {

	c.Header("Content-Type", "application/json")

	log.Printf("Deleting deployment - %v\n", deployment.ResourceName)

	cloudConfig := config.GetConfig()
	svc := cloudformation.NewFromConfig(cloudConfig)

	dreq := &cloudformation.DeleteStackInput{
		StackName: aws.String(deployment.ResourceName),
	}
	deleteStackOutput, deleteStackErr := svc.DeleteStack(context.TODO(), dreq)
	if deleteStackErr != nil {
		return nil, errors.AWSError(deleteStackErr)
	}

	_, err := database.DB.Delete(&models.Stack{
		ResourceName: deployment.ResourceName,
	})

	if err != nil {
		return nil, err
	}

	log.Printf("Deleted deployment - %v\n", deployment.ResourceName)

	return deleteStackOutput, nil

}

func GetState(c *gin.Context, deployment *AWSDeploymentQuery) (*cloudformation.DescribeStackEventsOutput, error) {

	c.Header("Content-Type", "application/json")

	_, err := database.DB.Exists(&models.Stack{
		ResourceName: deployment.ResourceName,
	})

	if err != nil {
		return nil, err
	}

	cloudConfig := config.GetConfig()
	svc := cloudformation.NewFromConfig(cloudConfig)

	stackInput := &cloudformation.DescribeStackEventsInput{
		StackName: &deployment.ResourceName,
	}

	events, describeStackEventsErr := svc.DescribeStackEvents(context.TODO(), stackInput)
	if describeStackEventsErr != nil {
		return nil, errors.AWSError(describeStackEventsErr)
	}

	return events, nil
}
