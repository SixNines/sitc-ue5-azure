export interface Attachment {
  AttachTime: Date;
  DeleteOnTermination: boolean;
  Device: string;
  InstanceId: string;
  State: string;
  VolumeId: string;
}

export interface VolumeDescriptionResponse {
  Attachments: Attachment[];
  AvailabilityZone: string;
  CreateTime: Date;
  Encrypted: boolean;
  FastRestored?: any;
  Iops: number;
  KmsKeyId?: any;
  MultiAttachEnabled: boolean;
  OutpostArn?: any;
  Size: number;
  SnapshotId: string;
  State: string;
  Tags?: any;
  Throughput?: any;
  VolumeId: string;
  VolumeType: string;
}
