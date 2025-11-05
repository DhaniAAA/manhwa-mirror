import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Vercel Serverless Function untuk mengelola session dengan HttpOnly Cookies
 * 
 * Endpoint: /api/auth/session
 * Methods: GET, POST, DELETE
 */

const COOKIE_NAME = 'sb-session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days in seconds

// Helper function to set cookie
function setCookie(res: VercelResponse, value: string, maxAge: number) {
    const cookieOptions = [
        `${COOKIE_NAME}=${encodeURIComponent(value)}`,
        'HttpOnly',
        'Secure',
        'SameSite=Lax',
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
        // POST - Set session cookie
        if (req.method === 'POST') {
            const { access_token, refresh_token } = req.body

            if (!access_token || !refresh_token) {
                return res.status(400).json({ error: 'Missing tokens' })
            }

            const sessionData = JSON.stringify({ access_token, refresh_token })
            setCookie(res, sessionData, COOKIE_MAX_AGE)

            return res.status(200).json({ success: true })
        }

        // GET - Get session from cookie
        if (req.method === 'GET') {
            const cookies = parseCookies(req.headers.cookie)
            const sessionCookie = cookies[COOKIE_NAME]

            if (!sessionCookie) {
                return res.status(200).json({ session: null })
            }

            try {
                const sessionData = JSON.parse(decodeURIComponent(sessionCookie))
                return res.status(200).json({ session: sessionData })
            } catch {
                return res.status(200).json({ session: null })
            }
        }

        // DELETE - Clear session cookie
        if (req.method === 'DELETE') {
            setCookie(res, '', 0) // Set Max-Age to 0 to delete
            return res.status(200).json({ success: true })
        }

        // Method not allowed
        return res.status(405).json({ error: 'Method not allowed' })
    } catch (error) {
        console.error('Auth session error:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}
