import { NextRequest, NextResponse } from 'next/server'
import { activityLogService } from '@/services/ActivityLogService'
import { authenticateRequest } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { Permission } from '@/lib/permissions'

/**
 * GET /api/activity-logs - Get all activity logs
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permission
    if (!hasPermission(auth.admin.role, Permission.LOGS_VIEW)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get('limit')
    const entityType = searchParams.get('entityType')
    const action = searchParams.get('action')

    let logs

    if (entityType) {
      logs = await activityLogService.getByEntityType(
        entityType,
        limit ? parseInt(limit) : undefined
      )
    } else if (action) {
      logs = await activityLogService.getByAction(
        action,
        limit ? parseInt(limit) : undefined
      )
    } else {
      logs = await activityLogService.getAll(limit ? parseInt(limit) : undefined)
    }

    return NextResponse.json(logs)
  } catch (error: any) {
    console.error('Error fetching activity logs:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch activity logs' },
      { status: 500 }
    )
  }
}
