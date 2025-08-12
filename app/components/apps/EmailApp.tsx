"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Mail,  Trash2, Star, StarOff, Reply, Forward, Archive, Search, Plus, Filter, RefreshCw, Paperclip, Bold, Italic, List, AlignLeft, AlignCenter, AlignRight, Underline, Link, Image, Smile, Save, Eye, Download, X, ChevronDown, ChevronUp, Settings, User, Clock, Tag, Folder, MoreHorizontal, Flag, AlertCircle, CheckCircle, Calendar, MapPin, Phone, Globe, Zap, Send, FileText, FileImage, FileSpreadsheet, Volume2, VolumeX, Maximize2, Minimize2, Users, Inbox, FileClock, AlertOctagon, CornerUpLeft, CornerUpRight
} from "lucide-react"

// Enhanced Interfaces
interface Email {
  id: string
  from: string
  fromName: string
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  body: string
  preview: string
  date: string
  timestamp: number
  read: boolean
  starred: boolean
  flagged: boolean
  important: boolean
  archived: boolean
  folder: 'inbox' | 'sent' | 'drafts' | 'trash' | 'archive' | 'spam'
  labels: string[]
  attachments: Attachment[]
  threadId?: string
  priority: 'low' | 'normal' | 'high'
  encrypted?: boolean
  scheduled?: boolean
  scheduledDate?: string
}

interface Attachment {
  id: string
  name: string
  size: number // in bytes
  type: string // MIME type
  url?: string
  thumbnail?: string
}

interface ComposeEmail {
  to: string
  cc: string
  bcc: string
  subject: string
  body: string
  attachments: Attachment[]
  priority: 'low' | 'normal' | 'high'
  scheduled: boolean
  scheduledDate: string
  signature: boolean
  readReceipt: boolean
  encryption: boolean
}

interface EmailAccount {
  id: string
  name: string
  email: string
  provider: 'gmail' | 'outlook' | 'icloud' | 'custom'
  unreadCount: number
  syncing: boolean
  avatar?: string
}

interface EmailFolder {
    id: 'inbox' | 'sent' | 'drafts' | 'trash' | 'archive' | 'spam';
    name: string;
    icon: React.ComponentType<any>;
}

type ViewMode = 'comfortable' | 'compact'
type SortBy = 'date' | 'sender' | 'subject' | 'size'
type SortOrder = 'asc' | 'desc'

const MOCK_ACCOUNTS: EmailAccount[] = [
    { id: 'acc1', name: 'Momin Aldahdouh', email: 'momin.aldahdouh@example.com', provider: 'gmail', unreadCount: 5, syncing: false, avatar: '/user-avatar.png' },
    { id: 'acc2', name: 'Work', email: 'm.aldahdouh@company.com', provider: 'outlook', unreadCount: 2, syncing: false },
]

const MOCK_EMAILS: Email[] = [
    // ... (Add more diverse mock emails here)
    {
      id: '1', from: 'no-reply@sierra.com', fromName: 'Sierra AI', to: ['momin.aldahdouh@example.com'], subject: "🚀 Welcome to Your New Email Experience!", body: "<h1>Hello!</h1><p>This is your new supercharged email app. Enjoy the advanced features!</p>", preview: "Hello! This is your new supercharged email app.", date: "3m ago", timestamp: Date.now() - 180000, read: false, starred: true, flagged: true, important: true, folder: 'inbox', labels: ['important', 'product'], attachments: [], priority: 'high',
      archived: false
    },
    {
      id: '2', from: 'team@project.com', fromName: 'Project Team', to: ['momin.aldahdouh@example.com'], subject: "Project Phoenix - Weekly Sync", body: "<p>Reminder: our weekly sync is at 3 PM today.</p>", preview: "Reminder: our weekly sync is at 3 PM today.", date: "2h ago", timestamp: Date.now() - 7200000, read: false, starred: false, flagged: false, important: true, folder: 'inbox', labels: ['work'], attachments: [{ id: 'att1', name: 'report.pdf', size: 1024 * 512, type: 'application/pdf' }], priority: 'normal',
      archived: false
    },
    {
      id: '3', from: 'newsletter@dev-digest.com', fromName: 'Dev Digest', to: ['momin.aldahdouh@example.com'], subject: "Your Weekly Dose of Dev News", body: "<p>Here's what's new in the world of development...</p>", preview: "Here's what's new in the world of development...", date: "1d ago", timestamp: Date.now() - 86400000, read: true, starred: false, flagged: false, important: false, folder: 'inbox', labels: ['newsletter'], attachments: [], priority: 'low',
      archived: false
    },
];

