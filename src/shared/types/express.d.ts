// export {} é necessário para que este arquivo seja tratado como módulo pelo TypeScript.
export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        roleNames: string[];
        permissionNames: string[];
        facilitiesNames: string[];
        activeFacilityId: string;
      };
      actionContext?: {
        resource: string;
        action: string;
        scope?: string | undefined;
      };
    }
  }
}
