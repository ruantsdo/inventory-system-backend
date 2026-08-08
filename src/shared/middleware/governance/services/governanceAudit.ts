import { AuditEntity } from "@/generated/prisma/client";
import { type AuditActionType, auditService } from "@/shared/audit";

export interface GovernanceAuditOptions {
  action: AuditActionType;
  entity?: AuditEntity | null | undefined;
  entityId?: string | null | undefined;
  entityName?: string | null | undefined;
  metadata?: Record<string, unknown> | null | undefined;
}

export async function recordGovernanceAudit(options: GovernanceAuditOptions): Promise<void> {
  try {
    await auditService.record({
      entity: options.entity ?? AuditEntity.System,
      entityId: options.entityId ?? null,
      entityName: options.entityName ?? null,
      action: options.action,
      metadata: options.metadata ?? null,
    });
  } catch (error) {
    console.error("[GovernanceAudit] Falha ao registrar log de auditoria de governança:", error);
  }
}
