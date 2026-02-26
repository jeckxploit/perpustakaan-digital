'use client'

import { Button } from '@/components/ui/button'
import { BookOpen, Moon, Sun, LogOut, Home, Book, Users, Calendar, FileText, BarChart3 } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface HeaderProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
}

const navItems = [
  { value: 'dashboard', label: 'Beranda', icon: Home },
  { value: 'books', label: 'Buku', icon: Book },
  { value: 'members', label: 'Anggota', icon: Users },
  { value: 'borrowings', label: 'Peminjaman', icon: Calendar },
  { value: 'ebooks', label: 'E-book', icon: FileText },
  { value: 'reports', label: 'Laporan', icon: BarChart3 },
]

export function ResponsiveHeader({ activeTab, onTabChange }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const { admin, logout } = useAuth()

  const handleNavClick = (value: string) => {
    onTabChange?.(value)
  }

  return (
    <>
      {/* Desktop Header - lg and above */}
      <header className="sticky top-0 z-50 border-b border-neutral-200/50 dark:border-neutral-800/50 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl hidden lg:block shadow-sm">
        {/* Gradient accent line */}
        <div className="h-0.5 bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500" />
        
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl blur-lg opacity-30" />
                <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  PerpusDigital
                </h1>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                  Sistem Manajemen Perpustakaan
                </p>
              </div>
            </motion.div>

            {/* Navigation */}
            <nav className="flex items-center gap-1.5 bg-neutral-100/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-xl p-1.5 border border-neutral-200/50 dark:border-neutral-700/50">
              {navItems.map((item, index) => {
                const isActive = activeTab === item.value
                const Icon = item.icon
                
                return (
                  <motion.button
                    key={item.value}
                    onClick={() => handleNavClick(item.value)}
                    className={cn(
                      "relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
                      isActive
                        ? "text-white"
                        : "text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50"
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-md"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                    <span className="relative flex items-center gap-2">
                      <Icon className={cn("h-4 w-4 transition-transform duration-300", isActive && "scale-110")} />
                      {item.label}
                    </span>
                  </motion.button>
                )
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* User Info Badge */}
              <div className="hidden xl:flex items-center gap-2.5 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-800/50">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {admin?.name?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    {admin?.name}
                  </span>
                  <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                    {admin?.role}
                  </span>
                </div>
              </div>

              {/* Theme Toggle */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="h-10 w-10 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-300"
                >
                  <AnimatePresence mode="wait">
                    {theme === 'dark' ? (
                      <motion.div
                        key="moon"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Moon className="h-5 w-5 text-blue-400" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="sun"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Sun className="h-5 w-5 text-amber-500" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>

              {/* Logout Button */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => logout()}
                  className="h-10 w-10 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile & Tablet Header - Below lg */}
      <header className="sticky top-0 z-50 border-b border-neutral-200/50 dark:border-neutral-800/50 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl lg:hidden shadow-sm">
        {/* Gradient accent line */}
        <div className="h-0.5 bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500" />

        <div className="container mx-auto px-3 sm:px-4 py-2.5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              className="flex items-center gap-2 sm:gap-2.5"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg blur-md opacity-30" />
                <div className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md">
                  <BookOpen className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  PerpusDigital
                </h1>
              </div>
            </motion.div>

            {/* Actions - Theme toggle */}
            <div className="flex items-center gap-1.5">
              {/* Theme Toggle */}
              <motion.div
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg"
                >
                  <AnimatePresence mode="wait">
                    {theme === 'dark' ? (
                      <motion.div
                        key="moon"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                      >
                        <Moon className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-blue-400" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="sun"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                      >
                        <Sun className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-amber-500" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
