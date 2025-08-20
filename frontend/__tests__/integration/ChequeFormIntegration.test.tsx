import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../helpers/testHelpers";
import ChequeForm from "../../src/components/ChequeForm";

// Mock the API service
const mockChequeVerification = vi.fn();
vi.mock("../../src/services/chequeService", () => ({
  verifyCheque: mockChequeVerification,
}));

describe("Cheque Verification Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("completes full cheque verification workflow", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn().mockResolvedValue({
      isValid: true,
      message: "Cheque verified successfully",
    });

    renderWithProviders(<ChequeForm onSubmit={mockOnSubmit} loading={false} />);

    // Fill out the form
    await user.type(screen.getByLabelText(/cheque number/i), "123456789");
    await user.type(screen.getByLabelText(/payment issue date/i), "2024-01-15");
    await user.type(screen.getByLabelText(/cheque amount/i), "2500.75");

    // Submit the form
    await user.click(screen.getByRole("button", { name: /verify cheque/i }));

    // Verify submission
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        chequeNumber: "123456789",
        paymentIssueDate: "2024-01-15",
        appliedAmount: "2500.75",
      });
    });
  });

  it("handles form validation errors correctly", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();

    renderWithProviders(<ChequeForm onSubmit={mockOnSubmit} loading={false} />);

    // Try to submit without filling required fields
    await user.click(screen.getByRole("button", { name: /verify cheque/i }));

    // Should show validation error
    await waitFor(() => {
      expect(
        screen.getByText(/please enter a cheque number/i)
      ).toBeInTheDocument();
    });

    // Should not call onSubmit
    expect(mockOnSubmit).not.toHaveBeenCalled();

    // Fill cheque number but leave others empty
    await user.type(screen.getByLabelText(/cheque number/i), "123456");
    await user.click(screen.getByRole("button", { name: /verify cheque/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/please enter a payment issue date/i)
      ).toBeInTheDocument();
    });

    // Fill date but leave amount empty
    await user.type(screen.getByLabelText(/payment issue date/i), "2024-01-15");
    await user.click(screen.getByRole("button", { name: /verify cheque/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/please enter the cheque amount/i)
      ).toBeInTheDocument();
    });
  });

  it("handles loading state during submission", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi
      .fn()
      .mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

    const { rerender } = renderWithProviders(
      <ChequeForm onSubmit={mockOnSubmit} loading={false} />
    );

    // Fill form
    await user.type(screen.getByLabelText(/cheque number/i), "123456");
    await user.type(screen.getByLabelText(/payment issue date/i), "2024-01-15");
    await user.type(screen.getByLabelText(/cheque amount/i), "1000");

    // Simulate loading state
    rerender(<ChequeForm onSubmit={mockOnSubmit} loading={true} />);

    const submitButton = screen.getByRole("button", { name: /loading/i }); // Button text changes to "Loading..." when loading
    expect(submitButton).toBeDisabled();
  });

  it("maintains form state during user interaction", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();

    renderWithProviders(<ChequeForm onSubmit={mockOnSubmit} loading={false} />);

    const chequeNumberInput = screen.getByLabelText(/cheque number/i);
    const dateInput = screen.getByLabelText(/payment issue date/i);
    const amountInput = screen.getByLabelText(/cheque amount/i);

    // Fill form partially
    await user.type(chequeNumberInput, "123");
    await user.type(dateInput, "2024-01-15");

    // Navigate between fields
    await user.click(chequeNumberInput);
    await user.type(chequeNumberInput, "456");

    await user.click(amountInput);
    await user.type(amountInput, "1000.50");

    // Verify all values are maintained
    expect(chequeNumberInput).toHaveValue("123456");
    expect(dateInput).toHaveValue("2024-01-15");
    expect(amountInput).toHaveValue(1000.5); // Number input returns numeric value
  });

  it("clears validation errors when user fixes input", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();

    renderWithProviders(<ChequeForm onSubmit={mockOnSubmit} loading={false} />);

    // Trigger validation error
    await user.click(screen.getByRole("button", { name: /verify cheque/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/please enter a cheque number/i)
      ).toBeInTheDocument();
    });

    // Fill all required fields
    await user.type(screen.getByLabelText(/cheque number/i), "123456");
    await user.type(screen.getByLabelText(/payment issue date/i), "2024-01-15");
    await user.type(screen.getByLabelText(/cheque amount/i), "1000");

    // Submit again
    await user.click(screen.getByRole("button", { name: /verify cheque/i }));

    // Error should be cleared
    await waitFor(() => {
      expect(
        screen.queryByText(/please enter a cheque number/i)
      ).not.toBeInTheDocument();
    });

    // onSubmit should be called
    expect(mockOnSubmit).toHaveBeenCalledWith({
      chequeNumber: "123456",
      paymentIssueDate: "2024-01-15",
      appliedAmount: "1000",
    });
  });

  it("handles special characters and edge cases in input", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

    renderWithProviders(<ChequeForm onSubmit={mockOnSubmit} loading={false} />);

    // Test with special characters and edge cases
    await user.type(screen.getByLabelText(/cheque number/i), "CHQ-2024-001");
    await user.type(screen.getByLabelText(/payment issue date/i), "2024-12-31");
    await user.type(screen.getByLabelText(/cheque amount/i), "99999.99");

    await user.click(screen.getByRole("button", { name: /verify cheque/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        chequeNumber: "CHQ-2024-001",
        paymentIssueDate: "2024-12-31",
        appliedAmount: "99999.99",
      });
    });
  });
});
