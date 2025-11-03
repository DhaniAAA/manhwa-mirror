<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="close">
      <div class="relative w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl dark:bg-slate-800 animate-fade-in">
        <!-- Close button -->
        <button
          @click="close"
          class="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <!-- Header -->
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {{ mode === 'signin' ? 'Masuk' : 'Daftar' }}
          </h2>
          <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {{ mode === 'signin' ? 'Masuk ke akun Anda' : 'Buat akun baru' }}
          </p>
        </div>

        <!-- Error message -->
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p class="text-sm text-red-600 dark:text-red-400">{{ errorMessage }}</p>
        </div>

        <!-- Success message -->
        <div v-if="successMessage" class="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p class="text-sm text-green-600 dark:text-green-400">{{ successMessage }}</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Username (only for signup) -->
          <div v-if="mode === 'signup'">
            <label class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Username
            </label>
            <input
              v-model="formData.username"
              type="text"
              required
              minlength="3"
              maxlength="30"
              class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
              placeholder="username"
            />
          </div>

          <!-- Full Name (only for signup) -->
          <div v-if="mode === 'signup'">
            <label class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Nama Lengkap (Opsional)
            </label>
            <input
              v-model="formData.fullName"
              type="text"
              class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
              placeholder="Nama lengkap"
            />
          </div>

          <!-- Email -->
          <div>
            <label class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Email
            </label>
            <input
              v-model="formData.email"
              type="email"
              required
              class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
              placeholder="email@example.com"
            />
          </div>

          <!-- Password -->
          <div>
            <label class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Password
            </label>
            <input
              v-model="formData.password"
              type="password"
              required
              minlength="6"
              class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 px-4 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Loading...
            </span>
            <span v-else>
              {{ mode === 'signin' ? 'Masuk' : 'Daftar' }}
            </span>
          </button>
        </form>

        <!-- Toggle mode -->
        <div class="mt-4 text-center">
          <button
            @click="toggleMode"
            class="text-sm text-violet-500 hover:text-violet-600 dark:text-violet-400 dark:hover:text-violet-300 transition-colors"
          >
            {{ mode === 'signin' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useAuth } from '../../composables/useAuth'

interface Props {
  isOpen: boolean
  initialMode?: 'signin' | 'signup'
}

const props = withDefaults(defineProps<Props>(), {
  initialMode: 'signin'
})

const emit = defineEmits<{
  close: []
  success: []
}>()

const { signIn, signUp } = useAuth()

const mode = ref<'signin' | 'signup'>(props.initialMode)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const formData = reactive({
  email: '',
  password: '',
  username: '',
  fullName: ''
})

const resetForm = () => {
  formData.email = ''
  formData.password = ''
  formData.username = ''
  formData.fullName = ''
  errorMessage.value = ''
  successMessage.value = ''
}

const toggleMode = () => {
  mode.value = mode.value === 'signin' ? 'signup' : 'signin'
  errorMessage.value = ''
  successMessage.value = ''
}

const close = () => {
  resetForm()
  emit('close')
}

const handleSubmit = async () => {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    if (mode.value === 'signin') {
      const { error } = await signIn(formData.email, formData.password)
      if (error) {
        errorMessage.value = error.message || 'Gagal masuk. Periksa email dan password Anda.'
      } else {
        successMessage.value = 'Berhasil masuk!'
        setTimeout(() => {
          emit('success')
          close()
        }, 1000)
      }
    } else {
      if (!formData.username) {
        errorMessage.value = 'Username harus diisi'
        loading.value = false
        return
      }

      const { error } = await signUp(
        formData.email,
        formData.password,
        formData.username,
        formData.fullName
      )

      if (error) {
        errorMessage.value = error.message || 'Gagal mendaftar. Coba lagi.'
      } else {
        successMessage.value = 'Akun berhasil dibuat! Silakan cek email untuk verifikasi.'
        setTimeout(() => {
          mode.value = 'signin'
          formData.password = ''
        }, 2000)
      }
    }
  } catch (error) {
    errorMessage.value = 'Terjadi kesalahan. Silakan coba lagi.'
    console.error('Auth error:', error)
  } finally {
    loading.value = false
  }
}

// Reset form when modal opens/closes
watch(() => props.isOpen, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}
</style>
