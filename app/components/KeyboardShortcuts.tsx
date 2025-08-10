"use client"

import { useEffect } from 'react'

interface KeyboardShortcutsProps {
  onOpenAI: () => void
  onOpenSearch: () => void
  onOpenTerminal: () => void
  onOpenFiles: () => void
  onOpenSettings: () => void
  onOpenCalculator: () => void
  onOpenBrowser: () => void
  onTakeScreenshot: () => void
  onToggleTheme: () => void
  onShowShortcuts: () => void
  onLockScreen: () => void
  onMinimizeAll: () => void
  onMaximizeActive: () => void
  onCloseActive: () => void
  onSwitchDesktop: (desktop: number) => void
  onQuickNote: () => void
  onVolumeUp: () => void
  onVolumeDown: () => void
  onVolumeMute: () => void
}

export default function KeyboardShortcuts({
  onOpenAI,
  onOpenSearch,
  onOpenTerminal,
  onOpenFiles,
  onOpenSettings,
  onOpenCalculator,
  onOpenBrowser,
  onTakeScreenshot,
  onToggleTheme,
  onShowShortcuts,
  onLockScreen,
  onMinimizeAll,
  onMaximizeActive,
  onCloseActive,
  onSwitchDesktop,
  onQuickNote,
  onVolumeUp,
  onVolumeDown,
  onVolumeMute
}: KeyboardShortcutsProps) {
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey
      const isShift = e.shiftKey
      const isAlt = e.altKey
      
      // Prevent default browser shortcuts
      const shouldPreventDefault = () => {
        // Don't prevent if user is typing in an input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          return false
        }
        
        // Prevent specific combinations
        return (
          (isCtrl && e.key === ' ') ||
          (isCtrl && e.key === 'k') ||
          (isCtrl && isShift && e.key === 'I') ||
          (isAlt && e.key === 'Tab') ||
          (e.key === 'F11') ||
          (e.key === 'PrintScreen')
        )
      }

      if (shouldPreventDefault()) {
        e.preventDefault()
      }

      // AI Assistant
      if (isCtrl && e.key === ' ') {
        onOpenAI()
        return
      }

      // Global Search
      if (isCtrl && e.key === 'k') {
        onOpenSearch()
        return
      }

      // App Shortcuts
      if (isCtrl && isShift) {
        switch (e.key) {
          case 'T':
            onOpenTerminal()
            return
          case 'E':
            onOpenFiles()
            return
          case 'S':
            onOpenSettings()
            return
          case 'C':
            onOpenCalculator()
            return
          case 'B':
            onOpenBrowser()
            return
          case 'N':
            onQuickNote()
            return
        }
      }

      // System Shortcuts
      if (isCtrl && isAlt) {
        switch (e.key) {
          case 'l':
          case 'L':
            onLockScreen()
            return
          case 't':
          case 'T':
            onToggleTheme()
            return
          case 'm':
          case 'M':
            onMinimizeAll()
            return
        }
      }

      // Function Keys
      switch (e.key) {
        case 'F1':
          e.preventDefault()
          onShowShortcuts()
          return
        case 'F11':
          e.preventDefault()
          onMaximizeActive()
          return
        case 'PrintScreen':
          e.preventDefault()
          onTakeScreenshot()
          return
      }

      // Volume Controls
      if (e.key === 'VolumeUp') {
        onVolumeUp()
        return
      }
      if (e.key === 'VolumeDown') {
        onVolumeDown()
        return
      }
      if (e.key === 'VolumeMute') {
        onVolumeMute()
        return
      }

      // Desktop Switching (Alt + Number)
      if (isAlt && !isNaN(parseInt(e.key)) && parseInt(e.key) >= 1 && parseInt(e.key) <= 4) {
        onSwitchDesktop(parseInt(e.key))
        return
      }

      // Window Management
      if (isAlt) {
        switch (e.key) {
          case 'F4':
            onCloseActive()
            return
          case 'Tab':
            // Alt+Tab handling would go here
            // For now, we'll let the browser handle it
            break
        }
      }

      // Quick Actions
      if (isCtrl) {
        switch (e.key) {
          case '`':
            onOpenTerminal()
            return
          case ',':
            onOpenSettings()
            return
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      // Handle any key up events if needed
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [
    onOpenAI,
    onOpenSearch,
    onOpenTerminal,
    onOpenFiles,
    onOpenSettings,
    onOpenCalculator,
    onOpenBrowser,
    onTakeScreenshot,
    onToggleTheme,
    onShowShortcuts,
    onLockScreen,
    onMinimizeAll,
    onMaximizeActive,
    onCloseActive,
    onSwitchDesktop,
    onQuickNote,
    onVolumeUp,
    onVolumeDown,
    onVolumeMute
  ])

  return null // This component only handles events, no UI
}

// Keyboard shortcuts help component
export function ShortcutsHelp({ onClose }: { onClose: () => void }) {
  const shortcuts = [
    {
      category: "AI & Search",
      items: [
        { keys: ["Ctrl", "Space"], description: "Open AI Assistant" },
        { keys: ["Ctrl", "K"], description: "Global Search" },
      ]
    },
    {
      category: "Applications",
      items: [
        { keys: ["Ctrl", "Shift", "T"], description: "Open Terminal" },
        { keys: ["Ctrl", "Shift", "E"], description: "Open File Explorer" },
        { keys: ["Ctrl", "Shift", "S"], description: "Open Settings" },
        { keys: ["Ctrl", "Shift", "C"], description: "Open Calculator" },
        { keys: ["Ctrl", "Shift", "B"], description: "Open Browser" },
        { keys: ["Ctrl", "Shift", "N"], description: "Quick Note" },
      ]
    },
    {
      category: "System",
      items: [
        { keys: ["Ctrl", "Alt", "L"], description: "Lock Screen" },
        { keys: ["Ctrl", "Alt", "T"], description: "Toggle Theme" },
        { keys: ["Ctrl", "Alt", "M"], description: "Minimize All Windows" },
        { keys: ["F11"], description: "Maximize Active Window" },
        { keys: ["PrintScreen"], description: "Take Screenshot" },
      ]
    },
    {
      category: "Window Management",
      items: [
        { keys: ["Alt", "F4"], description: "Close Active Window" },
        { keys: ["Alt", "Tab"], description: "Switch Between Windows" },
      ]
    },
    {
      category: "Virtual Desktops",
      items: [
        { keys: ["Alt", "1-4"], description: "Switch to Desktop 1-4" },
      ]
    },
    {
      category: "Quick Access",
      items: [
        { keys: ["Ctrl", "`"], description: "Quick Terminal" },
        { keys: ["Ctrl", ","], description: "Quick Settings" },
        { keys: ["F1"], description: "Show This Help" },
      ]
    }
  ]

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="glass-card max-w-4xl w-full max-h-[80vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Keyboard Shortcuts</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shortcuts.map((category) => (
              <div key={category.category} className="space-y-3">
                <h3 className="text-lg font-semibold text-purple-400 border-b border-white/20 pb-2">
                  {category.category}
                </h3>
                <div className="space-y-2">
                  {category.items.map((shortcut, index) => (
                    <div key={index} className="flex justify-between items-center py-1">
                      <span className="text-gray-300 text-sm">{shortcut.description}</span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span
                            key={keyIndex}
                            className="px-2 py-1 bg-white/10 rounded text-xs text-white font-mono border border-white/20"
                          >
                            {key}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/20">
            <p className="text-gray-400 text-sm text-center">
              Press <span className="px-2 py-1 bg-white/10 rounded font-mono">F1</span> anytime to show this help
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
