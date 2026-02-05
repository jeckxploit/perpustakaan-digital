import { memberRepository } from '@/repositories/MemberRepository'
import { activityLogService } from './ActivityLogService'
import type { Prisma } from '@prisma/client'
import { ValidationError, NotFoundError, ConflictError } from '@/lib/errors'

export interface MemberCreateInput {
  name: string
  email?: string
  phone?: string
  address?: string
  memberId: string
}

export interface MemberUpdateInput {
  name?: string
  email?: string
  phone?: string
  address?: string
  status?: string
}

class MemberService {
  /**
   * Get all members
   */
  async getAll(options?: {
    skip?: number
    take?: number
    where?: Prisma.MemberWhereInput
    orderBy?: Prisma.MemberOrderByWithRelationInput
  }) {
    return memberRepository.findAll(options)
  }

  /**
   * Get member by ID
   */
  async getById(id: string) {
    const member = await memberRepository.findById(id)
    if (!member) {
      throw new NotFoundError('Member not found')
    }
    return member
  }

  /**
   * Get member by member ID
   */
  async getByMemberId(memberId: string) {
    const member = await memberRepository.findByMemberId(memberId)
    if (!member) {
      throw new NotFoundError('Member not found')
    }
    return member
  }

  /**
   * Search members
   */
  async search(query: string) {
    return memberRepository.search(query)
  }

  /**
   * Create a new member
   */
  async create(data: MemberCreateInput, adminName: string, adminId?: string) {
    // Validate input
    if (!data.name || !data.memberId) {
      throw new ValidationError('Name and member ID are required')
    }

    // Check member ID uniqueness
    const existingMemberId = await memberRepository.findByMemberId(data.memberId)
    if (existingMemberId) {
      throw new ConflictError('A member with this ID already exists')
    }

    // Check email uniqueness
    if (data.email) {
      const existingEmail = await memberRepository.findByEmail(data.email)
      if (existingEmail) {
        throw new ConflictError('A member with this email already exists')
      }
    }

    const member = await memberRepository.create({
      ...data,
      status: 'active',
    })

    // Log activity
    await activityLogService.log({
      adminId,
      adminName,
      action: 'create',
      entityType: 'member',
      entityId: member.id,
      entityName: member.name,
      details: `Member ID: ${member.memberId}`,
    })

    return member
  }

  /**
   * Update a member
   */
  async update(
    id: string,
    data: MemberUpdateInput,
    adminName: string,
    adminId?: string
  ) {
    const member = await this.getById(id)

    // Check email uniqueness if changing
    if (data.email && data.email !== member.email) {
      const existing = await memberRepository.findByEmail(data.email)
      if (existing) {
        throw new ConflictError('A member with this email already exists')
      }
    }

    const updatedMember = await memberRepository.update(id, data)

    // Log activity
    await activityLogService.log({
      adminId,
      adminName,
      action: 'update',
      entityType: 'member',
      entityId: updatedMember.id,
      entityName: updatedMember.name,
      details: `Member ID: ${updatedMember.memberId}, Status: ${updatedMember.status}`,
    })

    return updatedMember
  }

  /**
   * Delete a member
   */
  async delete(id: string, adminName: string, adminId?: string) {
    const member = await this.getById(id)

    // Check if member has active borrowings
    const { prisma } = await import('@/lib/db')
    const activeBorrowings = await prisma.borrowing.count({
      where: {
        memberId: id,
        status: 'borrowed',
      },
    })

    if (activeBorrowings > 0) {
      throw new ValidationError(
        'Cannot delete member with active borrowings. Return all books first.'
      )
    }

    await memberRepository.delete(id)

    // Log activity
    await activityLogService.log({
      adminId,
      adminName,
      action: 'delete',
      entityType: 'member',
      entityId: member.id,
      entityName: member.name,
      details: `Member ID: ${member.memberId}`,
    })

    return { message: 'Member deleted successfully' }
  }

  /**
   * Suspend a member
   */
  async suspend(id: string, adminName: string, adminId?: string) {
    const member = await this.getById(id)

    const updatedMember = await memberRepository.update(id, {
      status: 'suspended',
    })

    // Log activity
    await activityLogService.log({
      adminId,
      adminName,
      action: 'update',
      entityType: 'member',
      entityId: updatedMember.id,
      entityName: updatedMember.name,
      details: `Member suspended: ${member.memberId}`,
    })

    return updatedMember
  }

  /**
   * Activate a member
   */
  async activate(id: string, adminName: string, adminId?: string) {
    const member = await this.getById(id)

    const updatedMember = await memberRepository.update(id, {
      status: 'active',
    })

    // Log activity
    await activityLogService.log({
      adminId,
      adminName,
      action: 'update',
      entityType: 'member',
      entityId: updatedMember.id,
      entityName: updatedMember.name,
      details: `Member activated: ${member.memberId}`,
    })

    return updatedMember
  }

  /**
   * Check if member can borrow
   */
  async canBorrow(memberId: string, maxBorrowings = 5) {
    return memberRepository.canBorrow(memberId, maxBorrowings)
  }

  /**
   * Get member statistics
   */
  async getStats() {
    const allMembers = await memberRepository.findAll()
    const totalMembers = allMembers.length
    const activeMembers = allMembers.filter((m) => m.status === 'active').length
    const suspendedMembers = allMembers.filter((m) => m.status === 'suspended').length

    return {
      totalMembers,
      activeMembers,
      suspendedMembers,
    }
  }
}

export const memberService = new MemberService()
