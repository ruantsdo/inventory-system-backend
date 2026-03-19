import http from "node:http";
import { createApp } from "./app";
import { env } from "./config/env";
import { logger, wrapLoggerWithSentry } from "./config/logger";
import { closeRedis, getRedis } from "./config/redis";

async function bootstrap() {
  const app = createApp();

  const redis = getRedis();
  await redis.ping();
  logger.info("Redis ping OK");

  try {
    const { captureException } = await import("@sentry/node");
    wrapLoggerWithSentry(captureException);
  } catch {}

  const server = http.createServer(app);

  server.listen(env.PORT, () => {
    logger.info(
      { port: env.PORT, env: env.NODE_ENV },
      `Server listening on http://localhost:${env.PORT}`
    );
  });

  async function shutdown(signal: string) {
    logger.info({ signal }, "Shutdown signal received — closing gracefully");

    server.close(async () => {
      await closeRedis();
      logger.info("Server closed");
      process.exit(0);
    });

    setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10_000).unref();
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("unhandledRejection", (reason) => {
    logger.error({ reason }, "Unhandled promise rejection");
  });

  process.on("uncaughtException", (err) => {
    logger.error(err, "Uncaught exception — shutting down");
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
