'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void
          renderButton: (element: HTMLElement, config: any) => void
          prompt: () => void
        }
      }
    }
  }
}

interface GoogleLoginButtonProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function GoogleLoginButton({ onSuccess, onError }: GoogleLoginButtonProps) {
  const { login, isLoading } = useAuth()
  const buttonRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      
      if (!clientId) {
        console.error('Google Client ID not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable.')
        onError?.('Google OAuth not configured. Please contact support.')
        return
      }
      
      if (window.google && !initialized.current) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          ux_mode: 'popup',
          redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || window.location.origin,
        })

        if (buttonRef.current) {
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with',
            shape: 'rectangular',
          })
        }

        initialized.current = true
      }
    }

    const handleCredentialResponse = async (response: any) => {
      try {
        if (!response?.credential) {
          throw new Error('No credential received from Google')
        }
        
        const requiresOnboarding = await login(response.credential)
        if (requiresOnboarding) {
          onSuccess?.()
        }
      } catch (error) {
        console.error('Google login error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Login failed'
        onError?.(errorMessage)
      }
    }

    if (window.google) {
      initializeGoogleSignIn()
    } else {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = initializeGoogleSignIn
      document.head.appendChild(script)

      return () => {
        document.head.removeChild(script)
      }
    }
  }, [login, onSuccess, onError])

  if (isLoading) {
    return (
      <div className="w-full h-12 bg-gray-100 rounded-md animate-pulse flex items-center justify-center">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div ref={buttonRef} className="w-full" />
    </div>
  )
}