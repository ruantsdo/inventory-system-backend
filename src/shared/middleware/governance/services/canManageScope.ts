import type { GovernanceLevel, UserRoleScopeMode } from "../../../../generated/prisma/enums";
import { forbidden } from "../../../errors/AppError";
import { isAtLeast } from "./governanceHelpers";

export function canManageScope(
  callerLevel: GovernanceLevel | null | undefined,
  targetScopeMode: UserRoleScopeMode
): void {
  if (targetScopeMode === "GLOBAL") {
    if (!isAtLeast(callerLevel, "SYSTEM_ADMIN")) {
      throw forbidden(
        "Para conceder escopo global a um usuário, é necessário nível de governança SYSTEM_ADMIN ou superior.",
        "Ação de governança negada",
        "GOVERNANCE_INSUFFICIENT_LEVEL"
      );
    }
    return;
  }

  if (!isAtLeast(callerLevel, "MANAGER")) {
    throw forbidden(
      "Para gerenciar o escopo de unidades de um usuário, é necessário nível de governança MANAGER ou superior.",
      "Ação de governança negada",
      "GOVERNANCE_INSUFFICIENT_LEVEL"
    );
  }
}
