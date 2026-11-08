// Seeds demo data only when the database has no users, so redeploys never wipe real data.
import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

async function main() {
  const prisma = new PrismaClient();
  const users = await prisma.user.count();
  await prisma.$disconnect();
  if (users > 0) {
    console.log(`Database already has ${users} users, skipping seed.`);
    return;
  }
  console.log("Empty database, seeding CEDA demo data...");
  execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
