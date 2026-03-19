import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(`Rota ${req.path} não encontrada`, "", 404));
}
