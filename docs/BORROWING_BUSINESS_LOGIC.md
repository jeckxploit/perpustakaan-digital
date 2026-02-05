# Alur Logika Sistem Peminjaman dan Pengembalian Buku
# Borrowing and Return Business Logic Flow

## 📋 Overview
Dokumentasi ini menjelaskan alur logika bisnis (business logic) untuk fitur peminjaman dan pengembalian buku pada Sistem Manajemen Perpustakaan Digital.

---

## 📦 Struktur Data (Data Model)

### 1. Model Buku (Book)
```typescript
{
  id: string           // Unique identifier
  title: string        // Judul buku
  author: string       // Penulis
  isbn: string?        // ISBN (unique)
  category: string     // Kategori
  stock: number        // Total stok buku
  available: number    // Stok tersedia untuk dipinjam
  publishedYear: number?
  publisher: string?
  description: string?
}
```

### 2. Model Anggota (Member)
```typescript
{
  id: string           // Unique identifier
  name: string         // Nama anggota
  memberId: string     // ID anggota (unique)
  email: string?       // Email (unique)
  phone: string?       // Nomor telepon
  address: string?     // Alamat
  status: string       // "active" atau "suspended"
  joinDate: DateTime   // Tanggal bergabung
}
```

### 3. Model Peminjaman (Borrowing)
```typescript
{
  id: string           // Unique identifier
  bookId: string       // Foreign key ke Book
  memberId: string     // Foreign key ke Member
  borrowDate: DateTime // Tanggal peminjaman
  dueDate: DateTime    // Tanggal harus dikembalikan
  returnDate: DateTime? // Tanggal pengembalian (null jika belum dikembalikan)
  status: string       // "borrowed", "returned", "overdue"
  fine: number         // Denda (dalam Rupiah)
  notes: string?       // Catatan tambahan
}
```

---

## 🔄 Alur Peminjaman Buku (Borrowing Flow)

### Langkah 1: Input Data Peminjaman
User (Librarian/Assistant) menginput:
- `bookId`: Buku yang dipinjam
- `memberId`: Anggota yang meminjam
- `dueDate`: Tanggal pengembalian yang diharapkan
- `notes` (opsional): Catatan tambahan

### Langkah 2: Validasi Input
**Lokasi:** `BorrowingService.create()` di `src/services/BorrowingService.ts`

```typescript
// 2.1 Validasi field wajib
if (!data.bookId || !data.memberId || !data.dueDate) {
  throw new ValidationError('Book ID, member ID, and due date are required')
}
```

### Langkah 3: Validasi Ketersediaan Buku
**Lokasi:** `BookService.getById()` dan `BorrowingService.create()`

```typescript
// 3.1 Cek apakah buku ada
const book = await bookService.getById(data.bookId)

// 3.2 Cek ketersediaan stok
if (book.available <= 0) {
  throw new ValidationError('Book is not available for borrowing')
}
```

**Logic:**
- Buku hanya bisa dipinjam jika `available > 0`
- `available` selalu ≤ `stock`
- `available = stock - (jumlah buku sedang dipinjam)`

### Langkah 4: Validasi Anggota
**Lokasi:** `MemberService.getById()` dan `MemberService.canBorrow()`

```typescript
// 4.1 Cek apakah anggota ada
const member = await memberService.getById(data.memberId)

// 4.2 Cek apakah anggota boleh meminjam
const canBorrow = await memberService.canBorrow(data.memberId)
if (!canBorrow.canBorrow) {
  throw new ValidationError(`Cannot borrow: ${canBorrow.reason}`)
}
```

**Validasi di `MemberRepository.canBorrow()`:**
1. **Status Anggota:**
   ```typescript
   if (member.status === 'suspended') {
     return { canBorrow: false, reason: 'Member is suspended' }
   }
   ```
   - Anggota yang `status = "suspended"` tidak bisa meminjam

2. **Batas Peminjaman (Default: 5 buku):**
   ```typescript
   const activeBorrowings = await prisma.borrowing.count({
     where: { memberId, status: 'borrowed' }
   })
   
   if (activeBorrowings >= maxBorrowings) {
     return { canBorrow: false, reason: 'Maximum borrowings reached' }
   }
   ```
   - Anggota maksimal bisa meminjam 5 buku sekaligus
   - Hanya menghitung peminjaman dengan `status = 'borrowed'`

