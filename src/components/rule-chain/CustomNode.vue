<template>
  <div
    class="custom-node"
    :class="{ selected: selected }"
    :style="{ borderColor: nodeColor }"
  >
    <div class="node-icon" :style="{ color: nodeColor }">
      <el-icon><component :is="getIcon(type)" /></el-icon>
    </div>
    <div class="node-label">{{ data?.label || type }}</div>
    <div class="node-type">{{ type }}</div>
    <div class="node-handles">
      <!-- 输入端口（左侧） -->
      <div class="handle handle-left">
        <Handle type="target" :position="Position.Left" />
      </div>
      <!-- 输出端口（右侧） -->
      <div class="handle handle-right">
        <Handle type="source" :position="Position.Right" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import {
  Filter,
  Warning,
  Edit,
  Share,
  Link,
  Cpu,
  Monitor,
  Tickets,
  Clock,
  Switch,
  Message,
  Document,
  Collection,
  TrendCharts
} from '@element-plus/icons-vue'

// ===== 使用 VueFlow 的 NodeProps 类型 =====
const props = defineProps<NodeProps>()

// 节点颜色映射
const colorMap: Record<string, string> = {
  FILTER: '#409EFF',
  ACTION: '#E6A23C',
  TRANSFORM: '#67C23A',
  FLOW: '#F56C6C',
  EXTERNAL: '#909399',
  AI: '#9B59B6'
}

// 获取节点分类
const category = computed(() => {
  const type = props.data?.type || ''
  if (type.startsWith('FILTER')) return 'FILTER'
  if (type.startsWith('ACTION')) return 'ACTION'
  if (type.startsWith('TRANSFORM')) return 'TRANSFORM'
  if (type.startsWith('FLOW')) return 'FLOW'
  if (type.startsWith('EXTERNAL')) return 'EXTERNAL'
  if (type.startsWith('AI')) return 'AI'
  return 'FILTER'
})

const nodeColor = computed(() => colorMap[category.value] || '#409EFF')
const type = computed(() => props.data?.type || '')
const selected = computed(() => props.selected || false)

// 根据节点类型获取图标
const getIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    FILTER_THRESHOLD: Filter,
    FILTER_SCRIPT: Filter,
    FILTER_EXPRESSION: TrendCharts,
    FILTER_MSG_TYPE: Message,
    FILTER_MSG_TYPE_ROUTE: Share,
    FILTER_FIELD_CHECK: Document,
    ACTION_ALERT: Warning,
    ACTION_CLEAR_ALERT: Warning,
    ACTION_LOG: Tickets,
    ACTION_SAVE_ATTRIBUTE: Collection,
    ACTION_SAVE_TELEMETRY: TrendCharts,
    ACTION_DELAY: Clock,
    ACTION_SWITCH_DEVICE: Switch,
    ACTION_COMMAND: Monitor,
    TRANSFORM_CONDITIONAL: Edit,
    TRANSFORM_DELETE: Edit,
    TRANSFORM_RENAME: Edit,
    TRANSFORM_SCRIPT: Edit,
    TRANSFORM_TEMPLATE: Edit,
    FLOW_SUBCHAIN: Share,
    FLOW_RULE_NODE: Collection,
    EXTERNAL_HTTP: Link,
    EXTERNAL_DB: Document,
    EXTERNAL_DINGTALK: Message,
    EXTERNAL_WECHAT: Message,
    EXTERNAL_KAFKA: Link,
    EXTERNAL_NATS: Link,
    EXTERNAL_MQTT: Link,
    EXTERNAL_EMAIL: Message,
    EXTERNAL_SMS: Message,
    AI_LLM: Cpu,
    AI_KNOWLEDGE: Document,
    AI_MCP_TOOL: Monitor,
    AI_AGENT: Cpu
  }
  return iconMap[type] || Filter
}
</script>

<style scoped>
.custom-node {
  position: relative;
  padding: 4px 10px;
  width: 150px;
  border-radius: 4px;
  background: #fff;
  border: 2px solid #409EFF;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.custom-node:hover {
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.25);
  transform: translateY(-2px);
}

.custom-node.selected {
  border-color: #E6A23C;
  box-shadow: 0 0 0 3px rgba(230, 162, 60, 0.3);
}

.node-icon {
  font-size: 18px;
  line-height: 1.2;
}

.node-label {
  font-size: 12px;
  font-weight: 500;
  color: #303133;
  margin-top: 1px;
  white-space: nowrap;
}

.node-type {
  font-size: 10px;
  color: #909399;
  margin-top: 1px;
  white-space: nowrap;
}

/* 端口样式 */
.handle {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.handle-left {
  left: -6px;
}

.handle-right {
  right: -6px;
}

:deep(.vue-flow__handle) {
  width: 12px;
  height: 12px;
  background: #409EFF;
  border: 2px solid #fff;
  border-radius: 50%;
}

:deep(.vue-flow__handle:hover) {
  background: #E6A23C;
  transform: scale(1.2);
}
</style>