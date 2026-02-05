'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { BookOpen, Users, Calendar, Book, FileText, BarChart3, CheckCircle, AlertCircle, DollarSign, Clock, Plus, Edit, Trash2 } from 'lucide-react'

interface DashboardTabProps {
  books: any[]
  members: any[]
  borrowings: any[]
  ebooks: any[]
  monthlyStats: any[]
  popularBooks: any[]
  activityLogs: any[]
  activeTab: string
  setActiveTab: (tab: string) => void
  setIsBookDialogOpen: (open: boolean) => void
  setIsBorrowDialogOpen: (open: boolean) => void
  setIsMemberDialogOpen: (open: boolean) => void
}

export function DashboardTab({
  books,
  members,
  borrowings,
  ebooks,
  monthlyStats,
  popularBooks,
  activityLogs,
  activeTab,
  setActiveTab,
  setIsBookDialogOpen,
  setIsBorrowDialogOpen,
  setIsMemberDialogOpen,
}: DashboardTabProps) {
  const activeBorrowings = borrowings.filter((b: any) => b.status === 'borrowed')
  const overdueBorrowings = borrowings.filter((b: any) => b.status === 'borrowed' && new Date(b.dueDate) < new Date())
  const totalStock = books.reduce((acc, b: any) => acc + b.stock, 0)
  const totalAvailable = books.reduce((acc, b: any) => acc + b.available, 0)
  const totalMembers = members.length
  const activeMembers = members.filter((m: any) => m.status === 'active').length
  const suspendedMembers = members.filter((m: any) => m.status === 'suspended').length
  const totalReturned = borrowings.filter((b: any) => b.returnDate).length
  const totalFines = borrowings.reduce((acc, b: any) => acc + (b.fine || 0), 0)
  const categoryData = Array.from(new Set(books.map((b: any) => b.category))).map((category) => {
    const count = books.filter((b: any) => b.category === category).length
    return { category, count, percentage: (count / books.length) * 100 }
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Collection Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          Koleksi Perpustakaan
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Kelola dan kelola buku digital dan fisik dalam satu sistem yang terpadu.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Books */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-professional"
            whileHover={{ y: -4 }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Book className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Buku Fisik
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Total Buku</span>
                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{books.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Total Salinan</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalStock}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Tersedia</span>
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totalAvailable}</span>
              </div>
            </div>
          </motion.div>

          {/* E-books */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-professional"
            whileHover={{ y: -4 }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              E-books
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Total Judul</span>
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{ebooks.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Ukuran Total</span>
                <span className="text-sm text-neutral-500">
                  {(ebooks.reduce((acc, e) => acc + (e.fileSize || 0), 0) / (1024 * 1024)).toFixed(1)} MB
                </span>
              </div>
            </div>
          </motion.div>

          {/* Members */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-professional"
            whileHover={{ y: -4 }}
          >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Anggota
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Total</span>
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totalMembers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Aktif</span>
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeMembers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Ditangguhkan</span>
                  <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{suspendedMembers}</span>
                </div>
              </div>
            </motion.div>
          </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-4"
        >
          <motion.button
            onClick={() => { setIsBookDialogOpen(true); setActiveTab('books') }}
            className="card-professional text-center cursor-pointer group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                Tambah
              </p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">Buku baru</p>
            </div>
          </motion.button>

          <motion.button
            onClick={() => { setIsBorrowDialogOpen(true); setActiveTab('borrowings') }}
            className="card-professional text-center cursor-pointer group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                Peminjaman
              </p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">Buku fisik baru</p>
            </div>
          </motion.button>

          <motion.button
            onClick={() => { setIsMemberDialogOpen(true); setActiveTab('members') }}
            className="card-professional text-center cursor-pointer group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                Tambah
              </p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">Anggota baru</p>
            </div>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Borrowing Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center gap-2">
          <Calendar className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
          Aktivitas Peminjaman
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-professional"
            whileHover={{ y: -4 }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />
              Peminjaman Aktif
            </h3>
            <div className="text-5xl font-bold text-secondary-600 dark:text-secondary-400">
              {activeBorrowings.length}
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Buku fisik yang sedang dipinjam
            </p>
          </motion.div>

          {/* Overdue */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-professional border-l-2 border-red-200 dark:border-red-800"
            whileHover={{ y: -4 }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              Terlambat
            </h3>
            <div className="text-5xl font-bold text-red-600 dark:text-red-400">
              {overdueBorrowings.length}
            </div>
            <p className="text-sm text-red-600 dark:text-red-400">
              Buku terlewati jatuh tempo
            </p>
          </motion.div>

          {/* Returned */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-professional"
            whileHover={{ y: -4 }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Dikembalikan
            </h3>
            <div className="text-5xl font-bold text-emerald-600 dark:text-emerald-400">
              {totalReturned}
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Buku yang sudah dikembalikan
            </p>
          </motion.div>

          {/* Fines */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-professional"
            whileHover={{ y: -4 }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              Total Denda
            </h3>
            <div className="text-5xl font-bold text-amber-600 dark:text-amber-400">
              Rp {totalFines.toLocaleString('id-ID')}
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Denda dari peminjaman terlambat
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-professional"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary dark:text-primary-400" />
            Aktivitas Terbaru
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab('logs')}
          >
            Lihat Semua
          </Button>
        </div>

        {activityLogs.length === 0 ? (
          <div className="text-center py-12 text-neutral-600 dark:text-neutral-400">
            <Clock className="h-12 w-12 text-neutral-600 dark:text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600 dark:text-neutral-400">Belum ada aktivitas yang tercatat</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activityLogs.slice(0, 10).map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-4 p-4 border-b border-neutral-200 dark:border-neutral-800"
              >
                <div className={`p-3 rounded-xl flex items-center justify-center shrink-0 ${
                  log.action === 'create'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30'
                    : log.action === 'update'
                    ? 'bg-blue-100 dark:bg-blue-900/30'
                    : 'bg-red-100 dark:bg-red-900/30'
                }`}>
                  {log.action === 'create' && <Plus className="h-4 w-4 text-white dark:text-emerald-300 dark:text-emerald-300" />}
                  {log.action === 'update' && <Edit className="h-4 w-4 text-white dark:text-blue-300 dark:text-blue-300" />}
                  {log.action === 'delete' && <Trash2 className="h-4 w-4 text-white dark:text-red-300 dark:text-red-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div>
                    <p className="text-sm font-medium text-white dark:text-gray-200">
                      {log.adminName}
                    </p>
                    <p className="text-xs text-white dark:text-gray-300 mt-1">
                      {log.action === 'create' && 'membuat'}
                      {log.action === 'update' && 'memperbarui'}
                      {log.action === 'delete' && 'menghapus'}
                    </p>
                    <span className="font-medium text-white dark:text-gray-100">
                      {log.entityName}
                    </span>
                  </div>
                  {log.entityType && (
                    <span className="text-xs text-white dark:text-gray-300">
                      {' '}({log.entityType})
                    </span>
                  )}
                </div>
                <div className="ml-auto text-right">
                  <span className="text-xs text-white dark:text-gray-300">
                    {new Date(log.timestamp).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
