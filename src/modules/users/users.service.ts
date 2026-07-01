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

    const requestedRoles = data.roles.map((r) => r.roleId);
    const rolePermissionsRecords = await usersRepository.getRolePermissions(requestedRoles);

    const unauthorizedPerms = new Set<string>();

    for (const rp of rolePermissionsRecords) {
      if (!adminPermsSet.has(rp.permission.name)) {
        unauthorizedPerms.add(rp.permission.displayName);
      }
    }

    const extraPermIds = data.roles.flatMap((r) => r.permissionIds ?? []);
    if (extraPermIds.length > 0) {
      const uniqueExtraIds = [...new Set(extraPermIds)];
      const extraPermRecords = await usersRepository.getPermissionsByIds(uniqueExtraIds);

      for (const perm of extraPermRecords) {
        if (!adminPermsSet.has(perm.name)) {
          unauthorizedPerms.add(perm.displayName);
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

  async getAllUsers() {
    return await usersRepository.getAllUsers();
  },

  async getUsersByFacilityId(facilityId: string) {
    return await usersRepository.getUsersByFacilityId(facilityId);
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
