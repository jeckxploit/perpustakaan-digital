import { z } from 'zod'

/**
 * Login Validation Schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email harus diisi')
    .email('Format email tidak valid'),
  password: z
    .string()
    .min(1, 'Password harus diisi')
})

export type LoginDto = z.infer<typeof loginSchema>

/**
 * Register Admin Validation Schema
 */
export const registerAdminSchema = z.object({
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
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Konfirmasi password tidak cocok',
  path: ['confirmPassword']
})

export type RegisterAdminDto = z.infer<typeof registerAdminSchema>

/**
 * Change Password Validation Schema
 */
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Password saat ini harus diisi'),
  newPassword: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/[A-Z]/, 'Password harus mengandung huruf kapital')
    .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
    .regex(/[0-9]/, 'Password harus mengandung angka')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password harus mengandung karakter spesial'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Konfirmasi password tidak cocok',
  path: ['confirmPassword']
})

export type ChangePasswordDto = z.infer<typeof changePasswordSchema>
