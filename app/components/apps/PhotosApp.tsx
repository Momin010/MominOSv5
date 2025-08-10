
"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Image as ImageIcon, 
  Upload, 
  Download, 
  Trash2, 
  Edit, 
  Share, 
  Heart, 
  Star, 
  Grid, 
  List, 
  Search, 
  Filter, 
  RotateCw, 
  RotateCcw, 
  Crop, 
  Sliders, 
  Palette, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  Eye, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Maximize2, 
  X, 
  Plus,
  Calendar,
  MapPin,
  Camera,
  Tag,
  Folder,
  Sun,
  Contrast,
  Zap,
  ChevronLeft,
  ChevronRight,
  Info,
  Settings,
  Monitor,
  Smartphone,
  FileImage,
  Copy,
  Scissors,
  MoreHorizontal,
  Check,
  Clock,
  Globe,
  User,
  Hash,
  Layers,
  Focus,
  Aperture,
  Timer,
  Flashlight,
  Shuffle,
  Volume2,
  VolumeX,
  FullScreen,
  Minimize,
  RefreshCw,
  FolderPlus,
  SortAsc,
  SortDesc,
  Grid3x3,
  Columns,
  Rows
} from "lucide-react"

interface Photo {
  id: string
  name: string
  src: string
  blob?: Blob
  size: string
  dimensions: string
  dateTaken: string
  location?: string
  camera?: string
  tags: string[]
  favorite: boolean
  edited: boolean
  type: string
  rating?: number
  description?: string
  focalLength?: string
  aperture?: string
  shutterSpeed?: string
  iso?: string
  flash?: boolean
  faces?: Array<{
    id: string
    name: string
    confidence: number
    bbox: { x: number, y: number, width: number, height: number }
  }>
  objects?: Array<{
    name: string
    confidence: number
    bbox: { x: number, y: number, width: number, height: number }
  }>
  color?: {
    dominant: string
    palette: string[]
  }
  duplicates?: string[]
}

interface Album {
  id: string
  name: string
  description?: string
  thumbnail: string
  photoCount: number
  photos: string[]
  createdAt: Date
  isShared: boolean
  shareLink?: string
  coverPhoto?: string
  sortOrder: 'date' | 'name' | 'custom'
  tags: string[]
}

interface EditingState {
  brightness: number
  contrast: number
  saturation: number
  rotation: number
  zoom: number
  flipHorizontal: boolean
  flipVertical: boolean
  highlights: number
  shadows: number
  vibrance: number
  temperature: number
  tint: number
  sharpness: number
  noise: number
  vignette: number
  grain: number
}

interface PhotoImportOptions {
  organizeByDate: boolean
  detectFaces: boolean
  detectObjects: boolean
  extractMetadata: boolean
  createThumbnails: boolean
  optimizeStorage: boolean
}

interface ViewSettings {
  gridSize: number
  showMetadata: boolean
  showThumbnails: boolean
  animateTransitions: boolean
  autoPlay: boolean
  slideshowSpeed: number
}

type ViewMode = 'grid' | 'list' | 'timeline' | 'map' | 'faces'
type SortBy = 'date' | 'name' | 'size' | 'rating' | 'color' | 'location'
type FilterBy = 'all' | 'favorites' | 'edited' | 'recent' | 'people' | 'places' | 'things'
type PhotoTab = 'photos' | 'albums' | 'memories' | 'shared' | 'trash'

