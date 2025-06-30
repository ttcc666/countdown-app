<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1 class="auth-title">重置密码</h1>
        <p class="auth-subtitle">输入您的邮箱地址，我们将发送重置链接</p>
      </div>

      <el-form
        ref="resetFormRef"
        :model="resetForm"
        :rules="resetRules"
        class="auth-form"
        @submit.prevent="handleResetPassword"
      >
        <el-form-item prop="email">
          <el-input
            v-model="resetForm.email"
            type="email"
            placeholder="请输入邮箱地址"
            size="large"
            :prefix-icon="Message"
            clearable
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="auth-button"
            :loading="loading"
            @click="handleResetPassword"
          >
            {{ loading ? '发送中...' : '发送重置链接' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="auth-links">
        <router-link to="/login" class="auth-link">
          返回登录
        </router-link>
        <span class="auth-divider">|</span>
        <router-link to="/register" class="auth-link">
          还没有账号？立即注册
        </router-link>
      </div>

      <!-- 发送成功提示 -->
      <el-alert
        v-if="showSuccessAlert"
        title="重置链接已发送！"
        description="请检查您的邮箱并点击重置链接来设置新密码。"
        type="success"
        :closable="false"
        class="success-alert"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Message } from '@element-plus/icons-vue'
import { useAuth } from '../composables/useAuth'
import type { ResetPasswordFormData } from '../types/auth'

const router = useRouter()
const { resetPassword, loading } = useAuth()

const resetFormRef = ref<FormInstance>()
const showSuccessAlert = ref(false)

const resetForm = reactive<ResetPasswordFormData>({
  email: ''
})

const resetRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

const handleResetPassword = async () => {
  if (!resetFormRef.value) return

  try {
    const valid = await resetFormRef.value.validate()
    if (!valid) return

    const result = await resetPassword(resetForm)
    
    if (result.success) {
      showSuccessAlert.value = true
      ElMessage.success('重置链接已发送到您的邮箱！')
      
      // 5秒后跳转到登录页
      setTimeout(() => {
        router.push('/login')
      }, 5000)
    } else {
      ElMessage.error(result.error?.message || '发送重置链接失败，请稍后重试')
    }
  } catch (error) {
    console.error('Reset password error:', error)
    ElMessage.error('发送过程中发生错误，请稍后重试')
  }
}
</script>

<style scoped>
.auth-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  margin: 0;
  box-sizing: border-box;
  z-index: 1000;
}

.auth-card {
  background: var(--card-bg-color);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
  backdrop-filter: blur(10px);
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.auth-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 8px 0;
}

.auth-subtitle {
  font-size: 16px;
  color: var(--secondary-text-color);
  margin: 0;
}

.auth-form {
  margin-bottom: 24px;
}

.auth-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
}

.auth-links {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
}

.auth-link {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.auth-link:hover {
  color: var(--primary-color);
  text-decoration: underline;
}

.auth-divider {
  color: var(--secondary-text-color);
  font-size: 14px;
}

.success-alert {
  margin-top: 16px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .auth-container {
    padding: 16px;
  }
  
  .auth-card {
    padding: 24px;
  }
  
  .auth-title {
    font-size: 24px;
  }
  
  .auth-links {
    flex-direction: column;
    gap: 8px;
  }
  
  .auth-divider {
    display: none;
  }
}
</style>
