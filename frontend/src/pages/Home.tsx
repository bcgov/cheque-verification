import { useState } from "react";
import type { ApiResponse, CheckStatus } from "../types";
import axios from "axios";
import ChequeForm from "../components/ChequeForm";
import InlineAlert from "../components/InlineAlert";
import VerificationResult from "../components/VerificationResult";
import DataNotice from "../components/DataNotice.tsx";

/**
 * Formats rate limiting error message with user-friendly wait time
 */
const formatRateLimitError = (retryAfter: number): string => {
  if (retryAfter > 0) {
    const waitMinutes = Math.ceil(retryAfter / 60);
    return `Too many requests. Please wait ${waitMinutes} ${
      waitMinutes === 1 ? "minute" : "minutes"
    } before trying again.`;
  }
  return "Too many requests. Please wait a few minutes before trying again.";
};

/**
 * Formats validation errors with bullet points
 */
const formatValidationErrors = (details: string[]): string => {
  const formattedErrors = details
    .map((detail: string) => `• ${detail}`)
    .join("\n");
  return `Verification failed:\n${formattedErrors}`;
};

/**
 * Handles axios error responses and returns appropriate error message
 */
const handleAxiosError = (
  err: unknown,
): { message: string; isRateLimited: boolean } => {
  if (!axios.isAxiosError(err) || !err.response) {
    return {
      message: "Failed to verify cheque. Please try again later.",
      isRateLimited: false,
    };
  }

  const errorData = err.response.data;

  if (err.response.status === 429) {
    const retryAfter =
      errorData?.retryAfter ||
      Number(err.response.headers?.["retry-after"]) ||
      0;
    return {
      message: formatRateLimitError(retryAfter),
      isRateLimited: true,
    };
  }

  if (errorData.details && Array.isArray(errorData.details)) {
    return {
      message: formatValidationErrors(errorData.details),
      isRateLimited: false,
    };
  }

  return {
    message: errorData.error || "Verification failed",
    isRateLimited: false,
  };
};

function Home() {
  const [status, setStatus] = useState<ApiResponse<CheckStatus> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRateLimited, setIsRateLimited] = useState(false);

  /**
   * Handles cheque verification form submission
   * @param {Object} payload
   * @param {string} payload.chequeNumber
   * @param {string} payload.paymentIssueDate
   * @param {string} payload.appliedAmount
   */
  const handleChequeSubmit = async ({
    chequeNumber,
    paymentIssueDate,
    appliedAmount,
  }: {
    chequeNumber: string;
    paymentIssueDate: string;
    appliedAmount: string;
  }) => {
    // Validate all required fields (redundant, but double-check)
    if (
      !chequeNumber.trim() ||
      !paymentIssueDate.trim() ||
      !appliedAmount.trim()
    ) {
      setError("All fields are required.");
      setStatus(null);
      return;
    }
    try {
      setLoading(true);
      setError("");
      setIsRateLimited(false);
      setStatus(null);
      // Use relative URL - Caddy handles routing to backend
      const response = await axios.post<ApiResponse<CheckStatus>>(
        "/api/cheque/verify",
        {
          chequeNumber,
          paymentIssueDate,
          appliedAmount,
        },
      );
      setStatus(response.data);
    } catch (err) {
      const result = handleAxiosError(err);
      setError(result.message);
      setIsRateLimited(result.isRateLimited);

      if (!result.isRateLimited && axios.isAxiosError(err) && err.response) {
        setStatus(err.response.data as ApiResponse<CheckStatus>);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        width: "100%",
        maxWidth: "672px",
        margin: "0 auto",
        padding: "16px",
        paddingBottom: "200px",
      }}
    >
      <DataNotice />
      <div
        style={{
          backgroundColor: "var(--bcgov-background-white)",
          borderRadius: "6px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          border: "1px solid var(--bcgov-border-light)",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--bcgov-blue)",
            padding: "16px",
            borderBottom: "4px solid var(--bcgov-gold)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              color: "var(--bcgov-text-white)",
              fontSize: "20px",
              fontWeight: 600,
              margin: "0",
            }}
          >
            Verify Your Cheque Details
          </h2>
        </div>
        <p
          style={{
            padding: "16px 16px 0 16px",
            margin: "0",
            fontSize: "14px",
            color: "var(--bcgov-text-dark)",
            lineHeight: "1.5",
          }}
        >
          Please call the cheque verification line if the portal returns the
          message “Error. Cheque not found.”
        </p>
        <ChequeForm onSubmit={handleChequeSubmit} loading={loading} />
        <InlineAlert
          variant={isRateLimited ? "warning" : undefined}
          title={isRateLimited ? "Rate Limit" : undefined}
          description={error}
        />
        <VerificationResult status={status} />
      </div>
    </main>
  );
}

export default Home;
