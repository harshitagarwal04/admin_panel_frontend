'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Lead, Agent } from '@/types'
import { Plus, Upload, Search, Calendar, Phone } from 'lucide-react'
import { CSVImport } from '@/components/leads/CSVImport'
import { LeadAPI } from '@/lib/lead-api'
import { AgentAPI } from '@/lib/agent-api'
import { useAuth } from '@/contexts/AuthContext'

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [agentMap, setAgentMap] = useState<Record<string, string>>({}) // agent_id -> agent_name mapping
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCSVImport, setShowCSVImport] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [agentFilter, setAgentFilter] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newLead, setNewLead] = useState({
    first_name: '',
    phone: '',
    agent_id: ''
  })
  const { tokens } = useAuth()

  // Fetch leads and agents
  useEffect(() => {
    fetchData()
  }, [tokens])

  const fetchData = async () => {
    if (!tokens?.access_token) return

    try {
      setLoading(true)
      const [leadsResponse, agentsResponse] = await Promise.all([
        LeadAPI.getLeads(tokens.access_token, { per_page: 100 }),
        AgentAPI.getAgents(tokens.access_token)
      ])
      
      setLeads(leadsResponse.leads)
      setAgents(agentsResponse.agents)
      
      // Create agent mapping
      const mapping = agentsResponse.agents.reduce((acc, agent) => {
        acc[agent.id] = agent.name
        return acc
      }, {} as Record<string, string>)
      setAgentMap(mapping)
      
      // Set default agent for new lead form
      if (agentsResponse.agents.length > 0 && !newLead.agent_id) {
        setNewLead(prev => ({ ...prev, agent_id: agentsResponse.agents[0].id }))
      }
      
      setError(null)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.phone_e164.includes(searchTerm) ||
                         agentMap[lead.agent_id]?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
    const matchesAgent = agentFilter === 'all' || lead.agent_id === agentFilter
    return matchesSearch && matchesStatus && matchesAgent
  })

  const handleAddLead = async () => {
    if (!newLead.first_name || !newLead.phone || !newLead.agent_id || !tokens?.access_token) return

    try {
      const leadData = {
        agent_id: newLead.agent_id,
        first_name: newLead.first_name,
        phone_e164: newLead.phone.startsWith('+') ? newLead.phone : `+1${newLead.phone}`,
      }
      
      const createdLead = await LeadAPI.createLead(leadData, tokens.access_token)
      setLeads(prev => [...prev, createdLead])
      setNewLead({ first_name: '', phone: '', agent_id: agents.length > 0 ? agents[0].id : '' })
      setShowAddForm(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create lead')
    }
  }

  const handleScheduleCall = async (leadId: string) => {
    if (!tokens?.access_token) return

    try {
      await LeadAPI.scheduleCall(leadId, tokens.access_token)
      // Refresh leads to show updated status
      fetchData()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to schedule call')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'done': return 'bg-green-100 text-green-800'
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
            <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
            <p className="text-gray-600">Manage your sales leads and contacts</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setShowCSVImport(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads by name, phone, or agent..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <select
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
          >
            <option value="all">All Agents</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>{agent.name}</option>
            ))}
          </select>
        </div>

        {showAddForm && (
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-medium mb-4">Add New Lead</h3>
            <div className="grid grid-cols-4 gap-4">
              <Input
                label="First Name"
                value={newLead.first_name}
                onChange={(e) => setNewLead(prev => ({ ...prev, first_name: e.target.value }))}
                placeholder="Enter first name"
              />
              <Input
                label="Phone Number"
                value={newLead.phone}
                onChange={(e) => setNewLead(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1234567890"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign to Agent
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={newLead.agent_id}
                  onChange={(e) => setNewLead(prev => ({ ...prev, agent_id: e.target.value }))}
                >
                  <option value="">Select Agent</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>{agent.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end space-x-2">
                <Button onClick={handleAddLead} disabled={!newLead.first_name || !newLead.phone || !newLead.agent_id}>
                  Add Lead
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          {leads.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No leads found. Create your first lead to get started.</p>
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Custom Fields</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <div className="font-medium">{lead.first_name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Phone className="h-3 w-3 mr-1 text-gray-400" />
                      {lead.phone_e164}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center mr-2">
                        <span className="text-xs font-medium text-primary-800">
                          {agentMap[lead.agent_id]?.charAt(0) || 'A'}
                        </span>
                      </div>
                      <span className="text-sm font-medium">{agentMap[lead.agent_id] || 'Unknown Agent'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                      {lead.status.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{lead.attempts_count}</span>
                    {lead.disposition && (
                      <div className="text-xs text-gray-500 capitalize">{lead.disposition.replace('_', ' ')}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm max-w-xs">
                      {Object.entries(lead.custom_fields || {}).length > 0 ? (
                        Object.entries(lead.custom_fields).map(([key, value]) => (
                          <div key={key} className="truncate">
                            <span className="font-medium">{key}:</span> {String(value)}
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(lead.schedule_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleScheduleCall(lead.id)}
                      disabled={lead.status === 'done'}
                    >
                      {lead.status === 'done' ? 'Completed' : 'Schedule Now'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </div>
      </div>

      <CSVImport
        isOpen={showCSVImport}
        onClose={() => setShowCSVImport(false)}
        agents={agents}
        onImport={(importedLeads) => {
          // Refresh data to get the actual imported leads from backend
          fetchData()
          setShowCSVImport(false)
        }}
      />
      </Layout>
    </ProtectedRoute>
  )
}