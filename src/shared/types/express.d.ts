export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        roleNames: string[];
        permissionNames: string[];
        facilitiesNames: string[];
      };
    }
  }
}
