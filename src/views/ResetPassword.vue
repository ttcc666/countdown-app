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
        @submit.prevent="handleReset"
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
            @click="handleReset"
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
          注册新账号
        </router-link>
      </div>
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
const resetForm = reactive<ResetPasswordFormData>({
  email: ''
})

const resetRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ]
}

const handleReset = async () => {
  if (!resetFormRef.value) return

  try {
    const valid = await resetFormRef.value.validate()
    if (!valid) return

    const result = await resetPassword(resetForm)

    if (result.success) {
      ElMessage.success('重置链接已发送到您的邮箱，请查收！')
      router.push('/login')
    } else {
      ElMessage.error(result.error?.message || '发送失败')
    }
  } catch (error) {
    console.error('Reset password error:', error)
    ElMessage.error('重置过程中发生错误')
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
  gap: 12px;
}

.auth-link {
  color: #409eff;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.auth-link:hover {
  color: #66b1ff;
}

.auth-divider {
  color: #ddd;
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