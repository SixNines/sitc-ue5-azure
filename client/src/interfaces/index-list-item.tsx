import { InstanceStateCode } from "./instance/instance-state-code";

export interface IndexListItem {
  StackName: string;
  StackStatus: string;
  DcvUrl: string;
  Cost: string;
  StateCode: InstanceStateCode;
}
