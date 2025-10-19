import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomePage.vue'),
    meta: {
      title: 'Manhwa Mirror - Baca Manhwa Online'
    }
  },
  {
    path: '/manhwa/:slug',
    name: 'detail',
    component: () => import('../views/DetailPage.vue'),
    meta: {
      title: 'Detail Manhwa'
    }
  },
  {
    path: '/manhwa/:slug/read/:chapterSlug',
    name: 'reader',
    component: () => import('../views/ReaderPage.vue'),
    meta: {
      title: 'Baca Manhwa'
    }
  },
  {
    path: '/library',
    name: 'library',
    component: () => import('../views/HomePage.vue'), // Placeholder
    meta: {
      title: 'Perpustakaan'
    }
  },
  {
    path: '/latest',
    name: 'latest',
    component: () => import('../views/HomePage.vue'), // Placeholder
    meta: {
      title: 'Terbaru'
    }
  },
  {
    path: '/popular',
    name: 'popular',
    component: () => import('../views/HomePage.vue'), // Placeholder
    meta: {
      title: 'Populer'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guards
router.beforeEach((to, from, next) => {
  // Update document title
  const title = to.meta.title as string || 'Manhwa Mirror'
  document.title = title
  
  // Log navigation
  console.log(`🔀 Navigating from ${from.path} to ${to.path}`)
  
  next()
})

export default router
