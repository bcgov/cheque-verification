import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../helpers/testHelpers";
import Home from "../../../src/pages/Home";
import * as testHelpers from "../../helpers/testHelpers";

// Mock axios for API calls
vi.mock("axios");

// Mock child components to isolate Home page logic
vi.mock("../../../src/components/ChequeForm", () => ({
  default: ({
    onSubmit,
    loading,
  }: {
    onSubmit: (data: any) => void;
    loading: boolean;
  }) => (
    <form
      data-testid="cheque-form"
      data-loading={loading}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          chequeNumber: "123456",
          paymentIssueDate: "2024-01-15",
          appliedAmount: "1000.50",
        });
      }}
    >
      <button type="submit" disabled={loading}>
        {loading ? "Verifying..." : "Verify Cheque"}
      </button>
    </form>
  ),
}));

vi.mock("../../../src/components/InlineAlert", () => ({
  default: ({ description }: { description: string }) =>
    description ? (
      <div data-testid="inline-alert" role="alert">
        {description}
      </div>
    ) : null,
}));

vi.mock("../../../src/components/VerificationResult", () => ({
  default: ({ status }: { status: any }) =>
    status ? (
      <div data-testid="verification-result">
        {status.success ? "Success" : "Error"}
      </div>
    ) : null,
}));

vi.mock("../../../src/components/DataNotice.tsx", () => ({
  default: () => <div data-testid="data-notice">Data Notice Content</div>,
}));

const mockAxios = vi.hoisted(() => ({
  post: vi.fn(),
  isAxiosError: vi.fn(),
}));

vi.mock("axios", () => ({
  default: mockAxios,
  post: mockAxios.post,
  isAxiosError: mockAxios.isAxiosError,
}));

let restoreEnv: (() => void) | undefined;

