
// Accessibility utilities for MominOS
export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  action: () => void
  description: string
}

export class AccessibilityManager {
  private shortcuts: Map<string, KeyboardShortcut> = new Map()
  private focusHistory: HTMLElement[] = []
  private announcer: HTMLElement | null = null

  constructor() {
    this.createScreenReaderAnnouncer()
    this.setupGlobalKeyboardListeners()
  }

  // Screen reader announcements
  private createScreenReaderAnnouncer(): void {
    this.announcer = document.createElement('div')
    this.announcer.setAttribute('aria-live', 'polite')
    this.announcer.setAttribute('aria-atomic', 'true')
    this.announcer.style.position = 'absolute'
    this.announcer.style.left = '-10000px'
    this.announcer.style.width = '1px'
    this.announcer.style.height = '1px'
    this.announcer.style.overflow = 'hidden'
    document.body.appendChild(this.announcer)
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (this.announcer) {
      this.announcer.setAttribute('aria-live', priority)
      this.announcer.textContent = message
    }
  }

  // Keyboard shortcuts
  registerShortcut(shortcut: KeyboardShortcut): void {
    const key = this.getShortcutKey(shortcut)
    this.shortcuts.set(key, shortcut)
  }

  private getShortcutKey(shortcut: KeyboardShortcut): string {
    const parts = []
    if (shortcut.ctrl) parts.push('ctrl')
    if (shortcut.alt) parts.push('alt')
    if (shortcut.shift) parts.push('shift')
    parts.push(shortcut.key.toLowerCase())
    return parts.join('+')
  }

  private setupGlobalKeyboardListeners(): void {
    document.addEventListener('keydown', (event) => {
      const key = this.getShortcutKey({
        key: event.key,
        ctrl: event.ctrlKey,
        alt: event.altKey,
        shift: event.shiftKey,
        action: () => {},
        description: ''
      })

      const shortcut = this.shortcuts.get(key)
      if (shortcut) {
        event.preventDefault()
        shortcut.action()
        this.announce(`Executed: ${shortcut.description}`)
      }
    })
  }

  // Focus management
  pushFocus(element: HTMLElement): void {
    this.focusHistory.push(document.activeElement as HTMLElement)
    element.focus()
  }

  popFocus(): void {
    const previousElement = this.focusHistory.pop()
    if (previousElement) {
      previousElement.focus()
    }
  }

  // Skip links
  createSkipLink(target: string, text: string): HTMLElement {
    const skipLink = document.createElement('a')
    skipLink.href = `#${target}`
    skipLink.textContent = text
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:rounded'
    skipLink.addEventListener('click', (e) => {
      e.preventDefault()
      const targetElement = document.getElementById(target)
      if (targetElement) {
        targetElement.focus()
        targetElement.scrollIntoView()
      }
    })
    return skipLink
  }

  // High contrast mode detection
  isHighContrastMode(): boolean {
    return window.matchMedia('(prefers-contrast: high)').matches
  }

  // Reduced motion detection
  prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  // Color scheme preference
  getColorSchemePreference(): 'light' | 'dark' {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
}

// ARIA utilities
export const aria = {
  describedBy: (id: string) => ({ 'aria-describedby': id }),
  labelledBy: (id: string) => ({ 'aria-labelledby': id }),
  expanded: (expanded: boolean) => ({ 'aria-expanded': expanded }),
  selected: (selected: boolean) => ({ 'aria-selected': selected }),
  current: (current: string) => ({ 'aria-current': current }),
  hidden: (hidden: boolean) => ({ 'aria-hidden': hidden }),
  live: (live: 'off' | 'polite' | 'assertive') => ({ 'aria-live': live }),
  busy: (busy: boolean) => ({ 'aria-busy': busy })
}

// Focus trap utility
export class FocusTrap {
  private container: HTMLElement
  private focusableElements: HTMLElement[] = []
  private firstFocusable: HTMLElement | null = null
  private lastFocusable: HTMLElement | null = null

  constructor(container: HTMLElement) {
    this.container = container
    this.updateFocusableElements()
  }

  private updateFocusableElements(): void {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ')

    this.focusableElements = Array.from(
      this.container.querySelectorAll(focusableSelectors)
    ) as HTMLElement[]

    this.firstFocusable = this.focusableElements[0] || null
    this.lastFocusable = this.focusableElements[this.focusableElements.length - 1] || null
  }

  activate(): void {
    this.container.addEventListener('keydown', this.handleKeyDown)
    if (this.firstFocusable) {
      this.firstFocusable.focus()
    }
  }

  deactivate(): void {
    this.container.removeEventListener('keydown', this.handleKeyDown)
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab') return

    if (event.shiftKey) {
      if (document.activeElement === this.firstFocusable) {
        event.preventDefault()
        this.lastFocusable?.focus()
      }
    } else {
      if (document.activeElement === this.lastFocusable) {
        event.preventDefault()
        this.firstFocusable?.focus()
      }
    }
  }
}
