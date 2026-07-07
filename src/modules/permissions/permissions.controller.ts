import type { NextFunction, Request, Response } from "express";
import { unauthorized } from "../../shared/errors/AppError";
import { PermissionsService } from "./permissions.service";

export async function getAllRolesController(_req: Request, res: Response, next: NextFunction) {
  try {
    const roles = await PermissionsService.getAllRoles();

    const mappedRoles = roles.map((r) => ({
      id: r.id,
      name: r.name,
      governanceLevel: r.governanceLevel,
      category: r.category,
      displayName: r.displayName,
      description: r.description,
      permissions: r.permissions.map((rp) => rp.permission),
    }));

    res.json(mappedRoles);
  } catch (error) {
    next(error);
  }
}

export async function getCurrentUserPermissionsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw unauthorized("Usuário não autenticado", "Não autenticado");
    }

    const permissions = await PermissionsService.getPermissionsForUser(userId);
    res.json(permissions);
  } catch (error) {
    next(error);
  }
}
