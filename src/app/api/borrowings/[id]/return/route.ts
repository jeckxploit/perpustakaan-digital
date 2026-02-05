import { NextRequest, NextResponse } from 'next/server'
import { borrowingService } from '@/services/BorrowingService'
import { authenticateRequest } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { Permission } from '@/lib/permissions'

/**
 * POST /api/borrowings/[id]/return - Return a borrowed book
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permission
    if (!hasPermission(auth.admin.role, Permission.BORROWING_RETURN)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const borrowing = await borrowingService.returnBook(
      params.id,
      auth.admin.name,
      auth.admin.id
    )

    return NextResponse.json(borrowing)
  } catch (error: any) {
    console.error('Error returning book:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to return book' },
      { status: error.status || 500 }
    )
  }
}
