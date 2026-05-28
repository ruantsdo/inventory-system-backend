import { prisma } from "../../shared/db/prisma";

export const PermissionsRepository = {
  async findAllRoles() {
    return prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: { displayName: "asc" },
    });
  },

  async findAllPermissions() {
    return prisma.permission.findMany({
      orderBy: { displayName: "asc" },
    });
  },

  async findPermissionsByUserId(userId: string) {
    return prisma.permission.findMany({
      where: {
        roles: {
          some: {
            role: {
              users: {
                some: {
                  userId,
                  isActive: true,
                },
              },
            },
          },
        },
      },
      orderBy: {
        displayName: "asc",
      },
    });
  },
};
