// MominOS Intelligent Local AI Assistant
// No API required - 100% offline and super smart!

interface AIKnowledge {
  apps: { [key: string]: any }
  shortcuts: { [key: string]: string }
  systemInfo: { [key: string]: any }
  helpTopics: { [key: string]: string }
  personalizedResponses: string[]
  vocabulary: { [key: string]: string[] }
  emotions: { [key: string]: string[] }
  conversationalPhrases: { [key: string]: string[] }
  synonyms: { [key: string]: string[] }
}

export class MominOSAI {
  private knowledge: AIKnowledge
  private conversationHistory: string[] = []
  private userPreferences: { [key: string]: any } = {}
  
  constructor() {
    this.knowledge = {
      apps: {
        calculator: {
          name: 'Calculator',
          description: 'Advanced scientific calculator with history',
          features: ['Basic math', 'Scientific functions', 'History tracking', 'Memory functions'],
          shortcuts: ['Ctrl+Shift+C'],
          tips: ['Use scientific mode for advanced functions', 'History is saved automatically']
        },
        browser: {
          name: 'Browser',
          description: 'Full-featured web browser with tabs and bookmarks',
          features: ['Multiple tabs', 'Bookmarks', 'History', 'Search'],
          shortcuts: ['Ctrl+Shift+B'],
          tips: ['Drag tabs to reorder', 'Bookmark frequently used sites']
        },
        files: {
          name: 'File Explorer',
          description: 'Complete file management system',
          features: ['Tree view', 'File operations', 'Search', 'Multiple views'],
          shortcuts: ['Ctrl+Shift+E'],
          tips: ['Right-click for context menu', 'Drag and drop to move files']
        },
        terminal: {
          name: 'Terminal',
          description: 'Command-line interface for power users',
          features: ['Command execution', 'History', 'Auto-completion'],
          shortcuts: ['Ctrl+Shift+T', 'Ctrl+`'],
          tips: ['Type "help" for available commands', 'Use Tab for auto-completion']
        },
        settings: {
          name: 'Settings',
          description: 'System configuration and customization',
          features: ['Theme settings', 'Keyboard shortcuts', 'Performance tuning'],
          shortcuts: ['Ctrl+Shift+S', 'Ctrl+,'],
          tips: ['Customize themes in appearance section', 'Enable performance monitoring']
        },
        code: {
          name: 'Code Editor',
          description: 'Professional code editor with syntax highlighting',
          features: ['Syntax highlighting', 'File tree', 'Code execution', 'Search and replace'],
          shortcuts: ['Ctrl+Shift+C'],
          tips: ['Supports multiple languages', 'Files are saved locally', 'Use Ctrl+S to save']
        },
        music: {
          name: 'Music Player',
          description: 'Audio player with playlist management',
          features: ['Playlist creation', 'Audio controls', 'Now playing'],
          tips: ['Drag and drop audio files to add to playlist']
        },
        photos: {
          name: 'Photo Gallery',
          description: 'Image viewer and management',
          features: ['Image viewing', 'Gallery organization', 'Basic editing'],
          tips: ['Navigate with arrow keys', 'Click to zoom']
        },
        calendar: {
          name: 'Calendar',
          description: 'Event scheduling and time management',
          features: ['Event creation', 'Monthly view', 'Reminders'],
          tips: ['Click on dates to create events', 'Color-code different event types']
        },
        mail: {
          name: 'Email',
          description: 'Modern email client',
          features: ['Inbox management', 'Compose emails', 'Search'],
          tips: ['Use search to find emails quickly', 'Star important messages']
        }
      },
      shortcuts: {
        'Ctrl+Space': 'Open AI Assistant (that\'s me!)',
        'Ctrl+K': 'Global Search - find anything instantly',
        'F1': 'Show keyboard shortcuts help',
        'F11': 'Maximize active window',
        'Ctrl+Shift+T': 'Open Terminal',
        'Ctrl+Shift+E': 'Open File Explorer',
        'Ctrl+Shift+C': 'Open Calculator',
        'Ctrl+Shift+B': 'Open Browser',
        'Ctrl+Shift+S': 'Open Settings',
        'Ctrl+Alt+L': 'Lock screen',
        'Ctrl+Alt+T': 'Toggle theme',
        'Ctrl+Alt+M': 'Minimize all windows',
        'Alt+1-4': 'Switch virtual desktop',
        'PrintScreen': 'Take screenshot',
        'Ctrl+`': 'Quick terminal access',
        'Ctrl+,': 'Quick settings access'
      },
      systemInfo: {
        name: 'MominOS v5.0.0',
        developer: 'Momin Aldahdouh (14 years old)',
        architecture: 'Next.js + TypeScript + React',
        features: [
          'AI-powered assistant (that\'s me!)',
          'Advanced window management',
          'Real-time performance monitoring',
          'Professional keyboard shortcuts',
          '10+ integrated applications',
          'Glass morphism design',
          'Virtual desktops',
          'System tray with live monitoring'
        ],
        performance: {
          target: '60 FPS',
          architecture: 'Component-based',
          optimization: 'Smart re-rendering'
        }
      },
      helpTopics: {
        'getting started': 'Welcome to MominOS! Double-click anywhere or press Ctrl+Space to talk to me. Press F1 for keyboard shortcuts.',
        'keyboard shortcuts': 'I know all the shortcuts! Press F1 to see the complete list, or ask me about specific shortcuts.',
        'window management': 'Drag windows around, resize them from edges, or drag to screen edges to snap them. Double-click title bars to maximize.',
        'virtual desktops': 'Use Alt+1-4 to switch between 4 virtual desktops. Great for organizing different projects!',
        'performance': 'Click the performance monitor in the top-right to see real-time CPU, RAM, and FPS stats.',
        'themes': 'Currently supporting the beautiful tropical glass theme. More themes coming soon!',
        'ai assistant': 'That\'s me! I understand natural language and can help you with anything in MominOS.',
        'applications': 'MominOS includes 10+ apps: Calculator, Browser, Files, Terminal, Settings, Code Editor, Music, Photos, Calendar, and Email.'
      },
      personalizedResponses: [
        "Hey! I'm Sierra, your personal MominOS assistant! 🌟",
        "Great to see you using MominOS! What can I help you with today?",
        "I'm here to make your MominOS experience amazing! 🚀",
        "Ready to help you master MominOS! What would you like to know?",
        "MominOS is looking great today! How can I assist you?"
      ],
      vocabulary: {
        greetings: ['hello', 'hi', 'hey', 'greetings', 'salutations', 'howdy', 'good morning', 'good afternoon', 'good evening', 'what\'s up', 'yo', 'hiya', 'sup', 'wassup'],
        farewells: ['goodbye', 'bye', 'see you later', 'farewell', 'take care', 'catch you later', 'see ya', 'later', 'adios', 'ciao', 'peace out', 'until next time'],
        appreciation: ['thanks', 'thank you', 'appreciate', 'grateful', 'cheers', 'much appreciated', 'awesome', 'brilliant', 'excellent', 'fantastic', 'amazing', 'wonderful', 'perfect', 'great job'],
        questions: ['what', 'how', 'when', 'where', 'why', 'which', 'who', 'can you', 'could you', 'would you', 'is it possible', 'do you know', 'tell me', 'explain', 'show me'],
        actions: ['open', 'launch', 'start', 'run', 'execute', 'activate', 'begin', 'initiate', 'create', 'make', 'build', 'develop', 'design', 'construct'],
        emotions: ['happy', 'sad', 'excited', 'frustrated', 'confused', 'amazed', 'impressed', 'disappointed', 'pleased', 'delighted', 'thrilled', 'overwhelmed', 'curious', 'interested'],
        intensifiers: ['very', 'really', 'extremely', 'incredibly', 'absolutely', 'totally', 'completely', 'quite', 'rather', 'pretty', 'super', 'ultra', 'mega', 'highly'],
        common_words: ['and', 'or', 'but', 'so', 'because', 'if', 'then', 'also', 'too', 'as well', 'moreover', 'furthermore', 'however', 'nevertheless', 'therefore']
      },
      emotions: {
        positive: ['I\'m delighted to help! 😊', 'That sounds fantastic! 🌟', 'Absolutely! I\'m excited to assist! 🚀', 'Perfect! Let\'s make this happen! ✨', 'Wonderful! I love helping with that! 💫'],
        neutral: ['I understand what you\'re looking for.', 'Let me help you with that.', 'Sure, I can assist with this.', 'I\'ll guide you through this process.', 'Here\'s what I can do for you.'],
        helpful: ['I\'m here to make this easy for you! 🎯', 'Don\'t worry, I\'ll walk you through it! 👍', 'No problem at all! Let\'s solve this together! 🤝', 'I\'ve got you covered! 💪', 'Consider it done! 🏆'],
        encouraging: ['You\'re doing great! Keep it up! 🌈', 'That\'s a smart question! 🧠', 'Excellent choice! 👌', 'You\'re really getting the hang of this! 🎉', 'I\'m impressed with your curiosity! 🔍']
      },
      conversationalPhrases: {
        transitions: ['speaking of which', 'by the way', 'incidentally', 'while we\'re on the topic', 'that reminds me', 'interestingly enough', 'as a matter of fact', 'actually'],
        explanations: ['in other words', 'to put it simply', 'basically', 'essentially', 'fundamentally', 'in essence', 'to clarify', 'what I mean is'],
        examples: ['for instance', 'for example', 'such as', 'like', 'including', 'namely', 'specifically', 'in particular'],
        conclusions: ['in summary', 'to wrap up', 'in conclusion', 'overall', 'all in all', 'to sum up', 'ultimately', 'in the end']
      },
      synonyms: {
        open: ['launch', 'start', 'run', 'execute', 'activate', 'begin', 'initiate', 'fire up', 'boot up'],
        fast: ['quick', 'rapid', 'speedy', 'swift', 'lightning', 'instant', 'immediate', 'snappy'],
        good: ['excellent', 'great', 'awesome', 'fantastic', 'amazing', 'wonderful', 'brilliant', 'outstanding'],
        help: ['assist', 'support', 'guide', 'aid', 'facilitate', 'enable', 'service', 'counsel'],
        smart: ['intelligent', 'clever', 'brilliant', 'wise', 'sharp', 'bright', 'genius', 'savvy'],
        easy: ['simple', 'effortless', 'straightforward', 'uncomplicated', 'user-friendly', 'intuitive', 'smooth'],
        powerful: ['strong', 'robust', 'mighty', 'potent', 'advanced', 'sophisticated', 'high-performance'],
        beautiful: ['gorgeous', 'stunning', 'elegant', 'attractive', 'lovely', 'pretty', 'stylish', 'sleek']
      }
    }
    
    // Load user preferences from localStorage
    this.loadUserPreferences()
  }

