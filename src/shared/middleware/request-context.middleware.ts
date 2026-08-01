import { randomUUID } from "node:crypto";
import { AuditOrigin } from "@/generated/prisma/client";
import type { NextFunction, Request, Response } from "express";
import { type RequestContext, requestContextStore } from "../context/request-context.store";

export function requestContextMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const requestId = randomUUID();
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
    req.socket.remoteAddress ??
    undefined;
  const userAgent = req.headers["user-agent"] ?? undefined;

  const context: RequestContext = {
    requestId,
    origin: AuditOrigin.API,
    ...(ip !== undefined && { ip }),
    ...(userAgent !== undefined && { userAgent }),
    ...(req.user?.id !== undefined && { userId: req.user.id }),
    ...(req.user?.userName !== undefined && { userName: req.user.userName }),
    ...(req.user?.userEmail !== undefined && { userEmail: req.user.userEmail }),
    ...(req.user?.roleNames?.[0] !== undefined && { userRole: req.user.roleNames[0] }),
    ...(req.user?.activeFacilityId !== undefined &&
      req.user.activeFacilityId !== "ALL" && { facilityId: req.user.activeFacilityId }),
    ...(req.user?.activeFacilityName !== undefined && {
      facilityName: req.user.activeFacilityName,
    }),
  };

  requestContextStore.run(context, () => next());
}
