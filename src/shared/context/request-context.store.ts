import { AsyncLocalStorage } from "node:async_hooks";
import type { AuditOrigin } from "@/generated/prisma/client";

export interface RequestContext {
  requestId: string;
  ip?: string | undefined;
  userAgent?: string | undefined;
  origin: AuditOrigin;

  userId?: string | undefined;
  userName?: string | undefined;
  userEmail?: string | undefined;
  userRole?: string | undefined;

  facilityId?: string | undefined;
  facilityName?: string | undefined;

  correlationId?: string | undefined;
}

export const requestContextStore = new AsyncLocalStorage<RequestContext>();

export function getRequestContext(): Partial<RequestContext> {
  return requestContextStore.getStore() ?? {};
}

export function updateRequestContext(updates: Partial<RequestContext>): void {
  const store = requestContextStore.getStore();
  if (store) {
    Object.assign(store, updates);
  }
}
