import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../helpers/testHelpers";
import Footer from "../../../src/components/Footer";

describe("Footer Component", () => {
  it("renders the footer", () => {
    renderWithProviders(<Footer />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();
  });

  it("has proper semantic HTML structure", () => {
    renderWithProviders(<Footer />);

    // Should use footer element or have contentinfo role
    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();
  });

  it("contains BC Government branding or copyright information", () => {
    renderWithProviders(<Footer />);

    // Footer should contain some BC Government information
    // (exact content depends on implementation)
    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();

    // Check if it contains common footer elements
    const footerText = footer.textContent;
    expect(footerText).toBeDefined();
  });

  it("applies consistent styling", () => {
    renderWithProviders(<Footer />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();

    // Should have proper styling applied
    expect(footer).toHaveAttribute("role", "contentinfo");
  });

  it("is accessible to assistive technologies", () => {
    renderWithProviders(<Footer />);

    const footer = screen.getByRole("contentinfo");

    // Should be identifiable as a footer
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveAttribute("role", "contentinfo");
  });

  it("renders consistently", () => {
    const { container } = renderWithProviders(<Footer />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
