import { AuditEntity } from "@/generated/prisma/client";
import { AuditAction } from "@/shared/audit";
import type { GovernanceLevel, RoleCategory } from "../../../../generated/prisma/enums";
import { forbidden } from "../../../errors/AppError";
import { recordGovernanceAudit } from "./governanceAudit";
import { GOVERNANCE_RANK, isHigherThan } from "./governanceHelpers";

type TargetUserRole = {
  category: RoleCategory;
  governanceLevel: GovernanceLevel | null;
};

function resolveHighestAdminLevel(roles: TargetUserRole[]): GovernanceLevel | null {
  let highest: GovernanceLevel | null = null;

  for (const role of roles) {
    if (role.category !== "ADMINISTRATIVE" || !role.governanceLevel) continue;
    if (!highest || GOVERNANCE_RANK[role.governanceLevel] > GOVERNANCE_RANK[highest]) {
      highest = role.governanceLevel;
    }
  }

  return highest;
}

export async function canManageUser(
  callerLevel: GovernanceLevel | null | undefined,
  targetRoles: TargetUserRole[],
  targetUserId?: string
): Promise<void> {
  const targetHighestLevel = resolveHighestAdminLevel(targetRoles);

  if (targetHighestLevel === null) {
    return;
  }

  if (!isHigherThan(callerLevel, targetHighestLevel)) {
    const reason = "Você não tem autoridade suficiente para gerenciar este usuário.";
    await recordGovernanceAudit({
      action: AuditAction.INSUFFICIENT_GOVERNANCE_LEVEL,
      entity: AuditEntity.User,
      entityId: targetUserId,
      metadata: {
        callerLevel: callerLevel ?? null,
        targetLevel: targetHighestLevel,
        targetUserId,
        attemptedAction: "manage_user",
        reason,
      },
    });
    throw forbidden(reason, "Ação de governança negada", "GOVERNANCE_INSUFFICIENT_LEVEL");
  }
}
