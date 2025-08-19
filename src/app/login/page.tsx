'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { error: authError, clearError, login } = useAuth()
  const router = useRouter()

  const handleLoginSuccess = () => {
    clearError()
    setError(null)
    router.push('/agents')
  }

  const handleLoginError = (errorMessage: string) => {
    setError(errorMessage)
  }

  const handleTestLogin = async () => {
    if (!email) {
      setError('Please enter an email address')
      return
    }

    setIsLoading(true)
    try {
      const hasCompany = await login(email)
      if (hasCompany) {
        router.push('/agents')
      } else {
        router.push('/onboarding')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const displayError = error || authError

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      {/* Demo CallIQ Button - Top Right */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => router.push('/demo/calliq/dashboard')}
          className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View CalliQ Demo
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold text-gray-900">
          ConversAI Labs Admin Panel
        </h1>
        <h2 className="mt-6 text-center text-2xl font-medium text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Manage your AI sales agents and leads
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {displayError && (
            <div className="mb-6 rounded-md bg-red-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Authentication Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {displayError}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {process.env.NODE_ENV === 'development' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Development Login
                </label>
                <div className="space-y-3">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isLoading) {
                        e.preventDefault()
                        handleTestLogin()
                      }
                    }}
                  />
                  <Button 
                    onClick={handleTestLogin}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Signing in...' : 'Sign in with Email'}
                  </Button>
                </div>
              </div>
            )}

            {process.env.NODE_ENV !== 'development' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Sign in with Google
                </label>
                <GoogleLoginButton
                  onSuccess={handleLoginSuccess}
                  onError={handleLoginError}
                />
              </div>
            )}

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    {process.env.NODE_ENV === 'development' 
                      ? 'Development mode - use any email'
                      : 'Secure authentication via Google OAuth'
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                By signing in, you agree to our terms of service and privacy policy.
                Your data is securely stored and never shared with third parties.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact support at{' '}
            <a href="mailto:connect@conversailabs.com" className="text-primary-600 hover:text-primary-500">
              connect@conversailabs.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}