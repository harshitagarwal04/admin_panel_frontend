import { Agent, Voice } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

interface AgentResponse {
  id: string
  company_id: string
  name: string
  prompt: string
  welcome_message: string
  voice_id: string
  status: 'active' | 'inactive'
  variables: Record<string, any>
  functions: string[]
  inbound_phone?: string
  outbound_phone?: string
  max_attempts: number
  retry_delay_minutes: number
  business_hours_start: string
  business_hours_end: string
  timezone: string
  max_call_duration_minutes: number
  retell_agent_id?: string
  created_at: string
  updated_at: string
}

interface AgentListResponse {
  agents: AgentResponse[]
  total: number
  page: number
  per_page: number
}

interface VoiceResponse {
  id: string
  name: string
  provider: string
  gender: 'male' | 'female'
  language: string
  accent: string
  sample_url?: string
  is_active: boolean
}

interface CreateAgentRequest {
  name: string
  prompt: string
  welcome_message?: string
  voice_id?: string
  variables?: Record<string, any>
  functions?: string[]
  inbound_phone?: string
  outbound_phone?: string
  max_attempts?: number
  retry_delay_minutes?: number
  business_hours_start?: string
  business_hours_end?: string
  timezone?: string
  max_call_duration_minutes?: number
}

interface UpdateAgentRequest extends Partial<CreateAgentRequest> {}

export class AgentAPI {
  private static getAuthHeaders(accessToken: string) {
    return {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    }
  }

  static async createAgent(agentData: CreateAgentRequest, accessToken: string): Promise<Agent> {
    const response = await fetch(`${API_BASE_URL}/agents/`, {
      method: 'POST',
      headers: this.getAuthHeaders(accessToken),
      body: JSON.stringify(agentData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to create agent')
    }

    const data: AgentResponse = await response.json()
    return this.transformAgentResponse(data)
  }

  static async getAgents(
    accessToken: string,
    options: {
      page?: number
      per_page?: number
      status_filter?: 'active' | 'inactive'
    } = {}
  ): Promise<AgentListResponse> {
    const params = new URLSearchParams()
    if (options.page) params.append('page', options.page.toString())
    if (options.per_page) params.append('per_page', options.per_page.toString())
    if (options.status_filter) params.append('status_filter', options.status_filter)

    const response = await fetch(`${API_BASE_URL}/agents/?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(accessToken),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to fetch agents')
    }

    const data: AgentListResponse = await response.json()
    return {
      ...data,
      agents: data.agents.map(agent => this.transformAgentResponse(agent))
    }
  }

  static async getAgent(agentId: string, accessToken: string): Promise<Agent> {
    const response = await fetch(`${API_BASE_URL}/agents/${agentId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(accessToken),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to fetch agent')
    }

    const data: AgentResponse = await response.json()
    return this.transformAgentResponse(data)
  }

  static async updateAgent(
    agentId: string,
    agentData: UpdateAgentRequest,
    accessToken: string
  ): Promise<Agent> {
    const response = await fetch(`${API_BASE_URL}/agents/${agentId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(accessToken),
      body: JSON.stringify(agentData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to update agent')
    }

    const data: AgentResponse = await response.json()
    return this.transformAgentResponse(data)
  }

  static async toggleAgentStatus(agentId: string, accessToken: string): Promise<{ status: string }> {
    const response = await fetch(`${API_BASE_URL}/agents/${agentId}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(accessToken),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to toggle agent status')
    }

    return response.json()
  }

  static async deleteAgent(agentId: string, accessToken: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/agents/${agentId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(accessToken),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to delete agent')
    }

    return response.json()
  }

  static async getVoices(accessToken: string): Promise<Voice[]> {
    const response = await fetch(`${API_BASE_URL}/agents/voices/`, {
      method: 'GET',
      headers: this.getAuthHeaders(accessToken),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to fetch voices')
    }

    const data: VoiceResponse[] = await response.json()
    return data.map(voice => ({
      id: voice.id,
      name: voice.name,
      gender: voice.gender,
      language: voice.language,
      retell_voice_id: voice.id
    }))
  }

  private static transformAgentResponse(data: AgentResponse): Agent {
    return {
      id: data.id,
      company_id: data.company_id,
      name: data.name,
      status: data.status,
      prompt: data.prompt,
      variables: data.variables,
      welcome_message: data.welcome_message,
      voice_id: data.voice_id,
      functions: data.functions,
      inbound_phone: data.inbound_phone,
      outbound_phone: data.outbound_phone,
      max_attempts: data.max_attempts,
      retry_delay_minutes: data.retry_delay_minutes,
      business_hours_start: data.business_hours_start,
      business_hours_end: data.business_hours_end,
      timezone: data.timezone,
      max_call_duration_minutes: data.max_call_duration_minutes,
      retell_agent_id: data.retell_agent_id,
      retell_llm_id: '', // Not provided by backend
      created_at: data.created_at,
      updated_at: data.updated_at
    }
  }
}