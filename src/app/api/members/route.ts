import { NextRequest, NextResponse } from 'next/server'
import { memberService } from '@/services/MemberService'
import { authenticateRequest } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { Permission } from '@/lib/permissions'

/**
 * GET /api/members - Get all members
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const skip = searchParams.get('skip')
    const take = searchParams.get('take')

    if (query) {
      const members = await memberService.search(query)
      return NextResponse.json(members)
    }

    const members = await memberService.getAll({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
    })

    return NextResponse.json(members)
  } catch (error: any) {
    console.error('Error fetching members:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch members' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/members - Create a new member
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permission
    if (!hasPermission(auth.admin.role, Permission.MEMBER_CREATE)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    const member = await memberService.create(
      body,
      auth.admin.name,
      auth.admin.id
    )

    return NextResponse.json(member, { status: 201 })
  } catch (error: any) {
    console.error('Error creating member:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create member' },
      { status: error.status || 500 }
    )
  }
}
