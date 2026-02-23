import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/password'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Check if admin already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: 'admin@library.com' }
  })

  if (existingAdmin) {
    console.log('✅ Admin already exists, skipping seed')
    return
  }

  // Create default admin
  const passwordHash = hashPassword('Admin123!')

  const admin = await prisma.admin.create({
    data: {
      name: 'Super Admin',
      email: 'admin@library.com',
      passwordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE'
    }
  })

  console.log('✅ Default admin created:', {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role
  })

  console.log('\n📝 Login credentials:')
  console.log('   Email: admin@library.com')
  console.log('   Password: Admin123!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
