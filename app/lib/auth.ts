// Authentication utilities for MominOS
import { createHash } from 'crypto'

export interface User {
  id: string
  name: string
  username: string
  avatar?: string
  passwordHash: string
  role: 'admin' | 'user' | 'guest'
  lastLogin?: Date
}

// Simple password hashing (in production, use bcrypt)
export const hashPassword = (password: string): string => {
  return createHash('sha256').update(password).digest('hex')
}

export const validatePassword = (inputPassword: string, storedHash: string): boolean => {
  const inputHash = hashPassword(inputPassword)
  return inputHash === storedHash
}

// Mock user database (in production, use real database)
export const users: User[] = [
  {
    id: "1",
    name: "Administrator",
    username: "admin",
    avatar: "/placeholder.svg?height=80&width=80",
    passwordHash: hashPassword("admin123"), // Default password
    role: "admin",
  },
  {
    id: "2", 
    name: "Guest User",
    username: "guest",
    passwordHash: hashPassword("guest123"), // Default password
    role: "guest",
  },
]

export const authenticateUser = (username: string, password: string): User | null => {
  const user = users.find(u => u.username === username)
  if (!user) return null
  
  if (validatePassword(password, user.passwordHash)) {
    return {
      ...user,
      lastLogin: new Date()
    }
  }
  
  return null
}

export const getUserById = (id: string): User | null => {
  return users.find(u => u.id === id) || null
}

export const getUserByUsername = (username: string): User | null => {
  return users.find(u => u.username === username) || null
} 