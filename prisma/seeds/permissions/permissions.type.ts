import type { PermissionScopeMode } from "../../../src/generated/prisma/enums";

export type PermissionSeed = {
  name: string;
  displayName: string;
  description: string;
  scopeMode: PermissionScopeMode;
};
