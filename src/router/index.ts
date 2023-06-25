// Composables
import { h } from 'vue'
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
        beforeEnter: handleRedirect,
        component: h('div'), // empty component
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
        name: 'login',
        // query: { redirect: to.fullPath },
      }
    }
  }
})

async function handleRedirect() {
  const coreStore = useCoreStore()
  await coreStore.handleRedirect(window.location.href)

  return { name: 'dashboard',  query: {agent: coreStore.userId}}
}

export default router
