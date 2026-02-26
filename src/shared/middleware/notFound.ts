import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(`Route ${req.method} ${req.path} not found`, 404));
}
