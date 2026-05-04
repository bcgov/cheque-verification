import { AlertBanner } from "@bcgov/design-system-react-components";

const OutageBanner = () => {
  return (
    <AlertBanner variant="danger" isIconHidden={true} isCloseable={false}>
      <p>
        Please be advised that the system will be undergoing a scheduled update
        on May 7, 2026. The system is expected to be back online by 2:00 PM. We
        apologize for any inconvenience and appreciate your patience.
      </p>
    </AlertBanner>
  );
};

export default OutageBanner;
