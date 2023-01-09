import { InstanceStateCode } from "./instance-state-code";

export interface InstanceDetails {
  StateCode: InstanceStateCode;
  PublicIpAddress: string;
  VolumeId: string;
  InstanceType: string;
}
