import { createApp } from 'vue'
import './assets/main.css'
import AppRouter from './AppRouter.vue'
import router from './router'
import { cleanOldAuthStorage } from './utils/cleanOldStorage'

// Clean old auth tokens from localStorage/sessionStorage
cleanOldAuthStorage()

const app = createApp(AppRouter)

app.use(router)
app.mount('#app')

// Register Service Worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registered:', registration.scope)
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 New version available! Reload to update.')
                // Optionally show update notification to user
              }
            })
          }
        })
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed:', error)
      })
  })
}
