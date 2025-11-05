import { jest } from "@jest/globals";

const modulePath = "../../../src/bin/server.js";

// Mock the logger module
jest.mock("../../../src/config/logger.js", () => ({
  default: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    child: jest.fn().mockReturnThis(),
  },
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    child: jest.fn().mockReturnThis(),
  },
}));

function setSkipFlag(value: string | undefined) {
  if (typeof value === "string") {
    process.env.CHECK_VERIFICATION_SKIP_AUTO_START = value;
  } else {
    delete process.env.CHECK_VERIFICATION_SKIP_AUTO_START;
  }
}

describe("bin/server", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    setSkipFlag("true");
  });

  afterEach(() => {
    setSkipFlag(undefined);
  });

  it("runs the provided start function", async () => {
    const { run } = await import(modulePath);
    const startFn = jest.fn(async () => undefined);

    await expect(run(startFn)).resolves.toBeUndefined();
    expect(startFn).toHaveBeenCalledTimes(1);
  });

  it("logs and exits when the start function rejects", async () => {
    // Import the mocked logger first to ensure mock is in place
    const loggerModule = await import("../../../src/config/logger.js");
    const logger = loggerModule.default;

    // Reset the mock to clear any previous calls
    (logger.error as jest.Mock).mockClear();

    const { run } = await import(modulePath);
    const startError = new Error("startup failure");
    const startFn = jest.fn(async () => {
      throw startError;
    });
    const exitSpy = jest
      .spyOn(process, "exit")
      .mockImplementation((() => undefined) as unknown as typeof process.exit);

    await expect(run(startFn)).resolves.toBeUndefined();

    expect(startFn).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(
      { err: startError },
      "Startup error"
    );
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
  });

  it("autoStart returns false when the skip flag is set", async () => {
    const { autoStart } = await import(modulePath);
    const startFn = jest.fn(async () => undefined);

    expect(autoStart(startFn)).toBe(false);
    expect(startFn).not.toHaveBeenCalled();
  });

  it("autoStart invokes start when the skip flag is absent", async () => {
    const { autoStart } = await import(modulePath);
    setSkipFlag(undefined);
    const startFn = jest.fn(async () => undefined);

    expect(autoStart(startFn)).toBe(true);
    await Promise.resolve();
    expect(startFn).toHaveBeenCalledTimes(1);
  });

  it("exposes hasAutoStarted reflecting the skip guard", async () => {
    const { hasAutoStarted } = await import(modulePath);
    expect(hasAutoStarted).toBe(false);
  });
});
