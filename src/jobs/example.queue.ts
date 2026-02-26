import { Queue, Worker } from "bullmq";
import { logger } from "../config/logger.js";
import { getRedis } from "../config/redis.js";

export const exampleQueue = new Queue("example", {
  connection: getRedis(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 1_000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  },
});

export const exampleWorker = new Worker(
  "example",
  async (job) => {
    logger.info({ jobId: job.id, name: job.name }, "Processing job");
  },
  { connection: getRedis() }
);

exampleWorker.on("completed", (job) => {
  logger.info({ jobId: job.id }, "Job completed");
});

exampleWorker.on("failed", (job, err) => {
  logger.error({ jobId: job?.id, err }, "Job failed");
});
