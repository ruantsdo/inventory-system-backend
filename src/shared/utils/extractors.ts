import type { AuthRepository } from "@/modules/auth/auth.repository";

type UserWithRoles = NonNullable<Awaited<ReturnType<typeof AuthRepository.findUserByCPF>>>;

function extractRbac(user: UserWithRoles) {
  const roles = user.roles.map((ur) => ur.role.name);
  const permissions = [
    ...new Set(user.roles.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.name))),
  ];
  return { roles, permissions };
}

export { extractRbac };
