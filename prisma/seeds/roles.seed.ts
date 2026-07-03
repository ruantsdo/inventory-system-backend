import type { PrismaClient } from "../../src/generated/prisma/client";
import type { GovernanceLevel, RoleCategory } from "../../src/generated/prisma/enums";

type RoleSeed = {
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  category: RoleCategory;
  governanceLevel?: GovernanceLevel;
  isProtected?: boolean;
};

const administrativeRoles: RoleSeed[] = [
  {
    name: "ADMIN_ROOT",
    displayName: "Administrador ROOT",
    description: "Conta raiz do sistema. Possui autoridade máxima e é imutável.",
    category: "ADMINISTRATIVE",
    governanceLevel: "ROOT",
    isProtected: true,
    permissions: ["*"],
  },

  {
    name: "SUPER_ADMIN",
    displayName: "Super Administrador",
    description:
      "Administração global da plataforma. Pode gerenciar todos os usuários e configurações, exceto o ROOT.",
    category: "ADMINISTRATIVE",
    governanceLevel: "SUPER_ADMIN",
    isProtected: true,
    permissions: [
      "users.view",
      "users.create",
      "users.update",
      "users.delete",
      "users.restore",
      "users.activate",
      "users.deactivate",
      "users.manage_scope",
      "users.manage_facilities",
      "users.manage_admin_roles",
      "users.grant_functional_roles",

      "roles.assign",
      "roles.unassign",
      "roles.create",
      "roles.update",
      "roles.delete",
      "roles.restore",

      "permissions.view",
      "permissions.grant",
      "permissions.revoke",

      "cities.view",

      "facilities.view",
      "facilities.create",
      "facilities.update",
      "facilities.delete",
      "facilities.restore",
      "facilities.activate",
      "facilities.deactivate",

      "audit.view",
      "audit.export",
      "audit.user_actions",
      "audit.inventory_actions",
      "audit.security_events",

      "reports.run",
      "reports.export",
      "reports.view_all_facilities",

      "system.settings",
      "system.logs",
      "system.health",
      "system.backup",
      "system.restore",

      "data.import",
      "data.export",
    ],
  },

  {
    name: "SYSTEM_ADMIN",
    displayName: "Administrador de Sistema",
    description:
      "Responsável pela administração operacional do sistema. Não pode alterar Super Administradores.",
    category: "ADMINISTRATIVE",
    governanceLevel: "SYSTEM_ADMIN",
    permissions: [
      "users.view",
      "users.create",
      "users.update",
      "users.delete",
      "users.restore",
      "users.activate",
      "users.deactivate",
      "users.manage_scope",
      "users.manage_facilities",
      "users.grant_functional_roles",

      "roles.assign",
      "roles.unassign",

      "permissions.view",

      "cities.view",

      "facilities.view",
      "facilities.create",
      "facilities.update",
      "facilities.activate",
      "facilities.deactivate",

      "audit.view",
      "audit.user_actions",
      "audit.security_events",

      "reports.run",
      "reports.export",
      "reports.view_all_facilities",

      "system.settings",
      "system.logs",
      "system.health",

      "data.import",
      "data.export",
    ],
  },

  {
    name: "MANAGER",
    displayName: "Gerente",
    description: "Gerente administrativo genérico. Atua dentro do escopo atribuído.",
    category: "ADMINISTRATIVE",
    governanceLevel: "MANAGER",
    permissions: [
      "users.view",
      "users.create",
      "users.update",
      "users.activate",
      "users.deactivate",
      "users.grant_functional_roles",

      "roles.assign",
      "roles.unassign",

      "cities.view",

      "facilities.view",

      "reports.run",
    ],
  },

  {
    name: "RH_MANAGER",
    displayName: "Gerente de RH",
    description: "Responsável pela gestão de usuários, lotações e vínculos funcionais.",
    category: "ADMINISTRATIVE",
    governanceLevel: "MANAGER",
    permissions: [
      "users.view",
      "users.create",
      "users.update",
      "users.activate",
      "users.deactivate",
      "users.manage_facilities",

      "users.grant_functional_roles",

      "roles.assign",
      "roles.unassign",

      "permissions.view",

      "cities.view",
      "facilities.view",

      "reports.run",
    ],
  },

  {
    name: "ADMIN_MANAGER",
    displayName: "Gerente Administrativo",
    description:
      "Responsável pela gestão administrativa e operacional das unidades sob sua responsabilidade.",
    category: "ADMINISTRATIVE",
    governanceLevel: "MANAGER",
    permissions: [
      "users.view",
      "users.create",
      "users.update",
      "users.activate",
      "users.deactivate",

      "cities.view",

      "facilities.view",
      "facilities.update",

      "reports.run",
      "reports.export",

      "inventory.view",
      "requests.view",
      "batches.view",
    ],
  },

  {
    name: "FACILITY_MANAGER",
    displayName: "Gestor de Unidade",
    description: "Responsável pela operação completa da unidade dentro do seu escopo.",
    category: "ADMINISTRATIVE",
    governanceLevel: "MANAGER",
    permissions: [
      "users.view",
      "users.create",
      "users.update",
      "users.activate",
      "users.deactivate",
      "users.manage_facilities",
      "users.grant_functional_roles",

      "roles.assign",
      "roles.unassign",

      "cities.view",

      "facilities.view",

      "inventory.view",
      "requests.view",
      "batches.view",
      "controlled.view",

      "reports.run",
      "reports.export",
    ],
  },

  {
    name: "COMPLIANCE_MANAGER",
    displayName: "Gestor de Compliance",
    description: "Responsável por auditoria, conformidade e rastreabilidade das operações.",
    category: "ADMINISTRATIVE",
    governanceLevel: "MANAGER",
    permissions: [
      "audit.view",
      "audit.export",

      "audit.user_actions",
      "audit.inventory_actions",
      "audit.security_events",

      "controlled.audit",

      "items.view",
      "inventory.view",
      "batches.view",
      "requests.view",

      "reports.run",
      "reports.export",
      "reports.view_all_facilities",
    ],
  },

  {
    name: "AUDITOR",
    displayName: "Auditor",
    description:
      "Consulta auditorias, eventos de segurança e relatórios sem permissão de alteração.",
    category: "ADMINISTRATIVE",
    permissions: [
      "audit.view",
      "audit.export",

      "audit.user_actions",
      "audit.inventory_actions",
      "audit.security_events",

      "controlled.audit",

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
    name: "SYSTEM_VIEWER",
    displayName: "Visualizador do Sistema",
    description: "Acesso somente leitura ao sistema.",
    category: "ADMINISTRATIVE",

    permissions: [
      "items.view",
      "inventory.view",
      "batches.view",
      "requests.view",
      "controlled.view",
      "reports.run",
    ],
  },
];

const functionalRoles: RoleSeed[] = [
  {
    name: "ALMOXARIFADO_PRINCIPAL",
    displayName: "Almoxarifado Principal",
    description:
      "Responsável pela gestão central do estoque, recebimento, distribuição e controle de lotes.",
    category: "FUNCTIONAL",
    permissions: [
      "inventory.view",
      "inventory.create_movement",
      "inventory.adjust",
      "inventory.transfer",
      "inventory.reserve",
      "inventory.release",
      "inventory.receive",

      "batches.view",
      "batches.create",
      "batches.update",
      "batches.receive",
      "batches.quarantine",
      "batches.release",
      "batches.expire",
      "batches.adjust",

      "items.view",

      "requests.view",
      "requests.fulfill",
    ],
  },

  {
    name: "ALMOXARIFADO_LOCAL",
    displayName: "Almoxarifado Local",
    description: "Responsável pela movimentação e controle de estoque da unidade.",
    category: "FUNCTIONAL",
    permissions: [
      "inventory.view",
      "inventory.create_movement",
      "inventory.transfer",
      "inventory.reserve",
      "inventory.release",
      "inventory.receive",

      "batches.view",
      "batches.receive",

      "items.view",

      "requests.view",
      "requests.fulfill",
    ],
  },

  {
    name: "PROCUREMENT",
    displayName: "Comprador",
    description: "Responsável pelos processos de compra e recebimento de materiais.",
    category: "FUNCTIONAL",
    permissions: [
      "suppliers.view",

      "purchases.view",
      "purchases.create",
      "purchases.receive",

      "items.view",
      "manufacturers.view",
    ],
  },

  {
    name: "PHARMACIST",
    displayName: "Farmacêutico",
    description: "Responsável técnico pelo controle de medicamentos e materiais farmacêuticos.",
    category: "FUNCTIONAL",
    permissions: [
      "inventory.view",

      "controlled.view",
      "controlled.request",
      "controlled.authorize",
      "controlled.dispatch",
      "controlled.receive",

      "batches.view",

      "items.view",

      "requests.view",
    ],
  },

  {
    name: "MEDIC",
    displayName: "Médico",
    description: "Profissional médico autorizado a solicitar materiais e medicamentos.",
    category: "FUNCTIONAL",
    permissions: [
      "inventory.view",

      "controlled.view",
      "controlled.request",

      "requests.view",
      "requests.create",

      "items.view",
    ],
  },

  {
    name: "NURSE",
    displayName: "Enfermeiro",
    description:
      "Profissional de enfermagem autorizado a solicitar materiais e executar atividades assistenciais.",
    category: "FUNCTIONAL",
    permissions: [
      "inventory.view",

      "requests.view",
      "requests.create",

      "controlled.view",

      "items.view",
    ],
  },

  {
    name: "CONTROLLED_AUTHORIZER",
    displayName: "Autorizador de Controlados",
    description: "Responsável pela autorização de dispensação de medicamentos controlados.",
    category: "FUNCTIONAL",
    permissions: [
      "items.view",
      "inventory.view",
      "controlled.view",
      "controlled.authorize",
      "controlled.authorize_any_facility",
    ],
  },

  {
    name: "INVENTORY_ANALYST",
    displayName: "Analista de Inventário",
    description: "Responsável por conferências, inventários e conciliações de estoque.",
    category: "FUNCTIONAL",
    permissions: [
      "inventory.view",

      "inventory.count",
      "inventory.reconcile",

      "batches.view",

      "items.view",

      "reports.run",
    ],
  },

  {
    name: "QUALITY_ANALYST",
    displayName: "Analista de Qualidade",
    description: "Responsável por quarentena, liberação e acompanhamento de validade de lotes.",
    category: "FUNCTIONAL",
    permissions: [
      "batches.view",

      "batches.quarantine",
      "batches.release",
      "batches.expire",

      "reports.run",
    ],
  },

  {
    name: "DELIVERER",
    displayName: "Entregador",
    description: "Responsável pela movimentação física e entrega de medicamentos e materiais.",
    category: "FUNCTIONAL",
    permissions: [
      "inventory.view",

      "controlled.view",
      "controlled.deliver",

      "requests.view",
    ],
  },

  {
    name: "RECEPTIONIST",
    displayName: "Recepcionista",
    description: "Responsável pelo atendimento e abertura de solicitações.",
    category: "FUNCTIONAL",
    permissions: [
      "requests.view",
      "requests.create",

      "items.view",
    ],
  },

  {
    name: "OPERATIONAL_VIEWER",
    displayName: "Consulta Operacional",
    description: "Acesso somente leitura aos módulos operacionais permitidos.",
    category: "FUNCTIONAL",
    permissions: [
      "inventory.view",
      "batches.view",
      "items.view",
      "requests.view",
      "controlled.view",
    ],
  },
];

const roles = [...administrativeRoles, ...functionalRoles];

export async function seedRoles(prisma: PrismaClient) {
  console.log("Seeding roles...");

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
        category: role.category,
        governanceLevel: role.governanceLevel,
      },
      create: {
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        category: role.category,
        governanceLevel: role.governanceLevel,
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
