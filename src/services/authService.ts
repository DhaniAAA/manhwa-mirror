import { supabase } from "../lib/supabase";
import { sessionManager } from "../lib/cookieStorage";
import type { User, Session, AuthError } from "@supabase/supabase-js";

export interface SignUpData {
  email: string;
  password: string;
  username: string;
  full_name?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export class AuthService {
  static async signUp(data: SignUpData): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
            full_name: data.full_name || data.username,
          },
        },
      });

      if (error) {
        console.error("❌ Sign up error:", error);
        return { user: null, error };
      }

      console.log("✅ User signed up:", authData.user?.email);
      return { user: authData.user, error: null };
    } catch (error) {
      console.error("❌ Sign up exception:", error);
      return { user: null, error: error as AuthError };
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
      });

      if (error) {
        console.error("❌ Sign in error:", error);
        return { user: null, error };
      }

      // Save session to server (encrypted HttpOnly cookie)
      if (authData.session) {
        await sessionManager.setSession(authData.session.access_token, authData.session.refresh_token);
      }

      console.log("✅ User signed in:", authData.user?.email);
      return { user: authData.user, error: null };
    } catch (error) {
      console.error("❌ Sign in exception:", error);
      return { user: null, error: error as AuthError };
    }
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<{ error: AuthError | null }> {
    try {
      // Clear server session first
      await sessionManager.clearSession();

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("❌ Sign out error:", error);
        return { error };
      }

      console.log("✅ User signed out");
      return { error: null };
    } catch (error) {
      console.error("❌ Sign out exception:", error);
      return { error: error as AuthError };
    }
  }

  /**
   * Get current session
   */
  static async getSession(): Promise<Session | null> {
    try {
      // Coba ambil sesi dari server/cookie dulu
      const serverSession = await sessionManager.getSession();

      if (serverSession) {
        const { data } = await supabase.auth.setSession({
          access_token: serverSession.access_token,
          refresh_token: serverSession.refresh_token,
        });
        return data.session;
      }

      // Fallback ke sesi lokal Supabase
      const { data } = await supabase.auth.getSession();
      return data.session;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get current user
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        // Abaikan error jika memang tidak ada sesi
        if (error.message?.includes("Auth session missing")) return null;

        console.error("❌ Get user error:", error.message);

        // FIX: Auto-logout jika token invalid/expired (401) atau API Key salah
        const isAuthError = error.status === 401 || error.message?.includes("401") || error.message?.includes("Invalid token") || error.message?.includes("No API key"); // Handle error API key

        if (isAuthError) {
          console.warn("⚠️ Auth error detected. Clearing session to fix state.");
          await this.signOut();
          // Force reload halaman jika perlu untuk reset state penuh
          // window.location.reload();
        }
        return null;
      }
      return user;
    } catch (error) {
      return null;
    }
  }

  /**
   * Reset password
   */
  // ... method resetPassword, updatePassword, onAuthStateChange biarkan seperti sebelumnya ...
  static async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  }

  static async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error };
  }

  static onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });
  }
}
