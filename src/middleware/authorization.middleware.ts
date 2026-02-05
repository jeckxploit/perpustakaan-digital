import { NextRequest, NextResponse } from 'next/server'
import { hasPermission, Permission } from '@/lib/permissions'
import { ForbiddenError } from '@/lib/errors'
import { getAdminFromRequest, isAuthenticated } from './auth.middleware'

/**
 * Authorization middleware factory
 * Creates middleware that checks if the authenticated admin has the required permission
 */
export function requirePermission(permission: Permission) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    try {
      // Check if authenticated
      if (!isAuthenticated(request)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Anda harus login terlebih dahulu',
              code: 'UNAUTHORIZED'
            }
          },
          { status: 401 }
        )
      }

      // Get admin from request
      const admin = getAdminFromRequest(request)

      // Check permission
      if (!hasPermission(admin.role, permission)) {
        throw new ForbiddenError('Anda tidak memiliki izin untuk melakukan aksi ini')
      }

      // Allow request to proceed
      return null
    } catch (error: any) {
      if (error instanceof ForbiddenError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: error.message,
              code: error.code,
              requiredPermission: permission
            }
          },
          { status: error.statusCode }
        )
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Terjadi kesalahan otorisasi',
            code: 'AUTHZ_ERROR'
          }
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Role check middleware
 * Checks if the authenticated admin has one of the required roles
 */
export function requireRole(...roles: string[]) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    try {
      // Check if authenticated
      if (!isAuthenticated(request)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Anda harus login terlebih dahulu',
              code: 'UNAUTHORIZED'
            }
          },
          { status: 401 }
        )
      }

      // Get admin from request
      const admin = getAdminFromRequest(request)

      // Check role
      if (!roles.includes(admin.role)) {
        throw new ForbiddenError(`Akses ditolak. Role yang diizinkan: ${roles.join(', ')}`)
      }

      // Allow request to proceed
      return null
    } catch (error: any) {
      if (error instanceof ForbiddenError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: error.message,
              code: error.code,
              requiredRoles: roles
            }
          },
          { status: error.statusCode }
        )
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Terjadi kesalahan otorisasi',
            code: 'AUTHZ_ERROR'
          }
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Check if admin has permission (utility function)
 */
export function checkPermission(request: NextRequest, permission: Permission): boolean {
  if (!isAuthenticated(request)) {
    return false
  }

  const admin = getAdminFromRequest(request)
  return hasPermission(admin.role, permission)
}

/**
 * Check if admin has role (utility function)
 */
export function checkRole(request: NextRequest, role: string): boolean {
  if (!isAuthenticated(request)) {
    return false
  }

  const admin = getAdminFromRequest(request)
  return admin.role === role
}
