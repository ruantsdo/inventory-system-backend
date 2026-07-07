import type { GovernanceLevel, RoleCategory } from "../../../../generated/prisma/enums";
import { forbidden } from "../../../errors/AppError";
import { isHigherThan } from "./governanceHelpers";

type RoleToRemove = {
  category: RoleCategory;
  governanceLevel: GovernanceLevel | null;
  isProtected: boolean;
};

export function canRemoveRole(
  callerLevel: GovernanceLevel | null | undefined,
  role: RoleToRemove
): void {
  if (role.isProtected && callerLevel !== "ROOT") {
    throw forbidden(
      "Este cargo está protegido e só pode ser removido por um administrador raiz.",
      "Ação de governança negada",
      "GOVERNANCE_PROTECTED_ROLE"
    );
  }

  if (role.governanceLevel !== null && !isHigherThan(callerLevel, role.governanceLevel)) {
    throw forbidden(
      "Você não tem autoridade suficiente para remover este cargo.",
      "Ação de governança negada",
      "GOVERNANCE_INSUFFICIENT_LEVEL"
    );
  }
}
