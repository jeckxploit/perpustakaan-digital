'use client'

import { useEffect, useState } from 'react'

export function usePWA() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [canInstall, setCanInstall] = useState(false)

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      const installed = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://')
      
      setIsInstalled(installed)
      return installed
    }

    checkInstalled()

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setCanInstall(true)
      console.log('PWA: Install prompt available')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Check periodically
    const interval = setInterval(checkInstalled, 2000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      clearInterval(interval)
    }
  }, [])

  const install = async () => {
    if (!deferredPrompt) {
      console.warn('PWA: Install not available')
      return false
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setIsInstalled(true)
      setCanInstall(false)
      setDeferredPrompt(null)
    }
    
    return outcome === 'accepted'
  }

  return {
    isInstalled,
    canInstall,
    install,
    hasPrompt: !!deferredPrompt,
  }
}
