import { start } from "../server.js";

// Export a run function for testing purposes
export async function run(): Promise<void> {
  try {
    await start();
  } catch (error) {
    console.error("Startup error:", error);
    process.exit(1);
  }
}

// Use top-level await for cleaner async handling
if (process.env.CHECK_VERIFICATION_SKIP_AUTO_START !== "true") {
  await run();
}
