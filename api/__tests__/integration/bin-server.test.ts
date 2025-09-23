import { jest } from "@jest/globals";

const binModuleSpec = "../../src/bin/server.js";
const serverModuleSpec = "../../src/server.js";

function clearEnv() {
  delete process.env.CHECK_VERIFICATION_SKIP_AUTO_START;
}

describe("bin/server entry point", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    clearEnv();
  });

  afterEach(() => {
    clearEnv();
  });

  it("auto starts by default", async () => {
    const serverModule = await import(serverModuleSpec);
    const startSpy = jest
      .spyOn(serverModule, "start")
      .mockResolvedValue(undefined as never);
    const exitSpy = jest
      .spyOn(process, "exit")
      .mockImplementation((() => undefined) as unknown as typeof process.exit);

    await import(binModuleSpec);

    expect(startSpy).toHaveBeenCalledTimes(1);
    expect(exitSpy).not.toHaveBeenCalled();

    startSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it("allows opting out of auto start via env", async () => {
    process.env.CHECK_VERIFICATION_SKIP_AUTO_START = "true";

    const serverModule = await import(serverModuleSpec);
    const startSpy = jest
      .spyOn(serverModule, "start")
      .mockResolvedValue(undefined as never);

    const module = await import(binModuleSpec);

    expect(startSpy).not.toHaveBeenCalled();

    await module.run();
    expect(startSpy).toHaveBeenCalledTimes(1);

    startSpy.mockRestore();
  });

  it("logs and exits when start rejects", async () => {
    process.env.CHECK_VERIFICATION_SKIP_AUTO_START = "true";

    const startError = new Error("startup failure");
    const serverModule = await import(serverModuleSpec);
    const startSpy = jest
      .spyOn(serverModule, "start")
      .mockRejectedValue(startError);
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    const exitSpy = jest
      .spyOn(process, "exit")
      .mockImplementation((() => undefined) as unknown as typeof process.exit);

    const module = await import(binModuleSpec);
    await module.run();

    expect(startSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith("Startup error:", startError);
    expect(exitSpy).toHaveBeenCalledWith(1);

    startSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    exitSpy.mockRestore();
  });
});
