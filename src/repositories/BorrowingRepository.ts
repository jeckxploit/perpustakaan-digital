import { prisma } from '@/lib/db'
import type { Borrowing, Prisma } from '@prisma/client'

// Force reload

class BorrowingRepository {
  /**
   * Find all borrowings
   */
  async findAll(options?: {
    skip?: number
    take?: number
    where?: Prisma.BorrowingWhereInput
    orderBy?: Prisma.BorrowingOrderByWithRelationInput
  }) {
    const { skip = 0, take = 100, where, orderBy } = options || {}

    return prisma.borrowing.findMany({
      skip,
      take,
      where,
      orderBy: orderBy || { borrowDate: 'desc' },
      include: {
        book: true,
        member: true,
      },
    })
  }

  /**
   * Find borrowing by ID
   */
  async findById(id: string) {
    return prisma.borrowing.findUnique({
      where: { id: id },
      include: {
        book: true,
        member: true,
      },
    })
  }

  /**
   * Find borrowings by member ID
   */
  async findByMemberId(memberId: string) {
    return prisma.borrowing.findMany({
      where: { memberId },
      include: {
        book: true,
        member: true,
      },
      orderBy: { borrowDate: 'desc' },
    })
  }

  /**
   * Find borrowings by book ID
   */
  async findByBookId(bookId: string) {
    return prisma.borrowing.findMany({
      where: { bookId },
      include: {
        book: true,
        member: true,
      },
      orderBy: { borrowDate: 'desc' },
    })
  }

  /**
   * Find active borrowings
   */
  async findActive() {
    return prisma.borrowing.findMany({
      where: { status: 'borrowed' },
      include: {
        book: true,
        member: true,
      },
      orderBy: { borrowDate: 'desc' },
    })
  }

  /**
   * Find overdue borrowings
   */
  async findOverdue() {
    return prisma.borrowing.findMany({
      where: {
        status: 'borrowed',
        dueDate: {
          lt: new Date(),
        },
      },
      include: {
        book: true,
        member: true,
      },
      orderBy: { dueDate: 'asc' },
    })
  }

  /**
   * Create a new borrowing
   */
  async create(data: Prisma.BorrowingCreateInput) {
    return prisma.borrowing.create({
      data,
      include: {
        book: true,
        member: true,
      },
    })
  }

  /**
   * Update a borrowing
   */
  async update(id: string, data: Prisma.BorrowingUpdateInput) {
    return prisma.borrowing.update({
      where: { id: id },
      data,
      include: {
        book: true,
        member: true,
      },
    })
  }

  /**
   * Return a book (set returnDate and status)
   */
  async returnBook(id: string) {
    const borrowing = await this.findById(id)
    if (!borrowing) {
      throw new Error('Borrowing not found')
    }

    // Calculate fine if overdue
    const today = new Date()
    const dueDate = new Date(borrowing.dueDate)
    let fine = 0

    if (today > dueDate) {
      const diffTime = Math.abs(today.getTime() - dueDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      // Fine: 1000 IDR per day
      fine = diffDays * 1000
    }

    return prisma.borrowing.update({
      where: { id: id },
      data: {
        returnDate: today,
        status: 'returned',
        fine,
      },
      include: {
        book: true,
        member: true,
      },
    })
  }

  /**
   * Delete a borrowing
   */
  async delete(id: string) {
    return prisma.borrowing.delete({
      where: { id: id },
    })
  }

  /**
   * Get borrowings count
   */
  async count(where?: Prisma.BorrowingWhereInput) {
    return prisma.borrowing.count({ where })
  }

  /**
   * Get borrowing statistics
   */
  async getStats() {
    const [total, active, overdue, returned] = await Promise.all([
      this.count(),
      this.count({ status: 'borrowed' }),
      this.count({
        status: 'borrowed',
        dueDate: { lt: new Date() },
      }),
      this.count({ status: 'returned' }),
    ])

    return {
      total,
      active,
      overdue,
      returned,
    }
  }
}

export const borrowingRepository = new BorrowingRepository()
