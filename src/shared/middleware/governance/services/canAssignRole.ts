import type { GovernanceLevel, RoleCategory } from "../../../../generated/prisma/enums";
import { forbidden } from "../../../errors/AppError";
import { isHigherThan } from "./governanceHelpers";

type RoleToAssign = {
  category: RoleCategory;
  governanceLevel: GovernanceLevel | null;
  isProtected: boolean;
};

export function canAssignRole(
  callerLevel: GovernanceLevel | null | undefined,
  role: RoleToAssign
): void {
  if (role.isProtected && callerLevel !== "ROOT") {
    throw forbidden(
      "Este cargo está protegido e só pode ser atribuído por um administrador raiz.",
      "Ação de governança negada",
      "GOVERNANCE_PROTECTED_ROLE"
    );
  }

  if (role.governanceLevel !== null && !isHigherThan(callerLevel, role.governanceLevel)) {
    throw forbidden(
      "Você não tem autoridade suficiente para atribuir este cargo.",
      "Ação de governança negada",
      "GOVERNANCE_INSUFFICIENT_LEVEL"
    );
  }
}
