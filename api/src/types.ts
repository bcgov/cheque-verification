// Response type without sensitive data
export interface ChequeStatusResponse {
  chequeStatus: string;
  chequeNumber: string; // Changed from number to string to avoid precision loss
  paymentIssueDate: Date;
  appliedAmount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
