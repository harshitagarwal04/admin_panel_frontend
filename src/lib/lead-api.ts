import { Lead } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://voice-ai-admin-api-762279639608.us-central1.run.app/api/v1'

interface LeadResponse {
  id: string
  agent_id: string
  first_name: string
  phone_e164: string
  status: 'new' | 'in_progress' | 'done' | 'stopped'
  custom_fields: Record<string, any>
  schedule_at: string
  attempts_count: number
  disposition?: string
  created_at: string
  updated_at: string
  is_verified?: boolean
  verification_method?: 'otp' | null
  verified_at?: string | null
}

interface LeadListResponse {
  leads: LeadResponse[]
  total: number
  page: number
  per_page: number
}

interface CreateLeadRequest {
  agent_id: string
  first_name: string
  phone_e164: string
  custom_fields?: Record<string, any>
  schedule_at?: string
}

interface UpdateLeadRequest {
  first_name?: string
  phone_e164?: string
  status?: 'new' | 'in_progress' | 'done' | 'stopped'
  custom_fields?: Record<string, any>
  schedule_at?: string
  disposition?: string
}

interface CSVImportResponse {
  success_count: number
  error_count: number
  errors: Array<{
    row: number
    error: string
  }>
  total_processed: number
}

export class LeadAPI {
  private static getAuthHeaders(accessToken: string) {
    return {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    }
  }

  static async createLead(leadData: CreateLeadRequest, accessToken: string): Promise<Lead> {
    const response = await fetch(`${API_BASE_URL}/leads/`, {
      method: 'POST',
      headers: this.getAuthHeaders(accessToken),
      body: JSON.stringify(leadData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to create lead')
    }

    const data = await response.json()
    return this.transformLeadResponse(data as LeadResponse)
  }

  static async getLeads(
    accessToken: string,
    options: {
      agent_id?: string
      status_filter?: 'new' | 'in_progress' | 'done' | 'stopped'
      search?: string
      page?: number
      per_page?: number
    } = {}
  ): Promise<LeadListResponse> {
    const params = new URLSearchParams()
    if (options.agent_id) params.append('agent_id', options.agent_id)
    if (options.status_filter) params.append('status_filter', options.status_filter)
    if (options.search) params.append('search', options.search)
    if (options.page) params.append('page', options.page.toString())
    if (options.per_page) params.append('per_page', options.per_page.toString())

    const response = await fetch(`${API_BASE_URL}/leads/?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(accessToken),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to fetch leads')
    }

    const data: LeadListResponse = await response.json()
    return {
      ...data,
      leads: data.leads.map(lead => this.transformLeadResponse(lead))
    }
  }

  static async getLead(leadId: string, accessToken: string): Promise<Lead> {
    const response = await fetch(`${API_BASE_URL}/leads/${leadId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(accessToken),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to fetch lead')
    }

    const data = await response.json()
    return this.transformLeadResponse(data as LeadResponse)
  }

  static async updateLead(
    leadId: string,
    leadData: UpdateLeadRequest,
    accessToken: string
  ): Promise<Lead> {
    const response = await fetch(`${API_BASE_URL}/leads/${leadId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(accessToken),
      body: JSON.stringify(leadData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to update lead')
    }

    const data = await response.json()
    return this.transformLeadResponse(data as LeadResponse)
  }

  static async deleteLead(leadId: string, accessToken: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/leads/${leadId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(accessToken),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to delete lead')
    }

    return response.json()
  }

  static async importCSV(
    file: File,
    agentId: string,
    accessToken: string
  ): Promise<CSVImportResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/leads/csv-import?agent_id=${agentId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to import CSV')
    }

    return response.json()
  }

  static async scheduleCall(leadId: string, accessToken: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/calls/schedule`, {
      method: 'POST',
      headers: this.getAuthHeaders(accessToken),
      body: JSON.stringify({ lead_id: leadId }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to schedule call')
    }

    return response.json()
  }

  static async stopLead(leadId: string, accessToken: string, disposition?: string): Promise<Lead> {
    const url = new URL(`${API_BASE_URL}/leads/${leadId}/stop`)
    if (disposition) {
      url.searchParams.append('disposition', disposition)
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: this.getAuthHeaders(accessToken),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to stop lead')
    }

    const data = await response.json()
    return this.transformLeadResponse(data as LeadResponse)
  }

  static async requestVerification(leadId: string, accessToken: string): Promise<{
    verification_id: string
    message: string
    expires_in_seconds: number
  }> {
    const response = await fetch(`${API_BASE_URL}/leads/${leadId}/request-verification`, {
      method: 'POST',
      headers: this.getAuthHeaders(accessToken),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to request verification')
    }

    return response.json()
  }

  static async verifyLead(
    leadId: string,
    verificationId: string,
    otpCode: string,
    accessToken: string
  ): Promise<Lead> {
    const response = await fetch(`${API_BASE_URL}/leads/${leadId}/verify`, {
      method: 'POST',
      headers: this.getAuthHeaders(accessToken),
      body: JSON.stringify({
        verification_id: verificationId,
        otp_code: otpCode
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to verify lead')
    }

    const data = await response.json()
    return this.transformLeadResponse(data as LeadResponse)
  }

  private static transformLeadResponse(data: LeadResponse): Lead {
    return {
      id: data.id,
      agent_id: data.agent_id,
      first_name: data.first_name,
      phone_e164: data.phone_e164,
      status: data.status,
      custom_fields: data.custom_fields,
      schedule_at: data.schedule_at,
      attempts_count: data.attempts_count,
      disposition: data.disposition,
      created_at: data.created_at,
      updated_at: data.updated_at,
      is_verified: data.is_verified ?? false,
      verification_method: data.verification_method ?? null,
      verified_at: data.verified_at ?? null
    }
  }
}