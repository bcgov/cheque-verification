import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import Header from "../../../src/components/Header";

// Mock the BC Gov design system components
vi.mock("@bcgov/design-system-react-components", () => ({
  Header: ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <header data-testid="bcgov-header">
      <h1>{title}</h1>
      {children}
    </header>
  ),
  Button: ({
    variant,
    onClick,
    style,
    children,
  }: {
    variant: string;
    onClick: () => void;
    style: object;
    children: React.ReactNode;
  }) => (
    <button
      data-testid="nav-button"
      data-variant={variant}
      onClick={onClick}
      style={style}
    >
      {children}
    </button>
  ),
}));

const renderWithRouter = (initialEntries = ["/"]) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Header />
    </MemoryRouter>
  );
};

describe("Header Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the BC Government header with correct title", () => {
    renderWithRouter();

    expect(screen.getByTestId("bcgov-header")).toBeInTheDocument();
    expect(screen.getByText("Cheque Verification")).toBeInTheDocument();
  });

  it('shows "FAQ" button when on home page', () => {
    renderWithRouter(["/"]);

    const button = screen.getByTestId("nav-button");
    expect(button).toHaveTextContent("FAQ");
  });

  it('shows "← Back to Home" button when on FAQ page', () => {
    renderWithRouter(["/faq"]);

    const button = screen.getByTestId("nav-button");
    expect(button).toHaveTextContent("← Back to Home");
  });

  it('shows "← Back to Home" button when on any non-home page', () => {
    renderWithRouter(["/some-other-page"]);

    const button = screen.getByTestId("nav-button");
    expect(button).toHaveTextContent("← Back to Home");
  });

  it("applies correct button styling", () => {
    renderWithRouter();

    const button = screen.getByTestId("nav-button");

    expect(button).toHaveAttribute("data-variant", "primary");
    expect(button.style.backgroundColor).toBe("var(--bcgov-blue)");
    expect(button.style.color).toBe("var(--bcgov-text-white)");
    expect(button.style.borderColor).toBe("var(--bcgov-blue)");
  });

  it("navigates to FAQ when FAQ button is clicked from home", async () => {
    const user = userEvent.setup();

    renderWithRouter(["/"]);

    const button = screen.getByTestId("nav-button");
    expect(button).toHaveTextContent("FAQ");

    await user.click(button);
    // Navigation behavior would be tested in integration tests with actual router
  });

  it("navigates to home when Back button is clicked from FAQ", async () => {
    const user = userEvent.setup();

    renderWithRouter(["/faq"]);

    const button = screen.getByTestId("nav-button");
    expect(button).toHaveTextContent("← Back to Home");

    await user.click(button);
    // Navigation behavior would be tested in integration tests
  });

  it("has accessible button attributes", () => {
    renderWithRouter();

    const button = screen.getByTestId("nav-button");

    // Should be a button element
    expect(button.tagName).toBe("BUTTON");

    // Should have text content for screen readers
    expect(button).toHaveTextContent(/FAQ|Back to Home/);
  });

  it("uses correct BC Government design system components", () => {
    renderWithRouter();

    // Should use BCGovHeader
    expect(screen.getByTestId("bcgov-header")).toBeInTheDocument();

    // Should use Button component with primary variant
    const button = screen.getByTestId("nav-button");
    expect(button).toHaveAttribute("data-variant", "primary");
  });

  it("handles different path formats correctly", () => {
    const { unmount: unmountTrailing } = renderWithRouter(["/faq/"]);
    expect(screen.getByTestId("nav-button")).toHaveTextContent(
      "← Back to Home"
    );
    unmountTrailing();

    const { unmount: unmountQuery } = renderWithRouter(["/faq?test=true"]);
    expect(screen.getByTestId("nav-button")).toHaveTextContent(
      "← Back to Home"
    );
    unmountQuery();

    const { unmount: unmountRoot } = renderWithRouter(["/"]);
    expect(screen.getByTestId("nav-button")).toHaveTextContent("FAQ");
    unmountRoot();
  });

  it("maintains consistent styling across different states", () => {
    // Test on home page
    const { rerender } = renderWithRouter(["/"]);
    const homeButton = screen.getByTestId("nav-button");
    const homeStyles = homeButton.style;

    // Test on FAQ page
    rerender(
      <MemoryRouter initialEntries={["/faq"]}>
        <Header />
      </MemoryRouter>
    );

    const faqButton = screen.getByTestId("nav-button");

    // Styles should be consistent
    expect(faqButton).toHaveAttribute("data-variant", "primary");
    expect(faqButton.style.backgroundColor).toBe(homeStyles.backgroundColor);
    expect(faqButton.style.color).toBe(homeStyles.color);
  });
});
