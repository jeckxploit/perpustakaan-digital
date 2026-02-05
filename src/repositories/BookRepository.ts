import { prisma } from '@/lib/db'
import type { Book, Prisma } from '@prisma/client'

class BookRepository {
  /**
   * Find all books
   */
  async findAll(options?: {
    skip?: number
    take?: number
    where?: Prisma.BookWhereInput
    orderBy?: Prisma.BookOrderByWithRelationInput
  }) {
    const { skip = 0, take = 100, where, orderBy } = options || {}

    return prisma.book.findMany({
      skip,
      take,
      where,
      orderBy: orderBy || { title: 'asc' },
    })
  }

  /**
   * Find book by ID
   */
  async findById(id: string) {
    return prisma.book.findUnique({
      where: { id },
    })
  }

  /**
   * Find book by ISBN
   */
  async findByISBN(isbn: string) {
    return prisma.book.findUnique({
      where: { isbn },
    })
  }

  /**
   * Search books by title or author
   */
  async search(query: string) {
    return prisma.book.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { author: { contains: query } },
          { category: { contains: query } },
        ],
      },
      orderBy: { title: 'asc' },
    })
  }

  /**
   * Create a new book
   */
  async create(data: Prisma.BookCreateInput) {
    return prisma.book.create({
      data,
    })
  }

  /**
   * Update a book
   */
  async update(id: string, data: Prisma.BookUpdateInput) {
    return prisma.book.update({
      where: { id },
      data,
    })
  }

  /**
   * Delete a book
   */
  async delete(id: string) {
    return prisma.book.delete({
      where: { id },
    })
  }

  /**
   * Get books count
   */
  async count(where?: Prisma.BookWhereInput) {
    return prisma.book.count({ where })
  }

  /**
   * Update available stock
   */
  async updateAvailable(id: string, change: number) {
    const book = await this.findById(id)
    if (!book) {
      throw new Error('Book not found')
    }

    return prisma.book.update({
      where: { id },
      data: {
        available: book.available + change,
      },
    })
  }
}

export const bookRepository = new BookRepository()
