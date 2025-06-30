<template>
  <div id="app-container">
    <!-- 用户信息栏 -->
    <div class="user-header">
      <div class="user-info">
        <el-avatar :size="32" :src="userAvatar">
          <el-icon><User /></el-icon>
        </el-avatar>
        <span class="user-email">{{ user?.email }}</span>
      </div>
      <div class="header-actions">
        <ThemeSwitcher />
        <el-button
          type="danger"
          size="small"
          :icon="SwitchButton"
          @click="handleLogout"
          :loading="logoutLoading"
        >
          {{ logoutLoading ? '登出中...' : '登出' }}
        </el-button>
      </div>
    </div>

        <div class="filter-section">
      <el-input v-model="searchQuery" placeholder="搜索倒计时" clearable class="search-input"></el-input>
      <el-select v-model="selectedTagsFilter" placeholder="筛选标签" clearable multiple class="category-select">
        <el-option label="所有标签" value=""></el-option>
        <el-option
          v-for="tag in uniqueTags"
          :key="tag"
          :label="tag"
          :value="tag"
        ></el-option>
      </el-select>
      <el-select v-model="sortOrder" placeholder="排序方式" class="sort-select">
        <el-option label="默认 (创建时间)" value="default"></el-option>
        <el-option label="名称 (A-Z)" value="name-asc"></el-option>
        <el-option label="名称 (Z-A)" value="name-desc"></el-option>
        <el-option label="最近结束" value="nearest"></el-option>
        <el-option label="最远结束" value="farthest"></el-option>
      </el-select>
      <el-button @click="exportData" class="ml-2">导出数据</el-button>
      <el-upload
        class="upload-demo ml-2"
        action="#"
        :show-file-list="false"
        :on-change="importData"
        :auto-upload="false"
      >
        <el-button>导入数据</el-button>
      </el-upload>
    </div>

    <CountdownList
      :countdowns="filteredAndSortedCountdowns"
      @update:countdowns="updateCountdowns"
      @delete-countdown="deleteCountdown"
      @edit-countdown="editCountdown"
    />

    <div v-if="filteredAndSortedCountdowns.length === 0" class="empty-countdown-message">
      <p>还没有倒计时哦！点击右下角的 + 按钮添加一个吧！</p>
    </div>

    <el-button type="primary" :icon="Plus" circle size="large" class="add-countdown-fab" @click="openAddDialog" />

    <el-dialog
      v-model="dialogVisible"
      :title="currentEditingItem ? '编辑倒计时' : '添加新倒计时'"
      width="500px"
      :before-close="handleClose"
    >
      <Settings
        :item-to-edit="currentEditingItem"
        :all-existing-tags="uniqueTags"
        @save-countdown="saveCountdownAndCloseDialog"
        @cancel-edit="closeDialog"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { v4 as uuidv4 } from 'uuid'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Plus, User, SwitchButton } from '@element-plus/icons-vue'
import CountdownList from './components/CountdownList.vue'
import Settings from './components/Settings.vue'
import ThemeSwitcher from './components/ThemeSwitcher.vue'
import type { CountdownItem } from './types'
import { supabase } from './supabase'
import { useAuth } from './composables/useAuth'

const router = useRouter()
const { user, signOut } = useAuth()

const countdowns = ref<CountdownItem[]>([])
const dialogVisible = ref(false)
const currentEditingItem = ref<CountdownItem | null>(null)
const selectedTagsFilter = ref<string[]>([]) // 替换 selectedCategory
const searchQuery = ref<string>('') // 新增搜索查询
const sortOrder = ref<string>('default') // 新增排序方式
const logoutLoading = ref(false)

// 用户头像（可以后续扩展为从用户资料获取）
const userAvatar = computed(() => {
  return user.value?.user_metadata?.avatar_url || ''
})

// 计算所有倒计时的唯一标签
const uniqueTags = computed(() => {
  const tags = new Set<string>()
  countdowns.value.forEach(item => {
    if (item.tags) {
      item.tags.forEach(tag => tags.add(tag))
    }
  })
  return Array.from(tags).sort() // 排序标签
})

