import oracledb from "oracledb";
import { ChequeStatusResponse } from "../types";
import { getDbPool } from "../config/database";

export async function getChequeFromDatabase(
  chequeNumber: string
): Promise<ChequeStatusResponse> {
  let connection;
  try {
    const dbPool = getDbPool();
    connection = await dbPool.getConnection();

    // Query only returns the status - no need to select cheque number
    const result = await connection.execute(
      `SELECT 
        CHEQUE_STATUS
      FROM ods.irsd_cheque_verification
      WHERE CHEQUE_NUMBER = :chequeNumber`,
      { chequeNumber },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!result.rows || result.rows.length === 0) {
      const error = new Error("Cheque not found");
      (error as any).statusCode = 404;
      throw error;
    }

    // Oracle returns column names in uppercase by default
    const row = result.rows[0] as Record<string, any>;

    // Sanitized response - only return status
    return {
      chequeStatus: row.CHEQUE_STATUS,
    };
  } catch (error) {
    // Re-throw errors that already have status codes
    if ((error as any).statusCode) {
      throw error;
    }
    // Wrap database errors
    const dbError = new Error("Failed to retrieve cheque information");
    (dbError as any).statusCode = 500;
    throw dbError;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.warn("Failed to close database connection:", err);
      }
    }
  }
}
