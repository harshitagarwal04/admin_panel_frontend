'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Lead, Agent } from '@/types';
import { Plus, Upload, Search, Calendar, Phone, Clock, Square } from 'lucide-react';
import { CSVImport } from '@/components/leads/CSVImport';
import { AddLeadModal } from '@/components/leads/AddLeadModal';
import { useLeads, useCreateLead, useScheduleCall, useImportLeadsCSV, useStopLead } from '@/hooks/useLeads';
import { useAgents } from '@/hooks/useAgents';

export default function LeadsPage() {
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'new' | 'in_progress' | 'done' | 'stopped' | 'all'>('all');
  const [agentFilter, setAgentFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [schedulingLeadId, setSchedulingLeadId] = useState<string | null>(null);

  // Use cached queries
  const { data: leadsData, isLoading: leadsLoading, error: leadsError } = useLeads({
    status_filter: statusFilter === 'all' ? undefined : statusFilter,
    agent_id: agentFilter === 'all' ? undefined : agentFilter,
    search: searchTerm || undefined,
    per_page: 100
  });

  const { data: agentsData, isLoading: agentsLoading } = useAgents();
  const agents = agentsData?.agents ? agentsData.agents.agents : [];

  // Mutations
  const createLeadMutation = useCreateLead();
  const scheduleCallMutation = useScheduleCall();
  const importCSVMutation = useImportLeadsCSV();
  const stopLeadMutation = useStopLead();

  const leads = leadsData?.leads || [];
  const loading = leadsLoading || agentsLoading;
  const error = leadsError?.message || null;

  // Create agent mapping for display
  const agentMap = agents.reduce((acc, agent) => {
    acc[agent.id] = agent.name;
    return acc;
  }, {} as Record<string, string>);

  // Filtering is now done by the query itself, so we use leads directly
  const filteredLeads = leads;

  const handleAddLead = (leadData: any) => {
    createLeadMutation.mutate(leadData, {
      onSuccess: () => {
        setShowAddModal(false);
      }
    });
  };

  const handleScheduleCall = (leadId: string) => {
    setSchedulingLeadId(leadId);
    scheduleCallMutation.mutate(leadId, {
      onSuccess: () => {
        setSchedulingLeadId(null);
      },
      onError: () => {
        setSchedulingLeadId(null);
      }
    });
  };

  const handleStopLead = (leadId: string) => {
    stopLeadMutation.mutate({ leadId, disposition: 'not_interested' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'done': return 'bg-green-100 text-green-800';
      case 'stopped': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'New';
      case 'in_progress': return 'In Progress';
      case 'done': return 'Done';
      case 'stopped': return 'Stopped';
      default: return status;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
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
              <Button onClick={() => setShowAddModal(true)}>
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
              onChange={(e) => setStatusFilter(e.target.value as 'new' | 'in_progress' | 'done' | 'stopped' | 'all')}
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
              <option value="stopped">Stopped</option>
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
                          {getStatusText(lead.status)}
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
                        <div className="flex items-center space-x-2">
                          {lead.status === 'in_progress' && (
                            <div className="flex items-center text-blue-600">
                              <Clock className="h-4 w-4 mr-1 animate-pulse" />
                              <span className="text-xs">Calling...</span>
                            </div>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleScheduleCall(lead.id)}
                            disabled={lead.status === 'done' || lead.status === 'in_progress' || lead.status === 'stopped' || schedulingLeadId === lead.id}
                          >
                            {schedulingLeadId === lead.id ? 'Scheduling...' :
                             lead.status === 'done' ? 'Completed' :
                             lead.status === 'stopped' ? 'Stopped' :
                             lead.status === 'in_progress' ? 'In Progress' :
                             'Schedule Now'}
                          </Button>
                          {lead.status === 'in_progress' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStopLead(lead.id)}
                              disabled={stopLeadMutation.isPending}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <Square className="h-3 w-3 mr-1" />
                              {stopLeadMutation.isPending ? 'Stopping...' : 'Stop'}
                            </Button>
                          )}
                        </div>
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
          onImport={() => {
            // Cache will automatically refresh with new data
            setShowCSVImport(false);
          }}
        />

        <AddLeadModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddLead}
          agents={agents}
          isLoading={createLeadMutation.isPending}
        />
      </Layout>
    </ProtectedRoute>
  );
}