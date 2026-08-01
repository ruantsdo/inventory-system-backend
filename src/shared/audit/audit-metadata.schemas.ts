import { z } from "zod";

export const AuditMetadataSchemas = {
  STOCK_MANUAL_ADJUSTMENT: z.object({
    reason: z.string().min(1, "A justificativa do ajuste é obrigatória."),
    physicalCountedQty: z.number(),
    systemExpectedQty: z.number(),
    approvedByManagerId: z.string().uuid().optional(),
  }),

  STOCK_BATCH_QUARANTINED: z.object({
    reason: z.string().min(1, "O motivo do bloqueio é obrigatório."),
    temperatureRecorded: z.number().optional(),
    batchInspectionReportId: z.string().uuid().optional(),
  }),

  ITEM_REQUEST_REJECTED: z.object({
    reason: z.string().min(1, "O motivo da rejeição é obrigatório."),
  }),

  ITEM_REQUEST_CANCELLED: z.object({
    reason: z.string().min(1, "O motivo do cancelamento é obrigatório."),
  }),

  BULK_DATA_IMPORTED: z.object({
    fileName: z.string(),
    rowsProcessed: z.number().int().min(0),
    errorsCount: z.number().int().min(0),
    failureLogUrl: z.string().url().optional(),
  }),

  BULK_DATA_EXPORTED: z.object({
    fileName: z.string(),
    format: z.enum(["CSV", "XLSX", "PDF", "JSON"]),
    rowsExported: z.number().int().min(0),
    filters: z.record(z.string(), z.unknown()).optional(),
  }),

  USER_SENSITIVE_DATA_VIEWED: z.object({
    fieldsExposed: z.array(z.string()).min(1, "Informe os campos sensíveis acessados."),
    reasonForAccess: z.string().optional(),
  }),

  PROFESSIONAL_DOC_EXPOSED: z.object({
    documentType: z.string(),
    reasonForAccess: z.string().optional(),
  }),

  FINANCIAL_COST_EXPOSED: z.object({
    batchId: z.string().uuid().optional(),
    movementId: z.string().uuid().optional(),
    reasonForAccess: z.string().optional(),
  }),
} as const;

export type AuditMetadataSchemasType = typeof AuditMetadataSchemas;

export function validateAuditMetadata(action: string, metadata: unknown): void {
  const schema = (AuditMetadataSchemas as Record<string, z.ZodTypeAny>)[action];
  if (!schema) return;
  schema.parse(metadata);
}
