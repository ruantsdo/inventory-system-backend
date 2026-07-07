import { prisma } from "@/shared/db/prisma";
import type { CreateUserPayload, UpdateUserPayload } from "@/shared/types/api.contracts";
import type { GovernanceLevel } from "../../../../generated/prisma/enums";
import { forbidden } from "../../../errors/AppError";
import type { Actions } from "../../../utils/extractors";

export async function rootShielding(
  callerLevel: GovernanceLevel | null | undefined,
  action: Actions,
  targetId: string | null | undefined,
  data: UpdateUserPayload | CreateUserPayload | null
): Promise<void> {
  if (targetId && (action === "update" || action === "deactivate" || action === "delete")) {
    const targetIsRoot = await prisma.userRole.findFirst({
      where: {
        userId: targetId,
        role: {
          governanceLevel: "ROOT",
        },
        isActive: true,
      },
    });

    if (targetIsRoot) {
      if (action === "deactivate" || action === "delete") {
        throw forbidden(
          `Não é possível ${action === "deactivate" ? "desativar" : "excluir"} um usuário com nível de governança ROOT.`,
          "Ação de governança negada",
          "GOVERNANCE_INSUFFICIENT_LEVEL"
        );
      }

      if (callerLevel !== "ROOT") {
        throw forbidden(
          "Você não possui privilégios suficientes para editar um usuário com nível de governança ROOT.",
          "Ação de governança negada",
          "GOVERNANCE_INSUFFICIENT_LEVEL"
        );
      }

      if (data?.roles) {
        throw forbidden(
          "Não é permitido alterar os cargos de um usuário ROOT por esta via.",
          "Ação de governança negada",
          "GOVERNANCE_INSUFFICIENT_LEVEL"
        );
      }
    }
  }

  if ((action === "create" || action === "update") && data?.roles) {
    for (const role of data.roles) {
      const roleData = await prisma.role.findUnique({
        where: { id: role.roleId },
      });

      if (roleData?.governanceLevel === "ROOT" && callerLevel !== "ROOT") {
        throw forbidden(
          "Você não possui privilégios suficientes para associar o cargo ROOT a este usuário.",
          "Ação de governança negada",
          "GOVERNANCE_INSUFFICIENT_LEVEL"
        );
      }
    }
  }
}
