import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = "info@krishnapathak.com";
  
  const existing = await prisma.user.findUnique({ where: { email } });
  
  if (!existing) {
    const passwordHash = await bcrypt.hash("admin123", 12);
    
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "ADMIN",
        isApproved: true,
        employee: {
          create: {
            firstName: "Admin",
            lastName: "KrishnaPathak",
          }
        }
      }
    });
    
    console.log("Master Admin created: info@krishnapathak.com / admin123");
  } else {
    console.log("Admin already exists.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
