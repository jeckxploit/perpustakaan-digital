# Implementation Guide
# Sistem Manajemen Perpustakaan Digital

---

## 📋 Prerequisites

### Required Software
- Bun (latest)
- Node.js 18+ (for some tools)
- PostgreSQL 14+ (production) / SQLite (development)
- Redis 7+ (for caching)
- Git

### Environment Setup

```bash
# Clone repository
git clone <repository-url>
cd library-management-system

# Install dependencies
bun install

# Set up environment
cp .env.example .env

# Edit .env with your configuration
nano .env

# Setup database
bun run db:setup

# Run migrations
bun run db:migrate

# Seed initial data (optional)
bun run db:seed

# Start development server
bun run dev
```

---

## 📁 Project Structure

```
library-management-system/
├── prisma/
│   ├── schema.prisma              # Database schema
│   ├── migrations/               # Migration files
│   └── seed.ts                  # Seed data
│
├── src/
│   ├── app/
│   │   ├── api/                 # API routes
│   │   │   ├── v1/             # API version 1
│   │   │   │   ├── books/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── borrowings/
│   │   │   │   │       └── stats/
│   │   │   │   ├── members/
│   │   │   │   ├── borrowings/
│   │   │   │   ├── ebooks/
│   │   │   │   ├── fines/
│   │   │   │   ├── reports/
│   │   │   │   ├── activity-logs/
│   │   │   │   ├── auth/
│   │   │   │   └── admins/
│   │   │   └── health/
│   │   ├── components/           # React components
│   │   │   ├── ui/             # shadcn/ui components
│   │   │   ├── layouts/        # Page layouts
│   │   │   └── features/       # Feature-specific components
│   │   ├── lib/
│   │   │   ├── db.ts          # Database client
│   │   │   ├── redis.ts        # Redis client
│   │   │   ├── cache.ts        # Cache service
│   │   │   ├── logger.ts      # Logging service
│   │   │   ├── crypto.ts       # Encryption service
│   │   │   ├── errors.ts       # Custom errors
│   │   │   ├── validations.ts  # Zod schemas
│   │   │   └── utils.ts       # Utility functions
│   │   ├── services/           # Business logic layer
│   │   │   ├── book.service.ts
│   │   │   ├── member.service.ts
│   │   │   ├── borrowing.service.ts
│   │   │   ├── ebook.service.ts
│   │   │   ├── fine.service.ts
│   │   │   ├── report.service.ts
│   │   │   ├── auth.service.ts
│   │   │   └── activity-log.service.ts
│   │   ├── repositories/       # Data access layer
│   │   │   ├── book.repository.ts
│   │   │   ├── member.repository.ts
│   │   │   ├── borrowing.repository.ts
│   │   │   └── ...
│   │   ├── middleware/         # Custom middleware
│   │   │   ├── auth.middleware.ts
│   │   │   ├── rate-limit.middleware.ts
│   │   │   └── permissions.middleware.ts
│   │   ├── hooks/             # React hooks
│   │   │   ├── use-auth.ts
│   │   │   └── ...
│   │   ├── types/             # TypeScript types
│   │   │   ├── api.types.ts
│   │   │   ├── db.types.ts
│   │   │   └── index.ts
│   │   └── config/            # Configuration
│   │       ├── cache.config.ts
│   │       ├── rate-limit.config.ts
│   │       └── permissions.config.ts
│   └── tests/                 # Tests
│       ├── unit/
│       ├── integration/
│       └── e2e/
│
├── public/
│   ├── uploads/
│   │   ├── ebooks/           # Uploaded PDFs
│   │   └── covers/           # Book covers
│   └── assets/               # Static assets
│
├── docs/                     # Documentation
├── scripts/                  # Utility scripts
├── .env.example             # Environment template
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

---

## 🚀 Step-by-Step Implementation

### Phase 1: Foundation (Week 1)

#### 1.1 Setup Database Schema

```bash
# Edit prisma/schema.prisma with the complete schema
# See ARCHITECTURE.md for full schema

