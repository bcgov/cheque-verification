import oracledb from "oracledb";
import { ChequeStatusResponse, ApiResponse } from "../types";
import { getDbPool } from "../config/database";

export async function getChequeFromDatabase(
  chequeNumber: string
): Promise<ApiResponse<ChequeStatusResponse>> {
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
      return { success: false, error: "Cheque not found" };
    }

    // Oracle returns column names in uppercase by default
    const row = result.rows[0] as Record<string, any>;

    // Sanitized response - only return status, not the cheque number
    const chequeStatusResponse: ChequeStatusResponse = {
      chequeStatus: row.CHEQUE_STATUS,
    };

    return { success: true, data: chequeStatusResponse };
  } catch (error) {
    return { success: false, error: "Database error" };
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {}
    }
  }
}
