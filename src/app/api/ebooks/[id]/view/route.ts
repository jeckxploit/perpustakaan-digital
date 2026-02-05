import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ebook = await db.eBook.findUnique({
      where: { id: params.id }
    })

    if (!ebook) {
      return NextResponse.json({ error: 'Ebook not found' }, { status: 404 })
    }

    // Read the PDF file
    const filePath = join(process.cwd(), 'public', ebook.pdfPath)
    const fileBuffer = await readFile(filePath)

    // Return the PDF file with proper headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${ebook.title}.pdf"`,
        'Cache-Control': 'public, max-age=31536000',
      },
    })
  } catch (error) {
    console.error('Error serving ebook:', error)
    return NextResponse.json({ error: 'Failed to serve ebook' }, { status: 500 })
  }
}
