<template>
  <div class="loading-screen">
    <div class="loading-content">
      <div class="loading-spinner">
        <el-icon class="is-loading" :size="48">
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
  title: '加载中',
  message: '请稍候...'
})
</script>

<style scoped>
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
  padding: 2rem;
}

.loading-spinner {
  margin-bottom: 1.5rem;
}

.loading-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.loading-message {
  font-size: 1rem;
  color: #7f8c8d;
  margin: 0;
}

.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>