// 过滤和排序倒计时
const filteredAndSortedCountdowns = computed({
  get() {
    let filtered = countdowns.value;

    // 1. 过滤 (按标签)
    if (selectedTagsFilter.value.length > 0) {
      filtered = filtered.filter(item =>
        item.tags && selectedTagsFilter.value.every(filterTag => item.tags!.includes(filterTag))
      );
    }

    // 2. 搜索 (按名称)
    if (searchQuery.value) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    }

    // 3. 排序
    return filtered.sort((a, b) => {
      if (sortOrder.value === 'name-asc') {
        return a.name.localeCompare(b.name);
      } else if (sortOrder.value === 'name-desc') {
        return b.name.localeCompare(a.name);
      } else if (sortOrder.value === 'nearest') {
        // 对于重复倒计时，需要计算下一个目标时间进行比较
        const getNextTargetTime = (item: CountdownItem) => {
          const now = new Date();
          let target = new Date(item.targetTime);
          if (item.type === 'yearly' && item.repeatValue) {
            const [month, day, time] = item.repeatValue.split(/[- :]/);
            const [hour, minute, second] = time.split(':');
            target = new Date(now.getFullYear(), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second || '0'));
            if (target.getTime() < now.getTime()) {
              target.setFullYear(target.getFullYear() + 1);
            }
          } else if (item.type === 'monthly' && item.repeatValue) {
            const [day, time] = item.repeatValue.split(/[- :]/);
            const [hour, minute, second] = time.split(':');
            target = new Date(now.getFullYear(), now.getMonth(), parseInt(day), parseInt(hour), parseInt(minute), parseInt(second || '0'));
            if (target.getTime() < now.getTime()) {
              target.setMonth(target.getMonth() + 1);
            }
          } else if (item.type === 'daily' && item.repeatValue) {
            const [hour, minute, second] = item.repeatValue.split(':');
            target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hour), parseInt(minute), parseInt(second || '0'));
            if (target.getTime() < now.getTime()) {
              target.setDate(target.getDate() + 1);
            }
          } else if (item.type === 'hourly' && item.repeatValue) {
            const [minute, second] = item.repeatValue.split(':');
            target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), parseInt(minute), parseInt(second || '0'));
            if (target.getTime() < now.getTime()) {
              target.setHours(target.getHours() + 1);
            }
          } else if (item.type === 'weekly' && item.repeatValue) {
            const weekDays = item.repeatValue.split(',').map(Number); // 0-6, Sunday-Saturday
            const [hour, minute, second] = item.targetTime.split(' ')[1].split(':');
            let nextTarget = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hour), parseInt(minute), parseInt(second || '0'));
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
              nextTarget = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hour), parseInt(minute), parseInt(second || '0'));
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
          } else if (item.type === 'every_n_days' && item.repeatValue) {
            const nDays = parseInt(item.repeatValue);
            const startDate = new Date(item.targetTime);
            let currentTarget = new Date(startDate);
            while (currentTarget.getTime() < now.getTime()) {
              currentTarget.setDate(currentTarget.getDate() + nDays);
            }
            target = currentTarget;
          }
          return target.getTime();
        };
        const timeA = getNextTargetTime(a);
        const timeB = getNextTargetTime(b);
        return timeA - timeB;
      } else if (sortOrder.value === 'farthest') {
        const getNextTargetTime = (item: CountdownItem) => {
          const now = new Date();
          let target = new Date(item.targetTime);
          if (item.type === 'yearly' && item.repeatValue) {
            const [month, day, time] = item.repeatValue.split(/[- :]/);
            const [hour, minute, second] = time.split(':');
            target = new Date(now.getFullYear(), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second || '0'));
            if (target.getTime() < now.getTime()) {
              target.setFullYear(target.getFullYear() + 1);
            }
          } else if (item.type === 'monthly' && item.repeatValue) {
            const [day, time] = item.repeatValue.split(/[- :]/);
            const [hour, minute, second] = time.split(':');
            target = new Date(now.getFullYear(), now.getMonth(), parseInt(day), parseInt(hour), parseInt(minute), parseInt(second || '0'));
            if (target.getTime() < now.getTime()) {
              target.setMonth(target.getMonth() + 1);
            }
          } else if (item.type === 'daily' && item.repeatValue) {
            const [hour, minute, second] = item.repeatValue.split(':');
            target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hour), parseInt(minute), parseInt(second || '0'));
            if (target.getTime() < now.getTime()) {
              target.setDate(target.getDate() + 1);
            }
          } else if (item.type === 'hourly' && item.repeatValue) {
            const [minute, second] = item.repeatValue.split(':');
            target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), parseInt(minute), parseInt(second || '0'));
            if (target.getTime() < now.getTime()) {
              target.setHours(target.getHours() + 1);
            }
          } else if (item.type === 'weekly' && item.repeatValue) {
            const weekDays = item.repeatValue.split(',').map(Number); // 0-6, Sunday-Saturday
            const [hour, minute, second] = item.targetTime.split(' ')[1].split(':');
            let nextTarget = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hour), parseInt(minute), parseInt(second || '0'));
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
              nextTarget = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hour), parseInt(minute), parseInt(second || '0'));
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
          } else if (item.type === 'every_n_days' && item.repeatValue) {
            const nDays = parseInt(item.repeatValue);
            const startDate = new Date(item.targetTime);
            let currentTarget = new Date(startDate);
            while (currentTarget.getTime() < now.getTime()) {
              currentTarget.setDate(currentTarget.getDate() + nDays);
            }
            target = currentTarget;
          }
          return target.getTime();
        };
        const timeA = getNextTargetTime(a);
        const timeB = getNextTargetTime(b);
        return timeB - timeA;
      } else { // default: 按创建时间排序
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  },
  set(newValue: CountdownItem[]) {
    countdowns.value = newValue;
    saveCountdownsToSupabase(newValue);
  }
});


