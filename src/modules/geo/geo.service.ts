import { GeoRepository } from "./geo.repository";

export const GeoService = {
  async getAllCities() {
    return GeoRepository.findAllCities();
  },

  async getCitiesWithActiveFacilities() {
    return GeoRepository.findCitiesWithActiveFacilities();
  },
};
