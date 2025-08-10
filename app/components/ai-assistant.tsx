"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  X, 
  Minimize2,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Brain,
  Zap,
  Globe,
  Search,
  Settings,
  Calculator,
  Calendar,
  Mail,
  Music,
  Terminal,
  Code,
  Camera,
  FileText
} from "lucide-react"

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  actions?: Action[]
}

interface Action {
  type: 'open_app' | 'open_url' | 'search' | 'system_command'
  label: string
  value: string
  icon?: any
}

interface AIAssistantProps {
  isOpen: boolean
  onClose: () => void
  onOpenApp: (appId: string) => void
  position: { x: number; y: number }
}

export default function AIAssistant({ isOpen, onClose, onOpenApp, position }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm Sierra, your intelligent AI assistant powered by advanced language understanding. I can help you navigate MominOS efficiently and understand your requests naturally.\n\n✨ Try speaking naturally to me:\n• \"I need to do some math\"\n• \"Show me my schedule\"\n• \"Find information about AI\"\n• \"Open something for coding\"\n\nI'm designed to understand context and provide helpful assistance. What would you like to accomplish?",
      timestamp: new Date(),
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus()
    }
  }, [isOpen, isMinimized])

  const extractActionsFromIntent = (intent: string, entities: string[], normalizedInput: string): Action[] => {
    const actions: Action[] = []

    // App opening actions
    if (intent === 'open_app' || normalizedInput.match(/\b(open|launch|start|run|show me|go to|access)\b/)) {
      if (entities.some(e => ['calculator', 'calc'].includes(e)) || normalizedInput.match(/\b(math|calculate|compute|numbers)\b/)) {
        actions.push({ type: 'open_app', label: 'Open Calculator', value: 'calculator', icon: Calculator })
      }
      if (entities.some(e => ['browser', 'chrome', 'web'].includes(e)) || normalizedInput.match(/\b(internet|surf|browse|web)\b/)) {
        actions.push({ type: 'open_app', label: 'Open Browser', value: 'browser', icon: Globe })
      }
      if (entities.some(e => ['calendar'].includes(e)) || normalizedInput.match(/\b(schedule|appointment|meeting|event|date)\b/)) {
        actions.push({ type: 'open_app', label: 'Open Calendar', value: 'calendar', icon: Calendar })
      }
      if (entities.some(e => ['mail', 'email'].includes(e)) || normalizedInput.match(/\b(message|inbox|compose|send)\b/)) {
        actions.push({ type: 'open_app', label: 'Open Mail', value: 'mail', icon: Mail })
      }
      if (entities.some(e => ['music', 'audio'].includes(e)) || normalizedInput.match(/\b(song|track|playlist|listen|sound)\b/)) {
        actions.push({ type: 'open_app', label: 'Open Music', value: 'music', icon: Music })
      }
      if (entities.some(e => ['terminal', 'console'].includes(e)) || normalizedInput.match(/\b(command|cmd|bash|shell|cli)\b/)) {
        actions.push({ type: 'open_app', label: 'Open Terminal', value: 'terminal', icon: Terminal })
      }
      if (entities.some(e => ['code', 'editor'].includes(e)) || normalizedInput.match(/\b(programming|develop|script|coding|ide)\b/)) {
        actions.push({ type: 'open_app', label: 'Open Code', value: 'code', icon: Code })
      }
      if (entities.some(e => ['photos', 'images'].includes(e)) || normalizedInput.match(/\b(picture|gallery|photo|image|visual)\b/)) {
        actions.push({ type: 'open_app', label: 'Open Photos', value: 'photos', icon: Camera })
      }
      if (entities.some(e => ['files', 'explorer'].includes(e)) || normalizedInput.match(/\b(folder|directory|document|file|explore)\b/)) {
        actions.push({ type: 'open_app', label: 'Open Files', value: 'files', icon: FileText })
      }
      if (entities.some(e => ['settings', 'preferences'].includes(e)) || normalizedInput.match(/\b(configure|customize|setup|options|control)\b/)) {
        actions.push({ type: 'open_app', label: 'Open Settings', value: 'settings', icon: Settings })
      }
    }

    // Search actions
    if (intent === 'search' || normalizedInput.match(/\b(search|find|look for|google|query)\b/)) {
      const searchTerm = normalizedInput.replace(/(search|google|find|look for|query)\s+(for\s+)?/gi, '').trim()
      if (searchTerm) {
        actions.push({ type: 'open_url', label: `Search: ${searchTerm}`, value: `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`, icon: Search })
      }
    }

    return actions
  }

  const processUserInput = async (input: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

    const response = await generateAIResponse(input.toLowerCase())

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: response.content,
      timestamp: new Date(),
      actions: response.actions
    }

    setMessages(prev => [...prev, assistantMessage])
    setIsTyping(false)

    // Auto-speak response if enabled
    if (isSpeaking) {
      speakText(response.content)
    }
  }

  // Enhanced natural language processing functions
  const extractIntent = (input: string): { intent: string; entities: string[]; confidence: number } => {
    const normalizedInput = input.toLowerCase().trim()

    // Intent patterns with confidence scoring
    const intentPatterns = [
      { intent: 'open_app', patterns: ['open', 'launch', 'start', 'run', 'show me', 'go to', 'access'], confidence: 0.9 },
      { intent: 'search', patterns: ['search', 'find', 'look for', 'google', 'query'], confidence: 0.8 },
      { intent: 'help', patterns: ['help', 'what can you do', 'capabilities', 'guide', 'assist'], confidence: 0.9 },
      { intent: 'greeting', patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon'], confidence: 0.9 },
      { intent: 'system_info', patterns: ['time', 'date', 'weather', 'status', 'system'], confidence: 0.7 },
      { intent: 'navigate', patterns: ['go to', 'navigate', 'visit', 'browse'], confidence: 0.8 },
      { intent: 'calculate', patterns: ['calculate', 'compute', 'math', 'add', 'subtract', 'multiply', 'divide'], confidence: 0.8 }
    ]

    let bestMatch = { intent: 'unknown', confidence: 0 }
    for (const pattern of intentPatterns) {
      for (const phrase of pattern.patterns) {
        if (normalizedInput.includes(phrase)) {
          if (pattern.confidence > bestMatch.confidence) {
            bestMatch = { intent: pattern.intent, confidence: pattern.confidence }
          }
        }
      }
    }

    // Extract entities (simple word matching)
    const entities = normalizedInput.split(' ').filter(word => 
      word.length > 3 && !['open', 'launch', 'start', 'show', 'find', 'search'].includes(word)
    )

    return {
      intent: bestMatch.intent,
      entities,
      confidence: bestMatch.confidence
    }
  }

  const extractEntities = (input: string): string[] => {
    const appEntities = ['calculator', 'calc', 'browser', 'chrome', 'web', 'calendar', 'mail', 'email', 
                        'music', 'audio', 'terminal', 'console', 'code', 'editor', 'photos', 'images', 
                        'files', 'explorer', 'settings', 'preferences']

    const webEntities = ['youtube', 'github', 'google', 'facebook', 'twitter', 'instagram', 'netflix']

    const entities = []
    for (const entity of [...appEntities, ...webEntities]) {
      if (input.includes(entity)) {
        entities.push(entity)
      }
    }

    return entities
  }

  const generateContextualResponse = (input: string, intent: string, entities: string[], confidence: number): string => {
    const responses = {
      greeting: [
        "Hello! I'm Momin, your intelligent AI assistant. I'm here to help you navigate MominOS effortlessly.",
        "Hi there! Ready to make your computing experience smarter? What would you like me to help you with?",
        "Hey! Great to see you. I'm your personal AI companion, designed to understand and anticipate your needs."
      ],
      help: [
        "I'm a next-generation AI assistant built into MominOS. I understand natural language and can help with virtually anything - opening apps, browsing the web, answering questions, managing your system, and even learning your preferences over time.",
        "Think of me as your intelligent digital companion. I can understand context, remember our conversations, and provide personalized assistance tailored to your workflow."
      ],
      unknown: [
        "I'm processing your request and learning from our interaction. While I continue to evolve, let me help you explore what I can do right now.",
        "That's an interesting query! I'm constantly expanding my understanding. Let me suggest some ways I can assist you immediately."
      ]
    }

    const responseList = responses[intent as keyof typeof responses] || responses.unknown
    return responseList[Math.floor(Math.random() * responseList.length)]
  }

  const generateAIResponse = async (input: string): Promise<{ content: string; actions?: Action[] }> => {
    const { intent, entities, confidence } = extractIntent(input)
    const normalizedInput = input.toLowerCase()

    // Try Gemini API first, with fallback to local processing
    try {
      const geminiResponse = await import('@/app/lib/gemini').then(m => m.geminiService.generateResponse(input))

      // If Gemini provides a good response, use it but still add actions based on intent
      if (geminiResponse && !geminiResponse.includes('offline mode')) {
        const actions = extractActionsFromIntent(intent, entities, normalizedInput)
        return {
          content: geminiResponse,
          actions
        }
      }
    } catch (error) {
      console.warn('Falling back to local AI processing:', error)
    }

    // Enhanced app opening with natural language understanding
    if (intent === 'open_app' || normalizedInput.match(/\b(open|launch|start|run|show me|go to|access)\b/)) {
      // Calculator variations
      if (entities.some(e => ['calculator', 'calc'].includes(e)) || normalizedInput.match(/\b(math|calculate|compute|numbers)\b/)) {
        return {
          content: generateContextualResponse(input, 'open_app', entities, confidence) + " Opening Calculator for your mathematical needs!",
          actions: [{ type: 'open_app', label: 'Open Calculator', value: 'calculator', icon: Calculator }]
        }
      }

      // Browser variations
      if (entities.some(e => ['browser', 'chrome', 'web'].includes(e)) || normalizedInput.match(/\b(internet|surf|browse|web)\b/)) {
        return {
          content: "Launching your web browser! The internet awaits your exploration.",
          actions: [{ type: 'open_app', label: 'Open Browser', value: 'browser', icon: Globe }]
        }
      }

      // Calendar variations
      if (entities.some(e => ['calendar'].includes(e)) || normalizedInput.match(/\b(schedule|appointment|meeting|event|date)\b/)) {
        return {
          content: "Opening your Calendar to help you stay organized and on schedule!",
          actions: [{ type: 'open_app', label: 'Open Calendar', value: 'calendar', icon: Calendar }]
        }
      }

      // Email variations
      if (entities.some(e => ['mail', 'email'].includes(e)) || normalizedInput.match(/\b(message|inbox|compose|send)\b/)) {
        return {
          content: "Accessing your Mail application. Let's check those important messages!",
          actions: [{ type: 'open_app', label: 'Open Mail', value: 'mail', icon: Mail }]
        }
      }

      // Music variations
      if (entities.some(e => ['music', 'audio'].includes(e)) || normalizedInput.match(/\b(song|track|playlist|listen|sound)\b/)) {
        return {
          content: "Starting your Music player! Time to enjoy some great tunes.",
          actions: [{ type: 'open_app', label: 'Open Music', value: 'music', icon: Music }]
        }
      }

      // Terminal variations
      if (entities.some(e => ['terminal', 'console'].includes(e)) || normalizedInput.match(/\b(command|cmd|bash|shell|cli)\b/)) {
        return {
          content: "Opening Terminal for advanced system access. Welcome to the command line!",
          actions: [{ type: 'open_app', label: 'Open Terminal', value: 'terminal', icon: Terminal }]
        }
      }

      // Code editor variations
      if (entities.some(e => ['code', 'editor'].includes(e)) || normalizedInput.match(/\b(programming|develop|script|coding|ide)\b/)) {
        return {
          content: "Launching Code Editor! Ready to create something amazing?",
          actions: [{ type: 'open_app', label: 'Open Code', value: 'code', icon: Code }]
        }
      }

      // Photos variations
      if (entities.some(e => ['photos', 'images'].includes(e)) || normalizedInput.match(/\b(picture|gallery|photo|image|visual)\b/)) {
        return {
          content: "Opening Photos to browse your visual memories and images!",
          actions: [{ type: 'open_app', label: 'Open Photos', value: 'photos', icon: Camera }]
        }
      }

      // Files variations
      if (entities.some(e => ['files', 'explorer'].includes(e)) || normalizedInput.match(/\b(folder|directory|document|file|explore)\b/)) {
        return {
          content: "Opening File Explorer to navigate your digital storage!",
          actions: [{ type: 'open_app', label: 'Open Files', value: 'files', icon: FileText }]
        }
      }

      // Settings variations
      if (entities.some(e => ['settings', 'preferences'].includes(e)) || normalizedInput.match(/\b(configure|customize|setup|options|control)\b/)) {
        return {
          content: "Opening Settings to personalize your MominOS experience!",
          actions: [{ type: 'open_app', label: 'Open Settings', value: 'settings', icon: Settings }]
        }
      }
    }

    // Enhanced search with better understanding
    if (intent === 'search' || normalizedInput.match(/\b(search|find|look for|google|query)\b/)) {
      const searchTerm = input.replace(/(search|google|find|look for|query)\s+(for\s+)?/gi, '').trim()
      if (searchTerm) {
        return {
          content: `I'll search for "${searchTerm}" across the web using multiple sources to give you comprehensive results!`,
          actions: [
            { type: 'open_url', label: `Search: ${searchTerm}`, value: `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`, icon: Search },
            { type: 'open_app', label: 'Open Browser', value: 'browser', icon: Globe }
          ]
        }
      }
    }

    // Smart web navigation
    if (entities.includes('youtube') || normalizedInput.match(/\b(video|watch|youtube)\b/)) {
      return {
        content: "Taking you to YouTube! Discover endless entertainment and educational content.",
        actions: [{ type: 'open_url', label: 'Open YouTube', value: 'https://www.youtube.com', icon: Globe }]
      }
    }

    if (entities.includes('github') || normalizedInput.match(/\b(repository|repo|github|code)\b/)) {
      return {
        content: "Navigating to GitHub! The world's largest community of developers awaits.",
        actions: [{ type: 'open_url', label: 'Open GitHub', value: 'https://www.github.com', icon: Globe }]
      }
    }

    // Smart system information
    if (normalizedInput.match(/\b(time|clock|what time)\b/)) {
      const now = new Date()
      const timeString = now.toLocaleTimeString()
      const dateString = now.toLocaleDateString()
      const dayName = now.toLocaleDateString('en-US', { weekday: 'long' })

      return {
        content: `Right now it's ${timeString} on ${dayName}, ${dateString}. Hope you're having a productive day!`
      }
    }

    if (normalizedInput.match(/\b(weather|temperature|forecast)\b/)) {
      return {
        content: "I'd love to get you the latest weather information! Let me connect you to a reliable weather service.",
        actions: [{ type: 'open_url', label: 'Check Weather', value: 'https://weather.com', icon: Globe }]
      }
    }

    // Enhanced help responses
    if (intent === 'help' || normalizedInput.match(/\b(help|what can you do|capabilities|guide)\b/)) {
      return {
        content: generateContextualResponse(input, 'help', entities, confidence) + "\n\n🚀 I can:\n• Understand natural language commands\n• Open any application instantly\n• Browse and search the web intelligently\n• Provide system information\n• Learn your preferences over time\n• Execute complex workflows\n• Assist with productivity tasks\n\nJust speak naturally - I'll understand and adapt!",
        actions: [
          { type: 'open_app', label: 'Explore Apps', value: 'launcher', icon: Sparkles },
          { type: 'open_app', label: 'System Settings', value: 'settings', icon: Settings }
        ]
      }
    }

    // Enhanced greeting responses
    if (intent === 'greeting') {
      return {
        content: generateContextualResponse(input, 'greeting', entities, confidence) + " What would you like to accomplish today?"
      }
    }

    // Gratitude responses
    if (normalizedInput.match(/\b(thank|thanks|appreciate|grateful)\b/)) {
      const gratitudeResponses = [
        "You're absolutely welcome! I'm here whenever you need assistance.",
        "My pleasure! Helping you achieve your goals is what I'm designed for.",
        "Happy to help! Your success is my success."
      ]
      return {
        content: gratitudeResponses[Math.floor(Math.random() * gratitudeResponses.length)]
      }
    }

    // Default intelligent response with context awareness
    const contextualDefault = generateContextualResponse(input, 'unknown', entities, confidence)
    return {
      content: `${contextualDefault} Based on "${input}", I believe you might want to explore these options:`,
      actions: [
        { type: 'open_url', label: `Search: ${input}`, value: `https://www.google.com/search?q=${encodeURIComponent(input)}`, icon: Search },
        { type: 'open_app', label: 'Open Browser', value: 'browser', icon: Globe },
        { type: 'open_app', label: 'System Help', value: 'settings', icon: Settings }
      ]
    }
  }

  const executeAction = (action: Action) => {
    switch (action.type) {
      case 'open_app':
        onOpenApp(action.value)
        break
      case 'open_url':
        window.open(action.value, '_blank')
        break
      case 'search':
        window.open(`https://www.google.com/search?q=${encodeURIComponent(action.value)}`, '_blank')
        break
    }
  }

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      utterance.pitch = 1.1
      utterance.volume = 0.8
      window.speechSynthesis.speak(utterance)
    }
  }

  const toggleListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsListening(!isListening)
      // Voice recognition implementation would go here
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed z-50"
        style={{ 
          left: position.x + dragOffset.x, 
          top: position.y + dragOffset.y 
        }}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        drag
        dragMomentum={false}
        onDrag={(event, info) => {
          setDragOffset({ x: info.offset.x, y: info.offset.y })
        }}
      >
        <motion.div 
          className={`bg-black/30 backdrop-blur-3xl border border-white/20 rounded-3xl shadow-2xl ${
            isMinimized ? 'w-16 h-16' : 'w-96 h-[500px]'
          }`}
          style={{
            boxShadow: '0 32px 80px -12px rgba(0, 0, 0, 0.4), 0 0 40px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
          whileHover={{ 
            boxShadow: '0 32px 80px -12px rgba(0, 0, 0, 0.5), 0 0 60px rgba(139, 92, 246, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-8 h-8 bg-gradient-to-br from-purple-500 to-cyan-400 rounded-xl flex items-center justify-center"
                animate={{ 
                  rotate: isTyping ? [0, 5, -5, 0] : 0,
                  scale: isListening ? [1, 1.1, 1] : 1
                }}
                transition={{ 
                  rotate: { duration: 0.5, repeat: isTyping ? Infinity : 0 },
                  scale: { duration: 1, repeat: isListening ? Infinity : 0 }
                }}
              >
                <Brain className="w-4 h-4 text-white" />
              </motion.div>
              {!isMinimized && (
                <div>
                  <h3 className="text-white font-semibold text-sm">Sierra AI</h3>
                  <p className="text-gray-300 text-xs">
                    {isTyping ? 'Thinking...' : isListening ? 'Listening...' : 'Ready to assist'}
                  </p>
                </div>
              )}
            </div>

            {!isMinimized && (
              <div className="flex items-center gap-1">
                <motion.button
                  onClick={() => setIsSpeaking(!isSpeaking)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isSpeaking ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                </motion.button>
                <motion.button
                  onClick={toggleListening}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isListening ? 'bg-red-500/20 text-red-400' : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                </motion.button>
                <motion.button
                  onClick={() => setIsMinimized(true)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Minimize2 className="w-3 h-3" />
                </motion.button>
                <motion.button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-white/10 hover:bg-red-500/20 text-white/70 hover:text-red-400 transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-3 h-3" />
                </motion.button>
              </div>
            )}

            {isMinimized && (
              <motion.button
                onClick={() => setIsMinimized(false)}
                className="absolute inset-0 rounded-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              />
            )}
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto max-h-80 space-y-3">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                      <motion.div
                        className={`p-3 rounded-2xl ${
                          message.type === 'user' 
                            ? 'bg-purple-500/30 border border-purple-400/30 text-white' 
                            : 'bg-white/10 border border-white/10 text-gray-100'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-line">
                          {message.content}
                        </p>
                        <p className="text-xs opacity-60 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </motion.div>

                      {message.actions && (
                        <motion.div 
                          className="mt-2 space-y-1"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          {message.actions.map((action, index) => {
                            const Icon = action.icon || Zap
                            return (
                              <motion.button
                                key={index}
                                onClick={() => executeAction(action)}
                                className="flex items-center gap-2 w-full p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white/90 hover:text-white transition-all duration-200 text-sm"
                                whileHover={{ scale: 1.02, x: 2 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Icon className="w-4 h-4" />
                                {action.label}
                              </motion.button>
                            )
                          })}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    className="flex justify-start"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="bg-white/10 border border-white/10 rounded-2xl p-3">
                      <div className="flex space-x-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 bg-purple-400 rounded-full"
                            animate={{ 
                              opacity: [0.3, 1, 0.3],
                              scale: [0.8, 1, 0.8]
                            }}
                            transition={{ 
                              duration: 1.5, 
                              repeat: Infinity, 
                              delay: i * 0.2 
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && inputValue.trim()) {
                        processUserInput(inputValue.trim())
                      }
                    }}
                    placeholder="Ask me anything or give me a command..."
                    className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 focus:bg-white/15 transition-all duration-200 text-sm"
                    disabled={isTyping}
                  />
                  <motion.button
                    onClick={() => {
                      if (inputValue.trim()) {
                        processUserInput(inputValue.trim())
                      }
                    }}
                    disabled={!inputValue.trim() || isTyping}
                    className="p-2 rounded-xl bg-purple-500/30 hover:bg-purple-500/40 disabled:bg-white/10 disabled:opacity-50 text-white transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}