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
}

// PERMISSIONS

export interface PermissionOutput {
  id: ID;
  name: string;
  displayName: string;
  description: string | null;
  scopeMode: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface RoleWithPermissionsOutput {
  id: ID;
  name: string;
  displayName: string;
  description: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  permissions: PermissionOutput[];
}

// USERS

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
  roleName: string;
  facilities?: string[] | undefined;
  permissionNames?: string[] | undefined;
}

export interface UserProfessionalDocumentPayload {
  documentType: ProfessionalDocumentType;
  documentNumber: string;
  issuerState?: string | undefined;
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

  roles: UserRolePayload[];
  professionalDocuments?: UserProfessionalDocumentPayload[] | undefined;
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  cpf: string;
  birthDate: string;
  phone?: string;

  cityId?: string;
  zipCode?: string;
  streetAddress?: string;
  number?: string;
  additionalInfo?: string;
  neighborhood?: string;
  addressCity?: string;
  state?: string;

  roles: UserRolePayload[];
  professionalDocuments?: UserProfessionalDocumentPayload[];
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
