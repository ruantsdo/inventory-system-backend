import { AuditSeverity } from "@/generated/prisma/client";
import type { AuditActionType } from "./audit-actions";

const actionSeverityMap: Record<AuditActionType, AuditSeverity> = {
  USER_ACCOUNT_CREATED: AuditSeverity.LOW,
  USER_ACCOUNT_UPDATED: AuditSeverity.LOW,
  USER_ACCOUNT_UPDATED_WITH_PERMISSIONS: AuditSeverity.HIGH,
  USER_ACCOUNT_DELETED: AuditSeverity.HIGH,
  USER_ACCOUNT_ACTIVATED: AuditSeverity.MEDIUM,
  USER_ACCOUNT_DEACTIVATED: AuditSeverity.MEDIUM,
  USER_PROFESSIONAL_DOC_ADDED: AuditSeverity.LOW,
  USER_PROFESSIONAL_DOC_REVOKED: AuditSeverity.MEDIUM,
  ROLE_CREATED: AuditSeverity.LOW,
  ROLE_UPDATED: AuditSeverity.MEDIUM,
  ROLE_DELETED: AuditSeverity.HIGH,
  ROLE_PERMISSIONS_CHANGED: AuditSeverity.HIGH,
  USER_ROLE_ASSIGNED: AuditSeverity.MEDIUM,
  USER_ROLE_REMOVED: AuditSeverity.MEDIUM,
  USER_PERMISSION_OVERRIDE: AuditSeverity.CRITICAL,

  STOCK_RECEIPT_REGISTERED: AuditSeverity.LOW,
  STOCK_CONSUMPTION_RECORDED: AuditSeverity.INFO,
  STOCK_TRANSFER_COMPLETED: AuditSeverity.LOW,
  STOCK_MANUAL_ADJUSTMENT: AuditSeverity.MEDIUM,
  STOCK_RESERVATION_PLACED: AuditSeverity.INFO,
  STOCK_RESERVATION_RELEASED: AuditSeverity.INFO,
  STOCK_BATCH_QUARANTINED: AuditSeverity.HIGH,
  STOCK_BATCH_RELEASED: AuditSeverity.MEDIUM,
  STOCK_BATCH_EXPIRED: AuditSeverity.MEDIUM,
  ITEM_REQUEST_SUBMITTED: AuditSeverity.INFO,
  ITEM_REQUEST_APPROVED: AuditSeverity.LOW,
  ITEM_REQUEST_REJECTED: AuditSeverity.LOW,
  ITEM_REQUEST_FULFILLED: AuditSeverity.LOW,
  ITEM_REQUEST_CANCELLED: AuditSeverity.LOW,

  FACILITY_CONFIG_UPDATED: AuditSeverity.LOW,
  LOCATION_CONFIG_UPDATED: AuditSeverity.LOW,
  INVENTORY_LIMITS_CHANGED: AuditSeverity.MEDIUM,
  SYSTEM_SETTINGS_CHANGED: AuditSeverity.HIGH,
  BULK_DATA_IMPORTED: AuditSeverity.MEDIUM,
  BULK_DATA_EXPORTED: AuditSeverity.MEDIUM,

  USER_SENSITIVE_DATA_VIEWED: AuditSeverity.LOW,
  PROFESSIONAL_DOC_EXPOSED: AuditSeverity.MEDIUM,
  FINANCIAL_COST_EXPOSED: AuditSeverity.MEDIUM,
};

export function getSeverityForAction(action: string): AuditSeverity {
  return (actionSeverityMap as Record<string, AuditSeverity>)[action] ?? AuditSeverity.INFO;
}
