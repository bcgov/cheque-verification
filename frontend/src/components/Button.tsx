import { Button as BCGovButton } from "@bcgov/design-system-react-components";

/**
 * BC Gov button component using the official design system
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {"primary" | "secondary" | "tertiary" | "link"} props.variant - Button variant
 * @param {"medium" | "small"} props.size - Button size
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {boolean} props.isLoading - Whether button is in loading state
 * @param {() => void} props.onPress - Click handler
 * @param {string} props.type - Button type for forms
 */
interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "tertiary" | "link";
  size?: "medium" | "small";
  disabled?: boolean;
  isLoading?: boolean;
  onPress?: () => void;
  type?: "button" | "submit" | "reset";
}

const Button = ({
  children,
  variant = "primary",
  size = "medium",
  disabled = false,
  isLoading = false,
  onPress,
  type = "button",
  ...props
}: ButtonProps) => (
  <BCGovButton
    variant={variant}
    size={size}
    isDisabled={disabled || isLoading}
    onPress={onPress}
    type={type}
    {...props}
  >
    {isLoading ? "Loading..." : children}
  </BCGovButton>
);

export default Button;
