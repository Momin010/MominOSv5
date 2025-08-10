
"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Home, Search, Grid3X3, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface MobileLayoutProps {
  children: React.ReactNode
  apps: any[]
  onAppOpen: (appId: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export default function MobileLayout({
  children,
  apps,
  onAppOpen,
  searchQuery,
  onSearchChange
}: MobileLayoutProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }

    handleOrientationChange()
    window.addEventListener('resize', handleOrientationChange)
    return () => window.removeEventListener('resize', handleOrientationChange)
  }, [])

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Mobile Status Bar */}
      <div className="h-6 bg-black/20 flex items-center justify-between px-4 text-white text-xs">
        <span>MominOS Mobile</span>
        <div className="flex items-center gap-2">
          <span>12:34</span>
          <div className="flex gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-1 h-3 bg-white/60 rounded-full" />
            ))}
          </div>
          <div className="w-6 h-3 border border-white/60 rounded-sm">
            <div className="w-4 h-2 bg-green-500 rounded-sm m-0.5" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        {children}

        {/* Mobile App Grid Overlay */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              className="absolute inset-0 bg-black/80 backdrop-blur-lg z-50"
            >
              <div className="p-4 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white text-xl font-bold">Apps</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMobileMenu(false)}
                    className="text-white"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>

                {/* Search */}
                <div className="mb-4">
                  <Input
                    placeholder="Search apps..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </div>

                {/* App Grid */}
                <div className={`grid gap-4 flex-1 overflow-y-auto ${
                  orientation === 'portrait' ? 'grid-cols-4' : 'grid-cols-6'
                }`}>
                  {apps.map((app) => (
                    <motion.button
                      key={app.id}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/10 hover:bg-white/20"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        onAppOpen(app.id)
                        setShowMobileMenu(false)
                      }}
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white"
                           style={{ background: `linear-gradient(to bottom right, var(--${app.color}))` }}>
                        <app.icon className="w-6 h-6" />
                      </div>
                      <span className="text-white text-xs text-center">{app.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="h-16 bg-black/30 backdrop-blur-lg border-t border-white/10 flex items-center justify-around px-4">
        <Button
          variant="ghost"
          size="sm"
          className="flex flex-col items-center text-white/70 hover:text-white"
          onClick={() => setShowMobileMenu(false)}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs">Home</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="flex flex-col items-center text-white/70 hover:text-white"
        >
          <Search className="w-5 h-5" />
          <span className="text-xs">Search</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="flex flex-col items-center text-white/70 hover:text-white"
          onClick={() => setShowMobileMenu(true)}
        >
          <Grid3X3 className="w-5 h-5" />
          <span className="text-xs">Apps</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="flex flex-col items-center text-white/70 hover:text-white"
          onClick={() => onAppOpen('settings')}
        >
          <Settings className="w-5 h-5" />
          <span className="text-xs">Settings</span>
        </Button>
      </div>
    </div>
  )
}
