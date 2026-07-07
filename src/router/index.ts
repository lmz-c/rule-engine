import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/',
    component: MainLayout,
    redirect: '/device',
    children: [
      {
        path: '/device',
        name: 'Device',
        component: () => import('@/views/device/DeviceList.vue'),
        meta: { title: '设备管理' }
      },
      {
        path: '/rule-chain',
        name: 'RuleChain',
        component: () => import('@/views/rule-chain/RuleChainList.vue'),
        meta: { title: '规则引擎' }
      },
      {
        path: '/rule-chain/editor/:chainId?',
        name: 'RuleChainEditor',
        component: () => import('@/views/rule-chain/RuleChainEditor.vue'),
        meta: { title: '规则链编辑器' }
      },
      {
        path: '/alert',
        name: 'Alert',
        component: () => import('@/views/alert/AlertList.vue'),
        meta: { title: '告警管理' }
      },
      {
        path: '/audit',
        name: 'Audit',
        component: () => import('@/views/audit/AuditLog.vue'),
        meta: { title: '审计日志' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router