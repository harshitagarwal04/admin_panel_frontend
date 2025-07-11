'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Agent, Template, Company } from '@/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { TemplateResponse } from '@/lib/template-api'
import { whatsappStore } from '@/lib/whatsapp-frontend-store'
import { useVoices } from '@/hooks/useAgents'
import { useTemplates } from '@/hooks/useTemplates'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import { extractCombinedVariables, extractVariables } from '@/lib/utils'

interface AgentWizardProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (agent: Agent) => void
  editingAgent?: Agent
}

// Templates will be loaded from the API

export function AgentWizard({ isOpen, onClose, onComplete, editingAgent }: AgentWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateResponse | null>(null)
  const [selectedUseCase, setSelectedUseCase] = useState<string>('')
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [extractedVariables, setExtractedVariables] = useState<string[]>([])
  
  const { tokens } = useAuth()
  
  // Use cached queries
  const { data: voices, isLoading: voicesLoading } = useVoices()
  const { data: templatesData, isLoading: templatesLoading } = useTemplates()
  
  const allTemplates = templatesData?.templates || []
  
  // Get unique use cases from templates
  const useCases = Array.from(new Set(allTemplates.map(t => t.use_case))).sort()
  
  // Filter templates based on selected use case
  const filteredTemplates = selectedUseCase 
    ? allTemplates.filter(t => t.use_case === selectedUseCase)
    : []
  
  const [formData, setFormData] = useState({
    name: '',
    prompt: '',
    welcome_message: '',
    voice_id: '',
    channels: ['voice'] as ('voice' | 'whatsapp')[],
    contact_strategy: 'call_first' as 'call_first' | 'whatsapp_first' | 'whatsapp_only' | 'voice_only',
    call_schedule: 'realistic' as 'realistic' | 'aggressive' | 'gentle' | 'custom',
    custom_schedule_days: [1, 3, 7] as number[],
    daily_call_times: ['morning', 'afternoon'] as ('morning' | 'afternoon' | 'evening')[],
    inbound_phone: '',
    outbound_phone: '',
    whatsapp_phone: '',
    whatsapp_auto_reply: true,
    whatsapp_handoff: false,
    max_attempts: 3,
    retry_delay_minutes: 30,
    business_hours_start: '09:00',
    business_hours_end: '17:00',
    max_call_duration_minutes: 20
  })

  // Initialize form data when editing
  useEffect(() => {
    if (editingAgent) {
      // Get WhatsApp config from frontend store (if any)
      const whatsappConfig = whatsappStore.getAgentWhatsAppConfig(editingAgent.id)
      
      setFormData({
        name: editingAgent.name,
        prompt: editingAgent.prompt,
        welcome_message: editingAgent.welcome_message,
        voice_id: editingAgent.voice_id || '',
        channels: whatsappConfig?.channels || ['voice'] as ('voice' | 'whatsapp')[],
        contact_strategy: whatsappConfig?.contact_strategy || 'call_first' as 'call_first' | 'whatsapp_first' | 'whatsapp_only' | 'voice_only',
        call_schedule: whatsappConfig?.call_schedule || 'realistic' as 'realistic' | 'aggressive' | 'gentle' | 'custom',
        custom_schedule_days: whatsappConfig?.custom_schedule_days || [1, 3, 7],
        daily_call_times: whatsappConfig?.daily_call_times || ['morning', 'afternoon'],
        inbound_phone: editingAgent.inbound_phone || '',
        outbound_phone: editingAgent.outbound_phone || '',
        whatsapp_phone: whatsappConfig?.whatsapp_config?.phone_number || '',
        whatsapp_auto_reply: whatsappConfig?.whatsapp_config?.auto_reply_enabled ?? true,
        whatsapp_handoff: whatsappConfig?.whatsapp_config?.handoff_enabled ?? false,
        max_attempts: editingAgent.max_attempts,
        retry_delay_minutes: editingAgent.retry_delay_minutes,
        business_hours_start: editingAgent.business_hours_start,
        business_hours_end: editingAgent.business_hours_end,
        max_call_duration_minutes: editingAgent.max_call_duration_minutes
      })
      
      // Extract variables from existing agent's prompt and welcome message
      const existingVariables = extractCombinedVariables(editingAgent.prompt, editingAgent.welcome_message)
      setExtractedVariables(existingVariables)
      
      // Reset step to 1 when editing (in case modal was left on different step)
      setCurrentStep(1)
    }
  }, [editingAgent])

  // Fetch company data when wizard opens (voices and templates now cached)
  useEffect(() => {
    if (isOpen) {
      fetchCompanyData()
    }
  }, [isOpen])

  // Set default voice when voices are loaded (only for new agents)
  useEffect(() => {
    if (voices && voices.length > 0 && !formData.voice_id && !editingAgent) {
      setFormData(prev => ({ ...prev, voice_id: voices[0].id }))
    }
  }, [voices, formData.voice_id, editingAgent])

  // Real-time variable extraction
  useEffect(() => {
    const variables = extractCombinedVariables(formData.prompt, formData.welcome_message)
    setExtractedVariables(variables)
  }, [formData.prompt, formData.welcome_message])

  const fetchCompanyData = async () => {
    if (!tokens?.access_token) return

    try {
      // This would be a real API call to get company data
      // For now, using mock data
      const mockCompany: Company = {
        id: '1',
        name: 'ConversAI Labs',
        admin_user_id: '1',
        max_agents_limit: 10,
        max_concurrent_calls: 5,
        total_minutes_used: 0,
        max_contact_attempts: 6, // Company limit for contact attempts
        settings: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
      setCompany(mockCompany)
    } catch (error) {
      console.error('Failed to fetch company data:', error)
    }
  }

  const handleTemplateSelect = (template: TemplateResponse) => {
    setSelectedTemplate(template)
    
    // Extract variables from both prompt and welcome_message in template
    const templateVariables = extractCombinedVariables(template.prompt, template.welcome_message)
    
    setFormData(prev => ({
      ...prev,
      name: template.name,
      prompt: template.prompt,
      welcome_message: template.welcome_message,
      max_attempts: template.suggested_settings.max_attempts || 3,
      retry_delay_minutes: template.suggested_settings.retry_delay_minutes || 30,
      business_hours_start: template.suggested_settings.business_hours_start || '09:00',
      business_hours_end: template.suggested_settings.business_hours_end || '17:00',
      max_call_duration_minutes: template.suggested_settings.max_call_duration_minutes || 20
    }))
    
    // Update extracted variables immediately
    setExtractedVariables(templateVariables)
  }

  const handleNext = () => {
    // Step 1 validation
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        setError('Agent name is required.')
        return
      }
    }
    // Step 2 validation
    if (currentStep === 2) {
      if (!formData.prompt.trim()) {
        setError('Prompt is required.')
        return
      }
      if (!formData.welcome_message.trim()) {
        setError('Welcome message is required.')
        return
      }
    }
    setError(null)
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    if (!tokens?.access_token) return

    // Validate against company limits
    const maxAllowed = company?.max_contact_attempts || 6
    let totalAttempts = 0
    
    if (formData.call_schedule === 'custom') {
      totalAttempts = formData.custom_schedule_days.length * formData.daily_call_times.length
    } else if (formData.call_schedule === 'realistic') {
      totalAttempts = 5
    } else if (formData.call_schedule === 'aggressive') {
      totalAttempts = 7
    } else if (formData.call_schedule === 'gentle') {
      totalAttempts = 3
    }
    
    if (totalAttempts > maxAllowed) {
      setError(`Selected schedule (${totalAttempts} attempts) exceeds company limit of ${maxAllowed} attempts. Please choose a different schedule or contact your administrator to increase the limit.`)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create variables object from extracted variables
      const variablesObject = extractedVariables.reduce((acc, variable) => {
        acc[variable] = '' // Initialize with empty string, will be filled by backend
        return acc
      }, {} as Record<string, any>)

      // Only include voice AI fields for backend - WhatsApp is frontend-only
      const agentData = {
        name: formData.name,
        prompt: formData.prompt,
        welcome_message: formData.welcome_message,
        voice_id: formData.voice_id,
        variables: variablesObject, // Include the extracted variables
        functions: selectedTemplate?.functions || editingAgent?.functions || [],
        inbound_phone: formData.inbound_phone || undefined,
        outbound_phone: formData.outbound_phone || undefined,
        max_attempts: formData.max_attempts,
        retry_delay_minutes: formData.retry_delay_minutes,
        business_hours_start: formData.business_hours_start,
        business_hours_end: formData.business_hours_end,
        timezone: 'UTC',
        max_call_duration_minutes: formData.max_call_duration_minutes
      }

      let resultAgent: Agent
      if (editingAgent) {
        // Only send the updatable fields and the id for update
        resultAgent = { ...agentData, id: editingAgent.id } as Agent
    
      } else {
        // Create new agent - will be handled by parent component via mutation
        resultAgent = { ...agentData, id: Date.now().toString(), company_id: '1', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Agent
      }
      
      // Save WhatsApp config to frontend store (not sent to backend)
      whatsappStore.saveAgentWhatsAppConfig({
        agentId: resultAgent.id,
        channels: formData.channels,
        whatsapp_config: formData.channels.includes('whatsapp') ? {
          phone_number: formData.whatsapp_phone || undefined,
          auto_reply_enabled: formData.whatsapp_auto_reply,
          handoff_enabled: formData.whatsapp_handoff,
          template_ids: [],
          business_account_id: undefined,
          webhook_url: undefined
        } : undefined,
        contact_strategy: formData.contact_strategy,
        call_schedule: formData.call_schedule,
        custom_schedule_days: formData.custom_schedule_days,
        daily_call_times: formData.daily_call_times
      })

      // Add frontend-only WhatsApp data for display purposes
      const agentWithWhatsApp = {
        ...resultAgent,
        channels: formData.channels,
        whatsapp_config: formData.channels.includes('whatsapp') ? {
          phone_number: formData.whatsapp_phone || undefined,
          auto_reply_enabled: formData.whatsapp_auto_reply,
          handoff_enabled: formData.whatsapp_handoff,
          template_ids: [],
          business_account_id: undefined,
          webhook_url: undefined
        } : undefined
      }
      
      onComplete(agentWithWhatsApp)
      
      // Close the modal and reset form
      handleClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save agent')
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <Input
              label="Agent Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter agent name"
            />
            {!editingAgent && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Choose a Template (Optional)
                </label>
                
                {/* Use Case Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Use Case
                  </label>
                  <select
                    value={selectedUseCase}
                    onChange={(e) => {
                      setSelectedUseCase(e.target.value)
                      setSelectedTemplate(null) // Reset template selection
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select Use Case</option>
                    {useCases.map((useCase) => (
                      <option key={useCase} value={useCase}>
                        {useCase}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Templates List */}
                {selectedUseCase && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Available Templates {filteredTemplates.length > 0 && `(${filteredTemplates.length})`}
                    </label>
                    {templatesLoading ? (
                      <div className="p-4 border rounded-lg text-center text-gray-500">
                        Loading templates...
                      </div>
                    ) : filteredTemplates.length === 0 ? (
                      <div className="p-4 border rounded-lg text-center text-gray-500">
                        No templates found for this selection
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                        {filteredTemplates.map((template) => {
                          // Extract variables from both prompt and welcome_message for preview
                          const templateVariables = extractCombinedVariables(template.prompt, template.welcome_message)
                          
                          return (
                            <div
                              key={template.id}
                              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                selectedTemplate?.id === template.id
                                  ? 'border-primary-500 bg-primary-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => handleTemplateSelect(template)}
                            >
                              <div className="font-medium">{template.name}</div>
                              <div className="text-sm text-gray-600">{template.industry} - {template.use_case}</div>
                              {template.suggested_settings.max_call_duration_minutes && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {template.suggested_settings.max_call_duration_minutes} min calls, {template.suggested_settings.max_attempts || 3} attempts
                                </div>
                              )}
                              {templateVariables.length > 0 && (
                                <div className="mt-2">
                                  <div className="text-xs font-medium text-gray-700 mb-1">Variables:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {templateVariables.map((variable) => (
                                      <span
                                        key={variable}
                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                      >
                                        {variable}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {editingAgent && (
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-blue-800 text-sm">
                  <strong>Editing existing agent:</strong> You can modify all settings below. Templates are not applicable when editing.
                </p>
              </div>
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">AI Configuration</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prompt
              </label>
              <textarea
                className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={formData.prompt}
                onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
                placeholder="Enter the AI prompt for your agent... Use {{variable}} syntax for dynamic content"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Welcome Message
              </label>
              <textarea
                className="w-full h-20 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={formData.welcome_message}
                onChange={(e) => setFormData(prev => ({ ...prev, welcome_message: e.target.value }))}
                placeholder="Enter the welcome message... Use {{variable}} syntax for dynamic content"
              />
            </div>
            
            {/* Real-time Variables Display */}
            {extractedVariables.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  📋 Detected Variables ({extractedVariables.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {extractedVariables.map((variable) => (
                    <span
                      key={variable}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {variable}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-blue-700 mt-2">
                  These variables will be available when creating leads and can be filled with dynamic content.
                </p>
              </div>
            )}
            
            {/* Variable Usage Guide */}
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                💡 Variable Usage Guide
              </h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p>• Use <code className="bg-gray-200 px-1 rounded">{`{{name}}`}</code> for lead's name</p>
                <p>• Use <code className="bg-gray-200 px-1 rounded">{`{{company}}`}</code> for company name</p>
                <p>• Use <code className="bg-gray-200 px-1 rounded">{`{{service_type}}`}</code> for service type</p>
                <p>• Variables are automatically detected and will be available when creating leads</p>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Voice & Language</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Voice
              </label>
              {!voices || voices.length === 0 ? (
                <div className="p-4 border rounded-lg text-center text-gray-500">
                  Loading voices...
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {voices!.map((voice) => (
                    <label
                      key={voice.id}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                        formData.voice_id === voice.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="voice"
                        value={voice.id}
                        checked={formData.voice_id === voice.id}
                        onChange={(e) => setFormData(prev => ({ ...prev, voice_id: e.target.value }))}
                        className="sr-only"
                      />
                      <div>
                        <div className="font-medium">{voice.name}</div>
                        <div className="text-sm text-gray-600">
                          {voice.gender} • {voice.language}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Channels & Configuration</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Communication Channels
              </label>
              <div className="space-y-3">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.channels.includes('voice')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({ 
                          ...prev, 
                          channels: [...prev.channels.filter(c => c !== 'voice'), 'voice']
                        }))
                      } else {
                        setFormData(prev => ({ 
                          ...prev, 
                          channels: prev.channels.filter(c => c !== 'voice')
                        }))
                      }
                    }}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <div className="ml-3">
                    <div className="font-medium">Voice Calls</div>
                    <div className="text-sm text-gray-600">Traditional phone calls with AI agent</div>
                  </div>
                </label>
                
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.channels.includes('whatsapp')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({ 
                          ...prev, 
                          channels: [...prev.channels.filter(c => c !== 'whatsapp'), 'whatsapp']
                        }))
                      } else {
                        setFormData(prev => ({ 
                          ...prev, 
                          channels: prev.channels.filter(c => c !== 'whatsapp')
                        }))
                      }
                    }}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <div className="ml-3">
                    <div className="font-medium">WhatsApp Business</div>
                    <div className="text-sm text-gray-600">WhatsApp messaging with AI agent</div>
                  </div>
                </label>
              </div>
            </div>

            {formData.channels.includes('voice') && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Voice Configuration</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Inbound Phone (Optional)"
                    value={formData.inbound_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, inbound_phone: e.target.value }))}
                    placeholder="+1234567890"
                  />
                  <Input
                    label="Outbound Phone (Optional)"
                    value={formData.outbound_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, outbound_phone: e.target.value }))}
                    placeholder="+1234567890"
                  />
                </div>
              </div>
            )}

            {formData.channels.includes('whatsapp') && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">WhatsApp Configuration</h4>
                <div className="space-y-4">
                  <Input
                    label="WhatsApp Phone Number"
                    value={formData.whatsapp_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_phone: e.target.value }))}
                    placeholder="+1234567890"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.whatsapp_auto_reply}
                        onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_auto_reply: e.target.checked }))}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Auto-reply enabled</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.whatsapp_handoff}
                        onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_handoff: e.target.checked }))}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Human handoff enabled</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {formData.channels.includes('voice') && formData.channels.includes('whatsapp') && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Contact Strategy</h4>
                <div className="space-y-3">
                  <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="contact_strategy"
                      value="call_first"
                      checked={formData.contact_strategy === 'call_first'}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_strategy: e.target.value as any }))}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 mt-0.5"
                    />
                    <div className="ml-3">
                      <div className="font-medium">📞 Call First (Default)</div>
                      <div className="text-sm text-gray-600">
                        Try calling first → If no answer, send WhatsApp message
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Each call + WhatsApp = 1 attempt</div>
                    </div>
                  </label>
                  
                  <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="contact_strategy"
                      value="whatsapp_first"
                      checked={formData.contact_strategy === 'whatsapp_first'}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_strategy: e.target.value as any }))}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 mt-0.5"
                    />
                    <div className="ml-3">
                      <div className="font-medium">💬 WhatsApp First</div>
                      <div className="text-sm text-gray-600">
                        Send WhatsApp first → If no response, try calling
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Each WhatsApp + call = 1 attempt</div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Calling Schedule</h4>
              {company && (
                <div className="bg-yellow-50 p-3 rounded-lg mb-4">
                  <div className="text-sm text-yellow-800">
                    <strong>Company Limit:</strong> Maximum {company.max_contact_attempts} contact attempts per lead
                  </div>
                </div>
              )}
              <div className="space-y-3">
                <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="call_schedule"
                    value="realistic"
                    checked={formData.call_schedule === 'realistic'}
                    onChange={(e) => setFormData(prev => ({ ...prev, call_schedule: e.target.value as any }))}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 mt-0.5"
                  />
                  <div className="ml-3">
                    <div className="font-medium">📅 Realistic Schedule (Recommended)</div>
                    <div className="text-sm text-gray-600 space-y-1 mt-1">
                      <div><strong>Day 1:</strong> Morning & Afternoon</div>
                      <div><strong>Day 3:</strong> Morning</div>
                      <div><strong>Day 7:</strong> Afternoon</div>
                      <div><strong>Day 14:</strong> Morning</div>
                    </div>
                    <div className={`text-xs mt-1 ${
                      5 > (company?.max_contact_attempts || 6) ? 'text-red-600 font-medium' : 'text-gray-500'
                    }`}>
                      Total: 5 attempts over 2 weeks
                      {5 > (company?.max_contact_attempts || 6) && ' ⚠️ Exceeds limit'}
                    </div>
                  </div>
                </label>
                
                <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="call_schedule"
                    value="aggressive"
                    checked={formData.call_schedule === 'aggressive'}
                    onChange={(e) => setFormData(prev => ({ ...prev, call_schedule: e.target.value as any }))}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 mt-0.5"
                  />
                  <div className="ml-3">
                    <div className="font-medium">⚡ Aggressive Schedule</div>
                    <div className="text-sm text-gray-600 space-y-1 mt-1">
                      <div><strong>Day 1:</strong> Morning, Afternoon & Evening</div>
                      <div><strong>Day 2:</strong> Morning & Afternoon</div>
                      <div><strong>Day 4:</strong> Evening</div>
                      <div><strong>Day 7:</strong> Morning</div>
                    </div>
                    <div className={`text-xs mt-1 ${
                      7 > (company?.max_contact_attempts || 6) ? 'text-red-600 font-medium' : 'text-gray-500'
                    }`}>
                      Total: 7 attempts over 1 week
                      {7 > (company?.max_contact_attempts || 6) && ' ⚠️ Exceeds limit'}
                    </div>
                  </div>
                </label>
                
                <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="call_schedule"
                    value="gentle"
                    checked={formData.call_schedule === 'gentle'}
                    onChange={(e) => setFormData(prev => ({ ...prev, call_schedule: e.target.value as any }))}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 mt-0.5"
                  />
                  <div className="ml-3">
                    <div className="font-medium">🕊️ Gentle Schedule</div>
                    <div className="text-sm text-gray-600 space-y-1 mt-1">
                      <div><strong>Day 1:</strong> Morning</div>
                      <div><strong>Day 5:</strong> Afternoon</div>
                      <div><strong>Day 14:</strong> Morning</div>
                    </div>
                    <div className={`text-xs mt-1 ${
                      3 > (company?.max_contact_attempts || 6) ? 'text-red-600 font-medium' : 'text-gray-500'
                    }`}>
                      Total: 3 attempts over 2 weeks
                      {3 > (company?.max_contact_attempts || 6) && ' ⚠️ Exceeds limit'}
                    </div>
                  </div>
                </label>
                
                <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="call_schedule"
                    value="custom"
                    checked={formData.call_schedule === 'custom'}
                    onChange={(e) => setFormData(prev => ({ ...prev, call_schedule: e.target.value as any }))}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 mt-0.5"
                  />
                  <div className="ml-3">
                    <div className="font-medium">⚙️ Custom Schedule</div>
                    <div className="text-sm text-gray-600">
                      Set your own days and times
                    </div>
                  </div>
                </label>
              </div>
              
              {formData.call_schedule === 'custom' && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Days (when to make attempts)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5, 7, 10, 14, 21, 30].map((day) => (
                        <label key={day} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.custom_schedule_days.includes(day)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  custom_schedule_days: [...prev.custom_schedule_days, day].sort((a, b) => a - b)
                                }))
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  custom_schedule_days: prev.custom_schedule_days.filter(d => d !== day)
                                }))
                              }
                            }}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mr-1"
                          />
                          <span className="text-sm">Day {day}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Day 1 = first contact day. Select when to make follow-up attempts.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Call Times (when during the day)
                    </label>
                    <div className="space-y-2">
                      {(['morning', 'afternoon', 'evening'] as const).map((time) => (
                        <label key={time} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.daily_call_times.includes(time)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  daily_call_times: [...prev.daily_call_times, time]
                                }))
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  daily_call_times: prev.daily_call_times.filter(t => t !== time)
                                }))
                              }
                            }}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mr-2"
                          />
                          <span className="text-sm capitalize">{time}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            {time === 'morning' && '(9AM - 12PM)'}
                            {time === 'afternoon' && '(12PM - 5PM)'}
                            {time === 'evening' && '(5PM - 8PM)'}
                          </span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      On each contact day, calls will be made at selected times.
                    </p>
                  </div>
                  
                  {formData.custom_schedule_days.length > 0 && formData.daily_call_times.length > 0 && (
                    <div className={`p-3 rounded border ${
                      (formData.custom_schedule_days.length * formData.daily_call_times.length) > (company?.max_contact_attempts || 6)
                        ? 'bg-red-50 border-red-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <div className={`text-sm font-medium mb-1 ${
                        (formData.custom_schedule_days.length * formData.daily_call_times.length) > (company?.max_contact_attempts || 6)
                          ? 'text-red-800'
                          : 'text-blue-800'
                      }`}>
                        {(formData.custom_schedule_days.length * formData.daily_call_times.length) > (company?.max_contact_attempts || 6)
                          ? '⚠️ Exceeds Company Limit'
                          : 'Your Schedule Preview:'
                        }
                      </div>
                      <div className={`text-xs space-y-1 ${
                        (formData.custom_schedule_days.length * formData.daily_call_times.length) > (company?.max_contact_attempts || 6)
                          ? 'text-red-700'
                          : 'text-blue-700'
                      }`}>
                        {formData.custom_schedule_days.map(day => (
                          <div key={day}>
                            <strong>Day {day}:</strong> {formData.daily_call_times.join(', ')} 
                            ({formData.daily_call_times.length} attempt{formData.daily_call_times.length > 1 ? 's' : ''})
                          </div>
                        ))}
                        <div className={`border-t pt-1 mt-2 ${
                          (formData.custom_schedule_days.length * formData.daily_call_times.length) > (company?.max_contact_attempts || 6)
                            ? 'border-red-200'
                            : 'border-blue-200'
                        }`}>
                          <strong>Total:</strong> {formData.custom_schedule_days.length * formData.daily_call_times.length} attempts 
                          over {Math.max(...formData.custom_schedule_days)} days
                          {(formData.custom_schedule_days.length * formData.daily_call_times.length) > (company?.max_contact_attempts || 6) && (
                            <div className="mt-1 font-medium">
                              Company limit: {company?.max_contact_attempts || 6} attempts maximum
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Business Hours Start"
                type="time"
                value={formData.business_hours_start}
                onChange={(e) => setFormData(prev => ({ ...prev, business_hours_start: e.target.value }))}
              />
              <Input
                label="Business Hours End"
                type="time"
                value={formData.business_hours_end}
                onChange={(e) => setFormData(prev => ({ ...prev, business_hours_end: e.target.value }))}
              />
            </div>

            <Input
              label="Max Call Duration (minutes)"
              type="number"
              min="5"
              max="60"
              value={formData.max_call_duration_minutes}
              onChange={(e) => setFormData(prev => ({ ...prev, max_call_duration_minutes: parseInt(e.target.value) }))}
            />
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Templates & Sync Configuration</h3>
            
            {formData.channels.includes('whatsapp') && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">WhatsApp Templates</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 mb-3">
                      Select message templates for automated WhatsApp responses
                    </p>
                    <div className="space-y-2">
                      <label className="flex items-center p-3 border rounded-lg bg-white cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <div className="ml-3">
                          <div className="font-medium">Welcome Message</div>
                          <div className="text-sm text-gray-600">Hi {"{{name}}"} Thanks for reaching out via WhatsApp.</div>
                        </div>
                      </label>
                      
                      <label className="flex items-center p-3 border rounded-lg bg-white cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <div className="ml-3">
                          <div className="font-medium">Handoff to Voice</div>
                          <div className="text-sm text-gray-600">Would you like me to call you instead? It might be easier to discuss over the phone.</div>
                        </div>
                      </label>
                      
                      <label className="flex items-center p-3 border rounded-lg bg-white cursor-pointer">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <div className="ml-3">
                          <div className="font-medium">Follow-up Message</div>
                          <div className="text-sm text-gray-600">Hi {"{{name}}"}, just following up on our conversation...</div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {formData.channels.includes('voice') && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Voice & WhatsApp Sync</h4>
                    <div className="bg-green-50 p-4 rounded-lg space-y-3">
                      <p className="text-sm text-green-800 font-medium">
                        🔄 Multi-Channel Sync Enabled
                      </p>
                      <div className="text-sm text-green-700 space-y-2">
                        <div className="font-medium text-green-800">Your selected strategy: 
                          {formData.contact_strategy === 'call_first' && " 📞 Call First"}
                          {formData.contact_strategy === 'whatsapp_first' && " 💬 WhatsApp First"}
                        </div>
                        
                        <div className="bg-white p-3 rounded border">
                          <div className="text-sm text-gray-700 space-y-2">
                            <div className="font-medium">Contact Strategy:</div>
                            {formData.contact_strategy === 'call_first' ? (
                              <div>Each attempt: Call → If no answer, send WhatsApp</div>
                            ) : (
                              <div>Each attempt: WhatsApp → If no response, call</div>
                            )}
                            
                            <div className="font-medium pt-2 border-t">Calling Schedule:</div>
                            {formData.call_schedule === 'realistic' && (
                              <div>
                                <div>Day 1: Morning & Afternoon • Day 3: Morning</div>
                                <div>Day 7: Afternoon • Day 14: Morning</div>
                              </div>
                            )}
                            {formData.call_schedule === 'aggressive' && (
                              <div>
                                <div>Day 1: Morning, Afternoon & Evening</div>
                                <div>Day 2: Morning & Afternoon • Day 4: Evening • Day 7: Morning</div>
                              </div>
                            )}
                            {formData.call_schedule === 'gentle' && (
                              <div>
                                <div>Day 1: Morning • Day 5: Afternoon</div>
                                <div>Day 14: Morning</div>
                              </div>
                            )}
                            {formData.call_schedule === 'custom' && (
                              <div>
                                {formData.custom_schedule_days.map(day => (
                                  <div key={day}>
                                    Day {day}: {formData.daily_call_times.join(', ')}
                                  </div>
                                ))}
                                <div className="text-xs mt-1">
                                  Total: {formData.custom_schedule_days.length * formData.daily_call_times.length} attempts
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-xs text-green-600">
                          ✓ Customer can respond via either channel anytime<br/>
                          ✓ Agent can suggest switching channels during conversation<br/>
                          ✓ All interactions logged in unified conversation history
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-white rounded border">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.whatsapp_handoff}
                            onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_handoff: e.target.checked }))}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm font-medium">Enable automatic handoff suggestions</span>
                        </label>
                        <p className="text-xs text-gray-600 mt-1 ml-6">
                          Agent will automatically suggest switching to voice calls for complex queries
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!formData.channels.includes('whatsapp') && (
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-gray-600">Enable WhatsApp channel to configure templates and sync settings</p>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  const handleClose = () => {
    // Reset form state when closing (for both new and edit modes)
    setCurrentStep(1)
    setSelectedTemplate(null)
    setSelectedUseCase('')
    setExtractedVariables([])
    setFormData({
      name: '',
      prompt: '',
      welcome_message: '',
      voice_id: '',
      channels: ['voice'] as ('voice' | 'whatsapp')[],
      contact_strategy: 'call_first' as 'call_first' | 'whatsapp_first' | 'whatsapp_only' | 'voice_only',
      call_schedule: 'realistic' as 'realistic' | 'aggressive' | 'gentle' | 'custom',
      custom_schedule_days: [1, 3, 7],
      daily_call_times: ['morning', 'afternoon'] as ('morning' | 'afternoon' | 'evening')[],
      inbound_phone: '',
      outbound_phone: '',
      whatsapp_phone: '',
      whatsapp_auto_reply: true,
      whatsapp_handoff: false,
      max_attempts: 3,
      retry_delay_minutes: 30,
      business_hours_start: '09:00',
      business_hours_end: '17:00',
      max_call_duration_minutes: 20
    })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={editingAgent ? "Edit Agent" : "Create New Agent"} size="lg">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
          <span className="text-sm text-gray-600">
            Step {currentStep} of 5
          </span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {renderStep()}

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          {currentStep === 5 ? (
            <Button onClick={handleComplete} disabled={loading || voicesLoading || templatesLoading}>
              {(loading || voicesLoading || templatesLoading)
                ? (editingAgent ? 'Updating...' : 'Creating...') 
                : (editingAgent ? 'Update Agent' : 'Create Agent')
              }
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={loading || voicesLoading || templatesLoading}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}