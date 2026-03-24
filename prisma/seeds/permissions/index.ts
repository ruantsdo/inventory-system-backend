import type { PrismaClient } from "../../../src/generated/prisma/client";
import { seedAuditPermissions } from "./audit.seed";
import { seedBatchesPermissions } from "./batches.seed";
import { seedCityPermissions } from "./cities.seed";
import { seedControlledItemsPermissions } from "./controlledItems.seed";
import { seedInventoryPermissions } from "./inventory.seed";
import { seedItemsPermissions } from "./items.seed";
import { seedItemTypesPermissions } from "./itemTypes.seed";
import { seedManufacturerPermissions } from "./manufacturers.seed";
import { seedPurchasesPermissions } from "./purchases.seed";
import { seedRequestsPermissions } from "./requests.seed";
import { seedSuppliersPermissions } from "./suppliers.seed";
import { seedSystemAndIntegrationPermissions } from "./systemAndIntegration.seed";
import { seedUsersPermissions } from "./users.seed";

export async function seedPermissions(prisma: PrismaClient) {
  console.log("Seeding permissions...");

  await seedAuditPermissions(prisma);
  await seedBatchesPermissions(prisma);
  await seedCityPermissions(prisma);
  await seedControlledItemsPermissions(prisma);
  await seedInventoryPermissions(prisma);
  await seedItemsPermissions(prisma);
  await seedItemTypesPermissions(prisma);
  await seedManufacturerPermissions(prisma);
  await seedPurchasesPermissions(prisma);
  await seedRequestsPermissions(prisma);
  await seedSuppliersPermissions(prisma);
  await seedSystemAndIntegrationPermissions(prisma);
  await seedUsersPermissions(prisma);

  console.log("All permissions have been seeded");

  return {};
}
