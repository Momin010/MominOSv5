"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { 
  Terminal, 
  X, 
  Copy, 
  Maximize2, 
  Minimize2,
  Settings,
  Folder,
  History,
  Search
} from "lucide-react"
import { StorageManager } from "@/app/lib/storage"

interface TerminalLine {
  id: string
  type: 'command' | 'output' | 'error'
  content: string
  timestamp: Date
}

interface TerminalCommand {
  command: string
  description: string
  execute: (args: string[]) => string | Promise<string>
}

export default function TerminalApp() {
  const [currentPath, setCurrentPath] = useState("~")
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [currentInput, setCurrentInput] = useState("")
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: '1',
      type: 'output',
      content: 'Welcome to MominOS Terminal v1.0.0',
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'output',
      content: 'Type "help" for available commands',
      timestamp: new Date()
    }
  ])
  const [theme, setTheme] = useState('dark')
  const [fontSize, setFontSize] = useState(14)
  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [environmentVars, setEnvironmentVars] = useState<Record<string, string>>({
    HOME: "/home/user",
    PATH: "/usr/bin:/bin:/usr/local/bin",
    USER: "user",
    SHELL: "/bin/mominsh"
  })
  const storage = StorageManager.getInstance()

  const commands: Record<string, TerminalCommand> = {
    help: {
      command: "help",
      description: "Show this help message",
      execute: () => `Available commands:
${Object.entries(commands).map(([name, cmd]) => `${name.padEnd(15)} - ${cmd.description}`).join('\n')}`
    },
    clear: {
      command: "clear",
      description: "Clear the terminal",
      execute: () => {
        setLines([]);
        setCurrentInput("");
        return "";
      }
    },
    ls: {
      command: "ls",
      description: "List directory contents",
      execute: () => `Documents/    Pictures/     Music/        Videos/
Downloads/    Desktop/      Public/       Templates/
report.pdf    photo.jpg     song.mp3      video.mp4
script.js     README.md     package.json  .gitignore`
    },
    pwd: {
      command: "pwd",
      description: "Print working directory",
      execute: () => `/home/user${currentPath === '~' ? '' : currentPath}`
    },
    cd: {
      command: "cd",
      description: "Change directory",
      execute: (args: string[]) => {
        const newPath = args[0] || '~';
        if (newPath === '..') {
          const pathParts = currentPath.split('/').filter(p => p);
          pathParts.pop();
          setCurrentPath(pathParts.length ? '/' + pathParts.join('/') : '~');
        } else if (newPath === '~' || newPath === '/') {
          setCurrentPath('~');
        } else {
          setCurrentPath(newPath.startsWith('/') ? newPath : `${currentPath}/${newPath}`);
        }
        return '';
      }
    },
    date: {
      command: "date",
      description: "Show current date and time",
      execute: () => new Date().toString()
    },
    echo: {
      command: "echo",
      description: "Echo text",
      execute: (args: string[]) => args.join(' ')
    },
    whoami: {
      command: "whoami",
      description: "Show current user",
      execute: () => environmentVars.USER || 'user'
    },
    uname: {
      command: "uname",
      description: "System information",
      execute: () => 'MominOS 1.0.0 x86_64'
    },
    history: {
      command: "history",
      description: "Show command history",
      execute: () => commandHistory.map((cmd, i) => `${i + 1}  ${cmd}`).join('\n')
    },
    mkdir: {
      command: "mkdir",
      description: "Create directory",
      execute: (args: string[]) => {
        if (args[0]) {
          return `Directory '${args[0]}' created`;
        } else {
          return 'mkdir: missing directory name';
        }
      }
    },
    touch: {
      command: "touch",
      description: "Create file",
      execute: (args: string[]) => {
        if (args[0]) {
          return `File '${args[0]}' created`;
        } else {
          return 'touch: missing file name';
        }
      }
    },
    cat: {
      command: "cat",
      description: "Display file contents",
      execute: (args: string[]) => {
        if (args[0]) {
          return `Contents of ${args[0]}:\nThis is a sample file content.\nLorem ipsum dolor sit amet...`;
        } else {
          return 'cat: missing file name';
        }
      }
    },
    ps: {
      command: "ps",
      description: "Show processes",
      execute: () => `PID    COMMAND
1      /sbin/init
123    systemd
456    desktop.tsx
789    terminal-app
1011   node server.js`
    },
    top: {
      command: "top",
      description: "Show system resources",
      execute: () => `Tasks: 42 total, 1 running, 41 sleeping
%Cpu(s): 12.5 us, 2.1 sy, 0.0 ni, 85.2 id
Memory: 8192MB total, 4096MB used, 4096MB free`
    },
    ping: {
      command: "ping",
      description: "Ping a host",
      execute: (args: string[]) => {
        const host = args[0] || 'google.com';
        return `PING ${host} (142.250.191.14): 56 data bytes
64 bytes from 142.250.191.14: icmp_seq=0 ttl=54 time=12.345 ms
64 bytes from 142.250.191.14: icmp_seq=1 ttl=54 time=11.234 ms
--- ${host} ping statistics ---
2 packets transmitted, 2 packets received, 0.0% packet loss`;
      }
    },
    curl: {
      command: "curl",
      description: "Make HTTP requests",
      execute: (args: string[]) => {
        const url = args[0] || 'https://httpbin.org/json';
        return `{
  "slideshow": {
    "author": "MominOS",
    "date": "date of publication",
    "slides": [
      {
        "title": "Sample response",
        "type": "all"
      }
    ],
    "title": "Sample Slide Show"
  }
}`;
      }
    },
    git: {
      command: "git",
      description: "Git commands",
      execute: (args: string[]) => {
        if (args[0] === 'status') {
          return `On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  modified:   desktop.tsx
  modified:   terminal-app.tsx

no changes added to commit (use "git add" to commit)`;
        } else if (args[0] === 'log') {
          return `commit a1b2c3d4e5f6 (HEAD -> main)
Author: User <user@example.com>
Date:   ${new Date().toDateString()}

    Add terminal app functionality`;
        } else {
          return `usage: git [--version] [--help] [-C <path>] [-c <name>=<value>]
           [--exec-path[=<path>]] [--html-path] [--man-path] [--info-path]
           [-p | --paginate | -P | --no-pager] [--no-replace-objects] [--bare]
           [--git-dir=<path>] [--work-tree=<path>] [--namespace=<name>]
           <command> [<args>]`;
        }
      }
    },
    npm: {
      command: "npm",
      description: "Node.js package manager",
      execute: (args: string[]) => {
        if (args[0] === 'version' || args[0] === '-v') {
          return `{
  npm: '10.2.4',
  node: '20.10.0',
  v8: '11.3.244.8',
  uv: '1.46.0',
  zlib: '1.2.13',
  brotli: '1.0.9',
  ares: '1.20.1',
  modules: '115',
  nghttp2: '1.57.0',
  napi: '9',
  llhttp: '8.1.1',
  openssl: '3.0.12'
}`;
        } else {
          return `Usage: npm <command>

where <command> is one of:
    access, adduser, audit, bin, bugs, c, cache, ci, cit,
    clean-install, clean-install-test, completion, config,
    create, ddp, dedupe, deprecate, dist-tag, docs, doctor,
    edit, exec, explain, explore, find-dupes, fund, get, help,
    help-search, hook, i, init, install, install-ci-test,
    install-test, it, link, list, ln, login, logout, ls,
    outdated, owner, pack, ping, prefix, profile, prune,
    publish, rebuild, repo, restart, root, run, run-script, s,
    se, search, set, shrinkwrap, star, stars, start, stop, t,
    team, test, token, tst, un, uninstall, unpublish, unstar,
    up, update, v, version, view, whoami`;
        }
      }
    },
    python: {
      command: "python",
      description: "Python interpreter",
      execute: () => `Python 3.11.0 (main, Oct 24 2022, 18:26:48) [GCC 9.4.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> print("Hello from MominOS Terminal!")
Hello from MominOS Terminal!
>>> exit()`
    },
    node: {
      command: "node",
      description: "Node.js interpreter",
      execute: () => `Welcome to Node.js v20.10.0.
Type ".help" for more information.
> console.log("Hello from Node.js in MominOS!")
Hello from Node.js in MominOS!
undefined
> process.exit()`
    },
    mkdir: {
      command: "mkdir",
      description: "Create a new directory",
      execute: async (args: string[]) => {
        if (!args[0]) return "mkdir: missing operand";
        await storage.createDirectory(currentPath, args[0]);
        return `Directory '${args[0]}' created`;
      }
    },
    touch: {
      command: "touch",
      description: "Create a new file",
      execute: async (args: string[]) => {
        if (!args[0]) return "touch: missing file name";
        await storage.createFile(currentPath, args[0], "");
        return `File '${args[0]}' created`;
      }
    },
    cat: {
      command: "cat",
      description: "Display file content",
      execute: async (args: string[]) => {
        if (!args[0]) return "cat: missing file name";
        const content = await storage.readFile(currentPath, args[0]);
        return content !== null ? content : `cat: ${args[0]}: No such file or directory`;
      }
    },
    rm: {
      command: "rm",
      description: "Remove files or directories",
      execute: async (args: string[]) => {
        if (!args[0]) return "rm: missing operand";
        const itemType = await storage.getItemType(currentPath, args[0]);
        if (itemType === "file") {
          await storage.deleteFile(currentPath, args[0]);
          return `File '${args[0]}' removed`;
        } else if (itemType === "directory") {
          await storage.deleteDirectory(currentPath, args[0]);
          return `Directory '${args[0]}' removed`;
        } else {
          return `rm: cannot remove '${args[0]}': No such file or directory`;
        }
      }
    },
    cp: {
      command: "cp",
      description: "Copy files",
      execute: async (args: string[]) => {
        if (args.length < 2) return "cp: missing file operand";
        const source = args[0];
        const destination = args[1];
        const content = await storage.readFile(currentPath, source);
        if (content === null) return `cp: cannot stat '${source}': No such file or directory`;
        await storage.createFile(currentPath, destination, content);
        return ``;
      }
    },
    mv: {
      command: "mv",
      description: "Move files",
      execute: async (args: string[]) => {
        if (args.length < 2) return "mv: missing file operand";
        const source = args[0];
        const destination = args[1];
        const content = await storage.readFile(currentPath, source);
        if (content === null) return `mv: cannot stat '${source}': No such file or directory`;
        await storage.deleteFile(currentPath, source);
        await storage.createFile(currentPath, destination, content);
        return ``;
      }
    },
    cd: {
      command: "cd",
      description: "Change directory",
      execute: async (args: string[]) => {
        const targetDir = args[0] ?? "~";
        const newPath = await storage.changeDirectory(currentPath, targetDir, environmentVars.HOME || "/home/user");
        if (newPath === null) return `cd: ${targetDir}: No such file or directory`;
        setCurrentPath(newPath);
        return "";
      }
    },
    ls: {
      command: "ls",
      description: "List directory contents",
      execute: async (args: string[]) => {
        const dirToList = args[0] ?? ".";
        const items = await storage.listDirectory(currentPath, dirToList);
        if (items === null) return `ls: cannot access '${dirToList}': No such file or directory`;
        return items.map(item => `${item.name}${item.type === 'directory' ? '/' : ''}`).join("\n");
      }
    },
    get: {
      command: "get",
      description: "Get value of an environment variable",
      execute: (args: string[]) => {
        if (!args[0]) return "get: missing variable name";
        return environmentVars[args[0]] ?? `${args[0]}: undefined variable`;
      }
    },
    set: {
      command: "set",
      description: "Set environment variable",
      execute: (args: string[]) => {
        if (!args[0] || !args[1]) return "set: invalid syntax";
        setEnvironmentVars(prev => ({ ...prev, [args[0]]: args[1] }));
        return "";
      }
    },
    exit: {
      command: "exit",
      description: "Exit the terminal",
      execute: () => {
        window.close();
        return "";
      }
    }
  }

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [lines])

  const handleInputFocus = () => {
    inputRef.current?.focus()
  }

  const filterSuggestions = useCallback((input: string) => {
    if (!input) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    const availableCommands = Object.keys(commands)
    const matchingCommands = availableCommands.filter(cmd => cmd.startsWith(input))
    setSuggestions(matchingCommands)
    setShowSuggestions(matchingCommands.length > 0)
  }, [commands])

  const executeCommand = async (command: string) => {
    const trimmedCommand = command.trim()
    if (!trimmedCommand) {
      // Add an empty line if the input is empty to maintain layout
      setLines(prev => [...prev, {
        id: Date.now().toString(),
        type: 'command',
        content: `${currentPath} $ `,
        timestamp: new Date()
      }])
      return
    }

    setCommandHistory(prev => [...prev, trimmedCommand])
    setHistoryIndex(-1)

    const commandLine: TerminalLine = {
      id: Date.now().toString(),
      type: 'command',
      content: `${currentPath} $ ${trimmedCommand}`,
      timestamp: new Date()
    }

    const args = trimmedCommand.split(' ')
    const cmdName = args[0].toLowerCase()
    let output = ''
    let outputType: 'output' | 'error' = 'output'

    const commandExecutor = commands[cmdName]

    if (commandExecutor) {
      try {
        const result = await commandExecutor.execute(args.slice(1));
        output = result;
        if (result.includes("error") || result.includes("missing") || result.includes("No such file or directory")) {
          outputType = 'error';
        }
      } catch (error: any) {
        output = `Error executing command: ${error.message}`;
        outputType = 'error';
      }
    } else {
      output = `${cmdName}: command not found`;
      outputType = 'error';
    }

    const newLines: TerminalLine[] = [commandLine];
    if (output) {
      newLines.push({
        id: (Date.now() + 1).toString(),
        type: outputType,
        content: output,
        timestamp: new Date()
      });
    }

    setLines(prev => [...prev, ...newLines]);
    setCurrentInput("");
    setSuggestions([]);
    setShowSuggestions(false);
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      executeCommand(currentInput)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setCurrentInput(commandHistory[newIndex])
        filterSuggestions(commandHistory[newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex !== -1) {
        const newIndex = Math.min(commandHistory.length - 1, historyIndex + 1)
        if (newIndex === commandHistory.length - 1 || historyIndex === commandHistory.length - 1) {
          setHistoryIndex(-1)
          setCurrentInput("")
          setSuggestions([])
          setShowSuggestions(false)
        } else {
          setHistoryIndex(newIndex)
          setCurrentInput(commandHistory[newIndex])
          filterSuggestions(commandHistory[newIndex])
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      if (suggestions.length === 1) {
        setCurrentInput(suggestions[0])
        setSuggestions([])
        setShowSuggestions(false)
      } else if (suggestions.length > 1) {
        // Display all suggestions if multiple match
        setLines(prev => [...prev, {
          id: Date.now().toString(),
          type: 'output',
          content: suggestions.join('  '),
          timestamp: new Date()
        }])
      }
    } else if (e.ctrlKey && e.key === 'c') {
      e.preventDefault()
      setLines(prev => [...prev, {
        id: Date.now().toString(),
        type: 'command',
        content: `${currentPath} $ ${currentInput}^C`,
        timestamp: new Date()
      }])
      setCurrentInput("")
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const copyToClipboard = () => {
    const terminalContent = lines.map(line => line.content).join('\n')
    navigator.clipboard.writeText(terminalContent)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCurrentInput(value)
    filterSuggestions(value)
  }

  return (
    <div className="h-full bg-black/95 backdrop-blur-xl flex flex-col font-mono" onClick={handleInputFocus}>
      {/* Header */}
      <div className="glass-topbar p-2 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-green-400" />
          <span className="text-white text-sm font-medium">Terminal</span>
          <span className="text-gray-400 text-xs">{currentPath}</span>
        </div>
        <div className="flex items-center gap-1">
          <motion.button
            onClick={copyToClipboard}
            className="glass-button p-1 text-xs"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Copy className="w-3 h-3 text-white" />
          </motion.button>
          <motion.button
            onClick={() => setLines([])}
            className="glass-button p-1 text-xs"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-3 h-3 text-white" />
          </motion.button>
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="flex-1 p-4 overflow-auto text-sm leading-relaxed"
        style={{ fontSize: `${fontSize}px` }}
        onClick={handleInputFocus}
      >
        {lines.map((line) => (
          <motion.div
            key={line.id}
            className={`mb-1 ${
              line.type === 'command' ? 'text-green-400' :
              line.type === 'error' ? 'text-red-400' :
              'text-gray-300'
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.1 }}
          >
            <pre className="whitespace-pre-wrap font-mono">{line.content}</pre>
          </motion.div>
        ))}

        {/* Input Line */}
        <div className="flex items-center text-green-400">
          <span className="mr-2">{currentPath} $</span>
          <input
            ref={inputRef}
            value={currentInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-white font-mono"
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
        </div>

        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute bottom-16 left-4 text-gray-400 text-xs bg-black/50 p-2 rounded-md z-10">
            {suggestions.map((s) => (
              <div key={s} className="hover:bg-white/20 cursor-pointer px-1 py-0.5">
                {s}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="glass-topbar p-2 border-t border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4 text-gray-400">
          <span>Lines: {lines.length}</span>
          <span>History: {commandHistory.length}</span>
          <span>Path: {currentPath}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Terminal Ready</span>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}