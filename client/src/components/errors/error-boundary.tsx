
import { Component, ErrorInfo } from "react";
import { ErrorPageProps, ErrorPageState } from "interfaces";
import { ErrorPage } from "./error-page";


export class ErrorBoundary extends Component<ErrorPageProps, ErrorPageState> {
    public state: ErrorPageState = {
        hasError: false,
        errorMessage: ""
    };

    public static getDerivedStateFromError(error: Error): ErrorPageState {
        return { 
            hasError: true, 
            errorMessage: error.message 
        };
    }

    public componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
        console.log(_error.message)
    }

    public render() {
        if (this.state.hasError) {
            return <ErrorPage error={this.state.errorMessage} />;
        }

        return this.props.children;
    }
}