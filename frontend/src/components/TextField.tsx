import { TextField as BCGovTextField } from "@bcgov/design-system-react-components";

/**
 * Props for the TextField component
 */
interface TextFieldProps {
  /** The input label */
  label: string;
  /** The input value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Input type (text, email, number, date, etc.) */
  type?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Error message to display */
  errorMessage?: string;
}

/**
 * BC Gov TextField component wrapper
 *
 * A text input component that enables users to enter text into an interface.
 * Uses the official BC Gov Design System component for consistent styling
 * and accessibility compliance.
 *
 * @param props - The props for the TextField component
 * @returns The rendered TextField component
 */
export const TextField: React.FC<TextFieldProps> = ({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  errorMessage,
}) => {
  return (
    <BCGovTextField
      label={label}
      value={value}
      onChange={onChange}
      type={type}
      isRequired={required}
      errorMessage={errorMessage}
    />
  );
};

export default TextField;
