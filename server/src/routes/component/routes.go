package component

import (
	"context"

	"github.com/SixNines/sitc-sales-demo/config"
	"github.com/SixNines/sitc-sales-demo/database"
	"github.com/SixNines/sitc-sales-demo/errors"
	"github.com/SixNines/sitc-sales-demo/models"
	"github.com/SixNines/sitc-sales-demo/routes/deployment"
	"github.com/aws/aws-sdk-go-v2/service/cloudformation"
	cftypes "github.com/aws/aws-sdk-go-v2/service/cloudformation/types"
	"github.com/gin-gonic/gin"
)

type AWSDeploymentComponentQuery struct {
	ResourceName string `path:"resourceName" description:"Name of AWS Cloudformation Stack." validate:"required"`
	ComponentId  string `path:"componentId" description:"Name of resource created" validate:"required"`
	AuthKey      string `header:"X-Auth-Key" description:"Required security header." validate:"required"`
	AuthToken    string `header:"X-Auth-Token" description:"Required JWT token header." validate:"required,jwt"`
}

func DescribeDeploymentComponent(c *gin.Context, deploymentComponent *AWSDeploymentComponentQuery) (*cftypes.StackResourceDetail, error) {
	c.Header("Content-Type", "application/json")

	_, err := database.DB.Exists(&models.Stack{
		ResourceName: deploymentComponent.ResourceName,
	})

	if err != nil {
		return nil, err
	}

	cloudConfig := config.GetConfig()
	svc := cloudformation.NewFromConfig(cloudConfig)

	describeStackResourceReq := &cloudformation.DescribeStackResourceInput{
		StackName:         &deploymentComponent.ResourceName,
		LogicalResourceId: &deploymentComponent.ComponentId,
	}

	resourceDescription, err := svc.DescribeStackResource(context.TODO(), describeStackResourceReq)
	if err != nil {
		return nil, errors.AWSError(err)
	}

	return resourceDescription.StackResourceDetail, nil
}

func ListDeploymentComponents(c *gin.Context, deployment *deployment.AWSDeploymentQuery) ([]cftypes.StackResource, error) {
	c.Header("Content-Type", "application/json")

	if deployment.ResourceName == "" {
		return nil, errors.BadRequest("err. - `resourceName` is a required parameter")
	}

	_, err := database.DB.Exists(&models.Stack{
		ResourceName: deployment.ResourceName,
	})

	if err != nil {
		return nil, err
	}

	cloudConfig := config.GetConfig()
	svc := cloudformation.NewFromConfig(cloudConfig)

	describeStackResourcesReq := &cloudformation.DescribeStackResourcesInput{
		StackName: &deployment.ResourceName,
	}

	resourcesDescription, err := svc.DescribeStackResources(context.TODO(), describeStackResourcesReq)
	if err != nil {
		return nil, errors.AWSError(err)
	}

	return resourcesDescription.StackResources, nil
}
