import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma";
import { badRequest, forbidden } from "../errors/AppError";

const uuidSchema = z.string().uuid();

export async function resolveActiveFacility(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user;

    if (!user?.id) {
      return next(badRequest("Usuário não autenticado.", "Não autenticado"));
    }

    const facilityId = req.cookies?.active_facility_id as string | undefined;

    if (!facilityId) {
      return next(
        badRequest(
          "Selecione uma unidade ativa antes de prosseguir.",
          "Unidade ativa não informada"
        )
      );
    }

    if (!uuidSchema.safeParse(facilityId).success) {
      return next(
        badRequest(
          "O identificador da unidade é inválido. Defina novamente antes de continuar.",
          "Unidade ativa inválida"
        )
      );
    }

    const isGlobalUser = user.facilitiesNames.length === 0;

    if (isGlobalUser) {
      const facility = await prisma.facility.findFirst({
        where: {
          id: facilityId,
          isActive: true,
          isDeleted: false,
        },
        select: { id: true },
      });

      if (!facility) {
        return next(
          forbidden("A unidade informada não existe ou está inativa.", "Unidade ativa inválida")
        );
      }
    } else {
      const userFacility = await prisma.userRoleFacilityScope.findFirst({
        where: {
          facilityId,
          userRole: {
            userId: user.id,
            isActive: true,
          },
          facility: {
            isActive: true,
            isDeleted: false,
          },
        },
        select: { facilityId: true },
      });

      if (!userFacility) {
        return next(
          forbidden(
            "Você não tem acesso à unidade informada ou ela está inativa.",
            "Acesso à unidade negado"
          )
        );
      }
    }

    req.user = { ...user, activeFacilityId: facilityId };

    next();
  } catch (error) {
    next(error);
  }
}
