import { prisma } from "../../shared/db/prisma";

export const FacilityRepository = {
  async findAllActiveFacilities() {
    return prisma.facility.findMany({
      where: {
        isActive: true,
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        description: true,
        cnes: true,
        phone: true,
        isActive: true,
      },
    });
  },

  async findAllFacilities() {
    return prisma.facility.findMany({
      where: {
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        description: true,
        cnes: true,
        phone: true,
        isActive: true,
      },
    });
  },

  async findActiveFacilitiesByCity(cityId: string) {
    return prisma.facility.findMany({
      where: {
        cityId,
        isActive: true,
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        description: true,
        cnes: true,
        phone: true,
        isActive: true,
      },
    });
  },

  async findActiveFacilitiesForSession(userId: string) {
    const userRoles = await prisma.userRole.findMany({
      where: {
        userId,
        isActive: true,
      },
      select: {
        role: {
          select: {
            governanceLevel: true,
          },
        },
        scopeMode: true,
        facilities: {
          select: {
            facilityId: true,
          },
        },
      },
    });

    if (userRoles.length === 0) {
      return [];
    }

    const hasGlobalAccess = userRoles.some(
      (role) =>
        role.scopeMode === "GLOBAL" ||
        role.role.governanceLevel === "SUPER_ADMIN" ||
        role.role.governanceLevel === "ROOT"
    );
    if (hasGlobalAccess) {
      return prisma.facility.findMany({
        where: {
          isActive: true,
          isDeleted: false,
        },
        select: {
          id: true,
          name: true,
        },
      });
    }

    const allowedFacilityIds = Array.from(
      new Set(userRoles.flatMap((ur) => ur.facilities.map((f) => f.facilityId)))
    );

    if (allowedFacilityIds.length === 0) {
      return [];
    }

    return prisma.facility.findMany({
      where: {
        id: { in: allowedFacilityIds },
        isActive: true,
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
      },
    });
  },
};
