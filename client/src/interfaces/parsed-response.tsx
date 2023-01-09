import { ResponseStatuses } from "./response-statuses"

export interface ParsedResponse<T> {
    status: number,
    state: ResponseStatuses,
    data: T | null,
    context: string | {[key: string]: string},
    authorized: boolean,
    error: boolean
  }