import type { PrismaClient } from "../../../src/generated/prisma/client";
import { PermissionScopeMode } from "../../../src/generated/prisma/enums";
import type { PermissionSeed } from "./permissions.type";

const itemsPermissions: PermissionSeed[] = [
  {
    name: "items.view",
    displayName: "Visualizar itens",
    description: "Permite consultar itens cadastrados.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "items.create",
    displayName: "Criar itens",
    description: "Permite cadastrar novos itens.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "items.update",
    displayName: "Editar itens",
    description: "Permite alterar dados de itens existentes.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "items.delete",
    displayName: "Excluir itens",
    description: "Permite marcar itens como excluídos.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "items.restore",
    displayName: "Restaurar itens",
    description: "Permite reativar itens removidos.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "items.manage_attributes",
    displayName: "Gerenciar atributos de itens",
    description: "Permite alterar atributos específicos por tipo de item.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "items.activate",
    displayName: "Ativar itens",
    description: "Permite ativar itens inativos.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "items.deactivate",
    displayName: "Desativar itens",
    description: "Permite desativar itens ativos.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
];

export async function seedItemsPermissions(prisma: PrismaClient) {
  for (const permission of itemsPermissions) {
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

  console.log(`Items permissions seeded: ${itemsPermissions.length}`);
}
