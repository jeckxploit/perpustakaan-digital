import { NextRequest, NextResponse } from 'next/server'
import { bookService } from '@/services/BookService'
import { memberService } from '@/services/MemberService'
import { borrowingService } from '@/services/BorrowingService'
import { authenticateRequest } from '@/lib/auth'

/**
 * GET /api/stats - Get system statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate (optional for stats, but good for security)
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [bookStats, memberStats, borrowingStats] = await Promise.all([
      bookService.getStats(),
      memberService.getStats(),
      borrowingService.getStats(),
    ])

    const stats = {
      books: bookStats,
      members: memberStats,
      borrowings: borrowingStats,
    }

    return NextResponse.json(stats)
  } catch (error: any) {
    console.error('Error fetching statistics:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
