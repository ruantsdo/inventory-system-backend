import { AuditOrigin, Prisma } from "@/generated/prisma/client";
import { getRequestContext } from "../context/request-context.store";
import type { ExtendedTransactionClient } from "../db/prisma";
import type { AuditActionType } from "./audit-actions";
import { getCategoryForAction } from "./audit-category.map";
import { validateAuditMetadata } from "./audit-metadata.schemas";
import { getSeverityForAction } from "./audit-severity.map";

export interface AuditRecordPayload {
  tx: ExtendedTransactionClient;

  entity: import("@/generated/prisma/client").AuditEntity;
  entityId?: string;
  entityName?: string;

  action: AuditActionType;

  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;

  metadata?: Record<string, unknown> | null;

  correlationId?: string;

  origin?: import("@/generated/prisma/client").AuditOrigin;
}

export class AuditService {
  async record(payload: AuditRecordPayload): Promise<void> {
    const {
      tx,
      entity,
      entityId,
      entityName,
      action,
      before,
      after,
      metadata,
      correlationId,
      origin: payloadOrigin,
    } = payload;

    if (metadata) {
      validateAuditMetadata(action, metadata);
    }

    const ctx = getRequestContext();

    console.warn("CTx", ctx);

    const severity = getSeverityForAction(action);
    const category = getCategoryForAction(action);

    const origin = payloadOrigin ?? ctx.origin ?? AuditOrigin.SYSTEM;

    await tx.auditEvent.create({
      data: {
        schemaVersion: 1,
        origin,
        action,
        category,
        severity,
        entity,
        entityId: entityId ?? null,
        entityName: entityName ?? null,
        performedByUserId: ctx.userId ?? null,
        performedByUserName: ctx.userName ?? null,
        performedByUserEmail: ctx.userEmail ?? null,
        performedByRole: ctx.userRole ?? null,
        facilityId: ctx.facilityId ?? null,
        facilityName: ctx.facilityName ?? null,
        requestId: ctx.requestId ?? null,
        correlationId: correlationId ?? ctx.correlationId ?? null,
        ip: ctx.ip ?? null,
        userAgent: ctx.userAgent ?? null,
        before: before != null ? (before as Prisma.InputJsonValue) : Prisma.JsonNull,
        after: after != null ? (after as Prisma.InputJsonValue) : Prisma.JsonNull,
        metadata: metadata != null ? (metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    });
  }
}

export const auditService = new AuditService();
