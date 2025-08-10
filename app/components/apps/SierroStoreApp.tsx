"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search, Download, Star, TrendingUp, Filter, Grid3X3,
  List, Heart, Settings, User, ShoppingCart, Play, Pause,
  Code, Gamepad2, BookOpen, Calculator, Camera, Mail,
  Calendar, Terminal, FileText, Palette, Globe, BarChart3,
  Shield, Volume2, Cloud, Activity, Brain, Sparkles,
  Zap, Lightning, Cpu, Database, Lock, Key, Coins,
  Users, MessageSquare, Share2, ExternalLink, Copy,
  Check, X, AlertTriangle, Info, Upload, Download as DownloadIcon,
  Package, Rocket, Wrench, Bug, Gift, Trophy, Target,
  Eye, EyeOff, ThumbsUp, ThumbsDown, Flag, Bookmark,
  Archive, Trash2, Edit, Plus, Minus, RefreshCw,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Menu, MoreHorizontal, Bell, Wifi, WifiOff, Signal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { storeAPI, type AppMetadata, type AppReview, type UserProfile, type DeploymentResult } from "@/app/lib/store-api"
import { toast } from "sonner"

// Speech Recognition types
interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((this: SpeechRecognition, ev: any) => any) | null;
  onerror: ((this: SpeechRecognition, ev: any) => any) | null;
  onend: ((this: SpeechRecognition, ev: any) => any) | null;
  onstart: ((this: SpeechRecognition, ev: any) => any) | null;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

interface StoreSettings {
  viewMode: 'grid' | 'list'
  sortBy: 'rating' | 'downloads' | 'price' | 'name' | 'date'
  filterBy: 'all' | 'free' | 'paid' | 'featured' | 'trending' | 'verified'
  autoUpdate: boolean
  notifications: {
    newApps: boolean
    updates: boolean
    promotions: boolean
  }
  privacy: {
    analytics: boolean
    recommendations: boolean
    shareUsage: boolean
  }
  developer: {
    mode: boolean
    sandbox: boolean
    analytics: boolean
  }
}

interface InstallationProgress {
  appId: string
  progress: number
  status: 'downloading' | 'installing' | 'configuring' | 'completed' | 'failed'
  logs: string[]
}

