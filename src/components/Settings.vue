<template>
  <div class="settings-container">
    <h2>{{ itemToEdit ? '编辑倒计时' : '添加新倒计时' }}</h2>
    
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      @submit.prevent="handleSubmit"
    >
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入倒计时名称"
          clearable
        />
      </el-form-item>

      <el-form-item label="类型" prop="type">
        <el-select v-model="form.type" placeholder="请选择倒计时类型" style="width: 100%">
          <el-option label="一次性" value="once" />
          <el-option label="每年重复" value="yearly" />
          <el-option label="每月重复" value="monthly" />
          <el-option label="每日重复" value="daily" />
          <el-option label="每小时重复" value="hourly" />
          <el-option label="每周重复" value="weekly" />
          <el-option label="每N天重复" value="every_n_days" />
        </el-select>
      </el-form-item>

      <el-form-item label="目标时间" prop="targetTime">
        <el-date-picker
          v-model="form.targetTime"
          type="datetime"
          placeholder="选择目标时间"
          style="width: 100%"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </el-form-item>

      <el-form-item label="标签" prop="tags">
        <el-select
          v-model="form.tags"
          multiple
          filterable
          allow-create
          placeholder="选择或创建标签"
          style="width: 100%"
        >
          <el-option
            v-for="tag in allExistingTags"
            :key="tag"
            :label="tag"
            :value="tag"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSubmit">
          {{ itemToEdit ? '更新' : '添加' }}
        </el-button>
        <el-button @click="handleCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { v4 as uuidv4 } from 'uuid'
import type { CountdownItem } from '../types'

interface Props {
  itemToEdit?: CountdownItem | null
  allExistingTags?: string[]
}

interface Emits {
  (e: 'save-countdown', item: CountdownItem): void
  (e: 'cancel-edit'): void
}

const props = withDefaults(defineProps<Props>(), {
  itemToEdit: null,
  allExistingTags: () => []
})

const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const form = reactive({
  name: '',
  type: 'once' as CountdownItem['type'],
  targetTime: '',
  tags: [] as string[]
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入倒计时名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择倒计时类型', trigger: 'change' }
  ],
  targetTime: [
    { required: true, message: '请选择目标时间', trigger: 'change' }
  ]
}

// 监听编辑项变化
watch(() => props.itemToEdit, (newItem) => {
  if (newItem) {
    form.name = newItem.name
    form.type = newItem.type
    form.targetTime = newItem.targetTime
    form.tags = newItem.tags || []
  } else {
    // 重置表单
    form.name = ''
    form.type = 'once'
    form.targetTime = ''
    form.tags = []
  }
}, { immediate: true })

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    const countdownItem: CountdownItem = {
      id: props.itemToEdit?.id || uuidv4(),
      name: form.name,
      type: form.type,
      targetTime: form.targetTime,
      tags: form.tags.length > 0 ? form.tags : undefined,
      createdAt: props.itemToEdit?.createdAt || new Date().toISOString(),
      position: props.itemToEdit?.position || 0,
      user_id: props.itemToEdit?.user_id
    }

    emit('save-countdown', countdownItem)
  } catch (error) {
    console.error('Form validation error:', error)
    ElMessage.error('表单验证失败')
  }
}

const handleCancel = () => {
  emit('cancel-edit')
}
</script>

<style scoped>
.settings-container {
  padding: 20px;
}

.settings-container h2 {
  margin-bottom: 20px;
  color: var(--text-color);
}
</style>