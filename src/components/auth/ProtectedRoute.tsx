'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingSpinner } from './LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireOnboarding?: boolean
}

export function ProtectedRoute({ children, requireOnboarding = true }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login')
        return
      }

      if (requireOnboarding && user && !user.company_id) {
        router.push('/onboarding')
        return
      }

      if (!requireOnboarding && user && user.company_id) {
        router.push('/agents')
        return
      }
    }
  }, [isAuthenticated, isLoading, user, router, requireOnboarding])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return <LoadingSpinner text="Redirecting to login..." />
  }

  if (requireOnboarding && user && !user.company_id) {
    return <LoadingSpinner text="Redirecting to onboarding..." />
  }

  if (!requireOnboarding && user && user.company_id) {
    return <LoadingSpinner text="Redirecting..." />
  }

  return <>{children}</>
}