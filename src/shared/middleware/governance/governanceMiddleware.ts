import { createUserSchema, updateUserSchema } from "@/modules/users/users.schema";
import type { NextFunction, Request, Response } from "express";
import type {
  GovernanceLevel,
  RoleCategory,
  UserRoleScopeMode,
} from "../../../generated/prisma/enums";
import { prisma } from "../../db/prisma";
import { forbidden, unauthorized } from "../../errors/AppError";
import { isAction } from "../../utils/extractors";
import { canAssignRole } from "./services/canAssignRole";
import { canGrantPermission } from "./services/canGrantPermission";
import { canManageFacility } from "./services/canManageFacility";
import { canManageScope } from "./services/canManageScope";
import { canManageUser } from "./services/canManageUser";
import { canRemoveRole } from "./services/canRemoveRole";
import { canRevokePermission } from "./services/canRevokePermission";
import { GOVERNANCE_RANK } from "./services/governanceHelpers";
import { rootShielding } from "./services/rootShielding";
import { validateFacilityScope } from "./services/validateFacilityScope";

async function resolveCallerGovernanceLevel(userId: string): Promise<GovernanceLevel | null> {
  const userRoles = await prisma.userRole.findMany({
    where: {
      userId,
      isActive: true,
      role: {
        category: "ADMINISTRATIVE",
        governanceLevel: { not: null },
      },
    },
    select: {
      role: {
        select: {
          governanceLevel: true,
        },
      },
    },
  });

  let highest: GovernanceLevel | null = null;

  for (const ur of userRoles) {
    const level = ur.role.governanceLevel;
    if (!level) continue;
    if (!highest || GOVERNANCE_RANK[level] > GOVERNANCE_RANK[highest]) {
      highest = level;
    }
  }

  return highest;
}

type RoleRow = {
  id: string;
  category: RoleCategory;
  governanceLevel: GovernanceLevel | null;
  isProtected: boolean;
};

type UserRoleRow = {
  role: { category: RoleCategory; governanceLevel: GovernanceLevel | null };
};

