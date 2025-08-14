import type { ApiResponse, CheckStatus } from "../types";
import InlineAlert from "./InlineAlert";

/**
 * Determines the appropriate alert variant based on cheque status
 * @param chequeStatus - The status string from the API ("ok to cash" or "not ok to cash")
 * @returns The appropriate variant for the InlineAlert
 */
const getStatusVariant = (
  chequeStatus: string | undefined
): "success" | "danger" => {
  // "ok to cash" should be green (success), "not ok to cash" should be red (danger)
  return chequeStatus?.toLowerCase() === "ok to cash" ? "success" : "danger";
};

/**
 * Verification result display component
 * @param {Object} props
 * @param {ApiResponse<CheckStatus> | null} props.status - Verification status response
 */
const VerificationResult = ({
  status,
}: {
  status: ApiResponse<CheckStatus> | null;
}) => {
  // Only render if we have a successful response with data
  if (!status || !status.success || !status.data) return null;

  return (
    <div
      style={{
        padding: "16px 24px",
        borderTop: "1px solid var(--bcgov-border-light)",
        backgroundColor: "var(--bcgov-background-light-gray)",
      }}
    >
      <h2
        style={{
          fontSize: "20px",
          fontFamily: "BCSans, sans-serif",
          fontWeight: "600",
          color: "var(--bcgov-text-primary)",
          marginBottom: "12px",
          display: "flex",
          alignItems: "center",
          margin: "0 0 12px 0",
        }}
      >
        Verification Result
      </h2>
      <InlineAlert
        variant={getStatusVariant(status.data.chequeStatus)}
        title={`Cheque #${status.data.chequeNumber}`}
        description={`Status: ${status.data.chequeStatus}`}
      />
    </div>
  );
};

export default VerificationResult;
