import { checkIfRootUser } from "@/shared/utils/verifiers";
import { PermissionsRepository } from "./permissions.repository";

export const PermissionsService = {
  async getAllRoles() {
    return PermissionsRepository.findAllRoles();
  },

  async getPermissionsForUser(userId: string) {
    const isRoot = await checkIfRootUser(userId);
    if (isRoot) {
      return PermissionsRepository.findAllPermissions();
    }
    return PermissionsRepository.findPermissionsByUserId(userId);
  },

  async getUserAuthorizationData(userId: string) {
    return PermissionsRepository.getUserActiveAuthorizationInfo(userId);
  },
};
