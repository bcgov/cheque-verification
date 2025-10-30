import pino, { Logger } from "pino";

const redactedFields = [
  "req.headers.authorization",
  "req.headers.cookie",
  "req.cookies",
  "res.headers.set-cookie",
  "password",
  "token",
  "secret",
];

export const logger: Logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  base: {
    service: "cheque-verification-api",
  },
  redact: redactedFields,
});

export default logger;