export default function SierroStoreApp() {
  // Core State
  const [apps, setApps] = useState<AppMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchResults, setSearchResults] = useState<AppMetadata[]>([])
  const [categories, setCategories] = useState<string[]>([])
  
  // UI State
  const [selectedApp, setSelectedApp] = useState<AppMetadata | null>(null)
  const [activeTab, setActiveTab] = useState("discover")
  const [showAppDetails, setShowAppDetails] = useState(false)
  const [showDeployDialog, setShowDeployDialog] = useState(false)
  
  // User & Social
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [installedApps, setInstalledApps] = useState<string[]>([])
  const [wishlist, setWishlist] = useState<string[]>([])
  const [reviews, setReviews] = useState<AppReview[]>([])
  
  // Settings & Preferences
  const [settings, setSettings] = useState<StoreSettings>({
    viewMode: 'grid',
    sortBy: 'rating',
    filterBy: 'all',
    autoUpdate: true,
    notifications: {
      newApps: true,
      updates: true,
      promotions: false
    },
    privacy: {
      analytics: false,
      recommendations: true,
      shareUsage: false
    },
    developer: {
      mode: false,
      sandbox: true,
      analytics: false
    }
  })
  
  // Advanced Features
  const [installations, setInstallations] = useState<InstallationProgress[]>([])
  const [aiRecommendations, setAiRecommendations] = useState<AppMetadata[]>([])
  const [deploymentLogs, setDeploymentLogs] = useState<string[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  
  // Refs
  const installationIntervals = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Initialize Store
  useEffect(() => {
    initializeStore()
  }, [])

  const initializeStore = async () => {
    try {
      setLoading(true)
      
      // Load user profile
      const profile = storeAPI.getUserProfile()
      setUserProfile(profile)
      
      // Load saved preferences
      const savedSettings = localStorage.getItem('sierro-store-settings')
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
      
      // Load installed apps from localStorage
      const savedInstalled = localStorage.getItem('sierro-store-installed')
      if (savedInstalled) {
        setInstalledApps(JSON.parse(savedInstalled))
      }
      
      const savedWishlist = localStorage.getItem('sierro-store-wishlist')
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist))
      }
      
      // Fetch apps from store API
      const fetchedApps = await storeAPI.getApps({ limit: 50 })
      setApps(fetchedApps)
      
      // Extract categories
      const uniqueCategories = ['All', ...Array.from(new Set(fetchedApps.map(app => app.category)))]
      setCategories(uniqueCategories)
      
      // Get AI recommendations
      if (profile && settings.privacy.recommendations) {
        const recommendations = await storeAPI.getAIRecommendations()
        setAiRecommendations(recommendations)
      }
      
      // Load analytics if in developer mode
      if (settings.developer.mode) {
        const storeAnalytics = await storeAPI.getStoreAnalytics()
        setAnalytics(storeAnalytics)
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load store data')
    } finally {
      setLoading(false)
    }
  }

  const searchApps = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    
    try {
      const results = await storeAPI.getApps({
        search: query,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        sort: settings.sortBy,
        filter: settings.filterBy !== 'all' ? settings.filterBy : undefined,
        limit: 20
      })
      setSearchResults(results)
    } catch (error) {
      toast.error('Failed to search apps')
    }
  }, [selectedCategory, settings.sortBy, settings.filterBy])

  const handleAppInstall = async (app: AppMetadata) => {
    if (installedApps.includes(app.id)) {
      toast.info(`${app.name} is already installed`)
      return
    }

    try {
      // Add to installations queue
      const installProgress: InstallationProgress = {
        appId: app.id,
        progress: 0,
        status: 'downloading',
        logs: [`Starting installation of ${app.name}...`]
      }
      
      setInstallations(prev => [...prev, installProgress])
      
      // Simulate installation progress
      const interval = setInterval(() => {
        setInstallations(prev => prev.map(install => {
          if (install.appId === app.id) {
            const newProgress = Math.min(install.progress + Math.random() * 15, 100)
            let newStatus = install.status
            const newLogs = [...install.logs]
            
            if (newProgress >= 25 && install.status === 'downloading') {
              newStatus = 'installing'
              newLogs.push(`Downloaded ${app.name} (${app.size})`)
              newLogs.push('Installing dependencies...')
            } else if (newProgress >= 75 && install.status === 'installing') {
              newStatus = 'configuring'
              newLogs.push('Configuring app environment...')
              newLogs.push('Setting up security sandbox...')
            } else if (newProgress >= 100) {
              newStatus = 'completed'
              newLogs.push(`${app.name} installed successfully!`)
            }
            
            return {
              ...install,
              progress: newProgress,
              status: newStatus,
              logs: newLogs
            }
          }
          return install
        }))
      }, 500)
      
      installationIntervals.current.set(app.id, interval)
      
      // Actual installation via API
      const result = await storeAPI.installApp(app.id)
      
      if (result.success) {
        // Add to installed apps
        const updatedInstalled = [...installedApps, app.id]
        setInstalledApps(updatedInstalled)
        localStorage.setItem('sierro-store-installed', JSON.stringify(updatedInstalled))
        
        // Remove from installations after delay
        setTimeout(() => {
          setInstallations(prev => prev.filter(install => install.appId !== app.id))
          const interval = installationIntervals.current.get(app.id)
          if (interval) {
            clearInterval(interval)
            installationIntervals.current.delete(app.id)
          }
        }, 3000)
        
        toast.success(`${app.name} installed successfully!`, {
          action: {
            label: 'Open',
            onClick: () => toast.info(`Opening ${app.name}...`)
          }
        })
      } else {
        throw new Error(result.error || 'Installation failed')
      }
      
    } catch (error) {
      // Update installation status to failed
      setInstallations(prev => prev.map(install => 
        install.appId === app.id 
          ? { ...install, status: 'failed', logs: [...install.logs, `Error: ${error instanceof Error ? error.message : 'Installation failed'}`] }
          : install
      ))
      
      toast.error(`Failed to install ${app.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const toggleWishlist = (appId: string) => {
    const updatedWishlist = wishlist.includes(appId)
      ? wishlist.filter(id => id !== appId)
      : [...wishlist, appId]
    
    setWishlist(updatedWishlist)
    localStorage.setItem('sierro-store-wishlist', JSON.stringify(updatedWishlist))
    
    const app = apps.find(a => a.id === appId)
    if (app) {
      toast.success(
        updatedWishlist.includes(appId) 
          ? `Added ${app.name} to wishlist` 
          : `Removed ${app.name} from wishlist`
      )
    }
  }

  const handleAppDetails = async (app: AppMetadata) => {
    setSelectedApp(app)
    setShowAppDetails(true)
    
    // Load reviews
    try {
      const appReviews = await storeAPI.getAppReviews(app.id, 20)
      setReviews(appReviews)
    } catch (error) {
      toast.error('Failed to load reviews')
    }
  }

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)
    localStorage.setItem('sierro-store-settings', JSON.stringify(updated))
  }

  const filteredApps = useMemo(() => {
    let filtered = searchResults.length > 0 ? searchResults : apps
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(app => app.category === selectedCategory)
    }
    
    switch (settings.filterBy) {
      case 'free':
        filtered = filtered.filter(app => app.price === 0)
        break
      case 'paid':
        filtered = filtered.filter(app => app.price > 0)
        break
      case 'featured':
        filtered = filtered.filter(app => app.featured)
        break
      case 'trending':
        filtered = filtered.filter(app => app.trending)
        break
      case 'verified':
        filtered = filtered.filter(app => app.verified)
        break
    }
    
    // Sort apps
    filtered.sort((a, b) => {
      switch (settings.sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'downloads':
          return parseInt(b.downloads) - parseInt(a.downloads)
        case 'price':
          return a.price - b.price
        case 'name':
          return a.name.localeCompare(b.name)
        case 'date':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        default:
          return 0
      }
    })
    
    return filtered
  }, [apps, searchResults, selectedCategory, settings.filterBy, settings.sortBy])

  const AppCard = ({ app, index }: { app: AppMetadata; index: number }) => (
    <motion.div
      key={app.id}
      className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all cursor-pointer group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => handleAppDetails(app)}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
          {app.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white truncate">{app.name}</h3>
          <p className="text-white/60 text-sm truncate">{app.developer}</p>
          <div className="flex items-center gap-2 mt-1">
            {app.verified && <Shield className="w-4 h-4 text-blue-400" />}
            {app.featured && <Star className="w-4 h-4 text-yellow-400" />}
            {app.trending && <TrendingUp className="w-4 h-4 text-green-400" />}
            {app.blockchain.verified && <Lock className="w-4 h-4 text-purple-400" />}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            toggleWishlist(app.id)
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart className={`w-4 h-4 ${wishlist.includes(app.id) ? 'fill-current text-red-400' : 'text-white/60'}`} />
        </Button>
      </div>
      
      <p className="text-white/80 text-sm mb-3 line-clamp-2">{app.description}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-white text-sm font-semibold">{app.rating}</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {app.category}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white font-bold">
            {app.price === 0 ? 'Free' : `$${app.price}`}
          </span>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleAppInstall(app)
            }}
            disabled={installedApps.includes(app.id) || installations.some(i => i.appId === app.id)}
            className={`${
              installedApps.includes(app.id) 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {installedApps.includes(app.id) ? (
              <>
                <Check className="w-4 h-4 mr-1" />
                Installed
              </>
            ) : installations.some(i => i.appId === app.id) ? (
              <>
                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                Installing
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-1" />
                {app.price === 0 ? 'Install' : 'Buy'}
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  )

  // Loading State
  if (loading) {
    return (
      <div className="h-full bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 flex items-center justify-center">
        <motion.div 
          className="text-center text-white"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="relative mb-6">
            <div className="animate-spin w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto" />
            <Package className="absolute inset-0 w-8 h-8 m-auto text-purple-300 animate-pulse" />
          </div>
          <motion.h2 
            className="text-2xl font-bold mb-2"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            AI Store Intelligence Loading...
          </motion.h2>
          <p className="text-purple-100 mb-4">Curating the perfect apps for you</p>
          <div className="flex justify-center space-x-2">
            {[Brain, Shield, Sparkles].map((Icon, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
              >
                <Icon className="w-5 h-5 text-purple-200" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-full bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <motion.div 
          className="bg-black/20 backdrop-blur-lg border-b border-white/10 p-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <Package className="w-8 h-8" />
                Sierro Store Pro
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold">
                  AI Powered
                </Badge>
              </h1>
              <p className="text-white/70">Discover, Deploy, and Manage Apps with Intelligence</p>
            </div>
            
            <div className="flex items-center gap-3">
              {userProfile && (
                <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={userProfile.avatar} />
                    <AvatarFallback>{userProfile.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-white text-sm font-medium">{userProfile.name}</span>
                </div>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveTab('wishlist')}
                className="text-white hover:bg-white/20 relative"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5">
                    {wishlist.length}
                  </Badge>
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveTab('installations')}
                className="text-white hover:bg-white/20 relative"
              >
                <Download className="w-5 h-5" />
                {installations.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs min-w-[20px] h-5">
                    {installations.length}
                  </Badge>
                )}
              </Button>
              
              {settings.developer.mode && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDeployDialog(true)}
                  className="text-white hover:bg-white/20"
                >
                  <Rocket className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
                <Input
                  placeholder="Search apps, games, tools, and more..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    searchApps(e.target.value)
                  }}
                  className="pl-10 bg-white/20 border-white/30 text-white placeholder-white/70 backdrop-blur-sm"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSearchQuery('')
                      setSearchResults([])
                    }}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <Select value={settings.sortBy} onValueChange={(value) => updateSettings({ sortBy: value as any })}>
                <SelectTrigger className="w-40 bg-white/20 border-white/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="downloads">Downloads</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="date">Recent</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={settings.filterBy} onValueChange={(value) => updateSettings({ filterBy: value as any })}>
                <SelectTrigger className="w-40 bg-white/20 border-white/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Apps</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="trending">Trending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex border rounded-lg bg-white/10">
                <Button
                  variant={settings.viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => updateSettings({ viewMode: "grid" })}
                  className="text-white"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={settings.viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => updateSettings({ viewMode: "list" })}
                  className="text-white"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "ghost"}
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap text-white"
                  size="sm"
                >
                  {category}
                  {category !== 'All' && (
                    <Badge className="ml-2 bg-white/20 text-white">
                      {apps.filter(app => app.category === category).length}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="bg-black/10 backdrop-blur-sm border-b border-white/10">
            <TabsList className="w-full bg-transparent justify-start p-0 h-auto overflow-x-auto">
              {[
                { id: 'discover', label: 'Discover', icon: Sparkles },
                { id: 'trending', label: 'Trending', icon: TrendingUp },
                { id: 'ai-picks', label: 'AI Picks', icon: Brain },
                { id: 'installed', label: `Installed (${installedApps.length})`, icon: Package },
                { id: 'wishlist', label: `Wishlist (${wishlist.length})`, icon: Heart },
                { id: 'installations', label: 'Downloads', icon: Download },
                ...(settings.developer.mode ? [{ id: 'developer', label: 'Developer', icon: Code }] : []),
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/20 border-b-2 border-transparent data-[state=active]:border-white/50 rounded-none px-4 py-3 whitespace-nowrap"
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                  {(tab.id === 'installations' && installations.length > 0) && (
                    <Badge className="ml-2 bg-blue-500 text-white text-xs">
                      {installations.length}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="flex-1 overflow-auto">
            {/* Discover Tab */}
            <TabsContent value="discover" className="p-6 space-y-6">
              {/* Featured Apps Section */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-400" />
                  Featured Apps
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {apps.filter(app => app.featured).slice(0, 6).map((app, index) => (
                    <AppCard key={app.id} app={app} index={index} />
                  ))}
                </div>
              </div>

              {/* All Apps Section */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Package className="w-6 h-6" />
                  {selectedCategory === 'All' ? 'All Apps' : selectedCategory}
                  <Badge className="bg-white/20 text-white">
                    {filteredApps.length}
                  </Badge>
                </h2>
                
                {filteredApps.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-white/40 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Apps Found</h3>
                    <p className="text-white/60">Try adjusting your search or filter criteria</p>
                  </div>
                ) : (
                  <div className={
                    settings.viewMode === 'grid' 
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                      : "space-y-4"
                  }>
                    {filteredApps.map((app, index) => (
                      <AppCard key={app.id} app={app} index={index} />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* AI Recommendations Tab */}
            <TabsContent value="ai-picks" className="p-6">
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Brain className="w-8 h-8 text-purple-400" />
                    <h2 className="text-3xl font-bold text-white">AI-Powered Recommendations</h2>
                    <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
                  </div>
                  <p className="text-white/70 max-w-2xl mx-auto">
                    Our AI analyzes your preferences, usage patterns, and similar users to recommend the perfect apps for you.
                  </p>
                </div>

                {aiRecommendations.length === 0 ? (
                  <div className="text-center py-12">
                    <Brain className="w-16 h-16 text-white/40 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Building Your Profile</h3>
                    <p className="text-white/60 mb-6">Install a few apps to help our AI understand your preferences</p>
                    <Button onClick={() => setActiveTab('discover')} className="bg-purple-600 hover:bg-purple-700">
                      Discover Apps
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {aiRecommendations.map((app, index) => (
                      <motion.div
                        key={app.id}
                        className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-xl p-6 border border-purple-300/20"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <Target className="w-5 h-5 text-purple-400" />
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-300/20">
                            {app.aiInsights.userFitScore}% Match
                          </Badge>
                        </div>
                        <AppCard app={app} index={index} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Installations Tab */}
            <TabsContent value="installations" className="p-6">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Download className="w-6 h-6" />
                  Active Downloads
                </h2>

                {installations.length === 0 ? (
                  <div className="text-center py-12">
                    <Download className="w-16 h-16 text-white/40 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Active Downloads</h3>
                    <p className="text-white/60">Install apps to see download progress here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {installations.map((installation) => {
                      const app = apps.find(a => a.id === installation.appId)
                      if (!app) return null

                      return (
                        <motion.div
                          key={installation.appId}
                          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                              {app.name[0]}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-white">{app.name}</h3>
                              <p className="text-white/60 capitalize">{installation.status}</p>
                            </div>
                            <Badge 
                              className={`${
                                installation.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                                installation.status === 'failed' ? 'bg-red-500/20 text-red-300' :
                                'bg-blue-500/20 text-blue-300'
                              }`}
                            >
                              {Math.round(installation.progress)}%
                            </Badge>
                          </div>
                          
                          <Progress 
                            value={installation.progress} 
                            className="mb-4"
                          />
                          
                          <div className="bg-black/20 rounded-lg p-3 max-h-32 overflow-y-auto">
                            <div className="space-y-1">
                              {installation.logs.map((log, index) => (
                                <p key={index} className="text-white/80 text-xs font-mono">
                                  {log}
                                </p>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="p-6">
              <div className="space-y-6 max-w-4xl">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
                  <Settings className="w-6 h-6" />
                  Store Settings
                </h2>
                
                {/* General Settings */}
                <Card className="bg-white/10 border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">General</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-white">Auto-update Apps</label>
                      <Switch
                        checked={settings.autoUpdate}
                        onCheckedChange={(autoUpdate) => updateSettings({ autoUpdate })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-white">Developer Mode</label>
                      <Switch
                        checked={settings.developer.mode}
                        onCheckedChange={(mode) => updateSettings({ 
                          developer: { ...settings.developer, mode } 
                        })}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Notifications */}
                <Card className="bg-white/10 border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">Notifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-white">New Apps</label>
                      <Switch
                        checked={settings.notifications.newApps}
                        onCheckedChange={(newApps) => updateSettings({ 
                          notifications: { ...settings.notifications, newApps } 
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-white">App Updates</label>
                      <Switch
                        checked={settings.notifications.updates}
                        onCheckedChange={(updates) => updateSettings({ 
                          notifications: { ...settings.notifications, updates } 
                        })}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Privacy */}
                <Card className="bg-white/10 border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Privacy & Security
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-white">Enable AI Recommendations</label>
                      <Switch
                        checked={settings.privacy.recommendations}
                        onCheckedChange={(recommendations) => updateSettings({ 
                          privacy: { ...settings.privacy, recommendations } 
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-white">Share Usage Analytics</label>
                      <Switch
                        checked={settings.privacy.analytics}
                        onCheckedChange={(analytics) => updateSettings({ 
                          privacy: { ...settings.privacy, analytics } 
                        })}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* App Details Dialog */}
      <Dialog open={showAppDetails} onOpenChange={setShowAppDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
          {selectedApp && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                    {selectedApp.name[0]}
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-2xl text-white mb-2">
                      {selectedApp.name}
                    </DialogTitle>
                    <p className="text-gray-300 mb-3">by {selectedApp.developer}</p>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="text-white font-semibold">{selectedApp.rating}</span>
                        <span className="text-gray-400">({selectedApp.reviewCount} reviews)</span>
                      </div>
                      <Badge variant="secondary">{selectedApp.category}</Badge>
                      {selectedApp.verified && (
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-300/20">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white mb-2">
                      {selectedApp.price === 0 ? 'Free' : `$${selectedApp.price}`}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAppInstall(selectedApp)}
                        disabled={installedApps.includes(selectedApp.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {installedApps.includes(selectedApp.id) ? 'Installed' : 'Install'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => toggleWishlist(selectedApp.id)}
                      >
                        <Heart className={`w-4 h-4 ${wishlist.includes(selectedApp.id) ? 'fill-current text-red-400' : ''}`} />
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <DialogDescription className="text-gray-300 leading-relaxed">
                {selectedApp.longDescription || selectedApp.description}
              </DialogDescription>

              {/* App Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                  <p className="text-gray-400 text-sm">Version</p>
                  <p className="text-white font-semibold">{selectedApp.version}</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                  <p className="text-gray-400 text-sm">Size</p>
                  <p className="text-white font-semibold">{selectedApp.size}</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                  <p className="text-gray-400 text-sm">Downloads</p>
                  <p className="text-white font-semibold">{selectedApp.downloads}</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                  <p className="text-gray-400 text-sm">Updated</p>
                  <p className="text-white font-semibold">
                    {selectedApp.lastUpdated.toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Reviews Section */}
              {reviews.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Reviews</h3>
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {reviews.slice(0, 5).map((review) => (
                      <div key={review.id} className="bg-gray-800/50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={review.userAvatar} />
                            <AvatarFallback>{review.userName[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-white font-medium">{review.userName}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-600'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-gray-400 text-sm">
                                {review.timestamp.toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-300">{review.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
