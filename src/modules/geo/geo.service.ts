import { GeoRepository } from "./geo.repository";

export const GeoService = {
  async getAllCities() {
    return GeoRepository.findAllCities();
  },

  async getAllCitiesWithActiveFacilities() {
    return GeoRepository.findAllCitiesWithActiveFacilities();
  },

  async findAuthorizedCitiesIDs(callerId: string) {
    return GeoRepository.findAuthorizedCities(callerId);
  },

  async getCitiesWithActiveFacilities(validCitiesIds: string[]) {
    return GeoRepository.findCitiesWithActiveFacilities(validCitiesIds);
  },
};
