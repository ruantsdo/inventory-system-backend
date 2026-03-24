import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { seedAdmin } from "./seeds/admin.seed";
import { seedCity } from "./seeds/city.seed";
import { seedFacilities } from "./seeds/facilities.seed";
import { seedPermissions } from "./seeds/permissions";
import { seedRoles } from "./seeds/roles.seed";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting seed...");

  await seedPermissions(prisma);
  await seedRoles(prisma);

  const city = await seedCity(prisma);
  const facilities = await seedFacilities(prisma, city.id);

  const adminRole = await prisma.role.findUnique({
    where: { name: "ADMIN" },
  });

  if (!adminRole) {
    throw new Error("ADMIN role not found after seeding roles");
  }

  await seedAdmin(prisma, adminRole.id, city.id);

  console.log("Seed completed successfully.");
  console.log({
    city: city.name,
    facilities: facilities.map((f) => f.name),
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
