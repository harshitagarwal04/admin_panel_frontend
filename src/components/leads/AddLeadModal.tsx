'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { Agent } from '@/types';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (leadData: any) => void;
  agents: Agent[];
  isLoading?: boolean;
}

export function AddLeadModal({ isOpen, onClose, onSubmit, agents, isLoading }: AddLeadModalProps) {
  const [newLead, setNewLead] = useState({
    first_name: '',
    phone: '',
    agent_id: ''
  });
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  // Get selected agent's variables
  const selectedAgent = agents.find((a) => a.id === newLead.agent_id);
  const allAgentVariables: string[] = selectedAgent?.variables ? Object.keys(selectedAgent.variables) : [];
  const agentVariables = allAgentVariables;

  // Phone number validation
  const isValidPhone = (phone: string): boolean => {
    if (!phone) return false;
    
    // Basic validation patterns for major countries
    const patterns = {
      '+1': /^\+1[2-9]\d{9}$/,     // US/Canada: +1 + 10 digits starting with 2-9
      '+44': /^\+44[1-9]\d{8,9}$/,  // UK: +44 + 9-10 digits
      '+91': /^\+91[6-9]\d{9}$/,    // India: +91 + 10 digits starting with 6-9
    };
    
    // Check if phone starts with any known pattern
    for (const [code, pattern] of Object.entries(patterns)) {
      if (phone.startsWith(code)) {
        return pattern.test(phone);
      }
    }
    
    // Basic fallback validation: + followed by 7-15 digits
    return /^\+\d{7,15}$/.test(phone);
  };

  const isFormValid = () => {
    return (
      newLead.first_name.trim() !== '' &&
      newLead.agent_id !== '' &&
      newLead.phone.trim() !== '' &&
      isValidPhone(newLead.phone)
    );
  };

  const handleSubmit = () => {
    if (!isFormValid()) return;

    const leadData = {
      agent_id: newLead.agent_id,
      first_name: newLead.first_name,
      phone_e164: newLead.phone,
      custom_fields: {
        // Include all agent variables
        ...allAgentVariables.reduce((acc, key) => {
          acc[key] = variableValues[key] || '';
          return acc;
        }, {} as Record<string, string>),
      },
    };

    onSubmit(leadData);
  };

  const handleClose = () => {
    // Reset form when closing
    setNewLead({
      first_name: '',
      phone: '',
      agent_id: ''
    });
    setVariableValues({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Lead" size="lg">
      <div className="space-y-6">
        {/* Step 1: Agent Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assign to Agent
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={newLead.agent_id}
            onChange={(e) => {
              setNewLead((prev) => ({ ...prev, agent_id: e.target.value }));
              setVariableValues({}); // Reset variable values when agent changes
            }}
          >
            <option value="">Select Agent</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
        </div>

        {/* Step 2: Lead Details - Only show after agent is selected */}
        {newLead.agent_id && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={newLead.first_name}
                onChange={(e) => setNewLead((prev) => ({ ...prev, first_name: e.target.value }))}
                placeholder="Enter first name"
              />
              <PhoneInput
                label="Phone Number"
                value={newLead.phone}
                onChange={(value) => setNewLead((prev) => ({ ...prev, phone: value }))}
                placeholder="Enter phone number"
              />
            </div>

            {/* Agent variables as inputs */}
            {agentVariables.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Additional Information ({selectedAgent?.name})
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {agentVariables.map((variable) => (
                    <Input
                      key={variable}
                      label={variable.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      value={variableValues[variable] || ""}
                      onChange={(e) =>
                        setVariableValues((prev) => ({
                          ...prev,
                          [variable]: e.target.value,
                        }))
                      }
                      placeholder={`Enter ${variable.replace(/_/g, " ")}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? 'Adding Lead...' : 'Add Lead'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}