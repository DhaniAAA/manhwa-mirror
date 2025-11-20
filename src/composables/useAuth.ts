import { ref, computed, onMounted } from "vue";
import { AuthService } from "../services/authService";
import { CommunityService } from "../services/communityService";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "../types/community";
// import { server } from "typescript";
import { supabase } from "../lib/supabase";

const currentUser = ref<User | null>(null);
const currentProfile = ref<Profile | null>(null);
const loading = ref(true);

export function useAuth() {
  const isAuthenticated = computed(() => !!currentUser.value);
  const isFetching = ref(false);

  // Ubah loadUser menjadi seperti ini:
  const loadUser = async () => {
    // Cegah re-entry jika sedang loading
    if (isFetching.value) return;

    loading.value = true;
    isFetching.value = true;

    try {
      // Coba get session dari client (memory)
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session) {
        // Hanya coba restore dari server cookie jika kita di browser
        if (typeof window !== "undefined") {
          try {
            await AuthService.getSession();
          } catch (e) {
            // Silent fail on session restore to prevent loop
            console.debug("No server session found");
          }
        }
      }

      // Get user details
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        // Jangan throw error untuk 'Auth session missing', ini normal untuk guest
        if (!userError.message.includes("Auth session missing")) {
          console.warn("Auth check failed:", userError.message);
        }
        currentUser.value = null;
        currentProfile.value = null;
      } else {
        currentUser.value = user;
        if (user) {
          const profile = await CommunityService.getProfile(user.id);
          currentProfile.value = profile;
        }
      }
    } catch (error) {
      console.error("Error loading user:", error);
      currentUser.value = null;
    } finally {
      loading.value = false;
      isFetching.value = false;
    }
  };

  const signUp = async (email: string, password: string, username: string, fullName?: string) => {
    const { user, error } = await AuthService.signUp({
      email,
      password,
      username,
      full_name: fullName,
    });

    if (user && !error) {
      await loadUser();
    }

    return { user, error };
  };

  const signIn = async (email: string, password: string) => {
    const { user, error } = await AuthService.signIn({ email, password });

    if (user && !error) {
      await loadUser();
    }

    return { user, error };
  };

  const signOut = async () => {
    const { error } = await AuthService.signOut();

    if (!error) {
      currentUser.value = null;
      currentProfile.value = null;
    }

    return { error };
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!currentUser.value) return null;

    const updated = await CommunityService.updateProfile(currentUser.value.id, updates);
    if (updated) {
      currentProfile.value = updated;
    }
    return updated;
  };

  const uploadAvatar = async (file: File) => {
    if (!currentUser.value) return null;

    const avatarUrl = await CommunityService.uploadAvatar(currentUser.value.id, file);
    if (avatarUrl) {
      await updateProfile({ avatar_url: avatarUrl });
    }
    return avatarUrl;
  };

  // Initialize auth state
  onMounted(() => {
    loadUser();

    // Listen to auth changes
    AuthService.onAuthStateChange((user) => {
      currentUser.value = user;
      if (user) {
        CommunityService.getProfile(user.id).then((profile) => {
          currentProfile.value = profile;
        });
      } else {
        currentProfile.value = null;
      }
    });
  });

  return {
    currentUser,
    currentProfile,
    isAuthenticated,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    uploadAvatar,
    loadUser,
  };
}
