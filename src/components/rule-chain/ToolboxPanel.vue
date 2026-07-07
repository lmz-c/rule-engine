<template>
  <div class="toolbox-panel">
    <div class="toolbox-header">
      <span>📦 组件工具箱</span>
      <el-button
        size="small"
        text
        @click="emit('toggle')"
      >
        <el-icon><DArrowLeft v-if="open" /><DArrowRight v-else /></el-icon>
      </el-button>
    </div>

    <div v-show="open" class="toolbox-body">
      <el-collapse v-model="activeCategories" accordion>
        <el-collapse-item
          v-for="(nodes, category) in groupedNodes"
          :key="category"
          :name="category"
        >
          <template #title>
            <span class="category-title">
              <span class="category-dot" :style="{ background: getCategoryColor(category) }"></span>
              {{ getCategoryName(category) }}
              <span class="category-count">{{ nodes.length }}</span>
            </span>
          </template>
          <div
            v-for="node in nodes"
            :key="node.type"
            class="node-item"
            draggable="true"
            @dragstart="handleDragStart($event, node)"
            @dragend="handleDragEnd"
          >
            <span class="node-dot" :style="{ background: node.color || '#409EFF' }"></span>
            <span class="node-name">{{ node.name }}</span>
            <span class="node-badge">{{ node.type }}</span>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { DArrowLeft, DArrowRight } from '@element-plus/icons-vue'

const props = defineProps<{
  nodeTypes: any[]
  open?: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
  (e: 'drag-start', event: DragEvent, node: any): void
  (e: 'drag-end'): void
}>()

const activeCategories = ref('FILTER')

// 按分类分组
const groupedNodes = computed(() => {
  const groups: Record<string, any[]> = {}
  props.nodeTypes.forEach(node => {
    const category = node.category || 'OTHER'
    if (!groups[category]) groups[category] = []
    groups[category].push(node)
  })
  return groups
})

// 分类名称映射
const getCategoryName = (category: string) => {
  const map: Record<string, string> = {
    FILTER: '过滤组件',
    ACTION: '动作组件',
    TRANSFORM: '变换组件',
    FLOW: '流程组件',
    EXTERNAL: '外部组件',
    AI: 'AI组件'
  }
  return map[category] || category
}

// 分类颜色
const getCategoryColor = (category: string) => {
  const map: Record<string, string> = {
    FILTER: '#409EFF',
    ACTION: '#E6A23C',
    TRANSFORM: '#67C23A',
    FLOW: '#F56C6C',
    EXTERNAL: '#909399',
    AI: '#9B59B6'
  }
  return map[category] || '#409EFF'
}

// 拖拽事件
const handleDragStart = (event: DragEvent, node: any) => {
  event.dataTransfer?.setData('application/json', JSON.stringify(node))
  event.dataTransfer!.effectAllowed = 'move'
  emit('drag-start', event, node)
}

const handleDragEnd = () => {
  emit('drag-end')
}
</script>

<style scoped>
.toolbox-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-right: 1px solid #e4e7ed;
  overflow: hidden;
  flex-shrink: 0;
}

.toolbox-header {
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

.toolbox-body {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

:deep(.el-collapse) {
  border: none;
}

:deep(.el-collapse-item__header) {
  font-size: 13px;
  padding: 0 16px;
  height: 34px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-collapse-item__wrap) {
  border-bottom: none;
}

:deep(.el-collapse-item__content) {
  padding: 4px 8px;
}

.category-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.category-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.category-count {
  font-size: 11px;
  color: #c0c4cc;
  font-weight: 400;
}

.node-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  margin: 2px 0;
  cursor: grab;
  border-radius: 4px;
  font-size: 13px;
  transition: all 0.15s;
}

.node-item:hover {
  background: #ecf5ff;
}

.node-item:active {
  cursor: grabbing;
}

.node-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.node-name {
  flex: 1;
  font-size: 13px;
  color: #303133;
}

.node-badge {
  font-size: 10px;
  color: #c0c4cc;
  background: #f4f4f5;
  padding: 1px 6px;
  border-radius: 3px;
  font-family: monospace;
}
</style>