export interface DriftInformation {
  LastCheckTimestamp: Date;
  StackDriftStatus: string;
}

export interface Output {
  Description: string;
  ExportName: string;
  OutputKey: string;
  OutputValue: string;
}

export interface Parameter {
  ParameterKey: string;
  ParameterValue: string;
  ResolvedValue: string;
  UsePreviousValue: boolean;
}

export interface RollbackTrigger {
  Arn: string;
  Type: string;
}

export interface RollbackConfiguration {
  MonitoringTimeInMinutes: number;
  RollbackTriggers: RollbackTrigger[];
}

export interface Tag {
  Key: string;
  Value: string;
}

export interface StackDescriptionResponse {
  Capabilities: string[];
  ChangeSetId: string;
  CreationTime: Date;
  DeletionTime: Date;
  Description: string;
  DisableRollback: boolean;
  DriftInformation: DriftInformation;
  EnableTerminationProtection: boolean;
  LastUpdatedTime: Date;
  NotificationARNs: string[];
  Outputs: Output[];
  Parameters: Parameter[];
  ParentId: string;
  RoleARN: string;
  RollbackConfiguration: RollbackConfiguration;
  RootId: string;
  StackId: string;
  StackName: string;
  StackStatus: string;
  StackStatusReason: string;
  Tags: Tag[];
  TimeoutInMinutes: number;
}
