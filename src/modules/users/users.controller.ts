import type { NextFunction, Request, Response } from "express";
import { unauthorized } from "../../shared/errors/AppError";
import { confirmActivationSchema, createUserSchema, resendActivationSchema } from "./users.schema";
import { usersService } from "./users.service";

export async function createUserController(req: Request, res: Response, next: NextFunction) {
  try {
    const requestMakerId = req.user?.id;
    if (!requestMakerId) {
      throw unauthorized("Usuário não autenticado", "Não autenticado");
    }

    const data = createUserSchema.parse(req.body);

    const result = await usersService.createUser(data, requestMakerId);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function resendActivationController(req: Request, res: Response, next: NextFunction) {
  try {
    const data = resendActivationSchema.parse(req.body);
    const result = await usersService.resendActivationLink(data);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function confirmActivationController(req: Request, res: Response, next: NextFunction) {
  try {
    const data = confirmActivationSchema.parse(req.body);
    const result = await usersService.confirmActivation(data);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
