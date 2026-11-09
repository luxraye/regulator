/**
 * Demo data for the CEDA Innovation Portal.
 * Everything here is fictional. Running the seed wipes the demo database and rebuilds it,
 * with dates relative to today so deadlines and timelines always look current.
 */
import { PrismaClient } from "@prisma/client";
import { seedDemoData, DEMO_PASSWORD } from "../src/lib/seed-demo";

const prisma = new PrismaClient();
export { DEMO_PASSWORD };

async function main() {
  console.log("Resetting demo data…");
  const counts = await seedDemoData(prisma);
  console.log(`Seed complete (${counts.users} users, ${counts.instances} ideas, ${counts.threads} discussions). Demo password for every account: ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
