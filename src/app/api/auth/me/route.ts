import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest, isAuthenticated } from '@/middleware/auth.middleware'
import { adminService } from '@/services/admin.service'

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

    // Get full admin details
    const adminDetails = await adminService.getAdminById(admin.id)

    return NextResponse.json({
      success: true,
      data: adminDetails
    }, { status: 200 })
  } catch (error: any) {
    console.error('Get current admin error:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Terjadi kesalahan saat mengambil data admin',
          code: 'GET_ME_ERROR'
        }
      },
      { status: 500 }
    )
  }
}
