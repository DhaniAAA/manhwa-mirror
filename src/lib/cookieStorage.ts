/**
 * Cookie-based Storage Adapter untuk Supabase
 * 
 * Menggunakan HttpOnly cookies via Edge Functions untuk keamanan maksimal
 * Token tidak dapat diakses via JavaScript, melindungi dari XSS attacks
 */

import { secureStorage } from './secureStorage'

interface SessionData {
    access_token: string
    refresh_token: string
}

class CookieStorageAdapter {
    private apiUrl: string
    private memoryCache: Map<string, string>

    constructor() {
        // Use edge function endpoint
        this.apiUrl = '/api/auth'
        this.memoryCache = new Map()
    }

    async getItem(key: string): Promise<string | null> {
        try {
            // First check memory cache
            const cached = this.memoryCache.get(key)
            if (cached) {
                return cached
            }

            // Then check secure storage (in-memory)
            const memoryValue = secureStorage.getItem(key)
            if (memoryValue) {
                this.memoryCache.set(key, memoryValue)
                return memoryValue
            }

            // Finally, try to get from server cookie
            const response = await fetch(`${this.apiUrl}/session`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                return null
            }

            const data = await response.json()

            if (data.session) {
                const sessionStr = JSON.stringify(data.session)
                this.memoryCache.set(key, sessionStr)
                secureStorage.setItem(key, sessionStr)
                return sessionStr
            }

            return null
        } catch (error) {
            console.error('Error getting session from cookie:', error)
            return secureStorage.getItem(key) // Fallback to memory storage
        }
    }

    async setItem(key: string, value: string): Promise<void> {
        try {
            // Store in memory first
            this.memoryCache.set(key, value)
            secureStorage.setItem(key, value)

            // Parse the session data
            const sessionData: SessionData = JSON.parse(value)

            // Send to server to set HttpOnly cookie
            await fetch(`${this.apiUrl}/session`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    access_token: sessionData.access_token,
                    refresh_token: sessionData.refresh_token,
                }),
            })
        } catch (error) {
            console.error('Error setting session cookie:', error)
            // Still store in memory even if cookie fails
            secureStorage.setItem(key, value)
        }
    }

    async removeItem(key: string): Promise<void> {
        try {
            // Remove from memory
            this.memoryCache.delete(key)
            secureStorage.removeItem(key)

            // Remove cookie from server
            await fetch(`${this.apiUrl}/session`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
        } catch (error) {
            console.error('Error removing session cookie:', error)
            // Still remove from memory even if cookie removal fails
            secureStorage.removeItem(key)
        }
    }
}

// Create singleton instance
export const cookieStorage = new CookieStorageAdapter()

// Export adapter for Supabase
export const cookieStorageAdapter = {
    getItem: (key: string) => cookieStorage.getItem(key),
    setItem: (key: string, value: string) => cookieStorage.setItem(key, value),
    removeItem: (key: string) => cookieStorage.removeItem(key),
}
