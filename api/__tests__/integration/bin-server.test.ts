import { readFile } from "node:fs/promises";
import { join } from "node:path";

describe("bin/server entry point", () => {
  const binServerPath = join(process.cwd(), "src", "bin", "server.ts");

  it("provides explicit run and autoStart exports", async () => {
    const sourceCode = await readFile(binServerPath, "utf-8");

    expect(sourceCode).toContain("export async function run(");
    expect(sourceCode).toContain("export function autoStart(");
    expect(sourceCode).toContain("export const hasAutoStarted");
  });

  it("guards auto-start behind the environment flag", async () => {
    const sourceCode = await readFile(binServerPath, "utf-8");

    expect(sourceCode).toContain(
      'if (process.env.CHECK_VERIFICATION_SKIP_AUTO_START === "true")'
    );
    expect(sourceCode).toContain("return false;");
    expect(sourceCode).toContain("void run(startFn ?? start);");
  });

  it("continues to surface startup errors", async () => {
    const sourceCode = await readFile(binServerPath, "utf-8");

    expect(sourceCode).toContain("try {");
    expect(sourceCode).toContain("await startFn();");
    expect(sourceCode).toContain(
      'logger.error({ err: error }, "Startup error");'
    );
    expect(sourceCode).toContain("process.exit(1);");
  });
});
