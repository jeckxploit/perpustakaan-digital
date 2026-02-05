# Entity Relationship Diagram (ERD)
# Sistem Manajemen Perpustakaan Digital

---

## Interactive ERD Diagram

```mermaid
erDiagram
    %% Users & Roles
    Admin ||--o{ ActivityLog : creates
    Admin {
        string id PK
        string name
        string email UK
        string passwordHash
        AdminRole role
        UserStatus status
        datetime lastLoginAt
        string lastLoginIp
        datetime createdAt
        datetime updatedAt
    }

    %% Books
    Book ||--o{ Borrowing : "is borrowed"
    Book {
        string id PK
        string title
        string author
        string isbn UK
        string category
        int stock
        int available
        int publishedYear
        string publisher
        text description
        string coverImage
        string location
        int totalBorrows
        float rating
        int reviewCount
        BookStatus status
        datetime createdAt
        datetime updatedAt
    }

    %% E-books
    EBook {
        string id PK
        string title
        string author
        string isbn UK
        string category
        string pdfPath
        int fileSize
        string coverImage
        int publishedYear
        string publisher
        text description
        int viewCount
        int downloadCount
        BookStatus status
        datetime createdAt
        datetime updatedAt
    }

    %% Members
    Member ||--o{ Borrowing : "has borrowings"
    Member ||--o{ FinePayment : "makes payments"
    Member {
        string id PK
        string memberId UK
        string name
        string email UK
        string phone
        text address
        UserStatus status
        datetime joinDate
        datetime suspensionStart
        datetime suspensionEnd
        text notes
        datetime createdAt
        datetime updatedAt
    }

    %% Borrowings
    Borrowing ||--|| Book : "references"
    Borrowing ||--|| Member : "references"
    Borrowing ||--o{ FinePayment : "generates fines"
    Borrowing {
        string id PK
        string bookId FK
        string memberId FK
        datetime borrowDate
        datetime dueDate
        datetime returnDate
        BorrowingStatus status
        float fine
        text notes
        string processedBy
        datetime createdAt
        datetime updatedAt
    }

    %% Fine Payments
    FinePayment ||--|| Borrowing : "references"
    FinePayment ||--|| Member : "references"
    FinePayment {
        string id PK
        string borrowingId FK
        string memberId FK
        float amount
        datetime paymentDate
        PaymentMethod method
        string reference
        string processedBy
        text notes
        datetime createdAt
    }

    %% Activity Logs
    ActivityLog }o--|| Admin : "references"
    ActivityLog {
        string id PK
        string adminId FK
        string adminName
        ActionType action
        string entityType
        string entityId
        string entityName
        text details
        string ipAddress
        string userAgent
        datetime timestamp
    }

    %% Reports
    Report {
        string id PK
        ReportType type
        string title
        text description
        datetime startDate
        datetime endDate
        json data
        string generatedBy
        datetime createdAt
    }

    %% Enums
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

    enum BookStatus {
        ACTIVE
        DAMAGED
        LOST
        ARCHIVED
    }

    enum BorrowingStatus {
        BORROWED
        RETURNED
        OVERDUE
        CANCELLED
    }

    enum PaymentMethod {
        CASH
        TRANSFER
        E_WALLET
        CARD
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

    enum ReportType {
        DAILY
        WEEKLY
        MONTHLY
        YEARLY
        CUSTOM
    }
```

---

## Database Relationships Explained

### 1. Admin & Activity Logs (One-to-Many)
- One admin can create many activity logs
- Activity log can optionally reference an admin
- Important for audit trail and accountability

### 2. Member & Borrowings (One-to-Many)
- One member can have multiple borrowings
- Supports history tracking and active borrowings
- Enables fine calculation per member

### 3. Book & Borrowings (One-to-Many)
- One book can be borrowed multiple times over time
- Enables tracking of popular books (totalBorrows)
- Maintains current availability (available count)

### 4. Borrowing & Fine Payments (One-to-Many)
- One borrowing can generate multiple fine payments
- Allows partial payments or payment plans
- Tracks payment history for accountability

### 5. Borrowing & Book/Member (Many-to-One)
- Each borrowing references exactly one book
- Each borrowing references exactly one member
- Enforces referential integrity

---

## Key Design Decisions

### 1. Why Separate Books and E-books?

**Books (Physical):**
- Need stock tracking
- Need location (shelf) information
- Physical condition status (damaged, lost)
- Borrowing workflow with due dates

**E-books (Digital):**
- No stock limitation
- View/download tracking
- PDF file storage
- Online reading capability

### 2. Why Include Fine Payments as Separate Entity?

**Benefits:**
- Complete payment history per borrowing
- Support for partial payments
- Different payment methods tracking
- Financial audit trail
- Revenue reporting

### 3. Why Activity Logs Include adminName?

**Benefits:**
- Historical accuracy even if admin is deleted
- Quick search by name without join
- Audit trail maintains integrity
- GDPR compliance concerns (can anonymize)

### 4. Why Use Status Fields Instead of Deleting Records?

