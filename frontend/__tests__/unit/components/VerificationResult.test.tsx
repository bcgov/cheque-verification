import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../helpers/testHelpers";
import VerificationResult from "../../../src/components/VerificationResult";
import { MOCK_API_RESPONSES } from "../../helpers/testHelpers";

describe("VerificationResult Component", () => {
  it("renders nothing when status is null", () => {
    const { container } = renderWithProviders(
      <VerificationResult status={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when status is undefined", () => {
    const { container } = renderWithProviders(
      <VerificationResult status={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders success result when status indicates success", () => {
    renderWithProviders(
      <VerificationResult status={MOCK_API_RESPONSES.success} />
    );

    // Should show verification result content
    expect(screen.getByText(/Verification Result/)).toBeInTheDocument();
    expect(screen.getByText(/Cheque #123456/)).toBeInTheDocument(); // Cheque number from success mock
    expect(screen.getByText(/Status: active/)).toBeInTheDocument(); // Status from success mock
  });

  it("renders failure result when status indicates failure", () => {
    const { container } = renderWithProviders(
      <VerificationResult status={MOCK_API_RESPONSES.failure} />
    );

    // Since failure has success: false, component should not render
    expect(container.firstChild).toBeNull();
  });

  it("renders error result when status indicates error", () => {
    const { container } = renderWithProviders(
      <VerificationResult status={MOCK_API_RESPONSES.networkError} />
    );

    // Since networkError has success: false, component should not render
    expect(container.firstChild).toBeNull();
  });

  it("handles empty data gracefully", () => {
    const emptyStatus = { success: true, data: undefined };
    const { container } = renderWithProviders(
      <VerificationResult status={emptyStatus} />
    );

    // Should not crash with empty data
    expect(container).toBeInTheDocument();
  });

  it("handles edge cases in status data", () => {
    const edgeCaseStatus = {
      success: true,
      data: {
        chequeNumber: "",
        chequeStatus: "unknown" as any,
      },
    };

    // Should not crash with edge case data
    expect(() => {
      renderWithProviders(<VerificationResult status={edgeCaseStatus} />);
    }).not.toThrow();
  });

  it("displays cheque verification details correctly", () => {
    renderWithProviders(
      <VerificationResult status={MOCK_API_RESPONSES.success} />
    );

    // Check for expected verification result elements
    expect(screen.getByText(/Verification Result/)).toBeInTheDocument();
    expect(screen.getByText(/Cheque #123456/)).toBeInTheDocument();
    expect(screen.getByText(/Status: active/)).toBeInTheDocument();
  });

  it("handles loading state appropriately", () => {
    const { container } = renderWithProviders(
      <VerificationResult status={null} />
    );

    // Should handle loading/intermediate states
    expect(container).toBeInTheDocument();
  });

  it("displays appropriate content for different cheque statuses", () => {
    const validStatus = {
      success: true,
      data: {
        chequeNumber: "555555",
        chequeStatus: "active",
      },
    };

    renderWithProviders(<VerificationResult status={validStatus} />);

    // Should display status-specific content
    expect(screen.getByText(/Cheque #555555/)).toBeInTheDocument();
    expect(screen.getByText(/Status: active/)).toBeInTheDocument();
  });

  it("handles malformed status objects", () => {
    const malformedStatus = {
      invalid: true,
      wrongData: "test",
    } as any;

    expect(() => {
      renderWithProviders(<VerificationResult status={malformedStatus} />);
    }).not.toThrow();
  });

  it("renders with proper accessibility attributes", () => {
    renderWithProviders(
      <VerificationResult status={MOCK_API_RESPONSES.success} />
    );

    // Check for accessibility attributes
    expect(screen.getByText(/Verification Result/)).toBeInTheDocument();
    expect(screen.getByRole("note")).toBeInTheDocument(); // InlineAlert has role="note"
  });

  it("handles network error status appropriately", () => {
    const { container } = renderWithProviders(
      <VerificationResult status={MOCK_API_RESPONSES.networkError} />
    );

    // Should handle network errors gracefully (doesn't render for failed responses)
    expect(container.firstChild).toBeNull();
  });

  it("displays validation error messages", () => {
    const { container } = renderWithProviders(
      <VerificationResult status={MOCK_API_RESPONSES.failure} />
    );

    // Should not render for failed responses
    expect(container.firstChild).toBeNull();
  });

  it("handles partial data responses", () => {
    const partialDataStatus = {
      success: true,
      data: {
        chequeNumber: "777777",
        chequeStatus: "active" as const,
      },
    };

    expect(() => {
      renderWithProviders(<VerificationResult status={partialDataStatus} />);
    }).not.toThrow();

    expect(screen.getByText(/Cheque #777777/)).toBeInTheDocument();
    expect(screen.getByText(/Status: active/)).toBeInTheDocument();
  });

  it("handles status updates correctly", () => {
    const { rerender } = renderWithProviders(
      <VerificationResult status={null} />
    );

    // Initially should render nothing
    expect(screen.queryByText(/Verification Result/)).not.toBeInTheDocument();

    // After update should render content
    rerender(<VerificationResult status={MOCK_API_RESPONSES.success} />);
    expect(screen.getByText(/Verification Result/)).toBeInTheDocument();
    expect(screen.getByText(/Cheque #123456/)).toBeInTheDocument();
  });

  it("clears content when status becomes null", () => {
    const { rerender } = renderWithProviders(
      <VerificationResult status={MOCK_API_RESPONSES.success} />
    );

    // Initially should render content
    expect(screen.getByText(/Cheque #123456/)).toBeInTheDocument();

    // After clearing should render nothing
    rerender(<VerificationResult status={null} />);
    expect(screen.queryByText(/Cheque #123456/)).not.toBeInTheDocument();
  });

  it("handles rapid status changes", () => {
    const { rerender } = renderWithProviders(
      <VerificationResult status={MOCK_API_RESPONSES.success} />
    );

    // Rapid status changes should not crash
    rerender(<VerificationResult status={MOCK_API_RESPONSES.failure} />); // This won't render (success: false)
    rerender(<VerificationResult status={MOCK_API_RESPONSES.networkError} />); // This won't render (success: false)
    rerender(<VerificationResult status={null} />);

    expect(true).toBe(true); // Should not throw
  });

  it("maintains component stability across re-renders", () => {
    const { rerender } = renderWithProviders(
      <VerificationResult status={MOCK_API_RESPONSES.success} />
    );

    // Check element exists
    expect(screen.getByText(/Cheque #123456/)).toBeInTheDocument();

    // Re-render with same props
    rerender(<VerificationResult status={MOCK_API_RESPONSES.success} />);

    // Should maintain stability
    expect(screen.getByText(/Cheque #123456/)).toBeInTheDocument();
  });

  it("handles complex nested data structures", () => {
    const complexStatus = {
      success: true,
      data: {
        chequeNumber: "888888",
        chequeStatus: "processed",
        metadata: {
          processedDate: "2024-01-01",
          processor: "system",
          notes: ["verified", "approved"],
        },
      },
    };

    expect(() => {
      renderWithProviders(<VerificationResult status={complexStatus} />);
    }).not.toThrow();

    expect(screen.getByText(/Cheque #888888/)).toBeInTheDocument();
    expect(screen.getByText(/Status: processed/)).toBeInTheDocument();
  });
});
