'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Download, Smartphone, Share, Plus, Monitor, AlertCircle, Globe } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePWA } from '@/hooks/usePWA'

export function PWAInstallButton() {
  const { isInstalled, canInstall, install, hasPrompt } = usePWA()
  const [showInstructions, setShowInstructions] = useState(false)
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | 'unknown'>('unknown')

  useEffect(() => {
    if (isInstalled) return

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase()
    if (/ipad|iphone|ipod/.test(userAgent)) {
      setPlatform('ios')
    } else if (/android/.test(userAgent)) {
      setPlatform('android')
    } else if (/macos|windows|linux/.test(userAgent.toLowerCase())) {
      setPlatform('desktop')
    }
  }, [isInstalled])

  const handleInstallClick = () => {
    if (canInstall && hasPrompt) {
      install()
    } else {
      setShowInstructions(true)
    }
  }

  // Don't show if installed
  if (isInstalled) {
    return null
  }

  // Instructions Modal
  if (showInstructions) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowInstructions(false)}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="bg-background w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Install PerpusDigital
              </h3>
              <button onClick={() => setShowInstructions(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Important note about HTTPS */}
            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-2">
                <Globe className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    Syarat Install PWA
                  </p>
                  <ul className="text-xs text-amber-700 dark:text-amber-300 mt-1 space-y-1">
                    <li>• Website harus menggunakan HTTPS</li>
                    <li>• Atau localhost untuk development</li>
                    <li>• Tidak bisa install dari IP address (192.168.x.x)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Platform-specific instructions */}
            {platform === 'ios' && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                    <Share className="h-4 w-4" />
                    iPhone/iPad (Safari):
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">1</span>
                      <p className="text-sm">Tap tombol <strong>Share</strong> <Share className="h-4 w-4 inline"/></p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">2</span>
                      <p className="text-sm">Scroll ke bawah, tap <strong>"Add to Home Screen"</strong></p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">3</span>
                      <p className="text-sm">Tap <strong>"Add"</strong> di pojok kanan atas</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {platform === 'android' && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Android (Chrome):
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-green-600 flex items-center justify-center text-xs font-bold text-white">1</span>
                      <p className="text-sm">Tap menu <strong>⋮</strong> (titik tiga) di pojok kanan atas</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-green-600 flex items-center justify-center text-xs font-bold text-white">2</span>
                      <p className="text-sm">Pilih <strong>"Install app"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong></p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-green-600 flex items-center justify-center text-xs font-bold text-white">3</span>
                      <p className="text-sm">Tap <strong>"Install"</strong> untuk konfirmasi</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {platform === 'desktop' && (
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                  <p className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Desktop (Chrome/Edge):
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white">1</span>
                      <p className="text-sm">Lihat icon <Download className="h-4 w-4 inline"/> di kanan address bar</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white">2</span>
                      <p className="text-sm">Tap icon tersebut, lalu <strong>"Install"</strong></p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {platform === 'unknown' && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Browser tidak mendukung
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Gunakan Chrome, Edge, atau Safari terbaru untuk menginstall aplikasi.
                </p>
              </div>
            )}

            <div className="mt-4 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl">
              <p className="text-xs text-muted-foreground text-center">
                ✨ Aplikasi akan muncul di Home Screen setelah di-install
              </p>
            </div>

            <Button
              className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => setShowInstructions(false)}
            >
              Mengerti
            </Button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  // Hidden component - triggered by header button
  return (
    <button
      id="pwa-install-trigger"
      className="hidden"
      onClick={handleInstallClick}
      aria-label="Install PWA"
      data-can-install={canInstall}
    />
  )
}
