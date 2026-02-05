import { z } from 'zod'

/**
 * Create Admin Validation Schema
 */
export const createAdminSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama harus diisi')
    .max(255, 'Nama terlalu panjang'),
  email: z
    .string()
    .min(1, 'Email harus diisi')
    .email('Format email tidak valid'),
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/[A-Z]/, 'Password harus mengandung huruf kapital')
    .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
    .regex(/[0-9]/, 'Password harus mengandung angka')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password harus mengandung karakter spesial'),
  role: z.enum(['SUPER_ADMIN', 'LIBRARIAN', 'ASSISTANT'], {
    errorMap: () => ({ message: 'Role tidak valid' })
  }).optional()
})

export type CreateAdminDto = z.infer<typeof createAdminSchema>

/**
 * Update Admin Validation Schema
 */
export const updateAdminSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama harus diisi')
    .max(255, 'Nama terlalu panjang')
    .optional(),
  email: z
    .string()
    .email('Format email tidak valid')
    .optional(),
  role: z.enum(['SUPER_ADMIN', 'LIBRARIAN', 'ASSISTANT'], {
    errorMap: () => ({ message: 'Role tidak valid' })
  }).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'DELETED'], {
    errorMap: () => ({ message: 'Status tidak valid' })
  }).optional()
})

export type UpdateAdminDto = z.infer<typeof updateAdminSchema>

/**
 * Admin Query Params Validation
 */
export const adminQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  role: z.enum(['SUPER_ADMIN', 'LIBRARIAN', 'ASSISTANT']).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'DELETED']).optional(),
  sortBy: z.enum(['name', 'email', 'createdAt', 'role']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

export type AdminQueryDto = z.infer<typeof adminQuerySchema>
