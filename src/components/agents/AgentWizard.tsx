'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Agent, Template, Voice } from '@/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { AgentAPI } from '@/lib/agent-api'
import { useAuth } from '@/contexts/AuthContext'

interface AgentWizardProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (agent: Agent) => void
}

const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Healthcare Lead Qualification',
    industry: 'Healthcare',
    use_case: 'Lead Qualification',
    agent_name_template: 'Healthcare Lead Qualifier',
    prompt_template: 'You are a friendly healthcare assistant calling about {{service_type}}. Ask about their {{health_concern}} and availability for consultation.',
    variables: ['service_type', 'health_concern', 'preferred_time'],
    functions: ['check_calendar_availability', 'book_on_calendar', 'end_call'],
    welcome_message: 'Hello! I\'m calling from {{company_name}} regarding your interest in our healthcare services.',
    max_attempts: 5,
    retry_delay_minutes: 60,
    business_hours_start: '09:00',
    business_hours_end: '17:00',
    max_call_duration_minutes: 15
  },
  {
    id: '2',
    name: 'Real Estate Appointment Setting',
    industry: 'Real Estate',
    use_case: 'Appointment Setting',
    agent_name_template: 'Real Estate Appointment Setter',
    prompt_template: 'Hi, this is {{agent_name}} from {{company_name}}. I\'m calling about your interest in {{property_type}} in {{location}}.',
    variables: ['property_type', 'location', 'budget_range'],
    functions: ['check_calendar_availability', 'book_on_calendar', 'transfer_call'],
    welcome_message: 'Hi! This is {{agent_name}} from {{company_name}}. I\'m calling about your interest in properties.',
    max_attempts: 4,
    retry_delay_minutes: 45,
    business_hours_start: '08:00',
    business_hours_end: '19:00',
    max_call_duration_minutes: 20
  }
]

// Voices will be loaded from the API

export function AgentWizard({ isOpen, onClose, onComplete }: AgentWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [voices, setVoices] = useState<Voice[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { tokens } = useAuth()
  
  const [formData, setFormData] = useState({
    name: '',
    prompt: '',
    welcome_message: '',
    voice_id: '',
    inbound_phone: '',
    outbound_phone: '',
    max_attempts: 3,
    retry_delay_minutes: 30,
    business_hours_start: '09:00',
    business_hours_end: '17:00',
    max_call_duration_minutes: 20
  })

  // Fetch voices when wizard opens
  useEffect(() => {
    if (isOpen && tokens?.access_token) {
      fetchVoices()
    }
  }, [isOpen, tokens])

  const fetchVoices = async () => {
    if (!tokens?.access_token) return

    try {
      const voicesData = await AgentAPI.getVoices(tokens.access_token)
      setVoices(voicesData)
      // Set default voice if available
      if (voicesData.length > 0 && !formData.voice_id) {
        setFormData(prev => ({ ...prev, voice_id: voicesData[0].id }))
      }
    } catch (error) {
      console.error('Failed to fetch voices:', error)
    }
  }

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template)
    setFormData(prev => ({
      ...prev,
      name: template.agent_name_template,
      prompt: template.prompt_template,
      welcome_message: template.welcome_message,
      max_attempts: template.max_attempts,
      retry_delay_minutes: template.retry_delay_minutes,
      business_hours_start: template.business_hours_start,
      business_hours_end: template.business_hours_end,
      max_call_duration_minutes: template.max_call_duration_minutes
    }))
  }

  const handleNext = () => {
    if (currentStep < 4) {
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

    setLoading(true)
    setError(null)

    try {
      const agentData = {
        name: formData.name,
        prompt: formData.prompt,
        welcome_message: formData.welcome_message,
        voice_id: formData.voice_id,
        variables: selectedTemplate?.variables.reduce((acc, variable) => {
          acc[variable] = `{{${variable}}}`
          return acc
        }, {} as Record<string, any>) || {},
        functions: selectedTemplate?.functions || [],
        inbound_phone: formData.inbound_phone || undefined,
        outbound_phone: formData.outbound_phone || undefined,
        max_attempts: formData.max_attempts,
        retry_delay_minutes: formData.retry_delay_minutes,
        business_hours_start: formData.business_hours_start,
        business_hours_end: formData.business_hours_end,
        timezone: 'UTC',
        max_call_duration_minutes: formData.max_call_duration_minutes
      }

      const newAgent = await AgentAPI.createAgent(agentData, tokens.access_token)
      onComplete(newAgent)
      
      // Reset form
      setCurrentStep(1)
      setSelectedTemplate(null)
      setFormData({
        name: '',
        prompt: '',
        welcome_message: '',
        voice_id: voices.length > 0 ? voices[0].id : '',
        inbound_phone: '',
        outbound_phone: '',
        max_attempts: 3,
        retry_delay_minutes: 30,
        business_hours_start: '09:00',
        business_hours_end: '17:00',
        max_call_duration_minutes: 20
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create agent')
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose a Template (Optional)
              </label>
              <div className="grid grid-cols-1 gap-3">
                {mockTemplates.map((template) => (
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
                  </div>
                ))}
              </div>
            </div>
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
                placeholder="Enter the AI prompt for your agent..."
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
                placeholder="Enter the welcome message..."
              />
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
              {voices.length === 0 ? (
                <div className="p-4 border rounded-lg text-center text-gray-500">
                  Loading voices...
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {voices.map((voice) => (
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
            <h3 className="text-lg font-medium">Call Configuration & Phone Setup</h3>
            
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

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Max Attempts"
                type="number"
                min="1"
                max="10"
                value={formData.max_attempts}
                onChange={(e) => setFormData(prev => ({ ...prev, max_attempts: parseInt(e.target.value) }))}
              />
              <Input
                label="Retry Delay (minutes)"
                type="number"
                min="15"
                max="480"
                value={formData.retry_delay_minutes}
                onChange={(e) => setFormData(prev => ({ ...prev, retry_delay_minutes: parseInt(e.target.value) }))}
              />
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

      default:
        return null
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Agent" size="lg">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((step) => (
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
            Step {currentStep} of 4
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
          
          {currentStep === 4 ? (
            <Button onClick={handleComplete} disabled={loading}>
              {loading ? 'Creating...' : 'Create Agent'}
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={loading}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}