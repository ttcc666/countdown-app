<template>
  <div class="settings-container">
    <el-form label-width="120px">
      <el-form-item label="倒计时名称">
        <el-input v-model="countdownName" placeholder="例如：下班倒计时" size="large"></el-input>
      </el-form-item>

      <el-form-item label="倒计时类型">
        <el-select v-model="countdownType" placeholder="选择倒计时类型" size="large" class="full-width-picker">
          <el-option label="一次性" value="once"></el-option>
          <el-option label="每年" value="yearly"></el-option>
          <el-option label="每月" value="monthly"></el-option>
          <el-option label="每日" value="daily"></el-option>
          <el-option label="每时" value="hourly"></el-option>
          <el-option label="每周" value="weekly"></el-option>
          <el-option label="每N天" value="every_n_days"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="标签">
        <el-select
          v-model="selectedTags"
          multiple
          filterable
          allow-create
          default-first-option
          :reserve-keyword="false"
          placeholder="请选择或输入标签"
          size="large"
          class="full-width-picker"
        >
          <el-option
            v-for="item in allTags"
            :key="item"
            :label="item"
            :value="item"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="显示单位">
        <el-checkbox-group v-model="displayUnits">
          <el-checkbox label="days">天</el-checkbox>
          <el-checkbox label="hours">时</el-checkbox>
          <el-checkbox label="minutes">分</el-checkbox>
          <el-checkbox label="seconds">秒</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="目标时间">
        <!-- 一次性倒计时 -->
        <el-date-picker
          v-if="countdownType === 'once'"
          v-model="selectedDateTime"
          type="datetime"
          placeholder="选择日期和时间"
          value-format="YYYY-MM-DD HH:mm:ss"
          size="large"
          class="full-width-picker"
        />

        <!-- 每年重复 -->
        <el-date-picker
          v-else-if="countdownType === 'yearly'"
          v-model="selectedMonthDayTime"
          type="datetime"
          format="MM-DD HH:mm:ss"
          value-format="MM-DD HH:mm:ss"
          placeholder="选择月日和时间"
          size="large"
          class="full-width-picker"
        />

        <!-- 每月重复 -->
        <el-date-picker
          v-else-if="countdownType === 'monthly'"
          v-model="selectedDayTime"
          type="datetime"
          format="DD HH:mm:ss"
          value-format="DD HH:mm:ss"
          placeholder="选择日和时间"
          size="large"
          class="full-width-picker"
        />

        <!-- 每日重复 -->
        <el-time-picker
          v-else-if="countdownType === 'daily'"
          v-model="selectedTime"
          format="HH:mm:ss"
          value-format="HH:mm:ss"
          placeholder="选择时间"
          size="large"
          class="full-width-picker"
        />

        <!-- 每时重复 -->
        <el-time-picker
          v-else-if="countdownType === 'hourly'"
          v-model="selectedMinuteSecond"
          format="mm:ss"
          value-format="mm:ss"
          placeholder="选择分秒"
          size="large"
          class="full-width-picker"
        />

        <!-- 每周重复 -->
        <div v-else-if="countdownType === 'weekly'">
          <el-checkbox-group v-model="selectedWeekDays">
            <el-checkbox :label="1">周一</el-checkbox>
            <el-checkbox :label="2">周二</el-checkbox>
            <el-checkbox :label="3">周三</el-checkbox>
            <el-checkbox :label="4">周四</el-checkbox>
            <el-checkbox :label="5">周五</el-checkbox>
            <el-checkbox :label="6">周六</el-checkbox>
            <el-checkbox :label="0">周日</el-checkbox>
          </el-checkbox-group>
          <el-time-picker
            v-model="selectedTime"
            format="HH:mm:ss"
            value-format="HH:mm:ss"
            placeholder="选择时间"
            size="large"
            class="full-width-picker mt-2"
          />
        </div>

        <!-- 每N天重复 -->
        <div v-else-if="countdownType === 'every_n_days'">
          <el-input-number v-model="everyNDays" :min="1" :max="365" size="large" class="full-width-picker"></el-input-number>
          <el-date-picker
            v-model="selectedDateTime"
            type="datetime"
            placeholder="选择起始日期和时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            size="large"
            class="full-width-picker mt-2"
          />
        </div>

        <div class="quick-set-buttons">
          <el-button size="small" @click="setQuickTime('today_6pm')">今天 18:00</el-button>
          <el-button size="small" @click="setQuickTime('tomorrow_9am')">明天 09:00</el-button>
          <el-button size="small" @click="setQuickTime('next_hour')">一小时后</el-button>
        </div>
      </el-form-item>

      <el-form-item label="提前提醒 (分钟)">
        <el-input-number v-model="remindBeforeMinutes" :min="0" size="large" class="full-width-picker"></el-input-number>
      </el-form-item>
      <el-form-item label="完成后操作">
        <el-select v-model="onFinishAction" placeholder="选择操作" size="large" class="full-width-picker">
          <el-option label="不执行任何操作" value="do_nothing"></el-option>
          <el-option label="删除倒计时" value="delete"></el-option>
          <el-option label="重置到下一个周期" value="reset_next_cycle"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item class="form-actions">
        <el-button type="primary" @click="saveSettings">保存倒计时</el-button>
        <el-button @click="cancelEdit">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { CountdownItem } from '../types'

