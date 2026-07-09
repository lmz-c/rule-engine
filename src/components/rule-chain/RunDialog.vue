<template>
  <el-dialog
    v-model="visible"
    title="规则链运行"
    width="1000px"
    :close-on-click-modal="false"
    :close-on-press-escape="true"

  >
      <!-- destroy-on-close -->
    <div class="run-dialog-body">
      <!-- 左侧：元数据 + 请求体 -->
      <div class="left-panel">
        <!-- 元数据 -->
        <div class="code-section">
          <div class="code-header">
            <span class="code-title">元数据</span>
            <span class="code-hint">设备绑定信息</span>
          </div>
          <div class="code-editor-wrapper">
            <Codemirror
              v-model="metadataCode"
              :style="{ height: '150px' }"
              :autofocus="false"
              :indent-with-tab="true"
              :tab-size="2"
              :extensions="extensions"
            />
          </div>
        </div>

        <!-- 请求体 -->
        <div class="code-section" style="margin-top:12px;">
          <div class="code-header">
            <span class="code-title">请求体</span>
            <span class="code-hint">设备上报数据</span>
          </div>
          <div class="code-editor-wrapper">
            <Codemirror
              v-model="payloadCode"
              :style="{ height: '180px' }"
              :autofocus="false"
              :indent-with-tab="true"
              :tab-size="2"
              :extensions="extensions"
            />
          </div>
        </div>
      </div>

      <!-- 右侧：响应体 -->
      <div class="right-panel">
        <div class="code-section">
          <div class="code-header">
            <span class="code-title">响应体</span>
            <span class="code-hint" :style="{ color: responseStatus === 'success' ? '#67C23A' : responseStatus === 'error' ? '#F56C6C' : '#909399' }">
              {{ responseStatusText }}
            </span>
          </div>
          <div class="code-editor-wrapper response-wrapper">
             <Codemirror
              v-model="responseCode"
              :style="{ height: '100%' }"
              :autofocus="false"
              :indent-with-tab="true"
              :tab-size="2"
              :extensions="extensions"
              :disabled="true"
            />
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button size="small" @click="handleCancel">取消</el-button>
      <el-button size="small" type="primary" @click="handleExecute" :loading="executing">
        执行
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Codemirror } from 'vue-codemirror'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { bindDevice, simulateDeviceReport } from '@/api/device'


const props = defineProps<{
  modelValue: boolean
  chainId?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

// ===== 状态 =====
const visible = ref(false)
const executing = ref(false)
const responseStatus = ref<'idle' | 'success' | 'error'>('idle')
const responseStatusText = ref('等待执行...')

// 代码内容
const metadataCode = ref(`{
  "deviceId": "DEV_001"
}`)

const payloadCode = ref(`{
  "temp": 85,
  "humidity": 60
}`)

const responseCode = ref('')

// 编辑器扩展
const extensions = [json(), oneDark]

// ===== 监听弹窗显示 =====
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    // 重置状态
    responseCode.value = ''
    responseStatus.value = 'idle'
    responseStatusText.value = '等待执行...'
    // 如果传入了 chainId，自动填入元数据
    if (props.chainId) {
      try {
        const meta = JSON.parse(metadataCode.value)
        meta.chainId = props.chainId
        metadataCode.value = JSON.stringify(meta, null, 2)
      } catch (e) {
        // 如果解析失败，直接覆盖
        metadataCode.value = JSON.stringify({
          deviceId: 'DEV_001',
          chainId: props.chainId
        }, null, 2)
      }
    }
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

// ===== 执行 =====
const handleExecute = async () => {
  try {
    executing.value = true
    responseStatus.value = 'idle'
    responseStatusText.value = '执行中...'

    // 1. 解析元数据
    let metaData: any
    try {
      metaData = JSON.parse(metadataCode.value)
    } catch (e) {
      ElMessage.error('元数据 JSON 格式错误')
      responseStatus.value = 'error'
      responseStatusText.value = '❌ JSON 格式错误'
      return
    }

    // 2. 解析请求体
    let payloadData: any
    try {
      payloadData = JSON.parse(payloadCode.value)
    } catch (e) {
      ElMessage.error('请求体 JSON 格式错误')
      responseStatus.value = 'error'
      responseStatusText.value = '❌ JSON 格式错误'
      return
    }

    // 3. 调用绑定接口
    const bindRes = await bindDevice({
      deviceId: metaData.deviceId,
      chainId: metaData.chainId || props.chainId || localStorage.getItem('lastSavedRuleChain')
    })

    if (bindRes.code !== 200 && bindRes.code !== 1 && bindRes.code !== 0) {
      throw new Error(bindRes.msg || '绑定失败')
    }

    // 4. 调用模拟上报接口
    const simulateRes = await simulateDeviceReport(metaData.deviceId, payloadData)

    // 5. 显示响应
    responseCode.value = JSON.stringify(simulateRes, null, 2)
    responseStatus.value = 'success'
    responseStatusText.value = '✅ 执行成功'

    ElMessage.success('执行成功')
    emit('success')

  } catch (error: any) {
    responseStatus.value = 'error'
    responseStatusText.value = '❌ 执行失败'
    responseCode.value = JSON.stringify({
      error: true,
      message: error.message || '执行失败'
    }, null, 2)
    ElMessage.error(error.message || '执行失败')
  } finally {
    executing.value = false
  }
}

// ===== 取消 =====
const handleCancel = () => {
  visible.value = false
}
</script>

<style scoped>
.run-dialog-body {
  display: flex;
  gap: 16px;
  height: 420px;
}

.left-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.code-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  overflow: hidden;
  background: #1e1e1e;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  background: #2d2d2d;
  border-bottom: 1px solid #3d3d3d;
  flex-shrink: 0;
}

.code-title {
  font-size: 13px;
  font-weight: 500;
  color: #e0e0e0;
}

.code-hint {
  font-size: 12px;
  color: #909399;
}

.code-editor-wrapper {
  flex: 1;
  overflow: hidden;
  background: #1e1e1e;
}

.code-editor-wrapper :deep(.cm-editor) {
  height: 100% !important;
}

.code-editor-wrapper :deep(.cm-scroller) {
  height: 100% !important;
}

.response-wrapper {
  height: 100%;
}

/* 弹窗底部按钮样式 */
:deep(.el-dialog__footer) {
  border-top: 1px solid #ebeef5;
  padding: 12px 20px;
}

:deep(.el-dialog__body) {
  padding: 16px 20px;
}
</style>