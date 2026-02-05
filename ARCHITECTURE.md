# Arsitektur Backend & Desain Database
# Sistem Manajemen Perpustakaan Digital

---

## 📋 Daftar Isi

1. [Ikhtisar Arsitektur](#ikhtisar-arsitektur)
2. [Arsitektur Backend](#arsitektur-backend)
3. [Desain Database](#desain-database)
4. [Security Architecture](#security-architecture)
5. [Scalability Strategy](#scalability-strategy)
6. [API Design](#api-design)
7. [Caching Strategy](#caching-strategy)
8. [Monitoring & Logging](#monitoring--logging)

---

## 1. Ikhtisar Arsitektur

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  Web UI  │  │ Mobile   │  │  Public  │  │  Admin   │        │
│  │ (Next.js)│  │  App     │  │  Portal  │  │  Panel   │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
└───────┼─────────────┼─────────────┼─────────────┼───────────────┘
        │             │             │             │
        └─────────────┼─────────────┼─────────────┘
                      │             │
        ┌─────────────▼─────────────▼─────────────┐
        │           API Gateway Layer             │
        │      (Rate Limiting, Auth Check)       │
        └─────────────┬─────────────────────────┘
                      │
        ┌─────────────▼─────────────────────────┐
        │      Backend Application Layer         │
        │  ┌─────────┐  ┌─────────┐  ┌────────┐ │
        │  │Controller│  │ Service │  │Repository│ │
        │  │  Layer  │  │  Layer  │  │  Layer  │ │
        │  └─────────┘  └─────────┘  └────────┘ │
        └─────────────┬─────────────────────────┘
                      │
        ┌─────────────▼─────────────────────────┐
        │          Data Access Layer            │
        │    (Database Connection Pooling)      │
        └───────┬──────────┬──────────┬────────┘
                │          │          │
        ┌───────▼──┐ ┌────▼────┐ ┌─▼────────┐
        │ Primary  │ │ Redis   │ │  S3/     │
        │ Database │ │  Cache  │ │  Storage │
        └──────────┘ └─────────┘ └──────────┘
```

### 1.2 Teknologi Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Next.js 16 (App Router) | Full-stack capability, SSR, API routes |
| **Runtime** | Bun | High performance, native TypeScript |
| **Database** | PostgreSQL (Production) / SQLite (Dev) | ACID compliance, complex queries |
| **ORM** | Prisma | Type-safe, migrations, schema management |
| **Cache** | Redis | Fast in-memory data store |
| **Storage** | AWS S3 / MinIO | Scalable file storage |
| **Auth** | NextAuth.js v4 + JWT | Flexible authentication |
| **Validation** | Zod | Runtime type validation |

---

## 2. Arsitektur Backend

### 2.1 Layered Architecture

#### 2.1.1 Controller Layer (API Routes)
- **Location:** `src/app/api/[resource]/route.ts`
- **Responsibilities:**
  - HTTP request/response handling
  - Request validation
  - Authentication & authorization check
  - Response formatting
  - Error handling

```typescript
// Example: Controller Structure
export async function GET(request: NextRequest) {
  // 1. Validate authentication
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Validate request
  const validatedQuery = bookQuerySchema.parse(queryParams)

  // 3. Call service layer
  const result = await bookService.getBooks(validatedQuery)

  // 4. Return response
  return NextResponse.json(result)
}
```

#### 2.1.2 Service Layer (Business Logic)
- **Location:** `src/services/[resource].service.ts`
- **Responsibilities:**
  - Business logic implementation
  - Transaction management
  - Data transformation
  - Cross-entity operations
  - Cache management

```typescript
// Example: Service Structure
export class BookService {
  async getBooks(filters: BookFilters): Promise<PaginatedResponse<Book>> {
    // Check cache first
    const cacheKey = `books:${JSON.stringify(filters)}`
    const cached = await cache.get(cacheKey)
    if (cached) return cached

    // Query database
    const books = await bookRepository.findMany(filters)

    // Transform data
    const response = this.transformResponse(books)

    // Set cache
    await cache.set(cacheKey, response, { ttl: 300 })

    return response
  }
}
```

#### 2.1.3 Repository Layer (Data Access)
- **Location:** `src/repositories/[resource].repository.ts`
- **Responsibilities:**
  - Database queries
  - Data persistence
  - Connection pooling
  - Query optimization

```typescript
// Example: Repository Structure
export class BookRepository {
  async findMany(filters: BookFilters): Promise<Book[]> {
    return await db.book.findMany({
      where: this.buildWhereClause(filters),
      include: {
        borrowings: true
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  private buildWhereClause(filters: BookFilters) {
    const conditions = []
    if (filters.category) conditions.push({ category: filters.category })
    if (filters.search) conditions.push({
      OR: [
        { title: { contains: filters.search } },
        { author: { contains: filters.search } }
      ]
    })
    return conditions.length > 0 ? { AND: conditions } : {}
  }
}
```

### 2.2 Dependency Injection

```typescript
// src/lib/di.ts
import { BookService } from '@/services/book.service'
import { BookRepository } from '@/repositories/book.repository'

export const bookRepository = new BookRepository()
export const bookService = new BookService(bookRepository)
export const services = {
  book: bookService,
  member: memberService,
  borrowing: borrowingService
}
```

### 2.3 Error Handling Strategy

```typescript
// src/lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      `${resource}${id ? ` dengan ID ${id}` : ''} tidak ditemukan`,
      404,
      'NOT_FOUND'
    )
  }
}

export class ValidationError extends AppError {
  constructor(errors: any) {
    super('Validasi gagal', 400, 'VALIDATION_ERROR', errors)
  }
}

// src/lib/error-handler.ts
export function handleAppError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json({
      error: error.message,
      code: error.code,
      details: error.details
    }, { status: error.statusCode })
  }

  // Log unexpected errors
  console.error('Unexpected error:', error)

  return NextResponse.json({
    error: 'Terjadi kesalahan internal',
    code: 'INTERNAL_ERROR'
  }, { status: 500 })
}
```

---

## 3. Desain Database

### 3.1 Entity Relationship Diagram (ERD)

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    Admin     │       │    Member    │       │    Book      │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │       │ id (PK)      │
│ name         │       │ name         │       │ title        │
│ email        │       │ email        │       │ author       │
│ passwordHash │       │ phone        │       │ isbn         │
│ role         │       │ address      │       │ category     │
│ status       │       │ memberId     │       │ stock        │
│ createdAt    │       │ status       │       │ available    │
│ updatedAt    │       │ joinDate     │       │ publishedYear│
│ lastLogin    │       │ createdAt    │       │ publisher    │
└──────────────┘       │ updatedAt    │       │ description │
                       └──────────────┘       └──────────────┘
                              │                      │
                              │                      │
                              │          ┌───────────▼───────────┐
                              │          │     Borrowing         │
                              │          ├───────────────────────┤
                              │          │ id (PK)              │
                              │          │ bookId (FK)          │
                              │          │ memberId (FK)        │
                              │          │ borrowDate           │
                              │          │ dueDate              │
                              │          │ returnDate           │
                              │          │ status               │
                              │          │ fine                 │
                              │          │ notes                │
                              │          │ createdAt            │
                              │          │ updatedAt            │
                              │          └───────────────────────┘
                              │
                              │
                              ▼
                       ┌──────────────┐
                       │   EBook      │
                       ├──────────────┤
                       │ id (PK)      │
                       │ title        │
                       │ author       │
                       │ category     │
                       │ isbn         │
                       │ pdfPath      │
                       │ fileSize     │
                       │ coverImage   │
                       │ publishedYear│
                       │ publisher    │
                       │ description │
                       │ viewCount    │
                       │ downloadCount│
                       │ createdAt    │
                       │ updatedAt    │
                       └──────────────┘

┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│ActivityLog   │       │   Report     │       │  FinePayment │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │       │ id (PK)      │
│ adminId (FK) │       │ type         │       │ borrowingId  │
│ adminName    │       │ period       │       │ amount       │
│ action       │       │ startDate    │       │ paymentDate  │
│ entityType   │       │ endDate      │       │ method       │
│ entityId     │       │ data         │       │ status       │
│ entityName   │       │ createdAt    │       │ createdAt    │
│ details      │       └──────────────┘       └──────────────┘
│ ipAddress    │
│ userAgent    │
│ timestamp    │
└──────────────┘
```

### 3.2 Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== USERS & ROLES ====================

model Admin {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  passwordHash String   @map("password_hash")
  role         AdminRole @default(LIBRARIAN)
  status       UserStatus @default(ACTIVE)
  lastLoginAt  DateTime? @map("last_login_at")
  lastLoginIp  String?  @map("last_login_ip")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  activityLogs ActivityLog[]

  @@index([email])
  @@index([status])
  @@map("admins")
}

enum AdminRole {
  SUPER_ADMIN
  LIBRARIAN
  ASSISTANT
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  DELETED
}

// ==================== MEMBERS ====================

model Member {
  id           String   @id @default(cuid())
  memberId     String   @unique @map("member_id") // Custom ID like LIB001
  name         String
  email        String?  @unique
  phone        String?
  address      String?
  status       UserStatus @default(ACTIVE)
  joinDate     DateTime @default(now()) @map("join_date")
  suspensionStart DateTime? @map("suspension_start")
  suspensionEnd   DateTime? @map("suspension_end")
  notes        String?
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  borrowings Borrowing[]
  finePayments FinePayment[]

  @@index([memberId])
  @@index([email])
  @@index([status])
  @@map("members")
}

// ==================== BOOKS ====================

model Book {
  id            String   @id @default(cuid())
  title         String
  author        String
  isbn          String?  @unique
  category      String
  stock         Int      @default(0)
  available     Int      @default(0)
  publishedYear Int?     @map("published_year")
  publisher     String?
  description   String?  @db.Text
  coverImage    String?  @map("cover_image")
  location      String?  // Shelf location
  totalBorrows  Int      @default(0) @map("total_borrows")
  rating        Float?   @default(0)
  reviewCount   Int      @default(0) @map("review_count")
  status        BookStatus @default(ACTIVE)
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  borrowings Borrowing[]

  @@index([isbn])
  @@index([category])
  @@index([status])
  @@index([title, author])
  @@map("books")
}

enum BookStatus {
  ACTIVE
  DAMAGED
  LOST
  ARCHIVED
}

// ==================== EBOOKS ====================

model EBook {
  id           String   @id @default(cuid())
  title        String
  author       String
  isbn         String?  @unique
  category     String
  pdfPath      String   @map("pdf_path")
  fileSize     Int      @map("file_size")
  coverImage   String?  @map("cover_image")
  publishedYear Int?    @map("published_year")
  publisher    String?
  description  String?  @db.Text
  viewCount    Int      @default(0) @map("view_count")
  downloadCount Int     @default(0) @map("download_count")
  status       BookStatus @default(ACTIVE)
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@index([category])
  @@index([status])
  @@index([title, author])
  @@map("ebooks")
}

// ==================== BORROWINGS ====================

model Borrowing {
  id          String   @id @default(cuid())
  bookId      String   @map("book_id")
  memberId    String   @map("member_id")
  borrowDate  DateTime @default(now()) @map("borrow_date")
  dueDate     DateTime @map("due_date")
  returnDate  DateTime? @map("return_date")
  status      BorrowingStatus @default(BORROWED)
  fine        Float    @default(0)
  notes       String?
  processedBy String?  @map("processed_by") // Admin who processed
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  book         Book    @relation(fields: [bookId], references: [id], onDelete: Cascade)
  member       Member  @relation(fields: [memberId], references: [id], onDelete: Cascade)
  finePayments FinePayment[]

  @@index([bookId])
  @@index([memberId])
  @@index([status])
  @@index([dueDate])
  @@index([borrowDate])
  @@map("borrowings")
}

enum BorrowingStatus {
  BORROWED
  RETURNED
  OVERDUE
  CANCELLED
}

// ==================== FINES ====================

model FinePayment {
  id          String   @id @default(cuid())
  borrowingId String   @map("borrowing_id")
  memberId    String   @map("member_id")
  amount      Float
  paymentDate DateTime @default(now()) @map("payment_date")
  method      PaymentMethod @map("payment_method")
  reference   String?
  processedBy String   @map("processed_by")
  notes       String?
  createdAt   DateTime @default(now()) @map("created_at")

  borrowing Borrowing @relation(fields: [borrowingId], references: [id], onDelete: Cascade)
  member    Member    @relation(fields: [memberId], references: [id], onDelete: Cascade)

  @@index([borrowingId])
  @@index([memberId])
  @@index([paymentDate])
  @@map("fine_payments")
}

enum PaymentMethod {
  CASH
  TRANSFER
  E_WALLET
  CARD
}

// ==================== ACTIVITY LOGS ====================

model ActivityLog {
  id         String   @id @default(cuid())
  adminId    String?  @map("admin_id")
  adminName  String   @map("admin_name")
  action     ActionType
  entityType String   @map("entity_type")
  entityId   String   @map("entity_id")
  entityName String   @map("entity_name")
  details    String?  @db.Text
  ipAddress  String?  @map("ip_address")
  userAgent  String?  @map("user_agent")
  timestamp  DateTime @default(now())

  admin Admin? @relation(fields: [adminId], references: [id], onDelete: SetNull)

  @@index([adminId])
  @@index([entityType])
  @@index([timestamp])
  @@index([action])
  @@map("activity_logs")
}

enum ActionType {
  CREATE
  UPDATE
  DELETE
  LOGIN
  LOGOUT
  VIEW
  DOWNLOAD
  BORROW
  RETURN
}

// ==================== REPORTS ====================

model Report {
  id          String   @id @default(cuid())
  type        ReportType
  title       String
  description String?  @db.Text
  startDate   DateTime @map("start_date")
  endDate     DateTime @map("end_date")
  data        Json     // Store report data as JSON
  generatedBy String   @map("generated_by")
  createdAt   DateTime @default(now()) @map("created_at")

  @@index([type])
  @@index([createdAt])
  @@map("reports")
}

enum ReportType {
  DAILY
  WEEKLY
  MONTHLY
  YEARLY
  CUSTOM
}
```

### 3.3 Database Indexing Strategy

```sql
-- Performance critical indexes
CREATE INDEX idx_books_search ON books USING GIN (to_tsvector('english', title || ' ' || author));
CREATE INDEX idx_members_active ON members(status) WHERE status = 'ACTIVE';
CREATE INDEX idx_borrowings_active ON borrowings(status) WHERE status = 'BORROWED';
CREATE INDEX idx_borrowings_overdue ON borrowings(dueDate) WHERE status = 'BORROWED' AND dueDate < NOW();

-- Composite indexes for common queries
CREATE INDEX idx_borrowings_member_status ON borrowings(memberId, status);
CREATE INDEX idx_borrowings_book_status ON borrowings(bookId, status);
CREATE INDEX idx_activity_logs_admin_time ON activity_logs(adminId, timestamp DESC);

-- Partial indexes for frequently filtered data
CREATE INDEX idx_books_category ON books(category, status) WHERE status = 'ACTIVE';
CREATE INDEX idx_ebooks_popular ON ebooks(viewCount DESC) WHERE status = 'ACTIVE';
```

### 3.4 Database Constraints

```sql
-- Check constraints
ALTER TABLE books ADD CONSTRAINT chk_stock_available
  CHECK (available <= stock);

ALTER TABLE members ADD CONSTRAINT chk_member_id_format
  CHECK (member_id ~ '^LIB[0-9]{3,6}$');

ALTER TABLE borrowings ADD CONSTRAINT chk_due_date
  CHECK (dueDate > borrowDate);

ALTER TABLE borrowings ADD CONSTRAINT chk_fine_amount
  CHECK (fine >= 0);

-- Triggers for automatic status updates
CREATE OR REPLACE FUNCTION update_borrowing_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.returnDate IS NOT NULL THEN
    NEW.status := 'RETURNED';
  ELSEIF NEW.dueDate < NOW() THEN
    NEW.status := 'OVERDUE';
  ELSE
    NEW.status := 'BORROWED';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_borrowing_status
  BEFORE INSERT OR UPDATE ON borrowings
  FOR EACH ROW EXECUTE FUNCTION update_borrowing_status();
```

---

## 4. Security Architecture

### 4.1 Authentication Flow

```
┌──────────┐
│  Client  │
└────┬─────┘
     │
     │ 1. POST /api/auth/login
     │    { email, password }
     ▼
┌──────────────────┐
│  API Gateway     │
│  Rate Limiting   │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│  Auth Service    │
│  - Validate     │
│  - Hash Compare │
└────┬─────────────┘
     │
     │ 2. Generate JWT
     ▼
┌──────────────────┐
│  Response       │
│  {              │
│    token,       │
│    user,        │
│    expiresAt    │
│  }              │
└──────────────────┘
```

### 4.2 Authorization (RBAC)

```typescript
// src/lib/permissions.ts
export enum Permission {
  // Book permissions
  BOOK_READ = 'book:read',
  BOOK_CREATE = 'book:create',
  BOOK_UPDATE = 'book:update',
  BOOK_DELETE = 'book:delete',

  // Member permissions
  MEMBER_READ = 'member:read',
  MEMBER_CREATE = 'member:create',
  MEMBER_UPDATE = 'member:update',
  MEMBER_DELETE = 'member:delete',

  // Borrowing permissions
  BORROWING_CREATE = 'borrowing:create',
  BORROWING_PROCESS_RETURN = 'borrowing:return',
  BORROWING_VIEW_FINE = 'borrowing:fine',

  // E-book permissions
  EBOOK_READ = 'ebook:read',
  EBOOK_UPLOAD = 'ebook:upload',
  EBOOK_DELETE = 'ebook:delete',

  // Admin permissions
  ADMIN_MANAGE = 'admin:manage',
  LOGS_VIEW = 'logs:view',
  REPORTS_GENERATE = 'reports:generate',
  SETTINGS_MANAGE = 'settings:manage'
}

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  [AdminRole.SUPER_ADMIN]: [
    // All permissions
    ...Object.values(Permission)
  ],
  [AdminRole.LIBRARIAN]: [
    Permission.BOOK_READ,
    Permission.BOOK_CREATE,
    Permission.BOOK_UPDATE,
    Permission.MEMBER_READ,
    Permission.MEMBER_CREATE,
    Permission.MEMBER_UPDATE,
    Permission.BORROWING_CREATE,
    Permission.BORROWING_PROCESS_RETURN,
    Permission.EBOOK_READ,
    Permission.EBOOK_UPLOAD,
    Permission.LOGS_VIEW,
    Permission.REPORTS_GENERATE
  ],
  [AdminRole.ASSISTANT]: [
    Permission.BOOK_READ,
    Permission.MEMBER_READ,
    Permission.BORROWING_CREATE,
    Permission.EBOOK_READ,
    Permission.LOGS_VIEW
  ]
}

// Middleware for permission check
export function requirePermission(permission: Permission) {
  return async (request: NextRequest) => {
    const session = await getServerSession(authOptions)

    if (!session?.user?.role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userPermissions = ROLE_PERMISSIONS[session.user.role as AdminRole]

    if (!userPermissions.includes(permission)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      )
    }

    return null // Allow request to proceed
  }
}
```

### 4.3 Data Encryption

```typescript
// src/lib/crypto.ts
import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32
const IV_LENGTH = 16
const SALT_LENGTH = 64
const TAG_LENGTH = 16
const TAG_POSITION = SALT_LENGTH + IV_LENGTH
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH

class EncryptionService {
  private getKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(
      password,
      salt,
      100000,
      KEY_LENGTH,
      'sha512'
    )
  }

  encrypt(text: string, password: string): string {
    const salt = crypto.randomBytes(SALT_LENGTH)
    const iv = crypto.randomBytes(IV_LENGTH)
    const key = this.getKey(password, salt)

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final()
    ])

    const tag = cipher.getAuthTag()

    return Buffer.concat([salt, iv, tag, encrypted]).toString('base64')
  }

  decrypt(encrypted: string, password: string): string {
    const buffer = Buffer.from(encrypted, 'base64')

    const salt = buffer.subarray(0, SALT_LENGTH)
    const iv = buffer.subarray(SALT_LENGTH, TAG_POSITION)
    const tag = buffer.subarray(TAG_POSITION, ENCRYPTED_POSITION)
    const encryptedData = buffer.subarray(ENCRYPTED_POSITION)

    const key = this.getKey(password, salt)

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(tag)

    return decipher.update(encryptedData) + decipher.final('utf8')
  }
}

export const encryption = new EncryptionService()

// Password hashing
export class PasswordService {
  async hash(password: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto
      .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
      .toString('hex')
    return `${salt}:${hash}`
  }

  async compare(password: string, hashed: string): Promise<boolean> {
    const [salt, hash] = hashed.split(':')
    const compareHash = crypto
      .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
      .toString('hex')
    return hash === compareHash
  }
}
```

### 4.4 Input Validation (Zod)

```typescript
// src/validations/book.validation.ts
import { z } from 'zod'

export const createBookSchema = z.object({
  title: z.string()
    .min(1, 'Judul harus diisi')
    .max(500, 'Judul terlalu panjang'),
  author: z.string()
    .min(1, 'Penulis harus diisi')
    .max(255, 'Nama penulis terlalu panjang'),
  isbn: z.string()
    .regex(/^(?:\d[- ]?){9}[\dX]$/, 'Format ISBN tidak valid')
    .optional(),
  category: z.string()
    .min(1, 'Kategori harus diisi')
    .max(100, 'Kategori terlalu panjang'),
  stock: z.number()
    .int('Stok harus bilangan bulat')
    .min(0, 'Stok tidak boleh negatif')
    .max(1000, 'Stok tidak boleh lebih dari 1000'),
  publishedYear: z.number()
    .int('Tahun terbit harus bilangan bulat')
    .min(1800, 'Tahun terbit tidak valid')
    .max(new Date().getFullYear(), 'Tahun terbit tidak boleh masa depan')
    .optional(),
  publisher: z.string()
    .max(255, 'Nama penerbit terlalu panjang')
    .optional(),
  description: z.string()
    .max(5000, 'Deskripsi terlalu panjang')
    .optional()
})

export const updateBookSchema = createBookSchema.partial()

export const bookQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['ACTIVE', 'DAMAGED', 'LOST', 'ARCHIVED']).optional(),
  sortBy: z.enum(['title', 'author', 'createdAt', 'stock']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// src/validations/borrowing.validation.ts
export const createBorrowingSchema = z.object({
  bookId: z.string().cuid('ID buku tidak valid'),
  memberId: z.string().cuid('ID anggota tidak valid'),
  dueDays: z.number()
    .int('Hari harus bilangan bulat')
    .min(1, 'Minimal 1 hari')
    .max(30, 'Maksimal 30 hari')
    .default(14)
    .optional()
})

export const returnBorrowingSchema = z.object({
  borrowingId: z.string().cuid('ID peminjaman tidak valid'),
  waiveFine: z.boolean().default(false),
  paymentMethod: z.enum(['CASH', 'TRANSFER', 'E_WALLET', 'CARD']).optional(),
  notes: z.string().max(500).optional()
})
```

### 4.5 Rate Limiting

```typescript
// src/lib/rate-limit.ts
import { LRUCache } from 'lru-cache'

interface RateLimitOptions {
  interval: number // Time window in ms
  max: number // Max requests per interval
}

type RateLimitInfo = {
  count: number
  resetTime: number
}

class RateLimiter {
  private cache: LRUCache<string, RateLimitInfo>

  constructor() {
    this.cache = new LRUCache({
      max: 500, // Max unique IPs
      ttl: 1000 * 60 * 60 // 1 hour
    })
  }

  check(identifier: string, options: RateLimitOptions): {
    success: boolean
    remaining: number
    resetTime: number
  } {
    const now = Date.now()
    const record = this.cache.get(identifier)

    if (!record || now > record.resetTime) {
      // First request or window expired
      const resetTime = now + options.interval
      this.cache.set(identifier, { count: 1, resetTime })

      return {
        success: true,
        remaining: options.max - 1,
        resetTime
      }
    }

    if (record.count >= options.max) {
      // Rate limit exceeded
      return {
        success: false,
        remaining: 0,
        resetTime: record.resetTime
      }
    }

    // Increment count
    record.count++
    this.cache.set(identifier, record)

    return {
      success: true,
      remaining: options.max - record.count,
      resetTime: record.resetTime
    }
  }
}

export const rateLimiter = new RateLimiter()

// Rate limit configurations
export const RATE_LIMITS = {
  AUTH: { interval: 15 * 60 * 1000, max: 5 }, // 5 per 15 min
  API: { interval: 60 * 1000, max: 100 }, // 100 per min
  UPLOAD: { interval: 60 * 1000, max: 10 }, // 10 per min
  SEARCH: { interval: 60 * 1000, max: 30 } // 30 per min
}

// Middleware
export async function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
) {
  const result = rateLimiter.check(identifier, options)

  if (!result.success) {
    throw new Error('Rate limit exceeded. Please try again later.')
  }

  return result
}
```

---

## 5. Scalability Strategy

### 5.1 Horizontal Scaling

```
                    ┌─────────────┐
                    │ Load Balancer│
                    │  (Nginx)    │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼─────┐     ┌────▼─────┐     ┌────▼─────┐
    │ Instance │     │ Instance │     │ Instance │
    │     1    │     │     2    │     │     3    │
    │ (Bun)    │     │ (Bun)    │     │ (Bun)    │
    └────┬─────┘     └────┬─────┘     └────┬─────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
                    ┌──────▼──────┐
                    │   Primary   │
                    │  PostgreSQL │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼─────┐     ┌────▼─────┐     ┌────▼─────┐
    │ Replica  │     │ Replica  │     │  Redis   │
    │    1     │     │    2     │     │  Cluster │
    └──────────┘     └──────────┘     └──────────┘
```

### 5.2 Database Scaling

#### Primary-Replica Configuration

```bash
# PostgreSQL replication setup
# Primary Server (Write)
max_wal_senders = 5
wal_level = replica
max_replication_slots = 5

# Replica Server (Read)
hot_standby = on
max_standby_streaming_delay = 30s
```

#### Read-Write Splitting

```typescript
// src/lib/database.ts
import { PrismaClient } from '@prisma/client'

const prismaWrite = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL_WRITE }
  }
})

