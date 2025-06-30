<template>
  <div class="theme-switcher">
    <el-radio-group v-model="selectedTheme" size="small">
      <el-radio-button value="light">浅色模式</el-radio-button>
      <el-radio-button value="dark">深色模式</el-radio-button>
    </el-radio-group>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const selectedTheme = ref('light')

// 从 localStorage 加载保存的主题
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    selectedTheme.value = savedTheme
  }
  applyTheme(selectedTheme.value)
})

// 监听主题变化并应用
watch(selectedTheme, (newTheme) => {
  applyTheme(newTheme)
  localStorage.setItem('theme', newTheme)
})

const applyTheme = (theme: string) => {
  document.body.classList.remove('light-theme', 'dark-theme')
  document.body.classList.add(`${theme}-theme`)
}
</script>

<style scoped>
.theme-switcher {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

@media (max-width: 768px) {
  .theme-switcher {
    top: 10px;
    right: 10px;
  }
}
</style>
