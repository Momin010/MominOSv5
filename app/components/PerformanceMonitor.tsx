"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Activity, Cpu, HardDrive, Zap, Wifi, Download, Upload } from 'lucide-react'

interface PerformanceData {
  cpu: number
  memory: number
  network: {
    download: number
    upload: number
  }
  fps: number
  timestamp: number
}

interface PerformanceMonitorProps {
  isVisible: boolean
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

export default function PerformanceMonitor({ 
  isVisible, 
  position = 'top-right' 
}: PerformanceMonitorProps) {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([])
  const [currentData, setCurrentData] = useState<PerformanceData>({
    cpu: 0,
    memory: 0,
    network: { download: 0, upload: 0 },
    fps: 60,
    timestamp: Date.now()
  })

  const [isExpanded, setIsExpanded] = useState(false)

  // Simulate performance data
  useEffect(() => {
    const interval = setInterval(() => {
      const newData: PerformanceData = {
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        network: {
          download: Math.random() * 1000,
          upload: Math.random() * 500
        },
        fps: 60 - Math.random() * 10,
        timestamp: Date.now()
      }

      setCurrentData(newData)
      setPerformanceData(prev => {
        const updated = [...prev, newData]
        return updated.slice(-60) // Keep only last 60 data points (1 minute at 1Hz)
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Real FPS monitoring
  useEffect(() => {
    let lastTime = performance.now()
    let frameCount = 0
    let fpsUpdateTime = lastTime

    const measureFPS = () => {
      const currentTime = performance.now()
      frameCount++

      if (currentTime - fpsUpdateTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - fpsUpdateTime))
        setCurrentData(prev => ({ ...prev, fps }))
        frameCount = 0
        fpsUpdateTime = currentTime
      }

      requestAnimationFrame(measureFPS)
    }

    requestAnimationFrame(measureFPS)
  }, [])

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  }

  const formatBytes = (bytes: number) => {
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s']
    if (bytes === 0) return '0 B/s'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i]
  }

  const getPerformanceColor = (value: number) => {
    if (value < 30) return 'text-green-400'
    if (value < 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  const chartData = useMemo(() => {
    return performanceData.slice(-20).map((data, index) => ({
      index,
      cpu: data.cpu,
      memory: data.memory
    }))
  }, [performanceData])

  if (!isVisible) return null

  return (
    <motion.div
      className={`fixed ${positionClasses[position]} z-40 pointer-events-auto`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <div
        className={`glass-card cursor-pointer transition-all duration-300 ${
          isExpanded ? 'w-80 h-64' : 'w-64 h-auto'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Compact View */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span className="text-white text-sm font-medium">Performance</span>
            </div>
            <div className={`text-xs ${getPerformanceColor(currentData.fps)}`}>
              {Math.round(currentData.fps)} FPS
            </div>
          </div>

          <div className="space-y-2">
            {/* CPU */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-gray-300">CPU</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${currentData.cpu}%` }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  />
                </div>
                <span className={`text-xs font-mono ${getPerformanceColor(currentData.cpu)}`}>
                  {Math.round(currentData.cpu)}%
                </span>
              </div>
            </div>

            {/* Memory */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-3 h-3 text-green-400" />
                <span className="text-xs text-gray-300">RAM</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-green-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${currentData.memory}%` }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  />
                </div>
                <span className={`text-xs font-mono ${getPerformanceColor(currentData.memory)}`}>
                  {Math.round(currentData.memory)}%
                </span>
              </div>
            </div>

            {/* Network */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="w-3 h-3 text-cyan-400" />
                <span className="text-xs text-gray-300">NET</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-mono text-cyan-400">
                <Download className="w-2 h-2" />
                <span>{formatBytes(currentData.network.download)}</span>
                <Upload className="w-2 h-2 ml-1" />
                <span>{formatBytes(currentData.network.upload)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Expanded View */}
        {isExpanded && (
          <motion.div
            className="px-3 pb-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="border-t border-white/10 pt-3">
              <h4 className="text-xs font-medium text-white mb-3">Performance Chart</h4>
              
              {/* Mini Chart */}
              <div className="h-24 bg-black/20 rounded-lg p-2 relative">
                <svg width="100%" height="100%" className="overflow-visible">
                  {/* Grid lines */}
                  {[0, 25, 50, 75, 100].map(y => (
                    <line
                      key={y}
                      x1="0"
                      y1={`${100 - y}%`}
                      x2="100%"
                      y2={`${100 - y}%`}
                      stroke="rgba(255, 255, 255, 0.1)"
                      strokeWidth="1"
                    />
                  ))}
                  
                  {/* CPU Line */}
                  <polyline
                    points={chartData.map((data, index) => 
                      `${(index / (chartData.length - 1)) * 100},${100 - data.cpu}`
                    ).join(' ')}
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth="1.5"
                    className="opacity-80"
                  />
                  
                  {/* Memory Line */}
                  <polyline
                    points={chartData.map((data, index) => 
                      `${(index / (chartData.length - 1)) * 100},${100 - data.memory}`
                    ).join(' ')}
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="1.5"
                    className="opacity-80"
                  />
                </svg>
                
                {/* Legend */}
                <div className="absolute bottom-1 right-1 flex gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-400">CPU</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-400">RAM</span>
                  </div>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/5 rounded p-2">
                  <div className="text-gray-400 mb-1">Avg CPU</div>
                  <div className="text-blue-400 font-mono">
                    {Math.round(performanceData.slice(-10).reduce((acc, d) => acc + d.cpu, 0) / Math.max(performanceData.slice(-10).length, 1))}%
                  </div>
                </div>
                <div className="bg-white/5 rounded p-2">
                  <div className="text-gray-400 mb-1">Avg RAM</div>
                  <div className="text-green-400 font-mono">
                    {Math.round(performanceData.slice(-10).reduce((acc, d) => acc + d.memory, 0) / Math.max(performanceData.slice(-10).length, 1))}%
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// System Resources Hook
export function useSystemResources() {
  const [resources, setResources] = useState({
    cpu: 0,
    memory: 0,
    fps: 60,
    isLowPerformance: false
  })

  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    let fpsUpdateTime = lastTime

    const updateResources = () => {
      // Simulate CPU and memory usage based on DOM complexity
      const domComplexity = document.querySelectorAll('*').length
      const baseLoad = Math.min(domComplexity / 1000 * 100, 80)
      
      setResources(prev => ({
        cpu: Math.max(0, Math.min(100, baseLoad + Math.random() * 20 - 10)),
        memory: Math.max(0, Math.min(100, (performance as any).memory?.usedJSSize / (performance as any).memory?.totalJSSize * 100 || baseLoad + Math.random() * 15)),
        fps: prev.fps,
        isLowPerformance: prev.cpu > 80 || prev.memory > 85 || prev.fps < 30
      }))
    }

    const measureFPS = () => {
      const currentTime = performance.now()
      frameCount++

      if (currentTime - fpsUpdateTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - fpsUpdateTime))
        setResources(prev => ({ ...prev, fps }))
        frameCount = 0
        fpsUpdateTime = currentTime
      }

      requestAnimationFrame(measureFPS)
    }

    const interval = setInterval(updateResources, 2000)
    requestAnimationFrame(measureFPS)

    return () => {
      clearInterval(interval)
    }
  }, [])

  return resources
}
