const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://voice-ai-admin-api-762279639608.us-central1.run.app/api/v1'

export interface DemoStatus {
  demo_mode: boolean
  account_stage: string
  verified_leads_only: boolean
  calls_made: number
  calls_limit: number
  calls_remaining: number
  global_calls_today: number
  global_daily_limit: number
  global_calls_remaining: number
  demo_phone_number: string
  restrictions: string[]
  upgrade_available: boolean
  // Agent limit fields
  agents_count?: number
  agents_limit?: number
  agents_remaining?: number
}

export class DemoAPI {
  static async getDemoStatus(accessToken: string): Promise<DemoStatus> {
    const response = await fetch(`${API_BASE_URL}/demo/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to fetch demo status' }))
      throw new Error(error.detail || 'Failed to fetch demo status')
    }

    return response.json()
  }
}