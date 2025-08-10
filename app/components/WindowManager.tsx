"use client"

import React, { useCallback, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Minimize2, Maximize2, X } from 'lucide-react'

interface Window {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  x: number
  y: number
  width: number
  height: number
  minimized: boolean
  maximized: boolean
  component: React.ComponentType
  snapped?: "left" | "right" | null
  isResizing?: boolean
}

type SnapZone = "left-half" | "right-half" | "maximize"

interface WindowManagerProps {
  windows: Window[]
  activeWindow: string | null
  onWindowUpdate: (windows: Window[]) => void
  onSetActiveWindow: (windowId: string | null) => void
  showSnapZones: boolean
  draggingWindow: string | null
  onSetShowSnapZones: (show: boolean) => void
  onSetDraggingWindow: (windowId: string | null) => void
}

const springConfig = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
}

export default function WindowManager({
  windows,
  activeWindow,
  onWindowUpdate,
  onSetActiveWindow,
  showSnapZones,
  draggingWindow,
  onSetShowSnapZones,
  onSetDraggingWindow
}: WindowManagerProps) {
  const [resizingWindow, setResizingWindow] = useState<{
    windowId: string
    handle: string
    startX: number
    startY: number
    startWidth: number
    startHeight: number
    startWindowX: number
    startWindowY: number
  } | null>(null)

  const dragRef = useRef<{ windowId: string; startX: number; startY: number } | null>(null)

  // Window management functions
  const closeWindow = (windowId: string) => {
    const newWindows = windows.filter((w) => w.id !== windowId)
    onWindowUpdate(newWindows)
    if (activeWindow === windowId) {
      onSetActiveWindow(null)
    }
  }

  const minimizeWindow = (windowId: string) => {
    const newWindows = windows.map((w) => 
      w.id === windowId ? { ...w, minimized: true } : w
    )
    onWindowUpdate(newWindows)
  }

  const maximizeWindow = (windowId: string) => {
    const newWindows = windows.map((w) =>
      w.id === windowId
        ? {
            ...w,
            maximized: !w.maximized,
            x: w.maximized ? w.x : 0,
            y: w.maximized ? w.y : 40,
            width: w.maximized ? w.width : window.innerWidth,
            height: w.maximized ? w.height : window.innerHeight - 40,
            snapped: null,
          }
        : w,
    )
    onWindowUpdate(newWindows)
  }

  const snapWindow = useCallback((windowId: string, zone: SnapZone) => {
    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight - 40

    let newX = 0,
      newY = 40,
      newWidth = 0,
      newHeight = 0,
      snapType = null

    switch (zone) {
      case "left-half":
        newX = 0
        newY = 40
        newWidth = screenWidth / 2
        newHeight = screenHeight
        snapType = "left"
        break
      case "right-half":
        newX = screenWidth / 2
        newY = 40
        newWidth = screenWidth / 2
        newHeight = screenHeight
        snapType = "right"
        break
      case "maximize":
        newX = 0
        newY = 40
        newWidth = screenWidth
        newHeight = screenHeight
        snapType = null
        break
    }

    const newWindows = windows.map((w) =>
      w.id === windowId
        ? {
            ...w,
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight,
            maximized: zone === "maximize",
            snapped: snapType as any,
          }
        : w,
    )
    onWindowUpdate(newWindows)
    onSetShowSnapZones(false)
    onSetDraggingWindow(null)
  }, [windows, onWindowUpdate, onSetShowSnapZones, onSetDraggingWindow])

  const handleWindowMouseDown = (e: React.MouseEvent, windowId: string) => {
    if ((e.target as HTMLElement).closest(".window-controls")) return
    if ((e.target as HTMLElement).closest(".resize-handle")) return

    dragRef.current = {
      windowId,
      startX: e.clientX,
      startY: e.clientY,
    }
    onSetActiveWindow(windowId)
    onSetDraggingWindow(windowId)
  }

  const handleWindowMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current) return

    const deltaX = e.clientX - dragRef.current.startX
    const deltaY = e.clientY - dragRef.current.startY

    // Show snap zones when dragging near edges
    const margin = 100
    const showZones =
      e.clientY < margin || 
      e.clientX < margin || 
      e.clientX > window.innerWidth - margin

    onSetShowSnapZones(showZones)

    const newWindows = windows.map((w) =>
      w.id === dragRef.current!.windowId && !w.maximized
        ? {
            ...w,
            x: Math.max(0, w.x + deltaX),
            y: Math.max(40, w.y + deltaY),
            snapped: null,
          }
        : w,
    )
    onWindowUpdate(newWindows)

    dragRef.current.startX = e.clientX
    dragRef.current.startY = e.clientY
  }

  const handleWindowMouseUp = (e: React.MouseEvent) => {
    if (dragRef.current && showSnapZones) {
      const windowId = dragRef.current.windowId
      const { clientX: x, clientY: y } = e
      const margin = 100
      const windowWidth = window.innerWidth

      if (x < margin) {
        snapWindow(windowId, "left-half")
      } else if (x > windowWidth - margin) {
        snapWindow(windowId, "right-half")
      } else if (y < margin) {
        snapWindow(windowId, "maximize")
      }
    }

    dragRef.current = null
    onSetShowSnapZones(false)
    onSetDraggingWindow(null)

    const newWindows = windows.map((w) => ({ ...w, isResizing: false }))
    onWindowUpdate(newWindows)
  }

  const startWindowResize = (e: React.MouseEvent, windowId: string, handle: string) => {
    e.preventDefault()
    e.stopPropagation()

    const windowToResize = windows.find((w) => w.id === windowId)
    if (!windowToResize) return

    setResizingWindow({
      windowId,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: windowToResize.width,
      startHeight: windowToResize.height,
      startWindowX: windowToResize.x,
      startWindowY: windowToResize.y,
    })

    onSetActiveWindow(windowId)
  }

  const handleWindowResize = useCallback((e: MouseEvent) => {
    if (!resizingWindow) return

    const { windowId, handle, startX, startY, startWidth, startHeight, startWindowX, startWindowY } = resizingWindow
    const deltaX = e.clientX - startX
    const deltaY = e.clientY - startY

    const newWindows = windows.map((w) => {
      if (w.id !== windowId) return w

      let newX = w.x
      let newY = w.y
      let newWidth = w.width
      let newHeight = w.height

      switch (handle) {
        case "right":
          newWidth = Math.max(300, startWidth + deltaX)
          break
        case "left":
          newWidth = Math.max(300, startWidth - deltaX)
          newX = startWindowX + deltaX
          if (newWidth === 300) newX = startWindowX + startWidth - 300
          break
        case "bottom":
          newHeight = Math.max(200, startHeight + deltaY)
          break
        case "top":
          newHeight = Math.max(200, startHeight - deltaY)
          newY = startWindowY + deltaY
          if (newHeight === 200) newY = startWindowY + startHeight - 200
          break
        case "bottom-right":
          newWidth = Math.max(300, startWidth + deltaX)
          newHeight = Math.max(200, startHeight + deltaY)
          break
        case "bottom-left":
          newWidth = Math.max(300, startWidth - deltaX)
          newHeight = Math.max(200, startHeight + deltaY)
          newX = startWindowX + deltaX
          if (newWidth === 300) newX = startWindowX + startWidth - 300
          break
        case "top-right":
          newWidth = Math.max(300, startWidth + deltaX)
          newHeight = Math.max(200, startHeight - deltaY)
          newY = startWindowY + deltaY
          if (newHeight === 200) newY = startWindowY + startHeight - 200
          break
        case "top-left":
          newWidth = Math.max(300, startWidth - deltaX)
          newHeight = Math.max(200, startHeight - deltaY)
          newX = startWindowX + deltaX
          newY = startWindowY + deltaY
          if (newWidth === 300) newX = startWindowX + startWidth - 300
          if (newHeight === 200) newY = startWindowY + startHeight - 200
          break
      }

      newX = Math.max(0, Math.min(newX, window.innerWidth - newWidth))
      newY = Math.max(40, Math.min(newY, window.innerHeight - newHeight))

      return {
        ...w,
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
        isResizing: true,
      }
    })

    onWindowUpdate(newWindows)
  }, [resizingWindow, windows, onWindowUpdate])

  // Mouse event handlers for resize
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingWindow) {
        handleWindowResize(e)
      }
    }

    const handleMouseUp = () => {
      setResizingWindow(null)
    }

    if (resizingWindow) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [resizingWindow, handleWindowResize])

  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      onMouseMove={handleWindowMouseMove}
      onMouseUp={handleWindowMouseUp}
    >
      {/* Snap Zones */}
      <AnimatePresence>
        {showSnapZones && (
          <>
            {/* Left Half */}
            <motion.div
              className="absolute top-10 left-0 w-1/2 h-[calc(100%-2.5rem)] bg-blue-500/25 border-2 border-blue-500/60 rounded-r-2xl backdrop-blur-sm z-40 pointer-events-auto cursor-pointer"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={springConfig}
              onClick={() => draggingWindow && snapWindow(draggingWindow, "left-half")}
            />

            {/* Right Half */}
            <motion.div
              className="absolute top-10 right-0 w-1/2 h-[calc(100%-2.5rem)] bg-blue-500/25 border-2 border-blue-500/60 rounded-l-2xl backdrop-blur-sm z-40 pointer-events-auto cursor-pointer"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={springConfig}
              onClick={() => draggingWindow && snapWindow(draggingWindow, "right-half")}
            />

            {/* Maximize Zone */}
            <motion.div
              className="absolute top-10 left-1/4 w-1/2 h-32 bg-purple-500/25 border-2 border-purple-500/60 rounded-2xl backdrop-blur-sm z-40 pointer-events-auto cursor-pointer"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={springConfig}
              onClick={() => draggingWindow && snapWindow(draggingWindow, "maximize")}
            />
          </>
        )}
      </AnimatePresence>

      {/* Windows */}
      <AnimatePresence>
        {windows
          .filter((w) => !w.minimized)
          .map((window) => {
            const Icon = window.icon
            const WindowComponent = window.component
            const isFullscreen = window.maximized || window.snapped

            return (
              <motion.div
                key={window.id}
                className={`glass-window absolute pointer-events-auto ${
                  activeWindow === window.id ? "z-30 border-purple-500/30" : "z-20"
                } ${window.isResizing ? "select-none" : ""}`}
                style={{
                  left: window.x,
                  top: window.y,
                  width: window.width,
                  height: window.height,
                  cursor: window.isResizing ? "nw-resize" : "default",
                }}
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                transition={springConfig}
                onMouseDown={(e) => handleWindowMouseDown(e, window.id)}
              >
                {/* Resize Handles */}
                {!isFullscreen && (
                  <>
                    {/* Corner handles */}
                    <div
                      className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize resize-handle"
                      onMouseDown={(e) => startWindowResize(e, window.id, "top-left")}
                    />
                    <div
                      className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize resize-handle"
                      onMouseDown={(e) => startWindowResize(e, window.id, "top-right")}
                    />
                    <div
                      className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize resize-handle"
                      onMouseDown={(e) => startWindowResize(e, window.id, "bottom-left")}
                    />
                    <div
                      className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize resize-handle"
                      onMouseDown={(e) => startWindowResize(e, window.id, "bottom-right")}
                    />

                    {/* Edge handles */}
                    <div
                      className="absolute top-0 left-3 right-3 h-1 cursor-n-resize resize-handle"
                      onMouseDown={(e) => startWindowResize(e, window.id, "top")}
                    />
                    <div
                      className="absolute bottom-0 left-3 right-3 h-1 cursor-s-resize resize-handle"
                      onMouseDown={(e) => startWindowResize(e, window.id, "bottom")}
                    />
                    <div
                      className="absolute left-0 top-3 bottom-3 w-1 cursor-w-resize resize-handle"
                      onMouseDown={(e) => startWindowResize(e, window.id, "left")}
                    />
                    <div
                      className="absolute right-0 top-3 bottom-3 w-1 cursor-e-resize resize-handle"
                      onMouseDown={(e) => startWindowResize(e, window.id, "right")}
                    />
                  </>
                )}

                {/* Window Title Bar */}
                <motion.div
                  className="flex items-center justify-between px-2 py-1 border-b border-white/10 cursor-move bg-gradient-to-r from-transparent to-white/5 rounded-t-xl"
                  whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-2">
                    <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={springConfig}>
                      <Icon className="w-4 h-4 text-purple-400" />
                    </motion.div>
                    <span className="text-white text-sm font-medium">{window.title}</span>
                    {window.snapped && (
                      <motion.div
                        className="px-2 py-1 bg-purple-500/20 rounded text-xs text-purple-300"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={springConfig}
                      >
                        {window.snapped === "left" ? "Left Half" : "Right Half"}
                      </motion.div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 window-controls">
                    <motion.button
                      onClick={() => minimizeWindow(window.id)}
                      className="w-4 h-4 rounded-full bg-yellow-500/20 hover:bg-yellow-500/40 flex items-center justify-center"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      transition={springConfig}
                    >
                      <Minimize2 className="w-2 h-2 text-yellow-400" />
                    </motion.button>
                    <motion.button
                      onClick={() => maximizeWindow(window.id)}
                      className="w-4 h-4 rounded-full bg-green-500/20 hover:bg-green-500/40 flex items-center justify-center"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      transition={springConfig}
                    >
                      <Maximize2 className="w-2 h-2 text-green-400" />
                    </motion.button>
                    <motion.button
                      onClick={() => closeWindow(window.id)}
                      className="w-4 h-4 rounded-full bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      transition={springConfig}
                    >
                      <X className="w-2 h-2 text-red-400" />
                    </motion.button>
                  </div>
                </motion.div>

                {/* Window Content */}
                <div className="h-[calc(100%-29px)] overflow-hidden">
                  {WindowComponent ? (
                    <WindowComponent />
                  ) : (
                    <motion.div
                      className="p-4 h-full flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="text-gray-400 text-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ ...springConfig, delay: 0.3 }}
                        >
                          <Icon className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                        </motion.div>
                        <p>{window.title} application would load here</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )
          })}
      </AnimatePresence>
    </div>
  )
}
