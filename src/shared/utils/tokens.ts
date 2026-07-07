import { randomBytes } from "node:crypto";
import { env } from "../../config/env";
import { logger } from "../../config/logger";
import { getRedis } from "../../config/redis";

export async function generateAndSaveToken(
  prefix: string,
  userId: string,
  expirationSeconds = 86400
): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const redisKey = `${prefix}:${token}`;

  const redis = getRedis();
  await redis.set(redisKey, userId, "EX", expirationSeconds);

  return token;
}

export async function generateAndSaveActivationToken(
  userId: string,
  email: string
): Promise<string> {
  const token = await generateAndSaveToken("activation", userId, 86400);

  logger.info(
    { userId, token },
    `Link de ativação enviado para ${email}: ${env.FRONTEND_URL}/activate/${token}`
  );

  return token;
}
