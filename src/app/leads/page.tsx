'use client'

import { useState } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Lead } from '@/types'
import { Plus, Upload, Search, Calendar } from 'lucide-react'
import { CSVImport } from '@/components/leads/CSVImport'

const mockLeads: Lead[] = [
  {
    id: '1',
    agent_id: '1',
    first_name: 'John Smith',
    phone_e164: '+1234567890',
    status: 'new',
    custom_fields: { company: 'Tech Corp', position: 'Manager' },
    schedule_at: '2024-01-16T10:00:00Z',
    attempts_count: 0,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    agent_id: '1',
    first_name: 'Sarah Johnson',
    phone_e164: '+1234567891',
    status: 'in_progress',
    custom_fields: { company: 'Health Plus', position: 'Director' },
    schedule_at: '2024-01-16T11:00:00Z',
    attempts_count: 2,
    disposition: 'no_answer',
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-01-15T15:00:00Z'
  },
  {
    id: '3',
    agent_id: '2',
    first_name: 'Mike Davis',
    phone_e164: '+1234567892',
    status: 'done',
    custom_fields: { company: 'Real Estate Co', budget: '$500k' },
    schedule_at: '2024-01-15T14:00:00Z',
    attempts_count: 1,
    disposition: 'completed',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T14:30:00Z'
  }
]

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads)
  const [showCSVImport, setShowCSVImport] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newLead, setNewLead] = useState({
    first_name: '',
    phone: '',
    agent_id: '1'
  })

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.phone_e164.includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleAddLead = () => {
    if (newLead.first_name && newLead.phone) {
      const lead: Lead = {
        id: Math.random().toString(36).substr(2, 9),
        agent_id: newLead.agent_id,
        first_name: newLead.first_name,
        phone_e164: newLead.phone.startsWith('+') ? newLead.phone : `+1${newLead.phone}`,
        status: 'new',
        custom_fields: {},
        schedule_at: new Date().toISOString(),
        attempts_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setLeads(prev => [...prev, lead])
      setNewLead({ first_name: '', phone: '', agent_id: '1' })
      setShowAddForm(false)
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

  return (
    <ProtectedRoute>
      <Layout>
      <div className="space-y-6">
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
              placeholder="Search leads by name or phone..."
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
        </div>

        {showAddForm && (
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-medium mb-4">Add New Lead</h3>
            <div className="grid grid-cols-3 gap-4">
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
              <div className="flex items-end space-x-2">
                <Button onClick={handleAddLead}>Add Lead</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
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
                  <TableCell>{lead.phone_e164}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                      {lead.status.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{lead.attempts_count}</span>
                    {lead.disposition && (
                      <div className="text-xs text-gray-500">{lead.disposition}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {Object.entries(lead.custom_fields).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium">{key}:</span> {value}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(lead.schedule_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Schedule Now
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <CSVImport
        isOpen={showCSVImport}
        onClose={() => setShowCSVImport(false)}
        onImport={(importedLeads) => {
          setLeads(prev => [...prev, ...importedLeads])
          setShowCSVImport(false)
        }}
      />
      </Layout>
    </ProtectedRoute>
  )
}