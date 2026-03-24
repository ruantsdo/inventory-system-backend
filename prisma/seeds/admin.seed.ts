import argon2 from "argon2";
import type { PrismaClient } from "../../src/generated/prisma/client";
import { UserRoleScopeMode } from "../../src/generated/prisma/enums";

export async function seedAdmin(prisma: PrismaClient, adminRoleId: string, cityId?: string) {
  const email = "admin@local.com";
  const password = "superAdmin000";
  const cpf = "00000000000";

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  let userId: string;

  if (existingUser) {
    userId = existingUser.id;
  } else {
    const passwordHash = await argon2.hash(password);

    const user = await prisma.user.create({
      data: {
        fullName: "Administrador",
        email,
        passwordHash,
        isActive: true,
        cityId: cityId ?? null,
        cpf,
        birthDate: new Date(),
      },
    });

    userId = user.id;
  }

  const existingUserRole = await prisma.userRole.findFirst({
    where: {
      userId,
      roleId: adminRoleId,
      scopeMode: UserRoleScopeMode.GLOBAL,
    },
  });

  if (!existingUserRole) {
    await prisma.userRole.create({
      data: {
        userId,
        roleId: adminRoleId,
        scopeMode: UserRoleScopeMode.GLOBAL,
      },
    });
  }

  return {
    userId,
    email,
  };
}
