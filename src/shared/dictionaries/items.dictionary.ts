import type { BatchStatus } from "@/generated/prisma/client";

export const BatchStatusLabels: Readonly<Record<BatchStatus, string>> = {
  OPEN: "Aberto",
  QUARANTINED: "Em Quarentena",
  RELEASED: "Liberado",
  CONSUMED: "Consumido",
  EXPIRED: "Vencido",
};
