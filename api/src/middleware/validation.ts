import { Request, Response, NextFunction } from "express";
import {
  param,
  validationResult,
  ValidationError as ExpressValidationError,
} from "express-validator";

export class HttpError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = "HttpError";

    // Validate and sanitize status code
    this.statusCode = this.validateStatusCode(statusCode);

    // Maintains proper stack trace for V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError);
    }
  }

  private validateStatusCode(code: number): number {
    // Check if status code is valid (HTTP status codes are 100-599)
    const isValidStatusCode =
      Number.isInteger(code) &&
      Number.isFinite(code) &&
      code >= 100 &&
      code <= 599;

    return isValidStatusCode ? code : 500;
  }
}

/**
 * Formats express-validator errors into a clean array.
 */
const formatValidationErrors = (errors: ExpressValidationError[]) =>
  errors.map((error) => {
    if (error.type === "field") {
      const { location, path: field, msg: message, value } = error;
      return { field, location, message, value };
    }
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
    .isLength({ min: 1, max: 16 })
    .withMessage("Cheque number must be between 1 and 16 characters")
    .bail()
    .isNumeric({ no_symbols: true })
    .withMessage("Cheque number must contain only digits")
    .bail()
    .custom((value) => {
      // Reject zero as invalid cheque number
      if (value === "0" || parseInt(value, 10) === 0) {
        throw new Error("Cheque number must be greater than zero");
      }
      return true;
    }),
  // Note: Removed .toInt() to preserve string format and avoid precision loss

  handleValidationErrors,
];