const prismaRead = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL_READ }
  }
})

// Routing based on operation
export function getPrismaClient(operation: 'read' | 'write' = 'read') {
  return operation === 'write' ? prismaWrite : prismaRead
}

// Usage
export const db = {
  book: {
    async findMany(...args) {
      return prismaRead.book.findMany(...args) // Read replica
    },
    async create(...args) {
      return prismaWrite.book.create(...args) // Primary
    },
    async update(...args) {
      return prismaWrite.book.update(...args) // Primary
    },
    async delete(...args) {
      return prismaWrite.book.delete(...args) // Primary
    }
  }
}
```

### 5.3 Connection Pooling

```typescript
// prisma/schema.prisma
// Connection pool configuration in .env
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=20"

// src/lib/db.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

export { prisma }
```

### 5.4 Caching Strategy

#### Cache Hierarchy

```
L1: Browser Cache (HTTP Cache Headers)
   ↓
L2: CDN Cache (CloudFlare, Vercel Edge)
   ↓
L3: Application Cache (Memory/Redis)
   ↓
L4: Database Cache (PostgreSQL Query Cache)
   ↓
L5: Database (PostgreSQL)
```

#### Redis Implementation

```typescript
// src/lib/redis.ts
import { Redis } from 'ioredis'

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000)
    return delay
  }
})

