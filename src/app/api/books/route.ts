import { NextRequest, NextResponse } from 'next/server'
import { bookService } from '@/services/BookService'
import { authenticateRequest } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { Permission } from '@/lib/permissions'

/**
 * GET /api/books - Get all books
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const skip = searchParams.get('skip')
    const take = searchParams.get('take')

    if (query) {
      const books = await bookService.search(query)
      return NextResponse.json(books)
    }

    const books = await bookService.getAll({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
    })

    return NextResponse.json(books)
  } catch (error: any) {
    console.error('Error fetching books:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch books' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/books - Create a new book
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permission
    if (!hasPermission(auth.admin.role, Permission.BOOK_CREATE)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    const book = await bookService.create(
      body,
      auth.admin.name,
      auth.admin.id
    )

    return NextResponse.json(book, { status: 201 })
  } catch (error: any) {
    console.error('Error creating book:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create book' },
      { status: error.status || 500 }
    )
  }
}
