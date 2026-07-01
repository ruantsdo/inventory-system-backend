import type { PrismaClient } from "../../../src/generated/prisma/client";
import { PermissionScopeMode } from "../../../src/generated/prisma/enums";
import type { PermissionSeed } from "./permissions.type";

const systemAndIntegrationPermissions: PermissionSeed[] = [
  {
    name: "system.settings",
    displayName: "Configurações do sistema",
    description: "Permite alterar configurações globais do sistema.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "data.import",
    displayName: "Importar dados",
    description: "Permite importar dados em lote para o sistema.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "data.export",
    displayName: "Exportar dados",
    description: "Permite exportar dados do sistema.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "system.logs",
    displayName: "Visualizar logs do sistema",
    description: "Permite consultar logs de execução e erros do sistema.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "system.health",
    displayName: "Visualizar saúde do sistema",
    description: "Permite consultar o status de saúde e integridade do sistema.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "system.backup",
    displayName: "Gerar backup do sistema",
    description: "Permite solicitar ou agendar a geração de backups do banco de dados e arquivos.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "system.restore",
    displayName: "Restaurar backup do sistema",
    description: "Permite restaurar o sistema a partir de um backup anterior.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
];

export async function seedSystemAndIntegrationPermissions(prisma: PrismaClient) {
  for (const permission of systemAndIntegrationPermissions) {
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

  console.log(
    `System and integration permissions seeded: ${systemAndIntegrationPermissions.length}`
  );
}
