import type { NextFunction, Request, Response } from "express";
import { prisma } from "../db/prisma";
import { forbidden, unauthorized } from "../errors/AppError";

export function authorize(requiredPermission: string) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;

      if (!user || !user.id) {
        return next(unauthorized("Sessão inválida ou usuário não autenticado.", "Não autenticado"));
      }

      const hasPermission = await prisma.userRole.findFirst({
        where: {
          userId: user.id,
          isActive: true,
          role: {
            permissions: {
              some: {
                permission: {
                  name: requiredPermission,
                },
              },
            },
          },
        },
      });

      if (!hasPermission) {
        return next(
          forbidden("Você não possui permissão para realizar esta ação.", "Acesso negado")
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
