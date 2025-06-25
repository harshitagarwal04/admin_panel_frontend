'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { useAuth } from '@/contexts/AuthContext'
import { 
  User, 
  HelpCircle, 
  Settings as SettingsIcon, 
  Webhook, 
  BarChart3,
  Mail,
  Phone,
  Calendar,
  Clock,
  Globe,
  ExternalLink,
  Copy,
  Trash2,
  Plus,
  Eye,
  EyeOff
} from 'lucide-react'

interface WebhookConfig {
  id: string
  name: string
  url: string
  events: string[]
  secret: string
  status: 'active' | 'inactive'
  created_at: string
}

interface AIDefaults {
  default_voice_id: string
  business_hours_start: string
  business_hours_end: string
  timezone: string
  max_call_duration: number
  retry_attempts: number
  retry_delay: number
}

interface UsageStats {
  current_plan: string
  calls_this_month: number
  calls_limit: number
  leads_this_month: number
  leads_limit: number
  phone_numbers: number
  phone_numbers_limit: number
  monthly_cost: number
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'support' | 'ai-defaults' | 'webhooks' | 'usage'>('profile')
  const [aiDefaults, setAIDefaults] = useState<AIDefaults>({
    default_voice_id: '',
    business_hours_start: '09:00',
    business_hours_end: '17:00',
    timezone: 'UTC',
    max_call_duration: 20,
    retry_attempts: 3,
    retry_delay: 30
  })
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([
    {
      id: '1',
      name: 'Call Events',
      url: 'https://api.example.com/webhooks/calls',
      events: ['call.started', 'call.completed', 'call.failed'],
      secret: 'whsec_1234567890abcdef',
      status: 'active',
      created_at: '2025-01-15T10:00:00Z'
    }
  ])
  const [usageStats, setUsageStats] = useState<UsageStats>({
    current_plan: 'Pro',
    calls_this_month: 1250,
    calls_limit: 5000,
    leads_this_month: 850,
    leads_limit: 10000,
    phone_numbers: 5,
    phone_numbers_limit: 25,
    monthly_cost: 127.50
  })
  const [showWebhookForm, setShowWebhookForm] = useState(false)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const { user } = useAuth()

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'support', name: 'Support', icon: HelpCircle },
    { id: 'ai-defaults', name: 'AI Defaults', icon: SettingsIcon },
    { id: 'webhooks', name: 'Webhooks', icon: Webhook },
    { id: 'usage', name: 'Usage', icon: BarChart3 },
  ]

  const toggleSecretVisibility = (webhookId: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [webhookId]: !prev[webhookId]
    }))
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.round((used / limit) * 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Manage your account and application preferences</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className={`mr-2 h-4 w-4 ${
                    activeTab === tab.id ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">User Profile</h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="h-10 w-10 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="text-xl font-medium text-gray-900">{user?.name || 'User Name'}</h4>
                    <p className="text-gray-600">{user?.email || 'user@example.com'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600">
                      {user?.name || 'John Doe'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600">
                      {user?.email || 'john@example.com'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600">
                      {user?.company_id || 'My Company'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600">
                      Administrator
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Profile information is managed by your system administrator. Contact support if you need to update your details.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Support Tab */}
          {activeTab === 'support' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Help & Support</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <HelpCircle className="h-5 w-5 text-blue-600 mr-2" />
                      <h4 className="font-medium">Documentation</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Comprehensive guides and API documentation
                    </p>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Docs
                    </Button>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Mail className="h-5 w-5 text-green-600 mr-2" />
                      <h4 className="font-medium">Email Support</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Get help from our support team
                    </p>
                    <Button variant="outline" size="sm">
                      <Mail className="h-3 w-3 mr-1" />
                      Contact Support
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">System Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Version:</span>
                    <span className="ml-2 text-gray-600">1.0.0</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">API Version:</span>
                    <span className="ml-2 text-gray-600">v1</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className="ml-2 text-green-600">Operational</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Defaults Tab */}
          {activeTab === 'ai-defaults' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">AI & Voice Defaults</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Voice</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500">
                      <option>Adrian (Male, US English)</option>
                      <option>Sarah (Female, US English)</option>
                      <option>James (Male, British English)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500">
                      <option>UTC</option>
                      <option>America/New_York</option>
                      <option>America/Los_Angeles</option>
                      <option>Europe/London</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Business Hours Start"
                    type="time"
                    value={aiDefaults.business_hours_start}
                    onChange={(e) => setAIDefaults(prev => ({ ...prev, business_hours_start: e.target.value }))}
                  />
                  
                  <Input
                    label="Business Hours End"
                    type="time"
                    value={aiDefaults.business_hours_end}
                    onChange={(e) => setAIDefaults(prev => ({ ...prev, business_hours_end: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Input
                    label="Max Call Duration (minutes)"
                    type="number"
                    min="5"
                    max="60"
                    value={aiDefaults.max_call_duration}
                    onChange={(e) => setAIDefaults(prev => ({ ...prev, max_call_duration: parseInt(e.target.value) }))}
                  />
                  
                  <Input
                    label="Retry Attempts"
                    type="number"
                    min="1"
                    max="10"
                    value={aiDefaults.retry_attempts}
                    onChange={(e) => setAIDefaults(prev => ({ ...prev, retry_attempts: parseInt(e.target.value) }))}
                  />
                  
                  <Input
                    label="Retry Delay (minutes)"
                    type="number"
                    min="15"
                    max="480"
                    value={aiDefaults.retry_delay}
                    onChange={(e) => setAIDefaults(prev => ({ ...prev, retry_delay: parseInt(e.target.value) }))}
                  />
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Button>Save AI Defaults</Button>
                </div>
              </div>
            </div>
          )}

          {/* Webhooks Tab */}
          {activeTab === 'webhooks' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Webhook Configuration</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Configure webhooks to receive real-time event notifications
                      </p>
                    </div>
                    <Button onClick={() => setShowWebhookForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Webhook
                    </Button>
                  </div>
                </div>

                {webhooks.length === 0 ? (
                  <div className="p-8 text-center">
                    <Webhook className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No webhooks configured</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Add a webhook to start receiving event notifications.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>Events</TableHead>
                        <TableHead>Secret</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {webhooks.map((webhook) => (
                        <TableRow key={webhook.id}>
                          <TableCell>
                            <div className="font-medium">{webhook.name}</div>
                            <div className="text-sm text-gray-500">
                              Created {new Date(webhook.created_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {webhook.url}
                            </code>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {webhook.events.map(event => (
                                <span key={event} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-1">
                                  {event}
                                </span>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                {showSecrets[webhook.id] ? webhook.secret : '•••••••••••••••••'}
                              </code>
                              <button
                                onClick={() => toggleSecretVisibility(webhook.id)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                {showSecrets[webhook.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                              </button>
                              <button
                                onClick={() => copyToClipboard(webhook.secret)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              webhook.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {webhook.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-3 w-3 mr-1" />
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          )}

          {/* Usage Tab */}
          {activeTab === 'usage' && (
            <div className="space-y-6">
              {/* Plan Overview */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Current Plan</h3>
                    <p className="text-sm text-gray-600">Your subscription and usage details</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{usageStats.current_plan}</div>
                    <div className="text-sm text-gray-600">${usageStats.monthly_cost}/month</div>
                  </div>
                </div>

                {/* Usage Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Calls This Month</span>
                      <Phone className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {usageStats.calls_this_month.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      of {usageStats.calls_limit.toLocaleString()} limit
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(usageStats.calls_this_month, usageStats.calls_limit))}`}
                        style={{ width: `${getUsagePercentage(usageStats.calls_this_month, usageStats.calls_limit)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {getUsagePercentage(usageStats.calls_this_month, usageStats.calls_limit)}% used
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Leads This Month</span>
                      <User className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {usageStats.leads_this_month.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      of {usageStats.leads_limit.toLocaleString()} limit
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(usageStats.leads_this_month, usageStats.leads_limit))}`}
                        style={{ width: `${getUsagePercentage(usageStats.leads_this_month, usageStats.leads_limit)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {getUsagePercentage(usageStats.leads_this_month, usageStats.leads_limit)}% used
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Phone Numbers</span>
                      <Phone className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {usageStats.phone_numbers}
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      of {usageStats.phone_numbers_limit} limit
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(usageStats.phone_numbers, usageStats.phone_numbers_limit))}`}
                        style={{ width: `${getUsagePercentage(usageStats.phone_numbers, usageStats.phone_numbers_limit)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {getUsagePercentage(usageStats.phone_numbers, usageStats.phone_numbers_limit)}% used
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Next Billing Date</label>
                    <div className="text-sm text-gray-900">December 23, 2025</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                    <div className="text-sm text-gray-900">•••• •••• •••• 4242</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  )
}