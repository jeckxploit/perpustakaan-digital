import { NextRequest, NextResponse } from 'next/server'
import { adminService } from '@/services/admin.service'
import { createAdminSchema, adminQuerySchema } from '@/validations/admin.validation'
import { getAdminFromRequest, isAuthenticated } from '@/middleware/auth.middleware'
import { Permission } from '@/lib/permissions'
import { ForbiddenError } from '@/lib/errors'

export async function GET(request: NextRequest) {
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

    // Check permission
    if (admin.role !== 'SUPER_ADMIN') {
      throw new ForbiddenError('Anda tidak memiliki izin untuk melihat daftar admin')
    }

    // Parse query params
    const query = Object.fromEntries(request.nextUrl.searchParams)
    const queryParams = adminQuerySchema.parse(query)

    // Get admins
    const result = await adminService.getAdmins(queryParams)

    return NextResponse.json({
      success: true,
      data: result
    }, { status: 200 })
  } catch (error: any) {
    console.error('Get admins error:', error)

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

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Terjadi kesalahan saat mengambil data admin',
          code: 'GET_ADMINS_ERROR'
        }
      },
      { status: 500 }
    )
  }
}

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

    // Check permission (only SUPER_ADMIN can create admins)
    if (admin.role !== 'SUPER_ADMIN') {
      throw new ForbiddenError('Anda tidak memiliki izin untuk membuat admin baru')
    }

    // Parse and validate request body
    const body = await request.json()
    const dto = createAdminSchema.parse(body)

    // Create admin
    const newAdmin = await adminService.createAdmin(dto, admin.id)

    return NextResponse.json({
      success: true,
      data: newAdmin,
      message: 'Admin berhasil ditambahkan'
    }, { status: 201 })
  } catch (error: any) {
    console.error('Create admin error:', error)

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

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Terjadi kesalahan saat membuat admin',
          code: 'CREATE_ADMIN_ERROR'
        }
      },
      { status: 500 }
    )
  }
}
