// Response type without sensitive data
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
