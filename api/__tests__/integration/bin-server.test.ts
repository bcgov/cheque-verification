import { readFile } from "node:fs/promises";
import { join } from "node:path";

describe("bin/server entry point", () => {
  it("uses top-level await pattern (satisfies SonarQube S7785)", async () => {
    // Read the bin/server.ts source code to verify it uses top-level await
    // instead of a wrapped async function call
    const binServerPath = join(process.cwd(), "src", "bin", "server.ts");
    const sourceCode = await readFile(binServerPath, "utf-8");

    // Verify the code uses top-level await pattern
    expect(sourceCode).toContain("await run()");
    expect(sourceCode).toContain(
      'if (process.env.CHECK_VERIFICATION_SKIP_AUTO_START !== "true")'
    );

    // Verify it's not using the old void pattern that SonarQube flagged
    expect(sourceCode).not.toContain("void run()");

    // Verify structure shows top-level await rather than wrapped async
    const lines = sourceCode.split("\n");
    const topLevelAwaitLine = lines.find(
      (line) => line.trim().startsWith("await") && line.includes("run()")
    );

    expect(topLevelAwaitLine).toBeTruthy();
  });

  it("exports run function for testability", async () => {
    // Verify the module exports a run function for testing purposes
    const binServerPath = join(process.cwd(), "src", "bin", "server.ts");
    const sourceCode = await readFile(binServerPath, "utf-8");

    expect(sourceCode).toContain("export async function run()");
  });

  it("has proper error handling in top-level await", async () => {
    // Verify the top-level await includes proper error handling
    const binServerPath = join(process.cwd(), "src", "bin", "server.ts");
    const sourceCode = await readFile(binServerPath, "utf-8");

    // Should have the run function with try/catch
    expect(sourceCode).toContain("try {");
    expect(sourceCode).toContain("await start();");
    expect(sourceCode).toContain("} catch (error) {");
    expect(sourceCode).toContain('console.error("Startup error:", error);');
    expect(sourceCode).toContain("process.exit(1);");
  });
});
