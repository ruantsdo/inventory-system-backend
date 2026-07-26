// export {} é necessário para que este arquivo seja tratado como módulo pelo TypeScript.
export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        userName?: string | undefined;
        userEmail?: string | undefined;
        roleNames: string[];
        permissionNames: string[];
        facilitiesNames: string[];
        activeFacilityId: string;
        activeFacilityName?: string | undefined;
      };
      actionContext?: {
        resource: string;
        action: string;
        scope?: string | undefined;
      };
    }
  }
}
