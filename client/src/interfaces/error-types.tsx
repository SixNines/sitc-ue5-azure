import { ReactNode } from 'react'


export interface ErrorPageProps {
    children?: ReactNode;
  }
  
export interface ErrorPageState {
    hasError: boolean;
    errorMessage: string;
}
  