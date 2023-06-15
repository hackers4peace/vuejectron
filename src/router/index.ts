// Composables
import { useCoreStore } from '@/store/core'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import(/* webpackChunkName: "dashboard" */ '@/views/Dashboard.vue'),
      },
      {
        path: '/login',
        name: 'login',
        component: () => import(/* webpackChunkName: "login" */ '@/views/Authn.vue'),
        meta: { public: true }
      },
      {
        path: '/redirect',
        name: 'redirect',
        component: () => import(/* webpackChunkName: "redirect" */ '@/views/Redirect.vue'),
        meta: { public: true }
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

router.beforeEach(async (to, from) => {
  const coreStore = useCoreStore()
  await coreStore.restoreOidcSession()

  if (!to.meta.public) {
    if (!coreStore.userId || !coreStore.isAuthorized) {
      return {
        path: '/login',
        // query: { redirect: to.fullPath },
      }
    }
  }
})


export default router
