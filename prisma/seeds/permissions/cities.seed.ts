import type { PrismaClient } from "../../../src/generated/prisma/client";
import { PermissionScopeMode } from "../../../src/generated/prisma/enums";
import type { PermissionSeed } from "./permissions.type";

const cityPermissions: PermissionSeed[] = [
  {
    name: "cities.view",
    displayName: "Visualizar cidades",
    description: "Permite listar e consultar cidades cadastradas.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "cities.create",
    displayName: "Criar cidades",
    description: "Permite cadastrar novas cidades no sistema.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "cities.update",
    displayName: "Editar cidades",
    description: "Permite alterar dados de cidades já cadastradas.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "cities.delete",
    displayName: "Excluir cidades",
    description: "Permite marcar cidades como excluídas.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "cities.restore",
    displayName: "Restaurar cidades",
    description: "Permite reativar cidades removidas.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
];

export async function seedCityPermissions(prisma: PrismaClient) {
  for (const permission of cityPermissions) {
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

  console.log(`City permissions seeded: ${cityPermissions.length}`);
}
