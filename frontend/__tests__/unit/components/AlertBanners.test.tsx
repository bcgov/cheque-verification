import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, act } from "@testing-library/react";
import { renderWithProviders } from "../../helpers/testHelpers";
import AlertBanners from "../../../src/components/AlertBanners";

// Mock the config utility
vi.mock("../../../src/utils/config", () => ({
  fetchConfig: vi.fn(),
}));

import { fetchConfig } from "../../../src/utils/config";
const mockFetchConfig = vi.mocked(fetchConfig);

describe("AlertBanners", () => {
  beforeEach(() => {
    mockFetchConfig.mockReset();
  });

  it("renders nothing when both banners are disabled", async () => {
    mockFetchConfig.mockResolvedValue({
      bannerUpdateIssue: false,
      bannerOutage: false,
    });

    let container!: HTMLElement;
    await act(async () => {
      ({ container } = renderWithProviders(<AlertBanners />));
    });

    expect(mockFetchConfig).toHaveBeenCalled();
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });

  it("renders the update issue banner when enabled", async () => {
    mockFetchConfig.mockResolvedValue({
      bannerUpdateIssue: true,
      bannerOutage: false,
    });

    await act(async () => {
      renderWithProviders(<AlertBanners />);
    });

    expect(
      screen.getByText(/preventing the application from updating/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/system outage/i)).not.toBeInTheDocument();
  });

  it("renders the outage banner when enabled", async () => {
    mockFetchConfig.mockResolvedValue({
      bannerUpdateIssue: false,
      bannerOutage: true,
    });

    await act(async () => {
      renderWithProviders(<AlertBanners />);
    });

    expect(
      screen.getByText(/system outage that is preventing data from updating/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/preventing the application from updating/i),
    ).not.toBeInTheDocument();
  });

  it("renders both banners when both are enabled", async () => {
    mockFetchConfig.mockResolvedValue({
      bannerUpdateIssue: true,
      bannerOutage: true,
    });

    await act(async () => {
      renderWithProviders(<AlertBanners />);
    });

    expect(
      screen.getByText(/preventing the application from updating/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/system outage that is preventing data from updating/i),
    ).toBeInTheDocument();
  });

  it("renders nothing when config fetch fails", async () => {
    mockFetchConfig.mockRejectedValue(new Error("Network error"));

    let container!: HTMLElement;
    await act(async () => {
      ({ container } = renderWithProviders(<AlertBanners />));
    });

    expect(mockFetchConfig).toHaveBeenCalled();
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });

  it("uses warning variant for banners", async () => {
    mockFetchConfig.mockResolvedValue({
      bannerUpdateIssue: true,
      bannerOutage: false,
    });

    let container!: HTMLElement;
    await act(async () => {
      ({ container } = renderWithProviders(<AlertBanners />));
    });

    const banner = container.querySelector('[role="alert"]');
    expect(banner).not.toBeNull();
    expect((banner as HTMLElement).dataset.variant).toBe("warning");
  });
});