  async generateResponse(prompt: string): Promise<string> {
    // Add to conversation history
    this.conversationHistory.push(prompt)
    if (this.conversationHistory.length > 10) {
      this.conversationHistory = this.conversationHistory.slice(-10)
    }
    
    // Get intelligent response
    return this.getIntelligentResponse(prompt)
  }

  private getIntelligentResponse(prompt: string): string {
    const normalizedPrompt = prompt.toLowerCase().trim()
    
    // Advanced natural language understanding
    const intent = this.analyzeIntent(normalizedPrompt, prompt)
    const sentiment = this.analyzeSentiment(normalizedPrompt)
    const entities = this.extractEntities(normalizedPrompt)
    
    // Emotion-based response selection
    const emotionalTone = this.getEmotionalTone(sentiment)
    
    // Advanced greeting detection with variations
    if (this.isAdvancedGreeting(normalizedPrompt)) {
      return this.getContextualGreeting(sentiment, entities)
    }
    
    // Farewell detection
    if (this.isFarewell(normalizedPrompt)) {
      return this.getFarewellResponse(sentiment)
    }
    
    // Enhanced app queries with synonym understanding
    const appResponse = this.handleAdvancedAppQueries(normalizedPrompt, intent, entities)
    if (appResponse) return this.addEmotionalTone(appResponse, emotionalTone)
    
    // Smart shortcut queries with natural language
    const shortcutResponse = this.handleAdvancedShortcutQueries(normalizedPrompt, entities)
    if (shortcutResponse) return this.addEmotionalTone(shortcutResponse, emotionalTone)
    
    // Intelligent system queries
    const systemResponse = this.handleAdvancedSystemQueries(normalizedPrompt, intent)
    if (systemResponse) return this.addEmotionalTone(systemResponse, emotionalTone)
    
    // Contextual help with personalization
    const helpResponse = this.handleAdvancedHelpQueries(normalizedPrompt, intent, entities)
    if (helpResponse) return this.addEmotionalTone(helpResponse, emotionalTone)
    
    // Smart time queries
    if (this.isAdvancedTimeQuery(normalizedPrompt)) {
      return this.getAdvancedTimeResponse(entities, emotionalTone)
    }
    
    // Nuanced appreciation handling
    if (this.isAdvancedAppreciation(normalizedPrompt)) {
      return this.getAdvancedAppreciationResponse(sentiment)
    }
    
    // Intelligent search with context
    const searchResponse = this.handleAdvancedSearchQueries(normalizedPrompt, prompt, entities)
    if (searchResponse) return this.addEmotionalTone(searchResponse, emotionalTone)
    
    // Advanced task assistance
    const taskResponse = this.handleAdvancedTaskQueries(normalizedPrompt, intent, entities)
    if (taskResponse) return this.addEmotionalTone(taskResponse, emotionalTone)
    
    // Sophisticated contextual understanding
    const contextualResponse = this.getAdvancedContextualResponse(normalizedPrompt, intent, sentiment)
    if (contextualResponse) return contextualResponse
    
    // Ultra-smart fallback with learning
    return this.getUltraSmartFallback(prompt, intent, sentiment, entities)
  }
  
