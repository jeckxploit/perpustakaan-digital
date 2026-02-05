# 📚 Sistem Manajemen Perpustakaan Digital

Aplikasi manajemen perpustakaan digital modern dengan fitur lengkap untuk mengelola buku fisik, e-book, anggota, dan peminjaman.

## ✨ Fitur Utama

### 🔐 Authentication & Authorization
- **Role-Based Access Control** (3 role)
  - Super Admin - Full access
  - Librarian - Library operations
  - Assistant - Basic operations
- **Secure Login System**
  - PBKDF2 password hashing
  - JWT token authentication
  - Activity audit trail
- **Admin Management**
  - Create, update, delete admin accounts
  - Role assignment
  - Status management

### 📚 Books Management
- **Buku Fisik**
  - CRUD operations lengkap
  - Stock management
  - Availability tracking
  - Kategorisasi
  - Pencarian cepat
- **E-book System**
  - PDF upload dan storage
  - Online PDF viewer
  - File size tracking
  - Katalog e-book terpisah

### 👥 Members Management
- **Anggota**
  - Registrasi anggota baru
  - Status management (Active/Suspended)
  - Member ID generation
  - History peminjaman

### 📖 Borrowing System
- **Peminjaman**
  - Create borrowing records
  - Automatic due date calculation (7 hari)
  - Real-time availability check
- **Pengembalian**
  - Automatic fine calculation (Rp 500/hari)
  - Update book availability
  - Record return date
  - Fine payment tracking

### 📊 Reports & Analytics
- **Statistik Bulanan**
  - Borrowing trends
  - Return statistics
- **Popular Books**
  - Top borrowed books
- **Active Members**
  - Most active members ranking
- **Category Distribution**
  - Books per category analysis

### 📝 Activity Logs
- **Audit Trail**
  - Log semua admin activities
  - Track create, update, delete operations
  - Timestamp dan user tracking
  - IP address logging

### 🎨 UI/UX Features
- **Professional Design**
  - Modern academic color palette
  - Glassmorphism effects
  - Smooth animations (Framer Motion)
  - Custom scrollbars
- **Dark Mode**
  - Full dark/light theme support
  - Persistent theme preference
- **Responsive Design**
  - Mobile-first approach
  - Touch-friendly interactions
  - Mobile bottom navigation

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (New York style)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Toast**: sonner
- **Theme**: next-themes

### Backend
- **API**: Next.js API Routes
- **Database**: SQLite
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: PBKDF2 (crypto-js)

### Development
- **Package Manager**: Bun
- **Code Quality**: ESLint
- **Type Checking**: TypeScript Compiler

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ or Bun 1.0+
- Git

### Installation Steps

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/perpustakaan-digital.git
cd perpustakaan-digital

# Install dependencies
bun install

# Setup database
bun run db:push

# (Opsional) Seed database dengan data awal
bun run db:seed

# Start development server
bun run dev
```

### Available Scripts

```bash
# Development
bun run dev              # Start development server on port 3000
bun run lint             # Run ESLint
bun run build            # Build for production

# Database
bun run db:push          # Push schema changes ke database
bun run db:seed          # Seed database dengan sample data
bun run db:studio        # Open Prisma Studio
```

## 🚀 Usage

### Access Application
- Development: `http://localhost:3000`
- Default Email: `admin@library.com`
- Default Password: `Admin123!`

### First Steps After Login
1. **Tambah Admin/Staff**
   - Settings → Admin Management
   - Create librarian atau assistant accounts

2. **Import Books**
   - Books → Add Book
   - Enter book details

3. **Register Members**
   - Members → Add Member
   - Member ID akan otomatis dibuat

4. **Create Borrowing**
   - Borrowings → New Borrowing
   - Select book dan member

5. **Upload E-books**
   - E-books → Add E-book
   - Upload PDF file

## 📁 Project Structure

```
perpustakaan-digital/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts               # Database seeder
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── books/        # Books CRUD
│   │   │   ├── members/      # Members CRUD
│   │   │   ├── borrowings/   # Borrowing operations
│   │   │   ├── ebooks/       # E-book management
│   │   │   ├── reports/      # Analytics & reports
│   │   │   └── activity-logs/ # Audit trail
│   │   ├── globals.css        # Global styles
│   │   ├── professional.css   # Custom design system
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx          # Main application
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   └── professional/      # Custom components
│   ├── contexts/
│   │   └── AuthContext.tsx    # Auth state management
│   ├── hooks/
│   │   └── use-toast.ts       # Toast hook
│   └── lib/
│       └── db.ts              # Prisma client
├── public/                    # Static files
│   └── uploads/               # PDF uploads
├── docs/                      # Documentation
├── .gitignore                  # Git ignore rules
└── package.json                # Dependencies
```

## 🎯 Core Features Detail

