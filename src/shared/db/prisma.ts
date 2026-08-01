import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const baseClient = new PrismaClient({ adapter });

export const prisma = baseClient.$extends({
  query: {
    auditEvent: {
      async update() {
        throw new Error(
          "[AuditService] Operação proibida: a tabela de auditoria é Append-Only. Use auditService.record() para registrar eventos."
        );
      },
      async updateMany() {
        throw new Error("[AuditService] Operação proibida: a tabela de auditoria é Append-Only.");
      },
      async delete() {
        throw new Error("[AuditService] Operação proibida: a tabela de auditoria é Append-Only.");
      },
      async deleteMany() {
        throw new Error("[AuditService] Operação proibida: a tabela de auditoria é Append-Only.");
      },
    },
  },
});

export type ExtendedPrismaClient = typeof prisma;

export type ExtendedTransactionClient = Parameters<
  Parameters<ExtendedPrismaClient["$transaction"]>[0]
>[0];
