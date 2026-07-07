import type { PrismaClient } from "../../../src/generated/prisma/client";
import { PermissionScopeMode } from "../../../src/generated/prisma/enums";
import type { PermissionSeed } from "./permissions.type";

const manufacturerPermissions: PermissionSeed[] = [
  {
    name: "manufacturers.view",
    displayName: "Visualizar fabricantes",
    description: "Permite consultar fabricantes cadastrados.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "manufacturers.create",
    displayName: "Criar fabricantes",
    description: "Permite cadastrar novos fabricantes.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "manufacturers.update",
    displayName: "Editar fabricantes",
    description: "Permite alterar dados de fabricantes.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "manufacturers.delete",
    displayName: "Excluir fabricantes",
    description: "Permite marcar fabricantes como excluídos.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "manufacturers.restore",
    displayName: "Restaurar fabricantes",
    description: "Permite reativar fabricantes removidos.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
];

export async function seedManufacturerPermissions(prisma: PrismaClient) {
  for (const permission of manufacturerPermissions) {
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

  console.log(`Manufacturer permissions seeded: ${manufacturerPermissions.length}`);
}
