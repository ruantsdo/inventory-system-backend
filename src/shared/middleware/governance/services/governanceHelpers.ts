import type { GovernanceLevel } from "../../../../generated/prisma/enums";

export const GOVERNANCE_RANK: Record<GovernanceLevel, number> = {
  ROOT: 999,
  SUPER_ADMIN: 100,
  SYSTEM_ADMIN: 80,
  MANAGER: 60,
};

export function isHigherThan(
  callerLevel: GovernanceLevel | null | undefined,
  targetLevel: GovernanceLevel | null | undefined
): boolean {
  if (!callerLevel) return false;
  if (!targetLevel) return true;
  return GOVERNANCE_RANK[callerLevel] > GOVERNANCE_RANK[targetLevel];
}

export function isAtLeast(
  callerLevel: GovernanceLevel | null | undefined,
  required: GovernanceLevel
): boolean {
  if (!callerLevel) return false;
  return GOVERNANCE_RANK[callerLevel] >= GOVERNANCE_RANK[required];
}
