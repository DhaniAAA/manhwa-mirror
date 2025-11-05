/**
 * Utility untuk membersihkan token lama dari localStorage dan sessionStorage
 * 
 * Fungsi ini akan dipanggil saat aplikasi pertama kali dimuat untuk
 * menghapus token yang tersimpan di browser storage lama
 */

export function cleanOldAuthStorage() {
  try {
    // Daftar key yang biasa digunakan oleh Supabase
    const supabaseKeys = [
      'sb-nnaizqggdtqmfpwzcspe-auth-token',
      'supabase.auth.token',
      'sb-auth-token',
    ]

    // Bersihkan dari localStorage
    supabaseKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        console.log(`🧹 Cleaning old auth token from localStorage: ${key}`)
        localStorage.removeItem(key)
      }
    })

    // Bersihkan dari sessionStorage
    supabaseKeys.forEach(key => {
      if (sessionStorage.getItem(key)) {
        console.log(`🧹 Cleaning old auth token from sessionStorage: ${key}`)
        sessionStorage.removeItem(key)
      }
    })

    // Bersihkan semua key yang mengandung 'auth-token'
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.includes('auth-token')) {
        console.log(`🧹 Cleaning old auth token from localStorage: ${key}`)
        localStorage.removeItem(key)
      }
    }

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && key.includes('auth-token')) {
        console.log(`🧹 Cleaning old auth token from sessionStorage: ${key}`)
        sessionStorage.removeItem(key)
      }
    }

    console.log('✅ Old auth storage cleaned successfully')
  } catch (error) {
    console.error('❌ Error cleaning old auth storage:', error)
  }
}
