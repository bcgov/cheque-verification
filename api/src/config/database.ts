import oracledb from "oracledb";

let pool: oracledb.Pool | null = null;

export function getRequired(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error("Missing required environment variable");
  return v;
}

export async function initializeDbPool(): Promise<oracledb.Pool> {
  if (pool) return pool;

  const user = getRequired("ORACLE_USER");
  const password = getRequired("ORACLE_PASSWORD");
  const connectString = getRequired("ORACLE_CONNECTION_STRING");

  pool = await oracledb.createPool({
    user,
    password,
    connectString,
    poolMin: 0,
    poolMax: 4,
    poolIncrement: 1,
    stmtCacheSize: 40,
  });

  // Set Oracle output format to object for easier handling
  oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

  return pool;
}

export function getDbPool(): oracledb.Pool {
  if (!pool) throw new Error("DB pool not initialized");
  return pool;
}

export async function closeDbPool(): Promise<void> {
  if (pool) {
    await pool.close(0);
    pool = null;
  }
}
