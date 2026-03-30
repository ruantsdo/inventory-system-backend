import type { AuthRepository } from "@/modules/auth/auth.repository";
import type {
  ActiveContextOutput,
  AuthSessionOutput,
  EffectivePermissionOutput,
  RoleOutput,
  SessionFacilityOutput,
} from "@/shared/types/user/user.output";

type UserWithRoles = NonNullable<Awaited<ReturnType<typeof AuthRepository.findUserByCPF>>>;

function extractSession(
  user: UserWithRoles,
  expiresAt?: string | null
): { session: AuthSessionOutput; jwtClaims: { roleNames: string[]; permissionNames: string[] } } {
  const activeUserRoles = user.roles.filter((ur) => ur.isActive);

  const roles: RoleOutput[] = activeUserRoles.map((ur) => ({
    name: ur.role.name,
    displayName: ur.role.displayName,
    description: ur.role.description ?? null,
  }));

  const facilitiesMap = new Map<string, SessionFacilityOutput>();

  for (const ur of activeUserRoles) {
    if (ur.scopeMode === "FACILITY_SET") {
      for (const scope of ur.facilities) {
        if (!facilitiesMap.has(scope.facility.id)) {
          facilitiesMap.set(scope.facility.id, {
            id: scope.facility.id,
            name: scope.facility.name,
          });
        }
      }
    }
  }

  const facilities = [...facilitiesMap.values()];

  const effectiveMap = new Map<
    string,
    { scopeMode: string; allowedFacilityIds: Set<string> | null }
  >();

  for (const ur of activeUserRoles) {
    for (const rp of ur.role.permissions) {
      const permName = rp.permission.name;
      const permScopeMode = rp.permission.scopeMode;

      const existing = effectiveMap.get(permName);

      if (ur.scopeMode === "GLOBAL") {
        effectiveMap.set(permName, { scopeMode: permScopeMode, allowedFacilityIds: null });
      } else if (ur.scopeMode === "FACILITY_SET") {
        if (existing?.allowedFacilityIds === null) {
          continue;
        }

        const facilitySet = existing?.allowedFacilityIds ?? new Set<string>();
        for (const scope of ur.facilities) {
          facilitySet.add(scope.facility.id);
        }
        effectiveMap.set(permName, { scopeMode: permScopeMode, allowedFacilityIds: facilitySet });
      }
    }
  }

  const effectivePermissions: EffectivePermissionOutput[] = [];
  for (const [name, { scopeMode, allowedFacilityIds }] of effectiveMap) {
    effectivePermissions.push({
      name,
      scopeMode,
      isGlobal: allowedFacilityIds === null,
      ...(allowedFacilityIds !== null && { allowedFacilityIds: [...allowedFacilityIds] }),
    });
  }

  const permissionNames = effectivePermissions.map((ep) => ep.name);

  const isGlobal =
    activeUserRoles.length > 0 && activeUserRoles.every((ur) => ur.scopeMode === "GLOBAL");

  const activeContext: ActiveContextOutput = {
    facilityId: null,
    facilityName: null,
    locationId: null,
    isGlobal,
  };

  const authUser = {
    id: user.id,
    fullName: user.fullName,
    city: user.city
      ? {
          id: user.city.id,
          name: user.city.name,
        }
      : null,
  };

  const session: AuthSessionOutput = {
    user: authUser,
    roles,
    permissions: permissionNames,
    effectivePermissions,
    facilities,
    activeContext,
    expiresAt: expiresAt ?? null,
  };

  return {
    session,
    jwtClaims: {
      roleNames: roles.map((r) => r.name),
      permissionNames,
    },
  };
}

export { extractSession };
