import { randomBytes } from "node:crypto";
import argon2 from "argon2";
import { env } from "../../config/env";
import { logger } from "../../config/logger";
import { getRedis } from "../../config/redis";
import { badRequest, forbidden } from "../../shared/errors/AppError";
import { formatDate } from "../../shared/utils/formatters";
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
      throw badRequest("CPF já cadastrado no sistema.");
    }
    if (existingEmail) {
      throw badRequest("E-mail já cadastrado no sistema.");
    }

    const adminPermissions = await usersRepository.getUserPermissions(requestMakerId);
    const adminPermsSet = new Set(adminPermissions);

    const canCreateUsers = adminPermissions.includes("users.create");
    if (!canCreateUsers) {
      throw forbidden("Você não tem autorização para criar usuários", "Sem autorização");
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

    const activationToken = randomBytes(32).toString("hex");
    const redisKey = `activation:${activationToken}`;

    const redis = getRedis();
    await redis.set(redisKey, user.id, "EX", 86400);

    //Invocar worker para enviar o email de ativação

    logger.info(
      { userId: user.id, token: activationToken },
      `Link de ativação enviado para ${user.email}: ${env.FRONTEND_URL}/activate/${activationToken}`
    ); //REMOVER APÓS FINALIZAR DESENVOLVIMENTO DO WORKER

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

    const activationToken = randomBytes(32).toString("hex");
    const redisKey = `activation:${activationToken}`;

    const redis = getRedis();
    await redis.set(redisKey, user.id, "EX", 86400);

    //Invocar worker para enviar o email de ativação

    logger.info(
      { userId: user.id, token: activationToken },
      `Link de ativação enviado para ${user.email}: ${env.FRONTEND_URL}/activate/${activationToken}`
    ); //REMOVER APÓS FINALIZAR DESENVOLVIMENTO DO WORKER

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
};
