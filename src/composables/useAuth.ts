import { ref, computed } from 'vue'
import { supabase } from '../supabase'
import type { User, Session } from '@supabase/supabase-js'
import type { AuthState, LoginFormData, RegisterFormData, ResetPasswordFormData, AuthResult } from '../types/auth'

// 全局认证状态
const user = ref<User | null>(null)
const session = ref<Session | null>(null)
const loading = ref(true)

export const useAuth = () => {
  // 计算属性
  const isAuthenticated = computed(() => !!user.value)
  const authState = computed<AuthState>(() => ({
    user: user.value,
    session: session.value,
    loading: loading.value
  }))

  // 初始化认证状态
  const initAuth = async () => {
    try {
      loading.value = true
      
      // 获取当前会话
      const { data: { session: currentSession }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
        return
      }

      session.value = currentSession
      user.value = currentSession?.user ?? null
      
      // 监听认证状态变化
      supabase.auth.onAuthStateChange((event, newSession) => {
        console.log('Auth state changed:', event, newSession)
        session.value = newSession
        user.value = newSession?.user ?? null
        loading.value = false
      })
    } catch (error) {
      console.error('Error initializing auth:', error)
    } finally {
      loading.value = false
    }
  }

  // 用户注册
  const signUp = async (formData: RegisterFormData): Promise<AuthResult> => {
    try {
      loading.value = true

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        // 提供更友好的错误信息
        let errorMessage = '注册失败，请稍后重试'

        if (error.message.includes('User already registered')) {
          errorMessage = '该邮箱已被注册，请使用其他邮箱或直接登录'
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = '密码长度至少需要6位'
        } else if (error.message.includes('Invalid email')) {
          errorMessage = '请输入有效的邮箱地址'
        } else if (error.message.includes('Signup is disabled')) {
          errorMessage = '当前不允许注册新用户'
        }

        return {
          success: false,
          error: {
            message: errorMessage,
            code: error.message
          }
        }
      }

      return {
        success: true,
        data
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || '注册失败，请稍后重试'
        }
      }
    } finally {
      loading.value = false
    }
  }

  // 用户登录
  const signIn = async (formData: LoginFormData): Promise<AuthResult> => {
    try {
      loading.value = true

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        // 提供更友好的错误信息
        let errorMessage = '登录失败，请稍后重试'

        if (error.message.includes('Invalid login credentials')) {
          errorMessage = '邮箱或密码错误，请检查后重试'
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = '请先验证您的邮箱地址'
        } else if (error.message.includes('Too many requests')) {
          errorMessage = '请求过于频繁，请稍后再试'
        }

        return {
          success: false,
          error: {
            message: errorMessage,
            code: error.message
          }
        }
      }

      return {
        success: true,
        data
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || '登录失败，请稍后重试'
        }
      }
    } finally {
      loading.value = false
    }
  }

  // 用户登出
  const signOut = async (): Promise<AuthResult> => {
    try {
      loading.value = true
      
      const { error } = await supabase.auth.signOut()

      if (error) {
        return {
          success: false,
          error: {
            message: error.message,
            code: error.message
          }
        }
      }

      return {
        success: true
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || '登出失败，请稍后重试'
        }
      }
    } finally {
      loading.value = false
    }
  }

  // 重置密码
  const resetPassword = async (formData: ResetPasswordFormData): Promise<AuthResult> => {
    try {
      loading.value = true
      
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        return {
          success: false,
          error: {
            message: error.message,
            code: error.message
          }
        }
      }

      return {
        success: true
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || '密码重置失败，请稍后重试'
        }
      }
    } finally {
      loading.value = false
    }
  }

  return {
    // 状态
    user: computed(() => user.value),
    session: computed(() => session.value),
    loading: computed(() => loading.value),
    isAuthenticated,
    authState,
    
    // 方法
    initAuth,
    signUp,
    signIn,
    signOut,
    resetPassword
  }
}