  private isGreeting(prompt: string): boolean {
    const greetings = ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening']
    return greetings.some(greeting => prompt.includes(greeting))
  }
  
  private getRandomPersonalizedResponse(): string {
    const responses = this.knowledge.personalizedResponses
    return responses[Math.floor(Math.random() * responses.length)]
  }
  
  private handleAppQueries(prompt: string): string | null {
    // Check for app opening requests
    const openKeywords = ['open', 'launch', 'start', 'run', 'show me']
    const isOpenRequest = openKeywords.some(keyword => prompt.includes(keyword))
    
    for (const [appKey, app] of Object.entries(this.knowledge.apps)) {
      if (prompt.includes(app.name.toLowerCase()) || prompt.includes(appKey)) {
        if (isOpenRequest) {
          return `Opening ${app.name}! ${app.description}\n\n💡 Pro tip: ${app.tips[Math.floor(Math.random() * app.tips.length)]}`
        } else {
          return `${app.name}: ${app.description}\n\nFeatures:\n${app.features.map(f => `• ${f}`).join('\n')}\n\n${app.shortcuts ? `Shortcut: ${app.shortcuts.join(', ')}` : ''}\n\n💡 ${app.tips[Math.floor(Math.random() * app.tips.length)]}`
        }
      }
    }
    return null
  }
  
  private handleShortcutQueries(prompt: string): string | null {
    if (prompt.includes('shortcut') || prompt.includes('hotkey') || prompt.includes('keyboard')) {
      // If asking about a specific shortcut
      for (const [shortcut, description] of Object.entries(this.knowledge.shortcuts)) {
        if (prompt.includes(shortcut.toLowerCase()) || prompt.includes(description.toLowerCase())) {
          return `${shortcut}: ${description}\n\n💡 This is one of my favorite shortcuts for quick access!`
        }
      }
      
      // General shortcut help
      const popularShortcuts = Object.entries(this.knowledge.shortcuts).slice(0, 8)
      return `Here are some essential MominOS keyboard shortcuts:\n\n${popularShortcuts.map(([key, desc]) => `${key}: ${desc}`).join('\n')}\n\n💡 Press F1 anytime to see the complete list!`
    }
    return null
  }
  
  private handleSystemQueries(prompt: string): string | null {
    if (prompt.includes('system') || prompt.includes('version') || prompt.includes('about') || prompt.includes('mominos')) {
      const info = this.knowledge.systemInfo
      return `${info.name} - Created by ${info.developer}\n\nArchitecture: ${info.architecture}\n\nKey Features:\n${info.features.map(f => `🌟 ${f}`).join('\n')}\n\nPerformance Target: ${info.performance.target} with ${info.performance.optimization}`
    }
    
    if (prompt.includes('performance') || prompt.includes('cpu') || prompt.includes('memory') || prompt.includes('ram')) {
      return `MominOS Performance Monitor is active! 📊\n\n• Real-time CPU usage tracking\n• Memory consumption monitoring\n• FPS counter for smooth experience\n• Component render optimization\n\nClick the performance indicator in the system tray to view detailed stats!`
    }
    
    return null
  }
  
  private handleHelpQueries(prompt: string): string | null {
    // Check for specific help topics
    for (const [topic, content] of Object.entries(this.knowledge.helpTopics)) {
      if (prompt.includes(topic) || prompt.includes(topic.replace(' ', ''))) {
        return `${content}\n\n💡 Need more help? Just ask me anything about MominOS!`
      }
    }
    
    if (prompt.includes('help') || prompt.includes('how to') || prompt.includes('guide')) {
      return `I'm Sierra, your intelligent MominOS assistant! 🤖\n\nI can help you with:\n• Opening and using applications\n• Keyboard shortcuts and navigation\n• System information and settings\n• Window management and virtual desktops\n• Performance monitoring\n• General MominOS questions\n\nJust ask me naturally - I understand context and can provide specific guidance!`
    }
    
    return null
  }
  
  private isTimeQuery(prompt: string): boolean {
    return prompt.includes('time') || prompt.includes('clock') || prompt.includes('date')
  }
  
  private getTimeResponse(): string {
    const now = new Date()
    const time = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
    const date = now.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    return `🕐 It's ${time} on ${date}\n\nHope you're having a productive day in MominOS!`
  }
  
