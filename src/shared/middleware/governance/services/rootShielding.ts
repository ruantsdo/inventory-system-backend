import { AuditEntity } from "@/generated/prisma/client";
import { AuditAction } from "@/shared/audit";
import { prisma } from "@/shared/db/prisma";
import type { CreateUserPayload, UpdateUserPayload } from "@/shared/types/api.contracts";
import type { GovernanceLevel } from "../../../../generated/prisma/enums";
import { forbidden } from "../../../errors/AppError";
import type { Actions } from "../../../utils/extractors";
import { recordGovernanceAudit } from "./governanceAudit";

export async function rootShielding(
  callerLevel: GovernanceLevel | null | undefined,
  action: Actions,
  targetId: string | null | undefined,
  data: UpdateUserPayload | CreateUserPayload | null
): Promise<void> {
  if (targetId && (action === "update" || action === "deactivate" || action === "delete")) {
    const targetIsRoot = await prisma.userRole.findFirst({
      where: {
        userId: targetId,
        role: {
          governanceLevel: "ROOT",
        },
        isActive: true,
      },
    });

    if (targetIsRoot) {
      if (action === "deactivate" || action === "delete") {
        const reason = `Não é possível ${action === "deactivate" ? "desativar" : "excluir"} um usuário com nível de governança ROOT.`;
        await recordGovernanceAudit({
          action: AuditAction.ROOT_SHIELDING_TRIGGERED,
          entity: AuditEntity.User,
          entityId: targetId,
          metadata: {
            callerLevel: callerLevel ?? null,
            targetUserId: targetId,
            attemptedAction: action,
            reason,
          },
        });
        throw forbidden(reason, "Ação de governança negada", "GOVERNANCE_INSUFFICIENT_LEVEL");
      }

      if (callerLevel !== "ROOT") {
        const reason =
          "Você não possui privilégios suficientes para editar um usuário com nível de governança ROOT.";
        await recordGovernanceAudit({
          action: AuditAction.ROOT_SHIELDING_TRIGGERED,
          entity: AuditEntity.User,
          entityId: targetId,
          metadata: {
            callerLevel: callerLevel ?? null,
            targetUserId: targetId,
            attemptedAction: action,
            reason,
          },
        });
        throw forbidden(reason, "Ação de governança negada", "GOVERNANCE_INSUFFICIENT_LEVEL");
      }

      if (data?.roles) {
        const reason = "Não é permitido alterar os cargos de um usuário ROOT por esta via.";
        await recordGovernanceAudit({
          action: AuditAction.ROOT_SHIELDING_TRIGGERED,
          entity: AuditEntity.User,
          entityId: targetId,
          metadata: {
            callerLevel: callerLevel ?? null,
            targetUserId: targetId,
            attemptedAction: action,
            reason,
          },
        });
        throw forbidden(reason, "Ação de governança negada", "GOVERNANCE_INSUFFICIENT_LEVEL");
      }
    }
  }

  if ((action === "create" || action === "update") && data?.roles) {
    for (const role of data.roles) {
      const roleData = await prisma.role.findUnique({
        where: { id: role.roleId },
      });

      if (roleData?.governanceLevel === "ROOT" && callerLevel !== "ROOT") {
        const reason =
          "Você não possui privilégios suficientes para associar o cargo ROOT a este usuário.";
        await recordGovernanceAudit({
          action: AuditAction.ROOT_SHIELDING_TRIGGERED,
          entity: AuditEntity.Role,
          entityId: role.roleId,
          metadata: {
            callerLevel: callerLevel ?? null,
            targetUserId: targetId ?? undefined,
            attemptedAction: action,
            reason,
          },
        });
        throw forbidden(reason, "Ação de governança negada", "GOVERNANCE_INSUFFICIENT_LEVEL");
      }
    }
  }
}
