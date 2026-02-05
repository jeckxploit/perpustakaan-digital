import { NextRequest, NextResponse } from 'next/server'
import { reportService } from '@/services/ReportService'
import { authenticateRequest } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { Permission } from '@/lib/permissions'

/**
 * GET /api/reports/overall - Get overall statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permission
    if (!hasPermission(auth.admin.role, Permission.REPORTS_VIEW)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const stats = await reportService.getOverallStatistics()

    return NextResponse.json(stats)
  } catch (error: any) {
    console.error('Error getting overall statistics:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get report' },
      { status: 500 }
    )
  }
}
