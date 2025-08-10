"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Cloud, Sun, CloudRain, CloudSnow, Zap, Search, MapPin, RefreshCw,
  Thermometer, Droplets, Wind, Eye, Gauge, Compass, Moon, Heart,
  Share2, Settings, Bell, AlertTriangle, TrendingUp, Clock,
  Camera, Lightbulb, Leaf, Activity, Brain, Sparkles, Map,
  Satellite, Radar, BarChart3, Globe, Shield, Target,
  Mic, Volume2, Smartphone, Monitor, Layers, Navigation,
  Calendar, Sunrise, Sunset, Timer, Lightning, Star,
  Telescope, Waves, TreePine, Flower, Car, Plane, Umbrella,
  Shirt, Coffee, Home, School, ShoppingBag, Bike, Mountain,
  ZapIcon, Play, Pause, VolumeX, Users, MessageSquare,
  Download, Upload, Wifi, WifiOff, Bluetooth, Radio, Headphones,
  ChevronLeft, ChevronRight, X, Plus, Minus, Filter, Menu
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { weatherAPI, type ExtendedCurrentWeather, type WeatherLocation, type WeatherAlert } from "@/app/lib/weather-api"
import { toast } from "sonner"

interface WeatherSettings {
  temperatureUnit: 'celsius' | 'fahrenheit'
  windUnit: 'kmh' | 'mph' | 'ms'
  pressureUnit: 'hPa' | 'inHg' | 'mmHg'
  notifications: {
    enabled: boolean
    alerts: boolean
    dailyForecast: boolean
    extremeWeather: boolean
  }
  privacy: {
    shareLocation: boolean
    analytics: boolean
  }
  display: {
    theme: 'auto' | 'light' | 'dark'
    animations: boolean
    backgroundEffects: boolean
  }
  aiInsights: boolean
  voiceCommands: boolean
  augmentedReality: boolean
}

interface SavedLocation {
  id: string
  location: WeatherLocation
  nickname?: string
  favorite: boolean
  alerts: boolean
}

