import type { PrismaClient } from "../../../src/generated/prisma/client";
import { PermissionScopeMode } from "../../../src/generated/prisma/enums";
import type { PermissionSeed } from "./permissions.type";

const usersPermissions: PermissionSeed[] = [
  {
    name: "users.view",
    displayName: "Visualizar usuários",
    description: "Permite consultar usuários cadastrados.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "users.create",
    displayName: "Criar usuários",
    description: "Permite cadastrar novos usuários.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "users.update",
    displayName: "Editar usuários",
    description: "Permite alterar dados de usuários.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "users.delete",
    displayName: "Excluir usuários",
    description: "Permite marcar usuários como excluídos.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "users.restore",
    displayName: "Restaurar usuários",
    description: "Permite reativar usuários removidos.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "roles.manage",
    displayName: "Gerenciar cargos",
    description: "Permite criar e alterar cargos do sistema.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "permissions.manage",
    displayName: "Gerenciar permissões",
    description: "Permite criar e alterar permissões do sistema.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
];

export async function seedUsersPermissions(prisma: PrismaClient) {
  for (const permission of usersPermissions) {
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

  console.log(`Users permissions seeded: ${usersPermissions.length}`);
}
