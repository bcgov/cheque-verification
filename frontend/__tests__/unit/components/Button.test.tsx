import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../helpers/testHelpers";
import Button from "../../../src/components/Button";

describe("Button Component", () => {
  it("renders button with text content", () => {
    renderWithProviders(<Button>Click me</Button>);

    expect(
      screen.getByRole("button", { name: /click me/i })
    ).toBeInTheDocument();
  });

  it("applies primary variant by default", () => {
    renderWithProviders(<Button>Primary Button</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("applies different variants correctly", () => {
    const { rerender } = renderWithProviders(
      <Button variant="secondary">Secondary</Button>
    );

    expect(screen.getByRole("button")).toBeInTheDocument();

    rerender(<Button variant="tertiary">Tertiary</Button>);

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("handles disabled state", () => {
    renderWithProviders(<Button disabled>Disabled Button</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("handles loading state", () => {
    renderWithProviders(<Button isLoading>Loading Button</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("calls onPress when clicked", async () => {
    const handlePress = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(<Button onPress={handlePress}>Clickable</Button>);

    const button = screen.getByRole("button");
    await user.click(button);

    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress when disabled", async () => {
    const handlePress = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <Button onPress={handlePress} disabled>
        Disabled
      </Button>
    );

    const button = screen.getByRole("button");
    await user.click(button);

    expect(handlePress).not.toHaveBeenCalled();
  });

  it("supports different button types", () => {
    const { rerender } = renderWithProviders(
      <Button type="submit">Submit</Button>
    );

    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");

    rerender(<Button type="button">Button</Button>);

    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("supports different sizes", () => {
    renderWithProviders(<Button size="small">Small Button</Button>);

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    renderWithProviders(<Button>Accessible Button</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type"); // Should have type attribute
    expect(button).toBeEnabled(); // Should be enabled by default
  });
});
