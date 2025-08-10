"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  Wifi, 
  WifiOff, 
  Bluetooth, 
  BluetoothOff, 
  Volume2, 
  VolumeX, 
  Battery, 
  BatteryLow,
  Check,
  Lock,
  Minus,
  Plus
} from 'lucide-react'

interface Notification {
  id: number
  title: string
  message: string
  time: string
  read: boolean
}

interface Network {
  name: string
  strength: number
  secured: boolean
  connected: boolean
}

interface SystemTrayProps {
  notifications: Notification[]
  unreadNotifications: number
  wifiEnabled: boolean
  bluetoothEnabled: boolean
  volumeLevel: number
  volumeEnabled: boolean
  batteryLevel: number
  onToggleWifi: () => void
  onToggleBluetooth: () => void
  onToggleVolume: () => void
  onVolumeChange: (level: number) => void
  onNotificationToggle: () => void
  onClearNotifications: () => void
  showNotifications: boolean
  showWifiMenu: boolean
  showVolumeSlider: boolean
  showBatteryMenu: boolean
  onSetShowNotifications: (show: boolean) => void
  onSetShowWifiMenu: (show: boolean) => void
  onSetShowVolumeSlider: (show: boolean) => void
  onSetShowBatteryMenu: (show: boolean) => void
}

const springConfig = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
}

const mockNetworks: Network[] = [
  { name: "MominOS-WiFi", strength: 4, secured: false, connected: true },
  { name: "Home-Network", strength: 3, secured: true, connected: false },
  { name: "Office-5G", strength: 2, secured: true, connected: false },
  { name: "Guest-Network", strength: 1, secured: false, connected: false },
]

