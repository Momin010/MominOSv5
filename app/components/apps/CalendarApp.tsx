"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin,
  Users,
  Bell,
  Edit,
  Trash2,
  Search,
  Filter,
  Grid,
  List,
  User,
  CheckCircle,
  X,
  AlertCircle,
  Repeat,
  ArrowRight,
  Globe,
  Video,
  BookOpen,
  CheckSquare,
  Tag,
  PanelLeft,
  Menu,
  Sun,
  Moon,
  Cloud,
  Check,
  Link,
  Copy,
  ExternalLink,
  Zap,
  FileText,
  MoreHorizontal,
  Eye,
  EyeOff,
  Star,
  Calendar as CalendarBoxIcon,
  LayoutGrid,
  LayoutList,
  Layers,
  UserPlus,
  Settings,
  ChevronDown,
  FileEdit,
  Save,
  MoreVertical,
  Bookmark,
  PenTool,
  AlarmClock,
  Compass,
  Building,
  Home,
  Car,
  Paperclip,
  Wifi,
  RefreshCw,
  Archive,
  Flag,
  Share2,
  CalendarClock,
  CalendarDays,
  CalendarCheck,
  CalendarX,
  CalendarPlus,
  CalendarRange,
  HelpCircle,
  CircleDollarSign
} from "lucide-react"

// Calendar view types
type ViewMode = 'month' | 'week' | 'day' | 'agenda' | 'year'

// Calendar theme options
type ThemeMode = 'light' | 'dark' | 'system' | 'custom'

// Time units for recurrence
type RecurrenceUnit = 'day' | 'week' | 'month' | 'year'

// Reminder timing options
type ReminderTime = '0' | '5' | '10' | '15' | '30' | '60' | '120' | '1440'

// Event priority levels
type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent'

// User availability status
type AvailabilityStatus = 'free' | 'busy' | 'tentative' | 'out-of-office'

// Event status
type EventStatus = 'confirmed' | 'tentative' | 'cancelled'

// Attendee role
type AttendeeRole = 'organizer' | 'required' | 'optional'

// Attendee interface
interface Attendee {
  id: string
  email: string
  name: string
  role: AttendeeRole
  status: 'accepted' | 'declined' | 'tentative' | 'pending'
  avatar?: string
}

// Reminder interface
interface Reminder {
  id: string
  time: ReminderTime // minutes before event
  type: 'notification' | 'email' | 'both'
  message?: string
}

// Recurrence pattern
interface RecurrencePattern {
  frequency: RecurrenceUnit
  interval: number // Every X days/weeks/months/years
  endDate?: string
  endAfterOccurrences?: number
  weekdays?: number[] // 0-6 for Sunday-Saturday
  monthDay?: number // Day of month
  exceptions?: string[] // Dates to exclude
}

// Attachment interface
interface Attachment {
  id: string
  name: string
  type: string
  url: string
  size?: number
}

// Location types
type LocationType = 'physical' | 'virtual' | 'phone' | 'hybrid'

// Location interface
interface Location {
  type: LocationType
  name: string
  address?: string
  coordinates?: { lat: number; lng: number }
  meetingUrl?: string
  phoneNumber?: string
  roomId?: string
}

// Enhanced Event interface
interface Event {
  id: string
  title: string
  description: string
  start: string // ISO date string
  end: string // ISO date string
  allDay: boolean
  timezone?: string
  location?: Location
  color: string
  backgroundColor?: string
  textColor?: string
  borderColor?: string
  isRecurring: boolean
  recurrencePattern?: RecurrencePattern
  reminders: Reminder[]
  attendees: Attendee[]
  creator: string
  createdAt: string
  updatedAt: string
  status: EventStatus
  visibility: 'public' | 'private' | 'confidential'
  priority: PriorityLevel
  attachments?: Attachment[]
  categories: string[]
  notes?: string
  availabilityStatus: AvailabilityStatus
  externalId?: string // For syncing with external calendars
  url?: string
  isEditable: boolean
  parentEventId?: string // For recurring event exceptions
  duration?: number // Duration in minutes
}

// Utility functions for calendar operations
const generateId = () => Math.random().toString(36).substr(2, 9)

