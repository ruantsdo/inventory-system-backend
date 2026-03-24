import type { PrismaClient } from "../../../src/generated/prisma/client";
import { PermissionScopeMode } from "../../../src/generated/prisma/enums";
import type { PermissionSeed } from "./permissions.type";

const inventoryPermissions: PermissionSeed[] = [
  {
    name: "inventory.view",
    displayName: "Visualizar estoque",
    description: "Permite consultar saldo e movimentações do estoque.",
    scopeMode: PermissionScopeMode.FACILITY,
  },
  {
    name: "inventory.create_movement",
    displayName: "Criar movimentação",
    description: "Permite registrar movimentações de estoque.",
    scopeMode: PermissionScopeMode.FACILITY,
  },
  {
    name: "inventory.adjust",
    displayName: "Ajustar estoque",
    description: "Permite corrigir saldo de estoque com justificativa.",
    scopeMode: PermissionScopeMode.FACILITY,
  },
  {
    name: "inventory.transfer",
    displayName: "Transferir estoque",
    description: "Permite transferir estoque entre unidades ou locais.",
    scopeMode: PermissionScopeMode.FACILITY,
  },
  {
    name: "inventory.reserve",
    displayName: "Reservar estoque",
    description: "Permite reservar saldo para atendimento ou requisição.",
    scopeMode: PermissionScopeMode.FACILITY,
  },
  {
    name: "inventory.release",
    displayName: "Liberar reserva",
    description: "Permite liberar reservas de estoque.",
    scopeMode: PermissionScopeMode.FACILITY,
  },
  {
    name: "inventory.receive",
    displayName: "Receber estoque",
    description: "Permite lançar entradas no estoque.",
    scopeMode: PermissionScopeMode.FACILITY,
  },
];

export async function seedInventoryPermissions(prisma: PrismaClient) {
  for (const permission of inventoryPermissions) {
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

  console.log(`Inventory permissions seeded: ${inventoryPermissions.length}`);
}
