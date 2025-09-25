import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { render, cleanup } from "@testing-library/react";
import Header from "../../src/components/Header";
import Footer from "../../src/components/Footer";
import Home from "../../src/pages/Home";
import Faq from "../../src/pages/FAQ";

// Mock API calls to avoid actual network requests
vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
    isAxiosError: vi.fn(),
  },
  post: vi.fn(),
  isAxiosError: vi.fn(),
}));

// Create a test version of the App structure without BrowserRouter
const TestApp = () => {
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
          padding: "16px 16px 200px",
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/faq" element={<Faq />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const renderWithRouter = (initialEntries = ["/"]) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <TestApp />
    </MemoryRouter>
  );
};

describe("Routing Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("allows navigation between Home and FAQ pages via Header", async () => {
    const user = userEvent.setup();

    renderWithRouter(["/"]);

    // Should start on Home page
    expect(screen.getByText("Verify Your Cheque Details")).toBeInTheDocument();

    // Should show FAQ button in header
    const faqButton = screen.getByRole("button", { name: /FAQ/i });
    expect(faqButton).toBeInTheDocument();

    // Click to navigate to FAQ
    await user.click(faqButton);

    // Should now be on FAQ page
    await waitFor(() => {
      expect(
        screen.getByText("Frequently Asked Questions (FAQ)")
      ).toBeInTheDocument();
    });

    // Should show Back button in header
    const backButton = screen.getByRole("button", { name: /Back to Home/i });
    expect(backButton).toBeInTheDocument();

    // Click to navigate back to Home
    await user.click(backButton);

    // Should be back on Home page
    await waitFor(() => {
      expect(
        screen.getByText("Verify Your Cheque Details")
      ).toBeInTheDocument();
    });
  });

  it("renders Home content for root path", () => {
    renderWithRouter(["/"]);

    expect(screen.getByText("Verify Your Cheque Details")).toBeInTheDocument();
    expect(screen.getByText("Important data notice")).toBeInTheDocument();
  });

  it("renders FAQ content for faq path", () => {
    renderWithRouter(["/faq"]);

    expect(
      screen.getByText("Frequently Asked Questions (FAQ)")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Verify Your Cheque Details")
    ).not.toBeInTheDocument();
  });

  it.each([
    { path: "/", label: "FAQ" },
    { path: "/faq", label: "Back to Home" },
  ])("shows contextual navigation button text on %s", ({ path, label }) => {
    renderWithRouter([path]);

    expect(
      screen.getByRole("button", { name: new RegExp(label, "i") })
    ).toBeInTheDocument();
  });

  it.each([
    { path: "/", description: "Home" },
    { path: "/faq", description: "FAQ" },
  ])("renders header and footer on the %description page", ({ path }) => {
    renderWithRouter([path]);

    expect(screen.getByRole("banner")).toHaveTextContent("Cheque Verification");
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("maintains application state during navigation", async () => {
    const user = userEvent.setup();

    renderWithRouter(["/"]);

    // Navigate to FAQ
    const faqButton = screen.getByRole("button", { name: /FAQ/i });
    await user.click(faqButton);

    await waitFor(() => {
      expect(
        screen.getByText("Frequently Asked Questions (FAQ)")
      ).toBeInTheDocument();
    });

    // Navigate back to Home
    const backButton = screen.getByRole("button", { name: /Back to Home/i });
    await user.click(backButton);

    await waitFor(() => {
      expect(
        screen.getByText("Verify Your Cheque Details")
      ).toBeInTheDocument();
    });

    // Form should still be present and functional
    expect(
      screen.getByRole("button", { name: /Verify Cheque/i })
    ).toBeInTheDocument();
  });

  it.each([
    { path: "/", description: "home" },
    { path: "/faq", description: "faq" },
  ])("applies consistent styling across the %description route", ({ path }) => {
    renderWithRouter([path]);

    const shell = screen.getByRole("banner").parentElement as HTMLElement;

    expect(shell.style.minHeight).toBe("100vh");
    expect(shell.style.backgroundColor).toBe(
      "var(--bcgov-background-light-gray)"
    );
    expect(shell.style.display).toBe("flex");
  });

  it("provides accessible navigation between pages", async () => {
    const user = userEvent.setup();

    renderWithRouter(["/"]);

    // Navigation buttons should be accessible
    const faqButton = screen.getByRole("button", { name: /FAQ/i });
    expect(faqButton).toBeInTheDocument();
    expect(faqButton).not.toBeDisabled();

    await user.click(faqButton);

    await waitFor(() => {
      const backButton = screen.getByRole("button", { name: /Back to Home/i });
      expect(backButton).toBeInTheDocument();
      expect(backButton).not.toBeDisabled();
    });
  });

  // The design-system button warns about `onClick`; this remains until upstream migrates to onPress
});
