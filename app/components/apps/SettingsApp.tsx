
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Settings, 
  Monitor, 
  Wifi, 
  Shield, 
  Users, 
  Download, 
  Info, 
  Search, 
  Palette, 
  Volume2, 
  Bell, 
  Bluetooth, 
  Eye,
  Lock,
  Globe,
  Keyboard,
  Mouse,
  Gamepad2,
  Battery,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Printer,
  Camera,
  Mic,
  Speaker,
  Trash2,
  RefreshCw,
  Save,
  X
} from "lucide-react"

interface SettingsCategory {
  id: string
  name: string
  icon: any
  description: string
}

export default function SettingsApp() {
  const [selectedCategory, setSelectedCategory] = useState('general')
  const [searchQuery, setSearchQuery] = useState("")
  const [settings, setSettings] = useState({
    // General
    autoStart: true,
    notifications: true,
    soundEnabled: true,
    theme: 'dark',
    language: 'en',
    
    // Display
    resolution: '1920x1080',
    brightness: 80,
    nightMode: false,
    scaling: 100,
    
    // Network
    wifi: true,
    bluetooth: false,
    proxy: false,
    
    // Privacy
    analytics: false,
    locationServices: false,
    dataCollection: false,
    
    // Security
    firewall: true,
    autoUpdates: true,
    passwordRequired: true,
    
    // Performance
    animations: true,
    backgroundApps: true,
    powerSaver: false,
    
    // Audio
    volume: 75,
    mute: false,
    spatialAudio: true,
    
    // Input
    keyboardLayout: 'qwerty',
    mouseSpeed: 50,
    touchpad: true
  })

  const categories: SettingsCategory[] = [
    { id: 'general', name: 'General', icon: Settings, description: 'Basic system preferences' },
    { id: 'display', name: 'Display', icon: Monitor, description: 'Screen and visual settings' },
    { id: 'network', name: 'Network', icon: Wifi, description: 'Internet and connectivity' },
    { id: 'privacy', name: 'Privacy', icon: Shield, description: 'Privacy and data settings' },
    { id: 'security', name: 'Security', icon: Lock, description: 'Security and protection' },
    { id: 'audio', name: 'Audio', icon: Volume2, description: 'Sound and audio settings' },
    { id: 'input', name: 'Input', icon: Keyboard, description: 'Keyboard and mouse settings' },
    { id: 'performance', name: 'Performance', icon: Cpu, description: 'System performance settings' },
    { id: 'updates', name: 'Updates', icon: Download, description: 'System updates and maintenance' },
    { id: 'about', name: 'About', icon: Info, description: 'System information' }
  ]

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const ToggleSwitch = ({ checked, onChange, label, description }: {
    checked: boolean
    onChange: (checked: boolean) => void
    label: string
    description?: string
  }) => (
    <div className="flex items-center justify-between p-3 glass-card">
      <div>
        <div className="text-white font-medium">{label}</div>
        {description && <div className="text-gray-400 text-sm">{description}</div>}
      </div>
      <motion.button
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full flex items-center px-1 ${
          checked ? 'bg-purple-500' : 'bg-gray-600'
        }`}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="w-4 h-4 bg-white rounded-full"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </motion.button>
    </div>
  )

  const SliderSetting = ({ value, onChange, label, min = 0, max = 100, unit = '' }: {
    value: number
    onChange: (value: number) => void
    label: string
    min?: number
    max?: number
    unit?: string
  }) => (
    <div className="p-3 glass-card">
      <div className="flex justify-between items-center mb-2">
        <span className="text-white font-medium">{label}</span>
        <span className="text-gray-400">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  )

  const SelectSetting = ({ value, onChange, label, options }: {
    value: string
    onChange: (value: string) => void
    label: string
    options: { value: string; label: string }[]
  }) => (
    <div className="p-3 glass-card">
      <div className="text-white font-medium mb-2">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="glass-input w-full text-white"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )

  const renderCategoryContent = () => {
    switch (selectedCategory) {
      case 'general':
        return (
          <div className="space-y-4">
            <h3 className="text-white text-lg font-semibold">General Settings</h3>
            <ToggleSwitch
              checked={settings.autoStart}
              onChange={(checked) => updateSetting('autoStart', checked)}
              label="Start MominOS on login"
              description="Automatically launch MominOS when you log in"
            />
            <ToggleSwitch
              checked={settings.notifications}
              onChange={(checked) => updateSetting('notifications', checked)}
              label="Enable notifications"
              description="Show desktop notifications from apps"
            />
            <ToggleSwitch
              checked={settings.soundEnabled}
              onChange={(checked) => updateSetting('soundEnabled', checked)}
              label="System sounds"
              description="Play sounds for system events"
            />
            <SelectSetting
              value={settings.theme}
              onChange={(value) => updateSetting('theme', value)}
              label="Theme"
              options={[
                { value: 'dark', label: 'Dark' },
                { value: 'light', label: 'Light' },
                { value: 'auto', label: 'Auto' }
              ]}
            />
            <SelectSetting
              value={settings.language}
              onChange={(value) => updateSetting('language', value)}
              label="Language"
              options={[
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Spanish' },
                { value: 'fr', label: 'French' },
                { value: 'de', label: 'German' }
              ]}
            />
          </div>
        )

      case 'display':
        return (
          <div className="space-y-4">
            <h3 className="text-white text-lg font-semibold">Display Settings</h3>
            <SelectSetting
              value={settings.resolution}
              onChange={(value) => updateSetting('resolution', value)}
              label="Resolution"
              options={[
                { value: '1920x1080', label: '1920×1080 (Full HD)' },
                { value: '2560x1440', label: '2560×1440 (2K)' },
                { value: '3840x2160', label: '3840×2160 (4K)' }
              ]}
            />
            <SliderSetting
              value={settings.brightness}
              onChange={(value) => updateSetting('brightness', value)}
              label="Brightness"
              unit="%"
            />
            <ToggleSwitch
              checked={settings.nightMode}
              onChange={(checked) => updateSetting('nightMode', checked)}
              label="Night mode"
              description="Reduce blue light in the evening"
            />
            <SliderSetting
              value={settings.scaling}
              onChange={(value) => updateSetting('scaling', value)}
              label="UI Scaling"
              min={50}
              max={200}
              unit="%"
            />
          </div>
        )

      case 'network':
        return (
          <div className="space-y-4">
            <h3 className="text-white text-lg font-semibold">Network Settings</h3>
            <ToggleSwitch
              checked={settings.wifi}
              onChange={(checked) => updateSetting('wifi', checked)}
              label="Wi-Fi"
              description="Enable wireless networking"
            />
            <ToggleSwitch
              checked={settings.bluetooth}
              onChange={(checked) => updateSetting('bluetooth', checked)}
              label="Bluetooth"
              description="Enable Bluetooth connectivity"
            />
            <ToggleSwitch
              checked={settings.proxy}
              onChange={(checked) => updateSetting('proxy', checked)}
              label="Use proxy server"
              description="Route traffic through a proxy server"
            />
            <div className="p-3 glass-card">
              <div className="text-white font-medium mb-2">Network Status</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Connection:</span>
                  <span className="text-green-400">Connected</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>IP Address:</span>
                  <span>192.168.1.100</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Download:</span>
                  <span>125.3 MB/s</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Upload:</span>
                  <span>45.7 MB/s</span>
                </div>
              </div>
            </div>
          </div>
        )

      case 'privacy':
        return (
          <div className="space-y-4">
            <h3 className="text-white text-lg font-semibold">Privacy Settings</h3>
            <ToggleSwitch
              checked={settings.analytics}
              onChange={(checked) => updateSetting('analytics', checked)}
              label="Analytics"
              description="Share anonymous usage data to improve MominOS"
            />
            <ToggleSwitch
              checked={settings.locationServices}
              onChange={(checked) => updateSetting('locationServices', checked)}
              label="Location Services"
              description="Allow apps to access your location"
            />
            <ToggleSwitch
              checked={settings.dataCollection}
              onChange={(checked) => updateSetting('dataCollection', checked)}
              label="Data Collection"
              description="Allow collection of diagnostic data"
            />
            <div className="p-3 glass-card">
              <div className="text-white font-medium mb-2">Data Usage</div>
              <div className="space-y-2">
                <motion.button
                  className="glass-button w-full p-2 text-red-400"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Data
                </motion.button>
              </div>
            </div>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-4">
            <h3 className="text-white text-lg font-semibold">Security Settings</h3>
            <ToggleSwitch
              checked={settings.firewall}
              onChange={(checked) => updateSetting('firewall', checked)}
              label="Firewall"
              description="Block unauthorized network access"
            />
            <ToggleSwitch
              checked={settings.autoUpdates}
              onChange={(checked) => updateSetting('autoUpdates', checked)}
              label="Automatic Updates"
              description="Install security updates automatically"
            />
            <ToggleSwitch
              checked={settings.passwordRequired}
              onChange={(checked) => updateSetting('passwordRequired', checked)}
              label="Require password"
              description="Require password for system changes"
            />
            <div className="p-3 glass-card">
              <div className="text-white font-medium mb-2">Security Status</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Firewall:</span>
                  <span className="text-green-400">Active</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Last Scan:</span>
                  <span>2 hours ago</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Threats Blocked:</span>
                  <span>0</span>
                </div>
              </div>
            </div>
          </div>
        )

      case 'audio':
        return (
          <div className="space-y-4">
            <h3 className="text-white text-lg font-semibold">Audio Settings</h3>
            <SliderSetting
              value={settings.volume}
              onChange={(value) => updateSetting('volume', value)}
              label="Master Volume"
              unit="%"
            />
            <ToggleSwitch
              checked={!settings.mute}
              onChange={(checked) => updateSetting('mute', !checked)}
              label="Sound enabled"
              description="Enable or disable all system sounds"
            />
            <ToggleSwitch
              checked={settings.spatialAudio}
              onChange={(checked) => updateSetting('spatialAudio', checked)}
              label="Spatial Audio"
              description="Enable 3D audio effects"
            />
            <div className="p-3 glass-card">
              <div className="text-white font-medium mb-2">Audio Devices</div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between text-gray-300">
                  <div className="flex items-center gap-2">
                    <Speaker className="w-4 h-4" />
                    <span>Built-in Speakers</span>
                  </div>
                  <span className="text-green-400">Active</span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4" />
                    <span>Built-in Microphone</span>
                  </div>
                  <span className="text-green-400">Active</span>
                </div>
              </div>
            </div>
          </div>
        )

      case 'input':
        return (
          <div className="space-y-4">
            <h3 className="text-white text-lg font-semibold">Input Settings</h3>
            <SelectSetting
              value={settings.keyboardLayout}
              onChange={(value) => updateSetting('keyboardLayout', value)}
              label="Keyboard Layout"
              options={[
                { value: 'qwerty', label: 'QWERTY' },
                { value: 'dvorak', label: 'Dvorak' },
                { value: 'colemak', label: 'Colemak' }
              ]}
            />
            <SliderSetting
              value={settings.mouseSpeed}
              onChange={(value) => updateSetting('mouseSpeed', value)}
              label="Mouse Speed"
              min={1}
              max={100}
            />
            <ToggleSwitch
              checked={settings.touchpad}
              onChange={(checked) => updateSetting('touchpad', checked)}
              label="Touchpad"
              description="Enable touchpad gestures"
            />
          </div>
        )

      case 'performance':
        return (
          <div className="space-y-4">
            <h3 className="text-white text-lg font-semibold">Performance Settings</h3>
            <ToggleSwitch
              checked={settings.animations}
              onChange={(checked) => updateSetting('animations', checked)}
              label="Animations"
              description="Enable smooth animations and transitions"
            />
            <ToggleSwitch
              checked={settings.backgroundApps}
              onChange={(checked) => updateSetting('backgroundApps', checked)}
              label="Background Apps"
              description="Allow apps to run in the background"
            />
            <ToggleSwitch
              checked={settings.powerSaver}
              onChange={(checked) => updateSetting('powerSaver', checked)}
              label="Power Saver Mode"
              description="Reduce performance to save battery"
            />
            <div className="p-3 glass-card">
              <div className="text-white font-medium mb-2">System Resources</div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>CPU Usage</span>
                    <span>35%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>Memory Usage</span>
                    <span>4.2 GB / 8 GB</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '52%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>Disk Usage</span>
                    <span>256 GB / 512 GB</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'updates':
        return (
          <div className="space-y-4">
            <h3 className="text-white text-lg font-semibold">Updates & Maintenance</h3>
            <div className="p-3 glass-card">
              <div className="text-white font-medium mb-2">System Updates</div>
              <div className="text-gray-300 text-sm mb-3">
                Your system is up to date. Last checked: 1 hour ago
              </div>
              <motion.button
                className="glass-button px-4 py-2 flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RefreshCw className="w-4 h-4" />
                Check for Updates
              </motion.button>
            </div>
            <div className="p-3 glass-card">
              <div className="text-white font-medium mb-2">Maintenance</div>
              <div className="space-y-2">
                <motion.button
                  className="glass-button w-full p-2 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Trash2 className="w-4 h-4" />
                  Clean Temporary Files
                </motion.button>
                <motion.button
                  className="glass-button w-full p-2 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset to Defaults
                </motion.button>
              </div>
            </div>
          </div>
        )

      case 'about':
        return (
          <div className="space-y-4">
            <h3 className="text-white text-lg font-semibold">About MominOS</h3>
            <div className="p-4 glass-card text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-green-400 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-white text-xl font-bold mb-2">MominOS</h4>
              <p className="text-gray-400 mb-4">Version 1.0.0</p>
            </div>
            <div className="p-3 glass-card">
              <div className="text-white font-medium mb-2">System Information</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>OS Version:</span>
                  <span>MominOS 1.0.0</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Kernel:</span>
                  <span>Linux 6.1.0</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Architecture:</span>
                  <span>x86_64</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Processor:</span>
                  <span>Intel Core i7</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Memory:</span>
                  <span>8 GB</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Storage:</span>
                  <span>512 GB SSD</span>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-full bg-black/20 backdrop-blur-xl flex">
      {/* Sidebar */}
      <div className="w-64 glass-card border-r border-white/10">
        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input w-full pl-10 text-white placeholder-gray-400"
            />
          </div>
          
          <div className="space-y-1">
            {filteredCategories.map((category) => {
              const Icon = category.icon
              return (
                <motion.button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${
                    selectedCategory === category.id 
                      ? 'bg-white/20 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-5 h-5" />
                  <div>
                    <div className="font-medium">{category.name}</div>
                    <div className="text-xs opacity-70">{category.description}</div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderCategoryContent()}
        </motion.div>
      </div>
    </div>
  )
}
