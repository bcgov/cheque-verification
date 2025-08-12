import { useState } from "react";
import axios from "axios";
import "./App.css";
import type { ApiResponse, CheckStatus } from "./types";

function App() {
  const [chequeNumber, setChequeNumber] = useState("");
  const [payeeName, setPayeeName] = useState("");
  const [paymentIssueDate, setPaymentIssueDate] = useState("");
  const [appliedAmount, setAppliedAmount] = useState("");
  const [status, setStatus] = useState<ApiResponse<CheckStatus> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all required fields
    if (!chequeNumber.trim()) {
      setError("Please enter a cheque number");
      setStatus(null);
      return;
    }

    if (!payeeName.trim()) {
      setError("Please enter a payee name");
      setStatus(null);
      return;
    }

    if (!paymentIssueDate.trim()) {
      setError("Please enter a payment issue date");
      setStatus(null);
      return;
    }

    if (!appliedAmount.trim()) {
      setError("Please enter an applied amount");
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
          payeeName,
          paymentIssueDate,
          appliedAmount,
        }
      );

      setStatus(response.data);
    } catch (err) {
      console.error("Error verifying cheque:", err);

      if (axios.isAxiosError(err) && err.response) {
        const errorData = err.response.data;
        if (errorData.details) {
          setError(`Verification failed: ${errorData.details.join(", ")}`);
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
      {/* BC Gov header bar */}
      <header
        style={{
          width: "100%",
          backgroundColor: "var(--bcgov-blue)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              height: "40px",
              width: "8px",
              backgroundColor: "var(--bcgov-gold)",
              marginRight: "16px",
            }}
          ></div>
          <h1
            style={{
              color: "var(--bcgov-text-white)",
              fontSize: "24px",
              fontFamily: "BCSans, sans-serif",
              fontWeight: "bold",
              margin: "0",
            }}
          >
            Cheque Verification Service
          </h1>
        </div>
        <div
          style={{
            height: "40px",
            width: "112px",
            backgroundColor: "var(--bcgov-gold)",
          }}
        ></div>
      </header>

      {/* Main content */}
      <main
        style={{
          width: "100%",
          maxWidth: "672px",
          margin: "0 auto",
          padding: "24px",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--bcgov-background-white)",
            borderRadius: "6px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
            border: `1px solid var(--bcgov-border-light)`,
            marginBottom: "32px",
            marginTop: "40px",
          }}
        >
          <div
            style={{
              backgroundColor: "var(--bcgov-blue)",
              padding: "16px",
              borderBottom: `4px solid var(--bcgov-gold)`,
              display: "flex",
              alignItems: "center",
            }}
          >
            <svg
              style={{
                width: "24px",
                height: "24px",
                color: "var(--bcgov-text-white)",
                marginRight: "12px",
              }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2
              style={{
                color: "var(--bcgov-text-white)",
                fontSize: "20px",
                fontFamily: "BCSans, sans-serif",
                fontWeight: "600",
                margin: "0",
              }}
            >
              Verify Your Cheque Details
            </h2>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
            <div style={{ marginBottom: "24px" }}>
              <label
                htmlFor="chequeNumber"
                style={{
                  display: "block",
                  color: "var(--bcgov-text-primary)",
                  fontFamily: "BCSans, sans-serif",
                  fontWeight: "500",
                  marginBottom: "8px",
                }}
              >
                Cheque Number:
              </label>
              <input
                type="text"
                id="chequeNumber"
                value={chequeNumber}
                onChange={(e) => setChequeNumber(e.target.value)}
                placeholder="Enter your cheque number"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: `1px solid var(--bcgov-border-light)`,
                  borderRadius: "6px",
                  outline: "none",
                  fontSize: "16px",
                  fontFamily: "BCSans, sans-serif",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--bcgov-border-active)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--bcgov-border-light)")
                }
                required
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label
                htmlFor="payeeName"
                style={{
                  display: "block",
                  color: "var(--bcgov-text-primary)",
                  fontFamily: "BCSans, sans-serif",
                  fontWeight: "500",
                  marginBottom: "8px",
                }}
              >
                Payee Name:
              </label>
              <input
                type="text"
                id="payeeName"
                value={payeeName}
                onChange={(e) => setPayeeName(e.target.value)}
                placeholder="Enter the payee name"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: `1px solid var(--bcgov-border-light)`,
                  borderRadius: "6px",
                  outline: "none",
                  fontSize: "16px",
                  fontFamily: "BCSans, sans-serif",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--bcgov-border-active)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--bcgov-border-light)")
                }
                required
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label
                htmlFor="paymentIssueDate"
                style={{
                  display: "block",
                  color: "var(--bcgov-text-primary)",
                  fontFamily: "BCSans, sans-serif",
                  fontWeight: "500",
                  marginBottom: "8px",
                }}
              >
                Payment Issue Date:
              </label>
              <input
                type="date"
                id="paymentIssueDate"
                value={paymentIssueDate}
                onChange={(e) => setPaymentIssueDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: `1px solid var(--bcgov-border-light)`,
                  borderRadius: "6px",
                  outline: "none",
                  fontSize: "16px",
                  fontFamily: "BCSans, sans-serif",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--bcgov-border-active)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--bcgov-border-light)")
                }
                required
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label
                htmlFor="appliedAmount"
                style={{
                  display: "block",
                  color: "var(--bcgov-text-primary)",
                  fontFamily: "BCSans, sans-serif",
                  fontWeight: "500",
                  marginBottom: "8px",
                }}
              >
                Applied Amount:
              </label>
              <input
                type="number"
                id="appliedAmount"
                value={appliedAmount}
                onChange={(e) => setAppliedAmount(e.target.value)}
                placeholder="Enter the applied amount"
                step="0.01"
                min="0"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: `1px solid var(--bcgov-border-light)`,
                  borderRadius: "6px",
                  outline: "none",
                  fontSize: "16px",
                  fontFamily: "BCSans, sans-serif",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--bcgov-border-active)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--bcgov-border-light)")
                }
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                backgroundColor: loading
                  ? "var(--bcgov-button-secondary-hover)"
                  : "var(--bcgov-button-primary)",
                color: "var(--bcgov-text-white)",
                fontFamily: "BCSans, sans-serif",
                fontWeight: "600",
                padding: "12px 24px",
                borderRadius: "6px",
                border: "none",
                outline: "none",
                fontSize: "16px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  (e.target as HTMLButtonElement).style.backgroundColor =
                    "var(--bcgov-button-primary-hover)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  (e.target as HTMLButtonElement).style.backgroundColor =
                    "var(--bcgov-button-primary)";
                }
              }}
            >
              {loading ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    style={{
                      animation: "spin 1s linear infinite",
                      marginLeft: "-4px",
                      marginRight: "12px",
                      height: "20px",
                      width: "20px",
                      color: "var(--bcgov-text-white)",
                    }}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      style={{ opacity: 0.25 }}
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      style={{ opacity: 0.75 }}
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                "Verify Cheque"
              )}
            </button>
          </form>

          {error && !status && (
            <div
              style={{
                padding: "16px 24px",
                backgroundColor: "var(--bcgov-danger-background)",
                borderTop: `1px solid var(--bcgov-danger-border)`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <svg
                  style={{
                    width: "20px",
                    height: "20px",
                    color: "var(--bcgov-text-danger)",
                    marginRight: "8px",
                  }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <p
                  style={{
                    color: "var(--bcgov-text-danger)",
                    fontFamily: "BCSans, sans-serif",
                    margin: "0",
                  }}
                >
                  {error}
                </p>
              </div>
            </div>
          )}

          {status && (
            <div
              style={{
                padding: "16px 24px",
                borderTop: `1px solid var(--bcgov-border-light)`,
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
                <svg
                  style={{
                    width: "20px",
                    height: "20px",
                    marginRight: "8px",
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Verification Result
              </h2>
              {status.success ? (
                <div
                  style={{
                    backgroundColor: "var(--bcgov-success-background)",
                    padding: "16px",
                    borderRadius: "6px",
                    borderLeft: `4px solid var(--bcgov-success-border)`,
                  }}
                >
                  <p
                    style={{
                      color: "var(--bcgov-text-primary)",
                      fontFamily: "BCSans, sans-serif",
                      fontWeight: "500",
                      marginBottom: "8px",
                      margin: "0 0 8px 0",
                    }}
                  >
                    Cheque #{status.data?.chequeNumber}
                  </p>
                  <p
                    style={{
                      color: "var(--bcgov-text-secondary)",
                      fontFamily: "BCSans, sans-serif",
                      display: "flex",
                      alignItems: "center",
                      margin: "0",
                    }}
                  >
                    Status:
                    <span
                      style={{
                        marginLeft: "8px",
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "2px 10px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "500",
                        backgroundColor: "var(--bcgov-success-background)",
                        color: "var(--bcgov-success-border)",
                      }}
                    >
                      {status.data?.chequeStatus}
                    </span>
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: "var(--bcgov-danger-background)",
                    padding: "16px",
                    borderRadius: "6px",
                    borderLeft: `4px solid var(--bcgov-danger-border)`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <svg
                      style={{
                        width: "20px",
                        height: "20px",
                        color: "var(--bcgov-text-danger)",
                        marginRight: "8px",
                      }}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p
                      style={{
                        color: "var(--bcgov-text-danger)",
                        fontFamily: "BCSans, sans-serif",
                        margin: "0",
                      }}
                    >
                      {status.error}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
