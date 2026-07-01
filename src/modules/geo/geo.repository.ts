import { prisma } from "../../shared/db/prisma";

export const GeoRepository = {
  async findAllCities() {
    return prisma.city.findMany({
      where: { isDeleted: false },
      orderBy: [{ state: "asc" }, { name: "asc" }],
    });
  },

  async findAllCitiesWithActiveFacilities() {
    return prisma.city.findMany({
      where: {
        isDeleted: false,
        facilities: {
          some: {
            isActive: true,
            isDeleted: false,
          },
        },
      },
      orderBy: [{ state: "asc" }, { name: "asc" }],
    });
  },

  async findAuthorizedCities(callerId: string): Promise<string[]> {
    const facilities = await prisma.facility.findMany({
      where: {
        isActive: true,
        isDeleted: false,
        userRoleScopes: {
          some: {
            userRole: {
              userId: callerId,
              isActive: true,
            },
          },
        },
      },
      select: {
        cityId: true,
      },
    });

    const cityIds = facilities.map((f) => f.cityId).filter((cityId): cityId is string => !!cityId);

    return Array.from(new Set(cityIds));
  },

  async findCitiesWithActiveFacilities(validCitiesIds: string[]) {
    return prisma.city.findMany({
      where: {
        id: { in: validCitiesIds },
        isDeleted: false,
        facilities: {
          some: {
            isActive: true,
            isDeleted: false,
          },
        },
      },
      orderBy: [{ state: "asc" }, { name: "asc" }],
    });
  },

  async findActiveFacilitiesByCity(cityId: string) {
    return prisma.facility.findMany({
      where: {
        cityId,
        isActive: true,
        isDeleted: false,
      },
      orderBy: { name: "asc" },
    });
  },
};
