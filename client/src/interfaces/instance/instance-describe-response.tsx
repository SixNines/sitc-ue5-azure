export interface Group {
  GroupId: string;
  GroupName: string;
}

export interface Ebs {
  AttachTime: Date;
  DeleteOnTermination: boolean;
  Status: string;
  VolumeId: string;
}

export interface BlockDeviceMapping {
  DeviceName: string;
  Ebs: Ebs;
}

export interface CapacityReservationTarget {
  CapacityReservationId: string;
  CapacityReservationResourceGroupArn: string;
}

export interface CapacityReservationSpecification {
  CapacityReservationPreference: string;
  CapacityReservationTarget: CapacityReservationTarget;
}

export interface CpuOptions {
  CoreCount: number;
  ThreadsPerCore: number;
}

export interface ElasticGpuAssociation {
  ElasticGpuAssociationId: string;
  ElasticGpuAssociationState: string;
  ElasticGpuAssociationTime: string;
  ElasticGpuId: string;
}

export interface ElasticInferenceAcceleratorAssociation {
  ElasticInferenceAcceleratorArn: string;
  ElasticInferenceAcceleratorAssociationId: string;
  ElasticInferenceAcceleratorAssociationState: string;
  ElasticInferenceAcceleratorAssociationTime: Date;
}

export interface EnclaveOptions {
  Enabled: boolean;
}

export interface HibernationOptions {
  Configured: boolean;
}

export interface IamInstanceProfile {
  Arn: string;
  Id: string;
}

export interface License {
  LicenseConfigurationArn: string;
}

export interface MaintenanceOptions {
  AutoRecovery: string;
}

export interface MetadataOptions {
  HttpEndpoint: string;
  HttpProtocolIpv6: string;
  HttpPutResponseHopLimit: number;
  HttpTokens: string;
  InstanceMetadataTags: string;
  State: string;
}

export interface Monitoring {
  State: string;
}

export interface Association {
  CarrierIp: string;
  CustomerOwnedIp: string;
  IpOwnerId: string;
  PublicDnsName: string;
  PublicIp: string;
}

export interface Attachment {
  AttachTime: Date;
  AttachmentId: string;
  DeleteOnTermination: boolean;
  DeviceIndex: number;
  NetworkCardIndex: number;
  Status: string;
}

export interface Group2 {
  GroupId: string;
  GroupName: string;
}

export interface Ipv4Prefixes {
  Ipv4Prefix: string;
}

export interface Ipv6Addresses {
  Ipv6Address: string;
}

export interface Ipv6Prefixes {
  Ipv6Prefix: string;
}

export interface Association2 {
  CarrierIp: string;
  CustomerOwnedIp: string;
  IpOwnerId: string;
  PublicDnsName: string;
  PublicIp: string;
}

export interface PrivateIpAddress {
  Association: Association2;
  Primary: boolean;
  PrivateDnsName: string;
  PrivateIpAddress: string;
}

export interface NetworkInterface {
  Association: Association;
  Attachment: Attachment;
  Description: string;
  Groups: Group2[];
  InterfaceType: string;
  Ipv4Prefixes: Ipv4Prefixes[];
  Ipv6Addresses: Ipv6Addresses[];
  Ipv6Prefixes: Ipv6Prefixes[];
  MacAddress: string;
  NetworkInterfaceId: string;
  OwnerId: string;
  PrivateDnsName: string;
  PrivateIpAddress: string;
  PrivateIpAddresses: PrivateIpAddress[];
  SourceDestCheck: boolean;
  Status: string;
  SubnetId: string;
  VpcId: string;
}

export interface Placement {
  Affinity: string;
  AvailabilityZone: string;
  GroupName: string;
  HostId: string;
  HostResourceGroupArn: string;
  PartitionNumber: number;
  SpreadDomain: string;
  Tenancy: string;
}

export interface PrivateDnsNameOptions {
  EnableResourceNameDnsAAAARecord: boolean;
  EnableResourceNameDnsARecord: boolean;
  HostnameType: string;
}

export interface ProductCode {
  ProductCodeId: string;
  ProductCodeType: string;
}

export interface SecurityGroup {
  GroupId: string;
  GroupName: string;
}

export interface State {
  Code: number;
  Name: string;
}

export interface StateReason {
  Code: string;
  Message: string;
}

export interface Tag {
  Key: string;
  Value: string;
}

export interface Instance {
  AmiLaunchIndex: number;
  Architecture: string;
  BlockDeviceMappings: BlockDeviceMapping[];
  BootMode: string;
  CapacityReservationId: string;
  CapacityReservationSpecification: CapacityReservationSpecification;
  ClientToken: string;
  CpuOptions: CpuOptions;
  EbsOptimized: boolean;
  ElasticGpuAssociations: ElasticGpuAssociation[];
  ElasticInferenceAcceleratorAssociations: ElasticInferenceAcceleratorAssociation[];
  EnaSupport: boolean;
  EnclaveOptions: EnclaveOptions;
  HibernationOptions: HibernationOptions;
  Hypervisor: string;
  IamInstanceProfile: IamInstanceProfile;
  ImageId: string;
  InstanceId: string;
  InstanceLifecycle: string;
  InstanceType: string;
  Ipv6Address: string;
  KernelId: string;
  KeyName: string;
  LaunchTime: Date;
  Licenses: License[];
  MaintenanceOptions: MaintenanceOptions;
  MetadataOptions: MetadataOptions;
  Monitoring: Monitoring;
  NetworkInterfaces: NetworkInterface[];
  OutpostArn: string;
  Placement: Placement;
  Platform: string;
  PlatformDetails: string;
  PrivateDnsName: string;
  PrivateDnsNameOptions: PrivateDnsNameOptions;
  PrivateIpAddress: string;
  ProductCodes: ProductCode[];
  PublicDnsName: string;
  PublicIpAddress: string;
  RamdiskId: string;
  RootDeviceName: string;
  RootDeviceType: string;
  SecurityGroups: SecurityGroup[];
  SourceDestCheck: boolean;
  SpotInstanceRequestId: string;
  SriovNetSupport: string;
  State: State;
  StateReason: StateReason;
  StateTransitionReason: string;
  SubnetId: string;
  Tags: Tag[];
  TpmSupport: string;
  UsageOperation: string;
  UsageOperationUpdateTime: Date;
  VirtualizationType: string;
  VpcId: string;
}

export interface InstanceDescribeResponse {
  Groups: Group[];
  Instances: Instance[];
  OwnerId: string;
  RequesterId: string;
  ReservationId: string;
}