const getColorOptions = () => [
  { value: '#3b82f6', label: 'Blue', bg: 'bg-blue-500', text: 'text-blue-500' },
  { value: '#10b981', label: 'Green', bg: 'bg-green-500', text: 'text-green-500' },
  { value: '#f59e0b', label: 'Yellow', bg: 'bg-yellow-500', text: 'text-yellow-500' },
  { value: '#ef4444', label: 'Red', bg: 'bg-red-500', text: 'text-red-500' },
  { value: '#8b5cf6', label: 'Purple', bg: 'bg-purple-500', text: 'text-purple-500' },
  { value: '#06b6d4', label: 'Cyan', bg: 'bg-cyan-500', text: 'text-cyan-500' },
  { value: '#f97316', label: 'Orange', bg: 'bg-orange-500', text: 'text-orange-500' },
  { value: '#ec4899', label: 'Pink', bg: 'bg-pink-500', text: 'text-pink-500' },
]

const getCurrentUser = () => ({
  id: 'user-1',
  email: 'user@example.com',
  name: 'Current User'
})

export default function CalendarApp() {
  // Core state
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [events, setEvents] = useState<Event[]>(() => {
    // Load events from localStorage or use sample data
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('calendar-events')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          // Fall through to sample data
        }
      }
    }
    // Sample events with proper typing
    return [
      {
        id: '1',
        title: 'Team Standup',
        description: 'Daily standup meeting with the development team',
        start: '2024-01-15T10:00:00',
        end: '2024-01-15T10:30:00',
        allDay: false,
        timezone: 'America/New_York',
        location: {
          type: 'virtual' as LocationType,
          name: 'Zoom Meeting',
          meetingUrl: 'https://zoom.us/meeting/123'
        },
        color: '#3b82f6',
        backgroundColor: '#3b82f6',
        textColor: '#ffffff',
        isRecurring: true,
        recurrencePattern: {
          frequency: 'day' as RecurrenceUnit,
          interval: 1,
          weekdays: [1, 2, 3, 4, 5], // Mon-Fri
          endDate: '2024-12-31'
        },
        reminders: [
          { id: 'r1', time: '10' as ReminderTime, type: 'notification' }
        ],
        attendees: [
          {
            id: 'att1',
            email: 'john@company.com',
            name: 'John Smith',
            role: 'required' as AttendeeRole,
            status: 'accepted'
          },
          {
            id: 'att2',
            email: 'sarah@company.com',
            name: 'Sarah Jones',
            role: 'required' as AttendeeRole,
            status: 'tentative'
          }
        ],
        creator: 'user-1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        status: 'confirmed' as EventStatus,
        visibility: 'public',
        priority: 'medium' as PriorityLevel,
        categories: ['work', 'meetings'],
        availabilityStatus: 'busy' as AvailabilityStatus,
        isEditable: true,
        duration: 30
      },
      {
        id: '2',
        title: 'Client Presentation',
        description: 'Quarterly business review with key stakeholders',
        start: '2024-01-16T14:00:00',
        end: '2024-01-16T16:00:00',
        allDay: false,
        timezone: 'America/New_York',
        location: {
          type: 'physical' as LocationType,
          name: 'Conference Room A',
          address: '123 Business Ave, Suite 400'
        },
        color: '#10b981',
        backgroundColor: '#10b981',
        textColor: '#ffffff',
        isRecurring: false,
        reminders: [
          { id: 'r2', time: '30' as ReminderTime, type: 'both' },
          { id: 'r3', time: '1440' as ReminderTime, type: 'email' }
        ],
        attendees: [
          {
            id: 'att3',
            email: 'client@bigcorp.com',
            name: 'Alex Client',
            role: 'required' as AttendeeRole,
            status: 'accepted'
          },
          {
            id: 'att4',
            email: 'manager@company.com',
            name: 'Team Manager',
            role: 'organizer' as AttendeeRole,
            status: 'accepted'
          }
        ],
        creator: 'user-1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        status: 'confirmed' as EventStatus,
        visibility: 'public',
        priority: 'high' as PriorityLevel,
        categories: ['work', 'presentations', 'client'],
        availabilityStatus: 'busy' as AvailabilityStatus,
        isEditable: true,
        duration: 120
      },
      {
        id: '3',
        title: 'Project Launch',
        description: 'Official launch of the new product line',
        start: '2024-01-20T00:00:00',
        end: '2024-01-20T23:59:59',
        allDay: true,
        location: {
          type: 'hybrid' as LocationType,
          name: 'Main Office + Virtual',
          address: '123 Business Ave',
          meetingUrl: 'https://teams.microsoft.com/meeting/456'
        },
        color: '#ef4444',
        backgroundColor: '#ef4444',
        textColor: '#ffffff',
        isRecurring: false,
        reminders: [
          { id: 'r4', time: '1440' as ReminderTime, type: 'both' }
        ],
        attendees: [
          {
            id: 'att5',
            email: 'team@company.com',
            name: 'All Team',
            role: 'required' as AttendeeRole,
            status: 'pending'
          }
        ],
        creator: 'user-1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        status: 'confirmed' as EventStatus,
        visibility: 'public',
        priority: 'urgent' as PriorityLevel,
        categories: ['work', 'milestones'],
        availabilityStatus: 'busy' as AvailabilityStatus,
        isEditable: true
      },
      {
        id: '4',
        title: 'Lunch with Sarah',
        description: 'Casual lunch meeting to discuss career growth',
        start: '2024-01-18T12:00:00',
        end: '2024-01-18T13:00:00',
        allDay: false,
        location: {
          type: 'physical' as LocationType,
          name: 'Downtown Bistro',
          address: '456 Main Street, Downtown'
        },
        color: '#8b5cf6',
        backgroundColor: '#8b5cf6',
        textColor: '#ffffff',
        isRecurring: false,
        reminders: [
          { id: 'r5', time: '15' as ReminderTime, type: 'notification' }
        ],
        attendees: [
          {
            id: 'att6',
            email: 'sarah@company.com',
            name: 'Sarah Jones',
            role: 'required' as AttendeeRole,
            status: 'accepted'
          }
        ],
        creator: 'user-1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        status: 'confirmed' as EventStatus,
        visibility: 'private',
        priority: 'low' as PriorityLevel,
        categories: ['personal', 'networking'],
        availabilityStatus: 'busy' as AvailabilityStatus,
        isEditable: true,
        duration: 60
      }
    ]
  })
  
  // UI state
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategories, setFilterCategories] = useState<string[]>([])
  const [showSidebar, setShowSidebar] = useState(true)
  const [showMiniCalendar, setShowMiniCalendar] = useState(true)
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>(['personal', 'work'])
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark')
  
  // Event form state
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    start: '',
    end: '',
    allDay: false,
    location: { type: 'physical' as LocationType, name: '' },
    color: '#3b82f6',
    reminders: [] as Reminder[],
    attendees: [] as Attendee[],
    categories: [] as string[],
    priority: 'medium' as PriorityLevel,
    visibility: 'public' as 'public' | 'private' | 'confidential',
    isRecurring: false,
    recurrencePattern: undefined as RecurrencePattern | undefined
  })

  // Save events to localStorage whenever events change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('calendar-events', JSON.stringify(events))
    }
  }, [events])

  // Event CRUD operations
  const createEvent = useCallback((eventData: Partial<Event>) => {
    const newEvent: Event = {
      id: generateId(),
      title: eventData.title || 'Untitled Event',
      description: eventData.description || '',
      start: eventData.start || new Date().toISOString(),
      end: eventData.end || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      allDay: eventData.allDay || false,
      timezone: eventData.timezone || 'America/New_York',
      location: eventData.location,
      color: eventData.color || '#3b82f6',
      backgroundColor: eventData.backgroundColor || eventData.color || '#3b82f6',
      textColor: eventData.textColor || '#ffffff',
      isRecurring: eventData.isRecurring || false,
      recurrencePattern: eventData.recurrencePattern,
      reminders: eventData.reminders || [],
      attendees: eventData.attendees || [],
      creator: getCurrentUser().id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: eventData.status || 'confirmed',
      visibility: eventData.visibility || 'public',
      priority: eventData.priority || 'medium',
      attachments: eventData.attachments || [],
      categories: eventData.categories || [],
      notes: eventData.notes,
      availabilityStatus: eventData.availabilityStatus || 'busy',
      isEditable: true,
      duration: eventData.duration
    }
    setEvents(prev => [...prev, newEvent])
    return newEvent
  }, [])

  const updateEvent = useCallback((eventId: string, updates: Partial<Event>) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, ...updates, updatedAt: new Date().toISOString() }
        : event
    ))
  }, [])

  const deleteEvent = useCallback((eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId))
  }, [])

  const duplicateEvent = useCallback((eventId: string) => {
    const event = events.find(e => e.id === eventId)
    if (event) {
      const duplicated = {
        ...event,
        id: generateId(),
        title: `${event.title} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setEvents(prev => [...prev, duplicated])
    }
  }, [events])

  // Advanced filtering and search
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = searchQuery === '' ||
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.attendees.some(att => 
          att.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          att.email.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        event.categories.some(cat => 
          cat.toLowerCase().includes(searchQuery.toLowerCase())
        )

      const matchesCategories = filterCategories.length === 0 ||
        event.categories.some(cat => filterCategories.includes(cat))

      return matchesSearch && matchesCategories
    })
  }, [events, searchQuery, filterCategories])

  // Calendar utilities
  const getDaysInMonth = useMemo(() => {
    return (date: Date) => {
      const year = date.getFullYear()
      const month = date.getMonth()
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const daysInMonth = lastDay.getDate()
      const startingDay = firstDay.getDay()
      
      const days = []
      for (let i = 0; i < startingDay; i++) {
        days.push(null)
      }
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i))
      }
      return days
    }
  }, [])

  const getEventsForDate = useCallback((date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.start)
      const eventDateString = eventDate.toISOString().split('T')[0]
      return eventDateString === dateString
    })
  }, [filteredEvents])

  const formatEventTime = useCallback((event: Event) => {
    if (event.allDay) {
      return 'All day'
    }
    const start = new Date(event.start)
    const end = new Date(event.end)
    return `${start.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })} - ${end.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })}`
  }, [])

  const getColorForEvent = useCallback((event: Event) => {
    const colorMap: { [key: string]: string } = {
      '#3b82f6': 'bg-blue-500',
      '#10b981': 'bg-green-500',
      '#f59e0b': 'bg-yellow-500',
      '#ef4444': 'bg-red-500',
      '#8b5cf6': 'bg-purple-500',
      '#06b6d4': 'bg-cyan-500',
      '#f97316': 'bg-orange-500',
      '#ec4899': 'bg-pink-500'
    }
    return colorMap[event.color] || 'bg-blue-500'
  }, [])

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setShowEventModal(true)
  }

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setShowEventModal(true)
  }

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const formatTime = (time: string) => {
    return time
  }

  return (
    <div className="h-full bg-black/20 backdrop-blur-xl flex flex-col">
      {/* Header */}
      <div className="glass-topbar p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-white font-semibold">Calendar</h2>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={handlePreviousMonth}
                className="glass-button p-2"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </motion.button>
              <span className="text-white font-medium">{formatDate(currentDate)}</span>
              <motion.button
                onClick={handleNextMonth}
                className="glass-button p-2"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </motion.button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => setViewMode('month')}
              className={`glass-button p-2 ${viewMode === 'month' ? 'bg-white/20' : ''}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Grid className="w-4 h-4 text-white" />
            </motion.button>
            <motion.button
              onClick={() => setViewMode('week')}
              className={`glass-button p-2 ${viewMode === 'week' ? 'bg-white/20' : ''}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <List className="w-4 h-4 text-white" />
            </motion.button>
            <motion.button
              onClick={() => setShowEventModal(true)}
              className="glass-button px-4 py-2 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4" />
              New Event
            </motion.button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input w-full pl-10 text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 p-4">
        <div className="glass-card p-6 h-full">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-gray-400 font-medium p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth(currentDate).map((date, index) => (
              <motion.div
                key={index}
                className={`min-h-24 p-2 border border-white/10 rounded-lg cursor-pointer ${
                  date ? 'hover:bg-white/10' : ''
                } ${
                  date && date.toDateString() === new Date().toDateString() 
                    ? 'ring-2 ring-purple-500' 
                    : ''
                }`}
                onClick={() => date && handleDateClick(date)}
                whileHover={{ scale: date ? 1.02 : 1 }}
                whileTap={{ scale: date ? 0.98 : 1 }}
              >
                {date && (
                  <>
                    <div className="text-white font-medium mb-1">
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {getEventsForDate(date).slice(0, 2).map(event => (
                        <motion.div
                          key={event.id}
                          className={`text-xs p-1 rounded text-white truncate ${getColorForEvent(event)} cursor-pointer`}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEventClick(event)
                          }}
                          whileHover={{ scale: 1.05 }}
                        >
                          {event.title}
                        </motion.div>
                      ))}
                      {getEventsForDate(date).length > 2 && (
                        <div className="text-xs text-gray-400">
                          +{getEventsForDate(date).length - 2} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            className="glass-card p-6 w-96 max-h-96 overflow-auto"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">
                {selectedEvent ? 'Edit Event' : 'New Event'}
              </h3>
              <motion.button
                onClick={() => {
                  setShowEventModal(false)
                  setSelectedEvent(null)
                }}
                className="text-gray-400 hover:text-white"
                whileHover={{ scale: 1.1 }}
              >
                ×
              </motion.button>
            </div>

            {selectedEvent ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getColorForEvent(selectedEvent)}`}></div>
                    {selectedEvent.title}
                  </h4>
                  <p className="text-gray-400 text-sm mt-1">{selectedEvent.description}</p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Clock className="w-4 h-4" />
                    <span>{formatEventTime(selectedEvent)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-300">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{new Date(selectedEvent.start).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                  
                  {selectedEvent.location && (
                    <div className="flex items-center gap-2 text-gray-300">
                      {selectedEvent.location.type === 'virtual' ? (
                        <Video className="w-4 h-4" />
                      ) : selectedEvent.location.type === 'phone' ? (
                        <Clock className="w-4 h-4" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                      <span>{selectedEvent.location.name}</span>
                      {selectedEvent.location.meetingUrl && (
                        <motion.button
                          onClick={() => window.open(selectedEvent.location?.meetingUrl, '_blank')}
                          className="text-blue-400 hover:text-blue-300 ml-2"
                          whileHover={{ scale: 1.1 }}
                        >
                          <Link className="w-3 h-3" />
                        </motion.button>
                      )}
                    </div>
                  )}
                  
                  {selectedEvent.attendees.length > 0 && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Users className="w-4 h-4" />
                      <span>{selectedEvent.attendees.length} attendees</span>
                    </div>
                  )}
                  
                  {selectedEvent.priority !== 'medium' && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Flag className={`w-4 h-4 ${
                        selectedEvent.priority === 'urgent' ? 'text-red-400' :
                        selectedEvent.priority === 'high' ? 'text-orange-400' :
                        'text-blue-400'
                      }`} />
                      <span className="capitalize">{selectedEvent.priority} priority</span>
                    </div>
                  )}
                  
                  {selectedEvent.isRecurring && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Repeat className="w-4 h-4" />
                      <span>Recurring event</span>
                    </div>
                  )}
                  
                  {selectedEvent.categories.length > 0 && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Tag className="w-4 h-4" />
                      <div className="flex gap-1 flex-wrap">
                        {selectedEvent.categories.map(cat => (
                          <span key={cat} className="bg-white/10 px-2 py-1 rounded-full text-xs">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {selectedEvent.attendees.length > 0 && (
                  <div>
                    <h5 className="text-white text-sm font-medium mb-2">Attendees</h5>
                    <div className="space-y-1">
                      {selectedEvent.attendees.slice(0, 3).map(attendee => (
                        <div key={attendee.id} className="flex items-center gap-2 text-xs">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-medium">
                            {attendee.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-gray-300">{attendee.name}</span>
                          <span className={`px-1 py-0.5 rounded-full text-xs ${
                            attendee.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                            attendee.status === 'declined' ? 'bg-red-500/20 text-red-400' :
                            attendee.status === 'tentative' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {attendee.status}
                          </span>
                        </div>
                      ))}
                      {selectedEvent.attendees.length > 3 && (
                        <div className="text-xs text-gray-400">
                          +{selectedEvent.attendees.length - 3} more attendees
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 pt-2">
                  <motion.button
                    onClick={() => {
                      setEditingEvent(selectedEvent)
                      setSelectedEvent(null)
                    }}
                    className="glass-button px-4 py-2 flex items-center gap-2 flex-1"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </motion.button>
                  
                  <motion.button
                    onClick={() => duplicateEvent(selectedEvent.id)}
                    className="glass-button px-4 py-2 flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Copy className="w-4 h-4" />
                  </motion.button>
                  
                  <motion.button
                    onClick={() => {
                      deleteEvent(selectedEvent.id)
                      setShowEventModal(false)
                      setSelectedEvent(null)
                    }}
                    className="glass-button px-4 py-2 text-red-400 hover:bg-red-500/20"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Event title"
                  className="glass-input w-full text-white placeholder-gray-400"
                />
                <textarea
                  placeholder="Event description"
                  className="glass-input w-full h-20 resize-none text-white placeholder-gray-400"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    className="glass-input text-white"
                  />
                  <input
                    type="time"
                    className="glass-input text-white"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Location"
                  className="glass-input w-full text-white placeholder-gray-400"
                />
                <motion.button
                  className="glass-button w-full px-4 py-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Create Event
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  )
} 