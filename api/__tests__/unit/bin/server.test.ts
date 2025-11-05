import { jest } from "@jest/globals";

const modulePath = "../../../src/bin/server.js";

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
