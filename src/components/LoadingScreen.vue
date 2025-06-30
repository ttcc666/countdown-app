<template>
  <div class="loading-screen">
    <div class="loading-content">
      <div class="loading-spinner">
        <el-icon class="rotating" :size="48">
          <Loading />
        </el-icon>
      </div>
      <h2 class="loading-title">{{ title }}</h2>
      <p class="loading-message">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue'

interface Props {
  title?: string
  message?: string
}

withDefaults(defineProps<Props>(), {
  title: '加载中...',
  message: '请稍候，正在为您准备应用'
})
</script>

<style scoped>
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
  background: var(--card-bg-color);
  padding: 3rem 2rem;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  max-width: 400px;
  width: 90%;
}

.loading-spinner {
  margin-bottom: 1.5rem;
}

.rotating {
  color: var(--primary-color);
  animation: rotate 1s linear infinite;
}

.loading-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 0.5rem 0;
}

.loading-message {
  font-size: 16px;
  color: var(--secondary-text-color);
  margin: 0;
  line-height: 1.5;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .loading-content {
    padding: 2rem 1.5rem;
  }
  
  .loading-title {
    font-size: 20px;
  }
  
  .loading-message {
    font-size: 14px;
  }
}
</style>
