'use client'

import { useState } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { InteractionAttempt } from '@/types'
import { Phone, Download, Search, Calendar, Clock } from 'lucide-react'
import { CallDetailModal } from '@/components/calls/CallDetailModal'
import { formatDuration, formatDate } from '@/lib/utils'

const mockCalls: InteractionAttempt[] = [
  {
    id: '1',
    lead_id: '1',
    agent_id: '1',
    attempt_number: 1,
    status: 'completed',
    outcome: 'answered',
    summary: 'Lead was interested in healthcare consultation. Scheduled appointment for next week.',
    duration_seconds: 180,
    transcript_url: 'https://example.com/transcript1',
    raw_webhook_data: {},
    retell_call_id: 'retell_123',
    created_at: '2024-01-16T10:30:00Z',
    updated_at: '2024-01-16T10:33:00Z'
  },
  {
    id: '2',
    lead_id: '2',
    agent_id: '1',
    attempt_number: 2,
    status: 'completed',
    outcome: 'no_answer',
    summary: 'No answer. Will retry according to schedule.',
    duration_seconds: 30,
    raw_webhook_data: {},
    retell_call_id: 'retell_124',
    created_at: '2024-01-16T11:00:00Z',
    updated_at: '2024-01-16T11:00:30Z'
  },
  {
    id: '3',
    lead_id: '3',
    agent_id: '2',
    attempt_number: 1,
    status: 'completed',
    outcome: 'answered',
    summary: 'Real estate lead showed interest in downtown properties. Provided budget information.',
    duration_seconds: 420,
    transcript_url: 'https://example.com/transcript3',
    raw_webhook_data: {},
    retell_call_id: 'retell_125',
    created_at: '2024-01-16T14:15:00Z',
    updated_at: '2024-01-16T14:22:00Z'
  }
]

export default function CallsPage() {
  const [calls, setCalls] = useState<InteractionAttempt[]>(mockCalls)
  const [selectedCall, setSelectedCall] = useState<InteractionAttempt | null>(null)
  const [filters, setFilters] = useState({
    agent: 'all',
    outcome: 'all',
    dateFrom: '',
    dateTo: '',
    search: ''
  })

  const filteredCalls = calls.filter(call => {
    const matchesAgent = filters.agent === 'all' || call.agent_id === filters.agent
    const matchesOutcome = filters.outcome === 'all' || call.outcome === filters.outcome
    const matchesSearch = !filters.search || 
      call.summary?.toLowerCase().includes(filters.search.toLowerCase())
    
    return matchesAgent && matchesOutcome && matchesSearch
  })

  const getOutcomeColor = (outcome?: string) => {
    switch (outcome) {
      case 'answered': return 'bg-green-100 text-green-800'
      case 'no_answer': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const metrics = {
    totalCalls: calls.length,
    pickupRate: Math.round((calls.filter(c => c.outcome === 'answered').length / calls.length) * 100),
    avgAttempts: Math.round(calls.reduce((sum, c) => sum + c.attempt_number, 0) / calls.length * 10) / 10,
    activeAgents: new Set(calls.map(c => c.agent_id)).size
  }

  return (
    <ProtectedRoute>
      <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Call History</h1>
            <p className="text-gray-600">View and analyze all call interactions</p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Phone className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Calls</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalCalls}</p>
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
                <p className="text-2xl font-bold text-gray-900">{metrics.pickupRate}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Avg Attempts</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.avgAttempts}</p>
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
                <p className="text-2xl font-bold text-gray-900">{metrics.activeAgents}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agent</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                value={filters.agent}
                onChange={(e) => setFilters(prev => ({ ...prev, agent: e.target.value }))}
              >
                <option value="all">All Agents</option>
                <option value="1">Healthcare Lead Qualifier</option>
                <option value="2">Real Estate Appointment Setter</option>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search summaries..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date/Time</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead>Attempt #</TableHead>
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
                    <span className="text-sm">
                      {call.agent_id === '1' ? 'Healthcare Lead Qualifier' : 'Real Estate Appointment Setter'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">Lead #{call.lead_id}</span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      #{call.attempt_number}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getOutcomeColor(call.outcome)}`}>
                      {call.outcome?.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Clock className="h-3 w-3 mr-1" />
                      {call.duration_seconds ? formatDuration(call.duration_seconds) : 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate text-sm">
                      {call.summary || 'No summary available'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCall(call)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedCall && (
        <CallDetailModal
          call={selectedCall}
          isOpen={!!selectedCall}
          onClose={() => setSelectedCall(null)}
        />
      )}
      </Layout>
    </ProtectedRoute>
  )
}