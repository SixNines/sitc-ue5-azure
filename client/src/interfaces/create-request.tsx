export interface CreateRequest {
  resourceName: string;
  operatingSystem: string;
  password: string;
  instanceType: string;
  diskSize: string;
  cidr: string;
}
