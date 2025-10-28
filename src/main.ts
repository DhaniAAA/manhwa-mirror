import { createApp } from 'vue'
import './assets/main.css'
import AppRouter from './AppRouter.vue'
import router from './router'

const app = createApp(AppRouter)

app.use(router)
app.mount('#app')
