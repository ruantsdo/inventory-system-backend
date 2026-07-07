import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../shared/db/prisma";
import { unauthorized } from "../../shared/errors/AppError";
import {
  confirmActivationSchema,
  createUserSchema,
  resendActivationSchema,
  updateUserSchema,
} from "./users.schema";
import { usersService } from "./users.service";

async function resolveIsPrivilegedCaller(userId: string): Promise<boolean> {
  const privileged = await prisma.userRole.findFirst({
    where: {
      userId,
      isActive: true,
      role: {
        governanceLevel: { in: ["ROOT", "SUPER_ADMIN"] },
      },
    },
    select: { id: true },
  });
  return !!privileged;
}

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

export async function getAllUsersController(req: Request, res: Response, next: NextFunction) {
  try {
    const callerId = req.user?.id;
    if (!callerId) throw unauthorized("Usuário não autenticado", "Não autenticado");

    const activeFacilityId = req.user?.activeFacilityId;
    if (!activeFacilityId || activeFacilityId !== "ALL")
      throw unauthorized("Unidade ativa não definida", "Não autenticado");

    const isPrivilegedCaller = await resolveIsPrivilegedCaller(callerId);
    const result = await usersService.getAllUsers(activeFacilityId, isPrivilegedCaller);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getUsersByFacilityIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const callerId = req.user?.id;
    if (!callerId) throw unauthorized("Usuário não autenticado", "Não autenticado");

    const facilityId = req.params.facilityId as string;
    const isPrivilegedCaller = await resolveIsPrivilegedCaller(callerId);
    const result = await usersService.getUsersByFacilityId(facilityId, isPrivilegedCaller);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getSelfDataController(req: Request, res: Response, next: NextFunction) {
  try {
    const targetId = req.user?.id;

    if (!targetId) {
      throw unauthorized("Usuário não autenticado", "Não autenticado");
    }

    const result = await usersService.getSelfData(targetId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getBasicUserDataByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const targetId = req.params.targetId as string;

    const result = await usersService.getBasicUserDataById(targetId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getBasicUserDataByCpfController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const targetCpf = req.params.targetCpf as string;

    const result = await usersService.getBasicUserDataByCpf(targetCpf);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getBasicUserDataByEmailController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const targetEmail = req.params.targetEmail as string;

    const result = await usersService.getBasicUserDataByEmail(targetEmail);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getUserEditDataController(req: Request, res: Response, next: NextFunction) {
  try {
    const targetId = req.params.targetId as string;

    const result = await usersService.getUserEditData(targetId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function updateUserController(req: Request, res: Response, next: NextFunction) {
  try {
    const targetId = req.params.targetId as string;
    const requestMakerId = req.user?.id;

    if (!requestMakerId) {
      throw unauthorized("Usuário não autenticado", "Não autenticado");
    }

    const data = updateUserSchema.parse(req.body);

    const result = await usersService.updateUser(targetId, data, requestMakerId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function removeUserController(req: Request, res: Response, next: NextFunction) {
  try {
    const targetId = req.params.targetId as string;
    const requestMakerId = req.user?.id;

    if (!requestMakerId) {
      throw unauthorized("Usuário não autenticado", "Não autenticado");
    }

    const result = await usersService.removeUser(targetId, requestMakerId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function deactivateUserController(req: Request, res: Response, next: NextFunction) {
  try {
    const targetId = req.params.targetId as string;
    const requestMakerId = req.user?.id;

    if (!requestMakerId) {
      throw unauthorized("Usuário não autenticado", "Não autenticado");
    }

    const result = await usersService.deactivateUser(targetId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function reactivateUserController(req: Request, res: Response, next: NextFunction) {
  try {
    const targetId = req.params.targetId as string;
    const requestMakerId = req.user?.id;

    if (!requestMakerId) {
      throw unauthorized("Usuário não autenticado", "Não autenticado");
    }

    const result = await usersService.reactivateUser(targetId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
