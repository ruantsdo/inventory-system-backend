import type { RequestStatus, RequestType } from "@/generated/prisma/client";

export const RequestTypeLabels: Readonly<Record<RequestType, string>> = {
  REPLENISH: "Reposição",
  URGENT: "Urgente",
  ONE_TIME: "Eventual (Única)",
};

export const RequestStatusLabels: Readonly<Record<RequestStatus, string>> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  FULFILLED: "Atendido",
  CANCELLED: "Cancelado",
  REJECTED: "Rejeitado",
};
