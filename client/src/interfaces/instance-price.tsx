export interface InstancePrice {
  region: string;
  price: number;
}

export interface FullInstancePrice {
  value: string;
  label: string;
  cost: string;
  numericCost: number;
}
