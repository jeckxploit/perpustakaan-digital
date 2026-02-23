import { prisma } from '@/lib/db'
import { hashPassword, comparePassword } from '@/lib/password'
import { generateToken, verifyToken } from '@/lib/jwt'
import { UnauthorizedError, NotFoundError, AppError } from '@/lib/errors'
import { LoginDto, RegisterAdminDto, ChangePasswordDto } from '@/validations/auth.validation'
import type { JWTPayload } from '@/lib/jwt'

export interface AuthResult {
  token: string
  admin: {
    id: string
    name: string
    email: string
    role: string
  }
}

// Hardcoded default credentials for production (SQLite on Vercel)
const DEFAULT_CREDENTIALS = {
  email: 'admin@library.com',
  password: 'Admin123!',
  name: 'Super Admin',
  role: 'SUPER_ADMIN'
}

export class AuthService {
  /**
   * Authenticates an admin and returns a token
   */
  async login(dto: LoginDto, ipAddress?: string): Promise<AuthResult> {
    // Check default credentials first (for production without database)
    if (dto.email === DEFAULT_CREDENTIALS.email && dto.password === DEFAULT_CREDENTIALS.password) {
      const token = generateToken({
        adminId: 'default-admin',
        email: DEFAULT_CREDENTIALS.email,
        name: DEFAULT_CREDENTIALS.name,
        role: DEFAULT_CREDENTIALS.role
      })

      return {
        token,
        admin: {
          id: 'default-admin',
          name: DEFAULT_CREDENTIALS.name,
          email: DEFAULT_CREDENTIALS.email,
          role: DEFAULT_CREDENTIALS.role
        }
      }
    }

    // Fallback to database for other users
    const admin = await prisma.admin.findUnique({
      where: { email: dto.email }
    })

    if (!admin) {
      throw new UnauthorizedError('Email atau password salah')
    }

    if (admin.status !== 'ACTIVE') {
      throw new UnauthorizedError('Akun Anda tidak aktif')
    }

    const isValidPassword = comparePassword(dto.password, admin.passwordHash)

    if (!isValidPassword) {
      throw new UnauthorizedError('Email atau password salah')
    }

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress
      }
    })

    // Generate token
    const token = generateToken({
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    })

    return {
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    }
  }

  /**
   * Registers a new admin
   */
  async register(dto: RegisterAdminDto, createdBy?: string): Promise<AuthResult> {
    // Check if email already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: dto.email }
    })

    if (existingAdmin) {
      throw new AppError('Email sudah terdaftar', 409, 'EMAIL_EXISTS')
    }

    // Hash password
    const passwordHash = hashPassword(dto.password)

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: dto.role ? dto.role as any : 'LIBRARIAN'
      }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: createdBy,
        adminName: createdBy ? await this.getAdminName(createdBy) : 'System',
        action: 'CREATE',
        entityType: 'ADMIN',
        entityId: admin.id,
        entityName: admin.name,
        details: `Membuat admin baru: ${admin.name} (${admin.email}) dengan role ${admin.role}`
      }
    })

    // Generate token
    const token = generateToken({
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    })

    return {
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    }
  }

  /**
   * Verifies a token and returns the admin
   */
  async verifyTokenAndGetAdmin(token: string) {
    const payload = verifyToken(token)

    if (!payload) {
      throw new UnauthorizedError('Token tidak valid atau sudah kadaluarsa')
    }

    const admin = await prisma.admin.findUnique({
      where: { id: payload.adminId }
    })

    if (!admin) {
      throw new NotFoundError('Admin', payload.adminId)
    }

    if (admin.status !== 'ACTIVE') {
      throw new UnauthorizedError('Akun Anda tidak aktif')
    }

    return admin
  }

  /**
   * Changes admin password
   */
  async changePassword(adminId: string, dto: ChangePasswordDto) {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId }
    })

    if (!admin) {
      throw new NotFoundError('Admin', adminId)
    }

    // Verify current password
    const isValidPassword = comparePassword(dto.currentPassword, admin.passwordHash)

    if (!isValidPassword) {
      throw new UnauthorizedError('Password saat ini salah')
    }

    // Hash new password
    const newPasswordHash = hashPassword(dto.newPassword)

    // Update password
    await prisma.admin.update({
      where: { id: adminId },
      data: { passwordHash: newPasswordHash }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: adminId,
        adminName: admin.name,
        action: 'UPDATE',
        entityType: 'ADMIN',
        entityId: adminId,
        entityName: admin.name,
        details: 'Mengubah password'
      }
    })
  }

  /**
   * Logs out an admin
   */
  async logout(adminId: string, adminName: string) {
    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId,
        adminName,
        action: 'LOGOUT',
        entityType: 'ADMIN',
        entityId: adminId,
        entityName: adminName
      }
    })
  }

  /**
   * Gets admin name by ID
   */
  private async getAdminName(adminId: string): Promise<string> {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { name: true }
    })
    return admin?.name || 'Unknown'
  }
}

export const authService = new AuthService()
