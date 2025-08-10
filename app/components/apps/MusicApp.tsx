"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Shuffle,
  Repeat,
  Heart,
  List,
  Search,
  Plus,
  Download,
  Share,
  Settings,
  Mic2,
  Radio,
  Music,
  Disc,
  Users,
  TrendingUp,
  Clock,
  Star,
  Folder,
  Filter,
  MoreHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  Headphones,
  Sliders,
  Waves,
  BarChart3,
  Globe,
  Bookmark,
  Calendar,
  Tag,
  Repeat1,
  Volume1,
  Maximize2,
  Minimize2,
  Menu
} from "lucide-react"

interface Song {
  id: string
  title: string
  artist: string
  album: string
  duration: string
  cover: string
  liked: boolean
  genre?: string
  year?: number
  playCount?: number
  lyrics?: string
  audioUrl?: string
  quality?: 'low' | 'medium' | 'high' | 'lossless'
  bitrate?: string
}

interface Playlist {
  id: string
  name: string
  description: string
  cover: string
  songs: string[]
  createdAt: Date
  isPublic: boolean
  collaborative: boolean
}

interface RadioStation {
  id: string
  name: string
  genre: string
  description: string
  streamUrl: string
  cover: string
  listeners: number
  country: string
}

interface EqualizerBand {
  frequency: string
  gain: number
}

interface MusicStats {
  totalSongs: number
  totalDuration: string
  topGenre: string
  mostPlayedArtist: string
  listeningTime: string
}

type ViewMode = 'library' | 'playlists' | 'radio' | 'discover' | 'lyrics' | 'stats'
type RepeatMode = 'none' | 'all' | 'one'
type AudioQuality = 'low' | 'medium' | 'high' | 'lossless'

