/**
 * Session Manager untuk Server-side Authentication
 * 
 * - Session disimpan di server dengan HttpOnly cookies (encrypted AES-256-GCM)
 * - Tidak ada token di client-side storage
 * - Semua akses via API proxy
 */

interface SessionData {
  access_token: string
  refresh_token: string
}

class SessionManager {
  private apiUrl = '/api/auth'

  async setSession(accessToken: string, refreshToken: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/session`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: accessToken,
          refresh_token: refreshToken,
        }),
      })
      return response.ok
    } catch (error) {
      console.error('Error setting session:', error)
      return false
    }
  }

  async getSession(): Promise<SessionData | null> {
    try {
      const response = await fetch(`${this.apiUrl}/session`, {
        method: 'GET',
        credentials: 'include',
      })

      if (!response.ok) return null

      const data = await response.json()
      return data.session || null
    } catch (error) {
      console.error('Error getting session:', error)
      return null
    }
  }

  async clearSession(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/session`, {
        method: 'DELETE',
        credentials: 'include',
      })
      return response.ok
    } catch (error) {
      console.error('Error clearing session:', error)
      return false
    }
  }
}

export const sessionManager = new SessionManager()
