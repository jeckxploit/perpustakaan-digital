import { NextRequest, NextResponse } from 'next/server'
import { adminService } from '@/services/admin.service'
import { updateAdminSchema } from '@/validations/admin.validation'
import { getAdminFromRequest, isAuthenticated } from '@/middleware/auth.middleware'
import { ForbiddenError } from '@/lib/errors'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check permission (only SUPER_ADMIN can view admin details)
    if (admin.role !== 'SUPER_ADMIN') {
      throw new ForbiddenError('Anda tidak memiliki izin untuk melihat detail admin')
    }

    // Get admin
    const adminData = await adminService.getAdminById(params.id)

    return NextResponse.json({
      success: true,
      data: adminData
    }, { status: 200 })
  } catch (error: any) {
    console.error('Get admin error:', error)

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
          code: 'GET_ADMIN_ERROR'
        }
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check permission (only SUPER_ADMIN can update admins)
    if (admin.role !== 'SUPER_ADMIN') {
      throw new ForbiddenError('Anda tidak memiliki izin untuk memperbarui admin')
    }

    // Parse and validate request body
    const body = await request.json()
    const dto = updateAdminSchema.parse(body)

    // Update admin
    const updatedAdmin = await adminService.updateAdmin(params.id, dto, admin.id)

    return NextResponse.json({
      success: true,
      data: updatedAdmin,
      message: 'Admin berhasil diperbarui'
    }, { status: 200 })
  } catch (error: any) {
    console.error('Update admin error:', error)

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
          message: 'Terjadi kesalahan saat memperbarui admin',
          code: 'UPDATE_ADMIN_ERROR'
        }
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check permission (only SUPER_ADMIN can delete admins)
    if (admin.role !== 'SUPER_ADMIN') {
      throw new ForbiddenError('Anda tidak memiliki izin untuk menghapus admin')
    }

    // Delete admin (soft delete)
    await adminService.deleteAdmin(params.id, admin.id)

    return NextResponse.json({
      success: true,
      message: 'Admin berhasil dihapus'
    }, { status: 200 })
  } catch (error: any) {
    console.error('Delete admin error:', error)

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
          message: 'Terjadi kesalahan saat menghapus admin',
          code: 'DELETE_ADMIN_ERROR'
        }
      },
      { status: 500 }
    )
  }
}
