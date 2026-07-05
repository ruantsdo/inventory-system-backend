import { randomBytes } from "node:crypto";
import type { UpdateUserPayload } from "@/shared/types/api.contracts";
import argon2 from "argon2";
import { getRedis } from "../../config/redis";
import { badRequest, forbidden } from "../../shared/errors/AppError";
import { generateAndSaveActivationToken } from "../../shared/utils";
import { formatDate } from "../../shared/utils/formatters";
import { AuthService } from "../auth/auth.service";
import { PermissionsService } from "../permissions/permissions.service";
import { usersRepository } from "./users.repository";
import type {
  ConfirmActivationInput,
  CreateUserInput,
  ResendActivationInput,
} from "./users.schema";

export const usersService = {
  async createUser(data: CreateUserInput, requestMakerId: string) {
    const [existingCpf, existingEmail] = await Promise.all([
      usersRepository.findByCpf(data.cpf),
      usersRepository.findByEmail(data.email),
    ]);

    if (existingCpf) {
      throw badRequest("CPF já cadastrado no sistema.", "Usuário duplicado");
    }
    if (existingEmail) {
      throw badRequest("E-mail já cadastrado no sistema.", "Usuário duplicado");
    }

    const adminPermissions = await PermissionsService.getPermissionsForUser(requestMakerId);
    const adminPermsSet = new Set(adminPermissions.map((p) => p.name));
    const canCreateUsers = adminPermsSet.has("users.create");
    if (!canCreateUsers) {
      throw forbidden("Você não tem autorização para criar usuários.", "Sem autorização");
    }

    const canGrantFunctionalRoles = adminPermsSet.has("users.grant_functional_roles");
    const unauthorizedPerms = new Set<string>();

    for (const userRole of data.roles) {
      const role = await usersRepository.findRoleById(userRole.roleId);
      if (!role) {
        throw badRequest("Cargo não encontrado.", "Cargo inválido");
      }

      const isFunctionalBypass = canGrantFunctionalRoles && role.category === "FUNCTIONAL";

      if (isFunctionalBypass) {
        const defaultRolePermIds = new Set(role.permissions.map((p) => p.permissionId));

        if (userRole.permissionIds && userRole.permissionIds.length > 0) {
          const invalidBypassPerms = new Set<string>();
          const payloadPermRecords = await usersRepository.getPermissionsByIds(
            userRole.permissionIds
          );

          for (const perm of payloadPermRecords) {
            if (!defaultRolePermIds.has(perm.id)) {
              invalidBypassPerms.add(perm.displayName);
            }
          }

          if (invalidBypassPerms.size > 0) {
            throw forbidden(
              `Você não pode conceder permissões extras fora do cargo padrão para esta categoria funcional: ${[...invalidBypassPerms].join(", ")}`,
              "Privilégio inválido para bypass funcional"
            );
          }
        }
      } else {
        if (userRole.permissionIds && userRole.permissionIds.length > 0) {
          const payloadPermRecords = await usersRepository.getPermissionsByIds(
            userRole.permissionIds
          );

          for (const perm of payloadPermRecords) {
            if (!adminPermsSet.has(perm.name)) {
              unauthorizedPerms.add(perm.displayName);
            }
          }
        }
      }
    }

    if (unauthorizedPerms.size > 0) {
      throw forbidden(
        `Você não tem autorização para atribuir as seguintes permissões: ${[...unauthorizedPerms].join(", ")}`,
        "Escalada de privilégio detectada"
      );
    }

    const temporaryPassword = randomBytes(16).toString("hex");
    const tempPasswordHash = await argon2.hash(temporaryPassword);

    const user = await usersRepository.createUser(data, tempPasswordHash, requestMakerId);

    await generateAndSaveActivationToken(user.id, user.email);

    return {
      fullName: user.fullName,
      message: "Usuário criado. E-mail de ativação enviado.",
    };
  },

  async resendActivationLink(data: ResendActivationInput) {
    const user = await usersRepository.findByCpf(data.cpf);

    if (!user) {
      throw badRequest("Dados inválidos ou usuário não encontrado.");
    }

    if (user.email !== data.email) {
      throw badRequest("Dados inválidos ou usuário não encontrado.");
    }

    const parsedBirthDate = formatDate(data.birthDate);

    const userDateString = user.birthDate.toISOString().split("T")[0];
    const inputDateString = parsedBirthDate.toISOString().split("T")[0];

    if (userDateString !== inputDateString) {
      throw badRequest("Dados inválidos ou usuário não encontrado.");
    }

    if (user.isActive) {
      throw badRequest(
        "Este usuário já está ativo. Utilize o fluxo de recuperação de senha se necessário."
      );
    }

    await generateAndSaveActivationToken(user.id, user.email);

    return { message: "Link de ativação reenviado para o e-mail cadastrado." };
  },

  async confirmActivation(data: ConfirmActivationInput) {
    const redis = getRedis();
    const redisKey = `activation:${data.token}`;

    const userId = await redis.get(redisKey);

    if (!userId) {
      throw badRequest("Token de ativação inválido ou expirado. Solicite um novo link.");
    }

    const newPasswordHash = await argon2.hash(data.newPassword);

    await usersRepository.activateUser(userId, newPasswordHash);

    await redis.del(redisKey);

    return { message: "Conta ativada com sucesso. Você já pode fazer login." };
  },

  async getAllUsers(activeFacilityId: string, isPrivilegedCaller: boolean) {
    return await usersRepository.getAllUsers(activeFacilityId, isPrivilegedCaller);
  },

  async getUsersByFacilityId(facilityId: string, isPrivilegedCaller: boolean) {
    return await usersRepository.getUsersByFacilityId(facilityId, isPrivilegedCaller);
  },

  async getUserById(id: string) {
    return await usersRepository.findById(id);
  },

  async getUserByCpf(cpf: string) {
    return await usersRepository.findByCpf(cpf);
  },

  async getUserByEmail(email: string) {
    return await usersRepository.findByEmail(email);
  },

  async getBasicUserDataById(id: string) {
    return await usersRepository.findBasicUserDataById(id);
  },

  async getBasicUserDataByCpf(cpf: string) {
    return await usersRepository.findBasicUserDataByCpf(cpf);
  },

  async getBasicUserDataByEmail(email: string) {
    return await usersRepository.findBasicUserDataByEmail(email);
  },

  async getUserEditData(id: string) {
    return await usersRepository.findUserEditDataById(id);
  },

  async getSelfData(id: string) {
    return await usersRepository.findBasicUserDataById(id);
  },

  async updateUser(id: string, payload: UpdateUserPayload, requestMakerId: string) {
    return await usersRepository.updateUserData(id, payload, requestMakerId);
  },

  async removeUser(targetId: string, requestMakerId: string) {
    const result = await usersRepository.removeUser(targetId, requestMakerId);
    await AuthService.revokeAllUserSessions(targetId);
    return result;
  },

  async deactivateUser(targetId: string) {
    const result = await usersRepository.deactivateUser(targetId);
    await AuthService.revokeAllUserSessions(targetId);
    return result;
  },

  async reactivateUser(targetId: string) {
    return await usersRepository.reactivateUser(targetId);
  },
};
