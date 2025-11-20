interface SessionData {
  access_token: string;
  refresh_token: string;
}

class SessionManager {
  private apiUrl = "/api/auth";

  async setSession(accessToken: string, refreshToken: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/session`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: accessToken,
          refresh_token: refreshToken,
        }),
      });
      return response.ok;
    } catch (error) {
      console.warn("[cookie] Session sync failed (API not available):", error);
      return false;
    }
  }

  async getSession(): Promise<SessionData | null> {
    try {
      const response = await fetch(`${this.apiUrl}/session`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) return null;

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        return null;
      }

      try {
        const data = await response.json();
        return data.session || null;
      } catch (_parseError) {
        console.warn("[cookie] API returned non-JSON response, ignoring.");
        return null;
      }
    } catch (error) {
      console.warn("[cookie] Error getting session (likely offline or dev mode):", error);
      return null;
    }
  }

  async clearSession(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/session`, {
        method: "DELETE",
        credentials: "include",
      });
      return response.ok;
    } catch (error) {
      console.warn("[cookie] Session clear failed (API not available):", error);
      return false;
    }
  }
}

export const sessionManager = new SessionManager();