class CacheService {
  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key)
    return data ? JSON.parse(data) : null
  }

  async set(
    key: string,
    value: any,
    options?: { ttl?: number }
  ): Promise<void> {
    const serialized = JSON.stringify(value)

    if (options?.ttl) {
      await redis.setex(key, options.ttl, serialized)
    } else {
      await redis.set(key, serialized)
    }
  }

  async del(...keys: string[]): Promise<void> {
    await redis.del(...keys)
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  }

  // Cache-aside pattern
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: { ttl?: number }
  ): Promise<T> {
    const cached = await this.get<T>(key)

    if (cached !== null) {
      return cached
    }

    const data = await fetcher()
    await this.set(key, data, options)

    return data
  }
}

export const cache = new CacheService()
```

#### Cache Invalidation Strategy

```typescript
// src/services/book.service.ts
import { cache } from '@/lib/redis'

export class BookService {
  // Cache key patterns
  private static CACHE_KEYS = {
    book: (id: string) => `book:${id}`,
    books: (filters: string) => `books:${filters}`,
    bookStats: () => `stats:books`,
    searchResults: (query: string) => `search:${query}`
  }

  async getBook(id: string) {
    return cache.getOrSet(
      BookService.CACHE_KEYS.book(id),
      () => bookRepository.findById(id),
      { ttl: 3600 } // 1 hour
    )
  }

