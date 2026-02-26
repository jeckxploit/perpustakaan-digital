'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'
import { 
  BookOpen, Users, Calendar, Book, FileText, 
  Moon, Sun, Plus, Edit, Trash2, Search, 
  Download, LogOut, Home, BarChart3, History, Shield,
  LayoutDashboard, TrendingUp, CheckCircle, AlertCircle, Clock, BookMarked, DollarSign, Library
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { ProfessionalStatCard } from '@/components/professional/ProfessionalStatCard'
import { ProfessionalEmptyState } from '@/components/professional/ProfessionalEmptyState'
import { ProfessionalSkeleton } from '@/components/professional/ProfessionalSkeleton'
import { ResponsiveHeader } from '@/components/ResponsiveHeader'

// Types
interface Book {
  id: string
  title: string
  author: string
  isbn?: string
  category: string
  stock: number
  available: number
  publishedYear?: number
  publisher?: string
  description?: string
}

interface Member {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  memberId: string
  status: string
  joinDate: string
}

interface Borrowing {
  id: string
  book: Book
  member: Member
  borrowDate: string
  dueDate: string
  returnDate?: string
  status: string
  fine: number
}

interface EBook {
  id: string
  title: string
  author: string
  category: string
  publishedYear?: number
  publisher?: string
  description?: string
  coverImage?: string
}

interface ActivityLog {
  id: string
  adminName: string
  action: string
  entityType: string
  entityName: string
  timestamp: string
}

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(email, password)
      toast({
        title: 'Login berhasil',
        description: 'Selamat datang di Sistem Perpustakaan Digital',
      })
    } catch (error: any) {
      toast({
        title: 'Login gagal',
        description: error.message || 'Email atau password salah',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-center space-x-3">
            <BookOpen className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-2xl">Perpustakaan Digital</CardTitle>
              <CardDescription>Login ke sistem</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@library.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Memproses...' : 'Login'}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
            <div className="flex items-start space-x-2">
              <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Akun Default:</p>
                <p className="text-sm text-muted-foreground">
                  Email: admin@library.com
                </p>
                <p className="text-sm text-muted-foreground">
                  Password: Admin123!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LibraryManagement() {
  const { theme, setTheme } = useTheme()
  const { admin, logout, isAuthenticated, isLoading: authLoading, token } = useAuth()
  const [mounted, setMounted] = useState(false)

  // Helper function for authenticated fetch
  const authFetch = async (url: string, options: RequestInit = {}) => {
    const headers: HeadersInit = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
    return fetch(url, { ...options, headers })
  }

  // Data states
  const [books, setBooks] = useState<Book[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [borrowings, setBorrowings] = useState<Borrowing[]>([])
  const [ebooks, setEbooks] = useState<EBook[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])

  // UI states
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false)
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false)
  const [isBorrowDialogOpen, setIsBorrowDialogOpen] = useState(false)
  const [isEbookDialogOpen, setIsEbookDialogOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [readingEbook, setReadingEbook] = useState<EBook | null>(null)
  const [loading, setLoading] = useState(true)

  // Form states
  const [bookForm, setBookForm] = useState<Partial<Book>>({})
  const [memberForm, setMemberForm] = useState<Partial<Member>>({})
  const [borrowForm, setBorrowForm] = useState<{ bookId?: string; memberId?: string }>({})
  const [ebookForm, setEbookForm] = useState<Partial<EBook>>({})

  // Reports data states
  const [popularBooks, setPopularBooks] = useState<any[]>([])
  const [activeMembers, setActiveMembers] = useState<any[]>([])
  const [monthlyStats, setMonthlyStats] = useState<any[]>([])
  const [reportData, setReportData] = useState<any>(null)
  const [reportsLoading, setReportsLoading] = useState(false)

  // Fetch data - start fetching immediately after authentication
  useEffect(() => {
    if (isAuthenticated) {
      setLoading(false) // Show dashboard immediately
      fetchData() // Load data in background
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated && activeTab === 'reports') {
      fetchReports()
    }
  }, [isAuthenticated, activeTab])

  const fetchData = async () => {
    try {
      const [booksRes, membersRes, borrowingsRes, ebooksRes, logsRes] = await Promise.all([
        authFetch('/api/books'),
        authFetch('/api/members'),
        authFetch('/api/borrowings'),
        authFetch('/api/ebooks'),
        authFetch('/api/activity-logs')
      ])

      if (booksRes.ok) setBooks(await booksRes.json())
      if (membersRes.ok) setMembers(await membersRes.json())
      if (borrowingsRes.ok) setBorrowings(await borrowingsRes.json())
      if (ebooksRes.ok) setEbooks(await ebooksRes.json())
      if (logsRes.ok) setActivityLogs(await logsRes.json())
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  // Fetch reports data
  const fetchReports = async () => {
    try {
      setReportsLoading(true)
      
      const [borrowingReportRes, popularBooksRes, activeMembersRes, monthlyStatsRes] = await Promise.all([
        authFetch('/api/reports/borrowing'),
        authFetch('/api/reports/popular-books?limit=5'),
        authFetch('/api/reports/active-members?limit=5'),
        authFetch('/api/reports/monthly?months=6'),
      ])

      if (borrowingReportRes.ok) setReportData(await borrowingReportRes.json())
      if (popularBooksRes.ok) setPopularBooks(await popularBooksRes.json())
      if (activeMembersRes.ok) setActiveMembers(await activeMembersRes.json())
      if (monthlyStatsRes.ok) setMonthlyStats(await monthlyStatsRes.json())
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setReportsLoading(false)
    }
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />
  }

  // Book operations
  const saveBook = async () => {
    try {
      const url = editingBook ? `/api/books/${editingBook.id}` : '/api/books'
      const method = editingBook ? 'PUT' : 'POST'

      const response = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookForm,
          available: bookForm.stock
        })
      })

      if (response.ok) {
        toast({
          title: editingBook ? 'Buku berhasil diperbarui' : 'Buku berhasil ditambahkan',
          variant: 'default'
        })
        setIsBookDialogOpen(false)
        setEditingBook(null)
        setBookForm({})
        fetchData()
      } else {
        toast({
          title: 'Gagal menyimpan buku',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Terjadi kesalahan',
        variant: 'destructive'
      })
    }
  }

  const deleteBook = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus buku ini?')) return

    try {
      const response = await authFetch(`/api/books/${id}`, { method: 'DELETE' })
      if (response.ok) {
        toast({ title: 'Buku berhasil dihapus' })
        fetchData()
      }
    } catch (error) {
      toast({ title: 'Gagal menghapus buku', variant: 'destructive' })
    }
  }

  // Member operations
  const saveMember = async () => {
    try {
      const url = editingMember ? `/api/members/${editingMember.id}` : '/api/members'
      const method = editingMember ? 'PUT' : 'POST'

      const response = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberForm)
      })

      if (response.ok) {
        toast({
          title: editingMember ? 'Anggota berhasil diperbarui' : 'Anggota berhasil ditambahkan',
          variant: 'default'
        })
        setIsMemberDialogOpen(false)
        setEditingMember(null)
        setMemberForm({})
        fetchData()
      }
    } catch (error) {
      toast({
        title: 'Terjadi kesalahan',
        variant: 'destructive'
      })
    }
  }

  const deleteMember = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus anggota ini?')) return

    try {
      const response = await authFetch(`/api/members/${id}`, { method: 'DELETE' })
      if (response.ok) {
        toast({ title: 'Anggota berhasil dihapus' })
        fetchData()
      }
    } catch (error) {
      toast({ title: 'Gagal menghapus anggota', variant: 'destructive' })
    }
  }

  // Borrowing operations
  const createBorrowing = async () => {
    if (!borrowForm.bookId || !borrowForm.memberId) {
      toast({ title: 'Pilih buku dan anggota', variant: 'destructive' })
      return
    }

    try {
      const response = await authFetch('/api/borrowings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(borrowForm)
      })

      if (response.ok) {
        toast({ title: 'Peminjaman berhasil dibuat' })
        setIsBorrowDialogOpen(false)
        setBorrowForm({})
        fetchData()
      } else {
        const data = await response.json()
        toast({ title: data.error || 'Gagal membuat peminjaman', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Terjadi kesalahan', variant: 'destructive' })
    }
  }

  const returnBook = async (borrowingId: string) => {
    try {
      const response = await authFetch(`/api/borrowings/${borrowingId}/return`, {
        method: 'POST'
      })

      if (response.ok) {
        toast({ title: 'Buku berhasil dikembalikan' })
        fetchData()
      }
    } catch (error) {
      toast({ title: 'Gagal mengembalikan buku', variant: 'destructive' })
    }
  }

  // E-book operations
  const saveEbook = async (file: File | null) => {
    if (!file) {
      toast({ title: 'Pilih file PDF', variant: 'destructive' })
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    Object.entries(ebookForm).forEach(([key, value]) => {
      formData.append(key, String(value))
    })

    try {
      const response = await authFetch('/api/ebooks', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        toast({ title: 'E-book berhasil ditambahkan' })
        setIsEbookDialogOpen(false)
        setEbookForm({})
        fetchData()
      } else {
        toast({ title: 'Gagal menambahkan e-book', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Terjadi kesalahan', variant: 'destructive' })
    }
  }

  // Filter functions
  const filteredBooks = books.filter(b =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.author.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.memberId.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeBorrowings = borrowings.filter(b => b.status === 'borrowed')
  const overdueBorrowings = borrowings.filter(b => b.status === 'borrowed' && new Date(b.dueDate) < new Date())

  // Stats
  const stats = {
    totalBooks: books.length,
    totalMembers: members.length,
    activeBorrowings: activeBorrowings.length,
    totalEbooks: ebooks.length,
    overdue: overdueBorrowings.length
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Responsive Header */}
      <ResponsiveHeader activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-8">
          {/* Tab Navigation - Modern Professional Design */}
          <TabsList className="w-full bg-transparent p-0 h-auto">
            {/* Mobile Tab Navigation */}
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-neutral-100/80 via-neutral-100/50 to-neutral-100/80 dark:from-neutral-800/80 dark:via-neutral-800/50 dark:to-neutral-800/80 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-700/50 rounded-xl p-1.5 overflow-x-auto mobile-only shadow-sm">
              {[
                { value: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
                { value: 'books', label: 'Buku', icon: Book },
                { value: 'members', label: 'Anggota', icon: Users },
                { value: 'borrowings', label: 'Peminjaman', icon: Calendar },
                { value: 'ebooks', label: 'E-book', icon: FileText },
                { value: 'reports', label: 'Laporan', icon: BarChart3 },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={`relative flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg transition-all duration-300 text-xs font-semibold whitespace-nowrap min-h-[42px] min-w-[46px] overflow-hidden ${
                    activeTab === tab.value
                      ? 'text-white shadow-lg'
                      : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60'
                  }`}
                >
                  {activeTab === tab.value && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg" />
                  )}
                  <tab.icon className={`h-4 w-4 relative z-10 ${activeTab === tab.value ? 'scale-110' : ''} transition-transform duration-300`} />
                  <span className="relative z-10">{tab.label}</span>
                </TabsTrigger>
              ))}
            </div>
            {/* Desktop Tab Navigation */}
            <div className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-neutral-100/80 via-neutral-100/50 to-neutral-100/80 dark:from-neutral-800/80 dark:via-neutral-800/50 dark:to-neutral-800/80 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-700/50 rounded-xl p-1.5 overflow-x-auto shadow-sm">
              {[
                { value: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
                { value: 'books', label: 'Buku', icon: Book },
                { value: 'members', label: 'Anggota', icon: Users },
                { value: 'borrowings', label: 'Peminjaman', icon: Calendar },
                { value: 'ebooks', label: 'E-book', icon: FileText },
                { value: 'reports', label: 'Laporan', icon: BarChart3 },
              ].map((tab, index) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={`relative flex items-center gap-2.5 px-5 py-3 rounded-lg transition-all duration-300 text-sm font-semibold whitespace-nowrap overflow-hidden group ${
                    activeTab === tab.value
                      ? 'text-white shadow-lg'
                      : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60'
                  }`}
                >
                  {activeTab === tab.value && (
                    <motion.div
                      layoutId="desktopTabIndicator"
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-md"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <tab.icon className={`h-4.5 w-4.5 relative z-10 transition-all duration-300 ${activeTab === tab.value ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="relative z-10">{tab.label}</span>
                </TabsTrigger>
              ))}
            </div>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4 sm:space-y-6">
            {/* Quick Actions Bar - Responsive */}
            <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <Button
                    onClick={() => setIsBookDialogOpen(true)}
                    className="h-16 sm:h-20 flex-col gap-2 text-base sm:text-lg w-full"
                  >
                    <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
                    Tambah Buku
                  </Button>
                  <Button
                    onClick={() => setIsBorrowDialogOpen(true)}
                    variant="secondary"
                    className="h-16 sm:h-20 flex-col gap-2 text-base sm:text-lg w-full"
                  >
                    <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
                    Peminjaman Baru
                  </Button>
                  <Button
                    onClick={() => setIsMemberDialogOpen(true)}
                    variant="outline"
                    className="h-16 sm:h-20 flex-col gap-2 text-base sm:text-lg w-full"
                  >
                    <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
                    Tambah Anggota
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Collection Stats */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Koleksi Perpustakaan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Buku</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{books.length}</div>
                    <p className="text-xs text-muted-foreground">judul buku</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Salinan</CardTitle>
                    <Book className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{books.reduce((acc, b) => acc + b.stock, 0)}</div>
                    <p className="text-xs text-muted-foreground">salinan fisik</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Salinan Tersedia</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{books.reduce((acc, b) => acc + b.available, 0)}</div>
                    <p className="text-xs text-muted-foreground">bisa dipinjam</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Borrowing Stats */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-secondary" />
                Aktivitas Peminjaman
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Peminjaman Aktif</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{borrowings.filter(b => b.status === 'borrowed').length}</div>
                    <p className="text-xs text-muted-foreground">buku sedang dipinjam</p>
                  </CardContent>
                </Card>
                <Card className="border-red-200 dark:border-red-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Terlambat</CardTitle>
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{borrowings.filter(b => b.status === 'borrowed' && new Date(b.dueDate) < new Date()).length}</div>
                    <p className="text-xs text-muted-foreground">buku melewati jatuh tempo</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Dikembalikan</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{borrowings.filter(b => b.returnDate).length}</div>
                    <p className="text-xs text-muted-foreground">total pengembalian</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Denda</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Rp {borrowings.reduce((acc, b) => acc + (b.fine || 0), 0).toLocaleString('id-ID')}</div>
                    <p className="text-xs text-muted-foreground">denda terkumpul</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Member Stats */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-accent-blue" />
                Statistik Anggota
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Anggota</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{members.length}</div>
                    <p className="text-xs text-muted-foreground">total terdaftar</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Anggota Aktif</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{members.filter(m => m.status === 'active').length}</div>
                    <p className="text-xs text-muted-foreground">bisa meminjam</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ditangguhkan</CardTitle>
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{members.filter(m => m.status === 'suspended').length}</div>
                    <p className="text-xs text-muted-foreground">akun dibekukan</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Charts Section */}
            {monthlyStats.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Tren Peminjaman</CardTitle>
                    <CardDescription>6 bulan terakhir</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {monthlyStats.map((stat, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          <div className="w-24 text-sm font-medium">{stat.month}</div>
                          <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-secondary rounded-lg transition-all"
                              style={{ width: `${Math.min((stat.borrowings || 0) / Math.max(...monthlyStats.map(s => s.borrowings || 0)) * 100, 100)}%` }}
                            />
                          </div>
                          <div className="w-16 text-sm text-right font-semibold">{stat.borrowings || 0}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                {popularBooks.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Buku Terpopuler</CardTitle>
                      <CardDescription>Top 5 buku paling banyak dipinjam</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {popularBooks.slice(0, 5).map((book, idx) => (
                          <div key={idx} className="flex items-center gap-4">
                            <div className="w-6 text-sm font-bold text-muted-foreground">#{idx + 1}</div>
                            <div className="flex-1 text-sm font-medium truncate">
                              {book.title}
                            </div>
                            <div className="w-16 text-sm text-right font-semibold">{book.count || book.borrowings || 0}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Categories Distribution */}
            {books.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Distribusi Kategori Buku</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from(new Set(books.map(b => b.category))).map((category) => {
                      const count = books.filter(b => b.category === category).length
                      const percentage = (count / books.length) * 100
                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{category}</span>
                            <span className="text-muted-foreground">
                              {count} buku ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="h-3 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Aktivitas Terbaru</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  {activityLogs.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">Belum ada aktivitas</p>
                  ) : (
                    <div className="space-y-4">
                      {activityLogs.slice(0, 10).map((log) => (
                        <div key={log.id} className="flex items-start gap-4 text-sm">
                          <div className={`p-2 rounded-full ${
                            log.action === 'create' ? 'bg-success/10 text-success' :
                            log.action === 'update' ? 'bg-primary/10 text-primary' :
                            'bg-error/10 text-error'
                          }`}>
                            {log.action === 'create' && <Plus className="h-4 w-4" />}
                            {log.action === 'update' && <Edit className="h-4 w-4" />}
                            {log.action === 'delete' && <Trash2 className="h-4 w-4" />}
                          </div>
                          <div className="flex-1">
                            <p>
                              <span className="font-medium">{log.adminName}</span> {' '}
                              {log.action === 'create' && 'membuat'}
                              {log.action === 'update' && 'memperbarui'}
                              {log.action === 'delete' && 'menghapus'} {' '}
                              <span className="font-medium">{log.entityName}</span>
                              {log.entityType && ` (${log.entityType})`}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {new Date(log.timestamp).toLocaleString('id-ID')}
                            </p>
                            {log.details && (
                              <p className="text-xs text-muted-foreground mt-1">{log.details}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Books Tab */}
          <TabsContent value="books" className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari buku..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Dialog open={isBookDialogOpen} onOpenChange={setIsBookDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Buku
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
                  <DialogHeader>
                    <DialogTitle>{editingBook ? 'Edit Buku' : 'Tambah Buku Baru'}</DialogTitle>
                    <DialogDescription>Isi informasi buku yang akan ditambahkan ke perpustakaan</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Judul Buku *</Label>
                      <Input
                        id="title"
                        value={bookForm.title || ''}
                        onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="author">Penulis *</Label>
                        <Input
                          id="author"
                          value={bookForm.author || ''}
                          onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="isbn">ISBN</Label>
                        <Input
                          id="isbn"
                          value={bookForm.isbn || ''}
                          onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Kategori *</Label>
                      <Input
                        id="category"
                        value={bookForm.category || ''}
                        onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="publishedYear">Tahun Terbit</Label>
                      <Input
                        id="publishedYear"
                        type="number"
                        value={bookForm.publishedYear || ''}
                        onChange={(e) => setBookForm({ ...bookForm, publishedYear: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="publisher">Penerbit</Label>
                      <Input
                        id="publisher"
                        value={bookForm.publisher || ''}
                        onChange={(e) => setBookForm({ ...bookForm, publisher: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="stock">Stok *</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={bookForm.stock || 0}
                        onChange={(e) => setBookForm({ ...bookForm, stock: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Deskripsi</Label>
                      <Textarea
                        id="description"
                        value={bookForm.description || ''}
                        onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>
                  <Button onClick={saveBook}>Simpan</Button>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <div className="min-w-[600px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Judul</TableHead>
                          <TableHead>Penulis</TableHead>
                          <TableHead>Kategori</TableHead>
                          <TableHead>Stok</TableHead>
                          <TableHead>Tersedia</TableHead>
                          <TableHead>Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBooks.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                              Tidak ada buku ditemukan
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredBooks.map((book) => (
                            <TableRow key={book.id}>
                              <TableCell className="font-medium">{book.title}</TableCell>
                              <TableCell>{book.author}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">{book.category}</Badge>
                              </TableCell>
                              <TableCell>{book.stock}</TableCell>
                              <TableCell>
                            <Badge variant={book.available > 0 ? 'default' : 'destructive'}>
                              {book.available}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingBook(book)
                                  setBookForm(book)
                                  setIsBookDialogOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteBook(book.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari anggota..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Anggota
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingMember ? 'Edit Anggota' : 'Tambah Anggota Baru'}</DialogTitle>
                    <DialogDescription>Isi informasi anggota baru</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nama Lengkap *</Label>
                      <Input
                        id="name"
                        value={memberForm.name || ''}
                        onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="memberId">ID Anggota *</Label>
                      <Input
                        id="memberId"
                        value={memberForm.memberId || ''}
                        onChange={(e) => setMemberForm({ ...memberForm, memberId: e.target.value })}
                        placeholder="Contoh: LIB001"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={memberForm.email || ''}
                        onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">No. Telepon</Label>
                      <Input
                        id="phone"
                        value={memberForm.phone || ''}
                        onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="address">Alamat</Label>
                      <Textarea
                        id="address"
                        value={memberForm.address || ''}
                        onChange={(e) => setMemberForm({ ...memberForm, address: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>
                  <Button onClick={saveMember}>Simpan</Button>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telepon</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tanggal Bergabung</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                          Tidak ada anggota ditemukan
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">{member.memberId}</TableCell>
                          <TableCell>{member.name}</TableCell>
                          <TableCell>{member.email || '-'}</TableCell>
                          <TableCell>{member.phone || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={member.status === 'active' ? 'default' : 'destructive'}>
                              {member.status === 'active' ? 'Aktif' : 'Ditangguhkan'}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(member.joinDate).toLocaleDateString('id-ID')}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingMember(member)
                                  setMemberForm(member)
                                  setIsMemberDialogOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteMember(member.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Borrowings Tab */}
          <TabsContent value="borrowings" className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold">Peminjaman & Pengembalian</h2>
              <Dialog open={isBorrowDialogOpen} onOpenChange={setIsBorrowDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Buat Peminjaman
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Buat Peminjaman Baru</DialogTitle>
                    <DialogDescription>Pilih buku dan anggota untuk peminjaman</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="book">Buku *</Label>
                      <Select onValueChange={(value) => setBorrowForm({ ...borrowForm, bookId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih buku" />
                        </SelectTrigger>
                        <SelectContent>
                          {books.filter(b => b.available > 0).map((book) => (
                            <SelectItem key={book.id} value={book.id}>
                              {book.title} - {book.author} ({book.available} tersedia)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="member">Anggota *</Label>
                      <Select onValueChange={(value) => setBorrowForm({ ...borrowForm, memberId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih anggota" />
                        </SelectTrigger>
                        <SelectContent>
                          {members.filter(m => m.status === 'active').map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name} ({member.memberId})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={createBorrowing}>Buat Peminjaman</Button>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Peminjaman Aktif</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Buku</TableHead>
                      <TableHead>Anggota</TableHead>
                      <TableHead>Tanggal Pinjam</TableHead>
                      <TableHead>Jatuh Tempo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeBorrowings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          Tidak ada peminjaman aktif
                        </TableCell>
                      </TableRow>
                    ) : (
                      activeBorrowings.map((borrowing) => (
                        <TableRow key={borrowing.id}>
                          <TableCell className="font-medium">{borrowing.book.title}</TableCell>
                          <TableCell>{borrowing.member.name}</TableCell>
                          <TableCell>{new Date(borrowing.borrowDate).toLocaleDateString('id-ID')}</TableCell>
                          <TableCell>{new Date(borrowing.dueDate).toLocaleDateString('id-ID')}</TableCell>
                          <TableCell>
                            <Badge variant={
                              new Date(borrowing.dueDate) < new Date() ? 'destructive' : 'default'
                            }>
                              {new Date(borrowing.dueDate) < new Date() ? 'Terlambat' : 'Aktif'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => returnBook(borrowing.id)}
                            >
                              <LogOut className="h-4 w-4 mr-2" />
                              Kembalikan
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Riwayat Pengembalian</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Buku</TableHead>
                      <TableHead>Anggota</TableHead>
                      <TableHead>Tanggal Pinjam</TableHead>
                      <TableHead>Tanggal Kembali</TableHead>
                      <TableHead>Denda</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {borrowings.filter(b => b.returnDate).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          Belum ada riwayat pengembalian
                        </TableCell>
                      </TableRow>
                    ) : (
                      borrowings.filter(b => b.returnDate).map((borrowing) => (
                        <TableRow key={borrowing.id}>
                          <TableCell className="font-medium">{borrowing.book.title}</TableCell>
                          <TableCell>{borrowing.member.name}</TableCell>
                          <TableCell>{new Date(borrowing.borrowDate).toLocaleDateString('id-ID')}</TableCell>
                          <TableCell>{new Date(borrowing.returnDate!).toLocaleDateString('id-ID')}</TableCell>
                          <TableCell>
                            {borrowing.fine > 0 ? (
                              <Badge variant="destructive">Rp {borrowing.fine.toLocaleString('id-ID')}</Badge>
                            ) : (
                              <Badge variant="secondary">Tidak ada</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* E-books Tab */}
          <TabsContent value="ebooks" className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold">E-books</h2>
              <Dialog open={isEbookDialogOpen} onOpenChange={setIsEbookDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah E-book
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl w-[95vw] sm:w-full">
                  <DialogHeader>
                    <DialogTitle>Upload E-book Baru</DialogTitle>
                    <DialogDescription>Upload file PDF untuk ditambahkan sebagai e-book</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="ebook-title">Judul *</Label>
                      <Input
                        id="ebook-title"
                        value={ebookForm.title || ''}
                        onChange={(e) => setEbookForm({ ...ebookForm, title: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="ebook-author">Penulis *</Label>
                        <Input
                          id="ebook-author"
                          value={ebookForm.author || ''}
                          onChange={(e) => setEbookForm({ ...ebookForm, author: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="ebook-category">Kategori *</Label>
                        <Input
                          id="ebook-category"
                          value={ebookForm.category || ''}
                          onChange={(e) => setEbookForm({ ...ebookForm, category: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="ebook-description">Deskripsi</Label>
                      <Textarea
                        id="ebook-description"
                        value={ebookForm.description || ''}
                        onChange={(e) => setEbookForm({ ...ebookForm, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="ebook-file">File PDF *</Label>
                      <Input
                        id="ebook-file"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setEbookForm({ ...ebookForm })
                            saveEbook(file)
                          }
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        File akan diupload secara otomatis saat dipilih
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ebooks.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  Belum ada e-book. Klik tombol "Tambah E-book" untuk memulai.
                </div>
              ) : (
                ebooks.map((ebook) => (
                  <Card key={ebook.id} className="overflow-hidden">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">{ebook.title}</CardTitle>
                          <CardDescription className="mt-1">{ebook.author}</CardDescription>
                        </div>
                        <FileText className="h-10 w-10 text-primary flex-shrink-0 ml-2" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {ebook.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {ebook.description}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Badge variant="secondary">{ebook.category}</Badge>
                        {ebook.publishedYear && (
                          <Badge variant="outline">{ebook.publishedYear}</Badge>
                        )}
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => setReadingEbook(ebook)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Baca Online
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Activity Logs Tab */}
          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Log Aktivitas Admin & Petugas</CardTitle>
                <CardDescription>Riwayat semua aktivitas sistem (Create, Update, Delete)</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  {activityLogs.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      Belum ada aktivitas yang dicatat
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activityLogs.map((log) => (
                        <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg">
                          <div className={`p-2 rounded-full ${
                            log.action === 'create' ? 'bg-green-100 text-green-600' :
                            log.action === 'update' ? 'bg-blue-100 text-blue-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {log.action === 'create' && <Plus className="h-4 w-4" />}
                            {log.action === 'update' && <Edit className="h-4 w-4" />}
                            {log.action === 'delete' && <Trash2 className="h-4 w-4" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{log.adminName}</span>
                              <Badge variant={
                                log.action === 'create' ? 'default' :
                                log.action === 'update' ? 'secondary' :
                                'destructive'
                              }>
                                {log.action}
                              </Badge>
                            </div>
                            <p className="text-sm">
                              {log.action === 'create' && 'membuat'}
                              {log.action === 'update' && 'memperbarui'}
                              {log.action === 'delete' && 'menghapus'} {' '}
                              <span className="font-medium">{log.entityName}</span>
                              {log.entityType && ` (${log.entityType})`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(log.timestamp).toLocaleString('id-ID')}
                            </p>
                            {log.details && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {log.details}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Laporan & Statistik</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Ringkasan Koleksi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Buku Fisik</span>
                    <span className="text-2xl font-bold">{books.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Salinan</span>
                    <span className="text-2xl font-bold">
                      {books.reduce((acc, b) => acc + b.stock, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Salinan Tersedia</span>
                    <span className="text-2xl font-bold text-green-600">
                      {books.reduce((acc, b) => acc + b.available, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Salinan Dipinjam</span>
                    <span className="text-2xl font-bold text-orange-600">
                      {books.reduce((acc, b) => acc + (b.stock - b.available), 0)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Peminjaman</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Peminjaman Aktif</span>
                    <span className="text-2xl font-bold">{activeBorrowings.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Peminjaman Terlambat</span>
                    <span className="text-2xl font-bold text-red-600">{overdueBorrowings.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Pengembalian</span>
                    <span className="text-2xl font-bold">
                      {borrowings.filter(b => b.returnDate).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Denda</span>
                    <span className="text-2xl font-bold">
                      Rp {borrowings.reduce((acc, b) => acc + b.fine, 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Anggota</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Anggota</span>
                    <span className="text-2xl font-bold">{members.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Anggota Aktif</span>
                    <span className="text-2xl font-bold text-green-600">
                      {members.filter(m => m.status === 'active').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Anggota Ditangguhkan</span>
                    <span className="text-2xl font-bold text-red-600">
                      {members.filter(m => m.status === 'suspended').length}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Koleksi Digital</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total E-books</span>
                    <span className="text-2xl font-bold">{ebooks.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Kategori Unik</span>
                    <span className="text-2xl font-bold">
                      {new Set(ebooks.map(e => e.category)).size}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Buku Berdasarkan Kategori</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.from(new Set(books.map(b => b.category))).map((category) => {
                    const count = books.filter(b => b.category === category).length
                    const percentage = (count / books.length) * 100
                    return (
                      <div key={category} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{category}</span>
                          <span>{count} buku ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* E-book Viewer Dialog */}
      <Dialog open={!!readingEbook} onOpenChange={() => setReadingEbook(null)}>
        <DialogContent className="max-w-6xl h-[80vh] w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>{readingEbook?.title}</DialogTitle>
            <DialogDescription>{readingEbook?.author}</DialogDescription>
          </DialogHeader>
          <div className="flex-1 h-full">
            <iframe
              src={`/api/ebooks/${readingEbook?.id}/view`}
              className="w-full h-full border rounded-lg"
              title="PDF Viewer"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-2 z-50">
        <div className="flex justify-around">
          {[
            { value: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
            { value: 'books', label: 'Buku', icon: BookOpen },
            { value: 'members', label: 'Anggota', icon: Users },
            { value: 'borrowings', label: 'Pinjam', icon: Calendar },
            { value: 'ebooks', label: 'E-book', icon: FileText },
            { value: 'reports', label: 'Laporan', icon: BarChart3 },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setActiveTab(item.value)}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                activeTab === item.value
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
