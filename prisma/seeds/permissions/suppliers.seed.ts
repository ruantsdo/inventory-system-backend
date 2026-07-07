import type { PrismaClient } from "../../../src/generated/prisma/client";
import { PermissionScopeMode } from "../../../src/generated/prisma/enums";
import type { PermissionSeed } from "./permissions.type";

const suppliersPermissions: PermissionSeed[] = [
  {
    name: "suppliers.view",
    displayName: "Visualizar fornecedores",
    description: "Permite consultar fornecedores cadastrados.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "suppliers.create",
    displayName: "Criar fornecedores",
    description: "Permite cadastrar novos fornecedores.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "suppliers.update",
    displayName: "Editar fornecedores",
    description: "Permite alterar dados de fornecedores.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "suppliers.delete",
    displayName: "Excluir fornecedores",
    description: "Permite marcar fornecedores como excluídos.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "suppliers.restore",
    displayName: "Restaurar fornecedores",
    description: "Permite reativar fornecedores removidos.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
];

export async function seedSuppliersPermissions(prisma: PrismaClient) {
  for (const permission of suppliersPermissions) {
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

  console.log(`Suppliers permissions seeded: ${suppliersPermissions.length}`);
}