  async updateBook(id: string, data: UpdateBookDto) {
    const book = await bookRepository.update(id, data)

    // Invalidate related caches
    await Promise.all([
      cache.del(BookService.CACHE_KEYS.book(id)),
      cache.invalidatePattern('books:*'),
      cache.del(BookService.CACHE_KEYS.bookStats()),
      cache.invalidatePattern('search:*')
    ])

    return book
  }
}
```

---

## 6. API Design

### 6.1 RESTful API Structure

```
/api
├── /auth
│   ├── POST   /login
│   ├── POST   /logout
│   ├── POST   /refresh
│   └── GET    /me
│
├── /books
│   ├── GET    /
│   ├── POST   /
│   ├── GET    /:id
│   ├── PATCH  /:id
│   ├── DELETE /:id
│   ├── GET    /:id/borrowings
│   └── GET    /:id/stats
│
├── /members
│   ├── GET    /
│   ├── POST   /
│   ├── GET    /:id
│   ├── PATCH  /:id
│   ├── DELETE /:id
│   ├── POST   /:id/suspend
│   ├── POST   /:id/activate
│   ├── GET    /:id/borrowings
│   └── GET    /:id/fines
│
├── /borrowings
│   ├── GET    /
│   ├── POST   /
│   ├── GET    /:id
│   ├── POST   /:id/return
│   ├── POST   /:id/renew
│   └── GET    /overdue
│
├── /ebooks
│   ├── GET    /
│   ├── POST   /
│   ├── GET    /:id
│   ├── DELETE /:id
│   ├── GET    /:id/view
│   └── GET    /:id/download
│
├── /fines
│   ├── GET    /
│   ├── POST   /:id/pay
│   └── GET    /unpaid
│
├── /reports
│   ├── GET    /
│   ├── POST   /
│   ├── GET    /:id
│   └── GET    /:id/export
│
├── /activity-logs
│   ├── GET    /
│   └── GET    /:id
│
├── /admins
│   ├── GET    /
│   ├── POST   /
│   ├── GET    /:id
│   ├── PATCH  /:id
│   └── DELETE /:id
│
└── /settings
    ├── GET    /
    └── PATCH  /
