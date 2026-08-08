import { AuditEntity } from "@/generated/prisma/client";
import { AuditAction } from "@/shared/audit";
import type { GovernanceLevel } from "../../../../generated/prisma/enums";
import { forbidden } from "../../../errors/AppError";
import type { Actions } from "../../../utils/extractors";
import { recordGovernanceAudit } from "./governanceAudit";
import { isAtLeast } from "./governanceHelpers";

export async function canManageFacility(
  callerLevel: GovernanceLevel | null | undefined,
  action: Actions,
  facilityId?: string
): Promise<void> {
  if (action === "deactivate" || action === "delete") {
    if (!isAtLeast(callerLevel, "SYSTEM_ADMIN")) {
      const reason = `Para ${action === "deactivate" ? "desativar" : "excluir"} uma unidade, é necessário nível de governança ADMINISTRADOR DE SISTEMA ou superior.`;
      await recordGovernanceAudit({
        action: AuditAction.INSUFFICIENT_GOVERNANCE_LEVEL,
        entity: AuditEntity.Facility,
        entityId: facilityId,
        metadata: {
          callerLevel: callerLevel ?? null,
          requiredLevel: "SYSTEM_ADMIN",
          attemptedAction: action,
          reason,
        },
      });
      throw forbidden(reason, "Ação de governança negada", "GOVERNANCE_INSUFFICIENT_LEVEL");
    }
    return;
  }

  if (!isAtLeast(callerLevel, "MANAGER")) {
    const actionLabel: Record<Actions, string> = {
      create: "criar",
      update: "editar",
      restore: "restaurar",
      activate: "ativar",
      deactivate: "desativar",
      delete: "excluir",
    };
    const reason = `Para ${actionLabel[action]} uma unidade, é necessário nível de governança GERENTE ou superior.`;
    await recordGovernanceAudit({
      action: AuditAction.INSUFFICIENT_GOVERNANCE_LEVEL,
      entity: AuditEntity.Facility,
      entityId: facilityId,
      metadata: {
        callerLevel: callerLevel ?? null,
        requiredLevel: "MANAGER",
        attemptedAction: action,
        reason,
      },
    });
    throw forbidden(reason, "Ação de governança negada", "GOVERNANCE_INSUFFICIENT_LEVEL");
  }
}
