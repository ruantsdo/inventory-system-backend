import { prisma } from "../db/prisma";

export async function checkIfRootUser(userId: string) {
  const isRootUser = await prisma.userRole.findFirst({
    where: {
      userId,
      role: { governanceLevel: "ROOT" },
      scopeMode: "GLOBAL",
    },
  });

  return !!isRootUser;
}

export async function checkIfSuperUser(userId: string) {
  const isSuperUser = await prisma.userRole.findFirst({
    where: {
      userId,
      role: { governanceLevel: { in: ["ROOT", "SUPER_ADMIN"] } },
    },
  });

  return !!isSuperUser;
}
