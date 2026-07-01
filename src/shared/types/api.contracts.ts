export type ID = string;

// GEO

export interface CityOutput {
  id: ID;
  name: string;
  state: string | null;
  country: string;
}

export interface FacilityOutput {
  id: ID;
  name: string;
  description: string | null;
  cnes: string | null;
  phone: string | null;
  isActive: boolean;
  cityId: string | null;
}

// PERMISSIONS

export type PermissionScopeMode = "GLOBAL" | "FACILITY" | "OWN";

export type UserRoleScopeMode = "GLOBAL" | "FACILITY_SET";

export interface PermissionOutput {
  id: ID;
  name: string;
  displayName: string;
  description: string | null;
  scopeMode: PermissionScopeMode;
}

export interface RoleWithPermissionsOutput {
  id: ID;
  name: string;
  displayName: string;
  description: string | null;
  category: string;
  governanceLevel: string;
  permissions: PermissionOutput[];
}

// USERS

export type RoleCategory = "FUNCTIONAL" | "ADMINISTRATIVE";

export type GovernanceLevel = "ROOT" | "SUPER_ADMIN" | "SYSTEM_ADMIN" | "MANAGER";

export type ProfessionalDocumentType =
  | "CRM"
  | "CRMV"
  | "CRO"
  | "COREN"
  | "CREFITO"
  | "CREF"
  | "CRP"
  | "CRA"
  | "CREA"
  | "CAU"
  | "OAB"
  | "RQE"
  | "OTHER";

export interface UserRolePayload {
  roleId: string;
  facilities?: string[] | undefined;
  permissionIds?: string[] | undefined;
}

export interface UserRoleDetailPayload {
  roleName: string;
  facilities?: string[] | undefined;
  permissionNames?: string[] | undefined;
}

export interface UserProfessionalDocumentPayload {
  documentType: ProfessionalDocumentType;
  documentNumber: string;
  issuer?: string | undefined;
  issuerState?: string | undefined;
  issuedAt?: string | Date | undefined;
  expiresAt?: string | Date | undefined;
  isPrimary?: boolean | undefined;
  isActive?: boolean | undefined;
  notes?: string | undefined;
}

export interface UserDetailPayload {
  fullName: string;
  email: string;
  cpf: string;
  birthDate: string;
  phone?: string | undefined;

  zipCode?: string | undefined;
  streetAddress?: string | undefined;
  number?: string | undefined;
  additionalInfo?: string | undefined;
  neighborhood?: string | undefined;
  addressCity?: string | undefined;
  state?: string | undefined;

  roles: UserRoleDetailPayload[];
  professionalDocuments?: UserProfessionalDocumentPayload[] | undefined;
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  cpf: string;
  birthDate: string;
  phone?: string | undefined;

  zipCode: string;
  streetAddress: string;
  number?: string | undefined;
  additionalInfo?: string | undefined;
  neighborhood: string;
  addressCity: string;
  state: string;

  roles: UserRolePayload[];
  professionalDocuments?: UserProfessionalDocumentPayload[] | undefined;
}

export interface ResendActivationPayload {
  cpf: string;
  email: string;
  birthDate: string;
}

export interface ConfirmActivationPayload {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// RESPONSES

export interface MessageResponse {
  message: string;
}

export interface CreateUserResponse {
  id: ID;
  message: string;
}

export interface UpdateUserPayload {
  fullName: string;
  email: string;
  cpf: string;
  birthDate: string;
  phone?: string | undefined;

  zipCode: string;
  streetAddress: string;
  number?: string | undefined;
  additionalInfo?: string | undefined;
  neighborhood: string;
  addressCity: string;
  state: string;

  roles: UserRolePayload[];
  professionalDocuments?: UserProfessionalDocumentPayload[] | undefined;
}

export interface UserRoleEditDetail {
  roleId: string;
  roleName: string;
  facilities: string[];
  permissionNames?: string[] | undefined;
  facilityDetails?:
    | { id: string; name: string; cityId?: string | undefined; cityName?: string | undefined }[]
    | undefined;
  permissionDetails?: { id: string; name: string; displayName: string }[] | undefined;
}

export interface UserEditData {
  fullName: string;
  email: string;
  cpf: string;
  birthDate: string;
  phone?: string | undefined;

  zipCode?: string | undefined;
  streetAddress?: string | undefined;
  number?: string | undefined;
  additionalInfo?: string | undefined;
  neighborhood?: string | undefined;
  addressCity?: string | undefined;
  state?: string | undefined;

  roles: UserRoleEditDetail[];
  professionalDocuments?: UserProfessionalDocumentPayload[] | undefined;
}
