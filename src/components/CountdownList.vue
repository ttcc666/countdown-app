<template>
  <div class="countdown-list-container">
    <div v-if="countdowns.length === 0" class="no-countdowns">
      <p>还没有倒计时，点击右下角的 + 按钮添加一个吧！</p>
    </div>
    
    <div v-else class="countdown-grid">
      <div
        v-for="countdown in countdowns"
        :key="countdown.id"
        class="countdown-card"
      >
        <div class="card-header">
          <h3 class="countdown-name">{{ countdown.name }}</h3>
          <div class="card-actions">
            <el-button
              size="small"
              :icon="Edit"
              @click="$emit('edit-countdown', countdown)"
            />
            <el-button
              size="small"
              type="danger"
              :icon="Delete"
              @click="handleDelete(countdown)"
            />
          </div>
        </div>
        
        <div class="countdown-display">
          <div class="time-section">
            <div class="time-value">{{ getTimeRemaining(countdown).days }}</div>
            <div class="time-label">天</div>
          </div>
          <div class="time-section">
            <div class="time-value">{{ getTimeRemaining(countdown).hours }}</div>
            <div class="time-label">时</div>
          </div>
          <div class="time-section">
            <div class="time-value">{{ getTimeRemaining(countdown).minutes }}</div>
            <div class="time-label">分</div>
          </div>
          <div class="time-section">
            <div class="time-value">{{ getTimeRemaining(countdown).seconds }}</div>
            <div class="time-label">秒</div>
          </div>
        </div>
        
        <div v-if="countdown.tags && countdown.tags.length > 0" class="countdown-tags">
          <el-tag
            v-for="tag in countdown.tags"
            :key="tag"
            size="small"
            class="tag"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessageBox } from 'element-plus'
import { Edit, Delete } from '@element-plus/icons-vue'
import type { CountdownItem } from '../types'

interface Props {
  countdowns: CountdownItem[]
}

interface Emits {
  (e: 'update:countdowns', countdowns: CountdownItem[]): void
  (e: 'delete-countdown', id: string): void
  (e: 'edit-countdown', countdown: CountdownItem): void
}

// 使用 defineProps 和 defineEmits，不需要声明 props 变量
defineProps<Props>()
const emit = defineEmits<Emits>()

const timer = ref<number | null>(null)

// 计算剩余时间
const getTimeRemaining = (countdown: CountdownItem) => {
  const now = new Date().getTime()
  const target = new Date(countdown.targetTime).getTime()
  const diff = target - now

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return { days, hours, minutes, seconds }
}

// 删除倒计时
const handleDelete = async (countdown: CountdownItem) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除倒计时"${countdown.name}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    emit('delete-countdown', countdown.id)
  } catch {
    // 用户取消删除
  }
}

// 启动定时器
onMounted(() => {
  timer.value = window.setInterval(() => {
    // 强制重新渲染以更新时间显示
  }, 1000)
})

// 清理定时器
onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})
</script>

<style scoped>
.countdown-list-container {
  width: 100%;
  max-width: 1200px;
}

.no-countdowns {
  text-align: center;
  padding: 60px 20px;
  color: var(--secondary-text-color);
  font-size: 16px;
}

.countdown-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.countdown-card {
  background: var(--card-bg-color);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--card-shadow);
  transition: transform 0.2s, box-shadow 0.2s;
}

.countdown-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.countdown-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.countdown-display {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.time-section {
  text-align: center;
  flex: 1;
}

.time-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
}

.time-label {
  font-size: 12px;
  color: var(--secondary-text-color);
  margin-top: 4px;
}

.countdown-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  font-size: 12px;
}

@media (max-width: 768px) {
  .countdown-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .countdown-card {
    padding: 16px;
  }
  
  .time-value {
    font-size: 20px;
  }
}
</style>