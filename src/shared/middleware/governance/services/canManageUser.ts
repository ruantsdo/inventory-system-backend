import type { GovernanceLevel, RoleCategory } from "../../../../generated/prisma/enums";
import { forbidden } from "../../../errors/AppError";
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

export function canManageUser(
  callerLevel: GovernanceLevel | null | undefined,
  targetRoles: TargetUserRole[]
): void {
  const targetHighestLevel = resolveHighestAdminLevel(targetRoles);

  if (targetHighestLevel === null) {
    return;
  }

  if (!isHigherThan(callerLevel, targetHighestLevel)) {
    throw forbidden(
      "Você não tem autoridade suficiente para gerenciar este usuário.",
      "Ação de governança negada",
      "GOVERNANCE_INSUFFICIENT_LEVEL"
    );
  }
}