export default function MusicApp() {
  // Core player state
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(75)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [shuffle, setShuffle] = useState(false)
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none')
  const [audioQuality, setAudioQuality] = useState<AudioQuality>('high')
  
  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('library')
  const [searchQuery, setSearchQuery] = useState("")
  const [showSidebar, setShowSidebar] = useState(true)
  const [showMiniPlayer, setShowMiniPlayer] = useState(false)
  const [showEqualizer, setShowEqualizer] = useState(false)
  const [showLyrics, setShowLyrics] = useState(false)
  const [showQueue, setShowQueue] = useState(false)
  
  // Advanced features state
  const [playlists, setPlaylists] = useState<Playlist[]>([
    {
      id: '1',
      name: 'My Favorites',
      description: 'Your most loved tracks',
      cover: '❤️',
      songs: ['1', '3', '5'],
      createdAt: new Date(),
      isPublic: false,
      collaborative: false
    },
    {
      id: '2',
      name: 'Classic Rock',
      description: 'Timeless rock anthems',
      cover: '🎸',
      songs: ['1', '2', '3'],
      createdAt: new Date(),
      isPublic: true,
      collaborative: true
    }
  ])
  
  const [radioStations] = useState<RadioStation[]>([
    {
      id: '1',
      name: 'Classic Rock Radio',
      genre: 'Rock',
      description: 'The best classic rock hits',
      streamUrl: 'http://example.com/stream1',
      cover: '🎸',
      listeners: 15420,
      country: 'USA'
    },
    {
      id: '2',
      name: 'Jazz Lounge',
      genre: 'Jazz',
      description: 'Smooth jazz for relaxation',
      streamUrl: 'http://example.com/stream2',
      cover: '🎷',
      listeners: 8750,
      country: 'USA'
    },
    {
      id: '3',
      name: 'Electronic Beats',
      genre: 'Electronic',
      description: 'Latest electronic music',
      streamUrl: 'http://example.com/stream3',
      cover: '🎛️',
      listeners: 22100,
      country: 'UK'
    }
  ])
  
  const [equalizerBands, setEqualizerBands] = useState<EqualizerBand[]>([
    { frequency: '60Hz', gain: 0 },
    { frequency: '170Hz', gain: 0 },
    { frequency: '310Hz', gain: 0 },
    { frequency: '600Hz', gain: 0 },
    { frequency: '1kHz', gain: 0 },
    { frequency: '3kHz', gain: 0 },
    { frequency: '6kHz', gain: 0 },
    { frequency: '12kHz', gain: 0 },
    { frequency: '14kHz', gain: 0 },
    { frequency: '16kHz', gain: 0 }
  ])
  
  const [playQueue, setPlayQueue] = useState<Song[]>([])
  const [playHistory, setPlayHistory] = useState<Song[]>([])
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null)
  const [isRadioMode, setIsRadioMode] = useState(false)
  const [currentRadioStation, setCurrentRadioStation] = useState<RadioStation | null>(null)
  
  // Statistics and analytics
  const [musicStats] = useState<MusicStats>({
    totalSongs: 1247,
    totalDuration: '3d 14h 26m',
    topGenre: 'Rock',
    mostPlayedArtist: 'Queen',
    listeningTime: '847h 23m'
  })
  
  const audioRef = useRef<HTMLAudioElement>(null)

  // Mock playlist
  const playlist: Song[] = [
    {
      id: '1',
      title: 'Bohemian Rhapsody',
      artist: 'Queen',
      album: 'A Night at the Opera',
      duration: '5:55',
      cover: '/placeholder.jpg',
      liked: true
    },
    {
      id: '2',
      title: 'Hotel California',
      artist: 'Eagles',
      album: 'Hotel California',
      duration: '6:30',
      cover: '/placeholder.jpg',
      liked: false
    },
    {
      id: '3',
      title: 'Stairway to Heaven',
      artist: 'Led Zeppelin',
      album: 'Led Zeppelin IV',
      duration: '8:02',
      cover: '/placeholder.jpg',
      liked: true
    },
    {
      id: '4',
      title: 'Imagine',
      artist: 'John Lennon',
      album: 'Imagine',
      duration: '3:03',
      cover: '/placeholder.jpg',
      liked: false
    },
    {
      id: '5',
      title: 'Hey Jude',
      artist: 'The Beatles',
      album: 'The Beatles 1967-1970',
      duration: '7:11',
      cover: '/placeholder.jpg',
      liked: true
    }
  ]

  const filteredPlaylist = playlist.filter(song => 
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause()
    } else {
      audioRef.current?.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSongSelect = (song: Song) => {
    setCurrentSong(song)
    setIsPlaying(true)
    // In a real app, you would load the audio file here
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Enhanced functions
  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 'one': return <Repeat1 className="w-4 h-4 text-purple-400" />
      case 'all': return <Repeat className="w-4 h-4 text-purple-400" />
      default: return <Repeat className="w-4 h-4 text-white/60" />
    }
  }
  
  const handleNextSong = () => {
    const currentIndex = playlist.findIndex(song => song.id === currentSong?.id)
    if (currentIndex < playlist.length - 1) {
      setCurrentSong(playlist[currentIndex + 1])
    } else if (repeatMode === 'all') {
      setCurrentSong(playlist[0])
    }
  }
  
  const handlePrevSong = () => {
    const currentIndex = playlist.findIndex(song => song.id === currentSong?.id)
    if (currentIndex > 0) {
      setCurrentSong(playlist[currentIndex - 1])
    } else if (repeatMode === 'all') {
      setCurrentSong(playlist[playlist.length - 1])
    }
  }
  
  const toggleRepeat = () => {
    const modes: RepeatMode[] = ['none', 'all', 'one']
    const currentIndex = modes.indexOf(repeatMode)
    setRepeatMode(modes[(currentIndex + 1) % modes.length])
  }
  
  const handleEqualizerChange = (index: number, gain: number) => {
    setEqualizerBands(prev => prev.map((band, i) => 
      i === index ? { ...band, gain } : band
    ))
  }
  
  const resetEqualizer = () => {
    setEqualizerBands(prev => prev.map(band => ({ ...band, gain: 0 })))
  }

  // Main render
  return (
    <div className="h-full bg-gradient-to-br from-purple-900/20 via-black/40 to-blue-900/20 backdrop-blur-xl flex">
      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div 
            className="w-64 bg-black/20 backdrop-blur-lg border-r border-white/10 flex flex-col"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 256, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Logo */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Music className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold text-white">MusicApp</h1>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="p-4 flex-1">
              <nav className="space-y-2">
                {[
                  { id: 'library', label: 'Your Library', icon: Music },
                  { id: 'playlists', label: 'Playlists', icon: List },
                  { id: 'radio', label: 'Radio', icon: Radio },
                  { id: 'discover', label: 'Discover', icon: TrendingUp },
                  { id: 'stats', label: 'Statistics', icon: BarChart3 }
                ].map(item => {
                  const Icon = item.icon
                  const isActive = viewMode === item.id
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => setViewMode(item.id as ViewMode)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                        isActive 
                          ? 'bg-white/10 text-white shadow-lg' 
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </motion.button>
                  )
                })}
              </nav>
              
              {/* Quick Playlists */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Playlists</h3>
                  <motion.button
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Plus className="w-4 h-4 text-white/60" />
                  </motion.button>
                </div>
                <div className="space-y-2">
                  {playlists.map(playlist => (
                    <motion.div
                      key={playlist.id}
                      className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs">
                        {playlist.cover}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white/90 text-sm font-medium truncate">{playlist.name}</div>
                        <div className="text-white/40 text-xs">{playlist.songs.length} songs</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* User Profile */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">Music Lover</div>
                  <div className="text-white/40 text-xs">Premium</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="h-16 bg-black/10 backdrop-blur-sm border-b border-white/10 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu className="w-5 h-5 text-white" />
            </motion.button>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search for songs, artists, albums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-80 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => setShowEqualizer(!showEqualizer)}
              className={`p-2 rounded-lg transition-colors ${
                showEqualizer ? 'bg-purple-500/20 text-purple-400' : 'hover:bg-white/10 text-white/60'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sliders className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              onClick={() => setShowQueue(!showQueue)}
              className={`p-2 rounded-lg transition-colors ${
                showQueue ? 'bg-purple-500/20 text-purple-400' : 'hover:bg-white/10 text-white/60'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <List className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="w-5 h-5 text-white/60" />
            </motion.button>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 flex min-h-0">
          {/* Main View */}
          <div className={`flex-1 overflow-auto ${showQueue ? 'border-r border-white/10' : ''}`}>
            {viewMode === 'library' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Your Library</h2>
                  <div className="flex items-center gap-2">
                    <motion.button
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Recently Added
                    </motion.button>
                  </div>
                </div>
                
                {/* Songs Grid */}
                <div className="space-y-2">
                  {filteredPlaylist.map((song, index) => (
                    <motion.div
                      key={song.id}
                      className={`group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all ${
                        currentSong?.id === song.id ? 'bg-white/10' : ''
                      }`}
                      onClick={() => handleSongSelect(song)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <Music className="w-5 h-5 text-white" />
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 rounded-lg transition-opacity">
                            <Play className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium truncate">{song.title}</div>
                          <div className="text-white/60 text-sm truncate">{song.artist} • {song.album}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation()
                            // Toggle like functionality here
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Heart className={`w-4 h-4 ${song.liked ? 'text-red-400 fill-current' : 'text-white/40'}`} />
                        </motion.button>
                        
                        <span className="text-white/40 text-sm w-12 text-right">{song.duration}</span>
                        
                        <motion.button
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <MoreHorizontal className="w-4 h-4 text-white/40" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            {viewMode === 'radio' && (
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Radio Stations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {radioStations.map(station => (
                    <motion.div
                      key={station.id}
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 cursor-pointer transition-all"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-4xl mb-3">{station.cover}</div>
                      <h3 className="text-white font-semibold mb-1">{station.name}</h3>
                      <p className="text-white/60 text-sm mb-2">{station.description}</p>
                      <div className="flex items-center justify-between text-xs text-white/40">
                        <span>{station.genre}</span>
                        <span>{station.listeners.toLocaleString()} listeners</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            {viewMode === 'playlists' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Your Playlists</h2>
                  <motion.button
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white text-sm transition-colors flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-4 h-4" />
                    Create Playlist
                  </motion.button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {playlists.map((playlist, index) => (
                    <motion.div
                      key={playlist.id}
                      className="group bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 cursor-pointer transition-all"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="w-full aspect-square mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-4xl">
                        {playlist.cover}
                      </div>
                      <h3 className="text-white font-semibold mb-1 truncate">{playlist.name}</h3>
                      <p className="text-white/60 text-sm mb-2 line-clamp-2">{playlist.description}</p>
                      <div className="flex items-center justify-between text-xs text-white/40">
                        <span>{playlist.songs.length} songs</span>
                        <span>{playlist.isPublic ? '🌐 Public' : '🔒 Private'}</span>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-3">
                        <motion.button
                          className="w-full bg-white/20 hover:bg-white/30 rounded-lg py-2 text-white text-sm transition-colors flex items-center justify-center gap-2"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Play className="w-4 h-4" />
                          Play
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            {viewMode === 'discover' && (
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Discover Music</h2>
                
                {/* Trending */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    Trending Now
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {playlist.slice(0, 4).map((song, index) => (
                      <motion.div
                        key={song.id}
                        className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 cursor-pointer transition-all group"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleSongSelect(song)}
                      >
                        <div className="relative mb-3">
                          <div className="w-full aspect-square bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <Music className="w-8 h-8 text-white" />
                          </div>
                          <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Play className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <h4 className="text-white font-medium truncate">{song.title}</h4>
                        <p className="text-white/60 text-sm truncate">{song.artist}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                {/* Genres */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4">Browse by Genre</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {['Rock', 'Pop', 'Jazz', 'Electronic', 'Classical', 'Hip-Hop'].map((genre, index) => (
                      <motion.div
                        key={genre}
                        className="aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center cursor-pointer hover:from-purple-500/30 hover:to-pink-500/30 transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <span className="text-white font-semibold">{genre}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'stats' && (
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Your Music Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Total Songs', value: musicStats.totalSongs.toLocaleString(), icon: Music },
                    { label: 'Total Duration', value: musicStats.totalDuration, icon: Clock },
                    { label: 'Top Genre', value: musicStats.topGenre, icon: Tag },
                    { label: 'Listening Time', value: musicStats.listeningTime, icon: Headphones }
                  ].map((stat, index) => {
                    const Icon = stat.icon
                    return (
                      <motion.div
                        key={stat.label}
                        className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Icon className="w-5 h-5 text-purple-400" />
                          <span className="text-white/60 text-sm">{stat.label}</span>
                        </div>
                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                      </motion.div>
                    )
                  })}
                </div>
                
                {/* Top Artists */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4">Top Artists This Month</h3>
                  <div className="space-y-3">
                    {['Queen', 'The Beatles', 'Led Zeppelin', 'Eagles'].map((artist, index) => (
                      <motion.div
                        key={artist}
                        className="flex items-center gap-4 bg-white/10 rounded-lg p-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium">{artist}</div>
                          <div className="text-white/60 text-sm">{Math.floor(Math.random() * 50 + 10)} plays</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Queue Sidebar */}
          <AnimatePresence>
            {showQueue && (
              <motion.div
                className="w-80 bg-black/10 backdrop-blur-sm p-4 overflow-auto"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Queue</h3>
                  <motion.button
                    onClick={() => setShowQueue(false)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-4 h-4 text-white/60" />
                  </motion.button>
                </div>
                
                {/* Now Playing */}
                {currentSong && (
                  <div className="mb-6">
                    <div className="text-sm text-white/60 mb-2">Now Playing</div>
                    <div className="bg-white/10 rounded-xl p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <Music className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm font-medium truncate">{currentSong.title}</div>
                          <div className="text-white/60 text-xs truncate">{currentSong.artist}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Up Next */}
                <div>
                  <div className="text-sm text-white/60 mb-3">Up Next</div>
                  <div className="space-y-2">
                    {playQueue.length > 0 ? playQueue.map((song, index) => (
                      <div key={song.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center text-xs text-white">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm font-medium truncate">{song.title}</div>
                          <div className="text-white/60 text-xs truncate">{song.artist}</div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center text-white/40 py-8">
                        <Music className="w-8 h-8 mx-auto mb-2" />
                        <div className="text-sm">No songs in queue</div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Player Bar */}
        <AnimatePresence>
          {currentSong && (
            <motion.div
              className="h-20 bg-black/30 backdrop-blur-lg border-t border-white/10 px-6 flex items-center gap-6"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Song Info */}
              <div className="flex items-center gap-4 min-w-0 w-64">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-white font-medium truncate">{currentSong.title}</div>
                  <div className="text-white/60 text-sm truncate">{currentSong.artist}</div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Heart className={`w-4 h-4 ${currentSong.liked ? 'text-red-400 fill-current' : 'text-white/60'}`} />
                </motion.button>
              </div>
              
              {/* Player Controls */}
              <div className="flex-1 flex flex-col items-center gap-2">
                <div className="flex items-center gap-4">
                  <motion.button
                    onClick={() => setShuffle(!shuffle)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Shuffle className={`w-4 h-4 ${shuffle ? 'text-purple-400' : 'text-white/60'}`} />
                  </motion.button>
                  
                  <motion.button
                    onClick={handlePrevSong}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <SkipBack className="w-5 h-5 text-white" />
                  </motion.button>
                  
                  <motion.button
                    onClick={handlePlayPause}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                    whileTap={{ scale: 0.9 }}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 text-black" />
                    ) : (
                      <Play className="w-5 h-5 text-black ml-0.5" />
                    )}
                  </motion.button>
                  
                  <motion.button
                    onClick={handleNextSong}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <SkipForward className="w-5 h-5 text-white" />
                  </motion.button>
                  
                  <motion.button
                    onClick={toggleRepeat}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {getRepeatIcon()}
                  </motion.button>
                </div>
                
                {/* Progress Bar */}
                <div className="flex items-center gap-2 w-full max-w-md">
                  <span className="text-xs text-white/60 w-10 text-right">{formatTime(currentTime)}</span>
                  <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                  <span className="text-xs text-white/60 w-10">{currentSong.duration}</span>
                </div>
              </div>
              
              {/* Volume & Options */}
              <div className="flex items-center gap-2 w-32">
                <motion.button
                  onClick={toggleMute}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-white/60" />
                  ) : volume < 50 ? (
                    <Volume1 className="w-4 h-4 text-white/60" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-white/60" />
                  )}
                </motion.button>
                
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Equalizer Panel */}
        <AnimatePresence>
          {showEqualizer && (
            <motion.div
              className="absolute bottom-20 right-6 w-80 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-2xl"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Equalizer</h3>
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={resetEqualizer}
                    className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Reset
                  </motion.button>
                  <motion.button
                    onClick={() => setShowEqualizer(false)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-4 h-4 text-white/60" />
                  </motion.button>
                </div>
              </div>
              
              <div className="flex items-end justify-between gap-2 h-32 mb-2">
                {equalizerBands.map((band, index) => (
                  <div key={band.frequency} className="flex flex-col items-center gap-2">
                    <div className="text-xs text-white/60">{band.gain > 0 ? '+' : ''}{band.gain}</div>
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      value={band.gain}
                      onChange={(e) => handleEqualizerChange(index, Number(e.target.value))}
                      className="w-6 h-20 slider-vertical"
                      orient="vertical"
                      style={{ writingMode: 'bt-lr' }}
                    />
                    <div className="text-xs text-white/40 font-mono">{band.frequency}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Hidden audio element */}
      <audio ref={audioRef} />
    </div>
  )
} 