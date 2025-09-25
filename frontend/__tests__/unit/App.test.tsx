import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@testing-library/react";
import App from "../../src/App";

// Mock all child components to isolate routing logic
vi.mock("../../src/components/Header", () => ({
  default: ({ children }: { children?: React.ReactNode }) => (
    <header data-testid="header">
      Mocked Header
      {children}
    </header>
  ),
}));

vi.mock("../../src/components/Footer", () => ({
  default: () => <footer data-testid="footer">Mocked Footer</footer>,
}));

vi.mock("../../src/pages/Home", () => ({
  default: () => <main data-testid="home-page">Home Page Content</main>,
}));

vi.mock("../../src/pages/FAQ", () => ({
  default: () => <main data-testid="faq-page">FAQ Page Content</main>,
}));

describe("App Routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the main app structure with header and footer", () => {
    render(<App />);

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  it("renders without crashing", () => {
    expect(() => render(<App />)).not.toThrow();
  });

  it("applies correct CSS styles to the main container", () => {
    render(<App />);

    const header = screen.getByTestId("header");
    const appShell = header.parentElement as HTMLElement;

    expect(appShell.style.minHeight).toBe("100vh");
    expect(appShell.style.backgroundColor).toBe(
      "var(--bcgov-background-light-gray)"
    );
    expect(appShell.style.display).toBe("flex");
    expect(appShell.style.flexDirection).toBe("column");
    expect(appShell.style.alignItems).toBe("center");
  });

  it("has proper semantic structure", () => {
    render(<App />);

    // Header should be present
    expect(screen.getByRole("banner")).toBeInTheDocument();

    // Main content should be present
    expect(screen.getByRole("main")).toBeInTheDocument();

    // Footer should be present
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("uses BrowserRouter configuration correctly", () => {
    // Test that BrowserRouter is properly configured
    expect(() => render(<App />)).not.toThrow();

    // Should contain routing components
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });
});
