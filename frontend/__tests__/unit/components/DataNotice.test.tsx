import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../helpers/testHelpers";
import DataNotice from "../../../src/components/DataNotice";

describe("DataNotice Component", () => {
  it("renders the data notice with correct content", () => {
    renderWithProviders(<DataNotice />);

    // Check for the main heading
    expect(screen.getByText("Important data notice")).toBeInTheDocument();

    // Check for the main message
    expect(
      screen.getByText(
        /Cheque Verification results updates daily at 6 a\.m\. PT/
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /Cheques issued within the last 24 business hours may not appear until the next business day/
      )
    ).toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    renderWithProviders(<DataNotice />);

    const notice = screen.getByRole("note");
    expect(notice).toHaveAttribute(
      "aria-label",
      "Cheque verification data notice"
    );
  });

  it("applies correct BC Government styling", () => {
    renderWithProviders(<DataNotice />);

    const notice = screen.getByRole("note");

    // Check container styles
    expect(notice).toHaveStyle({
      padding: "16px",
      backgroundColor: "#F4E1E2",
      borderRadius: "6px",
      border: "1px solid #CE3E39",
      margin: "24px auto",
      maxWidth: "800px",
    });
  });

  it("applies correct text styling", () => {
    renderWithProviders(<DataNotice />);

    const paragraph = screen.getByText(
      /Cheque Verification results updates daily/
    );

    expect(paragraph).toHaveStyle({
      margin: "0",
      fontFamily: "BCSans, sans-serif",
      fontSize: "16px",
      lineHeight: 1.5,
    });
  });

  it('emphasizes the "Important data notice" heading', () => {
    renderWithProviders(<DataNotice />);

    const heading = screen.getByText("Important data notice");

    // Should be wrapped in a <strong> tag
    expect(heading.tagName).toBe("STRONG");

    // Should have the proper color styling
    expect(heading).toHaveStyle({
      color: "#CE3E39 !important",
    });
  });

  it("uses proper BC Government danger colors", () => {
    renderWithProviders(<DataNotice />);

    const notice = screen.getByRole("note");

    // Check for the BC Gov danger red color
    expect(notice).toHaveStyle({
      border: "1px solid #CE3E39",
      backgroundColor: "#F4E1E2",
    });
  });

  it("has proper semantic structure", () => {
    renderWithProviders(<DataNotice />);

    // Should be a note landmark
    const notice = screen.getByRole("note");
    expect(notice).toBeInTheDocument();

    // Should contain a paragraph
    const paragraph = screen.getByText(
      /Cheque Verification results updates daily/
    );
    expect(paragraph.tagName).toBe("P");

    // Should contain emphasized text
    const emphasis = screen.getByText("Important data notice");
    expect(emphasis.tagName).toBe("STRONG");
  });

  it("is responsive with max-width constraint", () => {
    renderWithProviders(<DataNotice />);

    const notice = screen.getByRole("note");

    expect(notice).toHaveStyle({
      maxWidth: "800px",
      margin: "24px auto",
    });
  });

  it("matches snapshot for visual consistency", () => {
    const { container } = renderWithProviders(<DataNotice />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
