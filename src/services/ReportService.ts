import { borrowingRepository } from '@/repositories/BorrowingRepository'
import { bookRepository } from '@/repositories/BookRepository'
import { memberRepository } from '@/repositories/MemberRepository'
import { eBookRepository } from '@/repositories/EBookRepository'

export interface BorrowingReport {
  total: number
  active: number
  returned: number
  overdue: number
  totalFines: number
}

export interface PopularBooksReport {
  bookId: string
  title: string
  author: string
  borrowCount: number
  available: number
}

export interface ActiveMembersReport {
  memberId: string
  name: string
  email: string
  activeBorrowings: number
}

export interface MonthlyStatistics {
  month: string
  borrowings: number
  returns: number
}

class ReportService {
  /**
   * Get borrowing reports
   */
  async getBorrowingReport(): Promise<BorrowingReport> {
    const stats = await borrowingRepository.getStats()
    
    // Calculate total fines from overdue borrowings
    const overdue = await borrowingRepository.findOverdue()
    const totalFines = overdue.reduce((sum, b) => sum + (b.fine || 0), 0)

    return {
      total: stats.total,
      active: stats.active,
      returned: stats.returned,
      overdue: stats.overdue,
      totalFines,
    }
  }

  /**
   * Get most popular books
   */
  async getPopularBooks(limit = 10): Promise<PopularBooksReport[]> {
    const borrowings = await borrowingRepository.findAll({
      where: { status: 'returned' },
      orderBy: { borrowDate: 'desc' as any },
      take: 100, // Get more to calculate properly
    })

    // Count borrowings per book
    const bookCountMap = new Map<string, number>()
    borrowings.forEach(b => {
      const count = bookCountMap.get(b.bookId) || 0
      bookCountMap.set(b.bookId, count + 1)
    })

    // Get book details for popular ones
    const popularBooks: PopularBooksReport[] = []
    const sortedBooks = Array.from(bookCountMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)

    for (const [bookId, count] of sortedBooks) {
      const book = await bookRepository.findById(bookId)
      if (book) {
        popularBooks.push({
          bookId: book.id,
          title: book.title,
          author: book.author,
          borrowCount: count,
          available: book.available,
        })
      }
    }

    return popularBooks
  }

  /**
   * Get active members (with most borrowings)
   */
  async getActiveMembers(limit = 10): Promise<ActiveMembersReport[]> {
    const borrowings = await borrowingRepository.findActive()

    // Count borrowings per member
    const memberBorrowCountMap = new Map<string, number>()
    borrowings.forEach(b => {
      const count = memberBorrowCountMap.get(b.memberId) || 0
      memberBorrowCountMap.set(b.memberId, count + 1)
    })

    // Get member details
    const sortedMembers = Array.from(memberBorrowCountMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)

    const activeMembers: ActiveMembersReport[] = []
    for (const [memberId, count] of sortedMembers) {
      const member = await memberRepository.findById(memberId)
      if (member) {
        activeMembers.push({
          memberId: member.id,
          name: member.name,
          email: member.email || '',
          activeBorrowings: count,
        })
      }
    }

    return activeMembers
  }

  /**
   * Get monthly statistics (last 6 months)
   */
  async getMonthlyStatistics(months = 6): Promise<MonthlyStatistics[]> {
    const monthlyStats: MonthlyStatistics[] = []
    const now = new Date()

    for (let i = 0; i < months; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59)

      const borrowings = await borrowingRepository.findAll({
        where: {
          borrowDate: {
            gte: monthStart,
            lt: monthEnd,
          },
        },
      })

      const returns = borrowings.filter(b => b.status === 'returned')
      const monthName = monthDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

      monthlyStats.push({
        month: monthName,
        borrowings: borrowings.length,
        returns: returns.length,
      })
    }

    return monthlyStats
  }

  /**
   * Get overall statistics
   */
  async getOverallStatistics() {
    const [books, members, borrowings, ebooks] = await Promise.all([
      bookRepository.findAll(),
      memberRepository.findAll(),
      borrowingRepository.findAll(),
      eBookRepository.findAll(),
    ])

    return {
      books: {
        total: books.length,
        categories: this.getCategories(books),
      },
      members: {
        total: members.length,
        active: members.filter(m => m.status === 'active').length,
      },
      borrowings: {
        total: borrowings.length,
        active: borrowings.filter(b => b.status === 'borrowed').length,
        overdue: borrowings.filter(b => {
          return b.status === 'borrowed' && new Date(b.dueDate) < new Date()
        }).length,
      },
      ebooks: {
        total: ebooks.length,
        categories: this.getCategories(ebooks),
      },
    }
  }

  private getCategories(items: any[]) {
    const categories: Record<string, number> = {}
    items.forEach(item => {
      const cat = item.category
      categories[cat] = (categories[cat] || 0) + 1
    })
    return categories
  }
}

export const reportService = new ReportService()
