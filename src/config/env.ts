import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3333),

  DATABASE_URL: z.string().url({ message: "DATABASE_URL must be a valid URL" }),

  REDIS_URL: z.string().url({ message: "REDIS_URL must be a valid URL" }),

  JWT_SECRET: z.string().min(32, { message: "JWT_SECRET must be at least 32 characters" }),
  JWT_ACCESS_EXPIRES: z.string().default("15m"),
  JWT_REFRESH_EXPIRES: z.string().default("7d"),

  COOKIE_SECRET: z.string().min(16, { message: "COOKIE_SECRET must be at least 16 characters" }),

  FRONTEND_URL: z.string().url({ message: "FRONTEND_URL must be a valid URL" }),

  SENTRY_DSN: z.string().optional(),

  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
});

const _parsed = envSchema.safeParse(process.env);

if (!_parsed.success) {
  console.error("Invalid environment variables:");
  console.error(_parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = _parsed.data;
export type Env = z.infer<typeof envSchema>;