# Run migration
bun prisma migrate dev --name init_schema

# Generate Prisma client
bun prisma generate
```

#### 1.2 Setup Basic Services

**File: `src/lib/db.ts`**
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
})

// Graceful shutdown
if (process.env.NODE_ENV !== 'production') {
  (globalThis as any).prisma = prisma
}

process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

export { prisma }
```

**File: `src/lib/logger.ts`**
```typescript
// Implement structured logging (see ARCHITECTURE.md)
export const logger = {
  info: (message: string, context?: any) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      ...context
    }))
  },
  error: (message: string, error?: Error, context?: any) => {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      error: error?.message,
      stack: error?.stack,
      ...context
    }))
  }
}
```

#### 1.3 Implement Authentication

**File: `src/services/auth.service.ts`**
```typescript
import { prisma } from '@/lib/db'
import { PasswordService } from '@/lib/crypto'

export class AuthService {
  async login(email: string, password: string) {
    const admin = await prisma.admin.findUnique({ where: { email } })

    if (!admin) {
      throw new Error('Invalid credentials')
    }

    const isValid = await PasswordService.compare(password, admin.passwordHash)

    if (!isValid) {
      throw new Error('Invalid credentials')
    }

    if (admin.status !== 'ACTIVE') {
      throw new Error('Account is suspended')
    }

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() }
    })

    // Generate JWT tokens
    const token = this.generateToken(admin)

    return { token, user: this.sanitizeUser(admin) }
  }

  private generateToken(admin: any): string {
    // Implement JWT generation
    return 'jwt-token-here'
  }

  private sanitizeUser(admin: any) {
    const { passwordHash, ...user } = admin
    return user
  }
}
```

---

### Phase 2: Core Features (Week 2-3)

#### 2.1 Book Management

**File: `src/repositories/book.repository.ts`**
```typescript
import { prisma } from '@/lib/db'
import { BookFilters } from '@/types'

export class BookRepository {
  async findMany(filters: BookFilters) {
    return prisma.book.findMany({
      where: this.buildWhereClause(filters),
      include: { borrowings: true },
      orderBy: { createdAt: 'desc' }
    })
  }

  async findById(id: string) {
    return prisma.book.findUnique({
      where: { id },
      include: { borrowings: true }
    })
  }

  async create(data: CreateBookDto) {
    return prisma.book.create({
      data: {
        ...data,
        available: data.stock
      }
    })
  }

  async update(id: string, data: UpdateBookDto) {
    return prisma.book.update({ where: { id }, data })
  }

  async delete(id: string) {
    return prisma.book.delete({ where: { id } })
  }

  private buildWhereClause(filters: BookFilters) {
    const conditions: any[] = []

    if (filters.category) conditions.push({ category: filters.category })
    if (filters.status) conditions.push({ status: filters.status })

    if (filters.search) {
      conditions.push({
        OR: [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { author: { contains: filters.search, mode: 'insensitive' } },
          { isbn: { contains: filters.search } }
        ]
      })
    }

    return conditions.length ? { AND: conditions } : {}
  }
}
```

