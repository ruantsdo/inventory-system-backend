import { AuditEntity } from "@/generated/prisma/client";
import { AuditAction } from "@/shared/audit";
import type { GovernanceLevel, RoleCategory } from "../../../../generated/prisma/enums";
import { forbidden } from "../../../errors/AppError";
import { recordGovernanceAudit } from "./governanceAudit";
import { isAtLeast } from "./governanceHelpers";

type TargetRole = {
  id?: string;
  category: RoleCategory;
  governanceLevel: GovernanceLevel | null;
};

export async function canRevokePermission(
  callerLevel: GovernanceLevel | null | undefined,
  targetRole: TargetRole
): Promise<void> {
  if (targetRole.category === "ADMINISTRATIVE" && !isAtLeast(callerLevel, "SUPER_ADMIN")) {
    const reason =
      "Apenas administradores com nível SUPER ou superior podem revogar permissões de cargos administrativos.";
    await recordGovernanceAudit({
      action: AuditAction.INSUFFICIENT_GOVERNANCE_LEVEL,
      entity: AuditEntity.Role,
      entityId: targetRole.id,
      metadata: {
        callerLevel: callerLevel ?? null,
        requiredLevel: "SUPER_ADMIN",
        roleId: targetRole.id,
        attemptedAction: "revoke_permission",
        reason,
      },
    });
    throw forbidden(reason, "Ação de governança negada", "GOVERNANCE_INSUFFICIENT_LEVEL");
  }
}
