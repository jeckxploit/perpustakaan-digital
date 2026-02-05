import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/auth.service'
import { loginSchema } from '@/validations/auth.validation'
import { getAdminFromRequest } from '@/middleware/auth.middleware'

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const dto = loginSchema.parse(body)

    // Get IP address
    const ipAddress = request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'unknown'

    // Login
    const result = await authService.login(dto, ipAddress)

    // Return success response
    return NextResponse.json({
      success: true,
      data: result,
      message: 'Login berhasil'
    }, { status: 200 })
  } catch (error: any) {
    console.error('Login error:', error)

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
          message: 'Terjadi kesalahan saat login',
          code: 'LOGIN_ERROR'
        }
      },
      { status: 500 }
    )
  }
}
