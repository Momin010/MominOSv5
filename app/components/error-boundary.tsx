"use client"

import React from "react"
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
  errorId?: string
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; errorInfo?: React.ErrorInfo; resetError: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

class Logger {
  private static logs: Array<{ timestamp: Date; level: string; message: string; data?: any }> = []

  static log(level: 'info' | 'warn' | 'error', message: string, data?: any) {
    const logEntry = {
      timestamp: new Date(),
      level,
      message,
      data
    }

    this.logs.push(logEntry)
    console[level](message, data)

    // Keep only last 100 logs
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100)
    }

    // Store in localStorage for persistence
    try {
      localStorage.setItem('mominos_logs', JSON.stringify(this.logs))
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  static getLogs() {
    return this.logs
  }

  static exportLogs() {
    const logsText = this.logs
      .map(log => `[${log.timestamp.toISOString()}] ${log.level.toUpperCase()}: ${log.message}${log.data ? '\n' + JSON.stringify(log.data, null, 2) : ''}`)
      .join('\n')

    const blob = new Blob([logsText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mominos-logs-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }
}

export { Logger }

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount = 0
  private maxRetries = 3

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    return { 
      hasError: true, 
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name,
      retryCount: this.retryCount,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    Logger.log('error', 'ErrorBoundary caught an error', errorDetails)

    this.setState({ errorInfo })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Send error to analytics service (if available)
    this.reportError(error, errorDetails)
  }

  private async reportError(error: Error, details: any) {
    try {
      // In a real app, send to your error reporting service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(details)
      // })

      // Error reported to analytics service
    } catch (reportingError) {
      Logger.log('error', 'Failed to report error', reportingError)
    }
  }

  resetError = () => {
    this.retryCount++
    Logger.log('info', `Resetting error boundary (attempt ${this.retryCount})`)

    if (this.retryCount > this.maxRetries) {
      Logger.log('warn', 'Max retry attempts reached, full page reload recommended')
    }

    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      errorId: undefined 
    })
  }

  reloadPage = () => {
    Logger.log('info', 'Performing full page reload due to error')
    window.location.reload()
  }

  goHome = () => {
    Logger.log('info', 'Navigating to home due to error')
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return (
        <FallbackComponent 
          error={this.state.error} 
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
          reloadPage={this.reloadPage}
          goHome={this.goHome}
          retryCount={this.retryCount}
          maxRetries={this.maxRetries}
          errorId={this.state.errorId}
        />
      )
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error?: Error
  errorInfo?: React.ErrorInfo
  resetError: () => void
  reloadPage?: () => void
  goHome?: () => void
  retryCount?: number
  maxRetries?: number
  errorId?: string
}

function DefaultErrorFallback({ 
  error, 
  errorInfo, 
  resetError, 
  reloadPage, 
  goHome,
  retryCount = 0,
  maxRetries = 3,
  errorId
}: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = React.useState(false)

  const handleExportLogs = () => {
    Logger.exportLogs()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black flex items-center justify-center p-4">
      <div className="glass-panel p-8 max-w-2xl w-full">
        <div className="text-center mb-6">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Oops! Something went wrong</h1>
          <p className="text-gray-300">
            We encountered an unexpected error. Don't worry, your data is safe.
          </p>
          {errorId && (
            <p className="text-sm text-gray-500 mt-2">Error ID: {errorId}</p>
          )}
        </div>

        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
          <h3 className="text-red-300 font-medium mb-2">Error Details:</h3>
          <p className="text-red-200 text-sm font-mono">
            {error?.message || "Unknown error occurred"}
          </p>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-red-300 hover:text-red-200 mt-2 p-0 h-auto"
          >
            {showDetails ? 'Hide' : 'Show'} technical details
          </Button>

          {showDetails && (
            <div className="mt-4 p-3 bg-black/30 rounded text-xs text-gray-400 font-mono overflow-auto max-h-32">
              <div>Stack trace:</div>
              <pre className="whitespace-pre-wrap">{error?.stack}</pre>
              {errorInfo && (
                <>
                  <div className="mt-2">Component stack:</div>
                  <pre className="whitespace-pre-wrap">{errorInfo.componentStack}</pre>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          {retryCount < maxRetries ? (
            <Button onClick={resetError} className="bg-blue-600 hover:bg-blue-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          ) : (
            <div className="text-center w-full mb-4">
              <p className="text-yellow-300 text-sm mb-3">
                Multiple retry attempts failed. Try a full page reload.
              </p>
            </div>
          )}

          <Button onClick={reloadPage} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reload Page
          </Button>

          <Button onClick={goHome} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>

          <Button onClick={handleExportLogs} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
            <Bug className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-700 text-center">
          <p className="text-gray-400 text-sm">
            If this error persists, please contact support with the error ID above.
          </p>
        </div>
      </div>
    </div>
  )
}