import { AuthTokens, AuthUser } from '@/types/auth'

const TOKEN_KEY = 'voice_ai_tokens'
const USER_KEY = 'voice_ai_user'

export class AuthStorage {
  static setTokens(tokens: AuthTokens): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens))
    }
  }

  static getTokens(): AuthTokens | null {
    if (typeof window !== 'undefined') {
      const tokens = localStorage.getItem(TOKEN_KEY)
      if (tokens) {
        try {
          return JSON.parse(tokens)
        } catch {
          this.clearTokens()
          return null
        }
      }
    }
    return null
  }

  static clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY)
    }
  }

  static setUser(user: AuthUser): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    }
  }

  static getUser(): AuthUser | null {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem(USER_KEY)
      if (user) {
        try {
          return JSON.parse(user)
        } catch {
          this.clearUser()
          return null
        }
      }
    }
    return null
  }

  static clearUser(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_KEY)
    }
  }

  static clearAll(): void {
    this.clearTokens()
    this.clearUser()
  }

  static isTokenExpired(tokens: AuthTokens): boolean {
    return Date.now() >= tokens.expires_at
  }

  static isTokenExpiringSoon(tokens: AuthTokens, thresholdMinutes: number = 5): boolean {
    const thresholdMs = thresholdMinutes * 60 * 1000
    return Date.now() >= (tokens.expires_at - thresholdMs)
  }
}