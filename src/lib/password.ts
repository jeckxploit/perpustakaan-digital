import crypto from 'crypto'

const SALT_LENGTH = 16
const KEY_LENGTH = 64
const ITERATIONS = 100000

/**
 * Hashes a password using PBKDF2
 * Format: salt:hash
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH).toString('hex')
  const hash = crypto
    .pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha512')
    .toString('hex')

  return `${salt}:${hash}`
}

/**
 * Compares a password with a hashed password
 */
export function comparePassword(password: string, hashed: string): boolean {
  try {
    const [salt, hash] = hashed.split(':')

    if (!salt || !hash) {
      return false
    }

    const compareHash = crypto
      .pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha512')
      .toString('hex')

    return hash === compareHash
  } catch (error) {
    console.error('Password comparison error:', error)
    return false
  }
}

/**
 * Validates password strength
 */
export function validatePasswordStrength(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password minimal 8 karakter')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password harus mengandung huruf kapital')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password harus mengandung huruf kecil')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password harus mengandung angka')
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password harus mengandung karakter spesial')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
