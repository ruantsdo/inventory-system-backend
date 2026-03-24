import type { PrismaClient } from "../../../src/generated/prisma/client";
import { PermissionScopeMode } from "../../../src/generated/prisma/enums";
import type { PermissionSeed } from "./permissions.type";

const controlledItemsPermissions: PermissionSeed[] = [
  {
    name: "controlled.view",
    displayName: "Visualizar controlados",
    description: "Permite consultar itens controlados.",
    scopeMode: PermissionScopeMode.FACILITY,
  },
  {
    name: "controlled.request",
    displayName: "Solicitar controlados",
    description: "Permite solicitar itens controlados.",
    scopeMode: PermissionScopeMode.FACILITY,
  },
  {
    name: "controlled.authorize",
    displayName: "Autorizar controlados",
    description: "Permite autorizar itens controlados na unidade vinculada.",
    scopeMode: PermissionScopeMode.FACILITY,
  },
  {
    name: "controlled.authorize_any_facility",
    displayName: "Autorizar controlados em qualquer unidade",
    description: "Permite autorizar itens controlados em qualquer unidade.",
    scopeMode: PermissionScopeMode.GLOBAL,
  },
  {
    name: "controlled.dispatch",
    displayName: "Despachar controlados",
    description: "Permite despachar itens controlados após autorização válida.",
    scopeMode: PermissionScopeMode.FACILITY,
  },
  {
    name: "controlled.deliver",
    displayName: "Entregar controlados",
    description: "Permite entregar itens controlados ao solicitante.",
    scopeMode: PermissionScopeMode.FACILITY,
  },
  {
    name: "controlled.receive",
    displayName: "Receber controlados",
    description: "Permite registrar recebimento de itens controlados.",
    scopeMode: PermissionScopeMode.FACILITY,
  },
];

export async function seedControlledItemsPermissions(prisma: PrismaClient) {
  for (const permission of controlledItemsPermissions) {
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

  console.log(`Controlled items permissions seeded: ${controlledItemsPermissions.length}`);
}
