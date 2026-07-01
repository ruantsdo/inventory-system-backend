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

        canAssignRole(callerLevel, role as RoleRow);
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

        canRemoveRole(callerLevel, role as RoleRow);
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
        canManageUser(callerLevel, targetRoles);
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

        canGrantPermission(callerLevel, role);
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

        canRevokePermission(callerLevel, role);
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
        canManageFacility(callerLevel, action);
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
        canManageScope(callerLevel, scopeMode);
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
          for (const userRole of data.roles) {
            const scopeMode =
              userRole.facilities && userRole.facilities.length > 0 ? "FACILITY_SET" : "GLOBAL";

            canManageScope(callerLevel, scopeMode);

            const role = await prisma.role.findUnique({
              where: { id: userRole.roleId },
              select: { category: true, governanceLevel: true, isProtected: true },
            });
            if (!role) {
              throw forbidden("Cargo não encontrado.", "Cargo inválido");
            }

            canAssignRole(callerLevel, role);
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
        canManageUser(callerLevel, targetRoles);

        if (data?.roles) {
          const currentRoles = await prisma.userRole.findMany({
            where: { userId: targetId, isActive: true },
            select: {
              roleId: true,
              role: {
                select: { id: true, category: true, governanceLevel: true, isProtected: true },
              },
            },
          });

          const currentRoleIds = new Set(currentRoles.map((cr) => cr.roleId));
          const newRoleIds = new Set(data.roles.map((r) => r.roleId));

          for (const newRole of data.roles) {
            const scopeMode =
              newRole.facilities && newRole.facilities.length > 0 ? "FACILITY_SET" : "GLOBAL";

            canManageScope(callerLevel, scopeMode);

            if (!currentRoleIds.has(newRole.roleId)) {
              const role = await prisma.role.findUnique({
                where: { id: newRole.roleId },
                select: { category: true, governanceLevel: true, isProtected: true },
              });
              if (!role) {
                throw forbidden("Cargo não encontrado.", "Cargo inválido");
              }

              canAssignRole(callerLevel, role);
            }
          }

          for (const currentRole of currentRoles) {
            if (!newRoleIds.has(currentRole.roleId)) {
              canRemoveRole(callerLevel, currentRole.role);
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
        canManageUser(callerLevel, targetRoles);

        next();
      } catch (error) {
        next(error);
      }
    };
  },
};
