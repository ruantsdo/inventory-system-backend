import { prisma } from "../../shared/db/prisma";

export const PermissionsRepository = {
  async findAllRoles() {
    return prisma.role.findMany({
      where: {
        OR: [
          {
            governanceLevel: {
              not: "ROOT",
            },
          },
          {
            governanceLevel: null,
          },
        ],
      },
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

  async getUserActiveAuthorizationInfo(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId, isDeleted: false, isActive: true },
      include: {
        roles: {
          where: { isActive: true },
          include: {
            facilities: {
              include: { facility: true },
            },
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    const activeUserRoles = user.roles;
    const roleNames = activeUserRoles.map((ur) => ur.role.name);
    const roleIds = activeUserRoles.map((ur) => ur.role.id);

    const facilitiesSet = new Set<string>();
    for (const ur of activeUserRoles) {
      if (ur.scopeMode === "FACILITY_SET") {
        for (const scope of ur.facilities) {
          facilitiesSet.add(scope.facility.id);
        }
      }
    }
    const facilityIds = [...facilitiesSet];

    const permissionNamesSet = new Set<string>();
    const permissionIdsSet = new Set<string>();
    for (const ur of activeUserRoles) {
      for (const rp of ur.role.permissions) {
        permissionNamesSet.add(rp.permission.name);
        permissionIdsSet.add(rp.permission.id);
      }
    }

    return {
      userId: user.id,
      roleNames,
      roleIds,
      permissionNames: [...permissionNamesSet],
      permissionIds: [...permissionIdsSet],
      facilityIds,
    };
  },
};
