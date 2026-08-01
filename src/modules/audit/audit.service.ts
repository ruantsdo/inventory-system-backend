import type { AuditCategory, AuditSeverity } from "@/generated/prisma/enums";
import { AuditRepository } from "./audit.repository";

export const AuditService = {
  async getFirstOneThousand(page: number) {
    return AuditRepository.findFirstOneThousand(page);
  },

  async getByAction(action: string, page: number) {
    return AuditRepository.getByAction(action, page);
  },

  async getByCategory(category: AuditCategory, page: number) {
    return AuditRepository.getByCategory(category, page);
  },

  async getBySeverity(severity: AuditSeverity, page: number) {
    return AuditRepository.getBySeverity(severity, page);
  },

  async getDetailAuditEvent(id: string) {
    return AuditRepository.detailAuditEvent(id);
  },
};
