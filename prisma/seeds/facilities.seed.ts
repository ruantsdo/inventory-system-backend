import type { PrismaClient } from "../../src/generated/prisma/client";

type SeedFacilityInput = {
  name: string;
  description: string;
  phone?: string | null;
  cnes?: string | null;
  address: object;
};

const facilities: SeedFacilityInput[] = [
  {
    name: "Armazém Principal",
    description: "Unidade central responsável pelo estoque principal e distribuição.",
    phone: "(75) 0000-0000",
    cnes: null,
    address: {
      street: "Rua Central",
      number: "100",
      neighborhood: "Centro",
      zipCode: "48000-000",
      complement: "Galpão principal",
    },
  },
  {
    name: "Unidade de Saúde Central",
    description: "Unidade de saúde para atendimento e recebimento de insumos.",
    phone: "(75) 0000-0001",
    cnes: null,
    address: {
      street: "Avenida Saúde",
      number: "200",
      neighborhood: "Centro",
      zipCode: "48000-001",
      complement: "Unidade assistencial",
    },
  },
];

export async function seedFacilities(prisma: PrismaClient, cityId: string) {
  console.log("Seeding facilities...");

  const createdFacilities: { id: string; name: string }[] = [];

  for (const facility of facilities) {
    const existing = await prisma.facility.findFirst({
      where: {
        name: facility.name,
        cityId,
      },
    });

    if (existing) {
      createdFacilities.push({ id: existing.id, name: existing.name });
      continue;
    }

    const created = await prisma.facility.create({
      data: {
        name: facility.name,
        description: facility.description,
        phone: facility.phone ?? null,
        cnes: facility.cnes ?? null,
        address: facility.address,
        isActive: true,
        cityId,
      },
    });

    createdFacilities.push({ id: created.id, name: created.name });
  }

  console.log(`Facilities seeded: ${createdFacilities.length}`);

  return createdFacilities;
}
