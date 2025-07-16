import { Request, Response, NextFunction } from "express";
import { param, validationResult, ValidationError } from "express-validator";

/**
 * Formats express-validator errors into a clean array.
 */
const formatValidationErrors = (errors: ValidationError[]) =>
  errors.map((error) => {
    if (error.type === "field") {
      const { location, path: field, msg: message, value } = error;
      return {
        field,
        location,
        message,
        value,
      };
    }

    // Handle other error types (unknown fields, alternatives, etc.)
    return {
      field: "unknown",
      location: "unknown",
      message: error.msg || "Validation error",
      value: undefined,
    };
  });

// Validation error handler
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: "Invalid input",
      details: formatValidationErrors(result.array()),
    });
  }
  next();
};

// Validation rules for cheque number
export const validateChequeNumber = [
  param("chequeNumber")
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage("Cheque number must be between 1 and 20 characters")
    .bail() // Stop on first error
    .isInt({ min: 1 })
    .withMessage("Cheque number must be a positive integer")
    .toInt(), // Convert to integer

  handleValidationErrors, // Reusable error handler
];
