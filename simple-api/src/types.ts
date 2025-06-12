export interface CheckStatus {
  checkNumber: string;
  status: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
