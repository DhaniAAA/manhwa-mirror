import { supabase } from '../lib/supabase'
import { sessionManager } from '../lib/cookieStorage'
import type { User, Session, AuthError } from '@supabase/supabase-js'

export interface SignUpData {
  email: string
  password: string
  username: string
  full_name?: string
}

export interface SignInData {
  email: string
  password: string
}

export class AuthService {
  /**
   * Sign up new user
   */
  static async signUp(data: SignUpData): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
            full_name: data.full_name || data.username,
          }
        }
      })

      if (error) {
        console.error('❌ Sign up error:', error)
        return { user: null, error }
      }

      console.log('✅ User signed up:', authData.user?.email)
      return { user: authData.user, error: null }
    } catch (error) {
      console.error('❌ Sign up exception:', error)
      return { user: null, error: error as AuthError }
    }
  }

  /**
   * Sign in existing user
   */
  static async signIn(data: SignInData): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        console.error('❌ Sign in error:', error)
        return { user: null, error }
      }

      // Save session to server (encrypted HttpOnly cookie)
      if (authData.session) {
        await sessionManager.setSession(
          authData.session.access_token,
          authData.session.refresh_token
        )
      }

      console.log('✅ User signed in:', authData.user?.email)
      return { user: authData.user, error: null }
    } catch (error) {
      console.error('❌ Sign in exception:', error)
      return { user: null, error: error as AuthError }
    }
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<{ error: AuthError | null }> {
    try {
      // Clear server session first
      await sessionManager.clearSession()
      
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('❌ Sign out error:', error)
        return { error }
      }

      console.log('✅ User signed out')
      return { error: null }
    } catch (error) {
      console.error('❌ Sign out exception:', error)
      return { error: error as AuthError }
    }
  }

  /**
   * Get current session
   */
  static async getSession(): Promise<Session | null> {
    try {
      // Get session from server (encrypted cookie)
      const serverSession = await sessionManager.getSession()
      
      if (!serverSession) {
        return null
      }

      // Set session in Supabase client
      const { data, error } = await supabase.auth.setSession({
        access_token: serverSession.access_token,
        refresh_token: serverSession.refresh_token,
      })

      if (error) {
        console.error('❌ Get session error:', error)
        return null
      }

      return data.session
    } catch (error) {
      console.error('❌ Get session exception:', error)
      return null
    }
  }

  /**
   * Get current user
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error) {
        console.error('❌ Get user error:', error)
        return null
      }

      return user
    } catch (error) {
      console.error('❌ Get user exception:', error)
      return null
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        console.error('❌ Reset password error:', error)
        return { error }
      }

      console.log('✅ Password reset email sent')
      return { error: null }
    } catch (error) {
      console.error('❌ Reset password exception:', error)
      return { error: error as AuthError }
    }
  }

  /**
   * Update password
   */
  static async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        console.error('❌ Update password error:', error)
        return { error }
      }

      console.log('✅ Password updated')
      return { error: null }
    } catch (error) {
      console.error('❌ Update password exception:', error)
      return { error: error as AuthError }
    }
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null)
    })
  }
}