**File: `src/services/book.service.ts`**
```typescript
import { BookRepository } from '@/repositories/book.repository'
import { cache } from '@/lib/cache'
import { CACHE_KEYS, CACHE_TTL } from '@/config/cache.config'
import { ActivityLogService } from './activity-log.service'

export class BookService {
  constructor(
    private bookRepository = new BookRepository(),
    private activityLogService = new ActivityLogService()
  ) {}

  async getBooks(filters: BookFilters) {
    return cache.getOrSet(
      CACHE_KEYS.bookList(JSON.stringify(filters)),
      () => this.bookRepository.findMany(filters),
      { ttl: CACHE_TTL.BOOK_LIST }
    )
  }

  async getBook(id: string) {
    return cache.getOrSet(
      CACHE_KEYS.book(id),
      () => this.bookRepository.findById(id),
      { ttl: CACHE_TTL.BOOK_DETAILS }
    )
  }

  async createBook(data: CreateBookDto, adminId: string) {
    const book = this.bookRepository.create(data)

    // Log activity
    await this.activityLogService.log({
      adminId,
      action: 'CREATE',
      entityType: 'BOOK',
      entityId: book.id,
      entityName: book.title
    })

    // Invalidate caches
    await cache.invalidatePattern('books:*')

    return book
  }

  async updateBook(id: string, data: UpdateBookDto, adminId: string) {
    const book = await this.bookRepository.findById(id)
    const updated = this.bookRepository.update(id, data)

    // Log activity
    await this.activityLogService.log({
      adminId,
      action: 'UPDATE',
      entityType: 'BOOK',
      entityId: id,
      entityName: book.title
    })

    // Invalidate caches
    await Promise.all([
      cache.del(CACHE_KEYS.book(id)),
      cache.invalidatePattern('books:*'),
      cache.del(CACHE_KEYS.bookStats())
    ])

    return updated
  }

  async deleteBook(id: string, adminId: string) {
    const book = await this.bookRepository.findById(id)
    await this.bookRepository.delete(id)

    // Log activity
    await this.activityLogService.log({
      adminId,
      action: 'DELETE',
      entityType: 'BOOK',
      entityId: id,
      entityName: book.title
    })

    // Invalidate caches
    await Promise.all([
      cache.del(CACHE_KEYS.book(id)),
      cache.invalidatePattern('books:*'),
      cache.invalidatePattern('search:*'),
      cache.del(CACHE_KEYS.bookStats())
    ])
  }
}
```

#### 2.2 API Routes

**File: `src/app/api/v1/books/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { BookService } from '@/services/book.service'
import { requireAuth } from '@/middleware/auth.middleware'
import { bookQuerySchema, createBookSchema } from '@/lib/validations'

const bookService = new BookService()

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const auth = await requireAuth(request)
    if (auth) return auth

    // Parse and validate query params
    const query = Object.fromEntries(request.nextUrl.searchParams)
    const filters = bookQuerySchema.parse(query)

    // Get books
    const books = await bookService.getBooks(filters)

    return NextResponse.json({
      success: true,
      data: books
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message }
      },
      { status: 400 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication & permissions
    const auth = await requireAuth(request)
    if (auth) return auth

    const session = await getSession(request)
    const hasPermission = await checkPermission(session.user.role, 'BOOK_CREATE')

    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: { message: 'Forbidden' } },
        { status: 403 }
      )
    }

    // Parse and validate body
    const body = await request.json()
    const data = createBookSchema.parse(body)

    // Create book
    const book = await bookService.createBook(data, session.user.id)

    return NextResponse.json({
      success: true,
      data: book,
      message: 'Book created successfully'
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message }
      },
      { status: 400 }
    )
  }
}
```

---

### Phase 3: Advanced Features (Week 4-5)

#### 3.1 Borrowing System

