import { NextRequest, NextResponse } from 'next/server'
import { memberService } from '@/services/MemberService'
import { authenticateRequest } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { Permission } from '@/lib/permissions'

/**
 * GET /api/members/[id] - Get member by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const member = await memberService.getById(params.id)
    return NextResponse.json(member)
  } catch (error: any) {
    console.error('Error fetching member:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch member' },
      { status: 404 }
    )
  }
}

/**
 * PUT /api/members/[id] - Update a member
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permission
    if (!hasPermission(auth.admin.role, Permission.MEMBER_UPDATE)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    const member = await memberService.update(
      params.id,
      body,
      auth.admin.name,
      auth.admin.id
    )

    return NextResponse.json(member)
  } catch (error: any) {
    console.error('Error updating member:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update member' },
      { status: error.status || 500 }
    )
  }
}

/**
 * DELETE /api/members/[id] - Delete a member
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permission
    if (!hasPermission(auth.admin.role, Permission.MEMBER_DELETE)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const result = await memberService.delete(
      params.id,
      auth.admin.name,
      auth.admin.id
    )

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error deleting member:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete member' },
      { status: error.status || 500 }
    )
  }
}
