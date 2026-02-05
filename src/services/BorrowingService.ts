import { borrowingRepository } from '@/repositories/BorrowingRepository'
import { bookService } from './BookService'
import { memberService } from './MemberService'
import { activityLogService } from './ActivityLogService'
import { ValidationError, NotFoundError } from '@/lib/errors'

export interface BorrowingCreateInput {
  bookId: string
  memberId: string
  dueDate: Date
  notes?: string
}

class BorrowingService {
  /**
   * Get all borrowings
   */
  async getAll(options?: {
    skip?: number
    take?: number
    where?: any
    orderBy?: any
  }) {
    return borrowingRepository.findAll(options)
  }

  /**
   * Get borrowing by ID
   */
  async getById(id: string) {
    const borrowing = await borrowingRepository.findById(id)
    if (!borrowing) {
      throw new NotFoundError('Borrowing not found')
    }
    return borrowing
  }

  /**
   * Get borrowings by member ID
   */
  async getByMemberId(memberId: string) {
    return borrowingRepository.findByMemberId(memberId)
  }

  /**
   * Get active borrowings
   */
  async getActive() {
    return borrowingRepository.findActive()
  }

  /**
   * Get overdue borrowings
   */
  async getOverdue() {
    return borrowingRepository.findOverdue()
  }

  /**
   * Create a new borrowing
   */
  async create(
    data: BorrowingCreateInput,
    adminName: string,
    adminId?: string
  ) {
    // Validate input
    if (!data.bookId || !data.memberId || !data.dueDate) {
      throw new ValidationError('Book ID, member ID, and due date are required')
    }

    // Get book and member
    const book = await bookService.getById(data.bookId)
    const member = await memberService.getById(data.memberId)

    // Check if book is available
    if (book.available <= 0) {
      throw new ValidationError('Book is not available for borrowing')
    }

    // Check if member can borrow
    const canBorrow = await memberService.canBorrow(data.memberId)
    if (!canBorrow.canBorrow) {
      throw new ValidationError(`Cannot borrow: ${canBorrow.reason}`)
    }

    // Validate due date (must be in the future)
    const today = new Date()
    const dueDate = new Date(data.dueDate)
    if (dueDate <= today) {
      throw new ValidationError('Due date must be in the future')
    }

    // Check max borrowing period (e.g., 14 days)
    const maxDays = 14
    const maxDueDate = new Date(today)
    maxDueDate.setDate(maxDueDate.getDate() + maxDays)
    // Use time comparison instead of date-only
    if (dueDate.getTime() > maxDueDate.getTime()) {
      throw new ValidationError(`Maximum borrowing period is ${maxDays} days`)
    }

    // Create borrowing
    const borrowing = await borrowingRepository.create({
      book: {
        connect: { id: data.bookId },
      },
      member: {
        connect: { id: data.memberId },
      },
      dueDate: dueDate,
      notes: data.notes,
      status: 'borrowed',
      fine: 0,
    })

    // Decrease book available count
    await bookService.decreaseAvailable(data.bookId)

    // Log activity
    await activityLogService.log({
      adminId,
      adminName,
      action: 'borrow',
      entityType: 'borrowing',
      entityId: borrowing.id,
      entityName: `${book.title} - ${member.name}`,
      details: `Due: ${dueDate.toISOString().split('T')[0]}`,
    })

    return borrowing
  }

  /**
   * Return a book
   */
  async returnBook(id: string, adminName: string, adminId?: string) {
    const borrowing = await this.getById(id)

    // Check if already returned
    if (borrowing.status === 'returned') {
      throw new ValidationError('Book has already been returned')
    }

    // Return the book
    const updatedBorrowing = await borrowingRepository.returnBook(id)

    // Increase book available count
    await bookService.increaseAvailable(borrowing.bookId)

    // Log activity
    const fineText = updatedBorrowing.fine > 0 ? `Fine: ${updatedBorrowing.fine} IDR` : 'No fine'
    await activityLogService.log({
      adminId,
      adminName,
      action: 'return',
      entityType: 'borrowing',
      entityId: updatedBorrowing.id,
      entityName: `${borrowing.book.title} - ${borrowing.member.name}`,
      details: fineText,
    })

    return updatedBorrowing
  }

  /**
   * Get borrowing statistics
   */
  async getStats() {
    return borrowingRepository.getStats()
  }

  /**
   * Update overdue borrowings
   * This should be run periodically (e.g., daily)
   */
  async updateOverdueStatus() {
    const overdue = await borrowingRepository.findOverdue()

    const { prisma } = await import('@/lib/db')
    for (const borrowing of overdue) {
      await prisma.borrowing.update({
        where: { id: borrowing.id },
        data: { status: 'overdue' },
      })
    }

    return {
      updated: overdue.length,
    }
  }

  /**
   * Get member's borrowing history
   */
  async getMemberHistory(memberId: string) {
    return borrowingRepository.findByMemberId(memberId)
  }
}

export const borrowingService = new BorrowingService()
