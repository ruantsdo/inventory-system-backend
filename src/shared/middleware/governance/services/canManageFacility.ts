import type { GovernanceLevel } from "../../../../generated/prisma/enums";
import { forbidden } from "../../../errors/AppError";
import type { Actions } from "../../../utils/extractors";
import { isAtLeast } from "./governanceHelpers";

export function canManageFacility(
  callerLevel: GovernanceLevel | null | undefined,
  action: Actions
): void {
  if (action === "deactivate" || action === "delete") {
    if (!isAtLeast(callerLevel, "SYSTEM_ADMIN")) {
      throw forbidden(
        `Para ${action === "deactivate" ? "desativar" : "excluir"} uma unidade, é necessário nível de governança SYSTEM_ADMIN ou superior.`,
        "Ação de governança negada",
        "GOVERNANCE_INSUFFICIENT_LEVEL"
      );
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
    throw forbidden(
      `Para ${actionLabel[action]} uma unidade, é necessário nível de governança MANAGER ou superior.`,
      "Ação de governança negada",
      "GOVERNANCE_INSUFFICIENT_LEVEL"
    );
  }
}
