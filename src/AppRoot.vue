<template>
  <div id="app">
    <LoadingScreen
      v-if="loading"
      title="初始化应用"
      message="正在验证您的登录状态..."
    />
    <router-view v-else />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuth } from './composables/useAuth'
import LoadingScreen from './components/LoadingScreen.vue'

const { loading, initAuth } = useAuth()

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