export default function WeatherApp() {
  // Core State
  const [weather, setWeather] = useState<ExtendedCurrentWeather | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  
  // Location & Search
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<WeatherLocation[]>([])
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([])
  const [activeLocationId, setActiveLocationId] = useState<string | null>(null)
  
  // UI State
  const [activeTab, setActiveTab] = useState("current")
  const [refreshing, setRefreshing] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  
  // Settings & Preferences
  const [settings, setSettings] = useState<WeatherSettings>({
    temperatureUnit: 'celsius',
    windUnit: 'kmh',
    pressureUnit: 'hPa',
    notifications: {
      enabled: true,
      alerts: true,
      dailyForecast: false,
      extremeWeather: true
    },
    privacy: {
      shareLocation: true,
      analytics: false
    },
    display: {
      theme: 'auto',
      animations: true,
      backgroundEffects: true
    },
    aiInsights: true,
    voiceCommands: false,
    augmentedReality: false
  })
  
  // Real-time Features
  const [alerts, setAlerts] = useState<WeatherAlert[]>([])
  const [isListening, setIsListening] = useState(false)
  const [arMode, setArMode] = useState(false)
  const recognitionRef = useRef<any>(null)
  const alertUnsubscribeRef = useRef<(() => void) | null>(null)
  
  // Advanced Features
  const [weatherAnimation, setWeatherAnimation] = useState<string>('sunny')
  const [aiInsights, setAiInsights] = useState<string[]>([])
  const [sharableLink, setSharableLink] = useState<string | null>(null)

  // Initialize app
  useEffect(() => {
    initializeApp()
    setupSpeechRecognition()
    return () => {
      if (alertUnsubscribeRef.current) {
        alertUnsubscribeRef.current()
      }
    }
  }, [])

  const initializeApp = async () => {
    try {
      setLoading(true)
      
      // Load user preferences
      const savedSettings = localStorage.getItem('weather-app-settings')
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
      
      const savedLocs = localStorage.getItem('weather-app-locations')
      if (savedLocs) {
        setSavedLocations(JSON.parse(savedLocs))
      }
      
      // Get current location weather
      const currentWeather = await weatherAPI.getCurrentLocationWeather()
      setWeather(currentWeather)
      setWeatherAnimation(getWeatherAnimation(currentWeather.current.condition.main))
      
      // Setup real-time weather alerts
      if (settings.notifications.enabled) {
        const unsubscribe = await weatherAPI.subscribeToWeatherAlerts(
          currentWeather.location,
          handleWeatherAlert
        )
        alertUnsubscribeRef.current = unsubscribe
      }
      
      // Generate AI insights
      if (settings.aiInsights) {
        generateAIInsights(currentWeather)
      }
      
      setLastUpdate(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load weather data')
    } finally {
      setLoading(false)
    }
  }

  const setupSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = 'en-US'
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript.toLowerCase()
          handleVoiceCommand(transcript)
        }
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
        }
        
        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }
    }
  }

  const handleVoiceCommand = async (command: string) => {
    try {
      if (command.includes('weather') && command.includes('in')) {
        const cityMatch = command.match(/weather in (.+?)(?:\s|$)/)
        if (cityMatch && cityMatch[1]) {
          await searchLocation(cityMatch[1])
        }
      } else if (command.includes('refresh') || command.includes('update')) {
        await handleRefresh()
      } else if (command.includes('tomorrow')) {
        setActiveTab('daily')
      } else if (command.includes('hourly') || command.includes('forecast')) {
        setActiveTab('hourly')
      } else if (command.includes('settings')) {
        setActiveTab('settings')
      } else {
        toast.info('Voice command not recognized. Try: "Weather in [city]", "Refresh weather", "Show tomorrow", or "Show hourly"')
      }
    } catch (error) {
      toast.error('Failed to process voice command')
    }
  }

  const startListening = () => {
    if (recognitionRef.current && settings.voiceCommands) {
      setIsListening(true)
      recognitionRef.current.start()
      toast.info('Listening for voice commands...')
    } else {
      toast.error('Voice commands not supported or disabled')
    }
  }

  const handleWeatherAlert = (alert: WeatherAlert) => {
    setAlerts(prev => [alert, ...prev.slice(0, 9)]) // Keep only 10 most recent alerts
    
    if (settings.notifications.alerts) {
      // Show browser notification if permissions are granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`Weather Alert: ${alert.title}`, {
          body: alert.description,
          icon: '/weather-icon.png',
          tag: alert.id
        })
      }
      
      toast.warning(`${alert.title}: ${alert.description}`, {
        duration: 10000,
        action: {
          label: 'View Details',
          onClick: () => setActiveTab('alerts')
        }
      })
    }
  }

  const generateAIInsights = async (weatherData: ExtendedCurrentWeather) => {
    // Simulate AI-powered insights generation
    const insights = [
      `Based on current conditions, ${weatherData.insights.recommendation.clothing.join(' and ')} would be ideal.`,
      `Air quality is ${weatherData.current.air_quality.main.toLowerCase()}. ${weatherData.current.air_quality.recommendation}`,
      `${weatherData.insights.photographyConditions}`,
      `Energy tip: ${weatherData.insights.energyTips[0]}`,
      `Garden advice: ${weatherData.insights.gardeningAdvice}`
    ]
    
    setAiInsights(insights)
  }

  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    
    try {
      const results = await weatherAPI.searchLocations(query)
      setSearchResults(results)
    } catch (error) {
      toast.error('Failed to search locations')
    }
  }

  const selectLocation = async (location: WeatherLocation) => {
    try {
      setLoading(true)
      const weatherData = await weatherAPI.getWeatherByLocation(location)
      setWeather(weatherData)
      setWeatherAnimation(getWeatherAnimation(weatherData.current.condition.main))
      setSearchOpen(false)
      setSearchQuery('')
      setSearchResults([])
      setLastUpdate(new Date())
      
      if (settings.aiInsights) {
        generateAIInsights(weatherData)
      }
    } catch (error) {
      toast.error('Failed to load weather data for selected location')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    if (!weather) return
    
    try {
      setRefreshing(true)
      const updatedWeather = await weatherAPI.getWeatherByLocation(weather.location)
      setWeather(updatedWeather)
      setWeatherAnimation(getWeatherAnimation(updatedWeather.current.condition.main))
      setLastUpdate(new Date())
      
      if (settings.aiInsights) {
        generateAIInsights(updatedWeather)
      }
      
      toast.success('Weather data updated!')
    } catch (error) {
      toast.error('Failed to refresh weather data')
    } finally {
      setRefreshing(false)
    }
  }

  const shareWeather = async () => {
    if (!weather) return
    
    const shareData = {
      title: `Weather in ${weather.location.name}`,
      text: `Current weather: ${weather.current.temp}°${settings.temperatureUnit === 'celsius' ? 'C' : 'F'}, ${weather.current.condition.description}`,
      url: window.location.href
    }
    
    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback: copy to clipboard
        const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`
        await navigator.clipboard.writeText(shareText)
        toast.success('Weather info copied to clipboard!')
      }
    } catch (error) {
      toast.error('Failed to share weather info')
    }
  }

  const getWeatherAnimation = (condition: string): string => {
    const animationMap: { [key: string]: string } = {
      'Clear': 'sunny',
      'Clouds': 'cloudy', 
      'Rain': 'rainy',
      'Snow': 'snowy',
      'Thunderstorm': 'stormy',
      'Mist': 'foggy'
    }
    return animationMap[condition] || 'sunny'
  }

  const convertTemperature = (temp: number): number => {
    return settings.temperatureUnit === 'fahrenheit' 
      ? Math.round(temp * 9/5 + 32) 
      : Math.round(temp)
  }

  const getWeatherIcon = (condition: string, size: string = "w-8 h-8") => {
    const iconProps = { className: `${size} transition-all` }
    
    switch (condition?.toLowerCase()) {
      case 'clear':
      case 'sunny':
        return <Sun {...iconProps} className={`${iconProps.className} text-yellow-400`} />
      case 'clouds':
      case 'cloudy':
      case 'partly cloudy':
        return <Cloud {...iconProps} className={`${iconProps.className} text-gray-400`} />
      case 'rain':
      case 'rainy':
        return <CloudRain {...iconProps} className={`${iconProps.className} text-blue-400`} />
      case 'snow':
      case 'snowy':
        return <CloudSnow {...iconProps} className={`${iconProps.className} text-blue-200`} />
      case 'thunderstorm':
      case 'stormy':
        return <Zap {...iconProps} className={`${iconProps.className} text-yellow-300`} />
      default:
        return <Sun {...iconProps} className={`${iconProps.className} text-yellow-400`} />
    }
  }

  // Loading State
  if (loading && !weather) {
    return (
      <div className="h-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 dark:from-gray-900 dark:via-blue-900 dark:to-gray-800 flex items-center justify-center">
        <motion.div 
          className="text-center text-white"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="relative mb-6">
            <div className="animate-spin w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto" />
            <Sparkles className="absolute inset-0 w-6 h-6 m-auto text-yellow-300 animate-pulse" />
          </div>
          <motion.h2 
            className="text-2xl font-bold mb-2"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            AI Weather Intelligence Loading...
          </motion.h2>
          <p className="text-blue-100 mb-4">Analyzing atmospheric conditions with neural networks</p>
          <div className="flex justify-center space-x-2">
            {[Brain, Globe, Satellite].map((Icon, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
              >
                <Icon className="w-5 h-5 text-blue-200" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  // Error State
  if (error && !weather) {
    return (
      <div className="h-full bg-gradient-to-br from-red-400 to-red-600 dark:from-gray-900 dark:to-red-900 flex items-center justify-center">
        <motion.div 
          className="text-center text-white p-8 max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
          >
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-2">Weather System Offline</h2>
          <p className="mb-6 text-red-100">{error}</p>
          <Button 
            onClick={initializeApp}
            className="bg-white text-red-600 hover:bg-gray-100 font-semibold"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reconnect to Weather Network
          </Button>
        </motion.div>
      </div>
    )
  }

  if (!weather) return null

  return (
    <div className="h-full bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 dark:from-gray-900 dark:via-blue-900 dark:to-gray-800 overflow-hidden relative">
      {/* Animated Background Effects */}
      {settings.display.backgroundEffects && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {weatherAnimation === 'rainy' && (
            <div className="rain-animation">
              {Array.from({ length: 100 }, (_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-0.5 h-8 bg-blue-200 opacity-60"
                  style={{
                    left: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [-20, window.innerHeight + 20],
                  }}
                  transition={{
                    duration: 0.5 + Math.random() * 0.5,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
          )}
          {weatherAnimation === 'snowy' && (
            <div className="snow-animation">
              {Array.from({ length: 50 }, (_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full opacity-80"
                  style={{
                    left: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [-20, window.innerHeight + 20],
                    x: [0, Math.random() * 100 - 50],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 3,
                    repeat: Infinity,
                    delay: Math.random() * 3,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="h-full flex flex-col relative z-10">
        {/* Header */}
        <motion.div 
          className="bg-black/20 backdrop-blur-lg border-b border-white/10 p-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Brain className="w-6 h-6" />
                AI Weather Pro
              </h1>
              <p className="text-white/70 text-sm">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Voice Commands */}
              <Button
                onClick={startListening}
                variant="ghost"
                size="icon"
                className={`text-white hover:bg-white/20 transition-all ${isListening ? 'bg-red-500 animate-pulse' : ''}`}
                disabled={!settings.voiceCommands}
              >
                <Mic className="w-5 h-5" />
              </Button>
              
              {/* Share Weather */}
              <Button
                onClick={shareWeather}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
              >
                <Share2 className="w-5 h-5" />
              </Button>
              
              {/* Refresh */}
              <Button
                onClick={handleRefresh}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                disabled={refreshing}
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              
              {/* Settings */}
              <Button
                onClick={() => setActiveTab('settings')}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
              <Input
                placeholder="Search any location on Earth..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  searchLocation(e.target.value)
                }}
                className="pl-10 bg-white/20 border-white/30 text-white placeholder-white/70 backdrop-blur-sm"
              />
              {settings.voiceCommands && (
                <Button
                  onClick={startListening}
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
                >
                  <Mic className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            {/* Search Results */}
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 bg-white/20 backdrop-blur-lg rounded-lg border border-white/20 mt-2 max-h-60 overflow-y-auto z-50"
                >
                  {searchResults.map((location, index) => (
                    <motion.button
                      key={`${location.lat}-${location.lon}`}
                      onClick={() => selectLocation(location)}
                      className="w-full text-left p-3 text-white hover:bg-white/20 transition-colors flex items-center gap-3 first:rounded-t-lg last:rounded-b-lg"
                      whileHover={{ x: 4 }}
                    >
                      <MapPin className="w-4 h-4 text-white/70" />
                      <div>
                        <div className="font-medium">{location.name}</div>
                        <div className="text-sm text-white/70">{location.country}</div>
                      </div>
                      {location.population && (
                        <div className="ml-auto text-xs text-white/50">
                          {location.population.toLocaleString()} people
                        </div>
                      )}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="bg-black/10 backdrop-blur-sm border-b border-white/10">
            <TabsList className="w-full bg-transparent justify-start p-0 h-auto overflow-x-auto">
              {[
                { id: 'current', label: 'Current', icon: Sun },
                { id: 'hourly', label: 'Hourly', icon: Clock },
                { id: 'daily', label: '7-Day', icon: Calendar },
                { id: 'radar', label: 'Radar', icon: Radar },
                { id: 'maps', label: 'Maps', icon: Map },
                { id: 'insights', label: 'AI Insights', icon: Brain },
                { id: 'alerts', label: `Alerts${alerts.length > 0 ? ` (${alerts.length})` : ''}`, icon: Bell },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/20 border-b-2 border-transparent data-[state=active]:border-white/50 rounded-none px-4 py-3 whitespace-nowrap"
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                  {tab.id === 'alerts' && alerts.length > 0 && (
                    <Badge className="ml-2 bg-red-500 text-white text-xs">
                      {alerts.length}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="flex-1 overflow-auto">
            {/* Current Weather Tab */}
            <TabsContent value="current" className="p-6 space-y-6 h-full">
              {/* Main Weather Card */}
              <motion.div
                className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <MapPin className="w-6 h-6" />
                      {weather.location.name}
                    </h2>
                    <p className="text-white/70">{weather.location.country}</p>
                    <p className="text-white/60 text-sm">
                      {weather.current.condition.description}
                    </p>
                  </div>
                  <div className="text-right">
                    {getWeatherIcon(weather.current.condition.main, "w-16 h-16")}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-6xl font-light text-white mb-2">
                      {convertTemperature(weather.current.temp)}°
                      <span className="text-2xl text-white/70">
                        {settings.temperatureUnit === 'celsius' ? 'C' : 'F'}
                      </span>
                    </div>
                    <p className="text-white/70">
                      Feels like {convertTemperature(weather.current.feels_like)}°
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Sunrise className="w-5 h-5 text-yellow-300" />
                      <span className="text-white/80">
                        {weather.current.sunrise.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Sunset className="w-5 h-5 text-orange-300" />
                      <span className="text-white/80">
                        {weather.current.sunset.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Moon className="w-5 h-5 text-blue-200" />
                      <span className="text-white/80 text-sm">
                        {Math.round(weather.current.moon.illumination)}% illuminated
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Weather Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    icon: Droplets,
                    label: 'Humidity',
                    value: `${weather.current.humidity}%`,
                    color: 'text-blue-400'
                  },
                  {
                    icon: Wind,
                    label: 'Wind Speed',
                    value: `${Math.round(weather.current.wind.speed)} km/h`,
                    color: 'text-green-400'
                  },
                  {
                    icon: Eye,
                    label: 'Visibility',
                    value: `${weather.current.visibility} km`,
                    color: 'text-purple-400'
                  },
                  {
                    icon: Gauge,
                    label: 'Pressure',
                    value: `${weather.current.pressure} hPa`,
                    color: 'text-orange-400'
                  },
                  {
                    icon: Thermometer,
                    label: 'UV Index',
                    value: weather.current.uv_index.toString(),
                    color: weather.current.uv_index > 7 ? 'text-red-400' : weather.current.uv_index > 5 ? 'text-yellow-400' : 'text-green-400'
                  },
                  {
                    icon: Cloud,
                    label: 'Cloud Cover',
                    value: `${weather.current.cloud_cover}%`,
                    color: 'text-gray-400'
                  },
                  {
                    icon: Compass,
                    label: 'Wind Direction',
                    value: weather.current.wind.direction_name,
                    color: 'text-cyan-400'
                  },
                  {
                    icon: Activity,
                    label: 'Air Quality',
                    value: weather.current.air_quality.main,
                    color: weather.current.air_quality.aqi <= 2 ? 'text-green-400' : weather.current.air_quality.aqi <= 3 ? 'text-yellow-400' : 'text-red-400'
                  }
                ].map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    className="bg-white/20 backdrop-blur-lg rounded-xl p-4 border border-white/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className={`${metric.color} mb-2`}>
                      <metric.icon className="w-6 h-6" />
                    </div>
                    <p className="text-white/70 text-sm mb-1">{metric.label}</p>
                    <p className="text-white font-semibold text-lg">{metric.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* AI Insights Section */}
              {settings.aiInsights && aiInsights.length > 0 && (
                <motion.div
                  className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-300/20"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Brain className="w-6 h-6 text-purple-300" />
                    AI Weather Insights
                    <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                  </h3>
                  <div className="space-y-3">
                    {aiInsights.map((insight, index) => (
                      <motion.div
                        key={index}
                        className="bg-white/10 rounded-lg p-3 border border-white/10"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <p className="text-white/90 text-sm leading-relaxed">{insight}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </TabsContent>

            {/* Hourly Forecast Tab */}
            <TabsContent value="hourly" className="p-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                  <Clock className="w-6 h-6" />
                  24-Hour Forecast
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {weather.forecast.hourly.slice(0, 24).map((hour, index) => (
                    <motion.div
                      key={index}
                      className="bg-white/20 backdrop-blur-lg rounded-xl p-4 border border-white/10"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="text-center">
                        <p className="text-white/70 text-sm mb-2">
                          {hour.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <div className="flex justify-center mb-2">
                          {getWeatherIcon(hour.condition)}
                        </div>
                        <p className="text-white font-bold text-lg mb-1">
                          {convertTemperature(hour.temp)}°
                        </p>
                        <div className="text-xs space-y-1 text-white/60">
                          <div className="flex items-center justify-center gap-1">
                            <Droplets className="w-3 h-3" />
                            {hour.precipitation_probability}%
                          </div>
                          <div className="flex items-center justify-center gap-1">
                            <Wind className="w-3 h-3" />
                            {Math.round(hour.wind_speed)} km/h
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Daily Forecast Tab */}
            <TabsContent value="daily" className="p-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                  <Calendar className="w-6 h-6" />
                  7-Day Forecast
                </h3>
                <div className="space-y-3">
                  {weather.forecast.daily.map((day, index) => (
                    <motion.div
                      key={index}
                      className="bg-white/20 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:bg-white/30 transition-all"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-20 text-white font-semibold">
                            {day.date.toLocaleDateString([], { weekday: 'short' })}
                          </div>
                          <div className="flex items-center gap-3">
                            {getWeatherIcon(day.condition)}
                            <div className="text-white/80 text-sm">
                              {day.condition}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-white">
                          <div className="flex items-center gap-2">
                            <Droplets className="w-4 h-4 text-blue-300" />
                            <span className="text-sm">{Math.round(day.precipitation)}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">
                              {convertTemperature(day.temp.max)}°
                            </span>
                            <span className="text-white/60 text-lg">
                              {convertTemperature(day.temp.min)}°
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Other tabs would go here... */}
            <TabsContent value="settings" className="p-6">
              <div className="space-y-6 max-w-2xl">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
                  <Settings className="w-6 h-6" />
                  Weather Settings
                </h3>
                
                {/* Temperature Unit */}
                <Card className="bg-white/20 border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">Temperature Unit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={settings.temperatureUnit}
                      onValueChange={(value) => updateSettings({ temperatureUnit: value as 'celsius' | 'fahrenheit' })}
                    >
                      <SelectTrigger className="bg-white/20 border-white/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="celsius">Celsius (°C)</SelectItem>
                        <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Notifications */}
                <Card className="bg-white/20 border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">Notifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-white">Enable Notifications</label>
                      <Switch
                        checked={settings.notifications.enabled}
                        onCheckedChange={(enabled) => 
                          updateSettings({ 
                            notifications: { ...settings.notifications, enabled } 
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-white">Weather Alerts</label>
                      <Switch
                        checked={settings.notifications.alerts}
                        onCheckedChange={(alerts) => 
                          updateSettings({ 
                            notifications: { ...settings.notifications, alerts } 
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-white">Extreme Weather Warnings</label>
                      <Switch
                        checked={settings.notifications.extremeWeather}
                        onCheckedChange={(extremeWeather) => 
                          updateSettings({ 
                            notifications: { ...settings.notifications, extremeWeather } 
                          })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* AI Features */}
                <Card className="bg-white/20 border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      AI Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-white">AI Weather Insights</label>
                      <Switch
                        checked={settings.aiInsights}
                        onCheckedChange={(aiInsights) => updateSettings({ aiInsights })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-white">Voice Commands</label>
                      <Switch
                        checked={settings.voiceCommands}
                        onCheckedChange={(voiceCommands) => updateSettings({ voiceCommands })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-white">Augmented Reality Mode</label>
                      <Switch
                        checked={settings.augmentedReality}
                        onCheckedChange={(augmentedReality) => updateSettings({ augmentedReality })}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Visual Effects */}
                <Card className="bg-white/20 border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">Visual Effects</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-white">Background Weather Effects</label>
                      <Switch
                        checked={settings.display.backgroundEffects}
                        onCheckedChange={(backgroundEffects) => 
                          updateSettings({ 
                            display: { ...settings.display, backgroundEffects } 
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-white">Smooth Animations</label>
                      <Switch
                        checked={settings.display.animations}
                        onCheckedChange={(animations) => 
                          updateSettings({ 
                            display: { ...settings.display, animations } 
                          })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {!settings.notifications.enabled && (
                  <Button 
                    onClick={enableNotifications}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Enable Browser Notifications
                  </Button>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )

  // Helper function to update settings
  function updateSettings(newSettings: Partial<WeatherSettings>) {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)
    localStorage.setItem('weather-app-settings', JSON.stringify(updated))
  }

  // Helper function to enable notifications
  async function enableNotifications() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        updateSettings({ 
          notifications: { 
            ...settings.notifications, 
            enabled: true 
          } 
        })
        toast.success('Notifications enabled!')
      } else {
        toast.error('Notification permission denied')
      }
    }
  }
}
