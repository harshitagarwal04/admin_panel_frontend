'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { ContactSupport } from '@/components/ui/ContactSupport'
import { 
  Bot, 
  Users, 
  Phone, 
  History, 
  Settings, 
  LogOut,
  User,
  LayoutGrid,
  PhoneCall,
  Upload,
  Lightbulb,
  BarChart3
} from 'lucide-react'

const navigation = [
  // CalliQ items first
  { name: 'CALL IQ', type: 'section' },
  { name: 'Dashboard', href: '/calliq/dashboard', icon: LayoutGrid },
  { name: 'Calls', href: '/calliq/calls', icon: PhoneCall },
  { name: 'Upload', href: '/calliq/upload', icon: Upload },
  { name: 'Insights', href: '/calliq/insights', icon: Lightbulb },
  { name: 'Analytics', href: '/calliq/analytics', icon: BarChart3 },
  
  // VoiceAI items second
  { name: 'VoiceAI', type: 'section' },
  { name: 'Agents', href: '/agents', icon: Bot },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Call History', href: '/calls', icon: History },
  { name: 'Phone Numbers', href: '/phone', icon: Phone },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout, isLoading } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex h-16 shrink-0 items-center px-6">
        <h1 className="text-white text-xl font-bold">ConversAI Labs</h1>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {navigation.map((item, index) => {
            // Section headers
            if (item.type === 'section') {
              return (
                <div key={item.name} className={cn(
                  "px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider",
                  index > 0 && "mt-6"
                )}>
                  {item.name === 'CALL IQ' ? (
                    <span className="calliq-brand-white">{item.name}</span>
                  ) : (
                    item.name
                  )}
                </div>
              )
            }

            // Navigation links
            const isActive = pathname.startsWith(item.href!)
            return (
              <Link
                key={item.name}
                href={item.href!}
                className={cn(
                  'group flex items-center px-3 py-2 rounded-md text-sm font-medium',
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                )}
              >
                {item.icon && (
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 shrink-0',
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                    )}
                  />
                )}
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="border-t border-gray-700 p-4 space-y-2">
        {user && (
          <div className="flex items-center px-3 py-2 text-sm text-gray-300">
            <User className="mr-3 h-4 w-4 text-gray-400" />
            <div className="truncate">
              <div className="font-medium">{user.name}</div>
              <div className="text-xs text-gray-400 truncate">{user.email}</div>
            </div>
          </div>
        )}
        <ContactSupport />
        <button 
          onClick={handleLogout}
          disabled={isLoading}
          className="group flex w-full items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50"
        >
          <LogOut className="mr-3 h-5 w-5 shrink-0 text-gray-400 group-hover:text-white" />
          {isLoading ? 'Signing out...' : 'Sign out'}
        </button>
      </div>
    </div>
  )
}