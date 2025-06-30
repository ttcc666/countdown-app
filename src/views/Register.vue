<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1 class="auth-title">注册</h1>
        <p class="auth-subtitle">创建您的倒计时应用账号</p>
      </div>

      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        class="auth-form"
        @submit.prevent="handleRegister"
      >
        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            type="email"
            placeholder="请输入邮箱地址"
            size="large"
            :prefix-icon="Message"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码（至少6位）"
            size="large"
            :prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请确认密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="auth-button"
            :loading="loading"
            @click="handleRegister"
          >
            {{ loading ? '注册中...' : '注册' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="auth-links">
        <span>已有账号？</span>
        <router-link to="/login" class="auth-link">
          立即登录
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Message, Lock } from '@element-plus/icons-vue'
import { useAuth } from '../composables/useAuth'
import type { RegisterFormData } from '../types/auth'

const router = useRouter()
const { signUp, loading } = useAuth()

const registerFormRef = ref<FormInstance>()
const registerForm = reactive<RegisterFormData>({
  email: '',
  password: '',
  confirmPassword: ''
})

const validatePasswordConfirm = (rule: any, value: any, callback: any) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const registerRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validatePasswordConfirm, trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  if (!registerFormRef.value) return

  try {
    const valid = await registerFormRef.value.validate()
    if (!valid) return

    const result = await signUp(registerForm)

    if (result.success) {
      ElMessage.success('注册成功！请检查邮箱并点击确认链接。')
      router.push('/login')
    } else {
      ElMessage.error(result.error?.message || '注册失败')
    }
  } catch (error) {
    console.error('Register error:', error)
    ElMessage.error('注册过程中发生错误')
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.auth-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.auth-title {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.auth-subtitle {
  color: #7f8c8d;
  margin: 0;
  font-size: 14px;
}

.auth-form {
  margin-bottom: 24px;
}

.auth-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
}

.auth-links {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.auth-link {
  color: #409eff;
  text-decoration: none;
  transition: color 0.3s;
}

.auth-link:hover {
  color: #66b1ff;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 24px;
  }
  
  .auth-title {
    font-size: 24px;
  }
}
</style>