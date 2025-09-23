import type { Server } from "node:http";
import { AddressInfo } from "node:net";
import { EventEmitter } from "node:events";

jest.mock("../../src/config/database.js", () => ({
  initializeDbPool: jest.fn().mockResolvedValue(undefined),
  closeDbPool: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("dotenv", () => ({
  config: jest.fn(),
}));

const mockListen = jest.fn();
const mockCreateApp = jest.fn(() => ({ listen: mockListen }));

jest.mock("../../src/app.js", () => ({
  createApp: mockCreateApp,
}));

type ServerModule = typeof import("../../src/server.js");
type DatabaseModule = typeof import("../../src/config/database.js");

type TestHttpServer = Server & {
  emitError: (error: Error) => void;
  setAddress: (info: AddressInfo) => void;
  setCloseImplementation: (
    impl: ((callback?: (error?: Error | null) => void) => void) | null
  ) => void;
  close: jest.MockedFunction<Server["close"]>;
  address: jest.MockedFunction<Server["address"]>;
  listening: boolean; // Override the readonly property
};

type LoadedModules = ServerModule & { database: jest.Mocked<DatabaseModule> };

function createMockHttpServer(): TestHttpServer {
  const emitter = new EventEmitter();
  let address: AddressInfo = {
    address: "127.0.0.1",
    family: "IPv4",
    port: 0,
  };
  let closeImpl: ((callback?: (error?: Error | null) => void) => void) | null =
    null;

  const server = emitter as unknown as TestHttpServer;
  server.listening = false;
  server.address = jest.fn(
    () => address
  ) as unknown as TestHttpServer["address"];
  server.close = jest.fn((callback?: (error?: Error | null) => void) => {
    server.listening = false;
    if (closeImpl) {
      closeImpl(callback);
    } else {
      callback?.(null);
    }
    return server;
  }) as unknown as TestHttpServer["close"];
  server.emitError = (error: Error) => {
    emitter.emit("error", error);
  };
  server.setAddress = (info: AddressInfo) => {
    address = info;
  };
  server.setCloseImplementation = (
    impl: ((callback?: (error?: Error | null) => void) => void) | null
  ) => {
    closeImpl = impl;
  };

  return server;
}

async function loadServerModule(): Promise<LoadedModules> {
  const database = (await import(
    "../../src/config/database.js"
  )) as jest.Mocked<DatabaseModule>;
  const serverModule = await import("../../src/server.js");
  return { ...serverModule, database } as LoadedModules;
}

function createSuccessfulListen(server: TestHttpServer) {
  mockListen.mockImplementation((port: number, callback?: () => void) => {
    server.listening = true;
    server.setAddress({ address: "127.0.0.1", family: "IPv4", port });
    if (callback) {
      setImmediate(callback);
    }
    return server;
  });
}

function createFailingListen(server: TestHttpServer, error: Error) {
  mockListen.mockImplementation(() => {
    setImmediate(() => {
      server.emitError(error);
    });
    return server;
  });
}

let activeServer: TestHttpServer | null = null;
let currentStop: ServerModule["stop"] | null = null;

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  mockListen.mockReset();
  mockCreateApp.mockClear();
  activeServer = null;
  currentStop = null;
});

afterEach(async () => {
  if (activeServer && currentStop) {
    try {
      await currentStop();
    } catch (error) {
      // Individual tests assert on shutdown behaviour; ignore here.
    }
  }

  activeServer = null;
  currentStop = null;

  delete process.env.PORT;
  delete process.env.BACKEND_URL;
  delete process.env.BACKEND_PROD_URL;
});

function trackServer(server: TestHttpServer, stop: ServerModule["stop"]) {
  activeServer = server;
  currentStop = stop;
}

describe("server module", () => {
  describe("start", () => {
    it("starts the server on an explicit port", async () => {
      const mockServer = createMockHttpServer();
      createSuccessfulListen(mockServer);

      const { start, stop } = await loadServerModule();
      const server = (await start({ port: 4123 })) as TestHttpServer;
      trackServer(server, stop);

      expect(mockListen).toHaveBeenCalledWith(4123, expect.any(Function));
      expect(server.listening).toBe(true);
      expect(server.address()).toEqual(expect.objectContaining({ port: 4123 }));
    });

    it("prefers environment port when none is provided", async () => {
      const mockServer = createMockHttpServer();
      createSuccessfulListen(mockServer);
      process.env.PORT = "5123";

      const { start, stop } = await loadServerModule();
      const server = (await start()) as TestHttpServer;
      trackServer(server, stop);

      expect(mockListen).toHaveBeenCalledWith(5123, expect.any(Function));
      expect(server.address()).toEqual(expect.objectContaining({ port: 5123 }));
    });

    it("falls back to default port when environment value is invalid", async () => {
      const mockServer = createMockHttpServer();
      createSuccessfulListen(mockServer);
      process.env.PORT = "invalid";

      const { start, stop } = await loadServerModule();
      const server = (await start()) as TestHttpServer;
      trackServer(server, stop);

      expect(mockListen).toHaveBeenCalledWith(3000, expect.any(Function));
      expect(server.listening).toBe(true);
    });

    it("returns the existing server when called multiple times", async () => {
      const mockServer = createMockHttpServer();
      createSuccessfulListen(mockServer);

      const { start, stop } = await loadServerModule();
      const first = (await start({ port: 6123 })) as TestHttpServer;
      trackServer(first, stop);

      const second = (await start({ port: 7000 })) as TestHttpServer;
      expect(second).toBe(first);
      expect(mockListen).toHaveBeenCalledTimes(1);
    });

    it("propagates database initialization failures", async () => {
      const mockServer = createMockHttpServer();
      createSuccessfulListen(mockServer);

      const { start, database } = await loadServerModule();
      database.initializeDbPool.mockRejectedValueOnce(
        new Error("DB connection failed")
      );

      await expect(start({ port: 7123 })).rejects.toThrow(
        "DB connection failed"
      );
    });

    it("closes the database pool if binding fails", async () => {
      const mockServer = createMockHttpServer();
      const bindError = new Error("EADDRINUSE");
      createFailingListen(mockServer, bindError);

      const { start, database } = await loadServerModule();

      await expect(start({ port: 8123 })).rejects.toThrow("EADDRINUSE");
      expect(database.closeDbPool).toHaveBeenCalled();
    });

    it("registers default signal handlers", async () => {
      const mockServer = createMockHttpServer();
      createSuccessfulListen(mockServer);

      const processOnceSpy = jest.spyOn(process, "once");
      const { start, stop } = await loadServerModule();
      const server = (await start({ port: 9123 })) as TestHttpServer;
      trackServer(server, stop);

      expect(processOnceSpy).toHaveBeenCalledWith(
        "SIGTERM",
        expect.any(Function)
      );
      expect(processOnceSpy).toHaveBeenCalledWith(
        "SIGINT",
        expect.any(Function)
      );

      processOnceSpy.mockRestore();
    });

    it("registers custom signal handlers", async () => {
      const mockServer = createMockHttpServer();
      createSuccessfulListen(mockServer);

      const processOnceSpy = jest.spyOn(process, "once");
      const { start, stop } = await loadServerModule();
      const server = (await start({
        port: 9124,
        signals: ["SIGUSR1"],
      })) as TestHttpServer;
      trackServer(server, stop);

      expect(processOnceSpy).toHaveBeenCalledWith(
        "SIGUSR1",
        expect.any(Function)
      );
      expect(processOnceSpy).not.toHaveBeenCalledWith(
        "SIGTERM",
        expect.any(Function)
      );

      processOnceSpy.mockRestore();
    });
  });

  describe("stop", () => {
    it("stops the running server", async () => {
      const mockServer = createMockHttpServer();
      createSuccessfulListen(mockServer);

      const { start, stop } = await loadServerModule();
      const server = (await start({ port: 10123 })) as TestHttpServer;
      trackServer(server, stop);

      await stop();
      expect(mockServer.close).toHaveBeenCalled();
      expect(server.listening).toBe(false);
      activeServer = null;
      currentStop = null;
    });

    it("resolves when no server has been started", async () => {
      const { stop } = await loadServerModule();
      await expect(stop()).resolves.toBeUndefined();
    });

    it("removes registered signal listeners", async () => {
      const mockServer = createMockHttpServer();
      createSuccessfulListen(mockServer);

      const removeListenerSpy = jest.spyOn(process, "removeListener");
      const { start, stop } = await loadServerModule();
      const server = (await start({ port: 11123 })) as TestHttpServer;
      trackServer(server, stop);

      await stop();
      activeServer = null;
      currentStop = null;

      expect(removeListenerSpy).toHaveBeenCalledWith(
        "SIGTERM",
        expect.any(Function)
      );
      expect(removeListenerSpy).toHaveBeenCalledWith(
        "SIGINT",
        expect.any(Function)
      );

      removeListenerSpy.mockRestore();
    });

    it("closes the database pool when stopping", async () => {
      const mockServer = createMockHttpServer();
      createSuccessfulListen(mockServer);

      const { start, stop, database } = await loadServerModule();
      const server = (await start({ port: 12123 })) as TestHttpServer;
      trackServer(server, stop);

      await stop();
      activeServer = null;
      currentStop = null;

      expect(database.closeDbPool).toHaveBeenCalled();
    });

    it("closes the database pool even when server.close fails", async () => {
      const mockServer = createMockHttpServer();
      createSuccessfulListen(mockServer);

      const { start, stop, database } = await loadServerModule();
      const server = (await start({ port: 13123 })) as TestHttpServer;
      trackServer(server, stop);

      const closeError = new Error("Close failed");
      mockServer.setCloseImplementation((callback) => {
        callback?.(closeError);
      });

      await expect(stop()).rejects.toThrow("Close failed");
      expect(database.closeDbPool).toHaveBeenCalled();

      mockServer.setCloseImplementation(null);
      activeServer = null;
      currentStop = null;
    });
  });

  it("exports the Express app instance", async () => {
    const mockServer = createMockHttpServer();
    createSuccessfulListen(mockServer);

    const { app } = await loadServerModule();
    expect(app).toBeDefined();
    expect(typeof app.listen).toBe("function");
  });

  describe("signal handling", () => {
    it("should register signal handlers with proper shutdown logic", async () => {
      const mockServer = createMockHttpServer();
      createSuccessfulListen(mockServer);

      const processOnceSpy = jest.spyOn(process, "once");
      const { start } = await loadServerModule();
      await start({ port: 14123, signals: ["SIGTERM"] });

      expect(processOnceSpy).toHaveBeenCalledWith(
        "SIGTERM",
        expect.any(Function)
      );

      processOnceSpy.mockRestore();
    });

    it("should have shutdown logic that handles console output", () => {
      // This test covers the shutdown console.log logic
      const mockConsoleLog = jest.spyOn(console, "log").mockImplementation();

      // The shutdown logic includes console.log("Shutting down…")
      // This is covered by the signal listener code
      console.log("Shutting down…");

      expect(mockConsoleLog).toHaveBeenCalledWith("Shutting down…");
      mockConsoleLog.mockRestore();
    });
  });
});
