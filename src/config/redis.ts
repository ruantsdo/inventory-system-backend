import { Redis } from "ioredis";
import { env } from "./env.js";
import { logger } from "./logger.js";

let redisInstance: Redis | null = null;

export function getRedis(): Redis {
  if (!redisInstance) {
    redisInstance = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

    redisInstance.on("connect", () => {
      logger.info("Redis connected");
    });

    redisInstance.on("error", (err: Error) => {
      logger.error(err, "Redis connection error");
    });

    redisInstance.on("close", () => {
      logger.warn("Redis connection closed");
    });
  }

  return redisInstance;
}

export async function closeRedis(): Promise<void> {
  if (redisInstance) {
    await redisInstance.quit();
    redisInstance = null;
    logger.info("Redis connection closed");
  }
}
