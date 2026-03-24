import type { PrismaClient } from "../../src/generated/prisma/client";

export async function seedCity(prisma: PrismaClient) {
  const name = "Alagoinhas";
  const state = "BA";
  const country = "BR";

  const existing = await prisma.city.findFirst({
    where: {
      name,
      state,
      country,
    },
  });

  if (existing) return existing;

  const city = await prisma.city.create({
    data: {
      name,
      state,
      country,
    },
  });

  return city;
}
