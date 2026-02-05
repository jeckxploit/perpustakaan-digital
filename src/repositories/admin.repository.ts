import { prisma } from '@/lib/db'
import type { Admin, Prisma } from '@prisma/client'

export type AdminCreateData = Prisma.AdminCreateInput
export type AdminUpdateData = Prisma.AdminUpdateInput
export type AdminWhereInput = Prisma.AdminWhereInput

export class AdminRepository {
  /**
   * Find all admins with optional filtering
   */
  async findMany(params: {
    skip?: number
    take?: number
    where?: AdminWhereInput
    orderBy?: Prisma.AdminOrderByWithRelationInput
    include?: Prisma.AdminInclude
  }) {
    const { skip = 0, take = 20, where, orderBy, include } = params

    const [admins, total] = await Promise.all([
      prisma.admin.findMany({
        skip,
        take,
        where,
        orderBy,
        include
      }),
      prisma.admin.count({ where })
    ])

    return { admins, total }
  }

  /**
   * Find admin by ID
   */
  async findById(id: string) {
    return prisma.admin.findUnique({
      where: { id },
      include: {
        activityLogs: {
          take: 10,
          orderBy: { timestamp: 'desc' }
        }
      }
    })
  }

  /**
   * Find admin by email
   */
  async findByEmail(email: string) {
    return prisma.admin.findUnique({
      where: { email }
    })
  }

  /**
   * Create a new admin
   */
  async create(data: AdminCreateData) {
    return prisma.admin.create({ data })
  }

  /**
   * Update an admin
   */
  async update(id: string, data: AdminUpdateData) {
    return prisma.admin.update({
      where: { id },
      data
    })
  }

  /**
   * Delete an admin (soft delete)
   */
  async delete(id: string) {
    return prisma.admin.update({
      where: { id },
      data: { status: 'DELETED' }
    })
  }

  /**
   * Permanently delete an admin
   */
  async hardDelete(id: string) {
    return prisma.admin.delete({
      where: { id }
    })
  }

  /**
   * Count admins by filters
   */
  async count(where?: AdminWhereInput) {
    return prisma.admin.count({ where })
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string, excludeId?: string) {
    return prisma.admin.findFirst({
      where: {
        email,
        id: excludeId ? { not: excludeId } : undefined
      }
    })
  }
}

export const adminRepository = new AdminRepository()
