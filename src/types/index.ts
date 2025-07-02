export interface User {
  id: string
  email: string
  name: string
  phone?: string
  google_id: string
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  admin_user_id: string
  max_agents_limit: number
  max_concurrent_calls: number
  total_minutes_limit?: number
  total_minutes_used: number
  max_contact_attempts: number // New field for max attempts limit
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Agent {
  id: string
  company_id: string
  name: string
  status: 'active' | 'inactive'
  prompt: string
  variables: Record<string, any>
  welcome_message: string
  voice_id: string
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
  retell_llm_id?: string
  // WhatsApp configuration
  channels?: ('voice' | 'whatsapp')[]
  whatsapp_config?: {
    phone_number?: string
    business_account_id?: string
    webhook_url?: string
    template_ids?: string[]
    auto_reply_enabled?: boolean
    handoff_enabled?: boolean
  }
  created_at: string
  updated_at: string
}

export interface Lead {
  id: string
  agent_id: string
  first_name: string
  phone_e164: string
  status: 'new' | 'in_progress' | 'done'
  custom_fields: Record<string, any>
  schedule_at: string
  attempts_count: number
  disposition?: string
  created_at: string
  updated_at: string
}

export interface InteractionAttempt {
  id: string
  lead_id: string
  agent_id: string
  attempt_number: number
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  outcome?: 'answered' | 'no_answer' | 'failed'
  summary?: string
  duration_seconds?: number
  transcript_url?: string
  raw_webhook_data: Record<string, any>
  retell_call_id?: string
  created_at: string
  updated_at: string
  // Related data from API
  lead_name?: string
  lead_phone?: string
  agent_name?: string
}

export interface Template {
  id: string
  name: string
  industry: string
  use_case: string
  agent_name_template: string
  prompt_template: string
  variables: string[]
  functions: string[]
  welcome_message: string
  max_attempts: number
  retry_delay_minutes: number
  business_hours_start: string
  business_hours_end: string
  max_call_duration_minutes: number
}

export interface Voice {
  id: string
  name: string
  gender: 'male' | 'female'
  language: string
  retell_voice_id: string
}