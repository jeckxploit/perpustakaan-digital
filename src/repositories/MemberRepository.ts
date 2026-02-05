import { prisma } from '@/lib/db'
import type { Member, Prisma } from '@prisma/client'

class MemberRepository {
  /**
   * Find all members
   */
  async findAll(options?: {
    skip?: number
    take?: number
    where?: Prisma.MemberWhereInput
    orderBy?: Prisma.MemberOrderByWithRelationInput
  }) {
    const { skip = 0, take = 100, where, orderBy } = options || {}

    return prisma.member.findMany({
      skip,
      take,
      where,
      orderBy: orderBy || { name: 'asc' },
    })
  }

  /**
   * Find member by ID
   */
  async findById(id: string) {
    return prisma.member.findUnique({
      where: { id },
    })
  }

  /**
   * Find member by member ID
   */
  async findByMemberId(memberId: string) {
    return prisma.member.findUnique({
      where: { memberId },
    })
  }

  /**
   * Find member by email
   */
  async findByEmail(email: string) {
    return prisma.member.findUnique({
      where: { email },
    })
  }

  /**
   * Search members by name or member ID
   */
  async search(query: string) {
    return prisma.member.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { memberId: { contains: query } },
          { email: { contains: query } },
        ],
      },
      orderBy: { name: 'asc' },
    })
  }

  /**
   * Create a new member
   */
  async create(data: Prisma.MemberCreateInput) {
    return prisma.member.create({
      data,
    })
  }

  /**
   * Update a member
   */
  async update(id: string, data: Prisma.MemberUpdateInput) {
    return prisma.member.update({
      where: { id },
      data,
    })
  }

  /**
   * Delete a member
   */
  async delete(id: string) {
    return prisma.member.delete({
      where: { id },
    })
  }

  /**
   * Get members count
   */
  async count(where?: Prisma.MemberWhereInput) {
    return prisma.member.count({ where })
  }

  /**
   * Check if member can borrow (not suspended, has less than max borrowings)
   */
  async canBorrow(memberId: string, maxBorrowings = 5) {
    const member = await this.findById(memberId)
    if (!member) {
      throw new Error('Member not found')
    }

    if (member.status === 'suspended') {
      return {
        canBorrow: false,
        reason: 'Member is suspended',
      }
    }

    const activeBorrowings = await prisma.borrowing.count({
      where: {
        memberId,
        status: 'borrowed',
      },
    })

    if (activeBorrowings >= maxBorrowings) {
      return {
        canBorrow: false,
        reason: 'Maximum borrowings reached',
      }
    }

    return {
      canBorrow: true,
      reason: null,
    }
  }
}

export const memberRepository = new MemberRepository()
