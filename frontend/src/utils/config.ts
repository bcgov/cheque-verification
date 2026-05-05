export interface AppConfig {
  bannerUpdateIssue: boolean;
  bannerOutage: boolean;
}

const DEFAULT_CONFIG: AppConfig = {
  bannerUpdateIssue: false,
  bannerOutage: false,
};

/**
 * Fetches runtime configuration from the Caddy /config.json endpoint.
 * Returns banner toggle states based on environment variables set in OpenShift.
 * Fails safely — returns all banners disabled on error.
 */
export async function fetchConfig(): Promise<AppConfig> {
  try {
    const response = await fetch("/config.json");
    if (!response.ok) {
      return DEFAULT_CONFIG;
    }
    const data = (await response.json()) as Partial<AppConfig>;
    return {
      bannerUpdateIssue: data.bannerUpdateIssue === true,
      bannerOutage: data.bannerOutage === true,
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}
