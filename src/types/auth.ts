export interface AuthUser {
  id: string
  email: string
  name: string
  phone?: string
  google_id: string
  company_id?: string
  created_at: string
  updated_at: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_at: number
  token_type: 'Bearer'
}

export interface AuthState {
  user: AuthUser | null
  tokens: AuthTokens | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

export interface GoogleAuthResponse {
  credential: string
  select_by: string
}

export interface LoginResponse {
  user: AuthUser
  tokens: AuthTokens
  requires_onboarding: boolean
}

export interface OnboardingData {
  name: string
  phone: string
  company_name: string
}