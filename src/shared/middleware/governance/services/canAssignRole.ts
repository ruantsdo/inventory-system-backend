import { AuditEntity } from "@/generated/prisma/client";
import { AuditAction } from "@/shared/audit";
import type { GovernanceLevel, RoleCategory } from "../../../../generated/prisma/enums";
import { forbidden } from "../../../errors/AppError";
import { recordGovernanceAudit } from "./governanceAudit";
import { isHigherThan } from "./governanceHelpers";

type RoleToAssign = {
  id?: string;
  category: RoleCategory;
  governanceLevel: GovernanceLevel | null;
  isProtected: boolean;
};

export async function canAssignRole(
  callerLevel: GovernanceLevel | null | undefined,
  role: RoleToAssign
): Promise<void> {
  if (role.isProtected && callerLevel !== "ROOT") {
    const reason = "Este cargo está protegido e só pode ser atribuído por um administrador ROOT.";
    await recordGovernanceAudit({
      action: AuditAction.PROTECTED_ROLE_VIOLATION,
      entity: AuditEntity.Role,
      entityId: role.id,
      metadata: {
        callerLevel: callerLevel ?? null,
        roleId: role.id,
        attemptedAction: "assign_role",
        reason,
      },
    });
    throw forbidden(reason, "Ação de governança negada", "GOVERNANCE_PROTECTED_ROLE");
  }

  if (role.governanceLevel !== null && !isHigherThan(callerLevel, role.governanceLevel)) {
    const reason = "Você não tem autoridade suficiente para atribuir este cargo.";
    await recordGovernanceAudit({
      action: AuditAction.INSUFFICIENT_GOVERNANCE_LEVEL,
      entity: AuditEntity.Role,
      entityId: role.id,
      metadata: {
        callerLevel: callerLevel ?? null,
        targetLevel: role.governanceLevel,
        roleId: role.id,
        attemptedAction: "assign_role",
        reason,
      },
    });
    throw forbidden(reason, "Ação de governança negada", "GOVERNANCE_INSUFFICIENT_LEVEL");
  }
}
