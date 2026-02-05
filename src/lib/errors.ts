/**
 * Custom Application Error Class
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      `${resource}${id ? ` dengan ID ${id}` : ''} tidak ditemukan`,
      404,
      'NOT_FOUND'
    )
  }
}

/**
 * Validation Error (400)
 */
export class ValidationError extends AppError {
  constructor(errors: any) {
    super('Validasi gagal', 400, 'VALIDATION_ERROR', errors)
  }
}

/**
 * Unauthorized Error (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

/**
 * Forbidden Error (403)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Akses ditolak') {
    super(message, 403, 'FORBIDDEN')
  }
}

/**
 * Conflict Error (409)
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT')
  }
}

/**
 * Rate Limit Error (429)
 */
export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super(
      'Terlalu banyak permintaan. Silakan coba lagi nanti.',
      429,
      'RATE_LIMIT_EXCEEDED',
      { retryAfter }
    )
  }
}
