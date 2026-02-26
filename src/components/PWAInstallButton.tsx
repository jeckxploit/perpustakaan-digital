'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Download, Smartphone, Share, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallUI, setShowInstallUI] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return
    }

    // Check if user dismissed
    const hasDismissed = localStorage.getItem('pwa-install-dismissed')
    if (hasDismissed === 'permanent') return

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(iOS)

    // Android/Chrome install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Show after a short delay
      setTimeout(() => setShowInstallUI(true), 2000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Listen for manual install request from header button
    const handleInstallRequest = () => {
      if (iOS) {
        setShowIOSInstructions(true)
      } else if (deferredPrompt) {
        handleInstall()
      } else {
        setShowInstallUI(true)
      }
    }

    window.addEventListener('pwa-install-request', handleInstallRequest)

    // Show iOS button after delay if not dismissed
    if (iOS && !hasDismissed) {
      const timer = setTimeout(() => {
        setShowInstallUI(true)
      }, 5000)
      return () => clearTimeout(timer)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('pwa-install-request', handleInstallRequest)
    }
  }, [deferredPrompt])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowInstallUI(false)
      setDeferredPrompt(null)
      localStorage.removeItem('pwa-install-dismissed')
    }
  }

  const handleDismiss = () => {
    setShowInstallUI(false)
    localStorage.setItem('pwa-install-dismissed', 'temporary')
  }

  const handleDismissPermanent = () => {
    setShowInstallUI(false)
    localStorage.setItem('pwa-install-dismissed', 'permanent')
  }

  // iOS Instructions Modal
  if (showIOSInstructions) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowIOSInstructions(false)}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="bg-background w-full max-w-md rounded-2xl p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Install di iPhone
              </h3>
              <button onClick={() => setShowIOSInstructions(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">1</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Tap tombol Share</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Tombol kotak dengan panah ke atas di Safari</p>
                </div>
                <Share className="h-6 w-6 text-blue-600 flex-shrink-0" />
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">2</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Scroll dan tap "Add to Home Screen"</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Tambahkan ke Layar Utama</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">3</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Tap "Add"</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Di pojok kanan atas</p>
                </div>
                <Plus className="h-5 w-5 text-blue-600 flex-shrink-0" />
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <p className="text-xs text-muted-foreground text-center">
                Setelah di-install, aplikasi akan muncul di Home Screen seperti aplikasi biasa
              </p>
            </div>

            <Button
              className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => setShowIOSInstructions(false)}
            >
              Mengerti
            </Button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  // Install UI Banner
  return (
    <AnimatePresence>
      {showInstallUI && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-32 left-3 right-3 sm:left-auto sm:right-4 sm:w-80 z-40"
        >
          <div className="bg-background/95 backdrop-blur-lg border border-border rounded-xl shadow-2xl overflow-hidden">
            {/* Gradient accent */}
            <div className="h-1 bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500" />

            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <Smartphone className="h-5 w-5 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground">
                    {isIOS ? 'Install Aplikasi' : 'Pasang PerpusDigital'}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isIOS 
                      ? 'Akses lebih cepat dari Home Screen' 
                      : 'Install untuk akses lebih cepat dan mudah'}
                  </p>

                  <div className="flex gap-2 mt-3">
                    {isIOS ? (
                      <Button
                        size="sm"
                        onClick={() => setShowIOSInstructions(true)}
                        className="h-9 flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <Share className="h-4 w-4 mr-1.5" />
                        Panduan Install
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={handleInstall}
                        className="h-9 flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <Download className="h-4 w-4 mr-1.5" />
                        Install
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDismiss}
                      className="h-9"
                    >
                      Nanti
                    </Button>
                  </div>
                </div>

                <button
                  onClick={handleDismissPermanent}
                  className="flex-shrink-0 p-1 rounded-lg hover:bg-muted transition-colors -mt-1 -mr-1"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
