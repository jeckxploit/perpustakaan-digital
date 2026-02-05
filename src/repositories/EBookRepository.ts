import { prisma } from '@/lib/db'
import type { EBook, Prisma } from '@prisma/client'

class EBookRepository {
  /**
   * Find all e-books
   */
  async findAll(options?: {
    skip?: number
    take?: number
    where?: Prisma.EBookWhereInput
    orderBy?: Prisma.EBookOrderByWithRelationInput
  }) {
    const { skip = 0, take = 100, where, orderBy } = options || {}

    return prisma.eBook.findMany({
      skip,
      take,
      where,
      orderBy: orderBy || { createdAt: 'desc' },
    })
  }

  /**
   * Find e-book by ID
   */
  async findById(id: string) {
    return prisma.eBook.findUnique({
      where: { id },
    })
  }

  /**
   * Find e-book by ISBN
   */
  async findByISBN(isbn: string) {
    return prisma.eBook.findUnique({
      where: { isbn },
    })
  }

  /**
   * Search e-books by title or author
   */
  async search(query: string) {
    return prisma.eBook.findMany({
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
   * Create a new e-book
   */
  async create(data: Prisma.EBookCreateInput) {
    return prisma.eBook.create({
      data,
    })
  }

  /**
   * Update an e-book
   */
  async update(id: string, data: Prisma.EBookUpdateInput) {
    return prisma.eBook.update({
      where: { id },
      data,
    })
  }

  /**
   * Delete an e-book
   */
  async delete(id: string) {
    return prisma.eBook.delete({
      where: { id },
    })
  }

  /**
   * Get e-books count
   */
  async count(where?: Prisma.EBookWhereInput) {
    return prisma.eBook.count({ where })
  }
}

export const eBookRepository = new EBookRepository()