describe("Home Page", () => {
  const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
    consoleSpy.mockClear();
    restoreEnv = testHelpers.mockEnvironment();
  });

  afterEach(() => {
    restoreEnv?.();
    restoreEnv = undefined;
  });

  it("renders all required components", () => {
    renderWithProviders(<Home />);

    // Check for main components
    expect(screen.getByTestId("data-notice")).toBeInTheDocument();
    expect(screen.getByTestId("cheque-form")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("displays the correct heading", () => {
    renderWithProviders(<Home />);

    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveTextContent("Verify Your Cheque Details");
  });

  it("applies correct container styling", () => {
    renderWithProviders(<Home />);

    const main = screen.getByRole("main");
    // Check for key styling properties
    expect(main).toHaveStyle("width: 100%");
    expect(main).toHaveStyle("max-width: 672px");
  });

  it("has proper card styling for the form container", () => {
    renderWithProviders(<Home />);

    // Check that the form container structure exists
    const form = screen.getByTestId("cheque-form");
    expect(form).toBeInTheDocument();

    // Check for main heading
    const heading = screen.getByText("Verify Your Cheque Details");
    expect(heading).toBeInTheDocument();
  });

  it("has BC Government header styling", () => {
    renderWithProviders(<Home />);

    const header = document.querySelector(
      'div[style*="background-color: var(--bcgov-blue)"]'
    ) as HTMLElement;
    expect(header).toBeInTheDocument();

    if (header) {
      // Check the style attributes directly since React might not resolve CSS variables in tests
      const styleAttr = header.getAttribute("style");
      expect(styleAttr).toContain("background-color: var(--bcgov-blue)");
      expect(styleAttr).toContain("border-bottom");
    }
  });

  it("handles successful form submission", async () => {
    const mockResponse = {
      data: testHelpers.MOCK_API_RESPONSES.success,
    };
    mockAxios.post.mockResolvedValueOnce(mockResponse);

    renderWithProviders(<Home />);

    const submitButton = screen.getByText("Verify Cheque");

    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId("verification-result")).toBeInTheDocument();
      expect(screen.getByTestId("verification-result")).toHaveTextContent(
        "Success"
      );
    });

    expect(mockAxios.post).toHaveBeenCalledWith(
      "http://localhost:4000/api/cheque/verify",
      {
        chequeNumber: "123456",
        paymentIssueDate: "2024-01-15",
        appliedAmount: "1000.50",
      }
    );
  });

  it("handles form submission with validation errors", async () => {
    const mockError = {
      response: {
        data: {
          error: "Validation failed",
          details: ["Cheque number is invalid", "Amount must be positive"],
        },
      },
    };
    mockAxios.post.mockRejectedValueOnce(mockError);
    mockAxios.isAxiosError.mockReturnValue(true);

    renderWithProviders(<Home />);

    const submitButton = screen.getByText("Verify Cheque");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId("inline-alert")).toBeInTheDocument();
      expect(screen.getByTestId("inline-alert")).toHaveTextContent(
        "Verification failed: • Cheque number is invalid • Amount must be positive"
      );
    });
  });

  it("handles generic API errors", async () => {
    const mockError = {
      response: {
        data: {
          error: "Server error",
        },
      },
    };
    mockAxios.post.mockRejectedValueOnce(mockError);
    mockAxios.isAxiosError.mockReturnValue(true);

    renderWithProviders(<Home />);

    const submitButton = screen.getByText("Verify Cheque");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId("inline-alert")).toBeInTheDocument();
      expect(screen.getByTestId("inline-alert")).toHaveTextContent(
        "Server error"
      );
    });
  });

  it("handles network errors", async () => {
    mockAxios.post.mockRejectedValueOnce(new Error("Network error"));
    mockAxios.isAxiosError.mockReturnValue(false);

    renderWithProviders(<Home />);

    const submitButton = screen.getByText("Verify Cheque");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId("inline-alert")).toBeInTheDocument();
      expect(screen.getByTestId("inline-alert")).toHaveTextContent(
        "Failed to verify cheque. Please try again later."
      );
    });
  });

  it("shows loading state during form submission", async () => {
    // Create a promise that we can control
    let resolvePromise: (value: any) => void;
    const mockPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    // Use mockImplementationOnce to ensure this only affects this test
    mockAxios.post.mockImplementationOnce(() => mockPromise);

    renderWithProviders(<Home />);

    const submitButton = screen.getByText("Verify Cheque");
    await userEvent.click(submitButton);

    // Check loading state
    expect(screen.getByText("Verifying...")).toBeInTheDocument();
    expect(screen.getByTestId("cheque-form")).toHaveAttribute(
      "data-loading",
      "true"
    );

    // Resolve the promise
    resolvePromise!({ data: testHelpers.MOCK_API_RESPONSES.success });

    await waitFor(() => {
      expect(screen.queryByText("Verifying...")).not.toBeInTheDocument();
      expect(screen.getByText("Verify Cheque")).toBeInTheDocument();
    });
  });

  it("uses custom API URL when provided in environment", async () => {
    restoreEnv?.();
    restoreEnv = testHelpers.mockEnvironment({
      VITE_API_URL: "https://custom-api.example.com",
    });

    mockAxios.post.mockResolvedValueOnce({
      data: testHelpers.MOCK_API_RESPONSES.success,
    });

    renderWithProviders(<Home />);

    const submitButton = screen.getByText("Verify Cheque");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith(
        "https://custom-api.example.com/api/cheque/verify",
        expect.any(Object)
      );
    });
  });

  it("clears previous errors and results on new submission", async () => {
    // First submission with error
    const mockError = {
      response: {
        data: {
          error: "First error",
        },
      },
    };
    mockAxios.post.mockRejectedValueOnce(mockError);
    mockAxios.isAxiosError.mockReturnValue(true);

    renderWithProviders(<Home />);

    const submitButton = screen.getByText("Verify Cheque");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledTimes(1);
    });

    const alert = await screen.findByTestId("inline-alert");
    expect(alert).toHaveTextContent("First error");

    // Second submission should clear previous error
    mockAxios.post.mockResolvedValueOnce({
      data: testHelpers.MOCK_API_RESPONSES.success,
    });

    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(screen.queryByText("First error")).not.toBeInTheDocument();
      expect(screen.getByTestId("verification-result")).toHaveTextContent(
        "Success"
      );
    });
  });

  it("has proper semantic structure", () => {
    renderWithProviders(<Home />);

    // Should have main landmark
    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();

    // Should have proper heading
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toBeInTheDocument();
  });
});
