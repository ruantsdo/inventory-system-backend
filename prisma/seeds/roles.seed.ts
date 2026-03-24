import type { PrismaClient } from "../../src/generated/prisma/client";

type RoleSeed = {
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
};

const roles: RoleSeed[] = [
  {
    name: "ADMIN",
    displayName: "Super Administrador",
    description: "Acesso total ao sistema.",
    permissions: [
      "cities.view",
      "cities.create",
      "cities.update",
      "cities.delete",
      "cities.restore",
      "manufacturers.view",
      "manufacturers.create",
      "manufacturers.update",
      "manufacturers.delete",
      "manufacturers.restore",
      "suppliers.view",
      "suppliers.create",
      "suppliers.update",
      "suppliers.delete",
      "suppliers.restore",
      "item_types.view",
      "item_types.create",
      "item_types.update",
      "item_types.delete",
      "item_types.restore",
      "items.view",
      "items.create",
      "items.update",
      "items.delete",
      "items.restore",
      "items.manage_attributes",
      "items.activate",
      "items.deactivate",
      "batches.view",
      "batches.create",
      "batches.update",
      "batches.delete",
      "batches.restore",
      "batches.receive",
      "batches.quarantine",
      "batches.release",
      "batches.expire",
      "batches.adjust",
      "inventory.view",
      "inventory.create_movement",
      "inventory.adjust",
      "inventory.transfer",
      "inventory.reserve",
      "inventory.release",
      "inventory.receive",
      "requests.view",
      "requests.create",
      "requests.approve",
      "requests.fulfill",
      "requests.cancel",
      "controlled.view",
      "controlled.request",
      "controlled.authorize",
      "controlled.authorize_any_facility",
      "controlled.dispatch",
      "controlled.deliver",
      "controlled.receive",
      "users.view",
      "users.create",
      "users.update",
      "users.delete",
      "users.restore",
      "roles.manage",
      "permissions.manage",
      "audit.view",
      "reports.run",
      "reports.export",
      "system.settings",
      "data.import",
      "data.export",
      "purchases.create",
      "purchases.view",
      "purchases.receive",
    ],
  },
  {
    name: "ALMOXARIFADO_PRINCIPAL",
    displayName: "Almoxarifado Principal",
    description: "Responsável pela estrutura mestre e coordenação central do estoque.",
    permissions: [
      "cities.view",
      "manufacturers.view",
      "manufacturers.create",
      "manufacturers.update",
      "manufacturers.delete",
      "manufacturers.restore",
      "suppliers.view",
      "suppliers.create",
      "suppliers.update",
      "suppliers.delete",
      "suppliers.restore",
      "item_types.view",
      "item_types.create",
      "item_types.update",
      "item_types.delete",
      "item_types.restore",
      "items.view",
      "items.create",
      "items.update",
      "items.delete",
      "items.restore",
      "items.manage_attributes",
      "items.activate",
      "items.deactivate",
      "batches.view",
      "batches.create",
      "batches.update",
      "batches.delete",
      "batches.restore",
      "batches.receive",
      "batches.quarantine",
      "batches.release",
      "batches.expire",
      "batches.adjust",
      "inventory.view",
      "inventory.create_movement",
      "inventory.adjust",
      "inventory.transfer",
      "inventory.reserve",
      "inventory.release",
      "inventory.receive",
      "requests.view",
      "requests.approve",
      "requests.fulfill",
      "controlled.view",
      "controlled.request",
      "controlled.authorize",
      "controlled.dispatch",
      "controlled.deliver",
      "controlled.receive",
      "reports.run",
    ],
  },
  {
    name: "ALMOXARIFADO_LOCAL",
    displayName: "Almoxarifado Local",
    description: "Opera o estoque da unidade vinculada ao usuário.",
    permissions: [
      "items.view",
      "batches.view",
      "batches.receive",
      "batches.adjust",
      "inventory.view",
      "inventory.create_movement",
      "inventory.adjust",
      "inventory.transfer",
      "inventory.reserve",
      "inventory.release",
      "inventory.receive",
      "requests.view",
      "requests.fulfill",
      "controlled.view",
      "controlled.receive",
      "controlled.deliver",
    ],
  },
  {
    name: "WAREHOUSE_LEADER",
    displayName: "Líder de Armazém",
    description: "Responsável pela operação e edição dos dados do próprio armazém.",
    permissions: [
      "items.view",
      "items.update",
      "inventory.view",
      "inventory.adjust",
      "batches.view",
      "batches.update",
      "requests.view",
      "requests.approve",
      "reports.run",
    ],
  },
  {
    name: "WAREHOUSE_MANAGER",
    displayName: "Gerente de Armazéns",
    description: "Coordena múltiplas unidades e supervisiona estoque de armazéns atribuídos.",
    permissions: [
      "items.view",
      "items.update",
      "inventory.view",
      "inventory.adjust",
      "inventory.transfer",
      "requests.view",
      "requests.approve",
      "batches.view",
      "reports.run",
    ],
  },
  {
    name: "PROCUREMENT",
    displayName: "Compras",
    description: "Responsável por fornecedores, fabricantes e processos de compra.",
    permissions: [
      "manufacturers.view",
      "manufacturers.create",
      "manufacturers.update",
      "manufacturers.delete",
      "manufacturers.restore",
      "suppliers.view",
      "suppliers.create",
      "suppliers.update",
      "suppliers.delete",
      "suppliers.restore",
      "items.view",
      "item_types.view",
      "batches.view",
      "purchases.create",
      "purchases.view",
      "purchases.receive",
      "reports.run",
    ],
  },
  {
    name: "RECEPTIONIST",
    displayName: "Recepcionista",
    description: "Recebe itens e pode registrar entrega conforme o fluxo permitido.",
    permissions: [
      "inventory.view",
      "inventory.receive",
      "batches.view",
      "batches.receive",
      "items.view",
      "requests.view",
      "controlled.view",
      "controlled.receive",
      "controlled.deliver",
    ],
  },
  {
    name: "DELIVERER",
    displayName: "Entregador",
    description: "Responsável por despachar e entregar itens autorizados.",
    permissions: ["requests.view", "controlled.view", "controlled.deliver", "inventory.view"],
  },
  {
    name: "MEDIC",
    displayName: "Médico",
    description: "Pode solicitar e autorizar itens controlados em qualquer unidade.",
    permissions: [
      "items.view",
      "inventory.view",
      "controlled.view",
      "controlled.request",
      "controlled.authorize_any_facility",
      "requests.view",
    ],
  },
  {
    name: "PHARMACIST",
    displayName: "Farmacêutico",
    description: "Executa validação e liberação operacional de itens controlados.",
    permissions: [
      "items.view",
      "inventory.view",
      "controlled.view",
      "controlled.dispatch",
      "controlled.deliver",
      "controlled.receive",
      "requests.view",
    ],
  },
  {
    name: "CONTROLLED_AUTHORIZER",
    displayName: "Autorizador de Controlados",
    description: "Autoriza itens controlados na unidade vinculada ao usuário.",
    permissions: [
      "items.view",
      "inventory.view",
      "controlled.view",
      "controlled.request",
      "controlled.authorize",
      "requests.view",
    ],
  },
  {
    name: "AUDITOR",
    displayName: "Auditor",
    description: "Consulta dados, relatórios e trilhas de auditoria.",
    permissions: [
      "audit.view",
      "reports.run",
      "reports.export",
      "items.view",
      "inventory.view",
      "requests.view",
      "batches.view",
      "controlled.view",
    ],
  },
  {
    name: "VIEWER",
    displayName: "Visualizador",
    description: "Apenas leitura de dados do sistema.",
    permissions: [
      "items.view",
      "inventory.view",
      "batches.view",
      "requests.view",
      "controlled.view",
    ],
  },
  {
    name: "INVENTORY_ANALYST",
    displayName: "Analista de Inventário",
    description: "Analisa estoque, relatórios e propõe ajustes.",
    permissions: [
      "items.view",
      "inventory.view",
      "inventory.adjust",
      "reports.run",
      "reports.export",
      "batches.view",
    ],
  },
];