const emit = defineEmits(['saveCountdown', 'cancelEdit'])

const countdownName = ref<string>('')
const countdownType = ref<'once' | 'yearly' | 'monthly' | 'daily' | 'hourly' | 'weekly' | 'every_n_days'>('once')
const selectedTags = ref<string[]>([]) // 替换 countdownCategory
const displayUnits = ref<('days' | 'hours' | 'minutes' | 'seconds')[]>(['days', 'hours', 'minutes', 'seconds']) // 新增显示单位
const selectedDateTime = ref<string | null>(null) // 一次性, 每N天
const selectedMonthDayTime = ref<string | null>(null) // 每年
const selectedDayTime = ref<string | null>(null) // 每月
const selectedTime = ref<string | null>(null) // 每日, 每周
const selectedMinuteSecond = ref<string | null>(null) // 每时
const selectedWeekDays = ref<number[]>([]) // 每周重复的星期几 (0-6, 周日-周六)
const everyNDays = ref<number | null>(null) // 每N天重复的天数
const remindBeforeMinutes = ref<number | null>(null) // 提前提醒的分钟数
const onFinishAction = ref<'do_nothing' | 'delete' | 'archive' | 'reset_next_cycle'>('do_nothing'); // 新增完成后操作

const editingItem = ref<CountdownItem | null>(null)

const props = defineProps({
  itemToEdit: {
    type: Object as () => CountdownItem | null,
    default: null
  },
  allExistingTags: { // 新增 prop，用于获取所有已存在的标签
    type: Array as () => string[],
    default: () => []
  }
})

const allTags = computed(() => {
  const tags = new Set<string>(props.allExistingTags);
  selectedTags.value.forEach(tag => tags.add(tag));
  return Array.from(tags).sort();
});

watch(() => props.itemToEdit, (newItem) => {
  if (newItem) {
    editingItem.value = newItem
    countdownName.value = newItem.name
    countdownType.value = newItem.type
    selectedTags.value = newItem.tags || [] // 填充标签
    displayUnits.value = newItem.displayUnits || ['days', 'hours', 'minutes', 'seconds'] // 填充显示单位
    remindBeforeMinutes.value = newItem.remindBefore || null // 填充提前提醒
    onFinishAction.value = newItem.onFinishAction || 'do_nothing'; // 填充完成后操作

    // 根据类型填充不同的时间选择器
    if (newItem.type === 'once') {
      selectedDateTime.value = newItem.targetTime
    } else if (newItem.type === 'yearly') {
      selectedMonthDayTime.value = newItem.repeatValue || null
    } else if (newItem.type === 'monthly') {
      selectedDayTime.value = newItem.repeatValue || null
    } else if (newItem.type === 'daily') {
      selectedTime.value = newItem.repeatValue || null
    } else if (newItem.type === 'hourly') {
      selectedMinuteSecond.value = newItem.repeatValue || null
    } else if (newItem.type === 'weekly') {
      selectedWeekDays.value = newItem.repeatValue ? newItem.repeatValue.split(',').map(Number) : []
      selectedTime.value = newItem.targetTime.split(' ')[1] || null // 从 targetTime 中提取时间
    } else if (newItem.type === 'every_n_days') {
      everyNDays.value = newItem.repeatValue ? Number(newItem.repeatValue) : null
      selectedDateTime.value = newItem.targetTime // every_n_days 的起始时间
    }
  } else {
    editingItem.value = null
    countdownName.value = ''
    countdownType.value = 'once'
    selectedTags.value = [] // 清空标签
    displayUnits.value = ['days', 'hours', 'minutes', 'seconds'] // 重置显示单位
    remindBeforeMinutes.value = null // 清空提前提醒
    onFinishAction.value = 'do_nothing'; // 清空完成后操作
    selectedDateTime.value = null
    selectedMonthDayTime.value = null
    selectedDayTime.value = null
    selectedTime.value = null
    selectedMinuteSecond.value = null
    selectedWeekDays.value = []
    everyNDays.value = null
  }
}, { immediate: true })

