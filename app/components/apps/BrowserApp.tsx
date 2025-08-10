"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, Plus, X, RefreshCw, ArrowLeft, ArrowRight, Home, 
  Star, StarOff, Menu, Download, Shield, Bookmark, 
  Globe, History, Settings, MoreHorizontal, Lock, Unlock,
  Wifi, WifiOff, Zap, Eye, EyeOff, ExternalLink, Copy,
  Calendar, Clock, TrendingUp, Users, Book, CheckCircle2
} from "lucide-react"

interface Tab {
  id: string
  title: string
  url: string
  isActive: boolean
  isLoading: boolean
  favicon?: string
  isPrivate?: boolean
  canGoBack?: boolean
  canGoForward?: boolean
}

interface Bookmark {
  id: string
  title: string
  url: string
  icon: string
  category?: string
  timestamp: number
}

interface HistoryItem {
  id: string
  url: string
  title: string
  timestamp: number
  favicon?: string
  visitCount: number
}

interface Download {
  id: string
  filename: string
  url: string
  progress: number
  status: 'downloading' | 'completed' | 'failed' | 'paused'
  size: number
  downloadedSize: number
  timestamp: number
}

interface Extension {
  id: string
  name: string
  icon: string
  description: string
  enabled: boolean
  permissions: string[]
  version: string
}

interface DevToolsState {
  isOpen: boolean
  activeTab: 'console' | 'network' | 'elements' | 'performance'
  console: ConsoleMessage[]
  networkRequests: NetworkRequest[]
}

interface ConsoleMessage {
  id: string
  type: 'log' | 'warn' | 'error' | 'info'
  message: string
  timestamp: number
}

interface NetworkRequest {
  id: string
  method: string
  url: string
  status: number
  responseTime: number
  size: number
  timestamp: number
}

interface PopularSite {
  name: string
  url: string
  icon: string
  category: string
  description: string
  color: string
}

