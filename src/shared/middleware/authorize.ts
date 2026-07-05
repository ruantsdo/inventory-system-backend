import type { NextFunction, Request, Response } from "express";
import { prisma } from "../db/prisma";
import { forbidden, unauthorized } from "../errors/AppError";
import { extractAction } from "../utils/extractors";

export function authorize(requiredPermission: string) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;

      if (!user || !user.id) {
        return next(unauthorized("Sessão inválida ou usuário não autenticado.", "Não autenticado"));
      }

      req.actionContext = extractAction(requiredPermission);

      const isPrivilegedAdmin = await prisma.user.findFirst({
        where: {
          id: user.id,
          isActive: true,
          roles: {
            some: {
              isActive: true,
              role: {
                governanceLevel: { in: ["ROOT", "SUPER_ADMIN"] },
              },
            },
          },
        },
        select: { id: true },
      });

      if (isPrivilegedAdmin) return next();

      const activeFacilityId = user.activeFacilityId;

      const hasPermission = await prisma.userRole.findFirst({
        where: {
          userId: user.id,
          isActive: true,
          permissions: {
            some: {
              permission: {
                name: requiredPermission,
              },
            },
          },
          OR: [
            { scopeMode: "GLOBAL" },
            {
              scopeMode: "FACILITY_SET",
              facilities: {
                some: { facilityId: activeFacilityId },
              },
            },
          ],
        },
        select: { id: true },
      });

      if (!hasPermission) {
        return next(
          forbidden(
            "Você não possui permissão para realizar esta ação na unidade ativa atual.",
            "Acesso negado"
          )
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
