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
    const roleNames = (payload.roleNames ?? []) as string[];
    const permissionNames = (payload.permissionNames ?? []) as string[];

    if (!id) {
      return next(unauthorized("Token malformado.", "Não autenticado"));
    }

    req.user = { id, roleNames, permissionNames };
    next();
  } catch {
    next(unauthorized("Sessão expirada ou inválida. Faça login novamente.", "Não autenticado"));
  }
}