export const governance = {
  canAssignRole(getRoleId: (req: Request) => string = (req) => req.body.roleId) {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      try {
        const user = req.user;
        if (!user?.id) return next(unauthorized("Não autenticado.", "Não autenticado"));

        const roleId = getRoleId(req);
        if (!roleId) return next(forbidden("ID do cargo não informado.", "Parâmetro ausente"));

        const [callerLevel, role] = await Promise.all([
          resolveCallerGovernanceLevel(user.id),
          prisma.role.findUnique({
            where: { id: roleId },
            select: { id: true, category: true, governanceLevel: true, isProtected: true },
          }),
        ]);

        if (!role) return next(forbidden("Cargo não encontrado.", "Cargo inválido"));

        await canAssignRole(callerLevel, role as RoleRow);
        next();
      } catch (error) {
        next(error);
      }
    };
  },

  canRemoveRole(getRoleId: (req: Request) => string = (req) => req.body.roleId) {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      try {
        const user = req.user;
        if (!user?.id) return next(unauthorized("Não autenticado.", "Não autenticado"));

        const roleId = getRoleId(req);
        if (!roleId) return next(forbidden("ID do cargo não informado.", "Parâmetro ausente"));

        const [callerLevel, role] = await Promise.all([
          resolveCallerGovernanceLevel(user.id),
          prisma.role.findUnique({
            where: { id: roleId },
            select: { id: true, category: true, governanceLevel: true, isProtected: true },
          }),
        ]);

        if (!role) return next(forbidden("Cargo não encontrado.", "Cargo inválido"));

        await canRemoveRole(callerLevel, role as RoleRow);
        next();
      } catch (error) {
        next(error);
      }
    };
  },

  canManageUser(getTargetUserId: (req: Request) => string = (req) => req.params.userId as string) {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      try {
        const user = req.user;
        if (!user?.id) return next(unauthorized("Não autenticado.", "Não autenticado"));

        const targetUserId = getTargetUserId(req);
        if (!targetUserId)
          return next(forbidden("ID do usuário alvo não informado.", "Parâmetro ausente"));

        const [callerLevel, targetUserRoles] = await Promise.all([
          resolveCallerGovernanceLevel(user.id),
          prisma.userRole.findMany({
            where: { userId: targetUserId, isActive: true },
            select: {
              role: {
                select: { category: true, governanceLevel: true },
              },
            },
          }),
        ]);

        const targetRoles = (targetUserRoles as UserRoleRow[]).map((ur) => ur.role);
        await canManageUser(callerLevel, targetRoles, targetUserId);
        next();
      } catch (error) {
        next(error);
      }
    };
  },

  canGrantPermission(getRoleId: (req: Request) => string = (req) => req.body.roleId) {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      try {
        const user = req.user;
        if (!user?.id) return next(unauthorized("Não autenticado.", "Não autenticado"));

        const roleId = getRoleId(req);
        if (!roleId) return next(forbidden("ID do cargo não informado.", "Parâmetro ausente"));

        const [callerLevel, role] = await Promise.all([
          resolveCallerGovernanceLevel(user.id),
          prisma.role.findUnique({
            where: { id: roleId },
            select: { category: true, governanceLevel: true },
          }),
        ]);

        if (!role) return next(forbidden("Cargo não encontrado.", "Cargo inválido"));

        await canGrantPermission(callerLevel, { ...role, id: roleId });
        next();
      } catch (error) {
        next(error);
      }
    };
  },

  canRevokePermission(getRoleId: (req: Request) => string = (req) => req.body.roleId) {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      try {
        const user = req.user;
        if (!user?.id) return next(unauthorized("Não autenticado.", "Não autenticado"));

        const roleId = getRoleId(req);
        if (!roleId) return next(forbidden("ID do cargo não informado.", "Parâmetro ausente"));

        const [callerLevel, role] = await Promise.all([
          resolveCallerGovernanceLevel(user.id),
          prisma.role.findUnique({
            where: { id: roleId },
            select: { category: true, governanceLevel: true },
          }),
        ]);

        if (!role) return next(forbidden("Cargo não encontrado.", "Cargo inválido"));

        await canRevokePermission(callerLevel, { ...role, id: roleId });
        next();
      } catch (error) {
        next(error);
      }
    };
  },

  canManageFacility() {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      try {
        const user = req.user;
        if (!user?.id) return next(unauthorized("Não autenticado.", "Não autenticado"));

        const action = req.actionContext?.action;
        if (!isAction(action)) {
          throw forbidden(
            "Ação inválida para unidade.",
            "Ação de governança negada",
            "GOVERNANCE_INSUFFICIENT_LEVEL"
          );
        }

        const callerLevel = await resolveCallerGovernanceLevel(user.id);
        await canManageFacility(callerLevel, action);
        next();
      } catch (error) {
        next(error);
      }
    };
  },

  canManageScope(getScopeMode: (req: Request) => UserRoleScopeMode = (req) => req.body.scopeMode) {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      try {
        const user = req.user;
        if (!user?.id) return next(unauthorized("Não autenticado.", "Não autenticado"));

        const scopeMode = getScopeMode(req);
        if (!scopeMode)
          return next(forbidden("Modo de escopo não informado.", "Parâmetro ausente"));

        const callerLevel = await resolveCallerGovernanceLevel(user.id);
        await canManageScope(callerLevel, scopeMode);
        next();
      } catch (error) {
        next(error);
      }
    };
  },

  rootShielding() {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      try {
        const user = req.user;
        if (!user?.id) return next(unauthorized("Não autenticado.", "Não autenticado"));

        const action = req.actionContext?.action;
        if (!isAction(action)) {
          throw forbidden(
            "Ação não identificada.",
            "Ação de governança negada",
            "GOVERNANCE_INSUFFICIENT_LEVEL"
          );
        }

        const data = req.body ? updateUserSchema.parse(req.body) : null;
        const targetId = (req.params.targetId || req.params.userId) as string | undefined;

        const callerLevel = await resolveCallerGovernanceLevel(user.id);
        await rootShielding(callerLevel, action, targetId, data);
        next();
      } catch (error) {
        next(error);
      }
    };
  },

  verifyUserCreation() {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      try {
        const user = req.user;
        if (!user?.id) return next(unauthorized("Não autenticado.", "Não autenticado"));

        const action = req.actionContext?.action;
        if (!isAction(action)) {
          throw forbidden(
            "Ação não identificada.",
            "Ação de governança negada",
            "GOVERNANCE_INSUFFICIENT_LEVEL"
          );
        }

        const data = req.body ? createUserSchema.parse(req.body) : null;

        const callerLevel = await resolveCallerGovernanceLevel(user.id);

        await rootShielding(callerLevel, action, undefined, data);

        if (data?.roles) {
          const allFacilityIds = data.roles.flatMap((r) => r.facilities ?? []);
          await validateFacilityScope(user.id, allFacilityIds);

          for (const userRole of data.roles) {
            const scopeMode =
              userRole.facilities && userRole.facilities.length > 0 ? "FACILITY_SET" : "GLOBAL";

            await canManageScope(callerLevel, scopeMode);

            const role = await prisma.role.findUnique({
              where: { id: userRole.roleId },
              select: { category: true, governanceLevel: true, isProtected: true },
            });
            if (!role) {
              throw forbidden("Cargo não encontrado.", "Cargo inválido");
            }

            await canAssignRole(callerLevel, { ...role, id: userRole.roleId });
          }
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  },

  verifyUserUpdate() {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      try {
        const user = req.user;
        if (!user?.id) return next(unauthorized("Não autenticado.", "Não autenticado"));

        const action = req.actionContext?.action;
        if (!isAction(action)) {
          throw forbidden(
            "Ação não identificada.",
            "Ação de governança negada",
            "GOVERNANCE_INSUFFICIENT_LEVEL"
          );
        }

        const data = req.body ? updateUserSchema.parse(req.body) : null;
        const targetId = (req.params.targetId || req.params.userId) as string | undefined;

        if (!targetId) {
          throw forbidden("Usuário alvo não informado.", "Parâmetro ausente");
        }

        const callerLevel = await resolveCallerGovernanceLevel(user.id);

        await rootShielding(callerLevel, action, targetId, data);

        const targetUserRoles = await prisma.userRole.findMany({
          where: { userId: targetId, isActive: true },
          select: {
            role: {
              select: { category: true, governanceLevel: true },
            },
          },
        });
        const targetRoles = targetUserRoles.map((ur) => ur.role);
        await canManageUser(callerLevel, targetRoles, targetId);

        if (data?.roles) {
          const currentRoles = await prisma.userRole.findMany({
            where: { userId: targetId, isActive: true },
            select: {
              roleId: true,
              role: {
                select: { id: true, category: true, governanceLevel: true, isProtected: true },
              },
              facilities: {
                select: { facilityId: true },
              },
              permissions: {
                select: { permissionId: true },
              },
            },
          });

          const currentRoleMap = new Map(
            currentRoles.map((cr) => [
              cr.roleId,
              {
                role: cr.role,
                facilityIds: new Set(cr.facilities.map((f) => f.facilityId)),
                permissionIds: new Set(cr.permissions.map((p) => p.permissionId)),
              },
            ])
          );

          const newRoleIds = new Set(data.roles.map((r) => r.roleId));
          const facilityIdsToValidate: string[] = [];

          for (const newRole of data.roles) {
            const current = currentRoleMap.get(newRole.roleId);

            if (!current) {
              facilityIdsToValidate.push(...(newRole.facilities ?? []));
            } else {
              const newPermSet = new Set(newRole.permissionIds ?? []);
              const hasPermissionChange =
                newPermSet.size !== current.permissionIds.size ||
                [...newPermSet].some((id) => !current.permissionIds.has(id));

              const newFacilitySet = new Set(newRole.facilities ?? []);
              const hasFacilityChange =
                newFacilitySet.size !== current.facilityIds.size ||
                [...newFacilitySet].some((id) => !current.facilityIds.has(id));

              if (hasPermissionChange || hasFacilityChange) {
                facilityIdsToValidate.push(...current.facilityIds);
                facilityIdsToValidate.push(...(newRole.facilities ?? []));
              }
            }
          }

          for (const [roleId, current] of currentRoleMap) {
            if (!newRoleIds.has(roleId)) {
              facilityIdsToValidate.push(...current.facilityIds);
            }
          }

          if (facilityIdsToValidate.length > 0) {
            await validateFacilityScope(user.id, facilityIdsToValidate);
          }

          const currentRoleIds = new Set(currentRoleMap.keys());

          for (const newRole of data.roles) {
            const scopeMode =
              newRole.facilities && newRole.facilities.length > 0 ? "FACILITY_SET" : "GLOBAL";

            await canManageScope(callerLevel, scopeMode);

            if (!currentRoleIds.has(newRole.roleId)) {
              const role = await prisma.role.findUnique({
                where: { id: newRole.roleId },
                select: { category: true, governanceLevel: true, isProtected: true },
              });
              if (!role) {
                throw forbidden("Cargo não encontrado.", "Cargo inválido");
              }

              await canAssignRole(callerLevel, { ...role, id: newRole.roleId });
            }
          }

          for (const [roleId, current] of currentRoleMap) {
            if (!newRoleIds.has(roleId)) {
              await canRemoveRole(callerLevel, { ...current.role, id: roleId });
            }
          }
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  },

  verifyUserStatusOrRemoval(
    getTargetUserId: (req: Request) => string = (req) =>
      (req.params.targetId || req.params.userId) as string
  ) {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      try {
        const user = req.user;
        if (!user?.id) return next(unauthorized("Não autenticado.", "Não autenticado"));

        const action = req.actionContext?.action;
        if (!isAction(action)) {
          throw forbidden(
            "Ação não identificada.",
            "Ação de governança negada",
            "GOVERNANCE_INSUFFICIENT_LEVEL"
          );
        }

        const targetId = getTargetUserId(req);
        if (!targetId) {
          throw forbidden("Usuário alvo não informado.", "Parâmetro ausente");
        }

        const callerLevel = await resolveCallerGovernanceLevel(user.id);

        await rootShielding(callerLevel, action, targetId, null);

        const targetUserRoles = await prisma.userRole.findMany({
          where: { userId: targetId, isActive: true },
          select: {
            role: {
              select: { category: true, governanceLevel: true },
            },
          },
        });
        const targetRoles = targetUserRoles.map((ur) => ur.role);
        await canManageUser(callerLevel, targetRoles, targetId);

        next();
      } catch (error) {
        next(error);
      }
    };
  },
};
