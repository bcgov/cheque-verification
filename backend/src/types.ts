// Types for the API responses - matches API types
export interface ChequeStatusResponse {
  chequeStatus: string;
  chequeNumber: number;
  paymentIssueDate: Date;
  appliedAmount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
