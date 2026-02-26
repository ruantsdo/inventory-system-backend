import { PrismaClient } from "@prisma/client";
import { seedCity } from "./seeds/city.seed";
import { seedRoles } from "./seeds/role.seed";
import { seedAdmin } from "./seeds/user.seed";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding...");

  const city = await seedCity(prisma);
  const adminRole = await seedRoles(prisma);

  await seedAdmin(prisma, city!.id, adminRole!.id);

  console.log("Seed concluído");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
