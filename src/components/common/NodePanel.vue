<template>
  <div class="node-panel" :class="{ collapsed: collapsed }">
    <div class="panel-header" @click="toggleCollapse">
      <span class="panel-title">
        <el-icon v-if="icon"><component :is="icon" /></el-icon>
        {{ title }}
      </span>
      <el-icon class="collapse-icon">
        <ArrowUp v-if="!collapsed" />
        <ArrowDown v-else />
      </el-icon>
    </div>
    <div v-show="!collapsed" class="panel-body">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'

withDefaults(
  defineProps<{
    title: string
    icon?: string
    defaultCollapsed?: boolean
  }>(),
  {
    defaultCollapsed: false
  }
)

const collapsed = ref(false)

const toggleCollapse = () => {
  collapsed.value = !collapsed.value
}
</script>

<style scoped>
.node-panel {
  margin-bottom: 4px;
  border-radius: 6px;
  background: #fff;
  overflow: hidden;
  transition: all 0.2s;
}

.node-panel.collapsed {
  margin-bottom: 2px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #303133;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
  user-select: none;
}

.panel-header:hover {
  background: #f5f7fa;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 6px;
}

.panel-title .el-icon {
  font-size: 16px;
}

.collapse-icon {
  font-size: 14px;
  color: #909399;
  transition: transform 0.2s;
}

.panel-body {
  padding: 6px 0;
}
</style>