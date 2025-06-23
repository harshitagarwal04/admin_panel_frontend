'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingSpinner } from '@/components/auth/LoadingSpinner'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (user && user.company_id) {
        router.push('/agents')
      } else if (user && !user.company_id) {
        router.push('/onboarding')
      }
    }
  }, [isAuthenticated, isLoading, user, router])

  if (isLoading) {
    return <LoadingSpinner text="Loading..." />
  }

  return null
}