import { AuditEntity } from "@/generated/prisma/client";
import { AuditAction } from "@/shared/audit";
import { prisma } from "@/shared/db/prisma";
import { forbidden } from "@/shared/errors/AppError";
import { recordGovernanceAudit } from "./governanceAudit";

const BYPASS_GOVERNANCE_LEVELS = ["ROOT", "SUPER_ADMIN"] as const;

export async function validateFacilityScope(
  callerId: string,
  requestedFacilityIds: string[]
): Promise<void> {
  if (requestedFacilityIds.length === 0) return;

  const uniqueFacilityIds = [...new Set(requestedFacilityIds)];

  const hasBypassLevel = await prisma.userRole.findFirst({
    where: {
      userId: callerId,
      isActive: true,
      role: {
        governanceLevel: { in: [...BYPASS_GOVERNANCE_LEVELS] },
      },
    },
    select: { id: true },
  });

  if (hasBypassLevel) return;

  const hasGlobalRole = await prisma.userRole.findFirst({
    where: {
      userId: callerId,
      isActive: true,
      scopeMode: "GLOBAL",
    },
    select: { id: true },
  });

  if (hasGlobalRole) return;

  const callerScopes = await prisma.userRoleFacilityScope.findMany({
    where: {
      userRole: {
        userId: callerId,
        isActive: true,
      },
      facility: {
        isActive: true,
        isDeleted: false,
      },
    },
    select: { facilityId: true },
  });

  const authorizedIds = new Set(callerScopes.map((s) => s.facilityId));

  const unauthorizedIds = uniqueFacilityIds.filter((id) => !authorizedIds.has(id));

  if (unauthorizedIds.length === 0) return;

  const unauthorizedFacilities = await prisma.facility.findMany({
    where: { id: { in: unauthorizedIds } },
    select: { id: true, name: true },
  });

  const foundIds = new Set(unauthorizedFacilities.map((f) => f.id));
  const unknownIds = unauthorizedIds.filter((id) => !foundIds.has(id));

  const nameList = [
    ...unauthorizedFacilities.map((f) => `"${f.name}"`),
    ...unknownIds.map((id) => `ID desconhecido (${id})`),
  ].join(", ");

  const reason = `Você não tem autorização para gerenciar usuários nas seguintes unidades: ${nameList}.`;

  await recordGovernanceAudit({
    action: AuditAction.FACILITY_SCOPE_VIOLATION,
    entity: AuditEntity.Facility,
    metadata: {
      callerId,
      unauthorizedFacilityIds: unauthorizedIds,
      reason,
    },
  });

  throw forbidden(reason, "Escopo de unidade insuficiente", "UNIT_SCOPE_VIOLATION");
}
