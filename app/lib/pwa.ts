import React from 'react'

// PWA utilities for MominOS
export class PWAManager {
  private static instance: PWAManager
  private registration: ServiceWorkerRegistration | null = null

  static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager()
    }
    return PWAManager.instance
  }

  async init(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js')
        console.log('Service Worker registered successfully')
        
        // Listen for updates
        this.registration.addEventListener('updatefound', () => {
          const newWorker = this.registration?.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateNotification()
              }
            })
          }
        })
      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    }
  }

  private showUpdateNotification(): void {
    const notification = document.createElement('div')
    notification.className = 'fixed top-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50'
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <span>New version available!</span>
        <button onclick="location.reload()" class="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium">
          Update
        </button>
      </div>
    `
    document.body.appendChild(notification)

    setTimeout(() => {
      notification.remove()
    }, 10000)
  }

  // Installation prompt
  async showInstallPrompt(): Promise<boolean> {
    const beforeInstallPrompt = await this.getInstallPrompt()
    if (!beforeInstallPrompt) return false

    const userChoice = await beforeInstallPrompt.prompt()
    return userChoice.outcome === 'accepted'
  }

  private async getInstallPrompt(): Promise<any> {
    return new Promise((resolve) => {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault()
        resolve(e)
      })
      
      // Timeout after 5 seconds
      setTimeout(() => resolve(null), 5000)
    })
  }

  // Check if app is installed
  isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true
  }

  // Check if installation is available
  canInstall(): boolean {
    return !this.isInstalled() && 'serviceWorker' in navigator
  }

  // Share API
  async share(data: ShareData): Promise<boolean> {
    if (navigator.share) {
      try {
        await navigator.share(data)
        return true
      } catch (error) {
        console.error('Share failed:', error)
        return false
      }
    }
    
    // Fallback to clipboard
    if (navigator.clipboard && data.url) {
      try {
        await navigator.clipboard.writeText(data.url)
        return true
      } catch (error) {
        console.error('Clipboard write failed:', error)
      }
    }
    
    return false
  }

  // Offline detection
  isOnline(): boolean {
    return navigator.onLine
  }

  onOfflineStatusChange(callback: (isOnline: boolean) => void): () => void {
    const handler = () => callback(navigator.onLine)
    window.addEventListener('online', handler)
    window.addEventListener('offline', handler)
    
    return () => {
      window.removeEventListener('online', handler)
      window.removeEventListener('offline', handler)
    }
  }

  // Background sync
  async scheduleBackgroundSync(tag: string): Promise<void> {
    if (this.registration && 'sync' in this.registration) {
      try {
        await (this.registration as any).sync.register(tag)
      } catch (error) {
        console.error('Background sync registration failed:', error)
      }
    }
  }

  // Push notifications
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return await Notification.requestPermission()
    }
    return 'denied'
  }

  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (this.registration && Notification.permission === 'granted') {
      await this.registration.showNotification(title, {
        badge: '/icons/icon-72x72.png',
        icon: '/icons/icon-192x192.png',
        ...options
      })
    }
  }
}

// Utility functions
export const pwa = PWAManager.getInstance()

export function useInstallPrompt() {
  const [canInstall, setCanInstall] = React.useState(false)
  const [isInstalled, setIsInstalled] = React.useState(false)

  React.useEffect(() => {
    setCanInstall(pwa.canInstall())
    setIsInstalled(pwa.isInstalled())

    const handleBeforeInstallPrompt = () => {
      setCanInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  const install = async () => {
    const success = await pwa.showInstallPrompt()
    if (success) {
      setCanInstall(false)
      setIsInstalled(true)
    }
    return success
  }

  return { canInstall, isInstalled, install }
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = React.useState(true)

  React.useEffect(() => {
    setIsOnline(pwa.isOnline())
    return pwa.onOfflineStatusChange(setIsOnline)
  }, [])

  return isOnline
}
