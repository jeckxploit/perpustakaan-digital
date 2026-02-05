import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/auth.service'
import { getAdminFromRequest, isAuthenticated } from '@/middleware/auth.middleware'

export async function POST(request: NextRequest) {
  try {
    // Check if authenticated
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Anda tidak login',
            code: 'UNAUTHORIZED'
          }
        },
        { status: 401 }
      )
    }

    // Get admin from request
    const admin = getAdminFromRequest(request)

    // Logout
    await authService.logout(admin.id, admin.name)

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Logout berhasil'
    }, { status: 200 })
  } catch (error: any) {
    console.error('Logout error:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Terjadi kesalahan saat logout',
          code: 'LOGOUT_ERROR'
        }
      },
      { status: 500 }
    )
  }
}