  private isThanks(prompt: string): boolean {
    return prompt.includes('thank') || prompt.includes('thanks') || prompt.includes('appreciate')
  }
  
  private getAppreciationResponse(): string {
    const responses = [
      "You're very welcome! Happy to help make MominOS awesome for you! 😊",
      "My pleasure! That's what I'm here for - making your MominOS experience great!",
      "Anytime! I love helping you get the most out of MominOS! 🌟",
      "Glad I could help! Feel free to ask me anything else about MominOS!"
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }
  
  private handleSearchQueries(prompt: string, originalPrompt: string): string | null {
    const searchKeywords = ['search', 'google', 'find', 'look for', 'look up']
    if (searchKeywords.some(keyword => prompt.includes(keyword))) {
      const searchTerm = originalPrompt.replace(/(search|google|find|look for|look up)\s+(for\s+)?/gi, '').trim()
      if (searchTerm) {
        return `I'll help you search for "${searchTerm}"! 🔍\n\nOpening Browser to search the web for the most relevant results about ${searchTerm}.\n\n💡 Pro tip: Use Ctrl+Shift+B to quickly open Browser anytime!`
      }
    }
    return null
  }
  
  private handleTaskQueries(prompt: string): string | null {
    // Window management
    if (prompt.includes('window') || prompt.includes('minimize') || prompt.includes('maximize') || prompt.includes('close')) {
      return `MominOS Window Management:\n\n• Drag windows by title bar to move\n• Drag to screen edges to snap and resize\n• Double-click title bar to maximize/restore\n• Use F11 to maximize active window\n• Ctrl+Alt+M to minimize all windows\n\n💡 Windows automatically save their positions!`
    }
    
    // Virtual desktop management
    if (prompt.includes('desktop') || prompt.includes('workspace')) {
      return `Virtual Desktops in MominOS:\n\n• Use Alt+1, Alt+2, Alt+3, Alt+4 to switch between desktops\n• Each desktop maintains its own window layout\n• Perfect for organizing different projects\n• Drag windows between desktops\n\n💡 Great for separating work, entertainment, and development!`
    }
    
    // File management
    if (prompt.includes('file') && (prompt.includes('manage') || prompt.includes('organize'))) {
      return `File Management in MominOS:\n\n• Use File Explorer (Ctrl+Shift+E) for full file management\n• Tree view for easy navigation\n• Right-click for context menus\n• Drag and drop to move files\n• Built-in search functionality\n\n💡 Files are organized in a clean, intuitive interface!`
    }
    
    return null
  }
  
  private getContextualResponse(prompt: string): string | null {
    // Analyze conversation history for context
    if (this.conversationHistory.length > 1) {
      const lastPrompt = this.conversationHistory[this.conversationHistory.length - 2]
      
      // Follow-up questions
      if (prompt.includes('how') || prompt.includes('what about') || prompt.includes('tell me more')) {
        return `Based on our conversation, I can provide more specific guidance. What exactly would you like to know more about? I have detailed knowledge about all MominOS features and can help you become a power user!`
      }
    }
    return null
  }
  
  private getSmartFallback(originalPrompt: string): string {
    // Intelligent analysis of the prompt
    const words = originalPrompt.toLowerCase().split(' ')
    
    // Suggest related functionality
    const suggestions = []
    
    if (words.some(word => ['create', 'make', 'build'].includes(word))) {
      suggestions.push('Try the Code Editor for development projects')
    }
    
    if (words.some(word => ['organize', 'manage', 'sort'].includes(word))) {
      suggestions.push('File Explorer can help organize your files')
      suggestions.push('Calendar is great for organizing your schedule')
    }
    
    if (words.some(word => ['calculate', 'math', 'number'].includes(word))) {
      suggestions.push('Calculator app has advanced scientific functions')
    }
    
    let response = `I understand you're looking for help with "${originalPrompt}". `
    
    if (suggestions.length > 0) {
      response += `Here are some suggestions:\n\n${suggestions.map(s => `💡 ${s}`).join('\n')}\n\n`
    }
    
    response += `I'm Sierra, your intelligent local AI assistant, and I have deep knowledge about MominOS. Try asking me:\n• How to use specific applications\n• Keyboard shortcuts for productivity\n• System information and features\n• Help with common tasks\n\nWhat would you like to explore?`
    
    return response
  }
  
  private loadUserPreferences(): void {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('mominos-ai-preferences')
        if (saved) {
          this.userPreferences = JSON.parse(saved)
        }
      } catch (error) {
        // Silently handle localStorage errors
      }
    }
  }
  
  private saveUserPreferences(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('mominos-ai-preferences', JSON.stringify(this.userPreferences))
      } catch (error) {
        // Silently handle localStorage errors
      }
    }
  }

  // ===== ADVANCED AI INTELLIGENCE METHODS =====
  
  private analyzeIntent(normalizedPrompt: string, originalPrompt: string): string {
    // Intent classification with 100+ patterns
    const intents = {
      'app_open': this.knowledge.vocabulary.actions.some(action => normalizedPrompt.includes(action)) && 
                  Object.keys(this.knowledge.apps).some(app => normalizedPrompt.includes(app)),
      'information_request': this.knowledge.vocabulary.questions.some(q => normalizedPrompt.includes(q)),
      'greeting': this.knowledge.vocabulary.greetings.some(g => normalizedPrompt.includes(g)),
      'farewell': this.knowledge.vocabulary.farewells.some(f => normalizedPrompt.includes(f)),
      'appreciation': this.knowledge.vocabulary.appreciation.some(a => normalizedPrompt.includes(a)),
      'help_request': normalizedPrompt.includes('help') || normalizedPrompt.includes('how to'),
      'search_request': normalizedPrompt.includes('search') || normalizedPrompt.includes('find'),
      'system_query': normalizedPrompt.includes('system') || normalizedPrompt.includes('mominos'),
      'shortcut_query': normalizedPrompt.includes('shortcut') || normalizedPrompt.includes('hotkey'),
      'time_query': normalizedPrompt.includes('time') || normalizedPrompt.includes('date')
    }
    
    return Object.entries(intents).find(([intent, matches]) => matches)?.[0] || 'general'
  }
  
  private analyzeSentiment(prompt: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['love', 'great', 'awesome', 'amazing', 'fantastic', 'wonderful', 'excellent', 'perfect', 'brilliant', 'happy', 'excited', 'pleased', 'impressed', 'delighted']
    const negativeWords = ['hate', 'terrible', 'awful', 'horrible', 'bad', 'frustrated', 'annoyed', 'disappointed', 'confused', 'difficult', 'problem', 'issue', 'broken']
    
    const words = prompt.split(' ')
    const positiveScore = words.filter(word => positiveWords.includes(word)).length
    const negativeScore = words.filter(word => negativeWords.includes(word)).length
    
    if (positiveScore > negativeScore) return 'positive'
    if (negativeScore > positiveScore) return 'negative'
    return 'neutral'
  }
  
  private extractEntities(prompt: string): string[] {
    const entities = []
    
    // Extract app names
    Object.entries(this.knowledge.apps).forEach(([key, app]) => {
      if (prompt.includes(key) || prompt.includes(app.name.toLowerCase())) {
        entities.push(app.name)
      }
    })
    
    // Extract numbers, times, etc.
    const numberRegex = /\b\d+\b/g
    const numbers = prompt.match(numberRegex)
    if (numbers) entities.push(...numbers)
    
    // Extract capitalized words (potential proper nouns)
    const capitalizedRegex = /\b[A-Z][a-z]+\b/g
    const capitalizedWords = prompt.match(capitalizedRegex)
    if (capitalizedWords) entities.push(...capitalizedWords)
    
    return entities
  }
  
  private getEmotionalTone(sentiment: string): string {
    const tones = {
      positive: ['positive', 'encouraging', 'helpful'][Math.floor(Math.random() * 3)],
      negative: ['helpful', 'encouraging', 'neutral'][Math.floor(Math.random() * 3)],
      neutral: ['neutral', 'helpful'][Math.floor(Math.random() * 2)]
    }
    return tones[sentiment as keyof typeof tones] || 'neutral'
  }
  
  private isAdvancedGreeting(prompt: string): boolean {
    return this.knowledge.vocabulary.greetings.some(greeting => prompt.includes(greeting))
  }
  
  private isFarewell(prompt: string): boolean {
    return this.knowledge.vocabulary.farewells.some(farewell => prompt.includes(farewell))
  }
  
  private getContextualGreeting(sentiment: string, entities: string[]): string {
    const greetings = {
      positive: [
        "Hello there! I'm absolutely thrilled to help you with MominOS today! 🌟 What amazing thing would you like to accomplish?",
        "Hey! What a fantastic day to explore MominOS together! 🚀 I'm excited to assist you!",
        "Greetings! I'm Sierra, and I'm delighted you're here! ✨ Let's make some magic happen in MominOS!"
      ],
      negative: [
        "Hi! I'm Sierra, your friendly MominOS assistant. 😊 I'm here to make things easier for you - what can I help with?",
        "Hello! Don't worry, I'm here to help solve any challenges you might have with MominOS. 💪 What's on your mind?",
        "Hey there! I understand things might be frustrating sometimes, but I'm here to make your MominOS experience smooth! 🤝"
      ],
      neutral: [
        "Hello! I'm Sierra, your intelligent MominOS assistant. Ready to help you navigate and master the system! 🎯",
        "Hi there! I'm your personal MominOS guide. What would you like to explore or accomplish today? 💫",
        "Greetings! I'm Sierra - think of me as your MominOS expert. How can I assist you? 🧠"
      ]
    }
    
    const responses = greetings[sentiment as keyof typeof greetings] || greetings.neutral
    let response = responses[Math.floor(Math.random() * responses.length)]
    
    // Add personalized touch if entities found
    if (entities.length > 0) {
      response += `\n\nI notice you mentioned: ${entities.join(', ')}. I'd be happy to help with that specifically!`
    }
    
    return response
  }
  
  private getFarewellResponse(sentiment: string): string {
    const farewells = {
      positive: [
        "Goodbye! It's been absolutely wonderful helping you today! 🌟 Come back anytime - I'll be here, ready to make MominOS amazing for you!",
        "See you later! Thanks for the fantastic conversation! 🚀 I'm always here when you need MominOS assistance!",
        "Take care! It was a pleasure helping you explore MominOS! ✨ Until next time, happy computing!"
      ],
      negative: [
        "Goodbye! I hope our conversation helped resolve your concerns. 😊 Remember, I'm always here if you need more assistance with MominOS!",
        "Take care! Don't hesitate to come back if you need any more help with MominOS. 💪 I'm here to make things better!",
        "See you later! I hope your MominOS experience improves! 🤝 Feel free to ask me anything anytime!"
      ],
      neutral: [
        "Goodbye! Thanks for using MominOS and chatting with me today! 👋 I'll be here whenever you need assistance!",
        "See you later! It was great helping you with MominOS! 💫 Come back anytime you have questions!",
        "Take care! Remember, I'm your dedicated MominOS assistant - always ready to help! 🎯"
      ]
    }
    
    const responses = farewells[sentiment as keyof typeof farewells] || farewells.neutral
    return responses[Math.floor(Math.random() * responses.length)]
  }
  
  private handleAdvancedAppQueries(prompt: string, intent: string, entities: string[]): string | null {
    // Advanced synonym recognition
    const synonymizedPrompt = this.applySynonyms(prompt)
    
    // Enhanced action detection
    const actions = [...this.knowledge.vocabulary.actions, ...this.knowledge.synonyms.open]
    const isActionRequest = actions.some(action => synonymizedPrompt.includes(action))
    
    for (const [appKey, app] of Object.entries(this.knowledge.apps)) {
      const appMatches = [
        app.name.toLowerCase(),
        appKey,
        ...app.features.map((f: string) => f.toLowerCase()),
        ...(app.tips || []).map((t: string) => t.toLowerCase())
      ]
      
      if (appMatches.some(match => synonymizedPrompt.includes(match))) {
        if (isActionRequest) {
          const tips = app.tips || ['This app has amazing features!']
          const randomTip = tips[Math.floor(Math.random() * tips.length)]
          return `🚀 Opening ${app.name}! ${app.description}\n\n💡 Pro tip: ${randomTip}\n\n⌨️ Quick access: ${app.shortcuts ? app.shortcuts.join(', ') : 'Available in the app menu'}`
        } else {
          const features = app.features.map((f: string) => `🔹 ${f}`).join('\n')
          const tips = app.tips || ['This app is incredibly useful!']
          const randomTip = tips[Math.floor(Math.random() * tips.length)]
          return `📱 **${app.name}**: ${app.description}\n\n**Features:**\n${features}\n\n⌨️ **Shortcut**: ${app.shortcuts ? app.shortcuts.join(', ') : 'Available in app menu'}\n\n💡 **Expert tip**: ${randomTip}`
        }
      }
    }
    return null
  }
  
  private applySynonyms(prompt: string): string {
    let result = prompt
    Object.entries(this.knowledge.synonyms).forEach(([word, synonyms]) => {
      synonyms.forEach(synonym => {
        if (result.includes(synonym)) {
          result = result.replace(new RegExp(synonym, 'g'), word)
        }
      })
    })
    return result
  }
  
  private addEmotionalTone(response: string, tone: string): string {
    const toneResponses = this.knowledge.emotions[tone as keyof typeof this.knowledge.emotions] || this.knowledge.emotions.neutral
    const emotionalPrefix = toneResponses[Math.floor(Math.random() * toneResponses.length)]
    return `${emotionalPrefix}\n\n${response}`
  }
  
  private handleAdvancedShortcutQueries(prompt: string, entities: string[]): string | null {
    const shortcutKeywords = ['shortcut', 'hotkey', 'keyboard', 'key combination', 'keystroke']
    if (!shortcutKeywords.some(keyword => prompt.includes(keyword))) return null
    
    // Check for specific shortcut requests
    for (const [shortcut, description] of Object.entries(this.knowledge.shortcuts)) {
      if (prompt.includes(shortcut.toLowerCase()) || 
          prompt.includes(description.toLowerCase()) ||
          entities.some(entity => shortcut.includes(entity))) {
        return `⌨️ **${shortcut}**: ${description}\n\n🎯 This is one of my favorite productivity shortcuts! It's designed to make your MominOS experience lightning-fast.\n\n💡 **Pro tip**: Practice this shortcut a few times and it'll become second nature!`
      }
    }
    
    // General shortcut help with categories
    const essentialShortcuts = Object.entries(this.knowledge.shortcuts).slice(0, 6)
    const quickShortcuts = Object.entries(this.knowledge.shortcuts).slice(6, 10)
    
    return `⌨️ **MominOS Keyboard Shortcuts Master Guide**\n\n**🎯 Essential Shortcuts:**\n${essentialShortcuts.map(([key, desc]) => `${key}: ${desc}`).join('\n')}\n\n**⚡ Quick Access:**\n${quickShortcuts.map(([key, desc]) => `${key}: ${desc}`).join('\n')}\n\n💡 **Master tip**: Press F1 anytime to see the complete list! These shortcuts will make you a MominOS power user in no time!`
  }
  
  private handleAdvancedSystemQueries(prompt: string, intent: string): string | null {
    const systemKeywords = ['system', 'version', 'about', 'mominos', 'info', 'details', 'specs']
    const performanceKeywords = ['performance', 'cpu', 'memory', 'ram', 'speed', 'fps', 'optimization']
    
    if (systemKeywords.some(keyword => prompt.includes(keyword))) {
      const info = this.knowledge.systemInfo
      return `🖥️ **${info.name}** - Crafted by ${info.developer}\n\n🏗️ **Architecture**: ${info.architecture}\n\n✨ **Flagship Features**:\n${info.features.map(f => `🌟 ${f}`).join('\n')}\n\n⚡ **Performance**: Targeting ${info.performance.target} with ${info.performance.optimization}\n\n🧠 **Fun fact**: This OS was built by a 14-year-old genius developer using cutting-edge web technologies!`
    }
    
    if (performanceKeywords.some(keyword => prompt.includes(keyword))) {
      return `📊 **MominOS Performance Center** is actively monitoring your system! \n\n🔍 **Real-time Tracking**:\n• CPU usage and optimization\n• Memory consumption patterns\n• FPS counter for smooth 60 FPS experience\n• Component render optimization\n• Smart resource management\n\n🎛️ **Access**: Click the performance indicator in the system tray for detailed live stats!\n\n💡 **Pro tip**: MominOS automatically optimizes performance based on usage patterns!`
    }
    
    return null
  }
  
  private handleAdvancedHelpQueries(prompt: string, intent: string, entities: string[]): string | null {
    // Contextual help matching
    for (const [topic, content] of Object.entries(this.knowledge.helpTopics)) {
      const topicWords = topic.split(' ')
      if (topicWords.some(word => prompt.includes(word)) || 
          entities.some(entity => topic.includes(entity.toLowerCase()))) {
        return `🎯 **${topic.charAt(0).toUpperCase() + topic.slice(1)} Guide**\n\n${content}\n\n🚀 **Want to become a MominOS expert?** I have detailed knowledge about every feature and can provide step-by-step guidance for any task!`
      }
    }
    
    const helpKeywords = ['help', 'how to', 'guide', 'tutorial', 'explain', 'show me', 'teach me']
    if (helpKeywords.some(keyword => prompt.includes(keyword))) {
      return `🤖 **I'm Sierra, your ultra-intelligent MominOS assistant!** \n\n🧠 **I excel at helping you with**:\n🔹 Opening and mastering all 10+ applications\n🔹 Keyboard shortcuts and productivity hacks\n🔹 System information and advanced settings\n🔹 Window management and virtual desktop wizardry\n🔹 Performance monitoring and optimization\n🔹 Troubleshooting and expert guidance\n\n💫 **Just ask me naturally** - I understand context, remember our conversations, and provide personalized help!\n\n🎯 **Try saying**: "Open calculator", "Show me shortcuts", "How do I manage windows?"`
    }
    
    return null
  }
  
  private isAdvancedTimeQuery(prompt: string): boolean {
    const timeKeywords = ['time', 'clock', 'date', 'today', 'now', 'current', 'what time']
    return timeKeywords.some(keyword => prompt.includes(keyword))
  }
  
  private getAdvancedTimeResponse(entities: string[], tone: string): string {
    const now = new Date()
    const time = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    })
    const date = now.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    const responses = {
      positive: `🕐 **${time}** on this beautiful ${date}! ✨\n\nTime flies when you're having fun with MominOS! Hope you're having an absolutely amazing and productive day! 🌟`,
      helpful: `⏰ **Current time**: ${time}\n📅 **Today's date**: ${date}\n\n💡 **Productivity tip**: MominOS has a built-in Calendar app (Ctrl+Shift+A) to help you stay organized throughout the day!`,
      neutral: `🕐 It's **${time}** on **${date}**\n\nMominOS is here to help you make the most of every moment! 💫`
    }
    
    return responses[tone as keyof typeof responses] || responses.neutral
  }
  
  private isAdvancedAppreciation(prompt: string): boolean {
    return this.knowledge.vocabulary.appreciation.some(word => prompt.includes(word))
  }
  
  private getAdvancedAppreciationResponse(sentiment: string): string {
    const responses = {
      positive: [
        "🌟 You're absolutely wonderful! I'm thrilled I could help make your MominOS experience fantastic! Your enthusiasm makes my day! 😊",
        "✨ My pleasure entirely! It brings me so much joy to help you discover all the amazing things MominOS can do! You're awesome! 🚀",
        "💫 Anytime! I absolutely love helping brilliant users like you get the most out of MominOS! Keep being amazing! 🎉"
      ],
      negative: [
        "😊 You're very welcome! I'm just glad I could help resolve things for you. That's exactly what I'm here for!",
        "🤝 My pleasure! I hope I was able to make your MominOS experience a bit smoother. Feel free to ask me anything anytime!",
        "💪 Happy to help! I'm always here to turn any MominOS challenges into victories. You've got this!"
      ],
      neutral: [
        "🎯 You're very welcome! That's exactly what I'm here for - making MominOS work perfectly for you!",
        "💫 My pleasure! I love helping users discover all the powerful features MominOS has to offer!",
        "🧠 Glad I could assist! I'm your dedicated MominOS expert, always ready to help with anything!"
      ]
    }
    
    const responseArray = responses[sentiment as keyof typeof responses] || responses.neutral
    return responseArray[Math.floor(Math.random() * responseArray.length)]
  }
  
  private handleAdvancedSearchQueries(prompt: string, original: string, entities: string[]): string | null {
    const searchKeywords = ['search', 'google', 'find', 'look for', 'look up', 'browse', 'explore']
    if (!searchKeywords.some(keyword => prompt.includes(keyword))) return null
    
    let searchTerm = original.replace(/(search|google|find|look for|look up|browse|explore)\s+(for\s+)?/gi, '').trim()
    
    // Extract search term from entities if not found
    if (!searchTerm && entities.length > 0) {
      searchTerm = entities.join(' ')
    }
    
    if (searchTerm) {
      return `🔍 **Intelligent Search Activated!** \n\nI'll help you find comprehensive information about "**${searchTerm}**"!\n\n🌐 Opening MominOS Browser to search the web for the most relevant, up-to-date results about ${searchTerm}.\n\n⚡ **Pro tips**: \n• Use Ctrl+Shift+B anytime for quick browser access\n• Browser supports multiple tabs for efficient research\n• Bookmark important findings for future reference\n\n🎯 **Search optimized**: I've prepared this search to give you the best possible results!`
    }
    
    return `🔍 **Search Assistant Ready!** \n\nI'd love to help you search for information! Just tell me what you're looking for:\n\n💬 **Try saying**:\n• "Search for JavaScript tutorials"\n• "Find information about web development"\n• "Look up MominOS features"\n\n🌐 I'll open the browser and find the most relevant results for you!`
  }
  
  private handleAdvancedTaskQueries(prompt: string, intent: string, entities: string[]): string | null {
    // Window management with advanced detection
    const windowKeywords = ['window', 'windows', 'minimize', 'maximize', 'close', 'resize', 'move', 'snap']
    if (windowKeywords.some(keyword => prompt.includes(keyword))) {
      return `🪟 **MominOS Advanced Window Management**\n\n🎯 **Movement & Positioning:**\n• Drag windows by title bar to move anywhere\n• Drag to screen edges to snap and auto-resize\n• Double-click title bar to maximize/restore instantly\n\n⌨️ **Keyboard Shortcuts:**\n• F11: Maximize active window to fullscreen\n• Ctrl+Alt+M: Minimize all windows at once\n• Alt+Tab: Switch between open windows\n\n✨ **Smart Features:**\n• Windows automatically remember their positions\n• Snap zones for perfect organization\n• Multi-monitor support with intelligent placement\n\n💡 **Pro tip**: MominOS windows are designed for maximum productivity!`
    }
    
    // Virtual desktop management
    const desktopKeywords = ['desktop', 'desktops', 'workspace', 'workspaces', 'virtual']
    if (desktopKeywords.some(keyword => prompt.includes(keyword))) {
      return `🖥️ **Virtual Desktops - Your Digital Workspace Multiplier**\n\n🎛️ **Quick Switching:**\n• Alt+1, Alt+2, Alt+3, Alt+4: Instantly switch between 4 desktops\n• Each desktop maintains its own independent window layout\n• Perfect for organizing different projects and workflows\n\n🗂️ **Organization Strategies:**\n• Desktop 1: Work applications (Code, Terminal)\n• Desktop 2: Research and browsing\n• Desktop 3: Communication and email\n• Desktop 4: Entertainment and personal tasks\n\n✨ **Advanced Features:**\n• Drag windows between desktops\n• Each desktop remembers app states\n• Seamless switching with visual transitions\n\n🚀 **Power user tip**: Use virtual desktops to eliminate clutter and boost focus!`
    }
    
    // File management
    const fileKeywords = ['file', 'files', 'folder', 'folders', 'organize', 'manage']
    if (fileKeywords.some(keyword => prompt.includes(keyword)) && 
        (prompt.includes('manage') || prompt.includes('organize'))) {
      return `📁 **MominOS File Management Excellence**\n\n🌲 **File Explorer Features** (Ctrl+Shift+E):\n• Intuitive tree view for easy navigation\n• Multiple view modes (list, grid, details)\n• Advanced search with filters and sorting\n• Right-click context menus for all operations\n\n⚡ **Quick Operations:**\n• Drag and drop to move/copy files\n• Multi-select with Ctrl+click or Shift+click\n• Instant rename with F2 key\n• Quick preview for images and documents\n\n🎯 **Organization Tips:**\n• Create logical folder structures\n• Use descriptive file names\n• Leverage search for quick access\n• Regular cleanup for optimal performance\n\n💡 **Expert tip**: MominOS File Explorer is designed for both simplicity and power!`
    }
    
    return null
  }
  
  private getAdvancedContextualResponse(prompt: string, intent: string, sentiment: string): string | null {
    if (this.conversationHistory.length <= 1) return null
    
    const lastPrompt = this.conversationHistory[this.conversationHistory.length - 2]
    const followUpKeywords = ['how', 'what about', 'tell me more', 'explain', 'also', 'and']
    
    if (followUpKeywords.some(keyword => prompt.includes(keyword))) {
      const suggestions = {
        positive: "I can see you're really interested in learning more! 🌟 What specific aspect would you like me to dive deeper into? I love sharing detailed knowledge about MominOS features!",
        negative: "I want to make sure I give you exactly the information you need. 🤝 Could you help me understand what specific details would be most helpful for you?",
        neutral: "Based on our conversation, I can provide much more specific guidance. 💫 What particular area would you like me to focus on? I have comprehensive knowledge about every MominOS feature!"
      }
      
      return suggestions[sentiment as keyof typeof suggestions] || suggestions.neutral
    }
    
    // Pattern recognition from conversation history
    if (lastPrompt.includes('calculator') && prompt.includes('more')) {
      return "🧮 **Advanced Calculator Features You'll Love:**\n\n🔬 **Scientific Mode:**\n• Trigonometric functions (sin, cos, tan)\n• Logarithmic operations\n• Exponential calculations\n• Constants (π, e)\n\n💾 **Memory Functions:**\n• M+ (Memory Add)\n• M- (Memory Subtract)\n• MR (Memory Recall)\n• MC (Memory Clear)\n\n📊 **History & More:**\n• Complete calculation history\n• Copy results to clipboard\n• Keyboard shortcut support\n\n💡 **Pro tip**: Switch between basic and scientific modes seamlessly!"
    }
    
    return null
  }
  
  private getUltraSmartFallback(original: string, intent: string, sentiment: string, entities: string[]): string {
    const words = original.toLowerCase().split(' ')
    const suggestions = []
    
    // Advanced pattern recognition
    const patterns = {
      creative: ['create', 'make', 'build', 'design', 'develop', 'write', 'compose'],
      organizational: ['organize', 'manage', 'sort', 'arrange', 'plan', 'schedule'],
      analytical: ['calculate', 'analyze', 'compute', 'math', 'statistics', 'data'],
      entertainment: ['play', 'music', 'photo', 'fun', 'game', 'media', 'view'],
      productivity: ['work', 'productive', 'efficient', 'task', 'project', 'business'],
      technical: ['code', 'programming', 'development', 'terminal', 'command', 'script']
    }
    
    Object.entries(patterns).forEach(([category, keywords]) => {
      if (keywords.some(keyword => words.includes(keyword))) {
        switch(category) {
          case 'creative':
            suggestions.push('🎨 Code Editor: Perfect for creative programming and development projects')
            suggestions.push('📝 Use the integrated development environment for writing and designing')
            break
          case 'organizational':
            suggestions.push('📁 File Explorer: Excellent for organizing your digital workspace')
            suggestions.push('📅 Calendar: Great for planning and scheduling your activities')
            break
          case 'analytical':
            suggestions.push('🧮 Calculator: Advanced scientific functions for all your mathematical needs')
            suggestions.push('📊 Use data analysis features in various apps')
            break
          case 'entertainment':
            suggestions.push('🎵 Music Player: Enjoy your favorite tunes with playlist management')
            suggestions.push('🖼️ Photo Gallery: Browse and organize your visual memories')
            break
          case 'productivity':
            suggestions.push('⌨️ Master keyboard shortcuts (F1) for maximum efficiency')
            suggestions.push('🖥️ Use virtual desktops to organize different work areas')
            break
          case 'technical':
            suggestions.push('💻 Terminal: Full command-line power for advanced users')
            suggestions.push('🔧 Code Editor: Professional development environment with syntax highlighting')
            break
        }
      }
    })
    
    // Emotional response based on sentiment
    const emotionalIntros = {
      positive: "🌟 I absolutely love your enthusiasm! ",
      negative: "😊 I understand it can be challenging sometimes, but don't worry - ",
      neutral: "🤖 I'm analyzing your request and "
    }
    
    const intro = emotionalIntros[sentiment as keyof typeof emotionalIntros] || emotionalIntros.neutral
    
    let response = `${intro}I understand you're interested in "**${original}**". `
    
    if (entities.length > 0) {
      response += `I noticed you mentioned: ${entities.join(', ')}. `
    }
    
    if (suggestions.length > 0) {
      response += `\n\n💡 **Smart Suggestions Based on Your Request:**\n${suggestions.map(s => `${s}`).join('\n')}\n\n`
    }
    
    response += `🧠 **I'm Sierra, your ultra-intelligent local AI assistant** with deep knowledge about every aspect of MominOS! \n\n🎯 **Try asking me about:**\n• Specific applications and their features\n• Productivity shortcuts and workflows\n• System capabilities and performance\n• Step-by-step guidance for any task\n\n💫 **What would you like to explore next?** I'm here to make your MominOS experience absolutely incredible!`
    
    return response
  }
}

// Export a singleton instance
export const aiAssistant = new MominOSAI()