const POPULAR_SITES: PopularSite[] = [
  { name: 'Google', url: 'https://www.google.com', icon: '🔍', category: 'Search', description: 'Search the web', color: 'from-blue-400 to-blue-600' },
  { name: 'YouTube', url: 'https://www.youtube.com', icon: '▶️', category: 'Entertainment', description: 'Watch videos', color: 'from-red-400 to-red-600' },
  { name: 'GitHub', url: 'https://github.com', icon: '🐙', category: 'Development', description: 'Code repositories', color: 'from-gray-700 to-gray-900' },
  { name: 'ChatGPT', url: 'https://chatgpt.com', icon: '🤖', category: 'AI', description: 'AI assistant', color: 'from-green-400 to-green-600' },
  { name: 'Stack Overflow', url: 'https://stackoverflow.com', icon: '📚', category: 'Development', description: 'Programming Q&A', color: 'from-orange-400 to-orange-600' },
  { name: 'Twitter/X', url: 'https://x.com', icon: '🐦', category: 'Social', description: 'Social network', color: 'from-blue-400 to-blue-600' },
  { name: 'Reddit', url: 'https://www.reddit.com', icon: '🤖', category: 'Social', description: 'Discussions', color: 'from-orange-400 to-red-500' },
  { name: 'Netflix', url: 'https://www.netflix.com', icon: '🎬', category: 'Entertainment', description: 'Stream movies', color: 'from-red-600 to-red-800' },
  { name: 'Spotify', url: 'https://open.spotify.com', icon: '🎵', category: 'Music', description: 'Stream music', color: 'from-green-400 to-green-600' },
  { name: 'Wikipedia', url: 'https://www.wikipedia.org', icon: '📖', category: 'Education', description: 'Encyclopedia', color: 'from-gray-500 to-gray-700' },
  { name: 'Discord', url: 'https://discord.com', icon: '💬', category: 'Social', description: 'Chat platform', color: 'from-indigo-500 to-purple-600' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com', icon: '💼', category: 'Professional', description: 'Professional network', color: 'from-blue-600 to-blue-800' }
]

export default function BrowserApp() {
  const [tabs, setTabs] = useState<Tab[]>([
    { 
      id: '1', 
      title: 'New Tab', 
      url: 'about:newtab', 
      isActive: true, 
      isLoading: false, 
      favicon: '🌐',
      canGoBack: false,
      canGoForward: false
    }
  ])
  
  const [activeTabId, setActiveTabId] = useState('1')
  const [urlInput, setUrlInput] = useState("")
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([
    { id: '1', title: 'Google', url: 'https://www.google.com', icon: '🔍', category: 'Search', timestamp: Date.now() },
    { id: '2', title: 'GitHub', url: 'https://github.com', icon: '🐙', category: 'Development', timestamp: Date.now() },
    { id: '3', title: 'YouTube', url: 'https://www.youtube.com', icon: '▶️', category: 'Entertainment', timestamp: Date.now() },
    { id: '4', title: 'ChatGPT', url: 'https://chatgpt.com', icon: '🤖', category: 'AI', timestamp: Date.now() }
  ])
  
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isPrivateMode, setIsPrivateMode] = useState(false)
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isSecure, setIsSecure] = useState(true)
  const [downloadProgress, setDownloadProgress] = useState<{ [key: string]: number }>({})
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Advanced features state
  const [downloads, setDownloads] = useState<Download[]>([])
  const [extensions, setExtensions] = useState<Extension[]>([
    { id: '1', name: 'AdBlock Plus', icon: '🛡️', description: 'Block ads and trackers', enabled: true, permissions: ['tabs', 'activeTab'], version: '3.15.0' },
    { id: '2', name: 'Dark Reader', icon: '🌙', description: 'Dark mode for every website', enabled: false, permissions: ['activeTab'], version: '4.9.58' },
    { id: '3', name: 'Password Manager', icon: '🔐', description: 'Secure password management', enabled: true, permissions: ['tabs', 'storage'], version: '2.1.4' },
    { id: '4', name: 'JSON Viewer', icon: '📋', description: 'Format and view JSON files', enabled: true, permissions: ['activeTab'], version: '1.8.2' }
  ])
  const [devTools, setDevTools] = useState<DevToolsState>({
    isOpen: false,
    activeTab: 'console',
    console: [
      { id: '1', type: 'log', message: 'Browser DevTools initialized', timestamp: Date.now() },
      { id: '2', type: 'info', message: 'Ready for debugging', timestamp: Date.now() }
    ],
    networkRequests: [
      { id: '1', method: 'GET', url: 'https://example.com', status: 200, responseTime: 123, size: 1024, timestamp: Date.now() }
    ]
  })
  const [showDownloads, setShowDownloads] = useState(false)
  const [showExtensions, setShowExtensions] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showCertificate, setShowCertificate] = useState(false)
  const [performanceMetrics, setPerformanceMetrics] = useState({
    loadTime: 0,
    domNodes: 0,
    memoryUsage: 0,
    networkRequests: 0
  })
  
  const activeTab = tabs.find(tab => tab.id === activeTabId)
  const webviewRefs = useRef<{ [key: string]: HTMLIFrameElement | null }>({})
  const urlInputRef = useRef<HTMLInputElement>(null)

  // Enhanced URL handling with smart routing
  const getDisplayUrl = useCallback((url: string): string => {
    if (url === 'about:newtab' || !url) return ''
    
    // Handle search queries
    if (!url.startsWith('http') && !url.includes('.')) {
      return `https://www.google.com/search?q=${encodeURIComponent(url)}`
    }
    
    // Add protocol if missing
    if (!url.startsWith('http')) {
      return `https://${url}`
    }
    
    return url
  }, [])

  // Open URL in new window/tab (real browsing)
  const navigateToUrl = useCallback((url: string) => {
    const finalUrl = getDisplayUrl(url)
    if (finalUrl) {
      window.open(finalUrl, '_blank', 'noopener,noreferrer')
    }
  }, [getDisplayUrl])

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Advanced tab management
  const createNewTab = useCallback((url = 'about:newtab', isPrivate = false) => {
    const newTab: Tab = {
      id: Date.now().toString(),
      title: url === 'about:newtab' ? 'New Tab' : 'Loading...',
      url,
      isActive: true,
      isLoading: url !== 'about:newtab',
      favicon: '🌐',
      isPrivate: isPrivate || isPrivateMode,
      canGoBack: false,
      canGoForward: false
    }

    setTabs(prev => prev.map(t => ({ ...t, isActive: false })).concat(newTab))
    setActiveTabId(newTab.id)
    setUrlInput(url === 'about:newtab' ? '' : url)
    setIsSecure(url.startsWith('https://') || url === 'about:newtab')
  }, [isPrivateMode])

  const closeTab = useCallback((tabId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const tabIndex = tabs.findIndex(tab => tab.id === tabId)
    const newTabs = tabs.filter(tab => tab.id !== tabId)

    if (newTabs.length === 0) {
      createNewTab()
      return
    }

    setTabs(newTabs)

    if (activeTabId === tabId) {
      const newActiveIndex = Math.max(0, tabIndex - 1)
      setActiveTabId(newTabs[newActiveIndex].id)
      const newActiveTab = newTabs[newActiveIndex]
      setUrlInput(newActiveTab.url === 'about:newtab' ? '' : newActiveTab.url)
    }
  }, [tabs, activeTabId, createNewTab])

  const switchTab = useCallback((tabId: string) => {
    setTabs(prev => prev.map(tab => ({ ...tab, isActive: tab.id === tabId })))
    setActiveTabId(tabId)
    const tab = tabs.find(t => t.id === tabId)
    setUrlInput(tab?.url === 'about:newtab' ? '' : tab?.url || '')
    setIsSecure(tab?.url?.startsWith('https://') || tab?.url === 'about:newtab' || false)
  }, [tabs])

  const navigateTab = useCallback((tabId: string, url: string) => {
    const normalizedUrl = normalizeUrl(url)
    
    // For real navigation, open in new browser window/tab
    if (!normalizedUrl.startsWith('about:')) {
      window.open(normalizedUrl, '_blank', 'noopener,noreferrer')
      
      // Update tab state to show it was "opened"
      setTabs(prev => prev.map(tab =>
        tab.id === tabId
          ? { 
              ...tab, 
              url: normalizedUrl, 
              isLoading: false, 
              title: `Opened: ${getDomainFromUrl(normalizedUrl)}`,
              favicon: getFaviconForUrl(normalizedUrl)
            }
          : tab
      ))
    } else {
      // Handle internal pages (like about:newtab)
      setTabs(prev => prev.map(tab =>
        tab.id === tabId
          ? { ...tab, url: normalizedUrl, isLoading: true, title: 'Loading...', favicon: '⏳' }
          : tab
      ))
      
      setTimeout(() => {
        setTabs(prev => prev.map(tab =>
          tab.id === tabId
            ? { 
                ...tab, 
                isLoading: false, 
                title: getDomainFromUrl(normalizedUrl),
                favicon: getFaviconForUrl(normalizedUrl)
              }
            : tab
        ))
      }, 500)
    }

    if (tabId === activeTabId) {
      setUrlInput(normalizedUrl)
      setIsSecure(normalizedUrl.startsWith('https://') || normalizedUrl === 'about:newtab')
    }

    // Add to history (unless private mode)
    if (!isPrivateMode && !normalizedUrl.startsWith('about:')) {
      const existingItem = history.find(item => item.url === normalizedUrl)
      if (existingItem) {
        setHistory(prev => [
          { ...existingItem, timestamp: Date.now(), visitCount: existingItem.visitCount + 1 },
          ...prev.filter(item => item.url !== normalizedUrl)
        ])
      } else {
        const historyItem: HistoryItem = {
          id: Date.now().toString(),
          url: normalizedUrl,
          title: getDomainFromUrl(normalizedUrl),
          timestamp: Date.now(),
          favicon: getFaviconForUrl(normalizedUrl),
          visitCount: 1
        }
        setHistory(prev => [historyItem, ...prev].slice(0, 500))
      }
    }
  }, [activeTabId, isPrivateMode, history])

  const normalizeUrl = (url: string): string => {
    if (url.startsWith('about:')) return url
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.includes('.') && !url.includes(' ')) {
        return `https://${url}`
      } else {
        return `https://www.google.com/search?q=${encodeURIComponent(url)}`
      }
    }
    return url
  }

  const getDomainFromUrl = (url: string): string => {
    try {
      if (url.startsWith('about:')) return 'New Tab'
      const domain = new URL(url).hostname.replace('www.', '')
      return domain.charAt(0).toUpperCase() + domain.slice(1)
    } catch {
      return 'Unknown'
    }
  }

  const getFaviconForUrl = (url: string): string => {
    if (url.includes('google')) return '🔍'
    if (url.includes('youtube')) return '▶️'
    if (url.includes('github')) return '🐙'
    if (url.includes('stackoverflow')) return '📚'
    if (url.includes('twitter') || url.includes('x.com')) return '🐦'
    if (url.includes('reddit')) return '🤖'
    if (url.includes('netflix')) return '🎬'
    if (url.includes('spotify')) return '🎵'
    if (url.includes('discord')) return '💬'
    if (url.includes('linkedin')) return '💼'
    if (url.includes('wikipedia')) return '📖'
    if (url.includes('chatgpt')) return '🤖'
    return '🌐'
  }

  const handleUrlSubmit = useCallback((e?: React.KeyboardEvent) => {
    if (e && e.key !== 'Enter') return
    if (activeTab && urlInput.trim()) {
      navigateTab(activeTab.id, urlInput.trim())
      setShowSuggestions(false)
    }
  }, [activeTab, urlInput, navigateTab])

  const handleBookmarkToggle = useCallback(() => {
    if (!activeTab || activeTab.url === 'about:newtab') return
    
    const existingBookmark = bookmarks.find(b => b.url === activeTab.url)
    
    if (existingBookmark) {
      setBookmarks(prev => prev.filter(b => b.id !== existingBookmark.id))
    } else {
      const newBookmark: Bookmark = {
        id: Date.now().toString(),
        title: activeTab.title || getDomainFromUrl(activeTab.url),
        url: activeTab.url,
        icon: activeTab.favicon || '🔖',
        category: 'General',
        timestamp: Date.now()
      }
      setBookmarks(prev => [...prev, newBookmark])
    }
  }, [activeTab, bookmarks])

  const isBookmarked = activeTab && bookmarks.some(b => b.url === activeTab.url)

  const handleUrlInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUrlInput(value)
    
    if (value.length > 2) {
      const suggestions = POPULAR_SITES
        .filter(site => site.name.toLowerCase().includes(value.toLowerCase()) ||
                       site.url.toLowerCase().includes(value.toLowerCase()) ||
                       site.description.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5)
        .map(site => site.url)
      
      const historySuggestions = history
        .filter(item => item.title.toLowerCase().includes(value.toLowerCase()) ||
                       item.url.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 3)
        .map(item => item.url)
      
      setSearchSuggestions([...new Set([...suggestions, ...historySuggestions])])
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }, [history])

  // Enhanced New Tab Page
  const NewTabPage = () => {
    const greeting = currentTime.getHours() < 12 ? 'Good morning' : 
                    currentTime.getHours() < 18 ? 'Good afternoon' : 'Good evening'
    
    const recentBookmarks = bookmarks.slice(0, 8)
    const frequentSites = history
      .sort((a, b) => b.visitCount - a.visitCount)
      .slice(0, 6)

    return (
      <div className="h-full bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-auto">
        {/* Header */}
        <div className="text-center pt-12 pb-8">
          <motion.h1 
            className="text-5xl font-light text-gray-800 dark:text-gray-200 mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {greeting}
          </motion.h1>
          <motion.p 
            className="text-lg text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </motion.p>
        </div>

        {/* Search Bar */}
        <motion.div 
          className="max-w-2xl mx-auto px-6 mb-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="relative">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              ref={urlInputRef}
              type="text"
              value={urlInput}
              onChange={handleUrlInputChange}
              placeholder="Search Google or type a URL"
              className="w-full pl-16 pr-6 py-5 text-lg rounded-full border-2 border-gray-200 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
              onKeyDown={handleUrlSubmit}
            />
          </div>
          
          {/* Search Suggestions */}
          <AnimatePresence>
            {showSuggestions && searchSuggestions.length > 0 && (
              <motion.div
                className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-600 overflow-hidden"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {searchSuggestions.map((suggestion, index) => (
                  <motion.div
                    key={suggestion}
                    className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-4"
                    onClick={() => {
                      setUrlInput(suggestion)
                      if (activeTab) navigateTab(activeTab.id, suggestion)
                      setShowSuggestions(false)
                    }}
                    whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                  >
                    <Globe className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-800 dark:text-gray-200">{suggestion}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="max-w-7xl mx-auto px-6">
          {/* Quick Access Bookmarks */}
          {recentBookmarks.length > 0 && (
            <motion.div 
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Quick Access
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {recentBookmarks.map((bookmark, index) => (
                  <motion.div
                    key={bookmark.id}
                    className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-lg cursor-pointer transition-all duration-300 border border-gray-100 dark:border-gray-700"
                    onClick={() => activeTab && navigateTab(activeTab.id, bookmark.url)}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  >
                    <div className="text-3xl mb-3 text-center">{bookmark.icon}</div>
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200 text-center truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {bookmark.title}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Popular Sites */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Popular Sites
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {POPULAR_SITES.map((site, index) => (
                <motion.div
                  key={site.name}
                  className={`group relative bg-gradient-to-br ${site.color} rounded-2xl p-6 cursor-pointer overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300`}
                  onClick={() => activeTab && navigateTab(activeTab.id, site.url)}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * index }}
                >
                  <div className="relative z-10">
                    <div className="text-3xl mb-3">{site.icon}</div>
                    <div className="text-white font-semibold mb-1">{site.name}</div>
                    <div className="text-white/80 text-xs">{site.description}</div>
                  </div>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recently Visited */}
          {frequentSites.length > 0 && (
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Recently Visited
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {frequentSites.map((site, index) => (
                  <motion.div
                    key={site.id}
                    className="group bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 border border-gray-100 dark:border-gray-700"
                    onClick={() => activeTab && navigateTab(activeTab.id, site.url)}
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-xl">{site.favicon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 dark:text-gray-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {site.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {site.url.replace('https://', '').replace('http://', '')}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {site.visitCount} visits
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-white dark:bg-gray-900 flex flex-col">
      {/* Browser Header */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2">
        <div className="flex items-center gap-2">
          {/* Navigation Controls */}
          <div className="flex items-center gap-1">
            <motion.button
              className={`p-2 rounded-lg transition-colors ${
                activeTab?.canGoBack 
                  ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700' 
                  : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
              disabled={!activeTab?.canGoBack}
              whileHover={activeTab?.canGoBack ? { scale: 1.05 } : {}}
              whileTap={activeTab?.canGoBack ? { scale: 0.95 } : {}}
            >
              <ArrowLeft className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              className={`p-2 rounded-lg transition-colors ${
                activeTab?.canGoForward 
                  ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700' 
                  : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
              disabled={!activeTab?.canGoForward}
              whileHover={activeTab?.canGoForward ? { scale: 1.05 } : {}}
              whileTap={activeTab?.canGoForward ? { scale: 0.95 } : {}}
            >
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              className="p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              onClick={() => activeTab && navigateTab(activeTab.id, activeTab.url)}
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Address Bar */}
          <div className="flex-1 relative">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-700 rounded-full px-4 py-2 border border-gray-200 dark:border-gray-600 focus-within:ring-2 focus-within:ring-blue-500/30">
              {isSecure ? (
                <Lock className="w-4 h-4 text-green-600 dark:text-green-400" />
              ) : (
                <Unlock className="w-4 h-4 text-orange-500" />
              )}
              
              <input
                type="text"
                value={urlInput}
                onChange={handleUrlInputChange}
                onKeyDown={handleUrlSubmit}
                placeholder="Search or type URL"
                className="flex-1 bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none text-sm"
                onFocus={() => urlInputRef.current?.select()}
              />
              
              <motion.button
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                onClick={handleBookmarkToggle}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isBookmarked ? (
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                ) : (
                  <StarOff className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                )}
              </motion.button>
            </div>
          </div>

          {/* Browser Controls */}
          <div className="flex items-center gap-1">
            <motion.button
              className="p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              onClick={() => createNewTab()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Home className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              className={`p-2 rounded-lg transition-colors ${
                isPrivateMode 
                  ? 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30' 
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              onClick={() => setIsPrivateMode(!isPrivateMode)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isPrivateMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </motion.button>
            
            <motion.button
              className="p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setShowSettings(!showSettings)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MoreHorizontal className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center flex-1 min-w-0">
          <AnimatePresence>
            {tabs.map((tab, index) => (
              <motion.div
                key={tab.id}
                className={`group relative flex items-center gap-2 px-4 py-3 max-w-xs min-w-0 cursor-pointer border-r border-gray-200 dark:border-gray-700 ${
                  tab.isActive 
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => switchTab(tab.id)}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.2 }}
                layout
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="text-sm">
                    {tab.isLoading ? (
                      <motion.div
                        className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    ) : (
                      tab.favicon
                    )}
                  </div>
                  <div className="text-sm font-medium truncate">{tab.title}</div>
                  {tab.isPrivate && (
                    <EyeOff className="w-3 h-3 text-purple-500" />
                  )}
                </div>
                
                <motion.button
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                  onClick={(e) => closeTab(tab.id, e)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-3 h-3" />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        <motion.button
          className="p-3 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          onClick={() => createNewTab()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative">
        {activeTab?.url === 'about:newtab' ? (
          <NewTabPage />
        ) : (
          <div className="h-full relative bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-green-900/20 dark:via-gray-800 dark:to-blue-900/20 overflow-auto">
            <div className="flex items-center justify-center min-h-full p-8">
              <div className="text-center max-w-2xl">
                <motion.div
                  className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  <ExternalLink className="w-12 h-12 text-white" />
                </motion.div>
                
                <motion.h2
                  className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Site Opened Successfully!
                </motion.h2>
                
                <motion.p
                  className="text-lg text-gray-600 dark:text-gray-400 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {activeTab?.url} has been opened in a new browser window.
                </motion.p>
                
                <motion.div
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-2xl">{activeTab?.favicon}</div>
                    <div className="text-left flex-1">
                      <div className="font-semibold text-gray-800 dark:text-gray-200">
                        {getDomainFromUrl(activeTab?.url || '')}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {activeTab?.url?.replace('https://', '').replace('http://', '')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="text-sm font-medium">Opened</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Due to browser security policies, websites cannot be embedded directly. 
                    This browser opens sites in new tabs for the best experience.
                  </div>
                </motion.div>
                
                <motion.div
                  className="flex gap-3 justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.button
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    onClick={() => window.open(activeTab?.url, '_blank', 'noopener,noreferrer')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Again
                  </motion.button>
                  
                  <motion.button
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                    onClick={() => createNewTab()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    New Tab
                  </motion.button>
                </motion.div>
                
                {/* Features Info */}
                <motion.div
                  className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Secure Browsing</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Opens sites in isolated browser windows for maximum security
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Fast Performance</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      No iframe limitations - full website functionality
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Universal Access</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Access any website without CORS restrictions
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
