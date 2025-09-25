import {
  Header as BCGovHeader,
  Button,
} from "@bcgov/design-system-react-components";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * BC Gov header component using the official design system
 * Follows BC Gov Design System standards with proper accessibility features
 * Includes contextual navigation between home and FAQ pages
 */
const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = () => {
    if (location.pathname === "/") {
      navigate("/faq");
    } else {
      navigate("/");
    }
  };

  const getButtonText = () => {
    return location.pathname === "/" ? "FAQ" : "← Back to Home";
  };

  return (
    <BCGovHeader title="Cheque Verification">
      <Button
        variant="primary"
        onClick={handleNavigation}
        style={{
          backgroundColor: "var(--bcgov-blue)",
          border: "1px solid var(--bcgov-blue)",
          color: "var(--bcgov-text-white)",
        }}
      >
        {getButtonText()}
      </Button>
    </BCGovHeader>
  );
};

export default Header;
