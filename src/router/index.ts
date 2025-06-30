import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'

// 路由组件懒加载
const MainApp = () => import('../App.vue')
const Login = () => import('../views/Login.vue')
const Register = () => import('../views/Register.vue')
const ResetPassword = () => import('../views/ResetPassword.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: MainApp,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPassword,
    meta: { requiresGuest: true }
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: () => import('../views/AuthCallback.vue')
  },
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, _from, next) => {
  const { isAuthenticated, loading, initAuth } = useAuth()

  // 如果认证状态还在加载中，等待初始化完成
  if (loading.value) {
    try {
      await initAuth()
    } catch (error) {
      console.error('Auth initialization failed:', error)
      // 如果初始化失败，重定向到登录页
      if (to.name !== 'Login') {
        next({ name: 'Login' })
        return
      }
    }
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)

  if (requiresAuth && !isAuthenticated.value) {
    // 需要认证但用户未登录，重定向到登录页
    next({
      name: 'Login',
      query: { redirect: to.fullPath }
    })
  } else if (requiresGuest && isAuthenticated.value) {
    // 需要游客状态但用户已登录，重定向到首页
    next({ name: 'Home' })
  } else {
    // 允许访问
    next()
  }
})

export default router