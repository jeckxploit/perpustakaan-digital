'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { BookOpen, Moon, Sun, LogOut, Menu, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

interface HeaderProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
}

export function ResponsiveHeader({ activeTab, onTabChange }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const { admin, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { value: 'dashboard', label: 'Beranda', icon: BookOpen },
    { value: 'books', label: 'Buku', icon: BookOpen },
    { value: 'members', label: 'Anggota', icon: BookOpen },
    { value: 'borrowings', label: 'Peminjaman', icon: BookOpen },
    { value: 'ebooks', label: 'E-book', icon: BookOpen },
    { value: 'reports', label: 'Laporan', icon: BookOpen },
  ]

  const handleNavClick = (value: string) => {
    onTabChange?.(value)
    setMobileMenuOpen(false)
  }

  return (
    <>
      {/* Desktop Header */}
      <header className="sticky top-0 z-50 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md desktop-only">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              <div>
                <h1 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Perpustakaan Digital
                </h1>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 hidden md:block">
                  Sistem Manajemen Perpustakaan
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden lg:flex items-center gap-2 text-sm border-l-2 border-neutral-300 dark:border-neutral-700 pl-3">
                <span className="text-neutral-700 dark:text-neutral-300 font-medium truncate max-w-[150px]">
                  {admin?.name}
                </span>
                <span className="px-2 sm:px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium uppercase rounded whitespace-nowrap">
                  {admin?.role}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-10 w-10 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <Sun className="h-5 w-5 dark:hidden" />
                <Moon className="h-5 w-5 hidden dark:block" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => logout()}
                className="h-10 w-10 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="sticky top-0 z-50 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md mobile-only">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <div>
                <h1 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  PerpusDigital
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-9 w-9"
              >
                <Sun className="h-4 w-4 dark:hidden" />
                <Moon className="h-4 w-4 hidden dark:block" />
              </Button>
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[350px] p-0">
                  <SheetHeader className="border-b border-neutral-200 dark:border-neutral-800 pb-4 px-6 pt-6">
                    <SheetTitle className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {admin?.name?.charAt(0) || 'A'}
                        </span>
                      </div>
                      <div className="text-left">
                        <p className="text-base font-semibold">{admin?.name}</p>
                        <p className="text-xs text-neutral-500">{admin?.role}</p>
                      </div>
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="py-4 px-2">
                    {[
                      { value: 'dashboard', label: 'Beranda', icon: BookOpen },
                      { value: 'books', label: 'Buku', icon: BookOpen },
                      { value: 'members', label: 'Anggota', icon: BookOpen },
                      { value: 'borrowings', label: 'Peminjaman', icon: BookOpen },
                      { value: 'ebooks', label: 'E-book', icon: BookOpen },
                      { value: 'reports', label: 'Laporan', icon: BookOpen },
                    ].map((item) => (
                      <button
                        key={item.value}
                        onClick={() => handleNavClick(item.value)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors mb-1",
                          activeTab === item.value
                            ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                            : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </button>
                    ))}
                  </nav>
                  <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-200 dark:border-neutral-800 bg-background">
                    <Button
                      onClick={() => logout()}
                      variant="outline"
                      className="w-full justify-start gap-3 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="h-5 w-5" />
                      Logout
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
