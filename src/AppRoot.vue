<template>
  <div id="app">
    <LoadingScreen
      v-if="loading"
      title="初始化应用"
      message="正在验证您的登录状态..."
    />
    <!-- 认证相关页面 -->
    <router-view v-else-if="!isAuthenticated && route.meta.requiresGuest" />
    <!-- 主应用 -->
    <MainApp v-else-if="isAuthenticated" />
    <!-- 默认重定向到登录 -->
    <div v-else>
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from './composables/useAuth'
import LoadingScreen from './components/LoadingScreen.vue'
import MainApp from './App.vue'

const route = useRoute()
const { loading, isAuthenticated, initAuth } = useAuth()

// 初始化认证状态
onMounted(async () => {
  await initAuth()
})
</script>

<style>
#app {
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
}
</style>