```

### 6.2 Response Format

```typescript
// Success Response
interface SuccessResponse<T> {
  success: true
  data: T
  message?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

// Error Response
interface ErrorResponse {
  success: false
  error: {
    message: string
    code: string
    details?: any
    field?: string
  }
}

// Paginated Response
interface PaginatedResponse<T> {
  success: true
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Example usage
export function successResponse<T>(
  data: T,
  message?: string,
  meta?: any
): NextResponse<SuccessResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
    meta
  })
}

export function errorResponse(
  message: string,
  code: string,
  statusCode: number = 500,
  details?: any
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: { message, code, details }
    },
    { status: statusCode }
  )
}
```

### 6.3 API Versioning

```typescript
// Versioned routes structure
src/app/api/
├── v1/
│   ├── books/route.ts
│   ├── books/[id]/route.ts
│   └── ...
└── v2/
    ├── books/route.ts
    ├── books/[id]/route.ts
    └── ...

// Version header middleware
export async function checkApiVersion(request: NextRequest) {
  const version = request.headers.get('api-version') || 'v1'

  if (!['v1', 'v2'].includes(version)) {
    return NextResponse.json(
      { error: 'Unsupported API version' },
      { status: 400 }
    )
  }

  return version
}
```

---

## 7. Caching Strategy

### 7.1 Cache Key Patterns

```typescript
// src/lib/cache-keys.ts
export const CACHE_KEYS = {
  // Books
  book: (id: string) => `book:${id}`,
  bookList: (filters: string) => `books:list:${filters}`,
  bookStats: () => `stats:books`,
  popularBooks: () => `books:popular`,

  // Members
  member: (id: string) => `member:${id}`,
  memberList: (filters: string) => `members:list:${filters}`,
  memberStats: () => `stats:members`,

  // Borrowings
  borrowing: (id: string) => `borrowing:${id}`,
  activeBorrowings: () => `borrowings:active`,
  overdueBorrowings: () => `borrowings:overdue`,
  memberBorrowings: (memberId: string) => `member:${memberId}:borrowings`,

  // E-books
  ebook: (id: string) => `ebook:${id}`,
  ebookList: (filters: string) => `ebooks:list:${filters}`,

  // Search
  search: (query: string, type: string) => `search:${type}:${query}`,

  // Reports
  report: (id: string) => `report:${id}`,
  dailyStats: (date: string) => `stats:daily:${date}`,

  // Activity logs
  activityLog: (id: string) => `log:${id}`,
  recentLogs: () => `logs:recent`
}
```

### 7.2 Cache TTL Configuration

```typescript
// src/lib/cache-config.ts
export const CACHE_TTL = {
  // Static data (long TTL)
  BOOK_DETAILS: 3600, // 1 hour
  EBOOK_DETAILS: 3600,
  MEMBER_DETAILS: 1800, // 30 min

  // Lists (medium TTL)
  BOOK_LIST: 300, // 5 min
  MEMBER_LIST: 300,
  EBOOK_LIST: 300,

  // Real-time data (short TTL)
  ACTIVE_BORROWINGS: 60, // 1 min
  OVERDUE_BORROWINGS: 60,
  BOOK_STOCK: 30,

  // Search results
  SEARCH_RESULTS: 180, // 3 min

  // Statistics
  DAILY_STATS: 300,
  REPORT: 3600,

  // Activity logs
  RECENT_LOGS: 60
}
```

### 7.3 Cache Strategies by Operation

```typescript
// src/lib/cache-strategies.ts
import { cache, CACHE_TTL } from '@/lib/cache'

