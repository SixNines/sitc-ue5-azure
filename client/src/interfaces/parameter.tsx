import { DiskSize } from "./disk-size";
import { InstanceType } from "./instance-type";

export interface Parameter {
    instanceType: InstanceType,
    diskSize: DiskSize
}