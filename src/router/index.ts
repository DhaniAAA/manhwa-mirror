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
    path: '/detail/:slug',
    name: 'detail',
    component: () => import('../views/DetailPage.vue'),
    meta: {
      title: 'Detail Manhwa'
    }
  },
  {
    path: '/baca/:slug/read/:chapterSlug',
    name: 'reader',
    component: () => import('../views/ReaderPage.vue'),
    meta: {
      title: 'Baca Manhwa'
    }
  },
  {
    path: '/library',
    name: 'library',
    component: () => import('../views/LibraryPage.vue'),
    meta: {
      title: 'Perpustakaan - Manhwa Mirror'
    }
  },
  {
    path: '/latest',
    name: 'latest',
    component: () => import('../views/LatestPage.vue'),
    meta: {
      title: 'Rilis Terbaru - Manhwa Mirror'
    }
  },
  {
    path: '/popular',
    name: 'popular',
    component: () => import('../views/PopularPage.vue'),
    meta: {
      title: 'Manhwa Populer - Manhwa Mirror'
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
  scrollBehavior(_to, _from, savedPosition) {
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
