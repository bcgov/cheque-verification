import { useState } from "react";
import Button from "./Button";
import TextField from "./TextField";
import InlineAlert from "./InlineAlert";

/**
 * Cheque verification form component
 * @param {Object} props
 * @param {(payload: { chequeNumber: string; paymentIssueDate: string; appliedAmount: string }) => Promise<void>} props.onSubmit - Form submit handler
 * @param {boolean} props.loading - Loading state
 */
const ChequeForm = ({
  onSubmit,
  loading,
}: {
  onSubmit: (payload: {
    chequeNumber: string;
    paymentIssueDate: string;
    appliedAmount: string;
  }) => Promise<void>;
  loading: boolean;
}) => {
  const [chequeNumber, setChequeNumber] = useState("");
  const [paymentIssueDate, setPaymentIssueDate] = useState("");
  const [appliedAmount, setAppliedAmount] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate all required fields
    if (!chequeNumber.trim()) {
      setLocalError("Please enter a cheque number");
      return;
    }
    if (!paymentIssueDate.trim()) {
      setLocalError("Please enter a payment issue date");
      return;
    }
    if (!appliedAmount.trim()) {
      setLocalError("Please enter the cheque amount");
      return;
    }
    setLocalError("");
    await onSubmit({ chequeNumber, paymentIssueDate, appliedAmount });
  };

  // Determine if individual fields have errors for aria-invalid
  const hasError = !!localError;
  const chequeNumberError =
    hasError && !chequeNumber.trim()
      ? "Please enter a cheque number"
      : undefined;
  const dateError =
    hasError && !paymentIssueDate.trim()
      ? "Please enter a payment issue date"
      : undefined;
  const amountError =
    hasError && !appliedAmount.trim()
      ? "Please enter the cheque amount"
      : undefined;

  return (
    <form
      onSubmit={handleSubmit}
      style={{ padding: "24px" }}
      aria-label="Cheque verification form"
      noValidate
    >
      <div style={{ marginBottom: "24px" }}>
        <TextField
          label="Cheque Number"
          value={chequeNumber}
          onChange={setChequeNumber}
          type="text"
          required={true}
          errorMessage={chequeNumberError}
        />
      </div>
      <div style={{ marginBottom: "24px" }}>
        <TextField
          label="Payment Issue Date"
          value={paymentIssueDate}
          onChange={setPaymentIssueDate}
          type="date"
          required={true}
          errorMessage={dateError}
        />
      </div>
      <div style={{ marginBottom: "24px" }}>
        <TextField
          label="Cheque Amount"
          value={appliedAmount}
          onChange={setAppliedAmount}
          type="number"
          required={true}
          errorMessage={amountError}
        />
      </div>
      {localError && (
        <div style={{ marginBottom: "16px" }}>
          <InlineAlert description={localError} />
        </div>
      )}
      <div style={{ width: "100%" }}>
        <Button
          type="submit"
          variant="primary"
          size="medium"
          disabled={loading}
          isLoading={loading}
        >
          Verify Cheque
        </Button>
      </div>
    </form>
  );
};

export default ChequeForm;
