import oracledb from "oracledb";
import { ChequeStatusResponse } from "../types.js";
import { getDbPool } from "../config/database.js";
import { HttpError } from "../middleware/validation.js";

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
    throw new Error(
      "Database schema and table not configured in environment variables"
    );
  }

  try {
    const dbPool = getDbPool();
    connection = await dbPool.getConnection();

    result = await connection.execute<ChequeRow>(
      `SELECT CHEQUE_STATUS_OUTPUT, CHEQUE_NUMBER, PAYMENT_ISSUE_DT, APPLIED_AMOUNT
       FROM ${schema}.${table}
       WHERE CHEQUE_NUMBER = :chequeNumber`,
      { chequeNumber },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
  } catch (error) {
    console.error("Database error in getChequeFromDatabase:", error);
    throw new Error("Failed to retrieve cheque information");
  } finally {
    await closeConnection(connection);
  }

  if (!result?.rows?.length) {
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
      console.warn("Failed to close database connection:", err);
    }
  }
}