export default function SystemTray({
  notifications,
  unreadNotifications,
  wifiEnabled,
  bluetoothEnabled,
  volumeLevel,
  volumeEnabled,
  batteryLevel,
  onToggleWifi,
  onToggleBluetooth,
  onToggleVolume,
  onVolumeChange,
  onNotificationToggle,
  onClearNotifications,
  showNotifications,
  showWifiMenu,
  showVolumeSlider,
  showBatteryMenu,
  onSetShowNotifications,
  onSetShowWifiMenu,
  onSetShowVolumeSlider,
  onSetShowBatteryMenu
}: SystemTrayProps) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const connectToNetwork = (networkName: string) => {
    // Mock network connection
    onSetShowWifiMenu(false)
  }

  const getBatteryIcon = () => {
    if (batteryLevel > 70) {
      return <Battery className="w-4 h-4" />
    }
    if (batteryLevel > 30) {
      return <Battery className="w-4 h-4" />
    }
    return <BatteryLow className="w-4 h-4" />
  }

  const getSignalBars = (strength: number) => {
    return Array.from({ length: 4 }, (_, i) => (
      <div
        key={i}
        className={`w-1 bg-white rounded-full ${
          i < strength ? "opacity-100" : "opacity-30"
        } ${i === 0 ? "h-1" : i === 1 ? "h-2" : i === 2 ? "h-3" : "h-4"}`}
      />
    ))
  }

  return (
    <div className="flex items-center gap-4 text-gray-300 text-sm">
      {/* Notifications */}
      <div className="relative">
        <motion.button
          className="p-1 rounded-md hover:bg-white/10 relative"
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          transition={springConfig}
          onClick={onNotificationToggle}
        >
          <Bell className="w-4 h-4" />
          {unreadNotifications > 0 && (
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={springConfig}
            >
              <span className="text-xs text-white font-bold">{unreadNotifications}</span>
            </motion.div>
          )}
        </motion.button>

        {/* Notifications Panel */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              className="glass-menu absolute top-8 right-0 w-80 p-3 z-50"
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              transition={springConfig}
            >
              <div className="flex justify-between items-center p-2 border-b border-white/10 mb-2">
                <h3 className="text-white font-medium">Notifications</h3>
                <motion.button
                  className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded-md hover:bg-white/10"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClearNotifications}
                >
                  Clear All
                </motion.button>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      className={`glass-notification p-3 mb-2 cursor-pointer ${
                        notification.read ? "opacity-70" : "opacity-100"
                      }`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...springConfig, delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-white">{notification.title}</span>
                        <span className="text-xs text-gray-400">{notification.time}</span>
                      </div>
                      <p className="text-xs text-gray-300 mt-1">{notification.message}</p>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    className="p-6 text-center text-gray-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No notifications</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* WiFi */}
      <div className="relative">
        <motion.div
          className="flex items-center gap-1 cursor-pointer p-1 rounded-md hover:bg-white/10"
          whileHover={{ scale: 1.05, color: "#ffffff" }}
          transition={{ duration: 0.2 }}
          onClick={() => onSetShowWifiMenu(!showWifiMenu)}
        >
          {wifiEnabled ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4 opacity-50" />}
        </motion.div>

        {/* WiFi Menu */}
        <AnimatePresence>
          {showWifiMenu && (
            <motion.div
              className="absolute top-8 right-0 w-64 bg-black/90 backdrop-blur-xl border border-white/10 p-3 z-50 rounded-xl"
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              transition={springConfig}
            >
              <div className="flex justify-between items-center p-2 border-b border-white/10 mb-2">
                <h3 className="text-white font-medium">Wi-Fi</h3>
                <motion.button
                  className={`text-xs px-2 py-1 rounded-md ${
                    wifiEnabled ? "bg-green-600 text-white" : "bg-gray-600 text-gray-300"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onToggleWifi}
                >
                  {wifiEnabled ? "ON" : "OFF"}
                </motion.button>
              </div>

              {wifiEnabled && (
                <div className="space-y-1">
                  {mockNetworks.map((network, index) => (
                    <motion.div
                      key={network.name}
                      className={`p-2 rounded-lg cursor-pointer ${
                        network.connected ? "bg-blue-600/30" : "hover:bg-white/10"
                      }`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...springConfig, delay: index * 0.05 }}
                      onClick={() => connectToNetwork(network.name)}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">{getSignalBars(network.strength)}</div>
                          <span className="text-white text-sm">{network.name}</span>
                          {network.secured && <Lock className="w-3 h-3 text-gray-400" />}
                        </div>
                        {network.connected && <Check className="w-4 h-4 text-green-400" />}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bluetooth */}
      <div className="relative">
        <motion.div
          className="flex items-center gap-1 cursor-pointer p-1 rounded-md hover:bg-white/10"
          whileHover={{ scale: 1.05, color: "#ffffff" }}
          transition={{ duration: 0.2 }}
          onClick={onToggleBluetooth}
        >
          {bluetoothEnabled ? <Bluetooth className="w-4 h-4" /> : <BluetoothOff className="w-4 h-4 opacity-50" />}
        </motion.div>
      </div>

      {/* Volume */}
      <div className="relative">
        <motion.div
          className="flex items-center gap-1 cursor-pointer p-1 rounded-md hover:bg-white/10"
          whileHover={{ scale: 1.05, color: "#ffffff" }}
          transition={{ duration: 0.2 }}
          onClick={() => onSetShowVolumeSlider(!showVolumeSlider)}
        >
          {volumeEnabled && volumeLevel > 0 ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4 opacity-50" />
          )}
        </motion.div>

        {/* Volume Slider */}
        <AnimatePresence>
          {showVolumeSlider && (
            <motion.div
              className="absolute top-8 right-0 w-48 bg-black/90 backdrop-blur-xl border border-white/10 p-4 z-50 rounded-xl"
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              transition={springConfig}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-white font-medium">Volume</h3>
                <span className="text-gray-400 text-sm">{volumeLevel}%</span>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  className="p-1 rounded-md hover:bg-white/10"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onVolumeChange(Math.max(0, volumeLevel - 10))}
                >
                  <Minus className="w-3 h-3 text-white" />
                </motion.button>

                <div className="flex-1 relative">
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-white rounded-full"
                      style={{ width: `${volumeLevel}%` }}
                      transition={springConfig}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volumeLevel}
                    onChange={(e) => onVolumeChange(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>

                <motion.button
                  className="p-1 rounded-md hover:bg-white/10"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onVolumeChange(Math.min(100, volumeLevel + 10))}
                >
                  <Plus className="w-3 h-3 text-white" />
                </motion.button>
              </div>

              <motion.button
                className="w-full mt-3 p-2 rounded-md bg-white/10 hover:bg-white/20 text-white text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onToggleVolume}
              >
                {volumeEnabled ? "Mute" : "Unmute"}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Battery */}
      <div className="relative">
        <motion.div
          className="flex items-center gap-1 cursor-pointer p-1 rounded-md hover:bg-white/10"
          whileHover={{ scale: 1.05, color: "#ffffff" }}
          transition={{ duration: 0.2 }}
          onClick={() => onSetShowBatteryMenu(!showBatteryMenu)}
        >
          {getBatteryIcon()}
          <span>{batteryLevel}%</span>
        </motion.div>

        {/* Battery Menu */}
        <AnimatePresence>
          {showBatteryMenu && (
            <motion.div
              className="absolute top-8 right-0 w-56 bg-black/90 backdrop-blur-xl border border-white/10 p-4 z-50 rounded-xl"
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              transition={springConfig}
            >
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-white mb-1">{batteryLevel}%</div>
                <div className="text-gray-400 text-sm">{batteryLevel > 20 ? "Battery Normal" : "Low Battery"}</div>
              </div>

              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mb-4">
                <motion.div
                  className={`h-full rounded-full ${batteryLevel > 20 ? "bg-green-500" : "bg-red-500"}`}
                  style={{ width: `${batteryLevel}%` }}
                  transition={springConfig}
                />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Time remaining:</span>
                  <span>{Math.floor(batteryLevel / 10)} hours</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Power source:</span>
                  <span>Battery</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Condition:</span>
                  <span>Normal</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Time */}
      <motion.div
        className="text-white font-mono cursor-pointer p-1 rounded-md hover:bg-white/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.05 }}
      >
        {time.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        })}
      </motion.div>
    </div>
  )
}
