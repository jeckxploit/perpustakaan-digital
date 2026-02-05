import { NextRequest, NextResponse } from 'next/server'
import { borrowingService } from '@/services/BorrowingService'
import { authenticateRequest } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { Permission } from '@/lib/permissions'

/**
 * GET /api/borrowings - Get all borrowings
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const memberId = searchParams.get('memberId')
    const bookId = searchParams.get('bookId')

    let where: any = {}

    if (status) {
      where.status = status
    }
    if (memberId) {
      where.memberId = memberId
    }
    if (bookId) {
      where.bookId = bookId
    }

    const borrowings = await borrowingService.getAll({
      where,
      orderBy: { borrowDate: 'desc' as any },
    })

    return NextResponse.json(borrowings)
  } catch (error: any) {
    console.error('Error fetching borrowings:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch borrowings' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/borrowings - Create a new borrowing
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permission
    if (!hasPermission(auth.admin.role, Permission.BORROWING_CREATE)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    // Set default due date to 14 days from now if not provided
    if (!body.dueDate) {
      const defaultDueDate = new Date()
      defaultDueDate.setDate(defaultDueDate.getDate() + 14)
      body.dueDate = defaultDueDate
    }

    const borrowing = await borrowingService.create(
      {
        bookId: body.bookId,
        memberId: body.memberId,
        dueDate: new Date(body.dueDate),
        notes: body.notes,
      },
      auth.admin.name,
      auth.admin.id
    )

    return NextResponse.json(borrowing, { status: 201 })
  } catch (error: any) {
    console.error('Error creating borrowing:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create borrowing' },
      { status: error.status || 500 }
    )
  }
}
