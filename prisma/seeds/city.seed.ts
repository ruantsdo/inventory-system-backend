import type { PrismaClient } from "../../src/generated/prisma/client";

export async function seedCity(prisma: PrismaClient) {
  const cityName = "Alagoinhas";

  let city = await prisma.city.findFirst({
    where: { name: cityName },
  });

  if (!city) {
    city = await prisma.city.create({
      data: {
        name: cityName,
        state: "BA",
        country: "BR",
      },
    });
  }

  return city;
}