export class CacheStrategies {
  // Read-Through: Cache miss → DB → Cache
  static async readThrough<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number
  ): Promise<T> {
    return cache.getOrSet(key, fetcher, { ttl })
  }

  // Write-Through: DB + Cache
  static async writeThrough<T>(
    key: string,
    value: T,
    ttl: number,
    writer: () => Promise<T>
  ): Promise<T> {
    const result = await writer()
    await cache.set(key, result, { ttl })
    return result
  }

  // Write-Behind: DB → Queue → Cache (async)
  static async writeBehind<T>(
    key: string,
    value: T,
    writer: () => Promise<T>
  ): Promise<T> {
    // Write to DB immediately
    const result = await writer()

    // Update cache asynchronously
    cache.set(key, result).catch(err => {
      console.error('Cache update failed:', err)
    })

    return result
  }

  // Cache-Aside: App manages cache
  static async cacheAside<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number
  ): Promise<T> {
    const cached = await cache.get<T>(key)

    if (cached) {
      return cached
    }

    const data = await fetcher()
    await cache.set(key, data, { ttl })

    return data
  }
}
```

---

## 8. Monitoring & Logging

### 8.1 Structured Logging

```typescript
// src/lib/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  userId?: string
  requestId?: string
  action?: string
  resource?: string
  ip?: string
  userAgent?: string
  [key: string]: any
}

