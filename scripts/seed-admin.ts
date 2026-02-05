import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/password'

const prisma = new PrismaClient()

async function seed() {
  console.log('Starting seed...')

  // Check if admin already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: 'admin@library.com' }
  })

  if (existingAdmin) {
    console.log('Admin already exists:', existingAdmin.email)
    console.log('Password: Admin123!')
    return
  }

  // Create default admin
  const admin = await prisma.admin.create({
    data: {
      name: 'Super Admin',
      email: 'admin@library.com',
      passwordHash: hashPassword('Admin123!'),
      role: 'SUPER_ADMIN',
      status: 'ACTIVE'
    }
  })

  console.log('Default admin created:')
  console.log('Email:', admin.email)
  console.log('Password: Admin123!')
  console.log('Role:', admin.role)
}

seed()
  .catch((e) => {
    console.error('Error seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
