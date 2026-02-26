import type { PrismaClient } from "@prisma/client";

const roles = [
  { name: "ADMIN", description: "Acesso total ao sistema" },
  { name: "MANAGER", description: "Gestão de estoque e requisições" },
  { name: "OPERATOR", description: "Operações de movimentação" },
  { name: "VIEWER", description: "Apenas visualização" },
];

export async function seedRoles(prisma: PrismaClient) {
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  return prisma.role.findUnique({ where: { name: "ADMIN" } });
}