class Logger {
  private format(level: LogLevel, message: string, context: LogContext = {}) {
    const log = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context
    }

    return JSON.stringify(log)
  }

  debug(message: string, context?: LogContext) {
    console.debug(this.format('debug', message, context))
  }

  info(message: string, context?: LogContext) {
    console.info(this.format('info', message, context))
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.format('warn', message, context))
  }

  error(message: string, error?: Error, context?: LogContext = {}) {
    console.error(this.format('error', message, {
      ...context,
      error: {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      }
    }))
  }

  // Specialized loggers
  audit(action: string, resource: string, context: LogContext = {}) {
    this.info('AUDIT', {
      action,
      resource,
      ...context
    })
  }

  performance(operation: string, duration: number, context?: LogContext) {
    this.info('PERFORMANCE', {
      operation,
      duration: `${duration}ms`,
      ...context
    })
  }
}

export const logger = new Logger()

// Usage example
logger.audit('BORROW', 'BOOK', {
  userId: 'admin-123',
  resourceId: 'book-456',
  memberId: 'member-789',
  success: true
})

logger.performance('database_query', 150, {
  query: 'SELECT * FROM books WHERE category = ?',
  rows: 50
})
```

### 8.2 Request Tracing

```typescript
// src/lib/tracing.ts
import { randomUUID } from 'crypto'

export function generateRequestId(): string {
  return randomUUID()
}

