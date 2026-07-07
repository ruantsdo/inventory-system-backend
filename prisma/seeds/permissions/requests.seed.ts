import type { PrismaClient } from "../../../src/generated/prisma/client";
import { PermissionScopeMode } from "../../../src/generated/prisma/enums";
import type { PermissionSeed } from "./permissions.type";

const requestsPermissions: PermissionSeed[] = [
  {
    name: "requests.view",
    displayName: "Visualizar solicitações",
    description: "Permite consultar solicitações de itens.",
    scopeMode: PermissionScopeMode.FACILITY,
  },
  {
    name: "requests.create",
    displayName: "Criar solicitações",
    description: "Permite abrir novas solicitações de itens.",
    scopeMode: PermissionScopeMode.FACILITY,
  },
  {
    name: "requests.approve",
    displayName: "Aprovar solicitações",
    description: "Permite aprovar solicitações de itens.",
    scopeMode: PermissionScopeMode.FACILITY,
  },
  {
    name: "requests.fulfill",
    displayName: "Atender solicitações",
    description: "Permite separar e finalizar solicitações.",
    scopeMode: PermissionScopeMode.FACILITY,
  },
  {
    name: "requests.cancel",
    displayName: "Cancelar solicitações",
    description: "Permite cancelar solicitações abertas.",
    scopeMode: PermissionScopeMode.FACILITY,
  },
  {
    name: "requests.reject",
    displayName: "Rejeitar solicitações",
    description: "Permite rejeitar solicitações de itens pendentes.",
    scopeMode: PermissionScopeMode.FACILITY,
  },
];

export async function seedRequestsPermissions(prisma: PrismaClient) {
  for (const permission of requestsPermissions) {
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

  console.log(`Requests permissions seeded: ${requestsPermissions.length}`);
}
