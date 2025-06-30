<template>
  <el-button
    :icon="isDark ? Sunny : Moon"
    circle
    size="small"
    @click="toggleTheme"
    :title="isDark ? '切换到浅色主题' : '切换到深色主题'"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Sunny, Moon } from '@element-plus/icons-vue'

const isDark = ref(false)

const toggleTheme = () => {
  isDark.value = !isDark.value
  updateTheme()
  saveThemePreference()
}

const updateTheme = () => {
  if (isDark.value) {
    document.body.classList.add('dark-theme')
  } else {
    document.body.classList.remove('dark-theme')
  }
}

const saveThemePreference = () => {
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

const loadThemePreference = () => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDark.value = savedTheme === 'dark'
  } else {
    // 检查系统主题偏好
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  updateTheme()
}

onMounted(() => {
  loadThemePreference()
})
</script>

<style scoped>
/* 组件样式已在全局样式中定义 */
</style>