import pino from "pino";

const redactedFields = [
  "req.headers.authorization",
  "req.headers.cookie",
  "req.cookies",
  "res.headers.set-cookie",
  "password",
  "token",
  "secret",
  "chequeNumber",
  "appliedAmount",
  "paymentIssueDate",
];

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  base: {
    service: "cheque-verification-backend",
  },
  redact: redactedFields,
});
