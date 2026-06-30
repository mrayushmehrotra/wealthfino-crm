import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = 'info@krishnapathak.com'
  const defaultPassword = 'Admin@123' // They can change this later

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(defaultPassword, 10)
    
    // Create the admin user
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        role: Role.ADMIN,
        isApproved: true,
        employee: {
          create: {
            firstName: 'Krishna',
            lastName: 'Pathak',
            department: 'Management',
            designation: 'Admin',
          }
        }
      }
    })
    
    console.log(`✅ Admin user created: ${adminEmail} / ${defaultPassword}`)
  } else {
    console.log(`ℹ️ Admin user ${adminEmail} already exists.`)
    // Optionally update their role just in case
    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: Role.ADMIN, isApproved: true }
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
