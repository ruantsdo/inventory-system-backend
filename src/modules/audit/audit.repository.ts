import type { AuditCategory, AuditSeverity } from "@/generated/prisma/enums";
import { prisma } from "../../shared/db/prisma";

const defaultSelect = {
  id: true,
  origin: true,
  createdAt: true,
  action: true,
  category: true,
  severity: true,
  performedByUserName: true,
  facilityName: true,
};

const detailSelect = {
  ...defaultSelect,
  schemaVersion: true,

  entity: true,
  entityId: true,
  entityName: true,

  performedByUserId: true,
  performedByUserEmail: true,
  performedByRole: true,

  facilityId: true,

  ip: true,
  userAgent: true,

  before: true,
  after: true,
};

const defaultPageSize = 1000;
const paginationConfig = (page: number) => {
  const safePage = Math.max(1, page || 1);
  return {
    skip: (safePage - 1) * defaultPageSize,
    take: defaultPageSize,
  };
};

const defaultOrderBy = {
  createdAt: "desc" as const,
};

export const AuditRepository = {
  async findFirstOneThousand(page: number) {
    return prisma.auditEvent.findMany({
      ...paginationConfig(page),
      select: defaultSelect,
      orderBy: defaultOrderBy,
    });
  },

  async getByAction(action: string, page: number) {
    return prisma.auditEvent.findMany({
      ...paginationConfig(page),
      where: {
        action,
      },
      select: defaultSelect,
      orderBy: defaultOrderBy,
    });
  },

  async getByCategory(category: AuditCategory, page: number) {
    return prisma.auditEvent.findMany({
      ...paginationConfig(page),
      where: {
        category,
      },
      select: defaultSelect,
      orderBy: defaultOrderBy,
    });
  },

  async getBySeverity(severity: AuditSeverity, page: number) {
    return prisma.auditEvent.findMany({
      ...paginationConfig(page),
      where: {
        severity,
      },
      select: defaultSelect,
      orderBy: defaultOrderBy,
    });
  },

  async detailAuditEvent(id: string) {
    return prisma.auditEvent.findUnique({
      where: {
        id,
      },
      select: detailSelect,
    });
  },
};
