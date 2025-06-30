<template>
  <div class="auth-callback">
    <LoadingScreen
      title="处理认证信息"
      message="正在验证您的身份，请稍候..."
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import LoadingScreen from '../components/LoadingScreen.vue'
import { supabase } from '../supabase'

const router = useRouter()

onMounted(async () => {
  try {
    // 处理认证回调
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Auth callback error:', error)
      ElMessage.error('认证失败，请重新登录')
      router.push('/login')
      return
    }

    if (data.session) {
      ElMessage.success('认证成功！')
      router.push('/')
    } else {
      ElMessage.warning('未找到有效的认证信息')
      router.push('/login')
    }
  } catch (error) {
    console.error('Auth callback error:', error)
    ElMessage.error('认证过程中发生错误')
    router.push('/login')
  }
})
</script>

<style scoped>
.auth-callback {
  width: 100%;
  height: 100vh;
}
</style>