### Books Management
- **Add Book**: ISBN, Title, Author, Category, Stock, Publisher, Year, Description
- **Edit Book**: Update semua field
- **Delete Book**: Hapus dengan konfirmasi
- **Stock Tracking**: Available stock = Total stock - Active borrowings

### Members Management
- **Add Member**: Name, Email, Phone, Address, Member ID (auto)
- **Update Member**: Ubah status (Active/Suspended)
- **Delete Member**: Hapus dengan konfirmasi
- **Status Check**: Suspended members tidak bisa meminjam

### Borrowing Flow
1. **Create Borrowing**
   - Select available book
   - Select active member
   - Due date auto: borrow date + 7 days
   - Stock decreases

2. **Return Book**
   - Calculate overdue days
   - Fine = overdue days × Rp 500
   - Stock increases
   - Record return date

### E-book System
- **Upload**: PDF file + metadata
- **View**: Inline PDF viewer dalam modal
- **Storage**: File disimpan di `/public/uploads/`
- **Size**: Track file size dalam MB

## 🎨 Design System

### Color Palette
- **Primary**: Professional Blue (#3b82f6)
- **Secondary**: Clean Teal (#0d9488)
- **Accent**: Indigo (#6366f1)
- **Success**: Green (#10b981)
- **Warning**: Amber (#f59e0b)
- **Error**: Red (#ef4444)

### Typography
- **Font**: Inter, system-ui
- **Weights**: 400, 500, 600, 700
- **Line Heights**: Optimized untuk readability

### Components
- **Cards**: Glassmorphism dengan hover effects
- **Buttons**: Primary, secondary, outline variants
- **Inputs**: Professional focus states
- **Tables**: Sticky headers, hover rows
- **Charts**: Animated data visualization

## 🔒 Security

- **Password Hashing**: PBKDF2 dengan 100,000 iterations
- **JWT Authentication**: Token-based auth dengan expiration
- **Role-Based Access**: RBAC dengan 3 roles
- **Activity Logging**: Semua aksi tercatat
- **Input Validation**: Zod schema validation
- **SQL Injection Protection**: Prisma parameterized queries

## 📊 Database Schema

### Tables
- `admins` - Admin accounts
- `books` - Physical books
- `members` - Library members
- `borrowings` - Borrowing records
- `ebooks` - E-books (PDF)
- `activity_logs` - Audit trail

### Relationships
- Book → Borrowings (One-to-Many)
- Member → Borrowings (One-to-Many)
- Admin → ActivityLogs (One-to-Many)

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - Login admin
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current admin

### Books
- `GET /api/books` - List all books
- `POST /api/books` - Create book
- `GET /api/books/[id]` - Get book
- `PUT /api/books/[id]` - Update book
- `DELETE /api/books/[id]` - Delete book

### Members
- `GET /api/members` - List all members
- `POST /api/members` - Create member
- `GET /api/members/[id]` - Get member
- `PUT /api/members/[id]` - Update member
- `DELETE /api/members/[id]` - Delete member

### Borrowings
- `GET /api/borrowings` - List all borrowings
- `POST /api/borrowings` - Create borrowing
- `GET /api/borrowings/[id]` - Get borrowing
- `PUT /api/borrowings/[id]` - Update borrowing
- `POST /api/borrowings/[id]/return` - Return book with fine calculation

### E-books
- `GET /api/ebooks` - List e-books
- `POST /api/ebooks` - Upload e-book (PDF)
- `GET /api/ebooks/[id]` - Get e-book
- `PUT /api/ebooks/[id]` - Update e-book
- `DELETE /api/ebooks/[id]` - Delete e-book
- `GET /api/ebooks/[id]/view` - View PDF inline

### Reports
- `GET /api/reports/overall` - Overall statistics
- `GET /api/reports/borrowing` - Borrowing trends
- `GET /api/reports/monthly?months=6` - Monthly stats
- `GET /api/reports/popular-books?limit=5` - Popular books
- `GET /api/reports/active-members?limit=5` - Active members

### Activity Logs
- `GET /api/activity-logs` - Get audit trail

## 🐛 Troubleshooting

### Database Issues
```bash
# Reset database
rm db/custom.db
bun run db:push
bun run db:seed
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
bun install
```

## 📝 Future Enhancements

### Phase 4 - Membership System
- Membership tiers (Gold, Silver, Bronze)
- Book reservation queue
- Member portal (public-facing)

### Phase 5 - Advanced Features
- Book reviews & ratings
- Recommendation system
- Email notifications
- Barcode/QR code support
- Advanced analytics dashboard

## 📄 License

MIT License - Free untuk use personal dan commercial projects.

## 👨 Author

Z User

## 🙏 Acknowledgments

- Next.js team untuk framework yang amazing
- shadcn untuk UI components yang beautiful
- Prisma team untuk ORM yang powerful

---

**Made with ❤️ for Libraries**