**File: `src/services/borrowing.service.ts`**
```typescript
import { prisma } from '@/lib/db'
import { cache } from '@/lib/cache'
import { BorrowingRules } from '@/lib/borrowing-rules'

export class BorrowingService {
  async createBorrowing(dto: CreateBorrowingDto, adminId: string) {
    // Validate using rules engine
    const validation = await BorrowingRules.validate(dto)

    if (!validation.valid) {
      throw new Error(validation.message)
    }

    // Transaction
    return prisma.$transaction(async (tx) => {
      // Create borrowing
      const borrowing = await tx.borrowing.create({
        data: {
          bookId: dto.bookId,
          memberId: dto.memberId,
          borrowDate: new Date(),
          dueDate: this.calculateDueDate(dto.dueDays),
          status: 'BORROWED',
          processedBy: adminId
        },
        include: { book: true, member: true }
      })

      // Update book availability
      await tx.book.update({
        where: { id: dto.bookId },
        data: {
          available: { decrement: 1 },
          totalBorrows: { increment: 1 }
        }
      })

      // Log activity
      await tx.activityLog.create({
        data: {
          adminId,
          adminName: await this.getAdminName(adminId),
          action: 'BORROW',
          entityType: 'BORROWING',
          entityId: borrowing.id,
          entityName: `${borrowing.book.title} - ${borrowing.member.name}`
        }
      })

      // Invalidate caches
      await cache.invalidatePattern('books:*')
      await cache.invalidatePattern('borrowings:*')

      return borrowing
    })
  }

  async returnBook(id: string, options: ReturnOptions, adminId: string) {
    return prisma.$transaction(async (tx) => {
      const borrowing = await tx.borrowing.findUnique({
        where: { id },
        include: { book: true, member: true }
      })

      if (!borrowing) {
        throw new Error('Borrowing not found')
      }

      // Calculate fine
      const fine = this.calculateFine(borrowing.dueDate, new Date())

      // Process payment if fine exists
      if (fine > 0 && !options.waiveFine) {
        await this.processPayment(tx, borrowing, fine, options)
      }

      // Update borrowing
      const updated = await tx.borrowing.update({
        where: { id },
        data: {
          returnDate: new Date(),
          status: 'RETURNED',
          fine: options.waiveFine ? 0 : fine
        }
      })

      // Update book availability
      await tx.book.update({
        where: { id: borrowing.bookId },
        data: { available: { increment: 1 } }
      })

      // Log activity
      await tx.activityLog.create({
        data: {
          adminId,
          adminName: await this.getAdminName(adminId),
          action: 'RETURN',
          entityType: 'BORROWING',
          entityId: id,
          entityName: `${borrowing.book.title} - ${borrowing.member.name}`,
          details: `Fine: Rp ${fine.toLocaleString()}`
        }
      })

      // Invalidate caches
      await cache.invalidatePattern('books:*')
      await cache.invalidatePattern('borrowings:*')

      return updated
    })
  }

  private calculateDueDate(days: number = 14): Date {
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + days)
    return dueDate
  }

  private calculateFine(dueDate: Date, returnDate: Date): number {
    if (returnDate <= dueDate) return 0

    const daysOverdue = Math.ceil(
      (returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    return daysOverdue * 1000 // Rp 1,000 per day
  }

  private async processPayment(tx: any, borrowing: any, fine: number, options: ReturnOptions) {
    await tx.finePayment.create({
      data: {
        borrowingId: borrowing.id,
        memberId: borrowing.memberId,
        amount: fine,
        paymentDate: new Date(),
        method: options.paymentMethod || 'CASH',
        processedBy: options.adminId
      }
    })
  }

  private async getAdminName(adminId: string): Promise<string> {
    const admin = await prisma.admin.findUnique({ where: { id: adminId } })
    return admin?.name || 'Unknown'
  }
}
```

#### 3.2 Fine Calculation Rules

