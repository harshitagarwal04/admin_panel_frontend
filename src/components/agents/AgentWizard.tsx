'use client'

import React, { useState, useEffect, useMemo, memo, useCallback, useRef } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Agent, AgentConfiguration } from '@/types'
import { ChevronLeft, ChevronRight, X, Eye, EyeOff, Pencil, RefreshCw, Check } from 'lucide-react'
import { useVoices } from '@/hooks/useAgents'
import { useAuth } from '@/contexts/AuthContext'
import { AgentAPI } from '@/lib/agent-api'
import toast from 'react-hot-toast'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { generateRoleSection, getLanguageFromVoice, generateLanguageLine, extractVariablesFromPrompt, generateHiddenLanguageInstructions } from '@/lib/prompt-utils'
import { getTimezoneFromPhone } from '@/lib/utils'
import { 
  CollapsibleSection, 
  MainCollapsibleSection,
  ValidatedInput, 
  InfoTooltip, 
  InlineInfoTooltip,
  GenerateButton,
  LoadingButton 
} from './AgentWizardComponents'

interface FAQItem {
  question: string
  answer: string
}

interface TaskItem {
  task: string
}

interface AgentWizardProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (agent: Agent) => void
  editingAgent?: Agent
}

// Reusable Auto-Expanding TextArea Component
interface AutoExpandTextAreaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  minHeight?: number
  maxHeight?: number
}

const AutoExpandTextArea = memo(({ 
  value, 
  onChange, 
  placeholder = "", 
  className = "",
  minHeight = 44,
  maxHeight = 84 
}: AutoExpandTextAreaProps) => {
  const handleInput = useCallback((e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = `${minHeight}px`;
    const scrollHeight = target.scrollHeight;
    target.style.height = Math.min(scrollHeight, maxHeight) + 'px';
  }, [minHeight, maxHeight])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }, [onChange])

  return (
    <textarea
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={`w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none overflow-auto bg-gray-50 text-gray-900 placeholder-gray-400 ${className}`}
      rows={1}
      style={{
        minHeight: `${minHeight}px`,
        maxHeight: `${maxHeight}px`
      }}
      onInput={handleInput}
    />
  )
})


// Reusable Dynamic List Component with hover delete
interface DynamicListProps {
  items: string[]
  onItemChange: (index: number, value: string) => void
  onItemRemove: (index: number) => void
  onItemAdd: () => void
  placeholder?: string
  addButtonText?: string
  twoColumns?: boolean
  textArea?: boolean
}

