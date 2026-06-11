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
): {
  session: AuthSessionOutput;
  jwtClaims: { roleNames: string[]; permissionNames: string[]; facilitiesNames: string[] };
} {
  const roles: RoleOutput[] = [];
  const facilitiesMap = new Map<string, SessionFacilityOutput>();
  const effectiveMap = new Map<
    string,
    { id: string; scopeMode: string; allowedFacilityIds: Set<string> | null }
  >();
  let isGlobal = true;
  let hasActiveRoles = false;

  for (const ur of user.roles) {
    if (!ur.isActive) continue;
    hasActiveRoles = true;

    roles.push({
      id: ur.role.id,
      name: ur.role.name,
      displayName: ur.role.displayName,
      description: ur.role.description ?? null,
    });

    if (ur.scopeMode === "FACILITY_SET") {
      isGlobal = false;
      for (const scope of ur.facilities) {
        if (!facilitiesMap.has(scope.facility.id)) {
          facilitiesMap.set(scope.facility.id, {
            id: scope.facility.id,
            name: scope.facility.name,
          });
        }
      }
    }

    for (const rp of ur.role.permissions) {
      const permName = rp.permission.name;
      const existing = effectiveMap.get(permName);

      if (ur.scopeMode === "GLOBAL") {
        effectiveMap.set(permName, {
          id: rp.permission.id,
          scopeMode: rp.permission.scopeMode,
          allowedFacilityIds: null,
        });
      } else if (ur.scopeMode === "FACILITY_SET") {
        if (existing?.allowedFacilityIds === null) {
          continue;
        }

        const facilitySet = existing?.allowedFacilityIds ?? new Set<string>();
        for (const scope of ur.facilities) {
          facilitySet.add(scope.facility.id);
        }
        effectiveMap.set(permName, {
          id: rp.permission.id,
          scopeMode: rp.permission.scopeMode,
          allowedFacilityIds: facilitySet,
        });
      }
    }
  }

  if (!hasActiveRoles) isGlobal = false;

  const facilities = [...facilitiesMap.values()];

  const effectivePermissions: EffectivePermissionOutput[] = [];
  for (const [name, { id, scopeMode, allowedFacilityIds }] of effectiveMap) {
    effectivePermissions.push({
      id,
      name,
      scopeMode,
      isGlobal: allowedFacilityIds === null,
      ...(allowedFacilityIds !== null && { allowedFacilityIds: [...allowedFacilityIds] }),
    });
  }

  const permissionNames = effectivePermissions.map((ep) => ep.name);

  const activeContext: ActiveContextOutput = {
    facilityId: null,
    facilityName: null,
    locationId: null,
    isGlobal,
  };

  const authUser = {
    id: user.id,
    fullName: user.fullName,
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
      facilitiesNames: facilities.map((f) => f.name),
    },
  };
}

export { extractSession };
