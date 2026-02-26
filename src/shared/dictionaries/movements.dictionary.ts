import type { MovementType } from "@prisma/client";

export const MovementTypeLabels: Readonly<Record<MovementType, string>> = {
  RECEIPT: "Recebimento",
  SUPPLY: "Suprimento",
  TRANSFER_IN: "Transferência (Entrada)",
  TRANSFER_OUT: "Transferência (Saída)",
  ADJUSTMENT: "Ajuste",
  CONSUMPTION: "Consumo",
  RESERVATION: "Reserva",
  RELEASE: "Liberação",
};