### Langkah 5: Validasi Tanggal Pengembalian
**Lokasi:** `BorrowingService.create()`

```typescript
// 5.1 Tanggal harus di masa depan
const today = new Date()
const dueDate = new Date(data.dueDate)
if (dueDate <= today) {
  throw new ValidationError('Due date must be in the future')
}
```

```typescript
// 5.2 Maksimal 14 hari dari hari ini
const maxDays = 14
const maxDueDate = new Date(today)
maxDueDate.setDate(maxDueDate.getDate() + maxDays)

if (dueDate.getTime() > maxDueDate.getTime()) {
  throw new ValidationError(`Maximum borrowing period is ${maxDays} days`)
}
```

**Logic:**
- Due date harus > hari ini (tanggal peminjaman)
- Maksimal periode peminjaman: **14 hari**
- Perbandingan menggunakan `getTime()` untuk akurasi sampai milidetik

### Langkah 6: Membuat Record Peminjaman
**Lokasi:** `BorrowingRepository.create()`

```typescript
const borrowing = await borrowingRepository.create({
  book: { connect: { id: data.bookId } },
  member: { connect: { id: data.memberId } },
  dueDate: dueDate,
  notes: data.notes,
  status: 'borrowed',
  fine: 0,
})
```

**Field yang di-set:**
- `borrowDate`: Default `DateTime.now()` (tanggal hari ini)
- `dueDate`: Tanggal yang diinput user
- `status`: `'borrowed'`
- `fine`: 0

### Langkah 7: Update Stok Buku
**Lokasi:** `BookService.decreaseAvailable()`

```typescript
await bookService.decreaseAvailable(data.bookId)
```

**Logic di `BookRepository.updateAvailable()`:**
```typescript
async updateAvailable(id: string, change: number) {
  return prisma.book.update({
    where: { id },
    data: {
      available: {
        increment: change  // -1 untuk peminjaman
      }
    }
  })
}
```

**Hasil:**
- `book.available` berkurang 1
- `book.stock` tetap sama

### Langkah 8: Log Aktivitas
**Lokasi:** `ActivityLogService.log()`

```typescript
await activityLogService.log({
  adminId,
  adminName,
  action: 'borrow',
  entityType: 'borrowing',
  entityId: borrowing.id,
  entityName: `${book.title} - ${member.name}`,
  details: `Due: ${dueDate.toISOString().split('T')[0]}`,
})
```

**Informasi yang dicatat:**
- Admin yang melakukan peminjaman
- Action: `'borrow'`
- Detail: Judul buku, nama anggota, dan tanggal jatuh tempo

### Langkah 9: Return Result
```typescript
return borrowing  // Mengembalikan record peminjaman lengkap dengan relasi
```

---

## 🔄 Alur Pengembalian Buku (Return Flow)

### Langkah 1: Identifikasi Peminjaman
User menginput `borrowingId` dari peminjaman yang ingin dikembalikan

### Langkah 2: Validasi Status Peminjaman
**Lokasi:** `BorrowingService.returnBook()`

```typescript
const borrowing = await this.getById(id)

// Cek apakah sudah dikembalikan
if (borrowing.status === 'returned') {
  throw new ValidationError('Book has already been returned')
}
```

**Logic:**
- Peminjaman yang sudah `status = 'returned'` tidak bisa dikembalikan lagi
- Mencegah double return

### Langkah 3: Hitung Denda (Jika Terlambat)
**Lokasi:** `BorrowingRepository.returnBook()`

```typescript
const today = new Date()
const dueDate = new Date(borrowing.dueDate)
let fine = 0

if (today > dueDate) {
  const diffTime = Math.abs(today.getTime() - dueDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  fine = diffDays * 1000  // Rp 1000 per hari
}
```

**Perhitungan Denda:**
1. Jika `today > dueDate` → terlambat
2. Hitung selisih hari: `diffDays = ceil(|today - dueDate| in milliseconds / (24 hours))`
3. Denda = `diffDays × Rp 1000`

**Contoh:**
- Due date: 10 Januari 2025
- Return date: 13 Januari 2025
- Terlambat: 3 hari
- Denda: 3 × Rp 1000 = Rp 3000

