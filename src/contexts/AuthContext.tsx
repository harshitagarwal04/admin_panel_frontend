'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AuthState, AuthUser, AuthTokens, OnboardingData } from '@/types/auth'
import { AuthStorage } from '@/lib/auth-storage'
import { AuthAPI } from '@/lib/auth-api'

interface AuthContextType extends AuthState {
  login: (credential: string) => Promise<boolean>
  logout: () => Promise<void>
  completeOnboarding: (data: OnboardingData) => Promise<void>
  refreshTokens: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({
    user: null,
    tokens: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  })

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error, isLoading: false }))
  }, [])

  const setTokens = useCallback((tokens: AuthTokens) => {
    AuthStorage.setTokens(tokens)
    setState(prev => ({ 
      ...prev, 
      tokens, 
      isAuthenticated: true,
      error: null 
    }))
  }, [])

  const setUser = useCallback((user: AuthUser) => {
    AuthStorage.setUser(user)
    setState(prev => ({ 
      ...prev, 
      user,
      error: null 
    }))
  }, [])

  const refreshTokens = useCallback(async () => {
    const currentTokens = AuthStorage.getTokens()
    if (!currentTokens) {
      throw new Error('No refresh token available')
    }

    try {
      const newTokens = await AuthAPI.refreshToken(currentTokens.refresh_token)
      setTokens(newTokens)
    } catch (error) {
      AuthStorage.clearAll()
      setState({
        user: null,
        tokens: null,
        isLoading: false,
        isAuthenticated: false,
        error: 'Session expired. Please login again.',
      })
      throw error
    }
  }, [setTokens])

  const checkAndRefreshToken = useCallback(async () => {
    const tokens = AuthStorage.getTokens()
    if (!tokens) return false

    if (AuthStorage.isTokenExpired(tokens)) {
      try {
        await refreshTokens()
        return true
      } catch {
        return false
      }
    }

    if (AuthStorage.isTokenExpiringSoon(tokens)) {
      try {
        await refreshTokens()
      } catch {
        // Continue with current token if refresh fails
      }
    }

    return true
  }, [refreshTokens])

  const login = useCallback(async (credential: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Try to determine if credential is a JWT token or email
      const isJWTToken = credential.includes('.') && credential.split('.').length === 3
      
      // For development, always use test login with email
      // For production, try Google OAuth first, fallback to test login if it looks like an email
      const tokens = process.env.NODE_ENV === 'development' 
        ? await AuthAPI.testLogin(credential) // Use credential as email in dev
        : isJWTToken 
          ? await AuthAPI.googleLogin(credential) // Use as Google JWT token
          : await AuthAPI.testLogin(credential) // Fallback to test login with email
      
      setTokens(tokens)
      
      // Get user info to check profile completion status
      const user = await AuthAPI.getCurrentUser(tokens.access_token)
      setUser(user)
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        isAuthenticated: true 
      }))

      // Return true if onboarding is complete (has company)
      const hasCompany = user.company_id !== null
      return hasCompany
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed')
      return false
    }
  }, [setTokens, setUser, setError])

  const completeOnboarding = useCallback(async (data: OnboardingData) => {
    const tokens = AuthStorage.getTokens()
    if (!tokens) {
      throw new Error('No authentication token available')
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const updatedUser = await AuthAPI.completeProfile(data, tokens.access_token)
      setUser(updatedUser)
      setState(prev => ({ ...prev, isLoading: false }))
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Onboarding failed')
      throw error
    }
  }, [setUser, setError])

  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }))

    const tokens = AuthStorage.getTokens()
    if (tokens) {
      try {
        await AuthAPI.logout(tokens.access_token)
      } catch {
        // Continue with logout even if API call fails
      }
    }

    AuthStorage.clearAll()
    setState({
      user: null,
      tokens: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    })

    // Redirect to home page after logout
    router.push('/')
  }, [router])

  const initializeAuth = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }))

    const storedTokens = AuthStorage.getTokens()
    const storedUser = AuthStorage.getUser()

    if (!storedTokens) {
      setState(prev => ({ ...prev, isLoading: false }))
      return
    }

    try {
      // Always fetch fresh user data to check profile completion status
      const currentUser = await AuthAPI.getCurrentUser(storedTokens.access_token)
      setUser(currentUser)
      
      setState({
        user: currentUser,
        tokens: storedTokens,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      })
    } catch (error) {
      // Token might be invalid, clear everything
      AuthStorage.clearAll()
      setState({
        user: null,
        tokens: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      })
    }
  }, [])

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  useEffect(() => {
    if (!state.isAuthenticated || !state.tokens) return

    const interval = setInterval(async () => {
      try {
        await checkAndRefreshToken()
      } catch {
        // Token refresh failed, user will be logged out by checkAndRefreshToken
      }
    }, 5 * 60 * 1000) // Check every 5 minutes

    return () => clearInterval(interval)
  }, [state.isAuthenticated, state.tokens, checkAndRefreshToken])

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    completeOnboarding,
    refreshTokens,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}