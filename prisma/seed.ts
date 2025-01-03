import { PrismaClient } from "@prisma/client";
import { SeedAccountUsersToken } from "./seed/seed-account-users-token";
import { SeedUsersBackOffice } from "./seed/seed-users-backoffice";
import { SeedAccount } from "./seed/seed-account";
import { SeedTaxConfiguration } from "./seed/seed-tax-configuration";
const prisma = new PrismaClient();
async function main() {
  await new SeedUsersBackOffice(prisma).execute();
  // await new SeedAccount(prisma).execute();
  // await new SeedAccountUsersToken(prisma).execute();
  await new SeedTaxConfiguration(prisma).execute();
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