### Langkah 4: Update Record Peminjaman
**Lokasi:** `BorrowingRepository.returnBook()`

```typescript
return prisma.borrowing.update({
  where: { id: id },
  data: {
    returnDate: today,
    status: 'returned',
    fine,
  },
  include: { book: true, member: true }
})
```

**Field yang di-update:**
- `returnDate`: Tanggal pengembalian (hari ini)
- `status`: `'returned'`
- `fine`: Jumlah denda (0 jika tidak terlambat)

### Langkah 5: Update Stok Buku
**Lokasi:** `BookService.increaseAvailable()`

```typescript
await bookService.increaseAvailable(borrowing.bookId)
```

**Logic:**
```typescript
async updateAvailable(id: string, change: number) {
  return prisma.book.update({
    where: { id },
    data: {
      available: {
        increment: change  // +1 untuk pengembalian
      }
    }
  })
}
```

**Hasil:**
- `book.available` bertambah 1
- `book.stock` tetap sama

### Langkah 6: Log Aktivitas
**Lokasi:** `ActivityLogService.log()`

```typescript
const fineText = updatedBorrowing.fine > 0 
  ? `Fine: ${updatedBorrowing.fine} IDR` 
  : 'No fine'

await activityLogService.log({
  adminId,
  adminName,
  action: 'return',
  entityType: 'borrowing',
  entityId: updatedBorrowing.id,
  entityName: `${borrowing.book.title} - ${borrowing.member.name}`,
  details: fineText,
})
```

**Informasi yang dicatat:**
- Admin yang melakukan pengembalian
- Action: `'return'`
- Detail: Judul buku, nama anggota, dan denda (jika ada)

### Langkah 7: Return Result
```typescript
return updatedBorrowing  // Mengembalikan record peminjaman yang sudah di-update
```

---

## ⚠️ Validasi dan Pembatasan (Constraints)

### Pembatasan Peminjaman (Borrowing Constraints)

1. **Ketersediaan Buku**
   - Buku hanya bisa dipinjam jika `available > 0`
   - Diperiksa sebelum pembuatan record peminjaman

2. **Status Anggota**
   - Anggota `status = 'suspended'` tidak bisa meminjam
   - Hanya anggota `status = 'active'` yang boleh meminjam

3. **Batas Jumlah Peminjaman**
   - Maksimal 5 buku per anggota
   - Hanya menghitung peminjaman aktif (`status = 'borrowed'`)

4. **Periode Peminjaman**
   - Due date harus > tanggal hari ini
   - Maksimal 14 hari dari tanggal peminjaman

5. **Unik Peminjaman**
   - Satu peminjaman hanya untuk satu buku dan satu anggota
   - Tidak ada validasi untuk mencegah anggota meminjam buku yang sama dua kali
   - (Bisa ditambahkan jika diperlukan)

### Pembatasan Pengembalian (Return Constraints)

1. **Status Sudah Dikembalikan**
   - Peminjaman `status = 'returned'` tidak bisa dikembalikan lagi
   - Mencegah double return

2. **Perhitungan Denda**
   - Denda dihitung otomatis berdasarkan keterlambatan
   - Rp 1000 per hari terlambat
   - Tidak ada batas maksimal denda

### Pembatasan Delete (Deletion Constraints)

**Untuk Buku:**
```typescript
// Cek buku dengan peminjaman aktif
const activeBorrowings = await prisma.borrowing.count({
  where: { bookId: id, status: 'borrowed' }
})

if (activeBorrowings > 0) {
  throw new ValidationError(
    'Cannot delete book with active borrowings. Return all books first.'
  )
}
```

**Untuk Anggota:**
```typescript
// Cek anggota dengan peminjaman aktif
const activeBorrowings = await prisma.borrowing.count({
  where: { memberId: id, status: 'borrowed' }
})

if (activeBorrowings > 0) {
  throw new ValidationError(
    'Cannot delete member with active borrowings. Return all books first.'
  )
}
```

---

## 🔄 Status Lifecycle Peminjaman

### 1. Status Flow
```
borrowed → returned
    ↓
overdue (jika due date < today dan masih borrowed)
```

### 2. Penjelasan Status
- **`borrowed`**: Peminjaman aktif, buku belum dikembalikan
- **`returned`**: Buku sudah dikembalikan
- **`overdue`**: Peminjaman aktif tapi melewati due date