export default function PhotosApp() {
  // Core state
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([])
  const [showEditor, setShowEditor] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterBy, setFilterBy] = useState<FilterBy>('all')
  const [sortBy, setSortBy] = useState<SortBy>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showSlideshow, setShowSlideshow] = useState(false)
  const [slideshowIndex, setSlideshowIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [currentTab, setCurrentTab] = useState<PhotoTab>('photos')
  const [photos, setPhotos] = useState<Photo[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [showSidebar, setShowSidebar] = useState(true)
  const [showPhotoInfo, setShowPhotoInfo] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showImportOptions, setShowImportOptions] = useState(false)
  
  // Advanced editing state
  const [editingState, setEditingState] = useState<EditingState>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    rotation: 0,
    zoom: 100,
    flipHorizontal: false,
    flipVertical: false,
    highlights: 0,
    shadows: 0,
    vibrance: 0,
    temperature: 0,
    tint: 0,
    sharpness: 0,
    noise: 0,
    vignette: 0,
    grain: 0
  })
  
  // Import and view settings
  const [importOptions, setImportOptions] = useState<PhotoImportOptions>({
    organizeByDate: true,
    detectFaces: false,
    detectObjects: false,
    extractMetadata: true,
    createThumbnails: true,
    optimizeStorage: true
  })
  
  const [viewSettings, setViewSettings] = useState<ViewSettings>({
    gridSize: 200,
    showMetadata: true,
    showThumbnails: true,
    animateTransitions: true,
    autoPlay: true,
    slideshowSpeed: 3000
  })
  
  // Memories and AI features
  const [memories, setMemories] = useState<Array<{
    id: string
    title: string
    description: string
    photos: string[]
    type: 'year' | 'trip' | 'event' | 'people'
    date: Date
    thumbnail: string
  }>>([])
  
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [faceGroups, setFaceGroups] = useState<Array<{
    id: string
    name: string
    photos: string[]
    thumbnail: string
  }>>([])
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const slideshowTimerRef = useRef<NodeJS.Timeout>()

  // Load photos from localStorage on mount
  useEffect(() => {
    const savedPhotos = localStorage.getItem('mominos-photos')
    if (savedPhotos) {
      try {
        const parsed = JSON.parse(savedPhotos)
        setPhotos(parsed)
      } catch (e) {
        console.error('Failed to load saved photos:', e)
      }
    }
  }, [])

  // Save photos to localStorage whenever photos change
  useEffect(() => {
    localStorage.setItem('mominos-photos', JSON.stringify(photos))
  }, [photos])

  const albums: Album[] = [
    {
      id: '1',
      name: 'Recently Added',
      thumbnail: photos[0]?.src || '/placeholder.svg',
      photoCount: photos.length,
      photos: photos.map(p => p.id)
    },
    {
      id: '2',
      name: 'Favorites',
      thumbnail: photos.find(p => p.favorite)?.src || '/placeholder.svg',
      photoCount: photos.filter(p => p.favorite).length,
      photos: photos.filter(p => p.favorite).map(p => p.id)
    },
    {
      id: '3',
      name: 'Edited',
      thumbnail: photos.find(p => p.edited)?.src || '/placeholder.svg',
      photoCount: photos.filter(p => p.edited).length,
      photos: photos.filter(p => p.edited).map(p => p.id)
    }
  ]

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const newPhotos: Photo[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) continue

      try {
        // Create object URL for the image
        const src = URL.createObjectURL(file)
        
        // Get image dimensions
        const img = new Image()
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = src
        })

        const photo: Photo = {
          id: `photo-${Date.now()}-${i}`,
          name: file.name,
          src,
          blob: file,
          size: formatFileSize(file.size),
          dimensions: `${img.width}×${img.height}`,
          dateTaken: new Date(file.lastModified).toISOString(),
          type: file.type,
          tags: [],
          favorite: false,
          edited: false
        }

        newPhotos.push(photo)
      } catch (error) {
        console.error('Error processing image:', error)
      }
    }

    setPhotos(prev => [...prev, ...newPhotos])
    event.target.value = '' // Reset file input
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = photo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         photo.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    switch (filterBy) {
      case 'favorites':
        return matchesSearch && photo.favorite
      case 'edited':
        return matchesSearch && photo.edited
      case 'recent':
        const isRecent = new Date(photo.dateTaken) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        return matchesSearch && isRecent
      default:
        return matchesSearch
    }
  })

  const sortedPhotos = [...filteredPhotos].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'size':
        const sizeA = parseFloat(a.size.split(' ')[0])
        const sizeB = parseFloat(b.size.split(' ')[0])
        return sizeB - sizeA
      case 'date':
      default:
        return new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime()
    }
  })

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos(prev => 
      prev.includes(photoId)
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    )
  }

  const toggleFavorite = (photoId: string) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === photoId 
        ? { ...photo, favorite: !photo.favorite }
        : photo
    ))
  }

  const deletePhotos = (photoIds: string[]) => {
    setPhotos(prev => {
      const toDelete = prev.filter(photo => photoIds.includes(photo.id))
      // Revoke object URLs to prevent memory leaks
      toDelete.forEach(photo => {
        if (photo.src.startsWith('blob:')) {
          URL.revokeObjectURL(photo.src)
        }
      })
      return prev.filter(photo => !photoIds.includes(photo.id))
    })
    setSelectedPhotos([])
  }

  const downloadPhoto = (photo: Photo) => {
    const link = document.createElement('a')
    link.href = photo.src
    link.download = photo.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const startSlideshow = (startIndex = 0) => {
    setSlideshowIndex(startIndex)
    setShowSlideshow(true)
    setIsPlaying(true)
  }

  const applyImageEdit = () => {
    if (!selectedPhoto || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      // Set canvas dimensions
      canvas.width = img.width
      canvas.height = img.height

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Apply transformations
      ctx.save()
      
      // Move to center for rotation
      ctx.translate(canvas.width / 2, canvas.height / 2)
      
      // Apply rotation
      ctx.rotate(editingState.rotation * Math.PI / 180)
      
      // Apply flips
      ctx.scale(
        editingState.flipHorizontal ? -1 : 1,
        editingState.flipVertical ? -1 : 1
      )
      
      // Draw image
      ctx.drawImage(img, -img.width / 2, -img.height / 2)
      
      ctx.restore()

      // Apply filters
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        // Apply brightness
        data[i] = Math.max(0, Math.min(255, data[i] + editingState.brightness))
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + editingState.brightness))
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + editingState.brightness))

        // Apply contrast
        const contrast = (editingState.contrast + 100) / 100
        data[i] = Math.max(0, Math.min(255, (data[i] - 128) * contrast + 128))
        data[i + 1] = Math.max(0, Math.min(255, (data[i + 1] - 128) * contrast + 128))
        data[i + 2] = Math.max(0, Math.min(255, (data[i + 2] - 128) * contrast + 128))

        // Apply saturation
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
        const saturation = (editingState.saturation + 100) / 100
        data[i] = Math.max(0, Math.min(255, gray + saturation * (data[i] - gray)))
        data[i + 1] = Math.max(0, Math.min(255, gray + saturation * (data[i + 1] - gray)))
        data[i + 2] = Math.max(0, Math.min(255, gray + saturation * (data[i + 2] - gray)))
      }

      ctx.putImageData(imageData, 0, 0)

      // Convert to blob and update photo
      canvas.toBlob((blob) => {
        if (blob) {
          const newSrc = URL.createObjectURL(blob)
          setPhotos(prev => prev.map(photo => 
            photo.id === selectedPhoto.id 
              ? { ...photo, src: newSrc, edited: true, blob }
              : photo
          ))
          setSelectedPhoto({ ...selectedPhoto, src: newSrc, edited: true })
        }
      }, 'image/jpeg', 0.9)
    }
    img.src = selectedPhoto.src
  }

  const resetEditingState = () => {
    setEditingState({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      rotation: 0,
      zoom: 100,
      flipHorizontal: false,
      flipVertical: false,
      highlights: 0,
      shadows: 0,
      vibrance: 0,
      temperature: 0,
      tint: 0,
      sharpness: 0,
      noise: 0,
      vignette: 0,
      grain: 0
    })
  }
  
  // Enhanced functions
  const nextPhoto = useCallback(() => {
    if (!selectedPhoto) return
    const currentIndex = sortedPhotos.findIndex(p => p.id === selectedPhoto.id)
    const nextIndex = (currentIndex + 1) % sortedPhotos.length
    setSelectedPhoto(sortedPhotos[nextIndex])
  }, [selectedPhoto, sortedPhotos])
  
  const previousPhoto = useCallback(() => {
    if (!selectedPhoto) return
    const currentIndex = sortedPhotos.findIndex(p => p.id === selectedPhoto.id)
    const prevIndex = currentIndex === 0 ? sortedPhotos.length - 1 : currentIndex - 1
    setSelectedPhoto(sortedPhotos[prevIndex])
  }, [selectedPhoto, sortedPhotos])
  
  const toggleSidebar = () => setShowSidebar(!showSidebar)
  const togglePhotoInfo = () => setShowPhotoInfo(!showPhotoInfo)
  const toggleFullscreen = () => setIsFullscreen(!isFullscreen)
  
  // Slideshow logic
  useEffect(() => {
    if (showSlideshow && isPlaying) {
      slideshowTimerRef.current = setTimeout(() => {
        const nextIndex = (slideshowIndex + 1) % sortedPhotos.length
        setSlideshowIndex(nextIndex)
      }, viewSettings.slideshowSpeed)
    }
    
    return () => {
      if (slideshowTimerRef.current) {
        clearTimeout(slideshowTimerRef.current)
      }
    }
  }, [showSlideshow, isPlaying, slideshowIndex, sortedPhotos.length, viewSettings.slideshowSpeed])
  
  // AI and ML features (placeholder implementations)
  const generateTagSuggestions = useCallback((photo: Photo) => {
    // Simulate AI tag suggestions based on filename and metadata
    const suggestions = ['nature', 'portrait', 'landscape', 'urban', 'food', 'travel', 'family', 'events']
    return suggestions.slice(0, 3)
  }, [])
  
  const detectFaces = useCallback(async (photo: Photo) => {
    // Placeholder for face detection
    return []
  }, [])
  
  const analyzeImageColors = useCallback((photo: Photo) => {
    // Placeholder for color analysis
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33F5', '#F5FF33']
    return {
      dominant: colors[0],
      palette: colors.slice(0, 3)
    }
  }, [])

  const PhotoCard = ({ photo, index }: { photo: Photo; index: number }) => (
    <motion.div
      className={`relative glass-card overflow-hidden cursor-pointer group ${
        selectedPhotos.includes(photo.id) ? 'ring-2 ring-purple-500' : ''
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setSelectedPhoto(photo)}
      onContextMenu={(e) => {
        e.preventDefault()
        togglePhotoSelection(photo.id)
      }}
    >
      <div className="aspect-square relative overflow-hidden">
        <img
          src={photo.src}
          alt={photo.name}
          className="w-full h-full object-cover transition-transform group-hover:scale-110"
          onError={(e) => {
            const img = e.target as HTMLImageElement
            img.src = '/placeholder.svg'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-2 left-2 right-2">
            <p className="text-white text-sm font-medium truncate">{photo.name}</p>
            <p className="text-gray-300 text-xs">{new Date(photo.dateTaken).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="absolute top-2 right-2 flex gap-1">
          {photo.favorite && (
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <Heart className="w-3 h-3 text-white fill-current" />
            </div>
          )}
          {photo.edited && (
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <Edit className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            onClick={(e) => {
              e.stopPropagation()
              toggleFavorite(photo.id)
            }}
            className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart className={`w-4 h-4 ${photo.favorite ? 'text-red-500 fill-current' : 'text-white'}`} />
          </motion.button>
        </div>
        <motion.button
          className="absolute bottom-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation()
            startSlideshow(index)
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Play className="w-4 h-4 text-white" />
        </motion.button>
      </div>
    </motion.div>
  )

  return (
    <div className="h-full bg-black/20 backdrop-blur-xl flex flex-col">
      {/* Header */}
      <div className="glass-topbar p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-purple-400" />
              <span className="text-white font-medium">Photos</span>
            </div>
            <div className="flex items-center gap-1">
              {['photos', 'albums', 'favorites'].map((tab) => (
                <motion.button
                  key={tab}
                  onClick={() => setCurrentTab(tab as any)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    currentTab === tab
                      ? 'bg-white/20 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => fileInputRef.current?.click()}
              className="glass-button px-3 py-2 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Upload className="w-4 h-4" />
              Import
            </motion.button>
            <motion.button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="glass-button p-2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search photos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input w-full pl-10 text-white placeholder-gray-400"
            />
          </div>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="glass-input text-white"
          >
            <option value="all">All Photos</option>
            <option value="favorites">Favorites</option>
            <option value="edited">Edited</option>
            <option value="recent">Recent</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="glass-input text-white"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-auto">
        {currentTab === 'photos' && (
          <>
            {sortedPhotos.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No photos yet</p>
                  <p className="text-sm mb-4">Click Import to add your first photos</p>
                  <motion.button
                    onClick={() => fileInputRef.current?.click()}
                    className="glass-button px-4 py-2 flex items-center gap-2 mx-auto"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Upload className="w-4 h-4" />
                    Import Photos
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className={`grid gap-4 ${
                viewMode === 'grid' 
                  ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' 
                  : 'grid-cols-1'
              }`}>
                {sortedPhotos.map((photo, index) => (
                  <PhotoCard key={photo.id} photo={photo} index={index} />
                ))}
              </div>
            )}
          </>
        )}

        {currentTab === 'albums' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {albums.map(album => (
              <motion.div
                key={album.id}
                className="glass-card p-4 cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentTab('photos')}
              >
                <div className="aspect-square relative overflow-hidden rounded-lg mb-3">
                  <img
                    src={album.thumbnail}
                    alt={album.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement
                      img.src = '/placeholder.svg'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    {album.photoCount} photos
                  </div>
                </div>
                <h3 className="text-white font-medium">{album.name}</h3>
              </motion.div>
            ))}
          </div>
        )}

        {currentTab === 'favorites' && (
          <div className={`grid gap-4 ${
            viewMode === 'grid' 
              ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' 
              : 'grid-cols-1'
          }`}>
            {photos.filter(photo => photo.favorite).map((photo, index) => (
              <PhotoCard key={photo.id} photo={photo} index={index} />
            ))}
          </div>
        )}
      </div>

      {/* Photo Viewer Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
          >
            <div className="relative max-w-7xl max-h-full p-4" onClick={(e) => e.stopPropagation()}>
              <motion.img
                src={selectedPhoto.src}
                alt={selectedPhoto.name}
                className="max-w-full max-h-full object-contain"
                style={{ transform: `scale(${zoom / 100})` }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: zoom / 100, opacity: 1 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                onError={(e) => {
                  const img = e.target as HTMLImageElement
                  img.src = '/placeholder.svg'
                }}
              />
              
              {/* Controls */}
              <div className="absolute top-4 right-4 flex gap-2">
                <motion.button
                  onClick={() => setZoom(Math.max(50, zoom - 25))}
                  className="glass-button p-2"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ZoomOut className="w-4 h-4 text-white" />
                </motion.button>
                <motion.button
                  onClick={() => setZoom(Math.min(200, zoom + 25))}
                  className="glass-button p-2"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ZoomIn className="w-4 h-4 text-white" />
                </motion.button>
                <motion.button
                  onClick={() => downloadPhoto(selectedPhoto)}
                  className="glass-button p-2"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Download className="w-4 h-4 text-white" />
                </motion.button>
                <motion.button
                  onClick={() => setShowEditor(true)}
                  className="glass-button p-2"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Edit className="w-4 h-4 text-white" />
                </motion.button>
                <motion.button
                  onClick={() => setSelectedPhoto(null)}
                  className="glass-button p-2"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4 text-white" />
                </motion.button>
              </div>

              {/* Info Panel */}
              <div className="absolute bottom-4 left-4 glass-card p-4 max-w-sm">
                <h3 className="text-white font-semibold mb-2">{selectedPhoto.name}</h3>
                <div className="space-y-1 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(selectedPhoto.dateTaken).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-3 h-3" />
                    <span>{selectedPhoto.dimensions} • {selectedPhoto.size}</span>
                  </div>
                  {selectedPhoto.tags.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Tag className="w-3 h-3" />
                      <div className="flex gap-1">
                        {selectedPhoto.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-white/20 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo Editor Modal */}
      <AnimatePresence>
        {showEditor && selectedPhoto && (
          <motion.div
            className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="h-full flex">
              {/* Editor Toolbar */}
              <div className="w-80 glass-card border-r border-white/10 p-4 overflow-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">Photo Editor</h3>
                  <div className="flex gap-2">
                    <motion.button
                      onClick={resetEditingState}
                      className="text-gray-400 hover:text-white text-sm"
                      whileHover={{ scale: 1.05 }}
                    >
                      Reset
                    </motion.button>
                    <motion.button
                      onClick={() => setShowEditor(false)}
                      className="text-gray-400 hover:text-white"
                      whileHover={{ scale: 1.1 }}
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Basic Adjustments */}
                  <div>
                    <h4 className="text-white font-medium mb-4">Adjustments</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Sun className="w-4 h-4 text-yellow-400" />
                          <span className="text-gray-300 text-sm">Brightness</span>
                          <span className="text-gray-400 text-xs ml-auto">{editingState.brightness}</span>
                        </div>
                        <input 
                          type="range" 
                          min="-100" 
                          max="100" 
                          value={editingState.brightness}
                          onChange={(e) => setEditingState(prev => ({ ...prev, brightness: parseInt(e.target.value) }))}
                          className="w-full" 
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Contrast className="w-4 h-4 text-blue-400" />
                          <span className="text-gray-300 text-sm">Contrast</span>
                          <span className="text-gray-400 text-xs ml-auto">{editingState.contrast}</span>
                        </div>
                        <input 
                          type="range" 
                          min="-100" 
                          max="100" 
                          value={editingState.contrast}
                          onChange={(e) => setEditingState(prev => ({ ...prev, contrast: parseInt(e.target.value) }))}
                          className="w-full" 
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-purple-400" />
                          <span className="text-gray-300 text-sm">Saturation</span>
                          <span className="text-gray-400 text-xs ml-auto">{editingState.saturation}</span>
                        </div>
                        <input 
                          type="range" 
                          min="-100" 
                          max="100" 
                          value={editingState.saturation}
                          onChange={(e) => setEditingState(prev => ({ ...prev, saturation: parseInt(e.target.value) }))}
                          className="w-full" 
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Transform Tools */}
                  <div>
                    <h4 className="text-white font-medium mb-4">Transform</h4>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <motion.button
                        onClick={() => setEditingState(prev => ({ ...prev, rotation: (prev.rotation + 90) % 360 }))}
                        className="glass-button p-3 flex flex-col items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <RotateCw className="w-4 h-4" />
                        <span className="text-xs">Rotate</span>
                      </motion.button>
                      <motion.button
                        onClick={() => setEditingState(prev => ({ ...prev, flipHorizontal: !prev.flipHorizontal }))}
                        className={`glass-button p-3 flex flex-col items-center gap-2 ${editingState.flipHorizontal ? 'bg-white/20' : ''}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Move className="w-4 h-4" />
                        <span className="text-xs">Flip H</span>
                      </motion.button>
                    </div>
                  </div>

                  {/* Save Changes */}
                  <div className="pt-4 border-t border-white/10">
                    <motion.button
                      onClick={applyImageEdit}
                      className="w-full glass-button bg-purple-500/20 hover:bg-purple-500/30 p-3 text-white font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Apply Changes
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Editor Canvas */}
              <div className="flex-1 flex items-center justify-center p-4 bg-gray-900">
                <div className="relative">
                  <img
                    src={selectedPhoto.src}
                    alt={selectedPhoto.name}
                    className="max-w-full max-h-full object-contain"
                    style={{
                      filter: `brightness(${100 + editingState.brightness}%) contrast(${100 + editingState.contrast}%) saturate(${100 + editingState.saturation}%)`,
                      transform: `rotate(${editingState.rotation}deg) scaleX(${editingState.flipHorizontal ? -1 : 1}) scaleY(${editingState.flipVertical ? -1 : 1})`
                    }}
                    onError={(e) => {
                      const img = e.target as HTMLImageElement
                      img.src = '/placeholder.svg'
                    }}
                  />
                </div>
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Status Bar */}
      <div className="glass-topbar p-2 border-t border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4 text-gray-400">
          <span>{sortedPhotos.length} photos</span>
          {selectedPhotos.length > 0 && (
            <span>{selectedPhotos.length} selected</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedPhotos.length > 0 && (
            <>
              <motion.button
                onClick={() => deletePhotos(selectedPhotos)}
                className="text-red-400 hover:text-red-300"
                whileHover={{ scale: 1.1 }}
              >
                <Trash2 className="w-3 h-3" />
              </motion.button>
              <motion.button
                className="text-gray-400 hover:text-white"
                whileHover={{ scale: 1.1 }}
              >
                <Share className="w-3 h-3" />
              </motion.button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
