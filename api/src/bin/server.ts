import { start } from "../server.js";
import logger from "../config/logger.js";

export type StartFunction = () => Promise<unknown>;

export async function run(startFn: StartFunction = start): Promise<void> {
  try {
    await startFn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error({ message });
    process.exit(1);
  }
}

export function autoStart(startFn?: StartFunction): boolean {
  if (process.env.CHEQUE_VERIFICATION_SKIP_AUTO_START === "true") {
    return false;
  }

  void run(startFn ?? start);
  return true;
}

export const hasAutoStarted = autoStart();
