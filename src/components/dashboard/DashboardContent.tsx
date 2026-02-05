'use client'

import { Book, BookOpen, Calendar, Users, Library, Tag, AlertCircle, CheckCircle, DollarSign } from 'lucide-react'
import { StatsCard } from '@/components/ui/StatsCard'
import { TrendChart, BarChartComponent } from '@/components/ui/Charts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface DashboardContentProps {
  books: any[]
  members: any[]
  borrowings: any[]
  ebooks: any[]
  monthlyStats?: any[]
  popularBooks?: any[]
}

export function DashboardContent({
  books,
  members,
  borrowings,
  ebooks,
  monthlyStats = [],
  popularBooks = [],
}: DashboardContentProps) {
  const activeBorrowings = borrowings.filter((b) => b.status === 'borrowed')
  const overdueBorrowings = borrowings.filter(
    (b) => b.status === 'borrowed' && new Date(b.dueDate) < new Date()
  )
  const totalStock = books.reduce((acc, b) => acc + b.stock, 0)
  const totalAvailable = books.reduce((acc, b) => acc + b.available, 0)
  const totalBorrowed = totalStock - totalAvailable
  const totalFines = borrowings.reduce((acc, b) => acc + (b.fine || 0), 0)
  const activeMembers = members.filter((m) => m.status === 'active').length
  const suspendedMembers = members.filter((m) => m.status === 'suspended').length

  // Prepare chart data
  const borrowingTrendData = monthlyStats.map((stat) => ({
    month: stat.month,
    borrowings: stat.borrowings || 0,
    returns: stat.returns || 0,
  }))

  const popularBooksData = (popularBooks || []).slice(0, 5).map((book) => ({
    title: book.title.length > 15 ? book.title.substring(0, 15) + '...' : book.title,
    borrowings: book.count || book.borrowings || 0,
  }))

  const categoryData = Array.from(new Set(books.map((b) => b.category))).map((category) => {
    const count = books.filter((b) => b.category === category).length
    const percentage = (count / books.length) * 100
    return {
      category,
      count,
      percentage,
    }
  })

  return (
    <div className="space-y-6">
      {/* Collection Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Library className="h-5 w-5 text-primary" />
          Koleksi Perpustakaan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Total Buku"
            value={books.length}
            icon={BookOpen}
            trend="+12%"
            color="primary"
            suffix="judul"
          />
          <StatsCard
            title="Total Salinan"
            value={totalStock}
            icon={Book}
            color="secondary"
            suffix="copy"
          />
          <StatsCard
            title="Salinan Tersedia"
            value={totalAvailable}
            icon={CheckCircle}
            color="success"
            suffix="copy"
          />
        </div>
      </div>

      {/* Borrowing Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-secondary" />
          Aktivitas Peminjaman
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard
            title="Peminjaman Aktif"
            value={activeBorrowings.length}
            icon={BookOpen}
            color="primary"
            suffix="buku"
          />
          <StatsCard
            title="Terlambat"
            value={overdueBorrowings.length}
            icon={AlertCircle}
            trend="-5%"
            color="error"
            urgent
            suffix="buku"
          />
          <StatsCard
            title="Dikembalikan"
            value={borrowings.filter((b) => b.returnDate).length}
            icon={CheckCircle}
            color="success"
            suffix="buku"
          />
          <StatsCard
            title="Total Denda"
            value={totalFines}
            format="currency"
            icon={DollarSign}
            color="warning"
          />
        </div>
      </div>

      {/* Member Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-accent-blue" />
          Statistik Anggota
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Total Anggota"
            value={members.length}
            icon={Users}
            color="accent-blue"
            suffix="orang"
          />
          <StatsCard
            title="Anggota Aktif"
            value={activeMembers}
            icon={CheckCircle}
            color="success"
            suffix="orang"
          />
          <StatsCard
            title="Ditangguhkan"
            value={suspendedMembers}
            icon={AlertCircle}
            color="error"
            suffix="orang"
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TrendChart
          data={borrowingTrendData}
          title="Tren Peminjaman"
          description="6 bulan terakhir"
          dataKey="borrowings"
          xAxisKey="month"
        />
        <BarChartComponent
          data={popularBooksData}
          title="Buku Terpopuler"
          description="Top 5 buku paling banyak dipinjam"
          dataKey="borrowings"
          xAxisKey="title"
          color="hsl(var(--secondary))"
        />
      </div>

      {/* Categories Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Distribusi Kategori Buku</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryData.map((item) => (
              <div key={item.category} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{item.category}</span>
                  <span className="text-muted-foreground">
                    {item.count} buku ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
