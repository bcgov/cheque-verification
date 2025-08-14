import { InlineAlert as BCGovInlineAlert } from "@bcgov/design-system-react-components";

/**
 * Props for the InlineAlert component
 */
interface InlineAlertProps {
  /** The variant/type of alert (info, success, warning, danger) */
  variant?: "info" | "success" | "warning" | "danger";
  /** The title of the alert */
  title?: string;
  /** The description/message content */
  description?: string;
}

/**
 * BC Gov InlineAlert component wrapper
 *
 * A reusable alert component that displays important status or informational messages
 * in a visually distinctive way. Uses the official BC Gov Design System component.
 *
 * @param props - The props for the InlineAlert component
 * @returns The rendered InlineAlert component
 */
export const InlineAlert: React.FC<InlineAlertProps> = ({
  variant = "danger",
  title = "Error",
  description,
}) => {
  if (!description) return null;

  // For success variant, render our own styled version to avoid box-in-box
  if (variant === "success") {
    return (
      <div
        style={{
          whiteSpace: "pre-line",
          padding: "16px",
          backgroundColor: "var(--bcgov-success-background, #d4edda)",
          border: "1px solid var(--bcgov-success-border, #c3e6cb)",
          borderRadius: "6px",
          borderLeft: "4px solid var(--bcgov-success-border, #28a745)",
          fontFamily: "BCSans, sans-serif",
        }}
      >
        <div
          style={{
            fontWeight: "600",
            marginBottom: "4px",
            color: "var(--bcgov-text-primary, #313132)",
          }}
        >
          {title}
        </div>
        <div style={{ color: "var(--bcgov-text-primary, #313132)" }}>
          {description}
        </div>
      </div>
    );
  }

  // For other variants (danger, warning, info), use BC Gov component
  return (
    <div style={{ whiteSpace: "pre-line" }}>
      <BCGovInlineAlert
        variant={variant}
        title={title}
        description={description}
      />
    </div>
  );
};

export default InlineAlert;
