import type { PrismaClient } from "../../../src/generated/prisma/client";
import { PermissionScopeMode } from "../../../src/generated/prisma/enums";
import type { PermissionSeed } from "./permissions.type";

const batchesPermissions: PermissionSeed[] = [
  {
    name: "batches.view",
    displayName: "Visualizar lotes",
    description: "Permite consultar lotes cadastrados.",
    scopeMode: PermissionScopeMode.FACILITY,
  },
  {
    name: "batches.create",
    displayName: "Criar lotes",
    description: "Permite cadastrar novos lotes.",
    scopeMode: PermissionScopeMode.FACILITY,
  },
  {
    name: "batches.update",
    displayName: "Editar lotes",
    description: "Permite alterar dados permitidos de lotes.",
    scopeMode: PermissionScopeMode.FACILITY,
  },
  {
    name: "batches.delete",
    displayName: "Excluir lotes",
    description: "Permite marcar lotes como excluídos.",
    scopeMode: PermissionScopeMode.FACILITY,
  },
  {
    name: "batches.restore",
    displayName: "Restaurar lotes",
    description: "Permite reativar lotes removidos.",
    scopeMode: PermissionScopeMode.FACILITY,
  },
  {
    name: "batches.receive",
    displayName: "Receber lotes",
    description: "Permite registrar recebimento de lotes.",
    scopeMode: PermissionScopeMode.FACILITY,
  },
  {
    name: "batches.quarantine",
    displayName: "Quarentenar lotes",
    description: "Permite bloquear lotes em quarentena.",
    scopeMode: PermissionScopeMode.FACILITY,
  },
  {
    name: "batches.release",
    displayName: "Liberar lotes",
    description: "Permite liberar lotes para uso.",
    scopeMode: PermissionScopeMode.FACILITY,
  },
  {
    name: "batches.expire",
    displayName: "Expirar lotes",
    description: "Permite marcar lotes como expirados.",
    scopeMode: PermissionScopeMode.FACILITY,
  },
  {
    name: "batches.adjust",
    displayName: "Ajustar lotes",
    description: "Permite aplicar ajustes em lotes.",
    scopeMode: PermissionScopeMode.FACILITY,
  },
];

export async function seedBatchesPermissions(prisma: PrismaClient) {
  for (const permission of batchesPermissions) {
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

  console.log(`Batches permissions seeded: ${batchesPermissions.length}`);
}
