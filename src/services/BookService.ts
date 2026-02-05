import { bookRepository } from '@/repositories/BookRepository'
import { activityLogService } from './ActivityLogService'
import type { Book, Prisma } from '@prisma/client'
import { ValidationError, NotFoundError } from '@/lib/errors'

export interface BookCreateInput {
  title: string
  author: string
  isbn?: string
  category: string
  stock: number
  publishedYear?: number
  publisher?: string
  description?: string
  coverImage?: string
}

export interface BookUpdateInput {
  title?: string
  author?: string
  isbn?: string
  category?: string
  stock?: number
  publishedYear?: number
  publisher?: string
  description?: string
  coverImage?: string
}

class BookService {
  /**
   * Get all books
   */
  async getAll(options?: {
    skip?: number
    take?: number
    where?: Prisma.BookWhereInput
    orderBy?: Prisma.BookOrderByWithRelationInput
  }) {
    return bookRepository.findAll(options)
  }

  /**
   * Get book by ID
   */
  async getById(id: string) {
    const book = await bookRepository.findById(id)
    if (!book) {
      throw new NotFoundError('Book not found')
    }
    return book
  }

  /**
   * Search books
   */
  async search(query: string) {
    return bookRepository.search(query)
  }

  /**
   * Create a new book
   */
  async create(data: BookCreateInput, adminName: string, adminId?: string) {
    // Validate input
    if (!data.title || !data.author || !data.category) {
      throw new ValidationError('Title, author, and category are required')
    }

    if (data.stock < 0) {
      throw new ValidationError('Stock cannot be negative')
    }

    // Check ISBN uniqueness
    if (data.isbn) {
      const existing = await bookRepository.findByISBN(data.isbn)
      if (existing) {
        throw new ValidationError('A book with this ISBN already exists')
      }
    }

    const book = await bookRepository.create({
      ...data,
      available: data.stock, // Initial available equals stock
    })

    // Log activity
    await activityLogService.log({
      adminId,
      adminName,
      action: 'create',
      entityType: 'book',
      entityId: book.id,
      entityName: book.title,
      details: `ISBN: ${data.isbn || 'N/A'}, Stock: ${data.stock}`,
    })

    return book
  }

  /**
   * Update a book
   */
  async update(
    id: string,
    data: BookUpdateInput,
    adminName: string,
    adminId?: string
  ) {
    const book = await this.getById(id)

    // Check ISBN uniqueness if changing
    if (data.isbn && data.isbn !== book.isbn) {
      const existing = await bookRepository.findByISBN(data.isbn)
      if (existing) {
        throw new ValidationError('A book with this ISBN already exists')
      }
    }

    // Validate stock change
    if (data.stock !== undefined && data.stock < 0) {
      throw new ValidationError('Stock cannot be negative')
    }

    // Update available count if stock changes
    const updateData: Prisma.BookUpdateInput = { ...data }
    if (data.stock !== undefined && data.stock !== book.stock) {
      const borrowed = book.stock - book.available
      const newAvailable = Math.max(0, data.stock - borrowed)
      updateData.available = newAvailable
    }

    const updatedBook = await bookRepository.update(id, updateData)

    // Log activity
    await activityLogService.log({
      adminId,
      adminName,
      action: 'update',
      entityType: 'book',
      entityId: updatedBook.id,
      entityName: updatedBook.title,
      details: `Updated stock from ${book.stock} to ${updatedBook.stock}`,
    })

    return updatedBook
  }

  /**
   * Delete a book
   */
  async delete(id: string, adminName: string, adminId?: string) {
    const book = await this.getById(id)

    // Check if book has active borrowings
    const { prisma } = await import('@/lib/db')
    const activeBorrowings = await prisma.borrowing.count({
      where: {
        bookId: id,
        status: 'borrowed',
      },
    })

    if (activeBorrowings > 0) {
      throw new ValidationError(
        'Cannot delete book with active borrowings. Return all books first.'
      )
    }

    await bookRepository.delete(id)

    // Log activity
    await activityLogService.log({
      adminId,
      adminName,
      action: 'delete',
      entityType: 'book',
      entityId: book.id,
      entityName: book.title,
      details: `ISBN: ${book.isbn || 'N/A'}, Stock: ${book.stock}`,
    })

    return { message: 'Book deleted successfully' }
  }

  /**
   * Decrease available stock (used when borrowing)
   */
  async decreaseAvailable(id: string) {
    return bookRepository.updateAvailable(id, -1)
  }

  /**
   * Increase available stock (used when returning)
   */
  async increaseAvailable(id: string) {
    return bookRepository.updateAvailable(id, 1)
  }

  /**
   * Get book statistics
   */
  async getStats() {
    const allBooks = await bookRepository.findAll()
    const totalBooks = allBooks.length
    const totalStock = allBooks.reduce((sum, book) => sum + book.stock, 0)
    const totalAvailable = allBooks.reduce((sum, book) => sum + book.available, 0)
    const totalBorrowed = totalStock - totalAvailable

    // Get books by category
    const byCategory: Record<string, number> = {}
    allBooks.forEach((book) => {
      byCategory[book.category] = (byCategory[book.category] || 0) + 1
    })

    return {
      totalBooks,
      totalStock,
      totalAvailable,
      totalBorrowed,
      byCategory,
    }
  }
}

export const bookService = new BookService()
