<template>
  <VueDraggable
    v-model="localCountdowns"
    :animation="150"
    handle=".drag-handle"
    item-key="id"
    class="countdown-grid"
    @update="onDragUpdate"
  >
    <div v-for="countdown in localCountdowns" :key="countdown.id">
      <el-card class="countdown-card">
        <template #header>
          <div class="card-header">
            <span class="drag-handle">☰</span> <!-- 拖拽手柄 -->
            <span>{{ countdown.name }}</span>
            <div>
              <el-button
                class="button"
                type="primary"
                :icon="Edit"
                circle
                size="small"
                @click="editCountdown(countdown)"
              />
              <el-button
                class="button"
                type="danger"
                :icon="Delete"
                circle
                size="small"
                @click="confirmDelete(countdown.id)"
              />
            </div>
          </div>
        </template>
        <div class="countdown-display-small">
          <div v-if="shouldShowUnit(countdown, 'days')" class="time-unit-small">
            <span class="time-value-small">{{ formatTwoDigits(timeParts[countdown.id]?.days || 0) }}</span>
            <span class="time-label-small">天</span>
          </div>
          <div v-if="shouldShowUnit(countdown, 'hours')" class="time-unit-small">
            <span class="time-value-small">{{ formatTwoDigits(timeParts[countdown.id]?.hours || 0) }}</span>
            <span class="time-label-small">时</span>
          </div>
          <div v-if="shouldShowUnit(countdown, 'minutes')" class="time-unit-small">
            <span class="time-value-small">{{ formatTwoDigits(timeParts[countdown.id]?.minutes || 0) }}</span>
            <span class="time-label-small">分</span>
          </div>
          <div v-if="shouldShowUnit(countdown, 'seconds')" class="time-unit-small">
            <span class="time-value-small">{{ formatTwoDigits(timeParts[countdown.id]?.seconds || 0) }}</span>
            <span class="time-label-small">秒</span>
          </div>
        </div>
        <div class="message-container">
          <p :class="{ 'visible': timeParts[countdown.id]?.isFinished }" class="finished-message-small">已结束！</p>
        </div>
        <el-progress
          :percentage="timeParts[countdown.id]?.progress || 0"
          :stroke-width="8"
          :show-text="false"
          class="countdown-progress"
        ></el-progress>
      </el-card>
    </div>
  </VueDraggable>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { ElMessageBox } from 'element-plus'
import { Delete, Edit } from '@element-plus/icons-vue'
import type { CountdownItem } from '../types'

// 声明全局的 electronAPI 接口
declare global {
  interface Window {
    electronAPI?: {
      sendNotification: (title: string, body: string) => void;
    };
  }
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isFinished: boolean;
  progress: number;
  targetDate: Date;
}

const props = defineProps({
  countdowns: {
    type: Array as () => CountdownItem[],
    required: true
  }
})

const emit = defineEmits(['deleteCountdown', 'editCountdown', 'update:countdowns'])

const localCountdowns = ref<CountdownItem[]>([])

watch(() => props.countdowns, (newVal) => {
  localCountdowns.value = newVal
}, { deep: true, immediate: true })

const onDragUpdate = () => {
  emit('update:countdowns', localCountdowns.value)
}

const timeParts = ref<Record<string, TimeLeft>>({})

const updateAllTimes = () => {
  const now = new Date()
  props.countdowns.forEach(item => {
    timeParts.value[item.id] = calculateTimeLeft(item, now)
  })
}

let timer: NodeJS.Timeout | undefined;

onMounted(() => {
  updateAllTimes()
  timer = setInterval(updateAllTimes, 1000)
  requestNotificationPermission();
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})

watch(() => props.countdowns, () => {
  updateAllTimes()
}, { deep: true })

const notifiedCountdowns = new Set<string>() // 用于记录已发送倒计时结束通知的ID
const remindNotifiedCountdowns = new Set<string>() // 用于记录已发送提前提醒通知的ID

