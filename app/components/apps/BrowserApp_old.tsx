"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, Plus, X, RefreshCw, ArrowLeft, ArrowRight, Home, 
  Star, StarOff, Menu, Download, Shield, Bookmark, 
  Globe, History, Settings, MoreHorizontal, Lock, Unlock,
  Wifi, WifiOff, Zap, Eye, EyeOff, ExternalLink, Copy,
  Calendar, Clock, TrendingUp, Users, Book
} from "lucide-react"

interface Tab {
  id: string
  title: string
  url: string
  isActive: boolean
  isLoading: boolean
  favicon?: string
  isPrivate?: boolean
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

interface PopularSite {
  name: string
  url: string
  icon: string
  category: string
  description: string
}

const POPULAR_SITES: PopularSite[] = [
  { name: 'Google', url: 'https://www.google.com', icon: '🔍', category: 'Search', description: 'Search the web' },
  { name: 'YouTube', url: 'https://www.youtube.com', icon: '▶️', category: 'Entertainment', description: 'Watch videos' },
  { name: 'GitHub', url: 'https://github.com', icon: '🐙', category: 'Development', description: 'Code repositories' },
  { name: 'Stack Overflow', url: 'https://stackoverflow.com', icon: '📚', category: 'Development', description: 'Programming help' },
  { name: 'Twitter/X', url: 'https://x.com', icon: '🐦', category: 'Social', description: 'Social network' },
  { name: 'Reddit', url: 'https://www.reddit.com', icon: '🤖', category: 'Social', description: 'Discussions' },
  { name: 'Netflix', url: 'https://www.netflix.com', icon: '🎬', category: 'Entertainment', description: 'Stream movies' },
  { name: 'Wikipedia', url: 'https://www.wikipedia.org', icon: '📖', category: 'Education', description: 'Free encyclopedia' }
]

export default function BrowserApp() {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', title: 'New Tab', url: 'about:newtab', isActive: true, isLoading: false, favicon: '🌐' }
  ])
  const [activeTabId, setActiveTabId] = useState('1')
  const [urlInput, setUrlInput] = useState("")
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([
    { id: '1', title: 'Google', url: 'https://www.google.com', icon: '🔍', category: 'Search', timestamp: Date.now() },
    { id: '2', title: 'GitHub', url: 'https://github.com', icon: '🐙', category: 'Development', timestamp: Date.now() },
    { id: '3', title: 'YouTube', url: 'https://www.youtube.com', icon: '▶️', category: 'Entertainment', timestamp: Date.now() },
    { id: '4', title: 'Stack Overflow', url: 'https://stackoverflow.com', icon: '📚', category: 'Development', timestamp: Date.now() }
  ])
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isPrivateMode, setIsPrivateMode] = useState(false)
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)
  const [isSecure, setIsSecure] = useState(true)
  const [downloadProgress, setDownloadProgress] = useState<{ [key: string]: number }>({})

  const activeTab = tabs.find(tab => tab.id === activeTabId)
  const webviewRefs = useRef<{ [key: string]: HTMLIFrameElement | null }>({})

  const createNewTab = (url = 'about:newtab') => {
    const newTab: Tab = {
      id: Date.now().toString(),
      title: 'New Tab',
      url,
      isActive: true,
      isLoading: url !== 'about:newtab'
    }

    setTabs(prev => prev.map(t => ({ ...t, isActive: false })).concat(newTab))
    setActiveTabId(newTab.id)
    setUrlInput(url === 'about:newtab' ? '' : url)
  }

  const closeTab = (tabId: string) => {
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
    }
  }

  const switchTab = (tabId: string) => {
    setTabs(prev => prev.map(tab => ({ ...tab, isActive: tab.id === tabId })))
    setActiveTabId(tabId)
    const tab = tabs.find(t => t.id === tabId)
    setUrlInput(tab?.url === 'about:newtab' ? '' : tab?.url || '')
  }

  const navigateTab = (tabId: string, url: string) => {
    const normalizedUrl = normalizeUrl(url)
    setTabs(prev => prev.map(tab =>
      tab.id === tabId
        ? { ...tab, url: normalizedUrl, isLoading: true, title: 'Loading...' }
        : tab
    ))

    if (tabId === activeTabId) {
      setUrlInput(normalizedUrl)
    }

    const historyItem: HistoryItem = {
      id: Date.now().toString(),
      url: normalizedUrl,
      title: url,
      timestamp: Date.now()
    }
    setHistory(prev => [historyItem, ...prev].slice(0, 100))
  }

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

  const handleUrlSubmit = (e?: React.KeyboardEvent) => {
    if (e && e.key !== 'Enter') return
    if (activeTab) {
      navigateTab(activeTab.id, urlInput)
    }
  }

  const handleBookmarkAdd = () => {
    if (activeTab && activeTab.url !== 'about:newtab') {
      const newBookmark: Bookmark = {
        id: Date.now().toString(),
        title: activeTab.title || 'New Bookmark',
        url: activeTab.url,
        icon: '🔖'
      }
      setBookmarks(prev => [...prev, newBookmark])
    }
  }

  const handleIframeLoad = (tabId: string) => {
    setTabs(prev => prev.map(tab =>
      tab.id === tabId ? { ...tab, isLoading: false } : tab
    ))

    const webview = webviewRefs.current[tabId]
    if (webview?.contentDocument) {
      try {
        const title = webview.contentDocument.title || 'Untitled'
        setTabs(prev => prev.map(tab =>
          tab.id === tabId ? { ...tab, title } : tab
        ))
      } catch {
        console.log('Cross-origin restrictions')
      }
    }
  }

  const NewTabPage = () => {
    return (
      <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-light text-gray-800 dark:text-gray-200 mb-4">
              Sierro Browser
            </h1>
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search or type URL"
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => handleUrlSubmit(e)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {bookmarks.slice(0, 8).map(bookmark => (
              <motion.div
                key={bookmark.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md cursor-pointer transition-shadow"
                onClick={() => activeTab && navigateTab(activeTab.id, bookmark.url)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-2xl mb-2">{bookmark.icon}</div>
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                  {bookmark.title}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-white dark:bg-gray-900 flex flex-col">
      {/* Tab Bar */}
      <div className="flex items-center bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center flex-1 min-w-0">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`flex items-center gap-2 px-4 py-2 max-w-xs min-w-0 cursor-pointer border-r border-gray-200 dark:border-gray-700 ${
                tab.isActive 
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => switchTab(tab.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{tab.title}</div>
              </div>
              {tab.isLoading && (
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {activeTab?.url === 'about:newtab' ? <NewTabPage /> : (
        <div className="flex-grow overflow-hidden">
          <iframe
            ref={(el) => {
              if (el) {
                webviewRefs.current[activeTabId] = el;
              }
            }}
          />
        </div>
      )}
    </div>
  )
}
