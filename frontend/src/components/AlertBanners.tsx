import { use, useState, Suspense } from "react";
import { AlertBanner } from "@bcgov/design-system-react-components";
import { fetchConfig } from "../utils/config";
import type { AppConfig } from "../utils/config";

/**
 * Inner component that suspends until runtime config is resolved.
 * Renders warning banners based on environment variables set in OpenShift:
 * - BANNER_UPDATE_ISSUE="true" — shows the update issue banner
 * - BANNER_OUTAGE="true" — shows the system outage banner
 */
function AlertBannersContent() {
  const [configPromise] = useState<Promise<AppConfig>>(() => fetchConfig());
  const config = use(configPromise);

  if (!config.bannerUpdateIssue && !config.bannerOutage) {
    return null;
  }

  return (
    <div style={{ width: "100%" }}>
      {config.bannerUpdateIssue && (
        <AlertBanner variant="warning" isCloseable={false}>
          We are currently experiencing an issue that is preventing the
          application from updating. Our team is working to fix the problem.
          Some information may be out of date until this is resolved.
        </AlertBanner>
      )}
      {config.bannerOutage && (
        <AlertBanner variant="warning" isCloseable={false}>
          We are experiencing a system outage that is preventing data from
          updating. Our team is actively working to restore service. Some
          information in the application may appear out of date until this is
          resolved. At this time, we are unable to verify any cheques from the
          previous business day. Phone and portal services will be restored as
          soon as possible.
        </AlertBanner>
      )}
    </div>
  );
}

/**
 * Wraps AlertBannersContent in a Suspense boundary so the rest of the app
 * renders immediately while the config fetch is in flight.
 */
export default function AlertBanners() {
  return (
    <Suspense fallback={null}>
      <AlertBannersContent />
    </Suspense>
  );
}
