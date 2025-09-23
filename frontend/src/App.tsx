import "./App.css";
import { useState } from "react";
import type { ApiResponse, CheckStatus } from "./types";
import axios from "axios";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ChequeForm from "./components/ChequeForm";
import InlineAlert from "./components/InlineAlert";
import VerificationResult from "./components/VerificationResult";

function App() {
  const [status, setStatus] = useState<ApiResponse<CheckStatus> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      setStatus(null);
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
      const response = await axios.post<ApiResponse<CheckStatus>>(
        `${apiUrl}/api/cheque/verify`,
        {
          chequeNumber,
          paymentIssueDate,
          appliedAmount,
        }
      );
      setStatus(response.data);
    } catch (err) {
      console.error("Error verifying cheque:", err);
      if (axios.isAxiosError(err) && err.response) {
        const errorData = err.response.data;
        if (errorData.details && Array.isArray(errorData.details)) {
          // Format multiple errors with bullet points for better readability
          const formattedErrors = errorData.details
            .map((detail: string) => `• ${detail}`)
            .join("\n");
          setError(`Verification failed:\n${formattedErrors}`);
        } else {
          setError(errorData.error || "Verification failed");
        }
        setStatus(err.response.data as ApiResponse<CheckStatus>);
      } else {
        setError("Failed to verify cheque. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bcgov-background-light-gray)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Header />
      <main
        style={{
          width: "100%",
          maxWidth: "672px",
          margin: "0 auto",
          padding: "16px",
          paddingBottom: "200px",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--bcgov-background-white)",
            borderRadius: "6px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
            border: "1px solid var(--bcgov-border-light)",
            marginBottom: "32px",
            marginTop: "24px",
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
                fontFamily: "BCSans, sans-serif",
                fontWeight: 600,
                margin: "0",
              }}
            >
              Verify Your Cheque Details
            </h2>
          </div>
          <div
            role="note"
            aria-label="Cheque verification data notice"
            style={{
              padding: "16px",
              backgroundColor: "#FCF4F4",
              borderBottom: "1px solid var(--bcgov-border-light)",
            }}
          >
            <p
              style={{
                margin: "0",
                color: "#D8292F",
                fontFamily: "BCSans, sans-serif",
                fontSize: "16px",
                lineHeight: 1.5,
              }}
            >
              <strong style={{ display: "block", marginBottom: "4px" }}>
                Important data notice
              </strong>
              Cheque Verification results update nightly at 3 a.m. PT. Cheques
              issued within the last 24 hours may not appear until the next
              business day.
            </p>
          </div>
          <ChequeForm onSubmit={handleChequeSubmit} loading={loading} />
          <InlineAlert description={error} />
          <VerificationResult status={status} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
