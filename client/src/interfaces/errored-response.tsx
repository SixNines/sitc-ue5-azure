export interface ErroredResponse {
    status: number;
    authorized: boolean;
    error: boolean;
    message: string;
}