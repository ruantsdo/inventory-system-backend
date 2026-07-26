import * as Sentry from "@sentry/node";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { authRouter } from "./modules/auth/auth.router";
import { facilitiesRouter } from "./modules/facilities/facilities.router";
import { geoRouter } from "./modules/geo/geo.router";
import { permissionsRouter } from "./modules/permissions/permissions.router";
import { usersRouter } from "./modules/users/users.router";
import { errorHandler } from "./shared/middleware/errorHandler";
import { notFoundHandler } from "./shared/middleware/notFound";
import { requestContextMiddleware } from "./shared/middleware/request-context.middleware";

export function createApp() {
  if (env.SENTRY_DSN) {
    Sentry.init({
      dsn: env.SENTRY_DSN,
      environment: env.NODE_ENV,
      tracesSampleRate: env.NODE_ENV === "production" ? 0.2 : 1.0,
    });
    logger.info("Sentry initialised");
  }

  const app = express();

  app.use(helmet());

  app.use(requestContextMiddleware);

  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
      standardHeaders: "draft-7",
      legacyHeaders: false,
      message: { status: "error", code: 429, message: "Too many requests" },
    })
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser(env.COOKIE_SECRET));
  app.use(
    pinoHttp({
      logger,
      autoLogging: {
        ignore: (req) => req.url === "/api/health",
      },
    })
  );

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    });
  });

  app.use("/auth", authRouter);
  app.use("/api/geo", geoRouter);
  app.use("/api/permissions", permissionsRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/facilities", facilitiesRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
