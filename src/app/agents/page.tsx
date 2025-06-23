'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Agent } from '@/types'
import { Plus, Phone, Settings, Play, Pause } from 'lucide-react'
import { AgentWizard } from '@/components/agents/AgentWizard'
import { AgentAPI } from '@/lib/agent-api'
import { useAuth } from '@/contexts/AuthContext'

const mockAgents: Agent[] = [
  {
    id: '1',
    company_id: '1',
    name: 'Healthcare Lead Qualifier',
    status: 'active',
    prompt: 'You are a friendly healthcare assistant...',
    variables: { service_type: 'consultation', health_concern: 'general' },
    welcome_message: 'Hello! I\'m calling from HealthCare Corp...',
    voice_id: 'us-english-female',
    functions: ['check_calendar_availability', 'book_on_calendar', 'end_call'],
    inbound_phone: '+1234567890',
    outbound_phone: '+1234567890',
    max_attempts: 5,
    retry_delay_minutes: 60,
    business_hours_start: '09:00',
    business_hours_end: '17:00',
    timezone: 'UTC',
    max_call_duration_minutes: 15,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    company_id: '1',
    name: 'Real Estate Appointment Setter',
    status: 'inactive',
    prompt: 'Hi, this is from Real Estate Pro...',
    variables: { property_type: 'house', location: 'downtown' },
    welcome_message: 'Hi! This is from Real Estate Pro...',
    voice_id: 'us-english-male',
    functions: ['check_calendar_availability', 'book_on_calendar', 'transfer_call'],
    outbound_phone: '+1234567891',
    max_attempts: 4,
    retry_delay_minutes: 45,
    business_hours_start: '08:00',
    business_hours_end: '19:00',
    timezone: 'UTC',
    max_call_duration_minutes: 20,
    created_at: '2024-01-15T11:00:00Z',
    updated_at: '2024-01-15T11:00:00Z'
  }
]

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [voices, setVoices] = useState<Record<string, string>>({}) // voice_id -> voice_name mapping
  const [showWizard, setShowWizard] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { tokens } = useAuth()

  const fetchAgents = async () => {
    if (!tokens?.access_token) return

    try {
      setLoading(true)
      const [agentsResponse, voicesResponse] = await Promise.all([
        AgentAPI.getAgents(tokens.access_token),
        AgentAPI.getVoices(tokens.access_token)
      ])
      
      setAgents(agentsResponse.agents)
      
      // Create voice mapping
      const voiceMap = voicesResponse.reduce((acc, voice) => {
        acc[voice.id] = voice.name
        return acc
      }, {} as Record<string, string>)
      setVoices(voiceMap)
      
      setError(null)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch agents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAgents()
  }, [tokens])

  const toggleAgentStatus = async (agentId: string) => {
    if (!tokens?.access_token) return

    try {
      await AgentAPI.toggleAgentStatus(agentId, tokens.access_token)
      
      // Update local state
      setAgents(prev => prev.map(agent => 
        agent.id === agentId 
          ? { ...agent, status: agent.status === 'active' ? 'inactive' : 'active' }
          : agent
      ))
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to toggle agent status')
    }
  }

  const handleAgentCreated = (newAgent: Agent) => {
    setAgents(prev => [...prev, newAgent])
    setShowWizard(false)
  }

  return (
    <ProtectedRoute>
      <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Agents</h1>
            <p className="text-gray-600">Manage your voice AI sales agents</p>
          </div>
          <Button onClick={() => setShowWizard(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Agent
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading agents...</p>
            </div>
          ) : agents.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No agents found. Create your first agent to get started.</p>
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Voice</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{agent.name}</div>
                      <div className="text-sm text-gray-500">
                        Max {agent.max_attempts} attempts, {agent.retry_delay_minutes}min delay
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {agent.inbound_phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1 text-green-600" />
                          {agent.inbound_phone}
                        </div>
                      )}
                      {agent.outbound_phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1 text-blue-600" />
                          {agent.outbound_phone}
                        </div>
                      )}
                      {!agent.inbound_phone && !agent.outbound_phone && (
                        <div className="text-sm text-gray-500">No phone numbers</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {agent.voice_id && voices[agent.voice_id] 
                        ? voices[agent.voice_id] 
                        : agent.voice_id || 'No voice selected'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggleAgentStatus(agent.id)}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        agent.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {agent.status === 'active' ? (
                        <Play className="h-3 w-3 mr-1" />
                      ) : (
                        <Pause className="h-3 w-3 mr-1" />
                      )}
                      {agent.status}
                    </button>
                  </TableCell>
                  <TableCell>
                    {agent.created_at ? new Date(agent.created_at).toLocaleDateString() : 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Test
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

      <AgentWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onComplete={handleAgentCreated}
      />
      </Layout>
    </ProtectedRoute>
  )
}