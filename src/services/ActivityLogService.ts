import { prisma } from '@/lib/db'
import type { Admin } from '@prisma/client'

export interface LogCreateData {
  adminId?: string
  adminName: string
  action: 'create' | 'update' | 'delete' | 'borrow' | 'return'
  entityType: 'book' | 'ebook' | 'member' | 'borrowing' | 'admin'
  entityId: string
  entityName: string
  details?: string
  ipAddress?: string
  userAgent?: string
}

class ActivityLogService {
  /**
   * Log an activity
   */
  async log(data: LogCreateData) {
    return prisma.activityLog.create({
      data: {
        adminId: data.adminId,
        adminName: data.adminName,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        entityName: data.entityName,
        details: data.details,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    })
  }

  /**
   * Get all activity logs
   */
  async getAll(limit = 50) {
    return prisma.activityLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
    })
  }

  /**
   * Get logs by admin
   */
  async getByAdminId(adminId: string, limit = 50) {
    return prisma.activityLog.findMany({
      where: { adminId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    })
  }

  /**
   * Get logs by entity type
   */
  async getByEntityType(entityType: string, limit = 50) {
    return prisma.activityLog.findMany({
      where: { entityType },
      orderBy: { timestamp: 'desc' },
      take: limit,
    })
  }

  /**
   * Get logs by action type
   */
  async getByAction(action: string, limit = 50) {
    return prisma.activityLog.findMany({
      where: { action },
      orderBy: { timestamp: 'desc' },
      take: limit,
    })
  }

  /**
   * Delete old logs (cleanup utility)
   */
  async deleteOldLogs(daysToKeep: number = 90) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    return prisma.activityLog.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    })
  }
}

export const activityLogService = new ActivityLogService()
