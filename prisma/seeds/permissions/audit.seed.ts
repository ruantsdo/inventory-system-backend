import type { PrismaClient } from "../../../src/generated/prisma/client";
import { PermissionScopeMode } from "../../../src/generated/prisma/enums";
import type { PermissionSeed } from "./permissions.type";

const auditPermissions: PermissionSeed[] = [
  {
    name: "audit.view",
    displayName: "Visualizar auditoria",
    description: "Permite consultar registros de auditoria.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "audit.export",
    displayName: "Exportar auditoria",
    description: "Permite exportar os registros de auditoria do sistema.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "audit.user_actions",
    displayName: "Visualizar ações de usuários",
    description: "Permite consultar logs de ações realizadas pelos usuários.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "audit.inventory_actions",
    displayName: "Visualizar ações de estoque",
    description: "Permite consultar logs de ações de movimentação e ajuste de estoque.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "audit.security_events",
    displayName: "Visualizar eventos de segurança",
    description: "Permite consultar logs de eventos de segurança (logins, alterações de permissão, etc.).",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "reports.run",
    displayName: "Executar relatórios",
    description: "Permite gerar relatórios do sistema.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "reports.export",
    displayName: "Exportar relatórios",
    description: "Permite exportar relatórios para outros formatos.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "reports.view_all_facilities",
    displayName: "Visualizar relatórios de todas as unidades",
    description: "Permite gerar e visualizar relatórios consolidados de todas as unidades do sistema.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
];

export async function seedAuditPermissions(prisma: PrismaClient) {
  for (const permission of auditPermissions) {
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

  console.log(`Audit permissions seeded: ${auditPermissions.length}`);
}
