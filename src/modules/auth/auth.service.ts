import * as argon2 from "argon2";
import { SignJWT } from "jose";
import { env } from "../../config/env.js";
import { unauthorized } from "../../shared/errors/AppError.js";
import { AuthRepository } from "./auth.repository.js";
import type { LoginInput } from "./auth.schema.js";

const secret = new TextEncoder().encode(env.JWT_SECRET);

type UserWithRoles = NonNullable<Awaited<ReturnType<typeof AuthRepository.findUserByEmail>>>;

function parseDurationToMs(duration: string): number {
  const match = duration.match(/^(\d+)(m|h|d)$/);
  if (!match) return 15 * 60 * 1000;
  const value = Number(match[1]);
  const unit = match[2];
  if (unit === "m") return value * 60 * 1000;
  if (unit === "h") return value * 60 * 60 * 1000;
  return value * 24 * 60 * 60 * 1000; // d
}

function extractRbac(user: UserWithRoles) {
  const roles = user.roles.map((ur) => ur.role.name);
  const permissions = [
    ...new Set(user.roles.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.name))),
  ];
  return { roles, permissions };
}

export const AuthService = {
  async login(input: LoginInput) {
    const user = await AuthRepository.findUserByEmail(input.email);

    if (!user || !user.isActive) {
      throw unauthorized("Invalid credentials");
    }

    const passwordValid = await argon2.verify(user.passwordHash, input.password);
    if (!passwordValid) {
      throw unauthorized("Invalid credentials");
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

    const refreshToken = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime(Math.floor((now + refreshExpiresMs) / 1000))
      .sign(secret);

    return {
      accessToken,
      refreshToken,
      accessExpiresMs,
      refreshExpiresMs,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
      },
    };
  },
};
