import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

/**
 * Vercel Serverless Function untuk mengelola session dengan HttpOnly Cookies
 * Session data dienkripsi dengan AES-256-GCM
 * 
 * Endpoint: /api/auth/session
 * Methods: GET, POST, DELETE
 */

const COOKIE_NAME = 'sb_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 // 24 hours in seconds
const ENCRYPTION_KEY = process.env.SESSION_SECRET || 'default-secret-key-change-in-production'

// Encrypt session data
function encrypt(text: string): string {
  const key = scryptSync(ENCRYPTION_KEY, 'salt', 32)
  const iv = randomBytes(16)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  // Return: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

// Decrypt session data
function decrypt(encryptedText: string): string | null {
  try {
    const [ivHex, authTagHex, encrypted] = encryptedText.split(':')
    const key = scryptSync(ENCRYPTION_KEY, 'salt', 32)
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    
    const decipher = createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(authTag)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch {
    return null
  }
}

// Set encrypted cookie
function setCookie(res: VercelResponse, value: string, maxAge: number) {
  const cookieOptions = [
    `${COOKIE_NAME}=${value}`,
    'HttpOnly',
    'Secure',
    'SameSite=Strict',
    'Path=/',
    `Max-Age=${maxAge}`
  ]
  
  res.setHeader('Set-Cookie', cookieOptions.join('; '))
}

// Helper function to parse cookies
function parseCookies(cookieHeader: string | undefined): Record<string, string> {
    if (!cookieHeader) return {}

    return Object.fromEntries(
        cookieHeader.split('; ').map(c => {
            const [key, ...v] = c.split('=')
            return [key, v.join('=')]
        })
    )
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    const origin = req.headers.origin || '*'
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    res.setHeader('Access-Control-Allow-Credentials', 'true')

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(204).end()
    }

    try {
        // POST - Set encrypted session cookie
        if (req.method === 'POST') {
            const { access_token, refresh_token } = req.body

            if (!access_token || !refresh_token) {
                return res.status(400).json({ error: 'Missing tokens' })
            }

            const sessionData = JSON.stringify({ access_token, refresh_token })
            const encryptedData = encrypt(sessionData)
            setCookie(res, encryptedData, COOKIE_MAX_AGE)

            return res.status(200).json({ success: true })
        }

        // GET - Get decrypted session from cookie
        if (req.method === 'GET') {
            const cookies = parseCookies(req.headers.cookie)
            const encryptedCookie = cookies[COOKIE_NAME]

            if (!encryptedCookie) {
                return res.status(200).json({ session: null })
            }

            const decryptedData = decrypt(encryptedCookie)
            if (!decryptedData) {
                return res.status(200).json({ session: null })
            }

            try {
                const sessionData = JSON.parse(decryptedData)
                return res.status(200).json({ session: sessionData })
            } catch {
                return res.status(200).json({ session: null })
            }
        }

        // DELETE - Clear session cookie
        if (req.method === 'DELETE') {
            setCookie(res, '', 0)
            return res.status(200).json({ success: true })
        }

        // Method not allowed
        return res.status(405).json({ error: 'Method not allowed' })
    } catch (error) {
        console.error('Auth session error:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}
