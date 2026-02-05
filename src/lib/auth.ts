import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { verifyToken } from './jwt'
import type { JWTPayload } from './jwt'
import type { Admin } from '@prisma/client'
import { prisma } from './db'

export interface AuthContext {
  admin: Admin
  tokenPayload: JWTPayload
}

/**
 * Authenticate a request and return the admin
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthContext | null> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify token
    const payload = verifyToken(token)
    if (!payload) {
      return null
    }

    // Get admin from database
    const admin = await prisma.admin.findUnique({
      where: { id: payload.adminId }
    })

    if (!admin || admin.status !== 'ACTIVE') {
      return null
    }

    return {
      admin,
      tokenPayload: payload
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

/**
 * Get token from cookies
 */
export async function getTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')
  return token?.value || null
}

/**
 * Verify token and return admin
 */
export async function getAdminFromToken(token: string): Promise<Admin | null> {
  try {
    const payload = verifyToken(token)
    if (!payload) {
      return null
    }

    const admin = await prisma.admin.findUnique({
      where: { id: payload.adminId }
    })

    if (!admin || admin.status !== 'ACTIVE') {
      return null
    }

    return admin
  } catch (error) {
    console.error('Get admin from token error:', error)
    return null
  }
}

/**
 * Get current admin from request (for server components)
 */
export async function getCurrentAdmin(request?: NextRequest): Promise<Admin | null> {
  try {
    let token: string | null = null

    // Try to get from Authorization header
    if (request) {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    // Try to get from cookies
    if (!token) {
      token = await getTokenFromCookies()
    }

    if (!token) {
      return null
    }

    return await getAdminFromToken(token)
  } catch (error) {
    console.error('Get current admin error:', error)
    return null
  }
}
