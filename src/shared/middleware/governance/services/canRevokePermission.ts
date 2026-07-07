import type { GovernanceLevel, RoleCategory } from "../../../../generated/prisma/enums";
import { forbidden } from "../../../errors/AppError";
import { isAtLeast } from "./governanceHelpers";

type TargetRole = {
  category: RoleCategory;
  governanceLevel: GovernanceLevel | null;
};

export function canRevokePermission(
  callerLevel: GovernanceLevel | null | undefined,
  targetRole: TargetRole
): void {
  if (targetRole.category === "ADMINISTRATIVE" && !isAtLeast(callerLevel, "SUPER_ADMIN")) {
    throw forbidden(
      "Apenas administradores com nível SUPER_ADMIN ou superior podem revogar permissões de cargos administrativos.",
      "Ação de governança negada",
      "GOVERNANCE_INSUFFICIENT_LEVEL"
    );
  }
}
