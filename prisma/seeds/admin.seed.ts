import argon2 from "argon2";
import type { PrismaClient } from "../../src/generated/prisma/client";
import { UserRoleScopeMode } from "../../src/generated/prisma/enums";

export async function seedAdmin(prisma: PrismaClient, adminRoleId: string) {
  console.log("Seeding admin...");

  const email = "admin@local.com";
  const password = "123456789";
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
        fullName: "Administrador Mestre",
        email,
        passwordHash,
        isActive: true,
        cpf,
        zipCode: "00000000",
        streetAddress: "Servidor Interno",
        number: "0",
        additionalInfo: "Usuário administrador criado automaticamente.",
        neighborhood: "Setor de Tecnologia da Informação",
        addressCity: "Alagoinhas",
        state: "BA",
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

  let userRoleId: string;

  if (!existingUserRole) {
    const createdUserRole = await prisma.userRole.create({
      data: {
        userId,
        roleId: adminRoleId,
        scopeMode: UserRoleScopeMode.GLOBAL,
      },
    });
    userRoleId = createdUserRole.id;
  } else {
    userRoleId = existingUserRole.id;
  }


  const rolePermissions = await prisma.rolePermission.findMany({
    where: { roleId: adminRoleId },
  });

  for (const rp of rolePermissions) {
    await prisma.userRolePermission.upsert({
      where: {
        userRoleId_permissionId: {
          userRoleId,
          permissionId: rp.permissionId,
        },
      },
      update: {},
      create: {
        userRoleId,
        permissionId: rp.permissionId,
      },
    });
  }


  console.log("Admin seeded.");

  return {
    userId,
    email,
  };
}
