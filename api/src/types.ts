export interface ChequeStatus {
  chequeNumber: string;
  chequeStatus: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
