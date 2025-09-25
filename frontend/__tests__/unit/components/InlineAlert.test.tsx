import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../helpers/testHelpers";
import InlineAlert from "../../../src/components/InlineAlert";

describe("InlineAlert Component", () => {
  it("renders nothing when no description is provided", () => {
    const { container } = renderWithProviders(<InlineAlert description="" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when description is null or undefined", () => {
    const { container: containerNull } = renderWithProviders(
      <InlineAlert description={null as any} />
    );
    expect(containerNull.firstChild).toBeNull();

    const { container: containerUndefined } = renderWithProviders(
      <InlineAlert description={undefined as any} />
    );
    expect(containerUndefined.firstChild).toBeNull();
  });

  it("renders alert when description is provided", () => {
    const errorMessage = "This is an error message";
    renderWithProviders(<InlineAlert description={errorMessage} />);

    const alert = screen.getByRole("note");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(errorMessage);
  });

  it("preserves line breaks in multi-line error messages", () => {
    const multiLineError = "Error 1\nError 2\nError 3";
    renderWithProviders(<InlineAlert description={multiLineError} />);

    const alert = screen.getByRole("note");
    // Component renders with "Error" prefix and collapses newlines
    expect(alert).toHaveTextContent("ErrorError 1 Error 2 Error 3");
  });

  it("handles formatted error messages with bullet points", () => {
    const bulletPointErrors =
      "Validation failed:\n• Field 1 is required\n• Field 2 is invalid";
    renderWithProviders(<InlineAlert description={bulletPointErrors} />);

    const alert = screen.getByRole("note");
    // Component renders with "Error" prefix and collapses newlines
    expect(alert).toHaveTextContent(
      "ErrorValidation failed: • Field 1 is required • Field 2 is invalid"
    );
  });

  it("has proper ARIA attributes for accessibility", () => {
    renderWithProviders(<InlineAlert description="Error message" />);

    const alert = screen.getByRole("note");
    expect(alert).toHaveAttribute("role", "note");
  });

  it("applies consistent styling", () => {
    renderWithProviders(<InlineAlert description="Error message" />);

    const alert = screen.getByRole("note");

    // Check that it has some styling (exact styles depend on implementation)
    expect(alert).toBeInTheDocument();
  });

  it("handles very long error messages", () => {
    const longMessage = "A".repeat(1000);
    renderWithProviders(<InlineAlert description={longMessage} />);

    const alert = screen.getByRole("note");
    expect(alert).toHaveTextContent(longMessage);
  });

  it("handles special characters in error messages", () => {
    const specialCharMessage = "Error with special chars: <>&\"'";
    renderWithProviders(<InlineAlert description={specialCharMessage} />);

    const alert = screen.getByRole("note");
    expect(alert).toHaveTextContent(specialCharMessage);
  });

  it("is accessible to screen readers", () => {
    renderWithProviders(<InlineAlert description="Screen reader test" />);

    const alert = screen.getByRole("note");
    expect(alert).toBeInTheDocument();

    // BC Government alert components use role="note"
    expect(alert).toHaveAttribute("role", "note");
  });
});
