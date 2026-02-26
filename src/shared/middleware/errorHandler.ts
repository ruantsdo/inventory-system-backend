import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../../config/logger.js";
import { AppError } from "../errors/AppError.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(422).json({
      status: "error",
      code: 422,
      message: "Validation failed",
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error(err, "Unexpected AppError (non-operational)");
    }

    res.status(err.statusCode).json({
      status: "error",
      code: err.statusCode,
      message: err.message,
    });
    return;
  }

  logger.error(err, "Unhandled exception");

  res.status(500).json({
    status: "error",
    code: 500,
    message: "An unexpected error occurred",
  });
}