const calculateTimeLeft = (item: CountdownItem, now: Date): TimeLeft => {
  let target: Date = new Date(); // 初始化为当前时间
  let initialTarget: Date; // 用于进度条计算的初始目标时间
  let previousTarget: Date; // 用于进度条计算的上一周期目标时间

  // Helper to parse time string (HH:mm:ss or mm:ss)
  const parseTime = (timeStr: string): { hour: number, minute: number, second: number } => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 3) {
      return { hour: parts[0], minute: parts[1], second: parts[2] || 0 };
    } else if (parts.length === 2) {
      return { hour: 0, minute: parts[0], second: parts[1] || 0 };
    } else {
      return { hour: 0, minute: 0, second: 0 }; // Fallback
    }
  };

  if (item.type === 'once') {
    target = new Date(item.targetTime);
    initialTarget = new Date(item.createdAt || item.targetTime); // Fallback for old data
    previousTarget = new Date(item.createdAt || item.targetTime);
  } else if (item.type === 'yearly') {
    const [month, day, time] = item.repeatValue ? item.repeatValue.split(/[- :]/) : ['1', '1', '00:00:00'];
    const { hour, minute, second } = parseTime(time);
    target = new Date(now.getFullYear(), parseInt(month) - 1, parseInt(day), hour, minute, second);
    if (target.getTime() < now.getTime()) {
      target.setFullYear(target.getFullYear() + 1);
    }
    previousTarget = new Date(target);
    previousTarget.setFullYear(target.getFullYear() - 1);
    initialTarget = previousTarget; // 周期开始时间
  } else if (item.type === 'monthly') {
    const [day, time] = item.repeatValue ? item.repeatValue.split(/[- :]/) : ['1', '00:00:00'];
    const { hour, minute, second } = parseTime(time);
    target = new Date(now.getFullYear(), now.getMonth(), parseInt(day), hour, minute, second);
    if (target.getTime() < now.getTime()) {
      target.setMonth(target.getMonth() + 1);
    }
    previousTarget = new Date(target);
    previousTarget.setMonth(target.getMonth() - 1);
    initialTarget = previousTarget;
  } else if (item.type === 'daily') {
    const time = item.repeatValue || '00:00:00';
    const { hour, minute, second } = parseTime(time);
    target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, second);
    if (target.getTime() < now.getTime()) {
      target.setDate(target.getDate() + 1);
    }
    previousTarget = new Date(target);
    previousTarget.setDate(target.getDate() - 1);
    initialTarget = previousTarget;
  } else if (item.type === 'hourly') {
    const time = item.repeatValue || '00:00';
    const { minute, second } = parseTime(time);
    target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), minute, second);
    if (target.getTime() < now.getTime()) {
      target.setHours(target.getHours() + 1);
    }
    previousTarget = new Date(target);
    previousTarget.setHours(target.getHours() - 1);
    initialTarget = previousTarget;
  } else if (item.type === 'weekly') {
    const weekDays = item.repeatValue ? item.repeatValue.split(',').map(Number) : []; // 0-6, Sunday-Saturday
    const time = item.targetTime.split(' ')[1] || '00:00:00';
    const { hour, minute, second } = parseTime(time);

    let nextTarget = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, second);
    let found = false;
    for (let i = 0; i < 7; i++) {
      const currentDay = nextTarget.getDay();
      if (weekDays.includes(currentDay) && nextTarget.getTime() > now.getTime()) {
        target = nextTarget;
        found = true;
        break;
      }
      nextTarget.setDate(nextTarget.getDate() + 1);
    }
    if (!found) { // If no future date found in current week, check next week
      nextTarget = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, second);
      nextTarget.setDate(nextTarget.getDate() + 7); // Move to next week
      for (let i = 0; i < 7; i++) {
        const currentDay = nextTarget.getDay();
        if (weekDays.includes(currentDay)) {
          target = nextTarget;
          found = true;
          break;
        }
        nextTarget.setDate(nextTarget.getDate() + 1);
      }
    }
    // Fallback if still not found
    if (!found) {
      target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, hour, minute, second);
    }
    // For previous target, find the last occurrence
    previousTarget = new Date(target!);
    previousTarget.setDate(target!.getDate() - 7); // A simple approach, might need refinement for exact previous occurrence
    initialTarget = previousTarget;
  } else if (item.type === 'every_n_days') {
    const nDays = item.repeatValue ? parseInt(item.repeatValue) : 1;
    const startDate = new Date(item.targetTime);
    let currentTarget = new Date(startDate);
    while (currentTarget.getTime() < now.getTime()) {
      currentTarget.setDate(currentTarget.getDate() + nDays);
    }
    target = currentTarget;
    previousTarget = new Date(target);
    previousTarget.setDate(target.getDate() - nDays);
    initialTarget = previousTarget;
  } else {
    target = new Date(item.targetTime); // 默认一次性
    initialTarget = new Date(item.createdAt || item.targetTime); // Fallback for old data
    previousTarget = new Date(item.createdAt || item.targetTime);
  }

  const difference = target.getTime() - now.getTime();
  const isFinished = difference <= 0;

  const days = isFinished ? 0 : Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = isFinished ? 0 : Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = isFinished ? 0 : Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = isFinished ? 0 : Math.floor((difference % (1000 * 60)) / 1000);

  // Calculate progress
  let progress = 0;
  if (item.type === 'once') {
    const totalDuration = target.getTime() - initialTarget.getTime();
    const elapsed = now.getTime() - initialTarget.getTime();
    if (totalDuration > 0) {
      progress = (elapsed / totalDuration) * 100;
    } else {
      progress = 100; // Already finished or invalid duration
    }
  } else {
    const cycleDuration = target.getTime() - previousTarget.getTime();
    const elapsedInCycle = now.getTime() - previousTarget.getTime();
    if (cycleDuration > 0) {
      progress = (elapsedInCycle / cycleDuration) * 100;
    } else {
      progress = 100; // Already finished or invalid duration
    }
  }
  progress = Math.max(0, Math.min(100, progress)); // Clamp between 0 and 100

  return { days, hours, minutes, seconds, isFinished, progress, targetDate: target };
}