**File: `src/lib/borrowing-rules.ts`**
```typescript
import { prisma } from '@/lib/db'

export class BorrowingRules {
  static async validate(dto: CreateBorrowingDto): Promise<ValidationResult> {
    // Rule 1: Check member status
    const member = await prisma.member.findUnique({
      where: { id: dto.memberId }
    })

    if (!member) {
      return { valid: false, message: 'Member not found' }
    }

    if (member.status !== 'ACTIVE') {
      return { valid: false, message: 'Member is not active' }
    }

    // Rule 2: Check unpaid fines
    const unpaidFines = await prisma.finePayment.aggregate({
      where: { memberId: dto.memberId },
      _sum: { amount: true }
    })

    if (unpaidFines._sum.amount > 50000) {
      return { valid: false, message: 'Member has unpaid fines exceeding Rp 50,000' }
    }

    // Rule 3: Check book availability
    const book = await prisma.book.findUnique({
      where: { id: dto.bookId }
    })

    if (!book) {
      return { valid: false, message: 'Book not found' }
    }

    if (book.available <= 0) {
      return { valid: false, message: 'Book is not available' }
    }

    if (book.status !== 'ACTIVE') {
      return { valid: false, message: 'Book is not available for borrowing' }
    }

    // Rule 4: Check active borrowings limit
    const activeBorrowings = await prisma.borrowing.count({
      where: {
        memberId: dto.memberId,
        status: 'BORROWED'
      }
    })

    if (activeBorrowings >= 5) {
      return { valid: false, message: 'Member has reached maximum borrowings (5)' }
    }

    return { valid: true }
  }
}

interface ValidationResult {
  valid: boolean
  message?: string
}
```

---

### Phase 4: Testing & Optimization (Week 6)

#### 4.1 Unit Tests

**File: `src/tests/unit/book.service.test.ts`**
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BookService } from '@/services/book.service'
import { BookRepository } from '@/repositories/book.repository'

describe('BookService', () => {
  let bookService: BookService
  let bookRepository: BookRepository

  beforeEach(() => {
    bookRepository = vi.mocked(new BookRepository())
    bookService = new BookService()
  })

  it('should create a book', async () => {
    const bookData = {
      title: 'Test Book',
      author: 'Test Author',
      category: 'Fiction',
      stock: 5
    }

    const result = await bookService.createBook(bookData, 'admin-123')

    expect(result.title).toBe(bookData.title)
    expect(result.available).toBe(bookData.stock)
  })

  it('should throw error when book not found', async () => {
    await expect(bookService.getBook('invalid-id'))
      .rejects.toThrow('Book not found')
  })
})
```

#### 4.2 Performance Testing

**File: `scripts/performance-test.ts`**
```typescript
import { performance } from 'perf_hooks'

