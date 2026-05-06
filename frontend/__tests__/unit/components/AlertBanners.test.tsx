import { describe, it, expect, vi, afterEach } from "vitest";
import { screen, act } from "@testing-library/react";
import { renderWithProviders } from "../../helpers/testHelpers";
import type { AppConfig } from "../../../src/utils/config";

// Each test re-imports AlertBanners in isolation so the module-level
// configPromise is recreated with the correct mock value for that test.
async function setup(config: AppConfig) {
  const fetchConfig = vi.fn().mockResolvedValue(config);
  vi.doMock("../../../src/utils/config", () => ({ fetchConfig }));

  const { default: AlertBanners } =
    await import("../../../src/components/AlertBanners");

  return { AlertBanners, fetchConfig };
}

describe("AlertBanners", () => {
  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("renders nothing when both banners are disabled", async () => {
    const { AlertBanners, fetchConfig } = await setup({
      bannerUpdateIssue: false,
      bannerOutage: false,
    });

    let container!: HTMLElement;
    await act(async () => {
      ({ container } = renderWithProviders(<AlertBanners />));
    });

    expect(fetchConfig).toHaveBeenCalled();
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });

  it("renders the update issue banner when enabled", async () => {
    const { AlertBanners } = await setup({
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
    const { AlertBanners } = await setup({
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
    const { AlertBanners } = await setup({
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
    const fetchConfig = vi.fn().mockRejectedValue(new Error("Network error"));
    vi.doMock("../../../src/utils/config", () => ({ fetchConfig }));

    const { default: AlertBanners } =
      await import("../../../src/components/AlertBanners");

    let container!: HTMLElement;
    await act(async () => {
      ({ container } = renderWithProviders(<AlertBanners />));
    });

    expect(fetchConfig).toHaveBeenCalled();
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });

  it("uses warning variant for banners", async () => {
    const { AlertBanners } = await setup({
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

  it("only fetches config once regardless of re-renders", async () => {
    const { AlertBanners, fetchConfig } = await setup({
      bannerUpdateIssue: false,
      bannerOutage: false,
    });

    await act(async () => {
      renderWithProviders(<AlertBanners />);
    });
    await act(async () => {
      renderWithProviders(<AlertBanners />);
    });
    await act(async () => {
      renderWithProviders(<AlertBanners />);
    });

    // fetchConfig must be called exactly once — the promise is module-level.
    // If this fails it means fetchConfig was moved inside the component,
    // which would cause a request loop when Suspense retries.
    expect(fetchConfig).toHaveBeenCalledTimes(1);
  });
});
