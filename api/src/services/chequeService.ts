import oracledb from "oracledb";
import { ChequeStatusResponse } from "../types.js";
import { getDbPool } from "../config/database.js";
import { HttpError } from "../middleware/validation.js";
import { logger } from "../config/logger.js";

// Define the database row type for better type safety
interface ChequeRow {
  CHEQUE_STATUS_OUTPUT: string;
  CHEQUE_NUMBER: string; // Changed from number to string to avoid precision loss
  PAYMENT_ISSUE_DT: Date;
  APPLIED_AMOUNT: number;
}

export async function getChequeFromDatabase(
  chequeNumber: string
): Promise<ChequeStatusResponse> {
  let connection: oracledb.Connection | undefined;
  let result: oracledb.Result<ChequeRow> | undefined;

  const schema = process.env.DB_SCHEMA;
  const table = process.env.DB_TABLE;

  if (!schema || !table) {
    logger.error({ message: "Database configuration missing" });
    throw new Error("Database configuration missing");
  }

  logger.info(
    {
      chequeNumberLength: chequeNumber?.length || 0,
      hasSchema: !!schema,
      hasTable: !!table,
    },
    "Starting cheque database query"
  );

  try {
    const dbPool = getDbPool();
    connection = await dbPool.getConnection();

    logger.info("Database connection established");

    result = await connection.execute<ChequeRow>(
      `SELECT CHEQUE_STATUS_OUTPUT, CHEQUE_NUMBER, PAYMENT_ISSUE_DT, APPLIED_AMOUNT
       FROM ${schema}.${table}
       WHERE CHEQUE_NUMBER = :chequeNumber`,
      { chequeNumber },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    logger.info(
      {
        rowCount: result?.rows?.length || 0,
        hasResult: !!result?.rows?.length,
      },
      "Database query completed"
    );

    // Log result status (without sensitive data) for debugging
    if (result?.rows?.length) {
      logger.info(
        {
          hasStatusOutput: !!result.rows[0].CHEQUE_STATUS_OUTPUT,
          hasPaymentDate: !!result.rows[0].PAYMENT_ISSUE_DT,
          hasAmount: !!result.rows[0].APPLIED_AMOUNT,
          resultNumberLength: result.rows[0].CHEQUE_NUMBER?.length || 0,
        },
        "Query result found"
      );
    } else {
      logger.warn("No rows returned from database query");
    }
  } catch (error) {
    throw new Error("Failed to retrieve cheque information");
  } finally {
    await closeConnection(connection);
  }

  if (!result?.rows?.length) {
    logger.warn("Cheque not found in database");
    throw new HttpError("Cheque not found", 404);
  }

  const row = result.rows[0];
  return {
    chequeStatus: row.CHEQUE_STATUS_OUTPUT,
    chequeNumber: row.CHEQUE_NUMBER,
    paymentIssueDate: row.PAYMENT_ISSUE_DT,
    appliedAmount: row.APPLIED_AMOUNT,
  };
}

// Extract connection cleanup into a separate function
async function closeConnection(
  connection: oracledb.Connection | undefined
): Promise<void> {
  if (connection) {
    try {
      await connection.close();
    } catch (err) {
      logger.warn({ message: "Failed to close database connection" });
    }
  }
}
