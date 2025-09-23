import { start } from "../server.js";

export async function run(): Promise<void> {
  try {
    await start();
  } catch (error) {
    console.error("Startup error:", error);
    process.exit(1);
  }
}

if (process.env.CHECK_VERIFICATION_SKIP_AUTO_START !== "true") {
  void run();
}
