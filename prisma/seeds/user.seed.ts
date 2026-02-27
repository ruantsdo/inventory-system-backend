import type { PrismaClient } from "../../src/generated/prisma/client";
import argon2 from "argon2";

export async function seedAdmin(prisma: PrismaClient, cityId: string, adminRoleId: string) {
  const email = "admin@local";
  const password = "admin";

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
      cityId,
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
