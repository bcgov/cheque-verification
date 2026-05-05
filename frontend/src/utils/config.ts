export interface AppConfig {
  bannerUpdateIssue: boolean;
  bannerOutage: boolean;
}

/**
 * Fetches runtime configuration from the Caddy /config.json endpoint.
 * Returns banner toggle states based on environment variables set in OpenShift.
 * Fails safely — returns all banners disabled on error.
 */
export async function fetchConfig(): Promise<AppConfig> {
  try {
    const response = await fetch("/config.json");
    if (!response.ok) {
      return { bannerUpdateIssue: false, bannerOutage: false };
    }
    const data = await response.json();
    return {
      bannerUpdateIssue: data.bannerUpdateIssue === "true",
      bannerOutage: data.bannerOutage === "true",
    };
  } catch {
    return { bannerUpdateIssue: false, bannerOutage: false };
  }
}