const DynamicList = memo(({
  items,
  onItemChange,
  onItemRemove,
  onItemAdd,
  placeholder = "Enter item",
  addButtonText = "Add more",
  twoColumns = false,
  textArea = false
}: DynamicListProps) => {
  const handleItemChange = useCallback((index: number, value: string) => {
    onItemChange(index, value)
  }, [onItemChange])

  const handleItemRemove = useCallback((index: number) => {
    onItemRemove(index)
  }, [onItemRemove])

  const containerClassName = useMemo(() => 
    twoColumns ? "grid grid-cols-1 md:grid-cols-2 gap-3" : "space-y-2", 
    [twoColumns]
  )

  return (
    <div className="space-y-2">
      <div className={containerClassName}>
        {items.map((item, index) => (
          <div key={index} className="group relative">
            {textArea ? (
              <textarea
                value={item}
                onChange={(e) => handleItemChange(index, e.target.value)}
                placeholder={placeholder}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[100px] pr-10 bg-gray-50 text-gray-900 placeholder-gray-400"
              />
            ) : (
              <AutoExpandTextArea
                value={item}
                onChange={(value) => handleItemChange(index, value)}
                placeholder={placeholder}
                minHeight={40}
                maxHeight={84}
                className="pr-10"
              />
            )}
            <button
              onClick={() => handleItemRemove(index)}
              className="absolute top-2 right-2 w-6 h-6 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              title="Remove item"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
      <Button
        onClick={onItemAdd}
        variant="outline"
        size="sm"
      >
        {addButtonText}
      </Button>
    </div>
  )
})

// Prompt Preview Component for Right Sidebar
interface PromptPreviewProps {
  configuration: AgentConfiguration
  welcomeMessage: string
  generatedPrompt: string
  faqs: FAQItem[]
  onEditFAQs?: () => void
  roleSection?: string
  tasks?: TaskItem[]
  onEditTasks?: () => void
  conversationFlow?: string
  languageLine?: string
  extractedVariables?: string[]
}

const PromptPreview = memo(({ 
  configuration,
  welcomeMessage, 
  generatedPrompt, 
  faqs,
  onEditFAQs,
  roleSection,
  tasks,
  onEditTasks,
  conversationFlow,
  languageLine,
  extractedVariables
}: PromptPreviewProps) => {
  const [isFAQsCollapsed, setIsFAQsCollapsed] = useState(false)
  const [isTasksCollapsed, setIsTasksCollapsed] = useState(false)
  const [isConversationCollapsed, setIsConversationCollapsed] = useState(true)
  const [isConfigCollapsed, setIsConfigCollapsed] = useState(false)
  const [isRoleCollapsed, setIsRoleCollapsed] = useState(true)
  const [isLanguageCollapsed, setIsLanguageCollapsed] = useState(true)
  const [isVariablesCollapsed, setIsVariablesCollapsed] = useState(true)
  const [isAssembledPromptCollapsed, setIsAssembledPromptCollapsed] = useState(false)
  
  const preview = useMemo(() => {
    const { basic_info } = configuration
    let preview = ''
    
    if (basic_info.agent_name) preview += `Agent Name: ${basic_info.agent_name}\n`
    if (basic_info.intended_role) preview += `Role: ${basic_info.intended_role}\n`
    if (basic_info.target_industry) preview += `Industry: ${basic_info.target_industry}\n`
    if (basic_info.company_name) preview += `Company: ${basic_info.company_name}\n`
    if (basic_info.primary_service) preview += `Business Context: ${basic_info.primary_service}\n`
    if (welcomeMessage) preview += `Welcome Message: ${welcomeMessage}\n`
    
    return preview.trim() || 'No configuration data entered yet.'
  }, [configuration, welcomeMessage])

  return (
    <div className="h-full flex flex-col border-l border-gray-200 bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between py-2 px-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800">Preview</h3>
      </div>

      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
          {/* Assembled Prompt - Only show when business context is available */}
          {generatedPrompt && configuration.basic_info?.primary_service && (
            <CollapsibleSection
              title={`Assembled Prompt (${generatedPrompt.split(' ').length} words)`}
              isCollapsed={isAssembledPromptCollapsed}
              onToggle={setIsAssembledPromptCollapsed}
            >
              <div className="bg-white p-3 rounded border max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono text-xs">
                  {generatedPrompt}
                </pre>
              </div>
            </CollapsibleSection>
          )}


          {/* Configuration Summary */}
          <CollapsibleSection
            title="Configuration"
            isCollapsed={isConfigCollapsed}
            onToggle={setIsConfigCollapsed}
          >
            <div className="bg-white p-3 rounded border text-sm">
              <pre className="whitespace-pre-wrap text-gray-600 font-mono text-xs">
                {preview}
              </pre>
            </div>
          </CollapsibleSection>

          {/* FAQs Section */}
          {faqs.length > 0 && (
            <CollapsibleSection
              title="Generated FAQs"
              count={faqs.length}
              isCollapsed={isFAQsCollapsed}
              onToggle={setIsFAQsCollapsed}
              actionButtons={
                onEditFAQs && (
                  <button
                    onClick={onEditFAQs}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    title="Edit FAQs"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )
              }
            >
              <div className="bg-white p-3 rounded border max-h-64 overflow-y-auto">
                <ol className="space-y-2 text-xs text-gray-600">
                  {faqs.map((faq, index) => (
                    <li key={index} className="bg-gray-50 rounded p-2">
                      <div className="flex items-start gap-2">
                        <span className="text-gray-500 font-medium">{index + 1}.</span>
                        <div className="flex-1 space-y-1">
                          <div className="font-medium text-gray-800">
                            <span className="text-gray-600">Q:</span> {faq.question}
                          </div>
                          <div className="text-gray-600">
                            <span className="text-gray-600">A:</span> {faq.answer}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </CollapsibleSection>
          )}

          {/* Role Section */}
          {roleSection && (
            <CollapsibleSection
              title="Role"
              isCollapsed={isRoleCollapsed}
              onToggle={setIsRoleCollapsed}
            >
              <div className="bg-white p-3 rounded border">
                <p className="text-xs text-gray-600">{roleSection}</p>
              </div>
            </CollapsibleSection>
          )}

          {/* Language Line */}
          {languageLine && (
            <CollapsibleSection
              title="Language"
              isCollapsed={isLanguageCollapsed}
              onToggle={setIsLanguageCollapsed}
            >
              <div className="bg-white p-3 rounded border">
                <p className="text-xs text-gray-600">{languageLine}</p>
              </div>
            </CollapsibleSection>
          )}

          {/* Tasks Section */}
          {tasks && tasks.length > 0 && (
            <CollapsibleSection
              title="Generated Tasks"
              isCollapsed={isTasksCollapsed}
              onToggle={setIsTasksCollapsed}
              actionButtons={
                onEditTasks && (
                  <button
                    onClick={onEditTasks}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    title="Edit Tasks"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )
              }
            >
              <div className="bg-white p-3 rounded border max-h-64 overflow-y-auto">
                <div className="space-y-2 text-xs">
                  {tasks.map((task, index) => (
                    <div key={index} className="text-gray-600">
                      <div className="font-medium">{index + 1}. {stripTaskNumber(task.task)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleSection>
          )}

          {/* Conversation Flow Section */}
          {conversationFlow && (
            <CollapsibleSection
              title="Example Conversation"
              isCollapsed={isConversationCollapsed}
              onToggle={setIsConversationCollapsed}
            >
              <div className="bg-white p-3 rounded border max-h-64 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-xs text-gray-600">
                  {conversationFlow}
                </pre>
              </div>
            </CollapsibleSection>
          )}

          {/* Extracted Variables */}
          {extractedVariables && extractedVariables.length > 0 && (
            <CollapsibleSection
              title="Extracted Variables"
              count={extractedVariables.length}
              isCollapsed={isVariablesCollapsed}
              onToggle={setIsVariablesCollapsed}
            >
              <div className="bg-white p-3 rounded border">
                <p className="text-xs text-gray-500 mb-2">
                  These variables will be available when creating leads and can be filled with dynamic content.
                </p>
                <div className="flex flex-wrap gap-2">
                  {extractedVariables.map((variable, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      {`{{${variable}}}`}
                    </span>
                  ))}
                </div>
              </div>
            </CollapsibleSection>
          )}
      </div>
    </div>
  )
})

// Helper function to parse tasks string into TaskItem array
const parseTasksString = (tasksString: string): TaskItem[] => {
  const tasks: TaskItem[] = []
  
  // Remove ##task header if present (with or without space)
  const cleanedTasks = tasksString.replace(/^##\s*tasks?\s*\n?/i, '').trim()
  
  // Split by newlines and treat each line as a task
  const lines = cleanedTasks.split('\n')
  
  // Simple parsing - each non-empty line is a task
  for (const line of lines) {
    const trimmedLine = line.trim()
    if (!trimmedLine) continue
    
    tasks.push({
      task: trimmedLine
    })
  }
  
  return tasks
}

// Helper function to strip leading numbers from task text for display
const stripTaskNumber = (taskText: string): string => {
  // Remove patterns like "1. ", "2. ", "10. " from the beginning
  return taskText.replace(/^\d+\.\s+/, '')
}

// Helper function to convert TaskItem array back to string
const tasksToString = (tasks: TaskItem[]): string => {
  if (tasks.length === 0) return ''
  
  const taskList = tasks.map((task) => {
    return task.task
  }).join('\n')
  
  // Check if the first task already starts with ##Tasks header (with or without space)
  if (tasks.length > 0 && /^##\s*tasks/i.test(tasks[0].task.trim())) {
    return taskList
  }
  
  return `##Tasks\n${taskList}`
}

const AgentWizardComponent = ({ isOpen, onClose, onComplete, editingAgent }: AgentWizardProps) => {
  // 3-Page Structure: Page 1 (Basic Info), Page 2 (AI Generation), Page 3 (Business Config)
  const [currentPage, setCurrentPage] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('')
  const [userTasks, setUserTasks] = useState<string[]>([''])
  const [callTranscripts, setCallTranscripts] = useState<string[]>([''])
  const [generatedFAQs, setGeneratedFAQs] = useState<FAQItem[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showFAQEditor, setShowFAQEditor] = useState(false)
  const [editingFAQs, setEditingFAQs] = useState<FAQItem[]>([])
  const [generatedTasks, setGeneratedTasks] = useState<TaskItem[]>([])
  const [generatedConversationFlow, setGeneratedConversationFlow] = useState<string>('')
  const [showTaskEditor, setShowTaskEditor] = useState(false)
  const [editingTasks, setEditingTasks] = useState<TaskItem[]>([])
  const [staticSections, setStaticSections] = useState<{ notes: string } | null>(null)
  
  // Website data state with sessionStorage persistence
  const [websiteData, setWebsiteData] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('agent-wizard-website-data')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          // Failed to parse saved website data
        }
      }
    }
    return {
      url: '',
      content: '',  // Changed from scrapedContent
      faqs: [],
      business_context: '',  // Changed from businessContext
      tasks: '',  // Add tasks field
      isLoaded: false
    }
  })
  
  // Persist website data to sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('agent-wizard-website-data', JSON.stringify(websiteData))
    }
  }, [websiteData])
  
  // Business Configuration State (Page 3)
  const [inboundPhone, setInboundPhone] = useState<string>('')
  const [outboundPhone, setOutboundPhone] = useState<string>('+14846239963')
  
  // Preview panel state
  const [showPreview, setShowPreview] = useState(true)
  const [isTasksCollapsed, setIsTasksCollapsed] = useState(false)
  const [isConversationCollapsed, setIsConversationCollapsed] = useState(true)
  
  const { tokens, user } = useAuth()
  const { data: voices } = useVoices()

  const [configuration, setConfiguration] = useState<AgentConfiguration & { company_website?: string }>({
    basic_info: {
      agent_name: '',
      intended_role: '',
      target_industry: '',
      company_name: '',
      primary_service: '',
    }
  })

  const [selectedVoice, setSelectedVoice] = useState<string>('')
  const [welcomeMessage, setWelcomeMessage] = useState<string>('')

  // Validation state
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Validation helper functions
  const validateField = useCallback((fieldName: string, value: string): string | null => {
    switch (fieldName) {
      case 'agent_name':
        const name = value.trim()
        if (!name) return 'Agent name is required'
        if (name.length < 3) return 'Agent name must be at least 3 characters'
        if (!/^[a-zA-Z\s]+$/.test(name)) return 'Agent name can only contain letters and spaces'
        return null
      case 'intended_role':
        return value ? null : 'Agent role is required'
      case 'target_industry':
        return value ? null : 'Industry is required'
      case 'company_name':
        return value.trim() ? null : 'Company name is required'
      default:
        return null
    }
  }, [])

  const handleFieldChange = useCallback((fieldName: string, value: string, updateFunction: (value: string) => void) => {
    updateFunction(value)
    
    // Mark field as touched
    setTouchedFields(prev => new Set(prev).add(fieldName))
    
    // Validate and update error
    const error = validateField(fieldName, value)
    setFieldErrors(prev => {
      const newErrors = { ...prev }
      if (error) {
        newErrors[fieldName] = error
      } else {
        delete newErrors[fieldName]
      }
      return newErrors
    })
  }, [validateField])

  const isFieldValid = useCallback((fieldName: string): boolean => {
    return touchedFields.has(fieldName) && !fieldErrors[fieldName]
  }, [touchedFields, fieldErrors])

  const validateRequiredFields = useCallback((): { isValid: boolean; errors: string[] } => {
    const requiredFields = ['agent_name', 'intended_role', 'target_industry', 'company_name']
    const errors: string[] = []
    
    // Mark all required fields as touched
    setTouchedFields(prev => {
      const newTouched = new Set(prev)
      requiredFields.forEach(field => newTouched.add(field))
      return newTouched
    })
    
    // Validate each field
    requiredFields.forEach(field => {
      let value = ''
      switch (field) {
        case 'agent_name':
          value = configuration.basic_info.agent_name
          break
        case 'intended_role':
          value = configuration.basic_info.intended_role
          break
        case 'target_industry':
          value = configuration.basic_info.target_industry
          break
        case 'company_name':
          value = configuration.basic_info.company_name || ''
          break
      }
      
      const error = validateField(field, value)
      if (error) {
        errors.push(error)
        setFieldErrors(prev => ({ ...prev, [field]: error }))
      }
    })
    
    return { isValid: errors.length === 0, errors }
  }, [configuration.basic_info, validateField])

  // Auto-fill welcome message when agent name or company name changes
  useEffect(() => {
    if (configuration.basic_info.agent_name && configuration.basic_info.company_name) {
      const autoMessage = `Hi, I'm ${configuration.basic_info.agent_name} calling you from ${configuration.basic_info.company_name}`
      setWelcomeMessage(autoMessage)
    }
  }, [configuration.basic_info.agent_name, configuration.basic_info.company_name])

  // Initialize form data when editing
  useEffect(() => {
    if (editingAgent) {
      if (editingAgent.configuration) {
        setConfiguration(editingAgent.configuration)
      }
      setSelectedVoice(editingAgent.voice_id || '')
      setWelcomeMessage(editingAgent.welcome_message || '')
      
      // Initialize business config fields from editing agent
      if (editingAgent.inbound_phone) {
        setInboundPhone(editingAgent.inbound_phone)
      }
      if (editingAgent.outbound_phone) {
        setOutboundPhone(editingAgent.outbound_phone)
      }
    }
    
    // Initialize static sections for prompt assembly (always set when component initializes)
    if (!staticSections) {
      setStaticSections({
        notes: `##Notes
- Be concise: 2-3 sentences max, don't introduce yourself again and again, use varied language, avoid repetition, and collect all necessary details before proceeding.
- Be conversational: Use everyday language, making the chat feel friendly and casual, like talking to a friend.
- Steer the conversation back on track if it is veering off topic.
- Confirm unclear information and collect all necessary details before taking action.
- Never mention any internal functions or processes being called.
- Use empathetic and calming language when dealing with distressed users. If at any time the customer shows anger or requests a human agent, call transfer_call function.
- Use the user's name throughout the conversation to build rapport and provide reassurance.
- When mentioning dates in the past, use relative phrasing like '2 days ago', 'one week ago'.
- Remember what you are outputting is being spoken, so instead of '8:00 am' say 'eight am'. Do not use 'o-clock' in the same sentence as 'am' or 'pm'.
- Only answer questions relevant to your role. If the user asks you to do tasks outside of your scope, politely refuse and redirect the conversation.
- Never lie or make up information - accuracy is crucial for business success.`
    })
    }
  }, [editingAgent, staticSections])

  // Load website data when editing an existing agent
  useEffect(() => {
    const loadWebsiteData = async () => {
      if (editingAgent && tokens?.access_token) {
        try {
          const websiteData = await AgentAPI.getWebsiteData(editingAgent.id, tokens.access_token)
          
          if (websiteData.generated_faqs && websiteData.generated_faqs.length > 0) {
            setGeneratedFAQs(websiteData.generated_faqs)
          }
          
          if (websiteData.business_context) {
            setConfiguration(prev => ({
              ...prev,
              basic_info: { ...prev.basic_info, primary_service: websiteData.business_context || undefined }
            }))
          }
          
          if (websiteData.tasks) {
            const parsedTasks = parseTasksString(websiteData.tasks)
            setGeneratedTasks(parsedTasks)
          }
        } catch (error) {
          console.error('Failed to load website data:', error)
        }
      }
    }
    
    loadWebsiteData()
  }, [editingAgent, tokens])

  // Set default voice when voices are loaded
  useEffect(() => {
    if (voices && voices.length > 0 && !selectedVoice && !editingAgent) {
      setSelectedVoice(voices[0].id)
    }
  }, [voices, selectedVoice, editingAgent])

  // Ref to track mounted state and cleanup
  const isMountedRef = useRef(true)

  // Cleanup function to prevent memory leaks
  useEffect(() => {
    isMountedRef.current = true
    
    return () => {
      isMountedRef.current = false
      // Clear error state
      setError(null)
    }
  }, [])


  const renderPage3_BusinessConfig = () => (
    <div className="space-y-5">


      {/* Phone Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="inbound_phone" className="block text-sm font-medium text-gray-700 mb-1">
            Inbound Phone Number
          </label>
          <Input
            id="inbound_phone"
            type="tel"
            value={inboundPhone}
            onChange={(e) => setInboundPhone(e.target.value)}
            placeholder="Unavailable right now"
            className="w-full bg-gray-100"
            disabled={true}
          />
          <p className="text-xs text-gray-500 mt-1">Phone number for incoming calls</p>
        </div>
        <div>
          <label htmlFor="outbound_phone" className="block text-sm font-medium text-gray-700 mb-1">
            Outbound Phone Number
          </label>
          <div className="relative">
            <Input
              id="outbound_phone"
              type="tel"
              value="+14846239963"
              onChange={(e) => setOutboundPhone(e.target.value)}
              placeholder="+1 (555) 987-6543"
              className="w-full bg-gray-100 pr-10"
              disabled={true}
            />
            <InlineInfoTooltip text="Contact support to change this number" />
          </div>
          <p className="text-xs text-gray-500 mt-1">Phone number for outgoing calls</p>
        </div>
      </div>
    </div>
  )

  // 3-Page Navigation Logic
  const handleNextPage = useCallback(() => {
    if (currentPage === 1) {
      // Validate Page 1 before proceeding
      const validation = validateRequiredFields()
      if (!validation.isValid) {
        setError('Please fill in all required fields')
        return
      }
      setCurrentPage(2)
    } else if (currentPage === 2) {
      // Validate Page 2 before proceeding to Page 3
      // Basic validation - can be enhanced later
      setCurrentPage(3)
    }
    setError(null)
  }, [currentPage, validateRequiredFields])

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => (prev - 1) as 1 | 2 | 3)
      setError(null) // Clear any existing errors when going back
    }
  }, [currentPage])

  // Get current page title and description
  const getCurrentPageInfo = useMemo(() => {
    const pageInfo = {
      1: {
        title: 'Basic Agent Information',
        description: 'Provide basic details about your agent and company.'
      },
      2: {
        title: 'AI-Powered Prompt Generation',
        description: 'Answer a few questions to generate a comprehensive agent prompt using AI.'
      },
      3: {
        title: 'Business Configuration',
        description: 'Configure business hours, call duration, and phone settings.'
      }
    }
    return pageInfo[currentPage]
  }, [currentPage])


  const handleComplete = useCallback(async () => {
    // Check if component is still mounted
    if (!isMountedRef.current) return;
    if (!tokens?.access_token || !selectedVoice) {
      toast.error('Please select a voice for your agent')
      return
    }


    // Robust prompt selection: use generatedPrompt
    let finalPrompt = (generatedPrompt || '').trim()
    if (!finalPrompt) {
      toast.error('Please generate or enter a prompt')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Append hidden language instructions for Hindi/Hinglish voices
      const hiddenInstructions = generateHiddenLanguageInstructions(selectedVoice, voices || [])
      const promptWithHiddenInstructions = finalPrompt + hiddenInstructions
      
      // Send the full Gemini/manual prompt directly to backend
      const agentData = {
        name: configuration.basic_info.agent_name,
        voice_id: selectedVoice,
        prompt: promptWithHiddenInstructions,  // Send prompt with hidden instructions
        welcome_message: welcomeMessage || '',  // Include welcome message
        configuration_data: {
          ...configuration,
          business_hours_start: '09:00',
          business_hours_end: '17:00',
          timezone: getTimezoneFromPhone(user?.phone),
        },
        inbound_phone: inboundPhone || undefined,
        outbound_phone: outboundPhone || undefined,
        // Include website data for new agents from browser storage
        ...((!editingAgent && websiteData.isLoaded) ? { website_data: websiteData } : {})
      }
      
      // Check if we have website data for new agents
      if (!editingAgent && websiteData.isLoaded) {
        // Website data is available
      }
      
      let agent: Agent
      if (editingAgent) {
        agent = await AgentAPI.updateAgent(editingAgent.id, agentData, tokens.access_token)
        toast.success('Agent updated successfully')
      } else {
        agent = await AgentAPI.createAgentWithConfiguration(agentData, tokens.access_token)
        toast.success('Agent created successfully')
      }

      // Clear website data from browser storage after successful creation
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('agent-wizard-website-data')
      }
      
      onComplete(agent)
      handleClose()
    } catch (error) {
      console.error('Error saving agent:', error)
      setError(error instanceof Error ? error.message : 'Failed to save agent')
      toast.error('Failed to save agent')
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [tokens?.access_token, selectedVoice, generatedPrompt, configuration, editingAgent, onComplete])


  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return renderPage1_BasicInformation()
      case 2:
        return renderPage2_AIGeneration()
      case 3:
        return renderPage3_BusinessConfig()
      default:
        return renderPage1_BasicInformation()
    }
  }

  // Page 1: Agent Basic Information (from prompt-builder-pages-definition)
  const renderPage1_BasicInformation = () => {
    return (
      <div className="space-y-6">
        {/* Required fields note */}
        <div className="text-sm text-gray-600 mb-4">
          <span className="text-red-500">*</span> indicates required fields
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ValidatedInput
            label="Agent's Name"
            field="agent_name"
            value={configuration.basic_info.agent_name}
            onChange={(value) => 
              setConfiguration(prev => ({
                ...prev,
                basic_info: { ...prev.basic_info, agent_name: value }
              }))
            }
            placeholder="e.g., Stacy"
            required
            touchedFields={touchedFields}
            fieldErrors={fieldErrors}
            isFieldValid={isFieldValid}
            handleFieldChange={handleFieldChange}
          />

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Agent's Role <span className="text-red-500">*</span>
              <InfoTooltip text="Defines the primary purpose of your agent" width="w-48" />
            </label>
            <div className="relative">
              <select
                value={configuration.basic_info.intended_role}
                onChange={(e) => handleFieldChange('intended_role', e.target.value, (value) =>
                  setConfiguration(prev => ({
                    ...prev,
                    basic_info: { ...prev.basic_info, intended_role: value }
                  }))
                )}
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 text-gray-900 placeholder-gray-400 font-medium pr-10 ${
                  touchedFields.has('intended_role') && fieldErrors['intended_role'] ? 'border-red-500' : ''
                }`}
              >
                <option value="" className="text-gray-400">Select Role</option>
                <option value="Lead Qualification" className="text-gray-900">Lead Qualification</option>
              </select>
              {isFieldValid('intended_role') && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
              )}
            </div>
            {touchedFields.has('intended_role') && fieldErrors['intended_role'] && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors['intended_role']}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Agent's Industry <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={configuration.basic_info.target_industry}
                onChange={(e) => handleFieldChange('target_industry', e.target.value, (value) =>
                  setConfiguration(prev => ({
                    ...prev,
                    basic_info: { ...prev.basic_info, target_industry: value }
                  }))
                )}
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 text-gray-900 placeholder-gray-400 font-medium pr-10 ${
                  touchedFields.has('target_industry') && fieldErrors['target_industry'] ? 'border-red-500' : ''
                }`}
              >
                <option value="" className="text-gray-400">Select Industry</option>
                <option value="Automotive" className="text-gray-900">Automotive</option>
                <option value="Real Estate" className="text-gray-900">Real Estate</option>
                <option value="Healthcare" className="text-gray-900">Healthcare</option>
                <option value="Technology/SaaS" className="text-gray-900">Technology/SaaS</option>
                <option value="Insurance" className="text-gray-900">Insurance</option>
                <option value="Finance" className="text-gray-900">Finance</option>
                <option value="Retail" className="text-gray-900">Retail</option>
                <option value="Education" className="text-gray-900">Education</option>
                <option value="Other" className="text-gray-900">Other</option>
              </select>
              {isFieldValid('target_industry') && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
              )}
            </div>
            {touchedFields.has('target_industry') && fieldErrors['target_industry'] && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors['target_industry']}</p>
            )}
          </div>

          <ValidatedInput
            label="Company/Business Name"
            field="company_name"
            value={configuration.basic_info.company_name || ''}
            onChange={(value) =>
              setConfiguration(prev => ({
                ...prev,
                basic_info: { ...prev.basic_info, company_name: value }
              }))
            }
            placeholder="e.g., Retell Auto / Dream Homes Realty"
            required
            touchedFields={touchedFields}
            fieldErrors={fieldErrors}
            isFieldValid={isFieldValid}
            handleFieldChange={handleFieldChange}
            tooltip={`The agent will introduce itself using this name, e.g., "Hi, I'm calling from ${configuration.basic_info.company_name || '[Company Name]'}"`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Company Website URL
              <InfoTooltip text="Lets us analyze your website to automatically generate FAQs and extract business context for a smoother setup." />
            </label>
            <div className="relative">
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <Input
                    value={configuration.company_website || ''}
                    onChange={(e) => setConfiguration(prev => ({
                      ...prev,
                      company_website: e.target.value
                    }))}
                    placeholder="https://example.com"
                    className="bg-gray-50 text-gray-900 placeholder-gray-400 font-medium"
                  />
                </div>
                <LoadingButton
                  onClick={handleWebsiteScraping}
                  isLoading={isGenerating}
                  text="Generate FAQs"
                  loadingText="Analyzing..."
                  disabled={!configuration.company_website}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Select Voice
              <InfoTooltip text="Determines the accent, language, speaking style of your agent. Choose a voice that aligns with your target audience." />
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 text-gray-900 placeholder-gray-400 font-medium"
            >
              <option value="">Choose a voice...</option>
              {voices?.map((voice: any) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Welcome Message
            <InfoTooltip text="The initial greeting your agent will use to start conversations. This sets the tone and provides context for the call recipient." />
          </label>
          <div className="relative">
            <input
              type="text"
              value={welcomeMessage || ''}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              placeholder="Hi, I'm [Agent Name] calling you on behalf of [Company Name]"
              className="w-full px-3 py-2 text-sm bg-gray-50 text-gray-900 placeholder-gray-400 font-medium border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 overflow-x-auto whitespace-nowrap"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#CBD5E0 #F7FAFC' }}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Business Context
            <InfoTooltip text="Helps the AI understand your business for better conversations" />
          </label>
          <textarea
            value={configuration.basic_info.primary_service || ''}
            onChange={(e) => setConfiguration(prev => ({
              ...prev,
              basic_info: { ...prev.basic_info, primary_service: e.target.value }
            }))}
            placeholder={isGenerating ? "🔍 Analyzing your website to understand your business..." : "Provide a brief overview of your business, including what services you offer, your target audience, and what makes your business unique. This will help the AI agent better represent your company."}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none bg-gray-50 text-gray-900 placeholder-gray-400"
            rows={5}
            style={{
              minHeight: '120px',
              maxHeight: '150px'
            }}
          />
        </div>

      </div>
    )
  }

  // Page 2: AI-Powered Prompt Generation
  const renderPage2_AIGeneration = () => {
    return (
      <div className="space-y-6">
            {/* Call Transcripts Section */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Call Transcripts (Optional)
                <InfoTooltip text="Add sample call transcripts to help the agent learn your conversation style" />
              </label>
              
              <DynamicList
                items={callTranscripts}
                onItemChange={(index, value) => {
                  const newTranscripts = [...callTranscripts]
                  newTranscripts[index] = value
                  setCallTranscripts(newTranscripts)
                }}
                onItemRemove={(index) => setCallTranscripts(callTranscripts.filter((_, i) => i !== index))}
                onItemAdd={() => setCallTranscripts([...callTranscripts, ''])}
                placeholder="Enter a call transcript..."
                textArea={true}
              />
            </div>

            {/* Tasks Section with Generate Button */}
            <div className="space-y-4">
                <MainCollapsibleSection
                  title="Generated Tasks"
                  isCollapsed={isTasksCollapsed}
                  onToggle={setIsTasksCollapsed}
                  actionButtons={
                    generatedTasks.length > 0 && (
                      <>
                        <button
                          onClick={handleGenerateTasks}
                          disabled={isGenerating}
                          className="text-gray-500 hover:text-gray-700 transition-colors"
                          title="Regenerate Tasks"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowTaskEditor(true)}
                          className="text-gray-500 hover:text-gray-700 transition-colors"
                          title="Edit Tasks"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </>
                    )
                  }
                >
                  <>
                    {generatedTasks.length === 0 ? (
                      <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <p className="text-gray-600 mb-4">
                          {callTranscripts.some(t => t.trim()) 
                            ? 'Generate tasks from your call transcript, FAQs and business context' 
                            : 'Generate tasks based on your FAQs and business context'}
                        </p>
                        <GenerateButton
                          onClick={() => {
                            try {
                              handleGenerateTasks()
                            } catch (e: any) {
                              toast.error('Error generating tasks')
                            }
                          }}
                          isLoading={isGenerating}
                          text="Generate Tasks"
                          variant="green"
                        />
                      </div>
                    ) : (
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="space-y-3">
                          {generatedTasks.map((task, index) => (
                            <div key={index} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                              <h4 className="font-medium text-gray-800">
                                {index + 1}. {stripTaskNumber(task.task)}
                              </h4>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                </MainCollapsibleSection>
              </div>


            {/* Conversation Flow Section */}
            <div className="space-y-4">
              <MainCollapsibleSection
                title="Example Conversation"
                isCollapsed={isConversationCollapsed}
                onToggle={setIsConversationCollapsed}
                actionButtons={
                  generatedConversationFlow && (
                    <button
                      onClick={handleGenerateConversationFlow}
                      disabled={isGenerating}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                      title="Regenerate Conversation Flow"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )
                }
              >
                {!generatedConversationFlow ? (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <p className="text-gray-600 mb-4">
                      Generate an example conversation flow for your agent
                    </p>
                    <GenerateButton
                      onClick={handleGenerateConversationFlow}
                      isLoading={isGenerating}
                      text="Generate Conversation Flow"
                      disabled={generatedTasks.length === 0}
                      variant="purple"
                    />
                    {generatedTasks.length === 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        Please generate tasks first
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-lg border">
                    <pre className="whitespace-pre-wrap text-sm text-gray-600 max-h-64 overflow-y-auto">
                      {generatedConversationFlow}
                    </pre>
                  </div>
                )}
              </MainCollapsibleSection>
            </div>

      </div>
    )
  }

  // Common function to show generation time toast
  const showGenerationTimeToast = (task: string, timeRange: string) => {
    toast(() => (
      <div className="flex items-center space-x-2">
        <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
        <div>
          <div className="font-medium">Generating {task}...</div>
          <div className="text-sm text-gray-500">This will take {timeRange}</div>
        </div>
      </div>
    ), {
      duration: 4000,
      position: 'top-center',
    })
  }

  // Website Scraping Handler
  const handleWebsiteScraping = useCallback(async () => {
    if (!isMountedRef.current) return
    if (!configuration.company_website || !tokens?.access_token) {
      if (!tokens?.access_token) {
        toast.error('Authentication required')
      } else if (!configuration.company_website) {
        toast.error('Please enter a website URL')
      }
      return
    }

    setIsGenerating(true)
    setError(null)
    showGenerationTimeToast('FAQs', '20-40 seconds')

    try {
      // Use the same wizard endpoints for both new and existing agents
      const scrapeResponse = await AgentAPI.scrapeWebsite({
        website_url: configuration.company_website
      }, tokens.access_token)
      
      // Scrape response received

      if (!isMountedRef.current) return

      const faqResponse = await AgentAPI.generateFAQs({
        content: scrapeResponse.content
      }, tokens.access_token)
      
      // FAQ response received

      if (!isMountedRef.current) return

      setGeneratedFAQs(faqResponse.faqs)
      
      // Update business context if provided
      if (faqResponse.business_context) {
        setConfiguration(prev => ({
          ...prev,
          basic_info: { ...prev.basic_info, primary_service: faqResponse.business_context }
        }))
      }
      
      // For new agents, store everything in browser state
      if (!editingAgent) {
        setWebsiteData({
          url: configuration.company_website,
          content: scrapeResponse.content || '',  // Ensure not undefined
          faqs: faqResponse.faqs || [],
          business_context: faqResponse.business_context || '',  // Ensure not undefined
          tasks: '',  // Tasks will be generated separately if needed
          isLoaded: true
        })
      }
      
      toast.success('Website content analyzed and FAQs generated successfully!')
    } catch (error: any) {
      if (isMountedRef.current) {
        const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to analyze website'
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } finally {
      if (isMountedRef.current) {
        setIsGenerating(false)
      }
    }
  }, [configuration.company_website, tokens?.access_token, editingAgent?.id])

  // Task Generation Handler
  const handleGenerateTasks = useCallback(async () => {
    if (!isMountedRef.current) return
    if (!tokens?.access_token) return

    const transcript = callTranscripts.find(t => t.trim()) || ''
    
    // Check if we have either transcript or FAQs
    if (!transcript && generatedFAQs.length === 0) {
      toast.error('Please provide a call transcript or generate FAQs first')
      return
    }

    setIsGenerating(true)
    setError(null)
    showGenerationTimeToast('Tasks', '25-30 seconds')

    try {
      // For new agents, use temporary ID
      const tempAgentId = editingAgent?.id || 'temp-' + Date.now()
      
      // Prepare website data to send
      const websiteDataToSend = {
        business_context: websiteData?.business_context || '',
        faqs: generatedFAQs || []
      }
      
      // Generate tasks
      const tasksResponse = await AgentAPI.generateTasks({
        agent_id: tempAgentId,
        transcript: transcript || undefined,  // Send undefined if no transcript
        user_tasks: userTasks.filter(t => t.trim()),
        website_data: websiteDataToSend,
        agent_role: configuration.basic_info.intended_role
      }, tokens.access_token)

      if (!isMountedRef.current) return

      // Parse tasks string into TaskItem array
      const parsedTasks = parseTasksString(tasksResponse.tasks)
      // Force state update with callback to ensure it's set
      setGeneratedTasks([...parsedTasks])
      
      // Update websiteData with the tasks string so it gets saved
      setWebsiteData((prev: any) => ({
        ...prev,
        tasks: tasksResponse.tasks
      }))
      
      toast.success('Tasks generated successfully!')
    } catch (error: any) {
      if (isMountedRef.current) {
        const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to generate tasks'
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } finally {
      if (isMountedRef.current) {
        setIsGenerating(false)
      }
    }
  }, [callTranscripts, userTasks, tokens?.access_token, editingAgent?.id, generatedFAQs])

  // Conversation Flow Generation Handler
  const handleGenerateConversationFlow = useCallback(async () => {
    if (!isMountedRef.current) return
    if (!tokens?.access_token) return

    // Check if we have tasks generated
    if (generatedTasks.length === 0) {
      toast.error('Please generate tasks first')
      return
    }

    setIsGenerating(true)
    setError(null)
    showGenerationTimeToast('Example Conversation', '10-15 seconds')

    try {
      // For new agents, use temporary ID
      const tempAgentId = editingAgent?.id || 'temp-' + Date.now()
      const transcript = callTranscripts.find(t => t.trim()) || ''
      
      // Generate conversation flow
      const conversationResponse = await AgentAPI.generateConversationFlow({
        agent_id: tempAgentId,
        transcript: transcript || undefined,  // Send undefined if no transcript
        tasks: tasksToString(generatedTasks)
      }, tokens.access_token)

      if (!isMountedRef.current) return

      setGeneratedConversationFlow(conversationResponse.conversation_flow)
      toast.success('Conversation flow generated successfully!')
    } catch (error: any) {
      if (isMountedRef.current) {
        const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to generate conversation flow'
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } finally {
      if (isMountedRef.current) {
        setIsGenerating(false)
      }
    }
  }, [callTranscripts, tokens?.access_token, editingAgent?.id, generatedTasks])

  // Generate role section dynamically
  const roleSection = useMemo(() => {
    if (configuration.basic_info.agent_name && configuration.basic_info.intended_role && 
        configuration.basic_info.company_name && configuration.basic_info.target_industry) {
      return generateRoleSection(
        configuration.basic_info.agent_name,
        configuration.basic_info.intended_role,
        configuration.basic_info.company_name,
        configuration.basic_info.target_industry
      )
    }
    return ''
  }, [configuration.basic_info])

  // Generate language line based on voice selection
  const languageLine = useMemo(() => {
    if (selectedVoice && voices) {
      const language = getLanguageFromVoice(selectedVoice, voices)
      return generateLanguageLine(language)
    }
    return ''
  }, [selectedVoice, voices])

  // Real-time prompt assembly (frontend-based)
  const assembledPrompt = useMemo(() => {
    if (!staticSections) {
      return ''
    }
    
    const parts = []
    
    // Add role section
    if (roleSection) {
      parts.push(`#ROLE\n${roleSection}`)
    }
    
    // Add language line
    if (languageLine) {
      parts.push(`\n${languageLine}`)
    }
    
    // Add business context section
    if (configuration.basic_info.primary_service) {
      parts.push(`\n\n#Business Context\n${configuration.basic_info.primary_service}`)
    }
    
    // Add tasks section
    if (generatedTasks.length > 0) {
      parts.push(`\n\n${tasksToString(generatedTasks)}`)
    }
    
    // Add example conversation
    if (generatedConversationFlow) {
      parts.push(`\n\n#Example Conversation\n${generatedConversationFlow}`)
    }
    
    // Add hardcoded sections with proper spacing (only if business context exists)
    if (configuration.basic_info.primary_service) {
      parts.push(`\n\n${staticSections.notes}`)
    }
    
    // Add FAQs section
    if (generatedFAQs.length > 0) {
      let faqSection = "#FAQs\nHere are some frequently asked questions you should be prepared to answer:\n"
      generatedFAQs.forEach((faq, index) => {
        faqSection += `${index + 1}. Q ${faq.question}\n   A ${faq.answer}\n\n`
      })
      parts.push(`\n\n${faqSection}`)
    }
    
    const finalPrompt = parts.join('')
    return finalPrompt
  }, [roleSection, languageLine, generatedTasks, generatedConversationFlow, generatedFAQs, staticSections, configuration.basic_info.primary_service])

  // Update generatedPrompt whenever assembledPrompt changes
  useEffect(() => {
    // Only update if content actually changed to prevent infinite loops
    if (assembledPrompt && assembledPrompt !== generatedPrompt) {
      setGeneratedPrompt(assembledPrompt)
    }
  }, [assembledPrompt]) // Removed generatedPrompt from deps to avoid circular dependency



  const handleClose = useCallback(() => {
    // Clear website data from browser storage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('agent-wizard-website-data')
    }
    
    // Reset all state
    setCurrentPage(1)
    setConfiguration({
      basic_info: {
        agent_name: '',
        intended_role: '',
        target_industry: '',
        company_name: '',
        primary_service: ''
      }
    })
    setSelectedVoice('')
    setError(null)
    setGeneratedPrompt('')
    setUserTasks([''])
    setCallTranscripts([''])
    setGeneratedTasks([])
    setGeneratedFAQs([])
    setGeneratedConversationFlow('')
    setLoading(false)
    setIsGenerating(false)
    setShowFAQEditor(false)
    setEditingFAQs([])
    setShowTaskEditor(false)
    setEditingTasks([])
    setStaticSections(null)
    setWebsiteData({
      agent_id: '',
      website_url: '',
      scraped_content: '',
      generated_faqs: []
    })
    setInboundPhone('')
    setOutboundPhone('+14846239963')
    setWelcomeMessage('')
    setTouchedFields(new Set())
    setFieldErrors({})
    setShowPreview(true)
    
    onClose()
  }, [onClose])

  const currentPageInfo = getCurrentPageInfo

  const handleTogglePreview = useCallback(() => {
    setShowPreview(!showPreview)
  }, [showPreview])

  // Extract variables from final prompt
  const extractedVariables = useMemo(() => {
    const finalPrompt = generatedPrompt
    if (finalPrompt) {
      return extractVariablesFromPrompt(finalPrompt)
    }
    // Also extract from tasks if available
    if (generatedTasks && generatedTasks.length > 0) {
      return extractVariablesFromPrompt(tasksToString(generatedTasks))
    }
    return []
  }, [generatedPrompt, generatedTasks])

  // FAQ Editor Modal Component
  const FAQEditorModal = memo(() => {

    const handleSaveFAQs = async () => {
      if (!tokens?.access_token) {
        toast.error('Authentication required')
        return
      }
      
      try {
        setIsGenerating(true)
        await AgentAPI.updateFAQs({
          agent_id: editingAgent?.id || '',
          faqs: editingFAQs
        }, tokens.access_token)
        setGeneratedFAQs(editingFAQs)
        setShowFAQEditor(false)
        toast.success('FAQs updated successfully!')
      } catch (error) {
        toast.error('Failed to update FAQs')
      } finally {
        setIsGenerating(false)
      }
    }

    const handleAddFAQ = () => {
      setEditingFAQs([...editingFAQs, { question: '', answer: '' }])
    }

    const handleDeleteFAQ = (index: number) => {
      if (editingFAQs.length <= 5) {
        toast.error('Must maintain at least 5 FAQs')
        return
      }
      const newFAQs = editingFAQs.filter((_, i) => i !== index)
      setEditingFAQs(newFAQs)
    }

    return (
      <Modal 
        isOpen={showFAQEditor} 
        onClose={() => setShowFAQEditor(false)} 
        title="Edit FAQs"
        size="lg" 
        zIndex={100}
      >
        <div className="p-6">
          <p className="text-gray-600 mb-4">Edit the generated FAQ questions and answers below.</p>
          
          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2 mb-4">
            {editingFAQs.map((faq, index) => (
              <div key={index} className="group relative bg-gray-50 rounded-md p-2 hover:bg-gray-100 transition-colors">
                <div className="flex items-start gap-2">
                  <span className="text-gray-500 font-medium text-sm mt-1">{index + 1}.</span>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-600">Q:</span>
                      <textarea
                        value={faq.question}
                        onChange={(e) => {
                          const newFAQs = [...editingFAQs]
                          newFAQs[index] = { ...newFAQs[index], question: e.target.value }
                          setEditingFAQs(newFAQs)
                        }}
                        className="flex-1 p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none min-h-[40px]"
                        placeholder="Enter question..."
                      />
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-medium text-gray-600">A:</span>
                      <textarea
                        value={faq.answer}
                        onChange={(e) => {
                          const newFAQs = [...editingFAQs]
                          newFAQs[index] = { ...newFAQs[index], answer: e.target.value }
                          setEditingFAQs(newFAQs)
                        }}
                        className="flex-1 p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none min-h-[50px]"
                        placeholder="Enter answer..."
                      />
                    </div>
                  </div>

                  {editingFAQs.length > 5 && (
                    <button
                      onClick={() => handleDeleteFAQ(index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
                      title="Delete FAQ"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <Button
            variant="outline"
            onClick={handleAddFAQ}
            className="w-full border-dashed mb-4"
          >
            <span className="flex items-center gap-2">
              <span className="text-lg">+</span>
              Add FAQ
            </span>
          </Button>
          
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowFAQEditor(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveFAQs}
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isGenerating ? 'Saving...' : 'Save FAQs'}
            </Button>
          </div>
        </div>
      </Modal>
    )
  })

  // Task Editor Modal Component
  const TaskEditorModal = memo(() => {

    const handleSaveTasks = async () => {
      if (!tokens?.access_token) {
        toast.error('Authentication required')
        return
      }
      
      try {
        setIsGenerating(true)
        // Convert tasks back to string format for API
        const tasksString = tasksToString(editingTasks)
        await AgentAPI.updateTasks({
          agent_id: editingAgent?.id || '',
          tasks: tasksString
        }, tokens.access_token)
        setGeneratedTasks(editingTasks)
        
        // Update websiteData with the updated tasks string
        setWebsiteData((prev: any) => ({
          ...prev,
          tasks: tasksString
        }))
        
        setShowTaskEditor(false)
        toast.success('Tasks updated successfully!')
      } catch (error) {
        toast.error('Failed to update tasks')
      } finally {
        setIsGenerating(false)
      }
    }

    const handleAddTask = () => {
      setEditingTasks([...editingTasks, { task: '' }])
    }

    const handleDeleteTask = (index: number) => {
      if (editingTasks.length <= 3) {
        toast.error('Must maintain at least 3 tasks')
        return
      }
      const newTasks = editingTasks.filter((_, i) => i !== index)
      setEditingTasks(newTasks)
    }

    return (
      <Modal 
        isOpen={showTaskEditor} 
        onClose={() => setShowTaskEditor(false)} 
        title="Edit Tasks"
        size="lg" 
        zIndex={100}
      >
        <div className="p-6">
          <p className="text-gray-600 mb-4">Edit the generated tasks below.</p>
          
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 mb-4">
            {editingTasks.map((task, index) => (
              <div key={index} className="group relative bg-gray-50 rounded-md p-3 hover:bg-gray-100 transition-colors">
                <div className="flex items-start gap-2">
                  <span className="text-gray-500 font-medium text-sm mt-1">{index + 1}.</span>
                  
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={task.task}
                      onChange={(e) => {
                        const newTasks = [...editingTasks]
                        newTasks[index] = { ...newTasks[index], task: e.target.value }
                        setEditingTasks(newTasks)
                      }}
                      className="w-full p-2 text-sm font-medium border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter task title..."
                    />
                  </div>

                  {editingTasks.length > 3 && (
                    <button
                      onClick={() => handleDeleteTask(index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
                      title="Delete Task"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <Button
            variant="outline"
            onClick={handleAddTask}
            className="w-full border-dashed mb-4"
          >
            <span className="flex items-center gap-2">
              <span className="text-lg">+</span>
              Add Task
            </span>
          </Button>
          
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowTaskEditor(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveTasks}
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isGenerating ? 'Saving...' : 'Save Tasks'}
            </Button>
          </div>
        </div>
      </Modal>
    )
  })

  return (
    <>
      <FAQEditorModal />
      <TaskEditorModal />
      <ErrorBoundary>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={currentPageInfo.title}
        size="6xl"
        headerActions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleTogglePreview}
          >
            {showPreview ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
        }
      >
        <div className="flex h-full max-h-[calc(90vh-120px)] min-h-[600px]">
          {/* Main Form Content */}
          <div className={`flex flex-col transition-all duration-300 ${
            showPreview ? 'w-2/3' : 'w-full'
          }`}>
            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Progress Indicator */}
                <div className="flex items-center justify-center">
                  <div className="flex items-center space-x-6">
                    {[
                      { page: 1, label: 'Basic Info' },
                      { page: 2, label: 'AI Setup' },
                      { page: 3, label: 'Configuration' }
                    ].map(({ page, label }) => (
                      <div key={page} className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            page === currentPage
                              ? 'bg-blue-600 text-white'
                              : page < currentPage
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {page}
                        </div>
                        <span className={`text-xs mt-1 ${
                          page === currentPage
                            ? 'text-blue-600 font-medium'
                            : page < currentPage
                            ? 'text-green-600'
                            : 'text-gray-500'
                        }`}>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Page Content */}
                <div>
                  {renderPage()}
                </div>

                {/* Error Messages */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="text-red-800 text-sm">{error}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Footer - Fixed at bottom */}
            <div className="border-t border-gray-200 px-6 py-4 bg-white">
              <div className="flex justify-between">
                {currentPage > 1 ? (
                  <Button
                    onClick={handlePreviousPage}
                    disabled={loading}
                    variant="outline"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                ) : (
                  <div></div>
                )}

                {currentPage === 3 ? (
                  <Button
                    onClick={handleComplete}
                    disabled={loading || !selectedVoice}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {loading ? 'Creating Agent...' : editingAgent ? 'Update Agent' : 'Create Agent'}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextPage}
                    disabled={loading}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Prompt Preview */}
          {showPreview && (
            <div className="w-1/3 transition-all duration-300">
              <PromptPreview
                configuration={configuration}
                welcomeMessage={welcomeMessage}
                generatedPrompt={generatedPrompt}
                faqs={generatedFAQs}
                onEditFAQs={() => {
                  setEditingFAQs([...generatedFAQs])
                  setShowFAQEditor(true)
                }}
                roleSection={roleSection}
                tasks={generatedTasks}
                onEditTasks={() => {
                  setEditingTasks([...generatedTasks])
                  setShowTaskEditor(true)
                }}
                conversationFlow={generatedConversationFlow}
                languageLine={languageLine}
                extractedVariables={extractedVariables}
              />
            </div>
          )}
        </div>
      </Modal>
    </ErrorBoundary>
    </>
  )
}

// Export memoized component to prevent unnecessary re-renders
export const AgentWizard = memo(AgentWizardComponent)