const confirmDelete = (id: string) => {
  ElMessageBox.confirm(
    '确定要删除这个倒计时吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      emit('deleteCountdown', id)
      notifiedCountdowns.delete(id) // 如果删除，从已通知列表中移除
      remindNotifiedCountdowns.delete(id); // 从提前提醒列表中移除
    })
    .catch(() => {
      // 用户取消删除
    })
}

const editCountdown = (item: CountdownItem) => {
  emit('editCountdown', item)
}

// 请求 Web 通知权限
const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return;
  }
  if (Notification.permission === 'granted') {
    return;
  }
  if (Notification.permission !== 'denied') {
    await Notification.requestPermission();
  }
};



const formatTwoDigits = (num: number): string => {
  return num < 10 ? '0' + num : String(num);
};

// 判断是否应该显示某个时间单位
const shouldShowUnit = (item: CountdownItem, unit: 'days' | 'hours' | 'minutes' | 'seconds'): boolean => {
  // 如果没有设置 displayUnits 或为空数组，则显示所有单位（向后兼容）
  if (!item.displayUnits || item.displayUnits.length === 0) {
    return true;
  }
  // 检查该单位是否在 displayUnits 数组中
  return item.displayUnits.includes(unit);
};


</script>

<style scoped>
.countdown-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(18.75rem, 1fr)); /* 300px */
  gap: 1.25rem; /* 20px */
  width: 100%;
  max-width: 75rem; /* 1200px */
  margin: 0 auto;
}

.countdown-card {
  width: 100%;
  min-height: 15rem; /* 240px */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  padding: 1.25rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.2em;
  font-weight: bold;
  color: var(--text-color);
  margin-bottom: 0.625rem; /* 10px */
}

.card-header span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.countdown-display-small {
  display: flex;
  justify-content: space-around;
  margin-top: 0.625rem; /* 10px */
  margin-bottom: 0.625rem; /* 10px */
  gap: 0.9375rem; /* 15px */
}

.time-unit-small {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.time-value-small {
  font-size: 2.2em;
  font-weight: bold;
  color: var(--primary-color);
  transition: all 0.3s ease-out;
}

.time-label-small {
  font-size: 1em;
  color: var(--secondary-text-color);
}

.message-container {
  height: 1.5em;
  display: flex;
  align-items: center;
  justify-content: center;
}

.finished-message-small {
  font-size: 1.2em;
  color: var(--finished-color);
  font-weight: bold;
  margin: 0;
  visibility: hidden;
}

.finished-message-small.visible {
  visibility: visible;
}

.countdown-progress {
  margin-top: 0.625rem; /* 10px */
}

.drag-handle {
  cursor: grab;
  margin-right: 0.625rem; /* 10px */
  font-size: 1.5em;
  color: var(--secondary-text-color);
}

/* 媒体查询：小屏幕设备 */
@media (max-width: 48rem) { /* 768px */
  .countdown-card {
    margin: 0 auto;
  }
}
</style>