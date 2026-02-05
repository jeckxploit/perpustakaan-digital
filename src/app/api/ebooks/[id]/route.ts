import { NextRequest, NextResponse } from 'next/server'
import { eBookService } from '@/services/EBookService'
import { authenticateRequest } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { Permission } from '@/lib/permissions'

/**
 * GET /api/ebooks/[id] - Get e-book by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ebook = await eBookService.getById(params.id)
    return NextResponse.json(ebook)
  } catch (error: any) {
    console.error('Error fetching e-book:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch e-book' },
      { status: 404 }
    )
  }
}

/**
 * PUT /api/ebooks/[id] - Update an e-book
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
    if (!hasPermission(auth.admin.role, Permission.EBOOK_CREATE)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    const ebook = await eBookService.update(
      params.id,
      body,
      auth.admin.name,
      auth.admin.id
    )

    return NextResponse.json(ebook)
  } catch (error: any) {
    console.error('Error updating e-book:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update e-book' },
      { status: error.status || 500 }
    )
  }
}

/**
 * DELETE /api/ebooks/[id] - Delete an e-book
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
    if (!hasPermission(auth.admin.role, Permission.EBOOK_DELETE)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const result = await eBookService.delete(
      params.id,
      auth.admin.name,
      auth.admin.id
    )

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error deleting e-book:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete e-book' },
      { status: error.status || 500 }
    )
  }
}