export default function EmailApp() {
  const [accounts, setAccounts] = useState<EmailAccount[]>(MOCK_ACCOUNTS)
  const [activeAccountId, setActiveAccountId] = useState<string>(MOCK_ACCOUNTS[0].id)
  const [emails, setEmails] = useState<Email[]>(MOCK_EMAILS)
  const [selectedFolder, setSelectedFolder] = useState<EmailFolder['id']>('inbox')
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null)
  const [showCompose, setShowCompose] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [composeEmail, setComposeEmail] = useState<Partial<ComposeEmail>>({})
  const [viewMode, setViewMode] = useState<ViewMode>('comfortable')
  const [sortBy, setSortBy] = useState<SortBy>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const editorRef = useRef<HTMLDivElement>(null);

  const FOLDERS: EmailFolder[] = [
    { id: 'inbox', name: 'Inbox', icon: Inbox },
    { id: 'sent', name: 'Sent', icon: Send },
    { id: 'drafts', name: 'Drafts', icon: FileClock },
    { id: 'archive', name: 'Archive', icon: Archive },
    { id: 'spam', name: 'Spam', icon: AlertOctagon },
    { id: 'trash', name: 'Trash', icon: Trash2 },
  ];

  const filteredAndSortedEmails = useMemo(() => {
    return emails
      .filter(e => e.folder === selectedFolder)
      .filter(email => 
        searchQuery === "" ||
        email.fromName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.preview.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
          // Implement sorting logic based on sortBy and sortOrder
          return sortOrder === 'asc' ? a.timestamp - b.timestamp : b.timestamp - a.timestamp;
      });
  }, [emails, selectedFolder, searchQuery, sortBy, sortOrder]);

  const selectedEmail = useMemo(() => {
    return emails.find(e => e.id === selectedEmailId) || null;
  }, [emails, selectedEmailId]);

  const handleSelectEmail = (id: string) => {
    setSelectedEmailId(id);
    // Mark as read
    setEmails(prev => prev.map(e => e.id === id ? { ...e, read: true } : e));
  }

  const handleAction = (action: 'star' | 'delete' | 'archive' | 'toggle_read', id: string) => {
    setEmails(prev => prev.map(e => {
        if (e.id === id) {
            switch(action) {
                case 'star': return {...e, starred: !e.starred};
                case 'delete': return {...e, folder: 'trash'};
                case 'archive': return {...e, folder: 'archive'};
                case 'toggle_read': return {...e, read: !e.read};
                default: return e;
            }
        }
        return e;
    }));
  }
  
  const handleCompose = (action: 'new' | 'reply' | 'forward', email?: Email) => {
      let newCompose: Partial<ComposeEmail> = { signature: true };
      if (email) {
        if (action === 'reply') {
            newCompose = { ...newCompose, to: email.from, subject: `Re: ${email.subject}` };
        } else if (action === 'forward') {
            newCompose = { ...newCompose, subject: `Fwd: ${email.subject}`, body: `<br/><hr/><blockquote>${email.body}</blockquote>` };
        }
      }
      setComposeEmail(newCompose);
      setShowCompose(true);
  }

  return (
    <div className="h-full bg-black/20 backdrop-blur-xl flex text-white font-sans">
      {/* Sidebar */}
      <div className="w-64 glass-card border-r border-white/10 flex flex-col">
          {/* Account switcher */}
          <div className="p-2 space-y-2">
            {accounts.map(acc => (
              <div key={acc.id} className={`p-2 rounded-lg cursor-pointer flex items-center gap-3 ${activeAccountId === acc.id ? 'bg-white/20' : ''}`} onClick={() => setActiveAccountId(acc.id)}>
                <User className="w-5 h-5" />
                <div className="flex-1">
                  <div className="font-semibold">{acc.name}</div>
                  <div className="text-xs text-gray-400">{acc.email}</div>
                </div>
                {acc.unreadCount > 0 && <div className="text-xs bg-purple-500 rounded-full px-2 py-0.5">{acc.unreadCount}</div>}
              </div>
            ))}
          </div>
          
          <div className="p-2 mt-4">
              <motion.button onClick={() => handleCompose('new')} className="glass-button w-full mb-4 flex items-center justify-center gap-2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Plus className="w-4 h-4" /> Compose
              </motion.button>
          </div>

          <div className="flex-1 p-2 space-y-1 overflow-y-auto">
            {FOLDERS.map(folder => (
                <motion.button key={folder.id} onClick={() => setSelectedFolder(folder.id)} className={`w-full text-left p-2 rounded-lg flex items-center gap-3 ${selectedFolder === folder.id ? 'bg-white/20' : 'text-gray-300 hover:bg-white/10'}`} whileHover={{ scale: 1.02 }}>
                    <folder.icon className="w-4 h-4" />
                    {folder.name}
                    {folder.id === 'inbox' && <span className="ml-auto text-xs">{accounts.find(a => a.id === activeAccountId)?.unreadCount}</span>}
                </motion.button>
            ))}
          </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Email List */}
        <div className="w-1/3 border-r border-white/10 flex flex-col">
            <div className="p-2 border-b border-white/10">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Search mail..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="glass-input w-full pl-10" />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {filteredAndSortedEmails.map(email => (
                    <motion.div key={email.id} onClick={() => handleSelectEmail(email.id)} className={`p-3 cursor-pointer border-b border-white/5 ${selectedEmailId === email.id ? 'bg-purple-500/30' : ''} ${!email.read ? 'bg-white/10' : 'hover:bg-white/5'}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="flex justify-between items-start">
                            <div className="font-semibold truncate">{email.fromName}</div>
                            <div className="text-xs text-gray-400 flex-shrink-0 ml-2">{email.date}</div>
                        </div>
                        <div className={`font-medium ${!email.read ? 'text-white' : 'text-gray-300'}`}>{email.subject}</div>
                        <div className="text-sm text-gray-400 truncate">{email.preview}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <motion.button onClick={(e) => {e.stopPropagation(); handleAction('star', email.id)}} whileTap={{scale: 0.9}}>
                            {email.starred ? <Star className="w-4 h-4 text-yellow-400 fill-current" /> : <StarOff className="w-4 h-4 text-gray-500"/>}
                          </motion.button>
                          {email.attachments.length > 0 && <Paperclip className="w-4 h-4 text-gray-400"/>}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>

        {/* Email Detail */}
        <div className="w-2/3 flex flex-col">
            {selectedEmail ? (
                <div className="flex-1 flex flex-col">
                    <div className="p-3 border-b border-white/10 flex items-center gap-4">
                        <h2 className="text-lg font-semibold truncate flex-1">{selectedEmail.subject}</h2>
                        <div className="flex items-center gap-2">
                            <motion.button onClick={() => handleCompose('reply', selectedEmail)} className="glass-button p-2"><CornerUpLeft className="w-4 h-4"/></motion.button>
                            <motion.button onClick={() => handleCompose('forward', selectedEmail)} className="glass-button p-2"><CornerUpRight className="w-4 h-4"/></motion.button>
                            <motion.button onClick={() => handleAction('archive', selectedEmail.id)} className="glass-button p-2"><Archive className="w-4 h-4"/></motion.button>
                            <motion.button onClick={() => handleAction('delete', selectedEmail.id)} className="glass-button p-2 text-red-400"><Trash2 className="w-4 h-4"/></motion.button>
                        </div>
                    </div>
                    <div className="p-4 flex items-center gap-4 border-b border-white/10">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold">{selectedEmail.fromName.charAt(0)}</div>
                        <div>
                            <div>{selectedEmail.fromName} <span className="text-gray-400 text-sm">&lt;{selectedEmail.from}&gt;</span></div>
                            <div className="text-gray-400 text-sm">To: {selectedEmail.to.join(', ')}</div>
                        </div>
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto" dangerouslySetInnerHTML={{ __html: selectedEmail.body }}></div>
                    {selectedEmail.attachments.length > 0 && (
                      <div className="p-4 border-t border-white/10">
                        <h3 className="font-semibold mb-2">Attachments ({selectedEmail.attachments.length})</h3>
                        <div className="flex gap-2">
                          {selectedEmail.attachments.map(att => (
                            <div key={att.id} className="glass-card p-2 rounded-lg flex items-center gap-2">
                              <FileText className="w-5 h-5"/>
                              <span>{att.name}</span>
                              <span className="text-xs text-gray-400">({(att.size / 1024).toFixed(1)} KB)</span>
                              <Download className="w-4 h-4 cursor-pointer hover:text-purple-400"/>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                    <Mail className="w-16 h-16 mb-4"/>
                    <div>Select an email to read</div>
                </div>
            )}
        </div>
      </div>
      
      {/* Compose Modal */}
      <AnimatePresence>
        {showCompose && (
          <motion.div className="absolute inset-0 bg-black/50 flex items-center justify-center" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <motion.div className="w-3/4 h-3/4 glass-card rounded-lg flex flex-col" initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}}>
                <div className="p-3 border-b border-white/10 flex justify-between items-center">
                    <h3 className="font-semibold">New Message</h3>
                    <motion.button onClick={() => setShowCompose(false)} whileTap={{scale: 0.9}}><X className="w-5 h-5"/></motion.button>
                </div>
                <div className="p-4 space-y-2">
                    <input type="text" placeholder="To" value={composeEmail.to || ''} onChange={e => setComposeEmail(p => ({...p, to: e.target.value}))} className="glass-input w-full"/>
                    <input type="text" placeholder="Subject" value={composeEmail.subject || ''} onChange={e => setComposeEmail(p => ({...p, subject: e.target.value}))} className="glass-input w-full"/>
                </div>
                <div className="flex-1 p-4">
                    <div ref={editorRef} contentEditable suppressContentEditableWarning className="w-full h-full text-white bg-transparent focus:outline-none" onInput={e => setComposeEmail(p => ({...p, body: e.currentTarget.innerHTML}))} dangerouslySetInnerHTML={{ __html: composeEmail.body || ''}}></div>
                </div>
                <div className="p-2 border-t border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {/* Add rich text editor controls here */}
                    </div>
                    <motion.button onClick={() => setShowCompose(false)} className="glass-button px-6 py-2 flex items-center gap-2" whileHover={{scale: 1.05}}>
                        <Send className="w-4 h-4"/>
                        Send
                    </motion.button>
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
