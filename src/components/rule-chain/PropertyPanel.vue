<template>
  <div class="property-panel">
    <div class="property-header">
      <span>⚙️ 属性配置</span>
      <el-button
        size="small"
        text
        @click="emit('toggle')"
      >
        <el-icon><DArrowRight v-if="open" /><DArrowLeft v-else /></el-icon>
      </el-button>
    </div>

    <div v-show="open" class="property-body">
      <!-- 系统操作 -->
      <div class="property-section">
        <div class="section-title">系统操作</div>
        <div class="section-content">
          <el-button
            size="small"
            @click="emit('zoom-in')"
            style="width:100%;margin-bottom:4px"
          >
            🔍 放大
          </el-button>
          <el-button
            size="small"
            @click="emit('zoom-out')"
            style="width:100%;margin-bottom:4px"
          >
            🔍 缩小
          </el-button>
          <el-button
            size="small"
            @click="emit('fit-view')"
            style="width:100%;margin-bottom:4px"
          >
            📐 适应画布
          </el-button>
        </div>
      </div>

      <!-- 网格设置 -->
      <div class="property-section">
        <div class="section-title">网格设置</div>
        <div class="section-content">
          <el-form size="small">
            <el-form-item label="网格大小">
              <el-input-number
                :model-value="gridSize"
                @update:model-value="emit('update-grid-size', $event)"
                :min="10"
                :max="50"
                :step="5"
                controls-position="right"
              />
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- 节点操作 -->
      <div v-if="selectedNode" class="property-section">
        <div class="section-title">节点操作</div>
        <div class="section-content">
          <el-form size="small" label-width="70px">
            <el-form-item label="名称">
              <el-input
                :model-value="selectedNode.data?.label"
                @update:model-value="emit('update-node-label', $event)"
                size="small"
              />
            </el-form-item>

            <el-form-item label="类型">
              <el-input
                :model-value="selectedNode.data?.type"
                disabled
                size="small"
              />
            </el-form-item>

            <template v-for="(field, key) in configSchema" :key="key">
              <el-form-item :label="key">
                <!-- 字符串 -->
                <el-input
                  v-if="field.type === 'string'"
                  :model-value="getConfigValue(key)"
                  @update:model-value="updateConfig(key, $event)"
                  size="small"
                  :placeholder="field.placeholder"
                />
                <!-- 数字 -->
                <el-input-number
                  v-else-if="field.type === 'number'"
                  :model-value="getConfigValue(key)"
                  @update:model-value="updateConfig(key, $event)"
                  size="small"
                  :placeholder="field.placeholder"
                  controls-position="right"
                />
                <!-- 枚举 -->
                <el-select
                  v-else-if="field.type === 'enum'"
                  :model-value="getConfigValue(key)"
                  @update:model-value="updateConfig(key, $event)"
                  size="small"
                  :placeholder="field.placeholder"
                >
                  <el-option
                    v-for="opt in field.options"
                    :key="opt"
                    :label="opt"
                    :value="opt"
                  />
                </el-select>
                <!-- 文本域 -->
                <el-input
                  v-else-if="field.type === 'textarea'"
                  :model-value="getConfigValue(key)"
                  @update:model-value="updateConfig(key, $event)"
                  type="textarea"
                  :rows="3"
                  size="small"
                  :placeholder="field.placeholder"
                />
                <!-- 布尔 -->
                <el-switch
                  v-else-if="field.type === 'boolean'"
                  :model-value="getConfigValue(key)"
                  @update:model-value="updateConfig(key, $event)"
                  size="small"
                />
                <!-- JSON -->
                <el-input
                  v-else
                  :model-value="getConfigValue(key)"
                  @update:model-value="updateConfig(key, $event)"
                  type="textarea"
                  :rows="3"
                  size="small"
                  :placeholder="field.placeholder || '请输入 JSON'"
                />
              </el-form-item>
            </template>

            <el-form-item>
              <el-button
                size="small"
                type="danger"
                @click="emit('delete-node')"
                style="width:100%"
              >
                🗑️ 删除节点
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <div v-else class="empty-tip">
        <el-icon><InfoFilled /></el-icon>
        <span>点击画布上的节点进行配置</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { DArrowLeft, DArrowRight, InfoFilled } from '@element-plus/icons-vue'

const props = defineProps<{
  selectedNode: any
  configSchema: Record<string, any>
  gridSize: number
  open?: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
  (e: 'zoom-in'): void
  (e: 'zoom-out'): void
  (e: 'fit-view'): void
  (e: 'update-grid-size', size: number): void
  (e: 'update-node-label', label: string): void
  (e: 'update-config', key: string, value: any): void
  (e: 'delete-node'): void
}>()

// 获取配置值
const getConfigValue = (key: string) => {
  return props.selectedNode?.data?.config?.[key]
}

// 更新配置
const updateConfig = (key: string, value: any) => {
  emit('update-config', key, value)
}
</script>

<style scoped>
.property-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-left: 1px solid #e4e7ed;
  overflow: hidden;
  flex-shrink: 0;
}

.property-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
  background: #fafafa;
}

.property-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
}

.property-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 10px;
}

.section-content {
  padding: 4px 0;
}

.section-content :deep(.el-form-item) {
  margin-bottom: 10px;
}

.section-content :deep(.el-form-item__label) {
  font-size: 12px;
  color: #606266;
}

.section-content :deep(.el-input-number) {
  width: 100%;
}

.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #c0c4cc;
  font-size: 14px;
  gap: 12px;
}

.empty-tip .el-icon {
  font-size: 48px;
}
</style>