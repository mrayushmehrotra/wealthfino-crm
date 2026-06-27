import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = "info@krishnapathak.com";
  
  const updatedUser = await prisma.user.update({
    where: { email },
    data: {
      isApproved: true,
      role: "ADMIN",
    },
  });
  
  console.log(`Updated ${email}: isApproved=${updatedUser.isApproved}, role=${updatedUser.role}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
