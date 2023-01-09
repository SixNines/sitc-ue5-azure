import { FullInstancePrice, InstancePrice } from "interfaces/instance-price";
import getConfig from "next/config";

const { publicRuntimeConfig } = getConfig();

export const diskCostRate = 0.08;

export function getHourlyDiskCost(sizeInGB: number): number {
  const hoursInMonth = 730;
  return (sizeInGB * diskCostRate) / hoursInMonth;
}

export function getTotalCost(instanceTypeName: string, diskSizeInGb: number) {
  const diskCost = getHourlyDiskCost(diskSizeInGb);
  const instanceCost = instanceTypes.find(
    (instanceType) => instanceType.value === instanceTypeName
  )?.numericCost as number;

  return (diskCost + instanceCost).toFixed(2);
}

export function getDeploymentRegion(): string {
  return publicRuntimeConfig.AWS_DEFAULT_REGION as string;
}

// Prices from https://aws.amazon.com/ec2/pricing/on-demand/ as of 2022-08-15

const sizeMap = [
  {
    size: "g4dn.xlarge",
    label: "Standard with GPU",
    index: 0,
  },
  {
    size: "g4dn.2xlarge",
    label: "Performance with GPU",
    index: 1,
  },
  {
    size: "g4dn.4xlarge",
    label: "Elite with GPU",
    index: 2,
  },
];
const regionAndPrices: InstancePrice[] = [
  {
    region: "us-east-1",
    price: 0.71,
  },
  {
    region: "us-east-1",
    price: 1.12,
  },
  {
    region: "us-east-1",
    price: 1.94,
  },
  {
    region: "us-east-2",
    price: 0.71,
  },
  {
    region: "us-east-2",
    price: 1.12,
  },
  {
    region: "us-east-2",
    price: 1.94,
  },
  {
    region: "us-west-1",
    price: 0.82,
  },
  {
    region: "us-west-1",
    price: 1.27,
  },
  {
    region: "us-west-1",
    price: 2.02,
  },
  {
    region: "us-west-2",
    price: 0.71,
  },
  {
    region: "us-west-2",
    price: 1.12,
  },
  {
    region: "us-west-2",
    price: 1.94,
  },
  {
    region: "eu-central-1",
    price: 0.84,
  },
  {
    region: "eu-central-1",
    price: 1.31,
  },
  {
    region: "eu-central-1",
    price: 2.24,
  },
  {
    region: "eu-west-1",
    price: 0.77,
  },
  {
    region: "eu-west-1",
    price: 1.21,
  },
  {
    region: "eu-west-1",
    price: 2.08,
  },
  {
    region: "eu-west-2",
    price: 0.8,
  },
  {
    region: "eu-west-2",
    price: 1.25,
  },
  {
    region: "eu-west-2",
    price: 2.15,
  },
  {
    region: "eu-west-3",
    price: 0.8,
  },
  {
    region: "eu-west-3",
    price: 1.25,
  },
  {
    region: "eu-west-3",
    price: 2.15,
  },
  {
    region: "eu-north-1",
    price: 0.74,
  },
  {
    region: "eu-north-1",
    price: 1.17,
  },
  {
    region: "eu-north-1",
    price: 2.01,
  },
];

function getInstancePricingData() {
  const region = getDeploymentRegion();

  const instancePrices = regionAndPrices.filter((r) => r.region === region);
  let fullInstancePrices: FullInstancePrice[] = [];

  for (let i = 0; i < instancePrices.length; i++) {
    const instancePrice = instancePrices[i];
    fullInstancePrices.push({
      value: sizeMap[i].size,
      label: sizeMap[i].label,
      cost: `$${instancePrice.price.toFixed(2)} USD`,
      numericCost: instancePrice.price,
    } as FullInstancePrice);
  }

  return fullInstancePrices;
}

export const instanceTypes = getInstancePricingData();

export const stackStatuses = [
  {
    status: "CREATE_COMPLETE",
    mapping: "Create Successful",
  },
  {
    status: "CREATE_IN_PROGRESS",
    mapping: "Creating",
  },
  {
    status: "CREATE_FAILED",
    mapping: "Failed to Create",
  },
  {
    status: "DELETE_COMPLETE",
    mapping: "Delete Successful",
  },

  {
    status: "DELETE_IN_PROGRESS",
    mapping: "Deleting",
  },
  {
    status: "DELETE_FAILED",
    mapping: "Create Successful",
  },
  {
    status: "ROLLBACK_COMPLETE",
    mapping: "Rollback Successful",
  },
  {
    status: "ROLLBACK_IN_PROGRESS",
    mapping: "Rollingback",
  },
  {
    status: "ROLLBACK_FAILED",
    mapping: "Failed to Rollback",
  },
];
