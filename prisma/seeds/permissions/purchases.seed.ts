import type { PrismaClient } from "../../../src/generated/prisma/client";
import { PermissionScopeMode } from "../../../src/generated/prisma/enums";
import type { PermissionSeed } from "./permissions.type";

const purchasesPermissions: PermissionSeed[] = [
  {
    name: "purchases.create",
    displayName: "Criar compras",
    description: "Permite criar pedidos de compra.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "purchases.view",
    displayName: "Visualizar compras",
    description: "Permite consultar pedidos de compra.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "purchases.receive",
    displayName: "Receber compras",
    description: "Permite registrar o recebimento de compras.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
];

export async function seedPurchasesPermissions(prisma: PrismaClient) {
  for (const permission of purchasesPermissions) {
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

  console.log(`Purchases permissions seeded: ${purchasesPermissions.length}`);
}
