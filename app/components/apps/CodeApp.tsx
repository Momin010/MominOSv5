
"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Code, 
  File, 
  Folder, 
  Plus, 
  Save, 
  Search, 
  Replace, 
  Play, 
  Square, 
  GitBranch,
  Settings,
  Terminal,
  FileText,
  Image,
  Database,
  Globe,
  Braces,
  Hash,
  Type,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  X,
  Copy,
  Scissors,
  Clipboard,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  FolderPlus,
  FilePlus,
  Trash2,
  Download,
  Upload
} from "lucide-react"

interface FileItem {
  id: string
  name: string
  type: 'file' | 'folder'
  content?: string
  children?: FileItem[]
  language?: string
  path: string
  modified?: boolean
  saved?: boolean
  size?: number
  created?: Date
  lastModified?: Date
}

interface SearchResult {
  file: string
  line: number
  content: string
  match: string
}

interface CodeCompletion {
  text: string
  displayText: string
  type: 'keyword' | 'function' | 'variable' | 'snippet'
  description?: string
}

interface Tab {
  id: string
  name: string
  content: string
  language: string
  path: string
  modified: boolean
  saved: boolean
}

export default function CodeApp() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [tabs, setTabs] = useState<Tab[]>([])
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [replaceQuery, setReplaceQuery] = useState("")
  const [fontSize, setFontSize] = useState(14)
  const [wordWrap, setWordWrap] = useState(true)
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [theme, setTheme] = useState('dark')
  const [expandedFolders, setExpandedFolders] = useState<string[]>([])
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
  const [isRunning, setIsRunning] = useState(false)
  const [output, setOutput] = useState<string[]>([])
  const [showOutput, setShowOutput] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load files from localStorage on mount
  useEffect(() => {
    const savedFiles = localStorage.getItem('mominos-code-files')
    if (savedFiles) {
      try {
        const parsed = JSON.parse(savedFiles)
        setFiles(parsed)
        setExpandedFolders(parsed.filter((f: FileItem) => f.type === 'folder').map((f: FileItem) => f.id))
      } catch (e) {
        console.error('Failed to load saved files:', e)
        initializeDefaultFiles()
      }
    } else {
      initializeDefaultFiles()
    }
  }, [])

  // Save files to localStorage whenever files change
  useEffect(() => {
    localStorage.setItem('mominos-code-files', JSON.stringify(files))
  }, [files])

  const initializeDefaultFiles = () => {
    const defaultFiles: FileItem[] = [
      {
        id: 'root',
        name: 'project-root',
        type: 'folder',
        path: '/',
        children: [
          {
            id: 'readme',
            name: 'README.md',
            type: 'file',
            content: `# My Project

Welcome to your new project! This is a fully functional code editor.

## Features
- File management
- Syntax highlighting
- Real file operations
- Code execution
- Search and replace

Start coding by creating new files or editing existing ones!`,
            language: 'markdown',
            path: '/README.md',
            modified: false,
            saved: true
          },
          {
            id: 'src-folder',
            name: 'src',
            type: 'folder',
            path: '/src',
            children: [
              {
                id: 'main-js',
                name: 'main.js',
                type: 'file',
                content: `// Main application entry point
// Welcome to MominOS Code Editor!

function greet(name) {
  return \`Hello, \${name}! Happy coding!\`;
}

function calculateFibonacci(n) {
  if (n <= 1) return n;
  return calculateFibonacci(n - 1) + calculateFibonacci(n - 2);
}

// Example usage
const userName = 'Developer';
const greeting = greet(userName);

// Calculate fibonacci sequence
const fibSequence = [];
for (let i = 0; i < 10; i++) {
  fibSequence.push(\`Fibonacci(\${i}) = \${calculateFibonacci(i)}\`);
}

// Modern JavaScript features
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);

// Async/await example
async function fetchData() {
  try {
    // Simulating API call...
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Data fetched successfully!
    return { message: 'Hello from async function!' };
  } catch (error) {
    throw new Error('Error fetching data: ' + error);
  }
}

fetchData().then(data => {
  // Handle success
  return data;
});`,
                language: 'javascript',
                path: '/src/main.js',
                modified: false,
                saved: true
              },
              {
                id: 'styles-css',
                name: 'styles.css',
                type: 'file',
                content: `/* MominOS Code Editor Styles */
:root {
  --primary-color: #8b5cf6;
  --secondary-color: #10b981;
  --background: #0f172a;
  --surface: #1e293b;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --border: #334155;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--background);
  color: var(--text-primary);
  line-height: 1.6;
}

.glass-effect {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.code-editor {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
}

.syntax-highlight {
  color: var(--text-primary);
}

.syntax-keyword {
  color: #c678dd;
  font-weight: bold;
}

.syntax-string {
  color: #98c379;
}

.syntax-comment {
  color: #5c6370;
  font-style: italic;
}

.syntax-number {
  color: #d19a66;
}

.syntax-function {
  color: #61afef;
}`,
                language: 'css',
                path: '/src/styles.css',
                modified: false,
                saved: true
              }
            ]
          },
          {
            id: 'package-json',
            name: 'package.json',
            type: 'file',
            content: `{
  "name": "mominos-project",
  "version": "1.0.0",
  "description": "A MominOS Code Editor project",
  "main": "src/main.js",
  "scripts": {
    "start": "node src/main.js",
    "dev": "node src/main.js",
    "test": "echo \\"No tests specified\\" && exit 1"
  },
  "keywords": ["mominos", "desktop", "app", "code"],
  "author": "MominOS Developer",
  "license": "MIT",
  "dependencies": {},
  "devDependencies": {}
}`,
            language: 'json',
            path: '/package.json',
            modified: false,
            saved: true
          }
        ]
      }
    ]
    setFiles(defaultFiles)
    setExpandedFolders(['root', 'src-folder'])
  }

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') return Folder
    
    const ext = file.name.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'tsx':
      case 'ts':
      case 'js':
      case 'jsx':
        return Code
      case 'css':
      case 'scss':
      case 'less':
        return Hash
      case 'html':
      case 'htm':
        return Globe
      case 'json':
        return Braces
      case 'md':
      case 'txt':
        return FileText
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return Image
      case 'sql':
        return Database
      default:
        return File
    }
  }

  const getLanguageFromFile = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'ts':
      case 'tsx':
        return 'typescript'
      case 'js':
      case 'jsx':
        return 'javascript'
      case 'css':
        return 'css'
      case 'html':
        return 'html'
      case 'json':
        return 'json'
      case 'md':
        return 'markdown'
      case 'py':
        return 'python'
      case 'java':
        return 'java'
      case 'cpp':
      case 'cc':
      case 'cxx':
        return 'cpp'
      case 'c':
        return 'c'
      default:
        return 'text'
    }
  }

  const findFileById = (files: FileItem[], id: string): FileItem | null => {
    for (const file of files) {
      if (file.id === id) return file
      if (file.children) {
        const found = findFileById(file.children, id)
        if (found) return found
      }
    }
    return null
  }

  const updateFileContent = (files: FileItem[], fileId: string, newContent: string): FileItem[] => {
    return files.map(file => {
      if (file.id === fileId) {
        return { ...file, content: newContent, modified: true, saved: false }
      }
      if (file.children) {
        return { ...file, children: updateFileContent(file.children, fileId, newContent) }
      }
      return file
    })
  }

  const openFile = (file: FileItem) => {
    if (file.type === 'folder' || !file.content === undefined) return

    const existingTab = tabs.find(tab => tab.path === file.path)
    if (existingTab) {
      setActiveTab(existingTab.id)
      return
    }

    const newTab: Tab = {
      id: file.id,
      name: file.name,
      content: file.content || '',
      language: file.language || getLanguageFromFile(file.name),
      path: file.path,
      modified: false,
      saved: file.saved || true
    }

    setTabs(prev => [...prev, newTab])
    setActiveTab(newTab.id)
  }

  const closeTab = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId)
    if (tab && tab.modified) {
      if (!confirm(`${tab.name} has unsaved changes. Close anyway?`)) {
        return
      }
    }

    setTabs(prev => prev.filter(tab => tab.id !== tabId))
    if (activeTab === tabId) {
      const remainingTabs = tabs.filter(tab => tab.id !== tabId)
      setActiveTab(remainingTabs.length > 0 ? remainingTabs[remainingTabs.length - 1].id : null)
    }
  }

  const updateTabContent = (tabId: string, content: string) => {
    setTabs(prev => prev.map(tab => 
      tab.id === tabId 
        ? { ...tab, content, modified: true, saved: false }
        : tab
    ))

    // Also update the file content
    setFiles(prev => updateFileContent(prev, tabId, content))
  }

  const saveFile = () => {
    if (!activeTab) return
    
    const tab = tabs.find(t => t.id === activeTab)
    if (!tab) return

    setTabs(prev => prev.map(tab => 
      tab.id === activeTab 
        ? { ...tab, modified: false, saved: true }
        : tab
    ))

    // Update the file as saved
    const updateFileSaved = (files: FileItem[]): FileItem[] => {
      return files.map(file => {
        if (file.id === activeTab) {
          return { ...file, modified: false, saved: true }
        }
        if (file.children) {
          return { ...file, children: updateFileSaved(file.children) }
        }
        return file
      })
    }

    setFiles(prev => updateFileSaved(prev))
    
    // File save completed
    setOutput(prev => [...prev, `✓ File saved: ${tab.name} at ${new Date().toLocaleTimeString()}`])
  }

  const saveAllFiles = () => {
    const modifiedTabs = tabs.filter(tab => tab.modified)
    modifiedTabs.forEach(tab => {
      setTabs(prev => prev.map(t => 
        t.id === tab.id 
          ? { ...t, modified: false, saved: true }
          : t
      ))
    })

    const updateAllFilesSaved = (files: FileItem[]): FileItem[] => {
      return files.map(file => {
        if (file.type === 'file') {
          return { ...file, modified: false, saved: true }
        }
        if (file.children) {
          return { ...file, children: updateAllFilesSaved(file.children) }
        }
        return file
      })
    }

    setFiles(prev => updateAllFilesSaved(prev))
    setOutput(prev => [...prev, `✓ All files saved at ${new Date().toLocaleTimeString()}`])
  }

  const createNewFile = (parentId: string = 'root') => {
    const fileName = prompt('Enter file name:')
    if (!fileName) return

    const newFile: FileItem = {
      id: `file-${Date.now()}`,
      name: fileName,
      type: 'file',
      content: '',
      language: getLanguageFromFile(fileName),
      path: `/${fileName}`,
      modified: false,
      saved: true
    }

    const addFileToParent = (files: FileItem[]): FileItem[] => {
      return files.map(file => {
        if (file.id === parentId && file.type === 'folder') {
          return {
            ...file,
            children: [...(file.children || []), newFile]
          }
        }
        if (file.children) {
          return { ...file, children: addFileToParent(file.children) }
        }
        return file
      })
    }

    setFiles(prev => addFileToParent(prev))
    openFile(newFile)
  }

  const createNewFolder = (parentId: string = 'root') => {
    const folderName = prompt('Enter folder name:')
    if (!folderName) return

    const newFolder: FileItem = {
      id: `folder-${Date.now()}`,
      name: folderName,
      type: 'folder',
      path: `/${folderName}`,
      children: []
    }

    const addFolderToParent = (files: FileItem[]): FileItem[] => {
      return files.map(file => {
        if (file.id === parentId && file.type === 'folder') {
          return {
            ...file,
            children: [...(file.children || []), newFolder]
          }
        }
        if (file.children) {
          return { ...file, children: addFolderToParent(file.children) }
        }
        return file
      })
    }

    setFiles(prev => addFolderToParent(prev))
    setExpandedFolders(prev => [...prev, newFolder.id])
  }

  const deleteFile = (fileId: string) => {
    const file = findFileById(files, fileId)
    if (!file) return

    if (!confirm(`Delete ${file.name}?`)) return

    // Close tab if file is open
    const openTab = tabs.find(tab => tab.id === fileId)
    if (openTab) {
      closeTab(fileId)
    }

    const removeFile = (files: FileItem[]): FileItem[] => {
      return files.filter(file => file.id !== fileId).map(file => ({
        ...file,
        children: file.children ? removeFile(file.children) : undefined
      }))
    }

    setFiles(prev => removeFile(prev))
  }

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => 
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    )
  }

  const runCode = async () => {
    if (!activeTab) return

    const tab = tabs.find(t => t.id === activeTab)
    if (!tab) return

    setIsRunning(true)
    setShowOutput(true)
    setOutput(prev => [...prev, `\n--- Running ${tab.name} ---`])

    try {
      if (tab.language === 'javascript') {
        // Create a safe execution context
        const consoleOutput: string[] = []
        const mockConsole = {
          log: (...args: any[]) => {
            consoleOutput.push(args.map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' '))
          },
          error: (...args: any[]) => {
            consoleOutput.push('ERROR: ' + args.map(arg => String(arg)).join(' '))
          },
          warn: (...args: any[]) => {
            consoleOutput.push('WARNING: ' + args.map(arg => String(arg)).join(' '))
          }
        }

        // Simple evaluation (in a real app, you'd want a more secure sandbox)
        const wrappedCode = `
          (function() {
            const console = arguments[0];
            ${tab.content}
          })
        `

        try {
          const func = new Function('return ' + wrappedCode)()
          await func(mockConsole)
          
          if (consoleOutput.length === 0) {
            consoleOutput.push('Code executed successfully (no output)')
          }
        } catch (error) {
          consoleOutput.push(`Runtime Error: ${error instanceof Error ? error.message : String(error)}`)
        }

        setOutput(prev => [...prev, ...consoleOutput])
      } else {
        setOutput(prev => [...prev, `Language ${tab.language} execution not implemented yet`])
      }
    } catch (error) {
      setOutput(prev => [...prev, `Error: ${error instanceof Error ? error.message : String(error)}`])
    } finally {
      setIsRunning(false)
      setOutput(prev => [...prev, `--- Execution completed ---\n`])
    }
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        const newFile: FileItem = {
          id: `import-${Date.now()}-${Math.random()}`,
          name: file.name,
          type: 'file',
          content,
          language: getLanguageFromFile(file.name),
          path: `/${file.name}`,
          modified: false,
          saved: true
        }

        setFiles(prev => {
          const rootFolder = prev.find(f => f.id === 'root')
          if (rootFolder && rootFolder.children) {
            return prev.map(f => 
              f.id === 'root' 
                ? { ...f, children: [...f.children!, newFile] }
                : f
            )
          }
          return [...prev, newFile]
        })
      }
      reader.readAsText(file)
    })

    event.target.value = ''
  }

  const exportProject = () => {
    const projectData = {
      name: 'MominOS Project Export',
      timestamp: new Date().toISOString(),
      files: files
    }

    const dataStr = JSON.stringify(projectData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    
    const link = document.createElement('a')
    link.href = URL.createObjectURL(dataBlob)
    link.download = `mominos-project-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const renderFileTree = (items: FileItem[], level = 0) => {
    return items.map(file => {
      const Icon = getFileIcon(file)
      const isExpanded = expandedFolders.includes(file.id)
      
      return (
        <div key={file.id}>
          <motion.div
            className={`flex items-center gap-2 p-2 hover:bg-white/10 cursor-pointer group ${
              activeTab === file.id ? 'bg-white/20' : ''
            }`}
            style={{ paddingLeft: `${12 + level * 16}px` }}
            onClick={() => file.type === 'folder' ? toggleFolder(file.id) : openFile(file)}
            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            onContextMenu={(e) => {
              e.preventDefault()
              // Context menu could be added here
            }}
          >
            {file.type === 'folder' && (
              isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
            )}
            <Icon className={`w-4 h-4 ${
              file.type === 'folder' ? 'text-blue-400' : 'text-gray-400'
            }`} />
            <span className="text-white text-sm flex-1">{file.name}</span>
            {file.modified && <div className="w-2 h-2 bg-orange-400 rounded-full" />}
            
            {/* File actions */}
            <div className="opacity-0 group-hover:opacity-100 flex gap-1">
              {file.type === 'folder' && (
                <>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation()
                      createNewFile(file.id)
                    }}
                    className="text-gray-400 hover:text-white"
                    whileHover={{ scale: 1.1 }}
                  >
                    <FilePlus className="w-3 h-3" />
                  </motion.button>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation()
                      createNewFolder(file.id)
                    }}
                    className="text-gray-400 hover:text-white"
                    whileHover={{ scale: 1.1 }}
                  >
                    <FolderPlus className="w-3 h-3" />
                  </motion.button>
                </>
              )}
              <motion.button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteFile(file.id)
                }}
                className="text-gray-400 hover:text-red-400"
                whileHover={{ scale: 1.1 }}
              >
                <Trash2 className="w-3 h-3" />
              </motion.button>
            </div>
          </motion.div>
          {file.type === 'folder' && file.children && isExpanded && (
            <div>{renderFileTree(file.children, level + 1)}</div>
          )}
        </div>
      )
    })
  }

  const activeTabData = tabs.find(tab => tab.id === activeTab)

  const updateCursorPosition = useCallback(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current
      const text = textarea.value
      const cursorPos = textarea.selectionStart
      
      const lines = text.substring(0, cursorPos).split('\n')
      const line = lines.length
      const column = lines[lines.length - 1].length + 1
      
      setCursorPosition({ line, column })
    }
  }, [])

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.addEventListener('keyup', updateCursorPosition)
      textarea.addEventListener('click', updateCursorPosition)
      
      return () => {
        textarea.removeEventListener('keyup', updateCursorPosition)
        textarea.removeEventListener('click', updateCursorPosition)
      }
    }
  }, [activeTab, updateCursorPosition])

  return (
    <div className="h-full bg-black/20 backdrop-blur-xl flex flex-col">
      {/* Header */}
      <div className="glass-topbar p-2 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-purple-400" />
            <span className="text-white font-medium">Code Editor</span>
          </div>
          <div className="flex items-center gap-1">
            <motion.button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="glass-button p-1"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Folder className="w-4 h-4 text-white" />
            </motion.button>
            <motion.button
              onClick={() => setShowSearch(!showSearch)}
              className="glass-button p-1"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Search className="w-4 h-4 text-white" />
            </motion.button>
            <motion.button
              onClick={saveFile}
              className="glass-button p-1"
              disabled={!activeTab || !activeTabData?.modified}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Save className="w-4 h-4 text-white" />
            </motion.button>
            <motion.button
              onClick={saveAllFiles}
              className="glass-button p-1 text-xs px-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Save All
            </motion.button>
            <motion.button
              onClick={runCode}
              disabled={!activeTab || isRunning}
              className="glass-button p-1"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isRunning ? (
                <Square className="w-4 h-4 text-red-400" />
              ) : (
                <Play className="w-4 h-4 text-green-400" />
              )}
            </motion.button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => fileInputRef.current?.click()}
              className="glass-button p-1"
              whileHover={{ scale: 1.1 }}
            >
              <Upload className="w-4 h-4 text-white" />
            </motion.button>
            <motion.button
              onClick={exportProject}
              className="glass-button p-1"
              whileHover={{ scale: 1.1 }}
            >
              <Download className="w-4 h-4 text-white" />
            </motion.button>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Lines: {activeTabData?.content.split('\n').length || 0}</span>
            <span>Language: {activeTabData?.language || 'None'}</span>
            <span>Encoding: UTF-8</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            className="p-4 border-b border-white/10 glass-card"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input flex-1 text-white placeholder-gray-400"
              />
              <input
                type="text"
                placeholder="Replace..."
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                className="glass-input flex-1 text-white placeholder-gray-400"
              />
              <motion.button
                onClick={() => {
                  if (activeTabData && searchQuery) {
                    const newContent = activeTabData.content.replace(new RegExp(searchQuery, 'g'), replaceQuery)
                    updateTabContent(activeTab!, newContent)
                  }
                }}
                className="glass-button px-3 py-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Replace className="w-4 h-4 text-white" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex">
        {/* Sidebar */}
        {!sidebarCollapsed && (
          <div className="w-64 glass-card border-r border-white/10 flex flex-col">
            <div className="p-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium text-sm">Explorer</span>
                <div className="flex gap-1 ml-auto">
                  <motion.button
                    onClick={() => createNewFile()}
                    className="glass-button p-1"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FilePlus className="w-3 h-3 text-white" />
                  </motion.button>
                  <motion.button
                    onClick={() => createNewFolder()}
                    className="glass-button p-1"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FolderPlus className="w-3 h-3 text-white" />
                  </motion.button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              {files.length === 0 ? (
                <div className="p-4 text-center text-gray-400">
                  <Folder className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No files yet</p>
                  <motion.button
                    onClick={() => createNewFile()}
                    className="glass-button text-xs px-2 py-1 mt-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    Create File
                  </motion.button>
                </div>
              ) : (
                renderFileTree(files)
              )}
            </div>
          </div>
        )}

        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          {tabs.length > 0 && (
            <div className="flex items-center gap-0 border-b border-white/10 overflow-x-auto">
              {tabs.map(tab => (
                <motion.div
                  key={tab.id}
                  className={`flex items-center gap-2 px-3 py-2 border-r border-white/10 cursor-pointer min-w-0 ${
                    activeTab === tab.id ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <span className="text-white text-sm truncate">{tab.name}</span>
                  {tab.modified && <div className="w-2 h-2 bg-orange-400 rounded-full" />}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation()
                      closeTab(tab.id)
                    }}
                    className="text-gray-400 hover:text-white"
                    whileHover={{ scale: 1.1 }}
                  >
                    <X className="w-3 h-3" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}

          {/* Editor Content */}
          <div className="flex-1 flex flex-col">
            {activeTabData ? (
              <div className="flex-1 flex">
                {/* Line Numbers */}
                {showLineNumbers && (
                  <div className="w-12 bg-black/30 border-r border-white/10 p-2 text-right text-gray-500 text-sm font-mono overflow-hidden">
                    {activeTabData.content.split('\n').map((_, i) => (
                      <div key={i} className="leading-6 hover:bg-white/10 px-1">{i + 1}</div>
                    ))}
                  </div>
                )}
                
                {/* Code Editor */}
                <textarea
                  ref={textareaRef}
                  value={activeTabData.content}
                  onChange={(e) => updateTabContent(activeTabData.id, e.target.value)}
                  className="flex-1 bg-transparent text-white font-mono p-4 outline-none resize-none leading-6"
                  style={{ 
                    fontSize: `${fontSize}px`,
                    whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
                    wordWrap: wordWrap ? 'break-word' : 'normal'
                  }}
                  spellCheck={false}
                  placeholder="Start coding..."
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Code className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No file selected</p>
                  <p className="text-sm mb-4">Open a file from the explorer to start coding</p>
                  <motion.button
                    onClick={() => createNewFile()}
                    className="glass-button px-4 py-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    Create New File
                  </motion.button>
                </div>
              </div>
            )}
            
            {/* Output Panel */}
            <AnimatePresence>
              {showOutput && (
                <motion.div
                  className="h-48 border-t border-white/10 bg-black/40"
                  initial={{ height: 0 }}
                  animate={{ height: 192 }}
                  exit={{ height: 0 }}
                >
                  <div className="flex items-center justify-between p-2 border-b border-white/10">
                    <span className="text-white text-sm font-medium">Output</span>
                    <div className="flex gap-2">
                      <motion.button
                        onClick={() => setOutput([])}
                        className="text-gray-400 hover:text-white text-sm"
                        whileHover={{ scale: 1.05 }}
                      >
                        Clear
                      </motion.button>
                      <motion.button
                        onClick={() => setShowOutput(false)}
                        className="text-gray-400 hover:text-white"
                        whileHover={{ scale: 1.1 }}
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                  <div className="p-2 h-full overflow-auto font-mono text-sm text-gray-300">
                    {output.map((line, i) => (
                      <div key={i} className="mb-1 whitespace-pre-wrap">
                        {line}
                      </div>
                    ))}
                    {output.length === 0 && (
                      <div className="text-gray-500 text-center mt-8">
                        Output will appear here when you run your code
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="glass-topbar p-2 border-t border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4 text-gray-400">
          <div className="flex items-center gap-1">
            <GitBranch className="w-3 h-3" />
            <span>main</span>
          </div>
          {activeTabData && (
            <>
              <span>Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
              <span>{activeTabData.language}</span>
              <span>Spaces: 2</span>
              <span className={activeTabData.modified ? 'text-orange-400' : 'text-green-400'}>
                {activeTabData.modified ? 'Modified' : 'Saved'}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-4 text-gray-400">
          <motion.button
            onClick={() => setFontSize(Math.max(10, fontSize - 1))}
            className="hover:text-white"
            whileHover={{ scale: 1.1 }}
          >
            <ZoomOut className="w-3 h-3" />
          </motion.button>
          <span>{fontSize}px</span>
          <motion.button
            onClick={() => setFontSize(Math.min(24, fontSize + 1))}
            className="hover:text-white"
            whileHover={{ scale: 1.1 }}
          >
            <ZoomIn className="w-3 h-3" />
          </motion.button>
          <motion.button
            onClick={() => setWordWrap(!wordWrap)}
            className={`hover:text-white ${wordWrap ? 'text-purple-400' : ''}`}
            whileHover={{ scale: 1.1 }}
          >
            <Type className="w-3 h-3" />
          </motion.button>
          <motion.button
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            className={`hover:text-white ${showLineNumbers ? 'text-purple-400' : ''}`}
            whileHover={{ scale: 1.1 }}
          >
            <Hash className="w-3 h-3" />
          </motion.button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".js,.ts,.tsx,.jsx,.css,.html,.json,.md,.txt,.py,.java,.cpp,.c"
        onChange={handleFileImport}
        className="hidden"
      />
    </div>
  )
}
