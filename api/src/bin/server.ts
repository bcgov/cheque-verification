import { start } from "../server.js";

export type StartFunction = () => Promise<unknown>;

export async function run(startFn: StartFunction = start): Promise<void> {
  try {
    await startFn();
  } catch (error) {
    console.error("Startup error:", error);
    process.exit(1);
  }
}

export function autoStart(startFn?: StartFunction): boolean {
  if (process.env.CHECK_VERIFICATION_SKIP_AUTO_START === "true") {
    return false;
  }

  void run(startFn ?? start);
  return true;
}

export const hasAutoStarted = autoStart();
