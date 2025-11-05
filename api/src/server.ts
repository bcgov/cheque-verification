import type { Server } from "node:http";
import dotenv from "dotenv";
import { createApp } from "./app";
import { closeDbPool, initializeDbPool } from "./config/database";
import logger from "./config/logger";

dotenv.config();

const DEFAULT_SIGNALS: NodeJS.Signals[] = ["SIGTERM", "SIGINT"];

function resolveAllowedOrigins() {
  const origins = [process.env.BACKEND_URL || "http://localhost:4000"];
  if (process.env.BACKEND_PROD_URL) {
    origins.push(process.env.BACKEND_PROD_URL);
  }
  return origins;
}

const app = createApp({ allowedOrigins: resolveAllowedOrigins() });

let server: Server | null = null;
const signalListeners = new Map<NodeJS.Signals, () => void>();

export interface StartOptions {
  port?: number;
  signals?: NodeJS.Signals[];
}

function resolvePort(port?: number) {
  if (typeof port === "number") {
    return port;
  }
  const envPort = process.env.PORT ? Number(process.env.PORT) : Number.NaN;
  return Number.isNaN(envPort) ? 3000 : envPort;
}

async function bindServer(port: number) {
  return new Promise<Server>((resolve, reject) => {
    const httpServer = app.listen(port, () => {
      httpServer.off("error", onError);
      logger.info({ port }, "API server started");
      resolve(httpServer);
    });

    const onError = (error: Error) => {
      httpServer.off("error", onError);
      reject(error);
    };

    httpServer.on("error", onError);
  });
}

export async function start(options: StartOptions = {}): Promise<Server> {
  if (server) {
    return server;
  }

  const port = resolvePort(options.port);
  await initializeDbPool();

  try {
    server = await bindServer(port);
  } catch (error) {
    await closeDbPool();
    throw error;
  }

  const signals = options.signals ?? DEFAULT_SIGNALS;
  for (const signal of signals) {
    if (signalListeners.has(signal)) {
      continue;
    }

    const listener = () => {
      logger.info("Shutting down…");
      stop()
        .then(() => process.exit(0))
        .catch((shutdownError) => {
          const message =
            shutdownError instanceof Error
              ? shutdownError.message
              : String(shutdownError);
          logger.error({ message });
          process.exit(1);
        });
    };

    signalListeners.set(signal, listener);
    process.once(signal, listener);
  }

  return server;
}

export async function stop(): Promise<void> {
  if (!server) {
    return;
  }

  for (const [signal, listener] of signalListeners) {
    process.removeListener(signal, listener);
  }
  signalListeners.clear();

  const httpServer = server;
  server = null;

  try {
    await new Promise<void>((resolve, reject) => {
      httpServer.close((error) => {
        if (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        } else {
          resolve();
        }
      });
    });
  } finally {
    await closeDbPool();
  }
}

export { app };
