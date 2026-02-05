import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/auth.service'
import { changePasswordSchema } from '@/validations/auth.validation'
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

    // Parse and validate request body
    const body = await request.json()
    const dto = changePasswordSchema.parse(body)

    // Change password
    await authService.changePassword(admin.id, dto)

    return NextResponse.json({
      success: true,
      message: 'Password berhasil diubah'
    }, { status: 200 })
  } catch (error: any) {
    console.error('Change password error:', error)

    // Handle validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Validasi gagal',
            code: 'VALIDATION_ERROR',
            details: error.errors
          }
        },
        { status: 400 }
      )
    }

    // Handle known errors
    if (error.statusCode) {
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

    // Handle unknown errors
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Terjadi kesalahan saat mengubah password',
          code: 'CHANGE_PASSWORD_ERROR'
        }
      },
      { status: 500 }
    )
  }
}