onMounted(async () => {
  const { data, error } = await supabase
    .from('countdowns')
    .select('*')
    .eq('user_id', user.value?.id)
    .order('position', { ascending: true })

  if (error) {
    console.error('Error fetching countdowns:', error)
  } else {
    countdowns.value = data as CountdownItem[]
  }
})

const saveCountdownsToSupabase = async (items: CountdownItem[]) => {
  const updates = items.map((item, index) => ({
    ...item,
    position: index, // 更新 position 字段
  }))

  const { error } = await supabase.from('countdowns').upsert(updates)

  if (error) {
    console.error('Error saving countdowns:', error)
    ElMessage.error('保存倒计时失败！')
  } else {
    ElMessage.success('倒计时已保存！')
  }
}

const saveCountdownAndCloseDialog = async (item: CountdownItem) => {
  if (item.tags && item.tags.length === 0) {
    delete item.tags;
  }

  if (item.id) {
    // Update existing countdown
    const { error } = await supabase
      .from('countdowns')
      .update(item)
      .eq('id', item.id)
      .eq('user_id', user.value?.id) // 确保只能更新自己的数据
    if (error) {
      console.error('Error updating countdown:', error)
      ElMessage.error('更新倒计时失败！')
    } else {
      const index = countdowns.value.findIndex(c => c.id === item.id)
      if (index !== -1) {
        countdowns.value[index] = item
      }
      ElMessage.success('倒计时已更新！')
    }
  } else {
    // Add new countdown
    item.id = uuidv4()
    item.user_id = user.value?.id // 设置用户ID
    item.position = countdowns.value.length // 新增倒计时放在最后
    const { error } = await supabase.from('countdowns').insert(item)
    if (error) {
      console.error('Error adding countdown:', error)
      ElMessage.error('添加倒计时失败！')
    } else {
      countdowns.value.push(item)
      ElMessage.success('倒计时已添加！')
    }
  }
  closeDialog()
}

const deleteCountdown = async (id: string) => {
  const { error } = await supabase
    .from('countdowns')
    .delete()
    .eq('id', id)
    .eq('user_id', user.value?.id) // 确保只能删除自己的数据
  if (error) {
    console.error('Error deleting countdown:', error)
    ElMessage.error('删除倒计时失败！')
  } else {
    countdowns.value = countdowns.value.filter(c => c.id !== id)
    ElMessage.success('倒计时已删除！')
  }
}

const openAddDialog = () => {
  currentEditingItem.value = null
  dialogVisible.value = true
}

const editCountdown = (item: CountdownItem) => {
  currentEditingItem.value = { ...item } // 复制一份，避免直接修改 props
  dialogVisible.value = true
}

const updateCountdowns = async (newOrder: CountdownItem[]) => {
  countdowns.value = newOrder
  await saveCountdownsToSupabase(newOrder)
}

const closeDialog = () => {
  dialogVisible.value = false
  currentEditingItem.value = null
}

const handleClose = (done: () => void) => {
  ElMessageBox.confirm('确定关闭吗？未保存的更改将丢失。')
    .then(() => {
      closeDialog()
      done()
    })
    .catch(() => {
      // 取消关闭
    })
}



