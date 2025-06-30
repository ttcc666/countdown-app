import type { User, Session } from '@supabase/supabase-js'

// 用户认证状态接口
export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
}

// 登录表单数据接口
export interface LoginFormData {
  email: string
  password: string
}

// 注册表单数据接口
export interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
}

// 密码重置表单数据接口
export interface ResetPasswordFormData {
  email: string
}

// 认证错误接口
export interface AuthError {
  message: string
  code?: string
}

// 认证操作结果接口
export interface AuthResult {
  success: boolean
  error?: AuthError
  data?: any
}