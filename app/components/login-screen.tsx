
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Lock, Eye, EyeOff, Power, AlertCircle } from "lucide-react"
import { authenticateUser, getUserByUsername, users, type User } from "@/app/lib/auth"

interface LoginScreenProps {
  onLogin: (user: User) => void
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [time, setTime] = useState(new Date())
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  // Get available users 
  const availableUsers = users

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (availableUsers.length > 0) {
      setSelectedUser(availableUsers[0])
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!selectedUser || !password) {
      setError("Please select a user and enter password")
      setIsLoading(false)
      return
    }

    try {
      // Simulate network delay for security
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const authenticatedUser = authenticateUser(selectedUser.username, password)
      
      if (authenticatedUser) {
        onLogin(authenticatedUser)
      } else {
        setError("Invalid username or password")
      }
    } catch (err) {
      setError("Authentication failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserSelect = (user: typeof availableUsers[0]) => {
    setSelectedUser(user)
    setError("") // Clear error when user changes
  }

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Blurred Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/wallpaper.jpg')`,
          filter: 'blur(20px)',
          transform: 'scale(1.1)', // Slightly scale to hide blur edges
        }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* System Info Corners */}
      <div className="absolute top-4 left-4 text-white/80 text-sm z-10">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span>MominOS v2.1.0</span>
        </div>
        <div>Build 20240130</div>
      </div>

      <div className="absolute top-4 right-4 flex items-center gap-4 text-white/80 text-sm z-10">
        <div className="flex items-center gap-1">
          <img src="/icons/wifi.svg" className="w-4 h-4" alt="WiFi" />
          <span>Connected</span>
        </div>
        <div className="flex items-center gap-1">
          <img src="/icons/battery-full.svg" className="w-4 h-4" alt="Battery" />
          <span>87%</span>
        </div>
        <div className="flex items-center gap-1">
          <img src="/icons/sound.svg" className="w-4 h-4" alt="Sound" />
        </div>
      </div>

      <div className="absolute bottom-4 left-4 text-white/80 text-sm z-10">
        <div>
          {time.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      <div className="absolute bottom-4 right-4 text-white/80 text-sm z-10">
        <div>
          {time.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </div>
      </div>

      {/* Main Login Interface */}
      <div className="relative z-20 flex items-center justify-center h-full">
        <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl w-96 p-8">
          {/* Welcome Message */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-green-400 rounded-full flex items-center justify-center shadow-lg">
                <Lock className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome to MominOS</h1>
            <p className="text-white/70">Select a user and enter password</p>
          </div>

          {/* User Selection */}
          <div className="flex justify-center gap-4 mb-6">
            {availableUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
                  selectedUser?.id === user.id
                    ? "bg-purple-600/30 border-2 border-purple-400/50"
                    : "border-2 border-transparent hover:bg-white/10"
                }`}
              >
                <Avatar className="w-16 h-16">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-purple-500/20 text-purple-300">
                    <Lock className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-white text-sm font-medium">{user.name}</span>
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          {/* Login Form */}
          {selectedUser && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-purple-400/50 focus:bg-white/15 transition-all duration-200 pr-10"
                  autoFocus
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full bg-purple-600/30 hover:bg-purple-600/40 border border-purple-400/30 text-white font-medium py-2.5 rounded-xl transition-all duration-200 backdrop-blur-sm"
                disabled={!password || isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          )}

          {/* Additional Options */}
          <div className="flex items-center justify-between mt-6 text-sm">
            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
              Forgot Password?
            </Button>
            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
              <Lock className="w-4 h-4 mr-1" />
              Switch User
            </Button>
          </div>
        </div>
      </div>

      {/* Power Options */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="sm" className="text-white/70 hover:text-white flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Power className="w-4 h-4" />
            </div>
            <span className="text-xs">Sleep</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-white/70 hover:text-white flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Power className="w-4 h-4" />
            </div>
            <span className="text-xs">Restart</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-white/70 hover:text-white flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Power className="w-4 h-4" />
            </div>
            <span className="text-xs">Shut Down</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
