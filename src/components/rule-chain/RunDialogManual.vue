<template>
  <!-- 遮罩层 -->
  <div v-if="visible" class="dialog-overlay" @click.self="handleClose">
    <!-- 弹窗容器 -->
    <div class="dialog-container" :style="{ width: '1000px' }">
      <!-- 头部 -->
      <div class="dialog-header">
        <span>🚀 规则链运行</span>
        <button class="close-btn" @click="handleClose">×</button>
      </div>
      
      <!-- 主体 -->
      <div class="dialog-body">
        <!-- 左侧：元数据 + 请求体 -->
        <div class="left-panel">
          <!-- 元数据 -->
          <div class="code-section">
            <div class="code-header">
              <span class="code-title">📋 元数据</span>
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
              <span class="code-title">📤 请求体</span>
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
              <span class="code-title">📥 响应体</span>
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

      <!-- 底部 -->
      <div class="dialog-footer">
        <button class="btn btn-cancel" @click="handleClose">取消</button>
        <button class="btn btn-primary" @click="handleExecute" :disabled="executing">
          {{ executing ? '执行中...' : '🚀 执行' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Codemirror } from 'vue-codemirror'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { bindDevice, simulateDeviceReport } from '@/api/device'

const props = defineProps<{
  chainId?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

// 状态
const visible = ref(true) // 直接为 true，由 v-if 控制生命周期
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

// 初始化
onMounted(() => {
  console.log('RunDialogManual mounted, chainId:', props.chainId)
  if (props.chainId) {
    try {
      const meta = JSON.parse(metadataCode.value)
      meta.chainId = props.chainId
      metadataCode.value = JSON.stringify(meta, null, 2)
    } catch (e) {
      metadataCode.value = JSON.stringify({
        deviceId: 'DEV_001',
        chainId: props.chainId
      }, null, 2)
    }
  }
})

// 清理
onUnmounted(() => {
  console.log('RunDialogManual unmounting...')
  // 清理 Codemirror 实例
  metadataCode.value = ''
  payloadCode.value = ''
  responseCode.value = ''
})

// 关闭
const handleClose = () => {
  emit('close')
}

// 执行
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
      chainId: metaData.chainId || props.chainId
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

// ESC 键关闭
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && visible.value) {
    handleClose()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.dialog-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  animation: slide-in 0.2s ease-out;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
  font-size: 16px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #909399;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.close-btn:hover {
  background: #f5f7fa;
  color: #606266;
}

.dialog-body {
  flex: 1;
  padding: 20px;
  overflow: auto;
  display: flex;
  gap: 16px;
  min-height: 400px;
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

.response-wrapper {
  height: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #ebeef5;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-cancel {
  color: #606266;
}

.btn-cancel:hover {
  color: #409eff;
  border-color: #c6e2ff;
  background: #ecf5ff;
}

.btn-primary {
  color: white;
  background: #409eff;
  border-color: #409eff;
}

.btn-primary:hover {
  background: #66b1ff;
  border-color: #66b1ff;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

:deep(.cm-editor) {
  height: 100% !important;
}

:deep(.cm-scroller) {
  height: 100% !important;
}
</style>