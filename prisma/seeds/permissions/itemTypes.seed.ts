import type { PrismaClient } from "../../../src/generated/prisma/client";
import { PermissionScopeMode } from "../../../src/generated/prisma/enums";
import type { PermissionSeed } from "./permissions.type";

const itemTypesPermissions: PermissionSeed[] = [
  {
    name: "item_types.view",
    displayName: "Visualizar tipos de item",
    description: "Permite consultar tipos de item cadastrados.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "item_types.create",
    displayName: "Criar tipos de item",
    description: "Permite cadastrar novos tipos de item.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "item_types.update",
    displayName: "Editar tipos de item",
    description: "Permite alterar tipos de item existentes.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "item_types.delete",
    displayName: "Excluir tipos de item",
    description: "Permite marcar tipos de item como excluídos.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "item_types.restore",
    displayName: "Restaurar tipos de item",
    description: "Permite reativar tipos de item removidos.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
];

export async function seedItemTypesPermissions(prisma: PrismaClient) {
  for (const permission of itemTypesPermissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {
        displayName: permission.displayName,
        description: permission.description,
        scopeMode: permission.scopeMode,
      },
      create: permission,
    });
  }

  console.log(`Item types permissions seeded: ${itemTypesPermissions.length}`);
}