### 3. Update Status Otomatis
**Lokasi:** `BorrowingService.updateOverdueStatus()`

```typescript
async updateOverdueStatus() {
  const overdue = await borrowingRepository.findOverdue()
  
  for (const borrowing of overdue) {
    await prisma.borrowing.update({
      where: { id: borrowing.id },
      data: { status: 'overdue' },
    })
  }
  
  return { updated: overdue.length }
}
```

**Logic:**
- Mendapatkan semua peminjaman yang `status = 'borrowed'` dan `dueDate < today`
- Mengupdate status menjadi `'overdue'`
- Fungsi ini harus dijalankan secara berkala (misalnya: setiap hari via cron job)

**Query findOverdue:**
```typescript
async findOverdue() {
  return prisma.borrowing.findMany({
    where: {
      status: 'borrowed',
      dueDate: { lt: new Date() }
    },
    include: { book: true, member: true },
    orderBy: { dueDate: 'asc' }
  })
}
```

---

## 📊 Query Lainnya (Additional Queries)

### 1. Mendapatkan Peminjaman Aktif
```typescript
async getActive() {
  return borrowingRepository.findActive()
}

// Query: status = 'borrowed'
```

### 2. Mendapatkan Peminjaman Terlambat
```typescript
async getOverdue() {
  return borrowingRepository.findOverdue()
}

// Query: status = 'borrowed' AND dueDate < today
```

### 3. Mendapatkan Histori Peminjaman Anggota
```typescript
async getMemberHistory(memberId: string) {
  return borrowingRepository.findByMemberId(memberId)
}

// Query: memberId = given_id, ORDER BY borrowDate DESC
```

### 4. Mendapatkan Statistik Peminjaman
```typescript
async getStats() {
  return borrowingRepository.getStats()
}

// Returns: { total, active, overdue, returned }
```

---

## 🔐 Logging dan Audit Trail

Semua operasi peminjaman dan pengembalian dicatat di Activity Log:

### Log Peminjaman
```typescript
{
  action: 'borrow',
  entityType: 'borrowing',
  entityName: '{book.title} - {member.name}',
  details: 'Due: {dueDate}'
}
```

### Log Pengembalian
```typescript
{
  action: 'return',
  entityType: 'borrowing',
  entityName: '{book.title} - {member.name}',
  details: 'Fine: {fine} IDR' or 'No fine'
}
```

---

## 🎯 Kesimpulan (Summary)

### Alur Peminjaman
1. Validasi input → 2. Cek ketersediaan buku → 3. Cek status anggota → 4. Cek batas peminjaman (5 buku) → 5. Validasi tanggal (max 14 hari) → 6. Create record peminjaman → 7. Kurangi stok buku → 8. Log aktivitas → 9. Return result

### Alur Pengembalian
1. Cek status peminjaman → 2. Hitung denda (Rp 1000/hari) → 3. Update record peminjaman → 4. Tambah stok buku → 5. Log aktivitas → 6. Return result

### Pembatasan Utama
- Maksimal 14 hari peminjaman
- Maksimal 5 buku per anggota
- Denda Rp 1000 per hari terlambat
- Anggota suspended tidak bisa meminjam
- Buku tidak tersedia tidak bisa dipinjam

Semua business logic ini sudah implement di:
- **Service Layer:** `BorrowingService.ts`, `BookService.ts`, `MemberService.ts`
- **Repository Layer:** `BorrowingRepository.ts`, `BookRepository.ts`, `MemberRepository.ts`
- **API Routes:** `/api/borrowings/*`, `/api/borrowings/[id]/return`

---

## 📍 Lokasi File Implementasi

- Business Logic: `src/services/BorrowingService.ts`
- Book Logic: `src/services/BookService.ts`
- Member Logic: `src/services/MemberService.ts`
- Repository: `src/repositories/BorrowingRepository.ts`
- Book Repository: `src/repositories/BookRepository.ts`
- Member Repository: `src/repositories/MemberRepository.ts`
- API Routes: `src/app/api/borrowings/route.ts`
- Return API: `src/app/api/borrowings/[id]/return/route.ts`
- Database Schema: `prisma/schema.prisma`
