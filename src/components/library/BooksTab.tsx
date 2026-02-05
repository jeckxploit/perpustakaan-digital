'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Edit, Trash2, Search, CheckCircle } from 'lucide-react'
import { TableCardView } from '@/components/ui/TableCardView'

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

interface BooksTabProps {
  books: Book[]
  searchQuery: string
  onSearchChange: (query: string) => void
  onSaveBook: () => void
  onDeleteBook: (id: string) => void
  onEditBook: (book: Book) => void
  bookForm: Partial<Book>
  onBookFormChange: (form: Partial<Book>) => void
  isBookDialogOpen: boolean
  onBookDialogChange: (open: boolean) => void
  editingBook: Book | null
}

export function BooksTab({
  books,
  searchQuery,
  onSearchChange,
  onSaveBook,
  onDeleteBook,
  onEditBook,
  bookForm,
  onBookFormChange,
  isBookDialogOpen,
  onBookDialogChange,
  editingBook,
}: BooksTabProps) {
  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari buku..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isBookDialogOpen} onOpenChange={onBookDialogChange}>
          <DialogTrigger asChild>
            <Button className="shadow-lg hover:shadow-xl transition-shadow">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Buku
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingBook ? 'Edit Buku' : 'Tambah Buku Baru'}</DialogTitle>
              <DialogDescription>
                {editingBook ? 'Perbarui informasi buku' : 'Tambah buku baru ke perpustakaan'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Judul *</Label>
                <Input
                  id="title"
                  value={bookForm.title || ''}
                  onChange={(e) => onBookFormChange({ ...bookForm, title: e.target.value })}
                  placeholder="Masukkan judul buku"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="author">Penulis *</Label>
                  <Input
                    id="author"
                    value={bookForm.author || ''}
                    onChange={(e) => onBookFormChange({ ...bookForm, author: e.target.value })}
                    placeholder="Nama penulis"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Kategori *</Label>
                  <Input
                    id="category"
                    value={bookForm.category || ''}
                    onChange={(e) => onBookFormChange({ ...bookForm, category: e.target.value })}
                    placeholder="Fiksi, Non-fiksi, dll"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="stock">Stok *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={bookForm.stock || 0}
                    onChange={(e) => onBookFormChange({ ...bookForm, stock: parseInt(e.target.value) || 0 })}
                    placeholder="Jumlah salinan"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="isbn">ISBN</Label>
                  <Input
                    id="isbn"
                    value={bookForm.isbn || ''}
                    onChange={(e) => onBookFormChange({ ...bookForm, isbn: e.target.value })}
                    placeholder="ISBN (opsional)"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="publishedYear">Tahun Terbit</Label>
                  <Input
                    id="publishedYear"
                    type="number"
                    value={bookForm.publishedYear || ''}
                    onChange={(e) => onBookFormChange({ ...bookForm, publishedYear: parseInt(e.target.value) || undefined })}
                    placeholder="2024"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="publisher">Penerbit</Label>
                  <Input
                    id="publisher"
                    value={bookForm.publisher || ''}
                    onChange={(e) => onBookFormChange({ ...bookForm, publisher: e.target.value })}
                    placeholder="Nama penerbit"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={bookForm.description || ''}
                  onChange={(e) => onBookFormChange({ ...bookForm, description: e.target.value })}
                  rows={3}
                  placeholder="Deskripsi singkat buku"
                />
              </div>
            </div>
            <Button onClick={onSaveBook} className="w-full">
              <CheckCircle className="h-4 w-4 mr-2" />
              {editingBook ? 'Perbarui' : 'Simpan'}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Judul</TableHead>
                  <TableHead className="font-semibold">Penulis</TableHead>
                  <TableHead className="font-semibold">Kategori</TableHead>
                  <TableHead className="font-semibold">Stok</TableHead>
                  <TableHead className="font-semibold">Tersedia</TableHead>
                  <TableHead className="font-semibold">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBooks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      {searchQuery ? 'Buku tidak ditemukan' : 'Belum ada buku'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBooks.map((book) => (
                    <TableRow key={book.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">{book.title}</TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{book.category}</Badge>
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
                            size="sm"
                            onClick={() => onEditBook(book)}
                            className="hover:bg-primary/10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteBook(book.id)}
                            className="hover:bg-destructive/10 text-destructive"
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
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden">
        <TableCardView
          data={filteredBooks}
          renderItem={(book) => ({
            title: book.title,
            subtitle: book.author,
            status: {
              label: book.available > 0 ? 'Tersedia' : 'Habis',
              variant: book.available > 0 ? 'default' : 'destructive',
            },
            fields: [
              { label: 'Stok', value: `${book.available}/${book.stock}` },
              { label: 'Kategori', value: book.category },
            ],
            actions: {
              edit: () => onEditBook(book),
              delete: () => onDeleteBook(book.id),
            },
          })}
          emptyMessage={searchQuery ? 'Buku tidak ditemukan' : 'Belum ada buku'}
        />
      </div>
    </div>
  )
}
