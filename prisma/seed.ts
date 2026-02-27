import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { seedCity } from "./seeds/city.seed";
import { seedRoles } from "./seeds/role.seed";
import { seedAdmin } from "./seeds/user.seed";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
