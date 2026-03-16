import argon2 from "argon2";
import type { PrismaClient } from "../../src/generated/prisma/client";

export async function seedAdmin(prisma: PrismaClient, cityId: string, adminRoleId: string) {
  const email = "admin@local.com";
  const password = "admin";
  const cpf = "00000000000";

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) return existing;

  const passwordHash = await argon2.hash(password);

  const user = await prisma.user.create({
    data: {
      fullName: "Administrador",
      email,
      passwordHash,
      isActive: true,
      birthDate: new Date(),
      cityId,
      cpf,
    },
  });

  await prisma.userRole.create({
    data: {
      userId: user.id,
      roleId: adminRoleId,
    },
  });

  return user;
}