export function withRequestId<T extends (...args: any[]) => Promise<any>>(
  handler: T,
  options?: { includeHeaders?: string[] }
): T {
  return (async (...args: any[]) => {
    const requestId = generateRequestId()

    // Add to context
    const context = {
      requestId,
      timestamp: new Date().toISOString()
    }

    // Log request start
    logger.info('REQUEST_START', context)

    try {
      const result = await handler(...args)
      logger.info('REQUEST_SUCCESS', context)

      return result
    } catch (error) {
      logger.error('REQUEST_ERROR', error as Error, context)
      throw error
    }
  }) as T
}
```

### 8.3 Performance Monitoring

```typescript
// src/lib/metrics.ts
class MetricsCollector {
  private metrics: Map<string, number[]> = new Map()

  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }

    const values = this.metrics.get(name)!
    values.push(value)

    // Keep only last 1000 values
    if (values.length > 1000) {
      values.shift()
    }
  }

  getStats(name: string) {
    const values = this.metrics.get(name)

    if (!values || values.length === 0) {
      return null
    }

    const sorted = [...values].sort((a, b) => a - b)

    return {
      count: values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    }
  }

  // Decorator for automatic metric collection
  instrument<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    metricName: string
  ): T {
    return (async (...args: any[]) => {
      const start = Date.now()

      try {
        const result = await fn(...args)
        this.recordMetric(metricName, Date.now() - start)
        return result
      } catch (error) {
        this.recordMetric(`${metricName}_error`, Date.now() - start)
        throw error
      }
    }) as T
  }
}

export const metrics = new MetricsCollector()

// Usage
const dbQuery = metrics.instrument(
  async (query: string) => {
    return await db.$queryRaw(query)
  },
  'database_query_time'
)
```

---

## 9. Deployment Architecture

### 9.1 Environment Configuration

```bash
# .env.production
# Database
DATABASE_URL_WRITE="postgresql://user:pass@primary-db:5432/library"
DATABASE_URL_READ="postgresql://user:pass@replica-db:5432/library"

# Redis
REDIS_HOST="redis-cluster"
REDIS_PORT="6379"
REDIS_PASSWORD="your-redis-password"

# JWT
JWT_SECRET="your-jwt-secret-key"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_EXPIRES_IN="7d"

# Storage
S3_BUCKET="library-files"
S3_REGION="ap-southeast-1"
S3_ACCESS_KEY="your-access-key"
S3_SECRET_KEY="your-secret-key"

# Application
NODE_ENV="production"
PORT="3000"
APP_URL="https://library.example.com"
CORS_ORIGIN="https://library.example.com,https://admin.library.example.com"

# Email (for notifications)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="noreply@library.example.com"
SMTP_PASS="your-smtp-password"

# Monitoring
SENTRY_DSN="your-sentry-dsn"
LOG_LEVEL="info"
```

### 9.2 Health Checks

```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {}
  }

  try {
    // Database check
    await db.$queryRaw`SELECT 1`
    checks.services.database = 'healthy'
  } catch (error) {
    checks.services.database = 'unhealthy'
    checks.status = 'degraded'
  }

  try {
    // Redis check
    await redis.ping()
    checks.services.redis = 'healthy'
  } catch (error) {
    checks.services.redis = 'unhealthy'
    checks.status = 'degraded'
  }

  // Storage check (S3)
  try {
    // Add S3 health check here
    checks.services.storage = 'healthy'
  } catch (error) {
    checks.services.storage = 'unhealthy'
    checks.status = 'degraded'
  }

  const statusCode = checks.status === 'healthy' ? 200 : 503

  return NextResponse.json(checks, { status: statusCode })
}
```

---

## 10. Best Practices Summary

### 10.1 Backend Best Practices

1. **Always use transactions for multi-step operations**
2. **Validate all inputs at the service layer**
3. **Implement proper error handling with meaningful messages**
4. **Use connection pooling for database connections**
5. **Implement caching for frequently accessed data**
6. **Log all critical operations and errors**
7. **Use prepared statements to prevent SQL injection**
8. **Sanitize all user inputs**
9. **Implement rate limiting on all public endpoints**
10. **Use environment variables for configuration**

### 10.2 Database Best Practices

1. **Use indexes for frequently queried columns**
2. **Normalize your data structure**
3. **Use foreign keys for referential integrity**
4. **Implement proper data types for each column**
5. **Use check constraints for data validation**
6. **Partition large tables if needed**
7. **Use database transactions for data consistency**
8. **Regularly backup your database**
9. **Monitor query performance**
10. **Use connection pooling**

### 10.3 Security Best Practices

1. **Never store passwords in plain text**
2. **Use HTTPS for all API calls**
3. **Implement proper authentication and authorization**
4. **Validate and sanitize all inputs**
5. **Use parameterized queries**
6. **Implement rate limiting**
7. **Keep dependencies updated**
8. **Use security headers**
9. **Log security-relevant events**
10. **Implement proper session management**

---

## 11. Migration Plan

### 11.1 From Current Schema to New Schema

```bash
# Phase 1: Add new columns (non-breaking)
bun prisma migrate dev --name add_audit_fields

# Phase 2: Create new tables
bun prisma migrate dev --name create_new_tables

# Phase 3: Migrate data
bun prisma migrate dev --name migrate_data

# Phase 4: Update application code
# - Update services to use new schema
# - Update API responses

# Phase 5: Remove old columns/tables (breaking)
bun prisma migrate dev --name remove_old_fields
```

---

## 12. Conclusion

Arsitektur ini dirancang untuk:

✅ **Scalability**: Mendukung pertumbuhan pengguna dan data
✅ **Security**: Proteksi komprehensif terhadap berbagai ancaman
✅ **Performance**: Caching, indexing, dan connection pooling
✅ **Maintainability**: Layered architecture yang terstruktur
✅ **Reliability**: Error handling, logging, dan monitoring
✅ **Flexibility**: Modular design untuk perubahan masa depan

Arsitektur ini dapat diimplementasikan secara bertahap sesuai kebutuhan proyek dan skalabilitas yang diinginkan.
