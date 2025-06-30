<template>
  <div class="callback-container">
    <div class="callback-card">
      <div v-if="loading" class="loading-state">
        <el-icon class="loading-icon" :size="48">
          <Loading />
        </el-icon>
        <h2>正在处理认证...</h2>
        <p>请稍候，我们正在验证您的身份。</p>
      </div>

      <div v-else-if="success" class="success-state">
        <el-icon class="success-icon" :size="48">
          <SuccessFilled />
        </el-icon>
        <h2>认证成功！</h2>
        <p>您的账号已成功验证，即将跳转到应用主页。</p>
      </div>

      <div v-else class="error-state">
        <el-icon class="error-icon" :size="48">
          <CircleCloseFilled />
        </el-icon>
        <h2>认证失败</h2>
        <p>{{ errorMessage }}</p>
        <el-button type="primary" @click="goToLogin">
          返回登录
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading, SuccessFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import { supabase } from '../supabase'

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const success = ref(false)
const errorMessage = ref('')

const goToLogin = () => {
  router.push('/login')
}

onMounted(async () => {
  try {
    // 从URL参数中获取token信息
    const { token_hash, type, next } = route.query
    
    if (token_hash && type) {
      // 验证OTP token
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token_hash as string,
        type: type as any
      })

      if (error) {
        throw error
      }

      success.value = true
      ElMessage.success('账号验证成功！')
      
      // 2秒后跳转
      setTimeout(() => {
        const redirectPath = (next as string) || '/'
        router.push(redirectPath)
      }, 2000)
    } else {
      throw new Error('缺少必要的验证参数')
    }
  } catch (error: any) {
    console.error('Auth callback error:', error)
    success.value = false
    errorMessage.value = error.message || '验证过程中发生错误，请重试'
    ElMessage.error('认证失败：' + errorMessage.value)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.callback-container {
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

.callback-card {
  background: var(--card-bg-color);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
  text-align: center;
  backdrop-filter: blur(10px);
}

.loading-state,
.success-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-icon {
  color: var(--primary-color);
  animation: spin 1s linear infinite;
}

.success-icon {
  color: var(--finished-color);
}

.error-icon {
  color: #f56c6c;
}

.callback-card h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.callback-card p {
  font-size: 16px;
  color: var(--secondary-text-color);
  margin: 0;
  line-height: 1.5;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .callback-container {
    padding: 16px;
  }
  
  .callback-card {
    padding: 24px;
  }
  
  .callback-card h2 {
    font-size: 20px;
  }
  
  .callback-card p {
    font-size: 14px;
  }
}
</style>
