'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Agent } from '@/types'
import { Plus, Phone, Settings, Play, Pause, Search, MoreHorizontal } from 'lucide-react'
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
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
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

  const handleAgentUpdated = (updatedAgent: Agent) => {
    setAgents(prev => prev.map(agent => 
      agent.id === updatedAgent.id ? updatedAgent : agent
    ))
    setEditingAgent(null)
  }

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent)
  }

  return (
    <ProtectedRoute>
      <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">All Agents</h1>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>
            <Button variant="outline">
              Import
            </Button>
            <Button onClick={() => setShowWizard(true)} variant="dark">
              Create an Agent
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200">
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
            <TableHeader className="bg-gray-50">
              <TableRow className="border-b border-gray-200">
                <TableHead className="font-medium text-gray-700 py-3">Agent Name</TableHead>
                <TableHead className="font-medium text-gray-700 py-3">Agent Type</TableHead>
                <TableHead className="font-medium text-gray-700 py-3">Voice</TableHead>
                <TableHead className="font-medium text-gray-700 py-3">Phone</TableHead>
                <TableHead className="font-medium text-gray-700 py-3">Edited by</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id} className="hover:bg-gray-50 border-b border-gray-100">
                  <TableCell className="py-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${agent.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <div>
                        <div className="font-medium text-gray-900">{agent.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="text-sm text-gray-600">Multi Prompt</span>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-amber-800">A</span>
                      </div>
                      <span className="text-sm text-gray-900">
                        {agent.voice_id && voices[agent.voice_id] 
                          ? voices[agent.voice_id] 
                          : 'Adrian'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    {agent.outbound_phone ? (
                      <span className="text-sm text-blue-600">{agent.outbound_phone}</span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="text-sm text-gray-600">
                      {agent.created_at ? (
                        <>
                          {new Date(agent.created_at).toLocaleDateString('en-US', {
                            month: '2-digit',
                            day: '2-digit',
                            year: 'numeric'
                          })}, {new Date(agent.created_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                          })}
                        </>
                      ) : 'Unknown'}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex justify-end">
                      <button 
                        onClick={() => handleEditAgent(agent)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
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

      {editingAgent && (
        <AgentWizard
          isOpen={!!editingAgent}
          onClose={() => setEditingAgent(null)}
          onComplete={handleAgentUpdated}
          editingAgent={editingAgent}
        />
      )}
      </Layout>
    </ProtectedRoute>
  )
}