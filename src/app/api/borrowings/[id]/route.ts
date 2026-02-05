import { NextRequest, NextResponse } from 'next/server'
import { borrowingService } from '@/services/BorrowingService'
import { authenticateRequest } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { Permission } from '@/lib/permissions'

/**
 * GET /api/borrowings/[id] - Get borrowing by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const borrowing = await borrowingService.getById(params.id)
    return NextResponse.json(borrowing)
  } catch (error: any) {
    console.error('Error fetching borrowing:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch borrowing' },
      { status: 404 }
    )
  }
}
