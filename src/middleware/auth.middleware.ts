import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import { UnauthorizedError } from '@/lib/errors'
import { authService } from '@/services/auth.service'

export interface AuthRequest extends NextRequest {
  admin?: {
    id: string
    name: string
    email: string
    role: string
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches admin to request
 */
export async function authMiddleware(request: NextRequest): Promise<NextResponse | null> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token tidak ditemukan')
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify token
    const payload = verifyToken(token)

    if (!payload) {
      throw new UnauthorizedError('Token tidak valid atau sudah kadaluarsa')
    }

    // Verify admin exists and is active
    const admin = await authService.verifyTokenAndGetAdmin(token)

    // Attach admin to request headers for downstream use
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-admin-id', admin.id)
    requestHeaders.set('x-admin-email', admin.email)
    requestHeaders.set('x-admin-name', admin.name)
    requestHeaders.set('x-admin-role', admin.role)

    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    })
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: error.message,
            code: error.code
          }
        },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Terjadi kesalahan autentikasi',
          code: 'AUTH_ERROR'
        }
      },
      { status: 500 }
    )
  }
}

/**
 * Helper function to get admin from request
 */
export function getAdminFromRequest(request: NextRequest) {
  return {
    id: request.headers.get('x-admin-id') || '',
    email: request.headers.get('x-admin-email') || '',
    name: request.headers.get('x-admin-name') || '',
    role: request.headers.get('x-admin-role') || ''
  }
}

/**
 * Helper function to check if request is authenticated
 */
export function isAuthenticated(request: NextRequest): boolean {
  return !!request.headers.get('x-admin-id')
}
