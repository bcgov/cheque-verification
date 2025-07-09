export interface CheckStatus {
  chequeNumber: string;
  chequeStatus: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