const exportData = async () => {
  const { data, error } = await supabase
    .from('countdowns')
    .select('*')
    .eq('user_id', user.value?.id)

  if (error) {
    console.error('Error fetching data for export:', error)
    ElMessage.error('导出失败：无法获取数据！')
    return
  }

  const dataStr = JSON.stringify(data, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `countdown_data_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  ElMessage.success('数据已成功导出！');
};

const importData = (file: any) => {
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const importedCountdowns: CountdownItem[] = JSON.parse(e.target?.result as string);
      // 简单的验证，确保导入的数据结构正确
      if (Array.isArray(importedCountdowns) && importedCountdowns.every(item => item.id && item.name && item.targetTime && item.type)) {
        // 兼容旧数据，如果导入的数据没有 tags 字段，则尝试从 category 转换
        const processedCountdowns = importedCountdowns.map((item, index) => {
          const newItem = { ...item } as any;
          if (!newItem.tags && newItem.category) {
            newItem.tags = [newItem.category];
          }
          delete newItem.category; // 移除 category 字段
          newItem.position = index; // 设置 position 字段
          newItem.user_id = user.value?.id; // 设置当前用户ID
          return newItem as CountdownItem;
        });

        // 清空当前用户的现有数据并插入新数据
        const { error: deleteError } = await supabase
          .from('countdowns')
          .delete()
          .eq('user_id', user.value?.id); // 只删除当前用户的数据
        if (deleteError) {
          console.error('Error clearing existing data:', deleteError);
          ElMessage.error('导入失败：清空现有数据时出错！');
          return;
        }

        const { error: insertError } = await supabase.from('countdowns').insert(processedCountdowns);
        if (insertError) {
          console.error('Error importing data:', insertError);
          ElMessage.error('导入失败：插入新数据时出错！');
          return;
        }

        countdowns.value = processedCountdowns;
        ElMessage.success('数据已成功导入！');
      } else {
        ElMessage.error('导入文件格式不正确！');
      }
    } catch (error) {
      ElMessage.error('导入文件解析失败！');
      console.error('Error importing data:', error);
    }
  };
  reader.readAsText(file.raw);
};

// 登出功能
const handleLogout = async () => {
  try {
    logoutLoading.value = true

    const result = await signOut()

    if (result.success) {
      ElMessage.success('已成功登出')
      router.push('/login')
    } else {
      ElMessage.error(result.error?.message || '登出失败，请稍后重试')
    }
  } catch (error) {
    console.error('Logout error:', error)
    ElMessage.error('登出过程中发生错误')
  } finally {
    logoutLoading.value = false
  }
}
</script>

<style>
#app-container {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem; /* 20px */
  padding: 1.25rem; /* 20px */
  background-color: #e9ecef;
  min-height: 100vh;
  box-sizing: border-box;
  max-width: 1440px; /* 限制最大宽度 */
  margin: 0 auto; /* 居中显示 */
}

/* 用户信息栏样式 */
.user-header {
  width: 100%;
  max-width: 1200px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: var(--card-bg-color);
  border-radius: 12px;
  box-shadow: var(--card-shadow);
  margin-bottom: 0.5rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-email {
  font-size: 14px;
  color: var(--text-color);
  font-weight: 500;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

body {
  margin: 0;
  padding: 0;
  background-color: #e9ecef;
}

.add-countdown-fab {
  position: fixed;
  bottom: 1.875rem; /* 30px */
  right: 1.875rem; /* 30px */
  z-index: 1000; /* 确保按钮在其他内容之上 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.filter-section {
  width: 100%;
  max-width: 1200px;
  text-align: left;
  margin-bottom: 1.25rem; /* 20px */
  display: flex; /* 使筛选器和按钮在同一行 */
  align-items: center;
  gap: 0.625rem; /* 10px */
}

.upload-demo {
  display: inline-block; /* 使上传按钮与导出按钮并排 */
}

/* 新增样式 */
.search-input {
  flex-grow: 1;
  max-width: 18.75rem; /* 300px */
}

.category-select,
.sort-select {
  width: 11.25rem; /* 180px */
}

.empty-countdown-message {
  text-align: center;
  margin-top: 3.125rem; /* 50px */
  font-size: 1.2em;
  color: var(--secondary-text-color);
}

/* 媒体查询：小屏幕设备 */
@media (max-width: 48rem) { /* 768px */
  #app-container {
    margin-top: 1.25rem; /* 20px */
    gap: 1.25rem; /* 20px */
    padding: 0.625rem; /* 10px */
  }

  .user-header {
    padding: 0.75rem 1rem;
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .user-info {
    justify-content: center;
  }

  .header-actions {
    justify-content: center;
  }

  .add-countdown-fab {
    bottom: 1.25rem; /* 20px */
    right: 1.25rem; /* 20px */
    size: medium; /* 调整小屏幕下的按钮大小 */
  }

  .filter-section {
    flex-direction: column; /* 小屏幕下垂直堆叠 */
    align-items: flex-start;
  }

  .search-input,
  .category-select,
  .sort-select {
    width: 100%;
    max-width: none;
  }
}
</style>