export interface ApiError {
  message: string;
  status: number;
  stack?: string;
}

export interface ApiErrorResponse {
  error: ApiError;
}
