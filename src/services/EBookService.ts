import { eBookRepository } from '@/repositories/EBookRepository'
import { activityLogService } from './ActivityLogService'
import { ValidationError, NotFoundError } from '@/lib/errors'

export interface EBookCreateInput {
  title: string
  author: string
  category: string
  isbn?: string
  publishedYear?: number
  publisher?: string
  description?: string
  coverImage?: string
  pdfPath: string
  fileSize: number
}

export interface EBookUpdateInput {
  title?: string
  author?: string
  category?: string
  isbn?: string
  publishedYear?: number
  publisher?: string
  description?: string
  coverImage?: string
}

class EBookService {
  /**
   * Get all e-books
   */
  async getAll(options?: {
    skip?: number
    take?: number
    where?: any
    orderBy?: any
  }) {
    return eBookRepository.findAll(options)
  }

  /**
   * Get e-book by ID
   */
  async getById(id: string) {
    const ebook = await eBookRepository.findById(id)
    if (!ebook) {
      throw new NotFoundError('E-book not found')
    }
    return ebook
  }

  /**
   * Search e-books
   */
  async search(query: string) {
    return eBookRepository.search(query)
  }

  /**
   * Create a new e-book
   */
  async create(
    data: EBookCreateInput,
    adminName: string,
    adminId?: string
  ) {
    // Validate input
    if (!data.title || !data.author || !data.category || !data.pdfPath) {
      throw new ValidationError('Title, author, category, and PDF file are required')
    }

    // Check ISBN uniqueness
    if (data.isbn) {
      const existing = await eBookRepository.findByISBN(data.isbn)
      if (existing) {
        throw new ValidationError('An e-book with this ISBN already exists')
      }
    }

    const ebook = await eBookRepository.create({
      ...data,
    })

    // Log activity
    await activityLogService.log({
      adminId,
      adminName,
      action: 'create',
      entityType: 'ebook',
      entityId: ebook.id,
      entityName: ebook.title,
      details: `File size: ${data.fileSize} bytes`,
    })

    return ebook
  }

  /**
   * Update an e-book
   */
  async update(
    id: string,
    data: EBookUpdateInput,
    adminName: string,
    adminId?: string
  ) {
    const ebook = await this.getById(id)

    // Check ISBN uniqueness if changing
    if (data.isbn && data.isbn !== ebook.isbn) {
      const existing = await eBookRepository.findByISBN(data.isbn)
      if (existing) {
        throw new ValidationError('An e-book with this ISBN already exists')
      }
    }

    const updatedEBook = await eBookRepository.update(id, data)

    // Log activity
    await activityLogService.log({
      adminId,
      adminName,
      action: 'update',
      entityType: 'ebook',
      entityId: updatedEBook.id,
      entityName: updatedEBook.title,
      details: 'Updated e-book metadata',
    })

    return updatedEBook
  }

  /**
   * Delete an e-book
   */
  async delete(id: string, adminName: string, adminId?: string) {
    const ebook = await this.getById(id)

    await eBookRepository.delete(id)

    // Log activity
    await activityLogService.log({
      adminId,
      adminName,
      action: 'delete',
      entityType: 'ebook',
      entityId: ebook.id,
      entityName: ebook.title,
      details: `File: ${ebook.pdfPath}`,
    })

    return { message: 'E-book deleted successfully' }
  }

  /**
   * Get e-book statistics
   */
  async getStats() {
    const allEBooks = await eBookRepository.findAll()
    const totalEBooks = allEBooks.length
    
    // Calculate total file size
    const totalFileSize = allEBooks.reduce((sum, ebook) => sum + ebook.fileSize, 0)
    
    // Get e-books by category
    const byCategory: Record<string, number> = {}
    allEBooks.forEach((ebook) => {
      byCategory[ebook.category] = (byCategory[ebook.category] || 0) + 1
    })

    return {
      totalEBooks,
      totalFileSize,
      byCategory,
    }
  }
}

export const eBookService = new EBookService()
