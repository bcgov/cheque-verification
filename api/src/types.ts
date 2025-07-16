// Response type without sensitive data
export interface ChequeStatusResponse {
  chequeStatus: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
