import { prisma } from "../../shared/db/prisma";

export const GeoRepository = {
  async findAllCities() {
    return prisma.city.findMany({
      where: { isDeleted: false },
      orderBy: [{ state: "asc" }, { name: "asc" }],
    });
  },

  async findCitiesWithActiveFacilities() {
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
