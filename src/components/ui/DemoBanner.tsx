'use client'

import { useDemoStatus } from '@/hooks/useDemo'
import { Button } from '@/components/ui/Button'
import { AlertTriangle, Target, Globe, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface BannerConfig {
  type: 'info' | 'warning' | 'critical'
  message: string
  action: string
  icon: React.ReactNode
}

export function DemoBanner() {
  const { data: demoStatus, isLoading, error } = useDemoStatus()
  const router = useRouter()

  // Don't show banner if not demo mode or loading/error
  if (isLoading || error || !demoStatus?.demo_mode) {
    return null
  }

  const getBannerConfig = (): BannerConfig => {
    // Global daily limit reached - highest priority
    if (demoStatus.global_calls_remaining <= 0) {
      return {
        type: 'critical',
        message: '🌐 Daily demo limit reached globally. Try again tomorrow or upgrade now.',
        action: 'Upgrade Now',
        icon: <Globe className="h-4 w-4" />
      }
    }
    
    // Company calls exhausted
    if (demoStatus.calls_remaining <= 0) {
      return {
        type: 'critical',
        message: `🚫 Demo limit reached (${demoStatus.calls_made}/${demoStatus.calls_limit} calls used).`,
        action: 'Upgrade to Continue',
        icon: <X className="h-4 w-4" />
      }
    }
    
    // Low calls warning
    if (demoStatus.calls_remaining <= 1) {
      return {
        type: 'warning',
        message: `⚠️ Only ${demoStatus.calls_remaining} demo call remaining! Upgrade to continue calling.`,
        action: 'Upgrade Now',
        icon: <AlertTriangle className="h-4 w-4" />
      }
    }
    
    // Normal demo mode
    return {
      type: 'info',
      message: `🎯 Demo Account: ${demoStatus.calls_remaining} of ${demoStatus.calls_limit} calls remaining`,
      action: 'Upgrade Now',
      icon: <Target className="h-4 w-4" />
    }
  }

  const config = getBannerConfig()

  const handleUpgradeClick = () => {
    router.push('/upgrade')
  }

  const bannerClasses = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-orange-50 border-orange-200 text-orange-800',
    critical: 'bg-red-50 border-red-200 text-red-800'
  }

  const buttonClasses = {
    info: 'bg-blue-600 hover:bg-blue-700 text-white',
    warning: 'bg-orange-600 hover:bg-orange-700 text-white', 
    critical: 'bg-red-600 hover:bg-red-700 text-white'
  }

  return (
    <div className={`flex items-center justify-between p-3 mb-4 border rounded-lg ${bannerClasses[config.type]}`}>
      <div className="flex items-center gap-2">
        {config.icon}
        <span className="font-medium text-sm">
          {config.message}
        </span>
      </div>
      
      <Button
        size="sm"
        className={`${buttonClasses[config.type]} h-8 px-3 text-xs font-medium`}
        onClick={handleUpgradeClick}
      >
        {config.action}
      </Button>
    </div>
  )
}