"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { 
  Terminal, 
  X, 
  Copy
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
  execute: (args: string[]) => string | Promise<string> | void
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
  const [fontSize] = useState(14)
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
      execute: () => {
        const commandsList = Object.entries(commands).map(([name, cmd]) => `${name.padEnd(15)} - ${cmd.description}`).join('\n');
        return `Available commands:\n${commandsList}`;
      }
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
    pwd: {
      command: "pwd",
      description: "Print working directory",
      execute: () => `/home/user${currentPath === '~' ? '' : currentPath}`
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
        return items.map((item: {name: string, type: 'file' | 'directory'}) => `${item.name}${item.type === 'directory' ? '/' : ''}`).join("\n");
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
> process.exit()
`
    },
    neofetch: {
      command: "neofetch",
      description: "System information tool",
      execute: () => {
        const memInfo = (performance as any).memory;
        const uptimeMinutes = Math.floor(Date.now() / 1000 / 60);
        const screenRes = `${screen.width}x${screen.height}`;
        const cpuCores = navigator.hardwareConcurrency || 'Unknown';
        const memoryInfo = memInfo ? Math.round(memInfo.usedJSHeapSize / 1024 / 1024) + 'MB / ' + Math.round(memInfo.totalJSHeapSize / 1024 / 1024) + 'MB' : 'Unknown';
        
        const info = [
          "                   -`                     user@mominos",
          "                  .o+`                    -------------",
          "                 `ooo/                     OS: MominOS v5.0.0",
          "                `+oooo:                    Host: Web Browser Desktop",
          "               `+oooooo:                   Kernel: Browser Engine",
          "               -+oooooo+:                  Uptime: " + uptimeMinutes + " minutes",
          "             `/:-:++oooo+:                 Shell: /bin/mominsh",
          "            `/++++/+++++++:                Resolution: " + screenRes,
          "           `/++++++++++++++:               CPU: " + cpuCores + " cores",
          "          `/+++ooooooooo++++/              Memory: " + memoryInfo,
          "         ./ooosssso++osssssso+`             GPU: WebGL Available",
          "        .oossssso-````/ossssss+`            Storage: LocalStorage",
          "       -osssssso.      :ssssssso.           Terminal: MominOS Terminal v1.0.0",
          "      :osssssss/        osssso+++.",
          "     /ossssssss/        +ssssooo/-",
          "   `/ossssso+/:-        -:/+osssso+-",
          "  `+sso+:-`                 `.-/+oso:",
          " `++:.                           `-/+/",
          " .`                                 `/"
        ].join('\n');
        return info;
      }
    },
    htop: {
      command: "htop",
      description: "Interactive process viewer",
      execute: () => {
        const mem = (performance as any).memory;
        const hours = Math.floor(Date.now() / 1000 / 3600);
        const minutes = String(Math.floor(Date.now() / 1000 / 60) % 60).padStart(2, '0');
        const seconds = String(Math.floor(Date.now() / 1000) % 60).padStart(2, '0');
        const memUsage = mem ? Math.round(mem.usedJSHeapSize / 1024 / 1024) : 12;
        const memPercent = mem ? Math.round(mem.usedJSHeapSize / 1024 / 1024 / 1024 * 100).toFixed(1) : '0.3';
        
        return `  CPU[||||||||||||||||||||            68.2%]     Tasks: 42, 156 thr; 2 running
  Mem[|||||||||||||||||||||||||||     85.6%]     Load average: 0.68 0.44 0.32
  Swp[                               0.0%]      Uptime: 0${hours}:${minutes}:${seconds}

  PID USER      PRI  NI  VIRT   RES   SHR S CPU% MEM%   TIME+  Command
  1   root       20   0  169m  13m   8m S  0.0  0.4  0:01.67 systemd
  123 user       20   0  234m  45m  12m R  12.3 1.2  0:15.23 mominos-desktop
  456 user       20   0  145m  32m   8m S  3.4  0.8  0:08.45 terminal-app
  789 user       20   0   89m  16m   4m S  1.2  0.4  0:02.12 browser-app
  1011 user       20   0   67m  ${memUsage}m   3m S  0.8  ${memPercent}  0:01.34 code-editor

F1Help F2Setup F3Search F4Filter F5Tree F6SortBy F7Nice- F8Nice+ F9Kill F10Quit`;
      }
    },
    df: {
      command: "df",
      description: "Display filesystem disk space usage",
      execute: () => {
        return `Filesystem      Size  Used Avail Use% Mounted on
/dev/browser     5.0G  2.1G  2.7G  44% /
tmpfs           512M   84M  428M  17% /tmp
localStorage     10M  1.2M  8.8M  12% /storage
sessionStorage   10M  456K 9.5M   5% /session
indexedDB       50M   12M  38M  24% /database`;
      }
    },
    free: {
      command: "free",
      description: "Display amount of free and used memory",
      execute: () => {
        const mem = (performance as any).memory
        if (mem) {
          const total = Math.round(mem.totalJSHeapSize / 1024);
          const used = Math.round(mem.usedJSHeapSize / 1024);
          const free = total - used;
          return `              total        used        free      shared  buff/cache   available
Mem:        ${total.toString().padStart(8)} KB ${used.toString().padStart(8)} KB ${free.toString().padStart(8)} KB        0 KB        0 KB ${free.toString().padStart(8)} KB
Swap:              0           0           0`;
        }
        return `Memory information not available in this browser`;
      }
    },
    lscpu: {
      command: "lscpu",
      description: "Display information about the CPU architecture",
      execute: () => {
        return `Architecture:        x86_64
CPU op-mode(s):      32-bit, 64-bit
Byte Order:          Little Endian
CPU(s):              ${navigator.hardwareConcurrency || 'Unknown'}
Thread(s) per core:  2
Core(s) per socket:  ${Math.ceil((navigator.hardwareConcurrency || 4) / 2)}
Socket(s):           1
Vendor ID:           BrowserEngine
CPU family:          6
Model:               142
Model name:          Browser JavaScript Engine
Stepping:            10
CPU MHz:             2400.000
CPU max MHz:         3400.0000
CPU min MHz:         400.0000
BogoMIPS:            4800.00
Virtualization:      WebAssembly
L1d cache:           32K
L1i cache:           32K
L2 cache:            256K
L3 cache:            8192K`
      }
    },
    lsblk: {
      command: "lsblk",
      description: "List block devices",
      execute: () => {
        return `NAME   MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
browser  8:0    0   5.0G  0 disk /
├─browser1 8:1  0   4.5G  0 part /
└─browser2 8:2  0   500M  0 part [SWAP]
storage  8:16   0    10M  0 disk /storage
session  8:32   0    10M  0 disk /session
db       8:48   0    50M  0 disk /database`
      }
    },
    lsof: {
      command: "lsof",
      description: "List open files",
      execute: () => {
        return `COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF    NODE NAME
systemd     1 root  cwd    DIR    8,1      512       2 /
systemd     1 root  txt    REG    8,1   167704  131101 /lib/systemd/systemd
mominos   123 user  cwd    DIR    8,1      512    2000 /home/user
mominos   123 user    0u   CHR    1,3      0t0    1029 /dev/null
mominos   123 user    1w   REG    8,1        0    1234 /var/log/mominos.log
node      456 user    0r   REG    8,1   123456    5678 /app/package.json
node      456 user    1w   REG    8,1        0    9101 /tmp/output.log`
      }
    },
    netstat: {
      command: "netstat",
      description: "Display network connections",
      execute: () => {
        return `Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN
tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN
tcp        0      0 127.0.0.1:3000          0.0.0.0:*               LISTEN
tcp6       0      0 :::80                   :::*                    LISTEN
tcp6       0      0 :::443                  :::*                    LISTEN
websocket  0      0 ws://localhost:8080     *:*                     CONNECTED`
      }
    },
    systemctl: {
      command: "systemctl",
      description: "Control systemd services",
      execute: (args: string[]) => {
        if (args[0] === 'status') {
          const service = args[1] || 'mominos'
          return `● ${service}.service - MominOS ${service} Service
   Loaded: loaded (/etc/systemd/system/${service}.service; enabled; vendor preset: enabled)
   Active: active (running) since ${new Date().toDateString()}; 1h 23min ago
     Docs: https://mominos.dev/docs
 Main PID: 123 (${service})
    Tasks: 8 (limit: 4096)
   Memory: 45.2M
   CGroup: /system.slice/${service}.service
           └─123 /usr/bin/${service} --daemon`
        }
        return `Usage: systemctl [OPTIONS...] COMMAND [NAME...]
Commands: list-units, status, start, stop, restart, enable, disable`
      }
    },
    which: {
      command: "which",
      description: "Locate a command",
      execute: (args: string[]) => {
        const cmd = args[0]
        if (!cmd) return "which: missing argument"
        if (commands[cmd]) {
          return `/usr/bin/${cmd}`
        }
        return `which: no ${cmd} in (/usr/local/bin:/usr/bin:/bin)`
      }
    },
    find: {
      command: "find",
      description: "Search for files and directories",
      execute: async (args: string[]) => {
        const searchTerm = args[args.length - 1] || ''
        const items = await storage.listDirectory(currentPath, '.')
        if (items === null) return "find: cannot access current directory"
        
        const results = items
          .filter(item => item.name.includes(searchTerm))
          .map(item => `./${item.name}`)
          .join('\n')
        
        return results || "No files found"
      }
    },
    grep: {
      command: "grep",
      description: "Search text patterns in files",
      execute: async (args: string[]) => {
        if (args.length < 2) return "grep: missing arguments\nUsage: grep PATTERN FILE"
        
        const pattern = args[0]
        const filename = args[1]
        const content = await storage.readFile(currentPath, filename)
        
        if (content === null) return `grep: ${filename}: No such file or directory`
        
        const lines = content.split('\n')
        const matches = lines
          .map((line, index) => ({ line: line, number: index + 1 }))
          .filter(item => item.line.toLowerCase().includes(pattern.toLowerCase()))
          .map(item => `${item.number}:${item.line}`)
          .join('\n')
        
        return matches || "No matches found"
      }
    },
    wc: {
      command: "wc",
      description: "Word, line, character, and byte count",
      execute: async (args: string[]) => {
        if (!args[0]) return "wc: missing file operand"
        
        const content = await storage.readFile(currentPath, args[0])
        if (content === null) return `wc: ${args[0]}: No such file or directory`
        
        const lines = content.split('\n').length
        const words = content.split(/\s+/).filter(word => word.length > 0).length
        const chars = content.length
        
        return `${lines.toString().padStart(8)} ${words.toString().padStart(7)} ${chars.toString().padStart(7)} ${args[0]}`
      }
    },
    tail: {
      command: "tail",
      description: "Output the last part of files",
      execute: async (args: string[]) => {
        if (!args[0]) return "tail: missing file operand"
        
        const content = await storage.readFile(currentPath, args[0])
        if (content === null) return `tail: cannot open '${args[0]}' for reading: No such file or directory`
        
        const lines = content.split('\n')
        const numLines = args.includes('-n') ? parseInt(args[args.indexOf('-n') + 1]) || 10 : 10
        
        return lines.slice(-numLines).join('\n')
      }
    },
    head: {
      command: "head",
      description: "Output the first part of files",
      execute: async (args: string[]) => {
        if (!args[0]) return "head: missing file operand"
        
        const content = await storage.readFile(currentPath, args[0])
        if (content === null) return `head: cannot open '${args[0]}' for reading: No such file or directory`
        
        const lines = content.split('\n')
        const numLines = args.includes('-n') ? parseInt(args[args.indexOf('-n') + 1]) || 10 : 10
        
        return lines.slice(0, numLines).join('\n')
      }
    },
    sort: {
      command: "sort",
      description: "Sort lines of text files",
      execute: async (args: string[]) => {
        if (!args[0]) return "sort: missing file operand"
        
        const content = await storage.readFile(currentPath, args[0])
        if (content === null) return `sort: cannot read: ${args[0]}: No such file or directory`
        
        const lines = content.split('\n')
        const sorted = args.includes('-r') ? lines.sort().reverse() : lines.sort()
        
        return sorted.join('\n')
      }
    },
    uniq: {
      command: "uniq",
      description: "Report or omit repeated lines",
      execute: async (args: string[]) => {
        if (!args[0]) return "uniq: missing file operand"
        
        const content = await storage.readFile(currentPath, args[0])
        if (content === null) return `uniq: ${args[0]}: No such file or directory`
        
        const lines = content.split('\n')
        const unique = [...new Set(lines)]
        
        return unique.join('\n')
      }
    },
    awk: {
      command: "awk",
      description: "Pattern scanning and processing language",
      execute: async (args: string[]) => {
        if (args.length < 2) return "awk: not enough arguments"
        
        const pattern = args[0]
        const filename = args[1]
        const content = await storage.readFile(currentPath, filename)
        
        if (content === null) return `awk: ${filename}: No such file or directory`
        
        // Simple awk simulation - print specific columns
        if (pattern.includes('$')) {
          const colMatch = pattern.match(/\$(\d+)/)
          if (colMatch) {
            const colNum = parseInt(colMatch[1]) - 1
            const lines = content.split('\n')
            const result = lines.map(line => {
              const cols = line.split(/\s+/)
              return cols[colNum] || ''
            }).join('\n')
            return result
          }
        }
        
        return "awk: simplified implementation - use patterns like '{print $1}'"
      }
    },
    sed: {
      command: "sed",
      description: "Stream editor for filtering and transforming text",
      execute: async (args: string[]) => {
        if (args.length < 2) return "sed: not enough arguments\nUsage: sed 's/old/new/g' file"
        
        const expr = args[0]
        const filename = args[1]
        const content = await storage.readFile(currentPath, filename)
        
        if (content === null) return `sed: can't read ${filename}: No such file or directory`
        
        // Simple sed simulation for substitute command
        const match = expr.match(/s\/(.+?)\/(.+?)\/g?/)
        if (match) {
          const [, oldText, newText] = match
          const result = content.replace(new RegExp(oldText, 'g'), newText)
          return result
        }
        
        return "sed: simplified implementation - use 's/old/new/g' format"
      }
    },
    tar: {
      command: "tar",
      description: "Archive files",
      execute: (args: string[]) => {
        if (args.includes('-czf')) {
          const archiveName = args[args.indexOf('-czf') + 1]
          const files = args.slice(args.indexOf('-czf') + 2)
          return `tar: created archive '${archiveName}' containing ${files.length} files`
        } else if (args.includes('-xzf')) {
          const archiveName = args[args.indexOf('-xzf') + 1]
          return `tar: extracted '${archiveName}'`
        } else {
          return `tar: You must specify one of the '-Acdtrux', '--delete' or '--test-label' options`
        }
      }
    },
    zip: {
      command: "zip",
      description: "Create zip archives",
      execute: (args: string[]) => {
        if (args.length < 2) return "zip: missing arguments"
        const archive = args[0]
        const files = args.slice(1)
        return `  adding: ${files.join('\n  adding: ')}\nzip: created ${archive} (${files.length} files)`
      }
    },
    chmod: {
      command: "chmod",
      description: "Change file permissions",
      execute: (args: string[]) => {
        if (args.length < 2) return "chmod: missing operand"
        const mode = args[0]
        const files = args.slice(1)
        return `chmod: permissions changed for ${files.join(', ')}`
      }
    },
    chown: {
      command: "chown",
      description: "Change file ownership",
      execute: (args: string[]) => {
        if (args.length < 2) return "chown: missing operand"
        const owner = args[0]
        const files = args.slice(1)
        return `chown: ownership changed to ${owner} for ${files.join(', ')}`
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
        output = result || '';
        if (typeof result === 'string' && (result.includes("error") || result.includes("missing") || result.includes("No such file or directory"))) {
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