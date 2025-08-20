import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../helpers/testHelpers";
import ChequeForm from "../../../src/components/ChequeForm";

describe("ChequeForm Component", () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all required form fields", () => {
    renderWithProviders(<ChequeForm {...defaultProps} />);

    expect(screen.getByLabelText(/cheque number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/payment issue date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cheque amount/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /verify cheque/i })
    ).toBeInTheDocument();
  });

  it("has correct input types for each field", () => {
    renderWithProviders(<ChequeForm {...defaultProps} />);

    expect(screen.getByLabelText(/cheque number/i)).toHaveAttribute(
      "type",
      "text"
    );
    expect(screen.getByLabelText(/payment issue date/i)).toHaveAttribute(
      "type",
      "date"
    );
    expect(screen.getByLabelText(/cheque amount/i)).toHaveAttribute(
      "type",
      "number"
    );
  });

  it("marks all fields as required", () => {
    renderWithProviders(<ChequeForm {...defaultProps} />);

    expect(screen.getByLabelText(/cheque number/i)).toBeRequired();
    expect(screen.getByLabelText(/payment issue date/i)).toBeRequired();
    expect(screen.getByLabelText(/cheque amount/i)).toBeRequired();
  });

  it("allows user to input values in all fields", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChequeForm {...defaultProps} />);

    const chequeNumberInput = screen.getByLabelText(/cheque number/i);
    const dateInput = screen.getByLabelText(/payment issue date/i);
    const amountInput = screen.getByLabelText(/cheque amount/i);

    await user.type(chequeNumberInput, "123456");
    await user.type(dateInput, "2024-01-15");
    await user.type(amountInput, "1000.50");

    expect(chequeNumberInput).toHaveValue("123456");
    expect(dateInput).toHaveValue("2024-01-15");
    expect(amountInput).toHaveValue(1000.5); // Number input returns numeric value
  });

  describe("Form Validation", () => {
    it("shows error when cheque number is empty", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ChequeForm {...defaultProps} />);

      const submitButton = screen.getByRole("button", {
        name: /verify cheque/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/please enter a cheque number/i)
        ).toBeInTheDocument();
      });
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it("shows error when payment issue date is empty", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ChequeForm {...defaultProps} />);

      const chequeNumberInput = screen.getByLabelText(/cheque number/i);
      const submitButton = screen.getByRole("button", {
        name: /verify cheque/i,
      });

      await user.type(chequeNumberInput, "123456");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/please enter a payment issue date/i)
        ).toBeInTheDocument();
      });
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it("shows error when cheque amount is empty", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ChequeForm {...defaultProps} />);

      const chequeNumberInput = screen.getByLabelText(/cheque number/i);
      const dateInput = screen.getByLabelText(/payment issue date/i);
      const submitButton = screen.getByRole("button", {
        name: /verify cheque/i,
      });

      await user.type(chequeNumberInput, "123456");
      await user.type(dateInput, "2024-01-15");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/please enter the cheque amount/i)
        ).toBeInTheDocument();
      });
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it("clears error when all fields are filled correctly", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ChequeForm {...defaultProps} />);

      const submitButton = screen.getByRole("button", {
        name: /verify cheque/i,
      });

      // First, trigger an error
      await user.click(submitButton);
      await waitFor(() => {
        expect(
          screen.getByText(/please enter a cheque number/i)
        ).toBeInTheDocument();
      });

      // Then fill all fields and submit
      const chequeNumberInput = screen.getByLabelText(/cheque number/i);
      const dateInput = screen.getByLabelText(/payment issue date/i);
      const amountInput = screen.getByLabelText(/cheque amount/i);

      await user.type(chequeNumberInput, "123456");
      await user.type(dateInput, "2024-01-15");
      await user.type(amountInput, "1000.50");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.queryByText(/please enter a cheque number/i)
        ).not.toBeInTheDocument();
      });
    });

    it("trims whitespace from inputs during validation", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ChequeForm {...defaultProps} />);

      const chequeNumberInput = screen.getByLabelText(/cheque number/i);
      const submitButton = screen.getByRole("button", {
        name: /verify cheque/i,
      });

      // Enter only whitespace
      await user.type(chequeNumberInput, "   ");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/please enter a cheque number/i)
        ).toBeInTheDocument();
      });
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });
  });

  describe("Form Submission", () => {
    it("calls onSubmit with correct payload when form is valid", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

      renderWithProviders(
        <ChequeForm onSubmit={mockOnSubmit} loading={false} />
      );

      const chequeNumberInput = screen.getByLabelText(/cheque number/i);
      const dateInput = screen.getByLabelText(/payment issue date/i);
      const amountInput = screen.getByLabelText(/cheque amount/i);
      const submitButton = screen.getByRole("button", {
        name: /verify cheque/i,
      });

      await user.type(chequeNumberInput, "123456");
      await user.type(dateInput, "2024-01-15");
      await user.type(amountInput, "1000.50");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          chequeNumber: "123456",
          paymentIssueDate: "2024-01-15",
          appliedAmount: "1000.5", // Number input passes numeric value
        });
      });
    });

    it("prevents form submission when loading", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();

      renderWithProviders(
        <ChequeForm onSubmit={mockOnSubmit} loading={true} />
      );

      const submitButton = screen.getByRole("button", { name: /loading/i });
      expect(submitButton).toBeDisabled();

      await user.click(submitButton);
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("shows loading state on submit button", () => {
      renderWithProviders(<ChequeForm {...defaultProps} loading={true} />);

      const submitButton = screen.getByRole("button", { name: /loading/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Error Handling", () => {
    it("displays inline alert for validation errors", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
      renderWithProviders(
        <ChequeForm onSubmit={mockOnSubmit} loading={false} />
      );

      const submitButton = screen.getByRole("button", {
        name: /verify cheque/i,
      });
      await user.click(submitButton);

      // Check that the InlineAlert with error message is displayed
      await waitFor(() => {
        expect(
          screen.getByText(/Please enter a cheque number/i)
        ).toBeInTheDocument();
      });

      // Verify onSubmit was not called due to validation errors
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("has proper form semantics", () => {
      renderWithProviders(<ChequeForm {...defaultProps} />);

      const form = screen.getByRole("form");
      expect(form).toBeInTheDocument();

      const submitButton = screen.getByRole("button", {
        name: /verify cheque/i,
      });
      expect(submitButton).toHaveAttribute("type", "submit");
    });

    it("has accessible field labels", () => {
      renderWithProviders(<ChequeForm {...defaultProps} />);

      expect(screen.getByLabelText(/cheque number/i)).toHaveAccessibleName();
      expect(
        screen.getByLabelText(/payment issue date/i)
      ).toHaveAccessibleName();
      expect(screen.getByLabelText(/cheque amount/i)).toHaveAccessibleName();
    });

    it("maintains focus order correctly", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ChequeForm {...defaultProps} />);

      const chequeNumberInput = screen.getByLabelText(/cheque number/i);
      const dateInput = screen.getByLabelText(/payment issue date/i);
      const amountInput = screen.getByLabelText(/cheque amount/i);
      const submitButton = screen.getByRole("button", {
        name: /verify cheque/i,
      });

      // Test tab order
      await user.tab();
      expect(chequeNumberInput).toHaveFocus();

      await user.tab();
      expect(dateInput).toHaveFocus();

      await user.tab();
      expect(amountInput).toHaveFocus();

      await user.tab();
      expect(submitButton).toHaveFocus();
    });
  });
});
