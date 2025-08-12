"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Folder, FolderPlus, File, FileText, Image as ImageIcon, Music, Video, 
  Archive, Code, Settings, ArrowLeft, ArrowRight, ArrowUp, Home, 
  Search, Grid, List, MoreVertical, Copy, Scissors, Clipboard, Trash2,
  Download, Upload, Share, Star, StarOff, Eye, EyeOff, Filter,
  SortAsc, SortDesc, Calendar, Clock, HardDrive, Wifi, WifiOff,
  RefreshCw, Plus, X, Check, Edit, Save, RotateCcw, ZoomIn, ZoomOut,
  Maximize2, Minimize2, ChevronRight, ChevronDown, Info, AlertCircle,
  CheckCircle2, XCircle, FileImage, FileVideo, FileAudio, FileMinus,
  FolderOpen, Monitor, Smartphone, Tablet, Cloud, CloudOff, Lock,
  Unlock, Shield, Users, UserPlus, Tag, Tags, BookmarkPlus
} from "lucide-react"

// Enhanced file system types
export interface FileItem {
  id: string
  name: string
  type: 'file'
  size: number
  modified: Date
  created: Date
  accessed: Date
  parent?: string
  content?: string
  extension: string
  mimeType: string
  permissions: FilePermissions
  isHidden: boolean
  isStarred: boolean
  tags: string[]
  thumbnail?: string
  checksum?: string
  version?: number
}

export interface FolderItem {
  id: string
  name: string
  type: 'folder'
  children: FileSystemItem[]
  parent?: string
  created: Date
  modified: Date
  accessed: Date
  permissions: FilePermissions
  isHidden: boolean
  isStarred: boolean
  tags: string[]
  size: number // calculated from children
  itemCount: number
}

interface FilePermissions {
  read: boolean
  write: boolean
  execute: boolean
  owner: string
  group: string
  others: 'read' | 'write' | 'none'
}

export type FileSystemItem = FileItem | FolderItem

type ViewMode = 'grid' | 'list' | 'details'
type SortBy = 'name' | 'size' | 'modified' | 'created' | 'type'
type SortOrder = 'asc' | 'desc'

interface FileOperation {
  id: string
  type: 'copy' | 'move' | 'delete' | 'upload' | 'download'
  items: FileSystemItem[]
  destination?: string
  progress: number
  completed: boolean
  error?: string
}

const DEFAULT_FOLDERS = [
  { name: 'Desktop', icon: '🖥️', id: 'desktop' },
  { name: 'Documents', icon: '📄', id: 'documents' },
  { name: 'Downloads', icon: '⬇️', id: 'downloads' },
  { name: 'Pictures', icon: '🖼️', id: 'pictures' },
  { name: 'Music', icon: '🎵', id: 'music' },
  { name: 'Videos', icon: '🎬', id: 'videos' },
  { name: 'Projects', icon: '💼', id: 'projects' },
  { name: 'Trash', icon: '🗑️', id: 'trash' }
]

const SAMPLE_FILES: FileSystemItem[] = [
  {
    id: 'desktop',
    name: 'Desktop',
    type: 'folder',
    children: [
      {
        id: 'readme',
        name: 'README.md',
        type: 'file',
        size: 2048,
        extension: 'md',
        mimeType: 'text/markdown',
        content: '# Welcome to MominOS\n\nThis is a modern operating system interface.',
        created: new Date('2024-01-15'),
        modified: new Date('2024-01-20'),
        accessed: new Date(),
        permissions: { read: true, write: true, execute: false, owner: 'user', group: 'users', others: 'read' },
        isHidden: false,
        isStarred: true,
        tags: ['important', 'documentation']
      }
    ],
    created: new Date('2024-01-01'),
    modified: new Date('2024-01-20'),
    accessed: new Date(),
    permissions: { read: true, write: true, execute: true, owner: 'user', group: 'users', others: 'read' },
    isHidden: false,
    isStarred: false,
    tags: [],
    size: 2048,
    itemCount: 1
  },
  {
    id: 'documents',
    name: 'Documents',
    type: 'folder',
    children: [
      {
        id: 'report',
        name: 'Annual Report 2024.pdf',
        type: 'file',
        size: 1024000,
        extension: 'pdf',
        mimeType: 'application/pdf',
        created: new Date('2024-02-01'),
        modified: new Date('2024-02-15'),
        accessed: new Date(),
        permissions: { read: true, write: true, execute: false, owner: 'user', group: 'users', others: 'read' },
        isHidden: false,
        isStarred: false,
        tags: ['work', 'report']
      },
      {
        id: 'notes',
        name: 'Meeting Notes.docx',
        type: 'file',
        size: 45000,
        extension: 'docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        created: new Date('2024-02-10'),
        modified: new Date('2024-02-10'),
        accessed: new Date(),
        permissions: { read: true, write: true, execute: false, owner: 'user', group: 'users', others: 'read' },
        isHidden: false,
        isStarred: true,
        tags: ['meeting', 'notes']
      }
    ],
    created: new Date('2024-01-01'),
    modified: new Date('2024-02-15'),
    accessed: new Date(),
    permissions: { read: true, write: true, execute: true, owner: 'user', group: 'users', others: 'read' },
    isHidden: false,
    isStarred: true,
    tags: ['important'],
    size: 1069000,
    itemCount: 2
  },
  {
    id: 'pictures',
    name: 'Pictures',
    type: 'folder',
    children: [
      {
        id: 'vacation',
        name: 'Vacation 2024',
        type: 'folder',
        children: [],
        created: new Date('2024-03-01'),
        modified: new Date('2024-03-01'),
        accessed: new Date(),
        permissions: { read: true, write: true, execute: true, owner: 'user', group: 'users', others: 'read' },
        isHidden: false,
        isStarred: false,
        tags: ['vacation'],
        size: 0,
        itemCount: 0
      }
    ],
    created: new Date('2024-01-01'),
    modified: new Date('2024-03-01'),
    accessed: new Date(),
    permissions: { read: true, write: true, execute: true, owner: 'user', group: 'users', others: 'read' },
    isHidden: false,
    isStarred: false,
    tags: [],
    size: 0,
    itemCount: 1
  }
]