const saveSettings = () => {
  if (!countdownName.value) {
    ElMessage.warning('请输入倒计时名称！')
    return
  }

  let targetTimeValue: string | null = null
  let repeatValue: string | undefined = undefined

  if (countdownType.value === 'once') {
    if (!selectedDateTime.value) {
      ElMessage.warning('请选择目标日期和时间！')
      return
    }
    targetTimeValue = selectedDateTime.value
  } else if (countdownType.value === 'yearly') {
    if (!selectedMonthDayTime.value) {
      ElMessage.warning('请选择月日和时间！')
      return
    }
    repeatValue = selectedMonthDayTime.value
    // 对于重复类型，targetTime 可以设置为一个基准时间，例如当前年份的重复时间
    const now = new Date()
    const [month, day, time] = repeatValue.split(/[- :]/)
    targetTimeValue = `${now.getFullYear()}-${month}-${day} ${time}`
  } else if (countdownType.value === 'monthly') {
    if (!selectedDayTime.value) {
      ElMessage.warning('请选择日和时间！')
      return
    }
    repeatValue = selectedDayTime.value
    const now = new Date()
    const [day, time] = repeatValue.split(/[- :]/)
    targetTimeValue = `${now.getFullYear()}-${now.getMonth() + 1}-${day} ${time}`
  } else if (countdownType.value === 'daily') {
    if (!selectedTime.value) {
      ElMessage.warning('请选择时间！')
      return
    }
    repeatValue = selectedTime.value
    const now = new Date()
    targetTimeValue = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${repeatValue}`
  } else if (countdownType.value === 'hourly') {
    if (!selectedMinuteSecond.value) {
      ElMessage.warning('请选择分秒！')
      return
    }
    repeatValue = selectedMinuteSecond.value
    const now = new Date()
    targetTimeValue = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${now.getHours()}:${repeatValue}`
  } else if (countdownType.value === 'weekly') {
    if (selectedWeekDays.value.length === 0 || !selectedTime.value) {
      ElMessage.warning('请选择星期和时间！')
      return
    }
    repeatValue = selectedWeekDays.value.sort().join(',')
    const now = new Date()
    // targetTimeValue 存储一个基准时间，例如最近的一个符合条件的日期
    targetTimeValue = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${selectedTime.value}`
  } else if (countdownType.value === 'every_n_days') {
    if (!everyNDays.value || !selectedDateTime.value) {
      ElMessage.warning('请输入天数和起始日期时间！')
      return
    }
    repeatValue = String(everyNDays.value)
    targetTimeValue = selectedDateTime.value // every_n_days 的起始时间
  }

  if (!targetTimeValue) {
    ElMessage.warning('请选择目标时间！')
    return
  }

  const item: CountdownItem = {
    id: editingItem.value ? editingItem.value.id : '',
    name: countdownName.value,
    targetTime: targetTimeValue,
    type: countdownType.value,
    repeatValue: repeatValue,
    tags: selectedTags.value.length > 0 ? selectedTags.value : undefined, // 保存标签
    displayUnits: displayUnits.value, // 保存显示单位
    remindBefore: remindBeforeMinutes.value || undefined, // 保存提前提醒
    createdAt: editingItem.value ? editingItem.value.createdAt : new Date().toISOString(), // 保存创建时间
    onFinishAction: onFinishAction.value, // 保存完成后操作
    position: editingItem.value ? editingItem.value.position : 0 // 保存位置信息
  }
  emit('saveCountdown', item)
  // 保存后清空表单
  countdownName.value = ''
  countdownType.value = 'once'
  selectedTags.value = [] // 清空标签
  displayUnits.value = ['days', 'hours', 'minutes', 'seconds']
  remindBeforeMinutes.value = null
  onFinishAction.value = 'do_nothing'; // 清空完成后操作
  selectedDateTime.value = null
  selectedMonthDayTime.value = null
  selectedDayTime.value = null
  selectedTime.value = null
  selectedMinuteSecond.value = null
  selectedWeekDays.value = []
  everyNDays.value = null
  editingItem.value = null
}

const cancelEdit = () => {
  countdownName.value = ''
  countdownType.value = 'once'
  selectedTags.value = [] // 清空标签
  displayUnits.value = ['days', 'hours', 'minutes', 'seconds']
  remindBeforeMinutes.value = null
  onFinishAction.value = 'do_nothing'; // 清空完成后操作
  selectedDateTime.value = null
  selectedMonthDayTime.value = null
  selectedDayTime.value = null
  selectedTime.value = null
  selectedMinuteSecond.value = null
  selectedWeekDays.value = []
  everyNDays.value = null
  editingItem.value = null
  emit('cancelEdit')
}

const setQuickTime = (type: string) => {
  const now = new Date()
  let target = new Date()

  switch (type) {
    case 'today_6pm':
      target.setHours(18, 0, 0, 0)
      // 如果已经过了今天18点，则设置为明天18点
      if (target.getTime() < now.getTime()) {
        target.setDate(target.getDate() + 1)
      }
      break
    case 'tomorrow_9am':
      target.setDate(now.getDate() + 1)
      target.setHours(9, 0, 0, 0)
      break
    case 'next_hour':
      target.setHours(now.getHours() + 1, now.getMinutes(), 0, 0)
      break
  }
  // 快捷设置只适用于一次性倒计时
  countdownType.value = 'once'
  selectedDateTime.value = target.toISOString().slice(0, 19).replace('T', ' ')
}
</script>

<style scoped>
.full-width-picker {
  width: 100%;
}

.quick-set-buttons {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.quick-set-buttons .el-button {
  flex-grow: 1;
  min-width: 100px; /* 确保按钮不会太小 */
}

.settings-container {
  background-color: var(--card-bg-color); /* 使用主题变量 */
  border-radius: 10px;
  box-shadow: var(--card-shadow); /* 使用主题变量 */
  padding: 30px;
  width: 100%;
  box-sizing: border-box;
}

h2 {
  color: var(--text-color); /* 使用主题变量 */
  font-size: 1.8em;
  margin-bottom: 25px;
  text-align: center;
}

.el-form-item {
  margin-bottom: 20px;
}

.form-actions {
  display: flex;
  justify-content: flex-end; /* 按钮靠右对齐 */
  gap: 10px; /* 按钮之间间距 */
  margin-top: 20px; /* 与上方表单项的间距 */
}

.form-actions .el-button {
  width: auto; /* 让按钮宽度自适应内容 */
  padding: 10px 20px; /* 调整内边距 */
  font-size: 1em; /* 调整字体大小 */
}

/* 媒体查询：小屏幕设备 */
@media (max-width: 768px) {
  .settings-container {
    padding: 20px;
  }

  h2 {
    font-size: 1.5em;
    margin-bottom: 20px;
  }

  .el-form-item .el-form-item__content {
    margin-left: 0 !important;
  }

  .el-form-item__label {
    width: 100% !important;
    text-align: left !important;
    margin-bottom: 5px;
  }

  .el-button {
    font-size: 1em;
    padding: 10px 0;
  }

  .form-actions {
    justify-content: center; /* 小屏幕下按钮居中 */
  }
}
</style>