export async function seedRoles(prisma: PrismaClient) {
  const permissions = await prisma.permission.findMany({
    select: { id: true, name: true },
  });

  const permissionMap = new Map(permissions.map((p) => [p.name, p.id]));

  const createdRoleIds: string[] = [];

  for (const role of roles) {
    const savedRole = await prisma.role.upsert({
      where: { name: role.name },
      update: {
        displayName: role.displayName,
        description: role.description,
      },
      create: {
        name: role.name,
        displayName: role.displayName,
        description: role.description,
      },
    });

    createdRoleIds.push(savedRole.id);

    const rolePermissionData = role.permissions
      .map((permissionName) => {
        const permissionId = permissionMap.get(permissionName);
        if (!permissionId) return null;
        return {
          roleId: savedRole.id,
          permissionId,
        };
      })
      .filter((item): item is { roleId: string; permissionId: string } => item !== null);

    await prisma.rolePermission.deleteMany({
      where: { roleId: savedRole.id },
    });

    if (rolePermissionData.length > 0) {
      await prisma.rolePermission.createMany({
        data: rolePermissionData,
        skipDuplicates: true,
      });
    }
  }

  console.log(`Roles seeded: ${roles.length}`);

  return {
    roleNames: roles.map((role) => role.name),
    createdRoleIds,
  };
}
