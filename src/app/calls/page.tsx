'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { InteractionAttempt, Agent } from '@/types'
import { Phone, Download, Search, Calendar, Clock, FileText, RefreshCw } from 'lucide-react'
import { CallDetailModal } from '@/components/calls/CallDetailModal'
import { formatDuration, formatDate } from '@/lib/utils'
import { CallAPI } from '@/lib/call-api'
import { AgentAPI } from '@/lib/agent-api'
import { useAuth } from '@/contexts/AuthContext'

interface CallHistoryItem {
  id: string
  lead_id: string
  agent_id: string
  lead_name: string
  lead_phone: string
  agent_name: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  outcome?: 'answered' | 'no_answer' | 'failed'
  duration_seconds?: number
  transcript_url?: string
  summary?: string
  created_at: string
}

interface CallMetrics {
  total_calls: number
  answered_calls: number
  no_answer_calls: number
  failed_calls: number
  pickup_rate: number
  average_attempts_per_lead: number
  active_agents: number
}

export default function CallsPage() {
  const [calls, setCalls] = useState<CallHistoryItem[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [metrics, setMetrics] = useState<CallMetrics | null>(null)
  const [selectedCall, setSelectedCall] = useState<CallHistoryItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date())
  const [filters, setFilters] = useState({
    agent_id: 'all',
    outcome: 'all',
    start_date: '',
    end_date: '',
    search: ''
  })
  const { tokens } = useAuth()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchData = useCallback(async () => {
    if (!tokens?.access_token) return

    try {
      setLoading(true)
      const [callsResponse, agentsResponse, metricsResponse] = await Promise.all([
        CallAPI.getCallHistory(tokens.access_token, { 
          per_page: 100,
          ...(filters.agent_id !== 'all' && { agent_id: filters.agent_id }),
          ...(filters.outcome !== 'all' && { outcome: filters.outcome as any }),
          ...(filters.start_date && { start_date: filters.start_date }),
          ...(filters.end_date && { end_date: filters.end_date }),
          ...(filters.search && { search: filters.search })
        }),
        AgentAPI.getAgents(tokens.access_token),
        CallAPI.getCallMetrics(tokens.access_token, {
          ...(filters.agent_id !== 'all' && { agent_id: filters.agent_id }),
          ...(filters.start_date && { start_date: filters.start_date }),
          ...(filters.end_date && { end_date: filters.end_date })
        })
      ])
      
      setCalls(callsResponse.calls as CallHistoryItem[])
      setAgents(agentsResponse.agents)
      setMetrics(metricsResponse)
      setError(null)
      setLastRefreshTime(new Date())
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [tokens, filters])

  // Fetch data and sync call history on mount or when tokens change
  useEffect(() => {
    const syncAndFetch = async () => {
      if (!tokens?.access_token) return
      try {
        await CallAPI.syncCallHistory(tokens.access_token)
      } catch (error) {
        // Optionally handle sync error, but continue to fetch data
      }
      fetchData()
    }
    syncAndFetch()
  }, [tokens, fetchData])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefreshEnabled || !tokens?.access_token) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Set up interval for auto-refresh
    intervalRef.current = setInterval(async () => {
      try {
        // Sync call history first to get latest data
        await CallAPI.syncCallHistory(tokens.access_token)
        await fetchData()
        setLastRefreshTime(new Date())
      } catch (error) {
        console.error('Auto-refresh error:', error)
        // Continue with fetch even if sync fails
        await fetchData()
        setLastRefreshTime(new Date())
      }
    }, 30000) // 30 seconds

    // Cleanup interval on unmount or when auto-refresh is disabled
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [autoRefreshEnabled, tokens, fetchData])

  // Manual refresh function
  const handleManualRefresh = async () => {
    if (!tokens?.access_token) return
    try {
      await CallAPI.syncCallHistory(tokens.access_token)
      await fetchData()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to refresh data')
    }
  }

  // Apply filters when they change
  useEffect(() => {
    if (tokens?.access_token) {
      fetchData()
    }
  }, [filters, tokens, fetchData])

  const filteredCalls = calls.filter(call => {
    const matchesSearch = !filters.search || 
      call.summary?.toLowerCase().includes(filters.search.toLowerCase()) ||
      call.lead_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      call.lead_phone?.includes(filters.search) ||
      call.agent_name?.toLowerCase().includes(filters.search.toLowerCase())
    
    return matchesSearch
  })

  const getOutcomeColor = (outcome?: string) => {
    switch (outcome) {
      case 'answered': return 'bg-green-100 text-green-800'
      case 'no_answer': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="space-y-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="grid grid-cols-4 gap-4 mb-8">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <Layout>
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Call History</h1>
            <p className="text-gray-600">View and analyze all call interactions</p>
            {autoRefreshEnabled && (
              <div className="flex items-center mt-1 text-sm text-gray-500">
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Auto-refresh every 30s • Last updated: {lastRefreshTime.toLocaleTimeString()}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
              className={autoRefreshEnabled ? 'bg-green-50 border-green-200 text-green-700' : ''}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${autoRefreshEnabled ? 'animate-spin' : ''}`} />
              {autoRefreshEnabled ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </Button>
            <Button variant="outline" onClick={handleManualRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Now
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Phone className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Calls</p>
                <p className="text-2xl font-bold text-gray-900">{metrics?.total_calls || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">%</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Pick-up Rate</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(metrics?.pickup_rate || 0)}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Avg Attempts</p>
                <p className="text-2xl font-bold text-gray-900">{metrics?.average_attempts_per_lead?.toFixed(1) || '0'}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold">#</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Active Agents</p>
                <p className="text-2xl font-bold text-gray-900">{metrics?.active_agents || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agent</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                value={filters.agent_id}
                onChange={(e) => setFilters(prev => ({ ...prev, agent_id: e.target.value }))}
              >
                <option value="all">All Agents</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Outcome</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                value={filters.outcome}
                onChange={(e) => setFilters(prev => ({ ...prev, outcome: e.target.value }))}
              >
                <option value="all">All Outcomes</option>
                <option value="answered">Answered</option>
                <option value="no_answer">No Answer</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                value={filters.start_date}
                onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                value={filters.end_date}
                onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search leads, agents, summary..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          {calls.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No call history found.</p>
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date/Time</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCalls.map((call) => (
                <TableRow key={call.id} className="cursor-pointer hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(call.created_at)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center mr-2">
                        <span className="text-xs font-medium text-primary-800">
                          {call.agent_name?.charAt(0) || 'A'}
                        </span>
                      </div>
                      <span className="text-sm font-medium">{call.agent_name || 'Unknown Agent'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm font-medium">{call.lead_name || 'Unknown Lead'}</div>
                      <div className="text-xs text-gray-500">ID: {call.lead_id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Phone className="h-3 w-3 mr-1 text-gray-400" />
                      <span className="text-sm">{call.lead_phone || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      call.status === 'completed' ? 'bg-green-100 text-green-800' :
                      call.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      call.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {call.status?.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell>
                    {call.outcome ? (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getOutcomeColor(call.outcome)}`}>
                        {call.outcome?.replace('_', ' ')}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Clock className="h-3 w-3 mr-1" />
                      {call.duration_seconds ? formatDuration(call.duration_seconds) : '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate text-sm">
                      {call.summary || 'No summary available'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {call.transcript_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(call.transcript_url, '_blank')}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Recording
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCall(call)}
                      >
                        Details
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </div>
      </div>

      {selectedCall && (
        <CallDetailModal
          call={selectedCall as any} // Convert CallHistoryItem to InteractionAttempt
          isOpen={!!selectedCall}
          onClose={() => setSelectedCall(null)}
        />
      )}
      </Layout>
    </ProtectedRoute>
  )
}