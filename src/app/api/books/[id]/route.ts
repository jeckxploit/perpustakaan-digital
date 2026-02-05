import { NextRequest, NextResponse } from 'next/server'
import { bookService } from '@/services/BookService'
import { authenticateRequest } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { Permission } from '@/lib/permissions'

/**
 * GET /api/books/[id] - Get book by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const book = await bookService.getById(params.id)
    return NextResponse.json(book)
  } catch (error: any) {
    console.error('Error fetching book:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch book' },
      { status: 404 }
    )
  }
}

/**
 * PUT /api/books/[id] - Update a book
 */
export async function PUT(
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
    if (!hasPermission(auth.admin.role, Permission.BOOK_UPDATE)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    const book = await bookService.update(
      params.id,
      body,
      auth.admin.name,
      auth.admin.id
    )

    return NextResponse.json(book)
  } catch (error: any) {
    console.error('Error updating book:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update book' },
      { status: error.status || 500 }
    )
  }
}

/**
 * DELETE /api/books/[id] - Delete a book
 */
export async function DELETE(
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
    if (!hasPermission(auth.admin.role, Permission.BOOK_DELETE)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const result = await bookService.delete(
      params.id,
      auth.admin.name,
      auth.admin.id
    )

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error deleting book:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete book' },
      { status: error.status || 500 }
    )
  }
}
