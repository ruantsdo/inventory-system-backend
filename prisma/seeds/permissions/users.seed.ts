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
    name: "users.activate",
    displayName: "Ativar usuários",
    description: "Permite ativar o acesso de usuários ao sistema.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "users.deactivate",
    displayName: "Desativar usuários",
    description: "Permite desativar o acesso de usuários ao sistema.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "users.manage_scope",
    displayName: "Gerenciar escopo de usuários",
    description: "Permite gerenciar as restrições de escopo geográfico/administrativo de usuários.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "users.manage_facilities",
    displayName: "Gerenciar unidades dos usuários",
    description: "Permite vincular ou desvincular unidades aos usuários.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "users.manage_admin_roles",
    displayName: "Gerenciar cargos administrativos de usuários",
    description: "Permite gerenciar atribuições de cargos administrativos ou de alta privilégio.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "roles.manage",
    displayName: "Gerenciar cargos",
    description: "Permite criar e alterar cargos do sistema.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "roles.assign",
    displayName: "Atribuir cargos",
    description: "Permite atribuir cargos a usuários.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "roles.unassign",
    displayName: "Desatribuir cargos",
    description: "Permite remover a atribuição de cargos de usuários.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "roles.create",
    displayName: "Criar cargos",
    description: "Permite cadastrar novos cargos no sistema.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "roles.update",
    displayName: "Editar cargos",
    description: "Permite alterar dados de cargos cadastrados.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "roles.delete",
    displayName: "Excluir cargos",
    description: "Permite excluir cargos do sistema.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "roles.restore",
    displayName: "Restaurar cargos",
    description: "Permite restaurar cargos excluídos.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "permissions.manage",
    displayName: "Gerenciar permissões",
    description: "Permite criar e alterar permissões do sistema.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "permissions.view",
    displayName: "Visualizar permissões",
    description: "Permite consultar as permissões cadastradas no sistema.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "permissions.grant",
    displayName: "Conceder permissões",
    description: "Permite associar permissões a cargos.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "permissions.revoke",
    displayName: "Revogar permissões",
    description: "Permite remover permissões de cargos.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "users.grant_functional_roles",
    displayName: "Atribuir cargos funcionais",
    description:
      "Permite atribuir cargos da categoria FUNCIONAIS a usuários, mesmo sem possuir individualmente as permissões desses cargos. Não concede acesso às funcionalidades operacionais.",
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
