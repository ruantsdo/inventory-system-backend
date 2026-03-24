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
