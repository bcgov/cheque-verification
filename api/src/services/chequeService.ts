import oracledb from "oracledb";
import { ChequeStatus, ApiResponse } from "../types";
import { getDbPool } from "../config/database";

export async function getChequeFromDatabase(
  chequeNumber: string
): Promise<ApiResponse<ChequeStatus>> {
  let connection;
  try {
    const dbPool = getDbPool();
    connection = await dbPool.getConnection();

    // Simple query that only selects cheque_number and status
    const result = await connection.execute(
      `SELECT 
        CHEQUE_NUMBER, 
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

    // Minimal response with only cheque number and status
    const chequeStatus: ChequeStatus = {
      chequeNumber: row.CHEQUE_NUMBER,
      chequeStatus: row.CHEQUE_STATUS,
    };

    return { success: true, data: chequeStatus };
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
