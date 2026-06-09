import { PermissionsRepository } from "./permissions.repository";

export const PermissionsService = {
  async getAllRoles() {
    return PermissionsRepository.findAllRoles();
  },

  async getPermissionsForUser(userId: string) {
    return PermissionsRepository.findPermissionsByUserId(userId);
  },

  async getUserAuthorizationData(userId: string) {
    return PermissionsRepository.getUserActiveAuthorizationInfo(userId);
  },
};
