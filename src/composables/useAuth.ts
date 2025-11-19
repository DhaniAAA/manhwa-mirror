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

  // Ubah loadUser menjadi seperti ini:
  const loadUser = async () => {
    loading.value = true;
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // INI YANG HILANG: Restore session dari cookie via API
        // const serverSession = await AuthService.getSession();
        await AuthService.getSession();
      }

      const user = await AuthService.getCurrentUser();
      currentUser.value = user;

      if (user) {
        const profile = await CommunityService.getProfile(user.id);
        currentProfile.value = profile;
      } else {
        currentProfile.value = null;
      }
    } catch (error) {
      const err = error as any;
      if (!err?.message?.includes("auth session missing")) {
        console.error("error loading user:", error);
      }
    } finally {
      loading.value = false;
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
