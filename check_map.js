const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.settings.findFirst();
  console.log("DB MAP LINK:", settings?.googleMapsLink);
  console.log("DB MAP ADDR:", settings?.factoryAddress);
}

main().finally(() => prisma.$disconnect());
