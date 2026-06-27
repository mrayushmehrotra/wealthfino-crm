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

  // Seed a single employee
  const empEmail = "employee@wealthfino.com";
  const empExisting = await prisma.user.findUnique({ where: { email: empEmail } });
  
  if (!empExisting) {
    const empPasswordHash = await bcrypt.hash("employee123", 12);
    await prisma.user.create({
      data: {
        email: empEmail,
        passwordHash: empPasswordHash,
        role: "EMPLOYEE",
        isApproved: true,
        employee: {
          create: {
            firstName: "John",
            lastName: "Doe",
            department: "Engineering",
            designation: "Software Engineer"
          }
        }
      }
    });
    console.log(`Employee created: ${empEmail} / employee123`);
  } else {
    console.log("Employee already exists.");
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
