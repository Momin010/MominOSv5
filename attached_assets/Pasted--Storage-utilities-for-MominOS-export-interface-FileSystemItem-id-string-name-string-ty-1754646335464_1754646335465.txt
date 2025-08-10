
// Storage utilities for MominOS
export interface FileSystemItem {
  id: string
  name: string
  type: 'file' | 'folder'
  size?: number
  modified: Date
  content?: string
  parent?: string
  children?: string[]
}

export interface EmailData {
  id: string
  from: string
  to: string
  subject: string
  body: string
  date: Date
  read: boolean
  starred: boolean
  attachments?: string[]
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: Date
  end: Date
  location?: string
  attendees?: string[]
  reminder?: number
}

export interface MusicTrack {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  url: string
  cover?: string
}

// Storage manager class
export class StorageManager {
  private static instance: StorageManager
  
  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager()
    }
    return StorageManager.instance
  }

  // File system operations
  saveFileSystem(files: FileSystemItem[]): void {
    localStorage.setItem('mominOS_filesystem', JSON.stringify(files))
  }

  loadFileSystem(): FileSystemItem[] {
    const stored = localStorage.getItem('mominOS_filesystem')
    if (stored) {
      return JSON.parse(stored)
    }
    return this.getDefaultFileSystem()
  }

  private getDefaultFileSystem(): FileSystemItem[] {
    return [
      {
        id: '1',
        name: 'Documents',
        type: 'folder',
        modified: new Date(),
        children: ['2', '3']
      },
      {
        id: '2',
        name: 'Welcome.txt',
        type: 'file',
        size: 1024,
        modified: new Date(),
        parent: '1',
        content: 'Welcome to MominOS! This is a sample document.'
      },
      {
        id: '3',
        name: 'Projects',
        type: 'folder',
        modified: new Date(),
        parent: '1',
        children: []
      }
    ]
  }

  // Email operations
  saveEmails(emails: EmailData[]): void {
    localStorage.setItem('mominOS_emails', JSON.stringify(emails))
  }

  loadEmails(): EmailData[] {
    const stored = localStorage.getItem('mominOS_emails')
    if (stored) {
      return JSON.parse(stored).map((email: any) => ({
        ...email,
        date: new Date(email.date)
      }))
    }
    return this.getDefaultEmails()
  }

  private getDefaultEmails(): EmailData[] {
    return [
      {
        id: '1',
        from: 'welcome@mominos.com',
        to: 'user@mominos.com',
        subject: 'Welcome to MominOS!',
        body: 'Thank you for using MominOS. Explore the features and enjoy your experience!',
        date: new Date(),
        read: false,
        starred: false
      },
      {
        id: '2',
        from: 'updates@mominos.com',
        to: 'user@mominos.com',
        subject: 'System Update Available',
        body: 'A new system update is available with performance improvements and new features.',
        date: new Date(Date.now() - 86400000),
        read: true,
        starred: true
      }
    ]
  }

  // Calendar operations
  saveEvents(events: CalendarEvent[]): void {
    localStorage.setItem('mominOS_calendar', JSON.stringify(events))
  }

  loadEvents(): CalendarEvent[] {
    const stored = localStorage.getItem('mominOS_calendar')
    if (stored) {
      return JSON.parse(stored).map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end)
      }))
    }
    return this.getDefaultEvents()
  }

  private getDefaultEvents(): CalendarEvent[] {
    const today = new Date()
    return [
      {
        id: '1',
        title: 'Welcome Meeting',
        description: 'Introduction to MominOS features',
        start: new Date(today.getTime() + 3600000),
        end: new Date(today.getTime() + 7200000),
        location: 'Virtual'
      }
    ]
  }

  // Music operations
  saveMusicLibrary(tracks: MusicTrack[]): void {
    localStorage.setItem('mominOS_music', JSON.stringify(tracks))
  }

  loadMusicLibrary(): MusicTrack[] {
    const stored = localStorage.getItem('mominOS_music')
    if (stored) {
      return JSON.parse(stored)
    }
    return this.getDefaultMusicLibrary()
  }

  private getDefaultMusicLibrary(): MusicTrack[] {
    return [
      {
        id: '1',
        title: 'Sample Track 1',
        artist: 'MominOS Artist',
        album: 'Default Collection',
        duration: 180,
        url: '/audio/sample1.mp3',
        cover: '/images/album1.jpg'
      },
      {
        id: '2',
        title: 'Sample Track 2',
        artist: 'MominOS Artist',
        album: 'Default Collection',
        duration: 210,
        url: '/audio/sample2.mp3',
        cover: '/images/album2.jpg'
      }
    ]
  }

  // Settings operations
  saveSettings(settings: any): void {
    localStorage.setItem('mominOS_settings', JSON.stringify(settings))
  }

  loadSettings(): any {
    const stored = localStorage.getItem('mominOS_settings')
    if (stored) {
      return JSON.parse(stored)
    }
    return {
      theme: 'dark',
      accentColor: 'purple',
      notifications: true,
      autoSave: true,
      language: 'en'
    }
  }
}
