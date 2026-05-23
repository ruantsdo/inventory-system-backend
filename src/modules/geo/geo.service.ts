import { GeoRepository } from "./geo.repository";

export const GeoService = {
  async getAllCities() {
    return GeoRepository.findAllCities();
  },

  async getCitiesWithActiveFacilities() {
    return GeoRepository.findCitiesWithActiveFacilities();
  },

  async getActiveFacilitiesByCity(cityId: string) {
    return GeoRepository.findActiveFacilitiesByCity(cityId);
  },
};
