import { FacilityRepository } from "./facilities.repository";

export const FacilityService = {
  async getActiveFacilitiesByCity(cityId: string) {
    return FacilityRepository.findActiveFacilitiesByCity(cityId);
  },

  async getAllFacilities() {
    return FacilityRepository.findAllFacilities();
  },

  async getAllActiveFacilities() {
    return FacilityRepository.findAllActiveFacilities();
  },

  async getActiveFacilitiesForSession(userId: string) {
    return FacilityRepository.findActiveFacilitiesForSession(userId);
  },
};
