import { useState } from "react";
import axios from "axios";
import "./App.css";
import type { ApiResponse, CheckStatus } from "./types";

function App() {
  const [chequeNumber, setChequeNumber] = useState("");
  const [status, setStatus] = useState<ApiResponse<CheckStatus> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!chequeNumber.trim()) {
      setError("Please enter a cheque number");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setStatus(null);

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
      const response = await axios.get<ApiResponse<CheckStatus>>(
        `${apiUrl}/api/check/${chequeNumber}`
      );

      setStatus(response.data);
    } catch (err) {
      console.error("Error verifying cheque:", err);
      setError("Failed to verify cheque. Please try again later.");

      if (axios.isAxiosError(err) && err.response) {
        setStatus(err.response.data as ApiResponse<CheckStatus>);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bcgov-background flex flex-col items-center">
      {/* BC Gov header bar */}
      <header className="w-full bg-bcgov-blue flex items-center justify-between p-4 shadow-md">
        <div className="flex items-center">
          <div className="h-10 w-2 bg-bcgov-gold mr-4"></div>
          <h1 className="text-white text-2xl font-BCSans font-bold">
            Cheque Verification Service
          </h1>
        </div>
        <div className="h-10 w-28 bg-bcgov-gold"></div>
      </header>

      {/* Main content */}
      <main className="w-full max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-md shadow-md overflow-hidden border border-bcgov-border mb-8 mt-10">
          <div className="bg-bcgov-blue p-4 border-b-4 border-bcgov-gold flex items-center">
            <svg
              className="w-6 h-6 text-white mr-3"
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
            <h2 className="text-white text-xl font-BCSans font-semibold">
              Verify Your Cheque
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6">
              <label
                htmlFor="chequeNumber"
                className="block text-bcgov-primaryText font-BCSans font-medium mb-2"
              >
                Enter Cheque Number:
              </label>
              <input
                type="text"
                id="chequeNumber"
                value={chequeNumber}
                onChange={(e) => setChequeNumber(e.target.value)}
                placeholder="Enter your cheque number"
                className="w-full px-4 py-3 border border-bcgov-border rounded-md focus:outline-none focus:ring-2 focus:ring-bcgov-link"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-bcgov-blue hover:bg-bcgov-link text-white font-BCSans font-semibold py-3 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-bcgov-link focus:ring-opacity-50 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Checking...
                </span>
              ) : (
                "Verify Cheque"
              )}
            </button>
          </form>

          {error && !status && (
            <div className="px-6 py-4 bg-red-50 border-t border-red-200">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-red-600 mr-2"
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
                <p className="text-red-600 font-BCSans">{error}</p>
              </div>
            </div>
          )}

          {status && (
            <div className="px-6 py-4 border-t border-bcgov-border bg-gray-50">
              <h2 className="text-xl font-BCSans font-semibold text-bcgov-primaryText mb-3 flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
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
                Result:
              </h2>
              {status.success ? (
                <div className="bg-green-50 p-4 rounded-md border-l-4 border-green-500">
                  <p className="text-bcgov-primaryText font-BCSans font-medium mb-2">
                    Cheque #{status.data?.chequeNumber}
                  </p>
                  <p className="text-bcgov-secondaryText font-BCSans flex items-center">
                    Status:
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {status.data?.chequeStatus}
                    </span>
                  </p>
                </div>
              ) : (
                <div className="bg-red-50 p-4 rounded-md border-l-4 border-red-500">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-red-600 mr-2"
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
                    <p className="text-red-600 font-BCSans">{status.error}</p>
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
