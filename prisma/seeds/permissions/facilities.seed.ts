import type { PrismaClient } from "../../../src/generated/prisma/client";
import { PermissionScopeMode } from "../../../src/generated/prisma/enums";
import type { PermissionSeed } from "./permissions.type";

const facilityPermissions: PermissionSeed[] = [
  {
    name: "facilities.view",
    displayName: "Visualizar unidades",
    description: "Permite consultar as unidades de saúde e almoxarifados cadastrados.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "facilities.create",
    displayName: "Criar unidades",
    description: "Permite cadastrar novas unidades no sistema.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "facilities.update",
    displayName: "Editar unidades",
    description: "Permite alterar dados de unidades cadastradas.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "facilities.delete",
    displayName: "Excluir unidades",
    description: "Permite marcar unidades como excluídas.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "facilities.restore",
    displayName: "Restaurar unidades",
    description: "Permite reativar unidades removidas.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "facilities.activate",
    displayName: "Ativar unidades",
    description: "Permite ativar o funcionamento de uma unidade.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "facilities.deactivate",
    displayName: "Desativar unidades",
    description: "Permite desativar temporariamente o funcionamento de uma unidade.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
];

export async function seedFacilityPermissions(prisma: PrismaClient) {
  for (const permission of facilityPermissions) {
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

  console.log(`Facility permissions seeded: ${facilityPermissions.length}`);
}
