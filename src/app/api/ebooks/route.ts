import { NextRequest, NextResponse } from 'next/server'
import { eBookService } from '@/services/EBookService'
import { authenticateRequest } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { Permission } from '@/lib/permissions'

/**
 * GET /api/ebooks - Get all e-books
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const skip = searchParams.get('skip')
    const take = searchParams.get('take')

    if (query) {
      const ebooks = await eBookService.search(query)
      return NextResponse.json(ebooks)
    }

    const ebooks = await eBookService.getAll({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
    })

    return NextResponse.json(ebooks)
  } catch (error: any) {
    console.error('Error fetching e-books:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch e-books' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/ebooks - Create a new e-book
 */
export async function POST(request: NextRequest) {
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

    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const author = formData.get('author') as string
    const category = formData.get('category') as string
    const isbn = formData.get('isbn') as string
    const publishedYear = formData.get('publishedYear') as string
    const publisher = formData.get('publisher') as string
    const description = formData.get('description') as string

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    if (!title || !author || !category) {
      return NextResponse.json({ error: 'Title, author, and category are required' }, { status: 400 })
    }

    // Read file
    const bytes = await file.arrayBuffer()
    const fileSize = file.size

    // Create ebook record with PDF path (will be updated when file is saved)
    const ebook = await eBookService.create(
      {
        title,
        author,
        category,
        isbn: isbn || undefined,
        publishedYear: publishedYear ? parseInt(publishedYear) : undefined,
        publisher: publisher || undefined,
        description: description || undefined,
        pdfPath: `/uploads/ebooks/${file.name}`, // Will be saved by frontend
        fileSize,
      },
      auth.admin.name,
      auth.admin.id
    )

    // Save file directly (in production, this should use proper file storage)
    // For now, we'll store in public/uploads
    const fs = await import('fs/promises')
    const path = await import('path')
    
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'ebooks')
    try {
      await fs.mkdir(uploadsDir, { recursive: true })
    } catch {}

    const filepath = path.join(uploadsDir, file.name)
    await fs.writeFile(filepath, Buffer.from(bytes))

    return NextResponse.json(ebook, { status: 201 })
  } catch (error: any) {
    console.error('Error creating e-book:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create e-book' },
      { status: error.status || 500 }
    )
  }
}
