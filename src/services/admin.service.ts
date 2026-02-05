import { prisma } from '@/lib/db'
import { hashPassword, comparePassword } from '@/lib/password'
import { ConflictError, NotFoundError } from '@/lib/errors'
import { adminRepository } from '@/repositories/admin.repository'
import { CreateAdminDto, UpdateAdminDto } from '@/validations/admin.validation'
import type { Admin, AdminRole, UserStatus } from '@prisma/client'

export class AdminService {
  /**
   * Get all admins with pagination
   */
  async getAdmins(params: {
    page?: number
    limit?: number
    search?: string
    role?: AdminRole
    status?: UserStatus
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    const { page = 1, limit = 20, search, role, status, sortBy = 'createdAt', sortOrder = 'desc' } = params

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ]
    }

    if (role) {
      where.role = role
    }

    if (status) {
      where.status = status
    }

    // Order by
    const orderBy: any = { [sortBy]: sortOrder }

    const result = await adminRepository.findMany({
      skip,
      take: limit,
      where,
      orderBy,
      include: {
        _count: {
          select: { activityLogs: true }
        }
      }
    })

    return {
      admins: result.admins.map(admin => this.sanitizeAdmin(admin)),
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit)
    }
  }

  /**
   * Get admin by ID
   */
  async getAdminById(id: string) {
    const admin = await adminRepository.findById(id)

    if (!admin) {
      throw new NotFoundError('Admin', id)
    }

    return this.sanitizeAdmin(admin)
  }

  /**
   * Create a new admin
   */
  async createAdmin(dto: CreateAdminDto, createdBy: string) {
    // Check if email already exists
    const existingAdmin = await adminRepository.emailExists(dto.email)
    if (existingAdmin) {
      throw new ConflictError('Email sudah terdaftar')
    }

    // Hash password
    const passwordHash = hashPassword(dto.password)

    // Create admin
    const admin = await adminRepository.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: dto.role ? dto.role : 'LIBRARIAN'
    })

    // Log activity
    await this.logActivity(createdBy, 'CREATE', 'ADMIN', admin.id, admin.name, `Membuat admin baru: ${admin.name} (${admin.email})`)

    return this.sanitizeAdmin(admin)
  }

  /**
   * Update an admin
   */
  async updateAdmin(id: string, dto: UpdateAdminDto, updatedBy: string) {
    const existingAdmin = await adminRepository.findById(id)

    if (!existingAdmin) {
      throw new NotFoundError('Admin', id)
    }

    // Check if email already exists (if changing email)
    if (dto.email && dto.email !== existingAdmin.email) {
      const emailExists = await adminRepository.emailExists(dto.email, id)
      if (emailExists) {
        throw new ConflictError('Email sudah terdaftar')
      }
    }

    // Update admin
    const admin = await adminRepository.update(id, {
      ...(dto.name && { name: dto.name }),
      ...(dto.email && { email: dto.email }),
      ...(dto.role && { role: dto.role }),
      ...(dto.status && { status: dto.status })
    })

    // Log activity
    await this.logActivity(updatedBy, 'UPDATE', 'ADMIN', admin.id, admin.name, `Memperbarui admin: ${admin.name}`)

    return this.sanitizeAdmin(admin)
  }

  /**
   * Change admin password
   */
  async changePassword(adminId: string, currentPassword: string, newPassword: string) {
    const admin = await adminRepository.findById(adminId)

    if (!admin) {
      throw new NotFoundError('Admin', adminId)
    }

    // Verify current password
    const isValidPassword = comparePassword(currentPassword, admin.passwordHash)
    if (!isValidPassword) {
      throw new Error('Password saat ini salah')
    }

    // Hash new password
    const newPasswordHash = hashPassword(newPassword)

    // Update password
    const updatedAdmin = await adminRepository.update(adminId, {
      passwordHash: newPasswordHash
    })

    // Log activity
    await this.logActivity(adminId, 'UPDATE', 'ADMIN', admin.id, admin.name, 'Mengubah password')

    return this.sanitizeAdmin(updatedAdmin)
  }

  /**
   * Delete an admin (soft delete)
   */
  async deleteAdmin(id: string, deletedBy: string) {
    const admin = await adminRepository.findById(id)

    if (!admin) {
      throw new NotFoundError('Admin', id)
    }

    // Prevent self-deletion
    if (id === deletedBy) {
      throw new Error('Tidak dapat menghapus akun sendiri')
    }

    // Soft delete
    await adminRepository.delete(id)

    // Log activity
    await this.logActivity(deletedBy, 'DELETE', 'ADMIN', admin.id, admin.name, `Menghapus admin: ${admin.name}`)
  }

  /**
   * Restore a deleted admin
   */
  async restoreAdmin(id: string, restoredBy: string) {
    const admin = await adminRepository.findById(id)

    if (!admin) {
      throw new NotFoundError('Admin', id)
    }

    // Restore
    const restoredAdmin = await adminRepository.update(id, {
      status: 'ACTIVE'
    })

    // Log activity
    await this.logActivity(restoredBy, 'UPDATE', 'ADMIN', admin.id, admin.name, `Memulihkan admin: ${admin.name}`)

    return this.sanitizeAdmin(restoredAdmin)
  }

  /**
   * Sanitize admin data (remove sensitive fields)
   */
  private sanitizeAdmin(admin: any) {
    const { passwordHash, ...sanitized } = admin
    return sanitized
  }

  /**
   * Log activity
   */
  private async logActivity(
    adminId: string,
    action: string,
    entityType: string,
    entityId: string,
    entityName: string,
    details?: string
  ) {
    const admin = await adminRepository.findById(adminId)

    await this.logActivityRaw({
      adminId,
      adminName: admin?.name || 'Unknown',
      action,
      entityType,
      entityId,
      entityName,
      details
    })
  }

  /**
   * Log activity without admin lookup (for internal use)
   */
  async logActivityRaw(data: {
    adminId?: string
    adminName: string
    action: string
    entityType: string
    entityId: string
    entityName: string
    details?: string
    ipAddress?: string
    userAgent?: string
  }) {
    await prisma.activityLog.create({ data })
  }
}

export const adminService = new AdminService()
