import { AuthTokens, AuthUser, OnboardingData } from '@/types/auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

interface AuthResponse {
  access_token: string
  token_type: string
}

interface UserResponse {
  id: string
  email: string
  name: string | null
  phone: string | null
  is_profile_complete: boolean
  has_company: boolean
}

interface CompanyResponse {
  id: string
  name: string
  max_agents_limit: number
  max_concurrent_calls: number
  total_minutes_limit: number | null
  total_minutes_used: number
}

export class AuthAPI {
  // Development test login
  static async testLogin(email: string): Promise<AuthTokens> {
    const response = await fetch(`${API_BASE_URL}/auth/test-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Login failed')
    }

    const data: AuthResponse = await response.json()
    return {
      access_token: data.access_token,
      refresh_token: '', // Backend doesn't provide refresh tokens yet
      expires_at: Date.now() + (60 * 24 * 60 * 60 * 1000), // 60 days
      token_type: 'Bearer'
    }
  }

  // Production Google login
  static async googleLogin(token: string): Promise<AuthTokens> {
    const response = await fetch(`${API_BASE_URL}/auth/google-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Login failed')
    }

    const data: AuthResponse = await response.json()
    return {
      access_token: data.access_token,
      refresh_token: '', // Backend doesn't provide refresh tokens yet
      expires_at: Date.now() + (60 * 24 * 60 * 60 * 1000), // 60 days
      token_type: 'Bearer'
    }
  }

  static async getCurrentUser(accessToken: string): Promise<AuthUser> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to get user info')
    }

    const data: UserResponse = await response.json()
    console.log('User data from backend:', data)
    
    let company_id = null
    if (data.has_company) {
      try {
        const companyResponse = await fetch(`${API_BASE_URL}/auth/company`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        })
        if (companyResponse.ok) {
          const companyData: CompanyResponse = await companyResponse.json()
          company_id = companyData.id
          console.log('Company data from backend:', companyData)
        }
      } catch (error) {
        console.warn('Failed to fetch company info:', error)
      }
    }

    const user = {
      id: data.id,
      email: data.email,
      name: data.name || '',
      phone: data.phone || undefined,
      google_id: '', // Not provided by backend
      company_id: company_id || undefined,
      created_at: '',
      updated_at: ''
    }

    console.log('Final user object:', user)
    return user
  }

  static async completeProfile(
    profileData: OnboardingData,
    accessToken: string
  ): Promise<AuthUser> {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: profileData.name,
        phone: profileData.phone,
        company_name: profileData.company_name
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Profile completion failed')
    }

    // After successful profile completion, get updated user info
    return this.getCurrentUser(accessToken)
  }

  static async getCompany(accessToken: string): Promise<CompanyResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/company`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to get company info')
    }

    return response.json()
  }

  // Note: Backend doesn't have refresh token functionality yet
  static async refreshToken(refreshToken: string): Promise<AuthTokens> {
    throw new Error('Token refresh not implemented in backend yet')
  }

  // Note: Backend doesn't have logout endpoint yet
  static async logout(accessToken: string): Promise<void> {
    // Just clear local storage for now
    console.log('Logout - clearing local session')
  }

  static async validateToken(accessToken: string): Promise<AuthUser> {
    return this.getCurrentUser(accessToken)
  }
}