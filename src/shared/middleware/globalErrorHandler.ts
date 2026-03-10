import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";

export function globalErrorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      title: err.title,
      code: err.code,
    });
    return;
  }

  res.status(500).json({
    status: "error",
    message: "Erro interno do servidor. Tente novamente mais tarde.",
    title: "Erro Crítico",
  });
}
