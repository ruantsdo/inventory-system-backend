export type ID = string;

export interface AuthUserOutput {
  id: ID;
  fullName: string;
}

export interface RoleOutput {
  id: ID;
  name: string;
  displayName: string;
  description?: string | null;
}

export interface EffectivePermissionOutput {
  id: ID;
  name: string;
  scopeMode: string;
  allowedFacilityIds?: string[];
  isGlobal: boolean;
}

export interface SessionFacilityOutput {
  id: ID;
  name: string;
  isDefault?: boolean;
}

export interface ActiveContextOutput {
  facilityId: ID | null;
  facilityName?: string | null;
  locationId?: ID | null;
  isGlobal: boolean;
}

export interface AuthSessionOutput {
  user: AuthUserOutput;
  roles: RoleOutput[];
  permissions: string[];
  effectivePermissions: EffectivePermissionOutput[];
  facilities: SessionFacilityOutput[];
  activeContext: ActiveContextOutput;
  expiresAt?: string | null;
}

export interface AuthSessionResponse {
  authenticated: boolean;
  session: AuthSessionOutput | null;
}

export interface LoginResponse {
  status: "ok";
  session: AuthSessionOutput;
}
