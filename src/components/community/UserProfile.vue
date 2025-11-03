<template>
  <div class="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
    <div v-if="loading" class="flex justify-center py-8">
      <div class="w-8 h-8 border-4 border-slate-200 dark:border-slate-700 border-t-violet-500 rounded-full animate-spin"></div>
    </div>

    <div v-else-if="profile">
      <!-- Profile header -->
      <div class="flex items-start gap-4 mb-6">
        <div class="relative">
          <img
            v-if="profile.avatar_url"
            :src="profile.avatar_url"
            :alt="profile.username || 'User'"
            class="w-20 h-20 rounded-full object-cover"
          />
          <div v-else class="w-20 h-20 rounded-full bg-violet-500 flex items-center justify-center text-white text-2xl font-bold">
            {{ ((profile.username || 'U')[0] || 'U').toUpperCase() }}
          </div>
          
          <!-- Edit button for own profile -->
          <button
            v-if="isOwnProfile"
            @click="editMode = true"
            class="absolute bottom-0 right-0 p-2 bg-violet-500 hover:bg-violet-600 text-white rounded-full shadow-lg transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>

        <div class="flex-1">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {{ profile.username || 'Anonymous' }}
          </h2>
          <p v-if="profile.full_name" class="text-slate-600 dark:text-slate-400">
            {{ profile.full_name }}
          </p>
          <p v-if="profile.bio" class="mt-2 text-sm text-slate-700 dark:text-slate-300">
            {{ profile.bio }}
          </p>
          <a
            v-if="profile.website"
            :href="profile.website"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-2 inline-flex items-center gap-1 text-sm text-violet-500 hover:text-violet-600 dark:text-violet-400 dark:hover:text-violet-300"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            {{ profile.website }}
          </a>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
        <div class="text-center">
          <div class="text-2xl font-bold text-slate-900 dark:text-slate-100">0</div>
          <div class="text-xs text-slate-600 dark:text-slate-400">Komentar</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-slate-900 dark:text-slate-100">0</div>
          <div class="text-xs text-slate-600 dark:text-slate-400">Rating</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-slate-900 dark:text-slate-100">0</div>
          <div class="text-xs text-slate-600 dark:text-slate-400">Favorit</div>
        </div>
      </div>
    </div>

    <!-- Edit modal -->
    <Teleport to="body">
      <div v-if="editMode" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="editMode = false">
        <div class="relative w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl dark:bg-slate-800">
          <button
            @click="editMode = false"
            class="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <h3 class="mb-6 text-xl font-bold text-slate-900 dark:text-slate-100">Edit Profil</h3>

          <form @submit.prevent="saveProfile" class="space-y-4">
            <!-- Avatar upload -->
            <div>
              <label class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Avatar
              </label>
              <input
                type="file"
                accept="image/*"
                @change="handleAvatarChange"
                class="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 dark:file:bg-violet-900/20 dark:file:text-violet-400"
              />
            </div>

            <!-- Username -->
            <div>
              <label class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Username
              </label>
              <input
                v-model="editForm.username"
                type="text"
                minlength="3"
                maxlength="30"
                class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <!-- Full name -->
            <div>
              <label class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Nama Lengkap
              </label>
              <input
                v-model="editForm.full_name"
                type="text"
                class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <!-- Bio -->
            <div>
              <label class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Bio
              </label>
              <textarea
                v-model="editForm.bio"
                rows="3"
                maxlength="500"
                class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all resize-none"
              ></textarea>
            </div>

            <!-- Website -->
            <div>
              <label class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Website
              </label>
              <input
                v-model="editForm.website"
                type="url"
                class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              :disabled="saving"
              class="w-full py-3 px-4 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ saving ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { CommunityService } from '../../services/communityService'
import type { Profile } from '../../types/community'

interface Props {
  userId?: string
  username?: string
}

const props = defineProps<Props>()

const { currentUser, currentProfile, updateProfile, uploadAvatar } = useAuth()

const profile = ref<Profile | null>(null)
const loading = ref(true)
const editMode = ref(false)
const saving = ref(false)
const avatarFile = ref<File | null>(null)

const editForm = reactive({
  username: '',
  full_name: '',
  bio: '',
  website: ''
})

const isOwnProfile = computed(() => {
  return currentUser.value?.id === profile.value?.id
})

const loadProfile = async () => {
  loading.value = true
  try {
    if (props.username) {
      profile.value = await CommunityService.getProfileByUsername(props.username)
    } else if (props.userId) {
      profile.value = await CommunityService.getProfile(props.userId)
    } else if (currentUser.value) {
      profile.value = currentProfile.value
    }

    if (profile.value) {
      editForm.username = profile.value.username || ''
      editForm.full_name = profile.value.full_name || ''
      editForm.bio = profile.value.bio || ''
      editForm.website = profile.value.website || ''
    }
  } catch (error) {
    console.error('Error loading profile:', error)
  } finally {
    loading.value = false
  }
}

const handleAvatarChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    avatarFile.value = target.files[0]
  }
}

const saveProfile = async () => {
  if (!currentUser.value) return

  saving.value = true
  try {
    // Upload avatar if changed
    if (avatarFile.value) {
      await uploadAvatar(avatarFile.value)
    }

    // Update profile
    await updateProfile({
      username: editForm.username || null,
      full_name: editForm.full_name || null,
      bio: editForm.bio || null,
      website: editForm.website || null
    })

    editMode.value = false
    await loadProfile()
  } catch (error) {
    console.error('Error saving profile:', error)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadProfile()
})

watch(() => [props.userId, props.username], () => {
  loadProfile()
})
</script>