async function testBookQuery() {
  const iterations = 100
  const times = []

  for (let i = 0; i < iterations; i++) {
    const start = performance.now()

    await fetch('/api/books?search=test')

    const end = performance.now()
    times.push(end - start)
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length
  const p95 = times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)]

  console.log(`Average: ${avg.toFixed(2)}ms`)
  console.log(`P95: ${p95.toFixed(2)}ms`)
}
```

---

## 🔒 Security Checklist

### Authentication
- [ ] Implement JWT with refresh tokens
- [ ] Password hashing (bcrypt/scrypt/argon2)
- [ ] Secure session management
- [ ] Login rate limiting
- [ ] MFA for sensitive operations

### Authorization
- [ ] RBAC implementation
- [ ] Permission-based access control
- [ ] API-level permission checks
- [ ] Resource-level authorization

### Data Protection
- [ ] Input validation (Zod)
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitization)
- [ ] CSRF protection (CSRF tokens)
- [ ] Sensitive data encryption

### API Security
- [ ] Rate limiting
- [ ] Request size limits
- [ ] HTTPS enforcement
- [ ] CORS configuration
- [ ] Security headers

### Logging & Monitoring
- [ ] Audit logging
- [ ] Error logging
- [ ] Performance monitoring
- [ ] Security event alerts
- [ ] Log retention policy

---

## 📊 Performance Optimization Checklist

### Database
- [ ] Add indexes to frequently queried columns
- [ ] Optimize slow queries (EXPLAIN ANALYZE)
- [ ] Use connection pooling
- [ ] Implement read replicas
- [ ] Regular VACUUM and ANALYZE

### Caching
- [ ] Redis caching for hot data
- [ ] CDN for static assets
- [ ] HTTP caching headers
- [ ] Cache invalidation strategy
- [ ] Cache hit monitoring

### Application
- [ ] Lazy loading for large lists
- [ ] Pagination for all list endpoints
- [ ] Optimize bundle size (code splitting)
- [ ] Image optimization
- [ ] Minify CSS/JS

### API
- [ ] Response compression (gzip/brotli)
- [ ] GraphQL for complex queries (optional)
- [ ] Batch operations support
- [ ] Optimize N+1 queries
- [ ] Debounce expensive operations

---

## 🚢 Deployment Checklist

### Production Setup
- [ ] Configure production database
- [ ] Set up Redis cluster
- [ ] Configure S3/storage
- [ ] Set up SSL certificates
- [ ] Configure domain & DNS

### Environment Variables
- [ ] Set DATABASE_URL
- [ ] Set REDIS_URL
- [ ] Set JWT_SECRET
- [ ] Set S3 credentials
- [ ] Set SMTP credentials

### Application
- [ ] Build for production
- [ ] Configure process manager (PM2)
- [ ] Set up log rotation
- [ ] Configure health checks
- [ ] Set up monitoring (Sentry, New Relic)

### Infrastructure
- [ ] Configure load balancer
- [ ] Set up auto-scaling
- [ ] Configure backups (database & files)
- [ ] Set up CDN
- [ ] Configure firewall rules

---

## 📈 Monitoring & Maintenance

### Daily Checks
- [ ] Server health status
- [ ] Database connection
- [ ] Redis connection
- [ ] Storage capacity
- [ ] Error rates

### Weekly Tasks
- [ ] Review error logs
- [ ] Check performance metrics
- [ ] Review security logs
- [ ] Check cache hit rates
- [ ] Database maintenance

### Monthly Tasks
- [ ] Review and update dependencies
- [ ] Security audit
- [ ] Performance optimization
- [ ] Backup verification
- [ ] Capacity planning

---

## 🐛 Troubleshooting Guide

### Common Issues

#### 1. Database Connection Errors
```
Error: Can't reach database server
```
**Solution:**
- Check DATABASE_URL in .env
- Verify database server is running
- Check firewall rules
- Test connection: `bun prisma db push --force-reset`

#### 2. Redis Connection Errors
```
Error: Connection refused
```
**Solution:**
- Check Redis is running: `redis-cli ping`
- Verify REDIS_URL in .env
- Check Redis logs
- Test connection manually

#### 3. Cache Stale Data
**Solution:**
- Manually clear caches: `scripts/clear-cache.ts`
- Check cache TTL configuration
- Verify cache invalidation logic
- Monitor cache hit rate

#### 4. Slow Queries
**Solution:**
- Add EXPLAIN ANALYZE to queries
- Check missing indexes
- Optimize N+1 queries
- Use query batching
- Consider read replicas

---

## 📚 Additional Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

### Best Practices
- [12 Factor App](https://12factor.net/)
- [REST API Design](https://restfulapi.net/)
- [Database Design](https://www.postgresql.org/docs/current/tutorial-design.html)

### Security
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)

---

## 🎯 Next Steps

After completing the basic implementation:

1. **Add Advanced Features:**
   - Book reservations/holds
   - Email notifications
   - Mobile app (React Native)
   - Public catalog portal
   - Member self-service portal

2. **Enhance Security:**
   - Multi-factor authentication
   - Advanced RBAC
   - Data encryption at rest
   - Security audit logs

3. **Improve Performance:**
   - Implement GraphQL
   - Add full-text search (Elasticsearch)
   - Real-time updates (WebSockets)
   - Advanced caching strategies

4. **Add Analytics:**
   - Usage statistics
   - Popular books tracking
   - Member behavior analysis
   - Predictive analytics

5. **Compliance:**
   - GDPR compliance
   - Data retention policies
   - Privacy controls
   - Audit reporting

---

This implementation guide provides a practical roadmap for building the Library Management System. Start with the foundation and iteratively add features based on your requirements.
