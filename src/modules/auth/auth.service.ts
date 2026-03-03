import { randomUUID } from "node:crypto";
import { extractRbac } from "@/shared/utils/extractors";
import * as argon2 from "argon2";
import { SignJWT, jwtVerify } from "jose";
import type { JWTPayload } from "jose";
import { env } from "../../config/env";
import { getRedis } from "../../config/redis";
import { unauthorized } from "../../shared/errors/AppError";
import { parseDurationToMs } from "../../shared/utils/timming";
import { AuthRepository } from "./auth.repository";
import type { LoginInput } from "./auth.schema";

const secret = new TextEncoder().encode(env.JWT_SECRET);

const redis = getRedis();

export const AuthService = {
  async login(input: LoginInput) {
    const user = await AuthRepository.findUserByCPF(input.credential);

    if (!user || !user.isActive) {
      throw unauthorized("Verifique suas credênciais e tente novamente", "Credenciais inválidas");
    }

    const passwordValid = await argon2.verify(user.passwordHash, input.password);
    if (!passwordValid) {
      throw unauthorized("Verifique suas credênciais e tente novamente", "Credenciais inválidas");
    }

    const { roles, permissions } = extractRbac(user);

    const now = Date.now();
    const accessExpiresMs = parseDurationToMs(env.JWT_ACCESS_EXPIRES);
    const refreshExpiresMs = parseDurationToMs(env.JWT_REFRESH_EXPIRES);

    const accessToken = await new SignJWT({ roles, permissions })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime(Math.floor((now + accessExpiresMs) / 1000))
      .sign(secret);

    const jti = randomUUID();

    const refreshToken = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(user.id)
      .setJti(jti)
      .setIssuedAt()
      .setExpirationTime(Math.floor((now + refreshExpiresMs) / 1000))
      .sign(secret);

    const redisKey = `refresh:${user.id}:${jti}`;
    const durationInSeconds = Math.floor(refreshExpiresMs / 1000);

    await redis.set(redisKey, "active", "EX", durationInSeconds);

    return {
      accessToken,
      refreshToken,
      accessExpiresMs,
      refreshExpiresMs,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        roles,
        permissions,
      },
    };
  },

  async refresh(tokenStr: string) {
    let payload: JWTPayload;

    try {
      const { payload: verified } = await jwtVerify(tokenStr, secret);
      payload = verified;
    } catch {
      throw unauthorized("Token expirado ou inválido. Faça login novamente.", "Token inválido");
    }

    const userId = payload.sub;
    const jti = payload.jti;

    if (!userId || !jti) {
      throw unauthorized("Token malformado.", "Token inválido");
    }

    const redisKey = `refresh:${userId}:${jti}`;
    const isValidSession = await redis.get(redisKey);

    if (!isValidSession) {
      await this.revokeAllUserSessions(userId);
      throw unauthorized("Sessão revogada ou já utilizada.", "Sessão inválida");
    }

    await redis.del(redisKey);

    const user = await AuthRepository.findUserById(userId);
    if (!user || !user.isActive) {
      throw unauthorized("Conta de usuário inativa ou não encontrada.", "Conta inválida");
    }

    const { roles, permissions } = extractRbac(user);
    const now = Date.now();
    const accessExpiresMs = parseDurationToMs(env.JWT_ACCESS_EXPIRES);
    const refreshExpiresMs = parseDurationToMs(env.JWT_REFRESH_EXPIRES);
    const newJti = randomUUID();

    const newAccessToken = await new SignJWT({ roles, permissions })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime(Math.floor((now + accessExpiresMs) / 1000))
      .sign(secret);

    const newRefreshToken = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(user.id)
      .setJti(newJti)
      .setIssuedAt()
      .setExpirationTime(Math.floor((now + refreshExpiresMs) / 1000))
      .sign(secret);

    const newRedisKey = `refresh:${user.id}:${newJti}`;
    const durationInSeconds = Math.floor(refreshExpiresMs / 1000);
    await redis.set(newRedisKey, "active", "EX", durationInSeconds);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      accessExpiresMs,
      refreshExpiresMs,
    };
  },

  async revokeAllUserSessions(userId: string): Promise<void> {
    let cursor = "0";
    const matchPattern = `refresh:${userId}:*`;

    do {
      const [nextCursor, keys] = await redis.scan(cursor, "MATCH", matchPattern, "COUNT", 100);
      cursor = nextCursor;

      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== "0");
  },

  async revokeUserSession(userId: string, jti: string): Promise<void> {
    const redisKey = `refresh:${userId}:${jti}`;
    await redis.del(redisKey);
  },
};
