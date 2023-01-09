package instance

import (
	"context"
	"fmt"

	"github.com/SixNines/sitc-sales-demo/config"
	"github.com/SixNines/sitc-sales-demo/errors"
	"github.com/aws/aws-sdk-go-v2/service/ec2"
	ec2types "github.com/aws/aws-sdk-go-v2/service/ec2/types"
	"github.com/gin-gonic/gin"
)

type InstanceQuery struct {
	InstanceId string `path:"instanceId" description:"Id of the EC2 instance to manage." validate:"required"`
	AuthKey    string `header:"X-Auth-Key" description:"Required security header." validate:"required"`
	AuthToken  string `header:"X-Auth-Token" description:"Required JWT token header." validate:"required,jwt"`
}

type InstanceVolumeQuery struct {
	VolumeId  string `path:"volumeId" description:"Id of the EC2 instance's volume'." validate:"required"`
	AuthKey   string `header:"X-Auth-Key" description:"Required security header." validate:"required"`
	AuthToken string `header:"X-Auth-Token" description:"Required JWT token header." validate:"required,jwt"`
}

func DescibeInstance(c *gin.Context, instanceAction *InstanceQuery) ([]ec2types.Reservation, error) {
	cloudConfig := config.GetConfig()
	svc := ec2.NewFromConfig(cloudConfig)

	describeInstance := &ec2.DescribeInstancesInput{
		InstanceIds: []string{
			instanceAction.InstanceId,
		},
	}

	instance, err := svc.DescribeInstances(context.TODO(), describeInstance)
	if err != nil {
		return nil, errors.AWSError(err)
	}

	return instance.Reservations, nil
}

func DescribeInstanceVolume(c *gin.Context, instanceAction *InstanceVolumeQuery) ([]ec2types.Volume, error) {
	cloudConfig := config.GetConfig()
	svc := ec2.NewFromConfig(cloudConfig)

	describeVolume := &ec2.DescribeVolumesInput{
		VolumeIds: []string{
			instanceAction.VolumeId,
		},
	}

	volume, err := svc.DescribeVolumes(context.TODO(), describeVolume)

	if err != nil {
		fmt.Println("volumes error:")
		return nil, errors.AWSError(err)
	}

	return volume.Volumes, nil
}

func StartInstance(c *gin.Context, instanceAction *InstanceQuery) ([]ec2types.InstanceStateChange, error) {

	cloudConfig := config.GetConfig()
	svc := ec2.NewFromConfig(cloudConfig)

	startInstanceAction := &ec2.StartInstancesInput{
		InstanceIds: []string{
			instanceAction.InstanceId,
		},
	}

	startActionResult, err := svc.StartInstances(context.TODO(), startInstanceAction)
	if err != nil {
		return nil, errors.AWSError(err)
	}

	return startActionResult.StartingInstances, nil
}

func StopInstance(c *gin.Context, instanceAction *InstanceQuery) ([]ec2types.InstanceStateChange, error) {

	cloudConfig := config.GetConfig()
	svc := ec2.NewFromConfig(cloudConfig)

	stopInstanceAction := &ec2.StopInstancesInput{
		InstanceIds: []string{
			instanceAction.InstanceId,
		},
	}

	stopActionResult, err := svc.StopInstances(context.TODO(), stopInstanceAction)
	if err != nil {
		return nil, errors.AWSError(err)
	}

	return stopActionResult.StoppingInstances, nil
}
