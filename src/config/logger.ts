import pino from "pino";
import { env } from "./env.js";

function buildLogger() {
  const isDev = env.NODE_ENV === "development";

  return pino({
    level: isDev ? "debug" : "info",
    ...(isDev
      ? {
          transport: {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "SYS:HH:MM:ss",
              ignore: "pid,hostname",
            },
          },
        }
      : {
          formatters: {
            level(label: string): Record<string, string> {
              return { level: label };
            },
          },
          timestamp: pino.stdTimeFunctions.isoTime,
        }),
  });
}

export const logger = buildLogger();

export function wrapLoggerWithSentry(captureException: (err: unknown) => void): void {
  const originalError = logger.error.bind(logger) as (obj: unknown, ...args: unknown[]) => void;

  const wrapped = (obj: unknown, ...args: unknown[]): void => {
    if (obj instanceof Error) captureException(obj);
    originalError(obj, ...args);
  };

  (logger as { error: unknown }).error = wrapped;
}