export default function FileExplorerApp() {
  // Core state
  const [fileSystem, setFileSystem] = useState<FileSystemItem[]>(SAMPLE_FILES)
  const [currentPath, setCurrentPath] = useState<string[]>(['desktop'])
  const [navigationHistory, setNavigationHistory] = useState<string[][]>([['desktop']])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [clipboard, setClipboard] = useState<{ items: FileSystemItem[], operation: 'copy' | 'cut' } | null>(null)
  
  // View and interaction state
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortBy>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [searchQuery, setSearchQuery] = useState('')
  const [showHidden, setShowHidden] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [previewItem, setPreviewItem] = useState<FileSystemItem | null>(null)
  
  // Operations state
  const [operations, setOperations] = useState<FileOperation[]>([])
  const [renamingItemId, setRenamingItemId] = useState<string | null>(null)
  const [draggedItem, setDraggedItem] = useState<FileSystemItem | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, item?: FileSystemItem } | null>(null)
  const [showProperties, setShowProperties] = useState(false)
  const [propertiesItem, setPropertiesItem] = useState<FileSystemItem | null>(null)
  const [compressionProgress, setCompressionProgress] = useState<{[key: string]: number}>({})
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({})
  const [showPreview, setShowPreview] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<FileSystemItem[]>([])
  const [fileWatcher, setFileWatcher] = useState<{[key: string]: boolean}>({})
  const [thumbnailCache, setThumbnailCache] = useState<{[key: string]: string}>({})
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const renameInputRef = useRef<HTMLInputElement>(null)
  
  // Get current folder
  const currentFolder = useMemo(() => {
    let folder = fileSystem.find(item => item.type === 'folder' && item.id === currentPath[0]) as FolderItem
    
    for (let i = 1; i < currentPath.length; i++) {
      if (folder) {
        folder = folder.children.find(item => item.type === 'folder' && item.id === currentPath[i]) as FolderItem
      }
    }
    
    return folder
  }, [fileSystem, currentPath])
  
  // Get current items with filtering and sorting
  const currentItems = useMemo(() => {
    if (!currentFolder) return []
    
    let items = currentFolder.children
    
    // Apply search filter
    if (searchQuery) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.type === 'file' && (item as FileItem).tags.some(tag => 
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      )
    }
    
    // Apply hidden filter
    if (!showHidden) {
      items = items.filter(item => !item.isHidden)
    }
    
    // Apply sorting
    items.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'size':
          comparison = (a.type === 'file' ? (a as FileItem).size : (a as FolderItem).size) - 
                      (b.type === 'file' ? (b as FileItem).size : (b as FolderItem).size)
          break
        case 'modified':
          comparison = a.modified.getTime() - b.modified.getTime()
          break
        case 'created':
          comparison = a.created.getTime() - b.created.getTime()
          break
        case 'type':
          if (a.type === b.type) {
            comparison = a.name.localeCompare(b.name)
          } else {
            comparison = a.type === 'folder' ? -1 : 1
          }
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })
    
    return items
  }, [currentFolder, searchQuery, showHidden, sortBy, sortOrder])
  
  // Navigation functions
  const navigateTo = useCallback((path: string[]) => {
    setCurrentPath(path)
    setSelectedItems(new Set())
    
    // Update navigation history
    const newHistory = navigationHistory.slice(0, historyIndex + 1)
    newHistory.push(path)
    setNavigationHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [navigationHistory, historyIndex])
  
  const navigateBack = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setCurrentPath(navigationHistory[historyIndex - 1])
      setSelectedItems(new Set())
    }
  }, [historyIndex, navigationHistory])
  
  const navigateForward = useCallback(() => {
    if (historyIndex < navigationHistory.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setCurrentPath(navigationHistory[historyIndex + 1])
      setSelectedItems(new Set())
    }
  }, [historyIndex, navigationHistory])
  
  const navigateUp = useCallback(() => {
    if (currentPath.length > 1) {
      navigateTo(currentPath.slice(0, -1))
    }
  }, [currentPath, navigateTo])
  
  // File operations
  const createNewFolder = useCallback(() => {
    if (!currentFolder) return
    
    const id = `folder_${Date.now()}`
    const name = 'New Folder'
    
    const newFolder: FolderItem = {
      id,
      name,
      type: 'folder',
      children: [],
      parent: currentFolder.id,
      created: new Date(),
      modified: new Date(),
      accessed: new Date(),
      permissions: { read: true, write: true, execute: true, owner: 'user', group: 'users', others: 'read' },
      isHidden: false,
      isStarred: false,
      tags: [],
      size: 0,
      itemCount: 0
    }
    
    setFileSystem(prev => {
      const updated = [...prev]
      const folderIndex = updated.findIndex(item => item.id === currentFolder.id)
      if (folderIndex !== -1 && updated[folderIndex].type === 'folder') {
        (updated[folderIndex] as FolderItem).children.push(newFolder)
        updated[folderIndex].modified = new Date()
      }
      return updated
    })
    
    // Start renaming
    setTimeout(() => setRenamingItemId(id), 100)
  }, [currentFolder])
  
  const createNewFile = useCallback(() => {
    if (!currentFolder) return
    
    const id = `file_${Date.now()}`
    const name = 'New File.txt'
    
    const newFile: FileItem = {
      id,
      name,
      type: 'file',
      size: 0,
      extension: 'txt',
      mimeType: 'text/plain',
      content: '',
      created: new Date(),
      modified: new Date(),
      accessed: new Date(),
      parent: currentFolder.id,
      permissions: { read: true, write: true, execute: false, owner: 'user', group: 'users', others: 'read' },
      isHidden: false,
      isStarred: false,
      tags: []
    }
    
    setFileSystem(prev => {
      const updated = [...prev]
      const folderIndex = updated.findIndex(item => item.id === currentFolder.id)
      if (folderIndex !== -1 && updated[folderIndex].type === 'folder') {
        (updated[folderIndex] as FolderItem).children.push(newFile)
        updated[folderIndex].modified = new Date()
      }
      return updated
    })
    
    // Start renaming
    setTimeout(() => setRenamingItemId(id), 100)
  }, [currentFolder])
  
  // File icon helper
  const getFileIcon = useCallback((item: FileSystemItem) => {
    if (item.type === 'folder') {
      return <Folder className="w-5 h-5 text-blue-500" />
    }
    
    const file = item as FileItem
    const ext = file.extension.toLowerCase()
    
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
      return <FileImage className="w-5 h-5 text-green-500" />
    }
    if (['mp4', 'avi', 'mkv', 'mov', 'webm'].includes(ext)) {
      return <FileVideo className="w-5 h-5 text-red-500" />
    }
    if (['mp3', 'wav', 'flac', 'ogg'].includes(ext)) {
      return <FileAudio className="w-5 h-5 text-purple-500" />
    }
    if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'html', 'css'].includes(ext)) {
      return <Code className="w-5 h-5 text-yellow-500" />
    }
    if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(ext)) {
      return <FileText className="w-5 h-5 text-blue-400" />
    }
    
    return <File className="w-5 h-5 text-gray-500" />
  }, [])
  
  // Format file size
  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }, [])
  
  // Format date
  const formatDate = useCallback((date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }, [])
  
  // Handle item selection
  const handleItemSelect = useCallback((itemId: string, multiSelect = false) => {
    if (multiSelect) {
      setSelectedItems(prev => {
        const updated = new Set(prev)
        if (updated.has(itemId)) {
          updated.delete(itemId)
        } else {
          updated.add(itemId)
        }
        return updated
      })
    } else {
      setSelectedItems(new Set([itemId]))
    }
  }, [])
  
  // Handle item double click
  const handleItemDoubleClick = useCallback((item: FileSystemItem) => {
    if (item.type === 'folder') {
      navigateTo([...currentPath, item.id])
    } else {
      setPreviewItem(item)
    }
  }, [currentPath, navigateTo])
  
  // Handle rename
  const handleRename = useCallback((itemId: string, newName: string) => {
    if (!newName.trim()) {
      setRenamingItemId(null)
      return
    }
    
    setFileSystem(prev => {
      const updateItemInTree = (items: FileSystemItem[]): FileSystemItem[] => {
        return items.map(item => {
          if (item.id === itemId) {
            const updated = { ...item, name: newName.trim(), modified: new Date() }
            if (item.type === 'file') {
              const lastDot = newName.lastIndexOf('.')
              if (lastDot > 0) {
                (updated as FileItem).extension = newName.slice(lastDot + 1)
              }
            }
            return updated
          }
          if (item.type === 'folder') {
            return {
              ...item,
              children: updateItemInTree((item as FolderItem).children)
            }
          }
          return item
        })
      }
      
      return updateItemInTree(prev)
    })
    
    setRenamingItemId(null)
  }, [])
  
  // Advanced search function
  const performAdvancedSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }
    
    setIsSearching(true)
    const results: FileSystemItem[] = []
    
    const searchInTree = (items: FileSystemItem[], path: string[] = []) => {
      items.forEach(item => {
        const itemPath = [...path, item.name]
        
        // Search in name, tags, and content
        const matches = (
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
          (item.type === 'file' && (item as FileItem).content?.toLowerCase().includes(query.toLowerCase()))
        )
        
        if (matches) {
          results.push({ ...item, parent: itemPath.slice(0, -1).join('/') })
        }
        
        if (item.type === 'folder') {
          searchInTree((item as FolderItem).children, itemPath)
        }
      })
    }
    
    searchInTree(fileSystem)
    setSearchResults(results)
    
    // Simulate search delay
    setTimeout(() => setIsSearching(false), 300)
  }, [fileSystem])
  
  // File operations
  const copyToClipboard = useCallback((items: FileSystemItem[]) => {
    setClipboard({ items, operation: 'copy' })
  }, [])
  
  const cutToClipboard = useCallback((items: FileSystemItem[]) => {
    setClipboard({ items, operation: 'cut' })
  }, [])
  
  const pasteFromClipboard = useCallback(() => {
    if (!clipboard || !currentFolder) return
    
    const newOperation: FileOperation = {
      id: `op_${Date.now()}`,
      type: clipboard.operation === 'copy' ? 'copy' : 'move',
      items: clipboard.items,
      destination: currentFolder.id,
      progress: 0,
      completed: false
    }
    
    setOperations(prev => [...prev, newOperation])
    
    // Simulate operation progress
    const interval = setInterval(() => {
      setOperations(prev => prev.map(op => {
        if (op.id === newOperation.id) {
          const newProgress = Math.min(op.progress + 20, 100)
          return { ...op, progress: newProgress, completed: newProgress === 100 }
        }
        return op
      }))
    }, 200)
    
    setTimeout(() => {
      clearInterval(interval)
      setOperations(prev => prev.filter(op => op.id !== newOperation.id))
      
      // Actually perform the operation
      if (clipboard.operation === 'copy') {
        // Add copied items to current folder
        setFileSystem(prevFS => {
          const updated = [...prevFS]
          const folderIndex = updated.findIndex(item => item.id === currentFolder.id)
          if (folderIndex !== -1 && updated[folderIndex].type === 'folder') {
            clipboard.items.forEach(item => {
              const newItem = {
                ...item,
                id: `${item.id}_copy_${Date.now()}`,
                name: `${item.name} - Copy`,
                parent: currentFolder.id
              };
              (updated[folderIndex] as FolderItem).children.push(newItem)
            })
          }
          return updated
        })
      }
      
      setClipboard(null)
    }, 1000)
  }, [clipboard, currentFolder])
  
  const deleteItems = useCallback((items: FileSystemItem[]) => {
    const deleteOperation: FileOperation = {
      id: `delete_${Date.now()}`,
      type: 'delete',
      items,
      progress: 0,
      completed: false
    }
    
    setOperations(prev => [...prev, deleteOperation])
    
    // Simulate deletion progress
    const interval = setInterval(() => {
      setOperations(prev => prev.map(op => {
        if (op.id === deleteOperation.id) {
          const newProgress = Math.min(op.progress + 25, 100)
          return { ...op, progress: newProgress, completed: newProgress === 100 }
        }
        return op
      }))
    }, 150)
    
    setTimeout(() => {
      clearInterval(interval)
      setOperations(prev => prev.filter(op => op.id !== deleteOperation.id))
      
      // Actually delete items
      setFileSystem(prev => {
        const deleteItemFromTree = (treeItems: FileSystemItem[]): FileSystemItem[] => {
          return treeItems.filter(item => !items.some(delItem => delItem.id === item.id))
            .map(item => {
              if (item.type === 'folder') {
                return {
                  ...item,
                  children: deleteItemFromTree((item as FolderItem).children)
                }
              }
              return item
            })
        }
        
        return deleteItemFromTree(prev)
      })
      
      setSelectedItems(new Set())
    }, 600)
  }, [])
  
  const toggleStar = useCallback((item: FileSystemItem) => {
    setFileSystem(prev => {
      const updateItemInTree = (items: FileSystemItem[]): FileSystemItem[] => {
        return items.map(treeItem => {
          if (treeItem.id === item.id) {
            return { ...treeItem, isStarred: !treeItem.isStarred, modified: new Date() }
          }
          if (treeItem.type === 'folder') {
            return {
              ...treeItem,
              children: updateItemInTree((treeItem as FolderItem).children)
            }
          }
          return treeItem
        })
      }
      
      return updateItemInTree(prev)
    })
  }, [])
  
  const showItemProperties = useCallback((item: FileSystemItem) => {
    setPropertiesItem(item)
    setShowProperties(true)
  }, [])
  
  const compressItems = useCallback((items: FileSystemItem[], format: 'zip' | 'tar') => {
    const compressionId = `compress_${Date.now()}`
    setCompressionProgress({ [compressionId]: 0 })
    
    // Simulate compression
    const interval = setInterval(() => {
      setCompressionProgress(prev => {
        const current = prev[compressionId] || 0
        const newProgress = Math.min(current + 15, 100)
        
        if (newProgress === 100) {
          clearInterval(interval)
          setTimeout(() => {
            setCompressionProgress(prev => {
              const { [compressionId]: _, ...rest } = prev
              return rest
            })
          }, 1000)
        }
        
        return { ...prev, [compressionId]: newProgress }
      })
    }, 200)
  }, [])
  
  const generateThumbnail = useCallback((file: FileItem) => {
    if (thumbnailCache[file.id]) return thumbnailCache[file.id]
    
    // Mock thumbnail generation for images
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(file.extension.toLowerCase())) {
      const mockThumbnail = `data:image/svg+xml;base64,${btoa(`
        <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" fill="#f3f4f6"/>
          <text x="32" y="36" text-anchor="middle" font-size="12" fill="#9ca3af">${file.extension}</text>
        </svg>
      `)}`
      
      setThumbnailCache(prev => ({ ...prev, [file.id]: mockThumbnail }))
      return mockThumbnail
    }
    
    return null
  }, [thumbnailCache])
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'f':
            e.preventDefault()
            searchInputRef.current?.focus()
            break
          case 'a':
            e.preventDefault()
            setSelectedItems(new Set(currentItems.map(item => item.id)))
            break
          case 'n':
            e.preventDefault()
            if (e.shiftKey) {
              createNewFolder()
            } else {
              createNewFile()
            }
            break
        }
      } else {
        switch (e.key) {
          case 'F2':
            if (selectedItems.size === 1) {
              setRenamingItemId(Array.from(selectedItems)[0])
            }
            break
          case 'Delete':
            if (selectedItems.size > 0) {
              // Handle delete
            }
            break
        }
      }
    }
    
    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [currentItems, selectedItems, createNewFile, createNewFolder])
  
  // Close context menu on outside click
  useEffect(() => {
    const handleClick = () => setContextMenu(null)
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return (
    <div className="h-full bg-white dark:bg-gray-900 flex flex-col">
      {/* Top Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        {/* Navigation Controls */}
        <div className="flex items-center gap-1">
          <motion.button
            className={`p-2 rounded-lg transition-colors ${
              historyIndex > 0
                ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
            onClick={navigateBack}
            disabled={historyIndex === 0}
            whileHover={historyIndex > 0 ? { scale: 1.05 } : {}}
            whileTap={historyIndex > 0 ? { scale: 0.95 } : {}}
          >
            <ArrowLeft className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            className={`p-2 rounded-lg transition-colors ${
              historyIndex < navigationHistory.length - 1
                ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
            onClick={navigateForward}
            disabled={historyIndex >= navigationHistory.length - 1}
            whileHover={historyIndex < navigationHistory.length - 1 ? { scale: 1.05 } : {}}
            whileTap={historyIndex < navigationHistory.length - 1 ? { scale: 0.95 } : {}}
          >
            <ArrowRight className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            className={`p-2 rounded-lg transition-colors ${
              currentPath.length > 1
                ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
            onClick={navigateUp}
            disabled={currentPath.length <= 1}
            whileHover={currentPath.length > 1 ? { scale: 1.05 } : {}}
            whileTap={currentPath.length > 1 ? { scale: 0.95 } : {}}
          >
            <ArrowUp className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            className="p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            onClick={() => navigateTo(['desktop'])}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Home className="w-4 h-4" />
          </motion.button>
        </div>
        
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2" />
        
        {/* Address Bar */}
        <div className="flex-1 flex items-center bg-white dark:bg-gray-700 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-600">
          <Home className="w-4 h-4 text-gray-400 mr-2" />
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            {currentPath.map((pathSegment, index) => {
              const folder = fileSystem.find(item => item.id === pathSegment)
              return (
                <div key={pathSegment} className="flex items-center">
                  {index > 0 && <ChevronRight className="w-3 h-3 mx-1 text-gray-400" />}
                  <button
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    onClick={() => navigateTo(currentPath.slice(0, index + 1))}
                  >
                    {folder?.name || pathSegment}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="pl-10 pr-4 py-2 w-64 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
        
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2" />
        
        {/* View Controls */}
        <div className="flex items-center gap-1">
          <motion.button
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            onClick={() => setViewMode('grid')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Grid className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            onClick={() => setViewMode('list')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <List className="w-4 h-4" />
          </motion.button>
        </div>
        
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2" />
        
        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <motion.button
            className="p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            onClick={createNewFolder}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="New Folder (Ctrl+Shift+N)"
          >
            <FolderPlus className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            className="p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            onClick={createNewFile}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="New File (Ctrl+N)"
          >
            <Plus className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            className={`p-2 rounded-lg transition-colors ${
              showHidden
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            onClick={() => setShowHidden(!showHidden)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Show Hidden Files"
          >
            {showHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>
      
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 256, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Quick Access</h3>
                <div className="space-y-1">
                  {DEFAULT_FOLDERS.map(folder => {
                    const isActive = currentPath[0] === folder.id
                    return (
                      <motion.button
                        key={folder.id}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          isActive
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => navigateTo([folder.id])}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="text-lg">{folder.icon}</span>
                        <span className="text-sm font-medium">{folder.name}</span>
                      </motion.button>
                    )
                  })}
                </div>
                
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Starred</h3>
                  <div className="space-y-1">
                    {fileSystem.filter(item => item.isStarred).map(item => (
                      <motion.div
                        key={item.id}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        onClick={() => {
                          if (item.type === 'folder') {
                            navigateTo([item.id])
                          }
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {getFileIcon(item)}
                        <span className="text-sm truncate">{item.name}</span>
                        <Star className="w-3 h-3 text-yellow-500 fill-current ml-auto" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Sort and Filter Bar */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center gap-4">
              <button
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                Sort by: {sortBy}
              </button>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-2 py-1"
              >
                <option value="name">Name</option>
                <option value="size">Size</option>
                <option value="modified">Modified</option>
                <option value="created">Created</option>
                <option value="type">Type</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <span>{currentItems.length} items</span>
              {selectedItems.size > 0 && (
                <span className="text-blue-600 dark:text-blue-400">• {selectedItems.size} selected</span>
              )}
              <button
                className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          {/* File Grid/List */}
          <div className="flex-1 overflow-auto p-4">
            {currentItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <Folder className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">
                  {searchQuery ? 'No files found' : 'This folder is empty'}
                </p>
                <p className="text-sm">
                  {searchQuery ? 'Try adjusting your search terms' : 'Create a new file or folder to get started'}
                </p>
              </div>
            ) : (
              <motion.div
                className={`${
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4'
                    : 'space-y-1'
                }`}
                layout
              >
                <AnimatePresence>
                  {currentItems.map((item) => {
                    const isSelected = selectedItems.has(item.id)
                    const isCurrentItemRenaming = item.id === renamingItemId
                    
                    return (
                      <motion.div
                        key={item.id}
                        className={`group relative ${
                          viewMode === 'grid'
                            ? `p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                  : 'border-transparent hover:border-gray-200 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                              }`
                            : `flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                isSelected
                                  ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                              }`
                        }`}
                        onClick={(e) => handleItemSelect(item.id, e.ctrlKey || e.metaKey)}
                        onDoubleClick={() => handleItemDoubleClick(item)}
                        onContextMenu={(e) => {
                          e.preventDefault()
                          setContextMenu({ x: e.clientX, y: e.clientY, item })
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        layout
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {viewMode === 'grid' ? (
                          <div className="flex flex-col items-center text-center">
                            <div className="relative mb-3">
                              {getFileIcon(item)}
                              {item.isStarred && (
                                <Star className="absolute -top-1 -right-1 w-3 h-3 text-yellow-500 fill-current" />
                              )}
                            </div>
                            
                            {isCurrentItemRenaming ? (
                              <input
                                ref={renameInputRef}
                                defaultValue={item.name}
                                className="w-full px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-blue-500 rounded focus:outline-none"
                                autoFocus
                                onBlur={(e) => handleRename(item.id, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleRename(item.id, e.currentTarget.value)
                                  } else if (e.key === 'Escape') {
                                    setRenamingItemId(null)
                                  }
                                }}
                              />
                            ) : (
                              <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate w-full">
                                {item.name}
                              </p>
                            )}
                            
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {item.type === 'file' ? formatFileSize((item as FileItem).size) : `${(item as FolderItem).itemCount} items`}
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              {getFileIcon(item)}
                              {isCurrentItemRenaming ? (
                                <input
                                  ref={renameInputRef}
                                  defaultValue={item.name}
                                  className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-blue-500 rounded focus:outline-none"
                                  autoFocus
                                  onBlur={(e) => handleRename(item.id, e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleRename(item.id, e.currentTarget.value)
                                    } else if (e.key === 'Escape') {
                                      setRenamingItemId(null)
                                    }
                                  }}
                                />
                              ) : (
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                    {item.name}
                                  </p>
                                  {item.tags.length > 0 && (
                                    <div className="flex gap-1 mt-1">
                                      {item.tags.slice(0, 3).map(tag => (
                                        <span key={tag} className="inline-block px-1 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                              <span className="w-20 text-right">
                                {item.type === 'file' ? formatFileSize((item as FileItem).size) : `${(item as FolderItem).itemCount} items`}
                              </span>
                              <span className="w-32 text-right">
                                {formatDate(item.modified)}
                              </span>
                              {item.isStarred && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                            </div>
                          </div>
                        )}
                        
                        {/* Selection indicator */}
                        {isSelected && (
                          <motion.div
                            className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <Check className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl py-2 min-w-48"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.1 }}
            onClick={(e) => e.stopPropagation()}
          >
            {contextMenu.item ? (
              <>
                <button 
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => {
                    if (contextMenu.item!.type === 'folder') {
                      navigateTo([...currentPath, contextMenu.item!.id])
                    } else {
                      setPreviewItem(contextMenu.item!)
                    }
                    setContextMenu(null)
                  }}
                >
                  <Eye className="w-4 h-4" />
                  Open
                </button>
                <button 
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => {
                    setRenamingItemId(contextMenu.item!.id)
                    setContextMenu(null)
                  }}
                >
                  <Edit className="w-4 h-4" />
                  Rename
                </button>
                <button 
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => {
                    copyToClipboard([contextMenu.item!])
                    setContextMenu(null)
                  }}
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
                <button 
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => {
                    cutToClipboard([contextMenu.item!])
                    setContextMenu(null)
                  }}
                >
                  <Scissors className="w-4 h-4" />
                  Cut
                </button>
                <button 
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => {
                    toggleStar(contextMenu.item!)
                    setContextMenu(null)
                  }}
                >
                  {contextMenu.item!.isStarred ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                  {contextMenu.item!.isStarred ? 'Unstar' : 'Star'}
                </button>
                <button 
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => {
                    showItemProperties(contextMenu.item!)
                    setContextMenu(null)
                  }}
                >
                  <Info className="w-4 h-4" />
                  Properties
                </button>
                <div className="h-px bg-gray-200 dark:bg-gray-600 my-1" />
                <button 
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  onClick={() => {
                    deleteItems([contextMenu.item!])
                    setContextMenu(null)
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </>
            ) : (
              <>
                <button 
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={createNewFile}
                >
                  <Plus className="w-4 h-4" />
                  New File
                </button>
                <button 
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={createNewFolder}
                >
                  <FolderPlus className="w-4 h-4" />
                  New Folder
                </button>
                <div className="h-px bg-gray-200 dark:bg-gray-600 my-1" />
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Clipboard className="w-4 h-4" />
                  Paste
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* File Operations Progress */}
      <AnimatePresence>
        {operations.length > 0 && (
          <motion.div
            className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl p-4 min-w-80"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-800 dark:text-gray-200">File Operations</h3>
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-4 h-4" />
              </button>
            </div>
            {operations.map(op => (
              <div key={op.id} className="mb-2 last:mb-0">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">{op.type} {op.items.length} items</span>
                  <span className="text-gray-500">{op.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${op.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Preview Dialog */}
      <AnimatePresence>
        {previewItem && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewItem(null)}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl max-h-[80vh] w-full flex flex-col"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Preview Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-3">
                  {getFileIcon(previewItem)}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      {previewItem.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {previewItem.type === 'file' 
                        ? `${formatFileSize((previewItem as FileItem).size)} • ${(previewItem as FileItem).mimeType}`
                        : `${(previewItem as FolderItem).itemCount} items`
                      }
                    </p>
                  </div>
                </div>
                <button
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  onClick={() => setPreviewItem(null)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Preview Content */}
              <div className="flex-1 overflow-auto p-4">
                {previewItem.type === 'file' ? (
                  <div className="space-y-4">
                    {/* File Content Preview */}
                    {['txt', 'md', 'json', 'js', 'ts', 'jsx', 'tsx', 'css', 'html'].includes((previewItem as FileItem).extension.toLowerCase()) ? (
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-auto max-h-96">
                        <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                          {(previewItem as FileItem).content || 'No content available'}
                        </pre>
                      </div>
                    ) : ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes((previewItem as FileItem).extension.toLowerCase()) ? (
                      <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg p-8 min-h-64">
                        <div className="text-center text-gray-500 dark:text-gray-400">
                          <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p>Image preview not available</p>
                          <p className="text-sm mt-1">Original size: {formatFileSize((previewItem as FileItem).size)}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg p-8 min-h-64">
                        <div className="text-center text-gray-500 dark:text-gray-400">
                          {getFileIcon(previewItem)}
                          <p className="mt-4">Preview not available for this file type</p>
                          <p className="text-sm mt-1">{(previewItem as FileItem).mimeType}</p>
                        </div>
                      </div>
                    )}

                    {/* File Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Details</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Size:</span>
                            <span className="text-gray-800 dark:text-gray-200">{formatFileSize((previewItem as FileItem).size)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Modified:</span>
                            <span className="text-gray-800 dark:text-gray-200">{formatDate(previewItem.modified)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Created:</span>
                            <span className="text-gray-800 dark:text-gray-200">{formatDate(previewItem.created)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Type:</span>
                            <span className="text-gray-800 dark:text-gray-200">{(previewItem as FileItem).extension.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {previewItem.tags.length > 0 ? (
                            previewItem.tags.map(tag => (
                              <span key={tag} className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">No tags</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <Folder className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Folder preview not available</p>
                    <p className="text-sm mt-1">Contains {(previewItem as FolderItem).itemCount} items</p>
                  </div>
                )}
              </div>

              {/* Preview Actions */}
              <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2">
                  <button
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    onClick={() => toggleStar(previewItem)}
                  >
                    {previewItem.isStarred ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                    {previewItem.isStarred ? 'Unstar' : 'Star'}
                  </button>
                  <button
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    onClick={() => {
                      showItemProperties(previewItem)
                      setPreviewItem(null)
                    }}
                  >
                    <Info className="w-4 h-4" />
                    Properties
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    onClick={() => setPreviewItem(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Properties Dialog */}
      <AnimatePresence>
        {showProperties && propertiesItem && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowProperties(false)}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Properties Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-3">
                  {getFileIcon(propertiesItem)}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Properties
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {propertiesItem.name}
                    </p>
                  </div>
                </div>
                <button
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  onClick={() => setShowProperties(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Properties Content */}
              <div className="flex-1 overflow-auto p-4 space-y-6">
                {/* General */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-3">
                    General
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500 dark:text-gray-400">Name:</span>
                      <span className="text-gray-800 dark:text-gray-200 text-right max-w-48 truncate">
                        {propertiesItem.name}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500 dark:text-gray-400">Type:</span>
                      <span className="text-gray-800 dark:text-gray-200">
                        {propertiesItem.type === 'file' 
                          ? `${(propertiesItem as FileItem).extension.toUpperCase()} File`
                          : 'Folder'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500 dark:text-gray-400">Size:</span>
                      <span className="text-gray-800 dark:text-gray-200">
                        {propertiesItem.type === 'file' 
                          ? formatFileSize((propertiesItem as FileItem).size)
                          : `${(propertiesItem as FolderItem).itemCount} items`
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-3">
                    Dates
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500 dark:text-gray-400">Created:</span>
                      <span className="text-gray-800 dark:text-gray-200 text-right">
                        {formatDate(propertiesItem.created)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500 dark:text-gray-400">Modified:</span>
                      <span className="text-gray-800 dark:text-gray-200 text-right">
                        {formatDate(propertiesItem.modified)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500 dark:text-gray-400">Accessed:</span>
                      <span className="text-gray-800 dark:text-gray-200 text-right">
                        {formatDate(propertiesItem.accessed)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-3">
                    Permissions
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500 dark:text-gray-400">Owner:</span>
                      <span className="text-gray-800 dark:text-gray-200">{propertiesItem.permissions.owner}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500 dark:text-gray-400">Group:</span>
                      <span className="text-gray-800 dark:text-gray-200">{propertiesItem.permissions.group}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500 dark:text-gray-400">Access:</span>
                      <div className="flex gap-2 text-xs">
                        {propertiesItem.permissions.read && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded">
                            Read
                          </span>
                        )}
                        {propertiesItem.permissions.write && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                            Write
                          </span>
                        )}
                        {propertiesItem.permissions.execute && (
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded">
                            Execute
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-3">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {propertiesItem.tags.length > 0 ? (
                      propertiesItem.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">No tags assigned</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Properties Actions */}
              <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
                <button
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  onClick={() => toggleStar(propertiesItem)}
                >
                  {propertiesItem.isStarred ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                  {propertiesItem.isStarred ? 'Unstar' : 'Star'}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    onClick={() => setShowProperties(false)}
                  >
                    OK
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

