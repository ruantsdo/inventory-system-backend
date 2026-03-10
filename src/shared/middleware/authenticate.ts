import type { NextFunction, Request, Response } from "express";
import { jwtVerify } from "jose";
import { env } from "../../config/env";
import { unauthorized } from "../errors/AppError";

const secret = new TextEncoder().encode(env.JWT_SECRET);

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies?.access_token as string | undefined;

    if (!token) {
      return next(unauthorized("Token de acesso ausente.", "Não autenticado"));
    }

    const { payload } = await jwtVerify(token, secret);

    const id = payload.sub;
    const roles = (payload.roles ?? []) as string[];
    const permissions = (payload.permissions ?? []) as string[];

    if (!id) {
      return next(unauthorized("Token malformado.", "Não autenticado"));
    }

    req.user = { id, roles, permissions };
    next();
  } catch {
    next(unauthorized("Sessão expirada ou inválida. Faça login novamente.", "Não autenticado"));
  }
}
