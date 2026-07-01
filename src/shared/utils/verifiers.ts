import { prisma } from "../db/prisma";

export async function checkIfRootUser(userId: string) {
  const isRootUser = await prisma.userRole.findFirst({
    where: {
      userId,
      role: { name: "ADMIN_ROOT" },
      scopeMode: "GLOBAL",
    },
  });

  return !!isRootUser;
}
