import { start } from "../server.js";

try {
  await start();
} catch (error) {
  console.error("Startup error:", error);
  process.exit(1);
}
