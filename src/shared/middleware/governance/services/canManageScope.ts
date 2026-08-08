import { AuditEntity } from "@/generated/prisma/client";
import { AuditAction } from "@/shared/audit";
import type { GovernanceLevel, UserRoleScopeMode } from "../../../../generated/prisma/enums";
import { forbidden } from "../../../errors/AppError";
import { recordGovernanceAudit } from "./governanceAudit";
import { isAtLeast } from "./governanceHelpers";

export async function canManageScope(
  callerLevel: GovernanceLevel | null | undefined,
  targetScopeMode: UserRoleScopeMode
): Promise<void> {
  if (targetScopeMode === "GLOBAL") {
    if (!isAtLeast(callerLevel, "SYSTEM_ADMIN")) {
      const reason =
        "Para conceder escopo global a um usuário, é necessário nível de governança ADMINISTRADOR DE SISTEMA ou superior.";
      await recordGovernanceAudit({
        action: AuditAction.INSUFFICIENT_GOVERNANCE_LEVEL,
        entity: AuditEntity.UserRole,
        metadata: {
          callerLevel: callerLevel ?? null,
          requiredLevel: "SYSTEM_ADMIN",
          attemptedScopeMode: targetScopeMode,
          reason,
        },
      });
      throw forbidden(reason, "Ação de governança negada", "GOVERNANCE_INSUFFICIENT_LEVEL");
    }
    return;
  }

  if (!isAtLeast(callerLevel, "MANAGER")) {
    const reason =
      "Para gerenciar o escopo de unidades de um usuário, é necessário nível de governança GERENTE ou superior.";
    await recordGovernanceAudit({
      action: AuditAction.INSUFFICIENT_GOVERNANCE_LEVEL,
      entity: AuditEntity.UserRole,
      metadata: {
        callerLevel: callerLevel ?? null,
        requiredLevel: "MANAGER",
        attemptedScopeMode: targetScopeMode,
        reason,
      },
    });
    throw forbidden(reason, "Ação de governança negada", "GOVERNANCE_INSUFFICIENT_LEVEL");
  }
}