**Benefits:**
- Soft delete for data integrity
- Historical tracking (what was, what is)
- Audit trail preservation
- Ability to restore deleted records
- Analytics on deleted items

### 5. Why Include suspensionStart/End in Member?

**Benefits:**
- Automatic suspension expiration
- Temporal suspension tracking
- Audit trail of suspensions
- Easy query: who is currently suspended?

---

## Data Integrity Constraints

### 1. Check Constraints

```sql
-- Book constraints
ALTER TABLE books ADD CONSTRAINT chk_book_stock
  CHECK (stock >= 0 AND available >= 0 AND available <= stock);

-- Member ID format
ALTER TABLE members ADD CONSTRAINT chk_member_id_format
  CHECK (member_id ~ '^LIB[0-9]{3,6}$');

-- Borrowing dates
ALTER TABLE borrowings ADD CONSTRAINT chk_borrowing_dates
  CHECK (dueDate > borrowDate);

-- Fine amount
ALTER TABLE borrowings ADD CONSTRAINT chk_fine_amount
  CHECK (fine >= 0);

-- Payment amount
ALTER TABLE fine_payments ADD CONSTRAINT chk_payment_amount
  CHECK (amount > 0);
```

### 2. Trigger-Based Constraints

```sql
-- Auto-update borrowing status
CREATE TRIGGER update_borrowing_status
  BEFORE INSERT OR UPDATE ON borrowings
  FOR EACH ROW EXECUTE FUNCTION update_borrowing_status();

-- Auto-calculate overdue status
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

-- Auto-update book available count
CREATE OR REPLACE FUNCTION update_book_available()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE books SET available = available - 1 WHERE id = NEW.bookId;
  ELSIF TG_OP = 'UPDATE' AND OLD.returnDate IS NULL AND NEW.returnDate IS NOT NULL THEN
    UPDATE books SET available = available + 1 WHERE id = NEW.bookId;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## Indexing Strategy

### Primary Indexes
- All `id` fields (clustered by default)
- All `email` fields (for auth lookups)
- All `isbn` fields (unique book identification)

### Secondary Indexes
- **Books:**
  - `title, author` (composite for search)
  - `category, status` (filtered queries)
  - `status` (for active books list)
  - `publishedYear` (for year-based reports)

- **Members:**
  - `memberId` (for quick lookups)
  - `email` (for login)
  - `status` (for active members list)

- **Borrowings:**
  - `bookId, status` (book availability check)
  - `memberId, status` (member's active loans)
  - `dueDate` (overdue detection)
  - `borrowDate` (recent activity)

- **Activity Logs:**
  - `adminId, timestamp DESC` (user activity)
  - `entityType, timestamp DESC` (entity history)
  - `timestamp DESC` (recent activity)

### Partial Indexes (PostgreSQL)
```sql
-- Active borrowings only
CREATE INDEX idx_borrowings_active
  ON borrowings(dueDate)
  WHERE status = 'BORROWED';

-- Overdue borrowings
CREATE INDEX idx_borrowings_overdue
  ON borrowings(dueDate)
  WHERE status = 'BORROWED' AND dueDate < NOW();

-- Active members only
CREATE INDEX idx_members_active
  ON members(joinDate DESC)
  WHERE status = 'ACTIVE';
```

### Full-Text Search Indexes
```sql
-- Books full-text search
CREATE INDEX idx_books_search
  ON books USING GIN (to_tsvector('indonesian', title || ' ' || author));

-- E-books full-text search
CREATE INDEX idx_ebooks_search
  ON ebooks USING GIN (to_tsvector('indonesian', title || ' ' || author));
```

---

## Normalization Level: 3NF (Third Normal Form)

### 1NF (First Normal Form)
- All columns have atomic values
- No repeating groups
- Each row is unique

### 2NF (Second Normal Form)
- In 1NF
- All non-key attributes fully depend on primary key

### 3NF (Third Normal Form)
- In 2NF
- No transitive dependencies
- All non-key attributes depend only on the primary key

### Example: Why 3NF?

**Before (Not 3NF):**
```sql
members (
  id,
  name,
  email,
  city,
  province,
  postal_code  -- Postal code determines city & province
)
```

**After (3NF):**
```sql
members (
  id,
  name,
  email,
  location_id FK
)

locations (
  id,
  city,
  province,
  postal_code
)
```

**Decision:**
For simplicity in this library system, we keep address as a single text field in members table, as detailed address hierarchy is not critical for the library use case.

---

## Data Volume Estimates

| Table | Records/Year | Growth Rate | 5-Year Estimate |
|-------|---------------|--------------|-----------------|
| Admin | 5 | Low | 25 |
| Member | 500 | Medium | 2,500 |
| Book | 1,000 | Low | 5,000 |
| E-book | 200 | Medium | 1,000 |
| Borrowing | 5,000 | Medium | 25,000 |
| FinePayment | 1,000 | Low | 5,000 |
| ActivityLog | 50,000 | High | 250,000 |
| Report | 1,000 | Medium | 5,000 |

**Total 5-year estimate:** ~293,550 records

This volume is easily handled by PostgreSQL with proper indexing.
