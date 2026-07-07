<template>
  <div class="toolbox-panel">
    <div class="toolbox-header">
      <span>📦 组件工具箱</span>

      <el-button
        text
        size="small"
        @click="emit('toggle')"
      >
        <el-icon>
          <DArrowLeft v-if="open" />
          <DArrowRight v-else />
        </el-icon>
      </el-button>
    </div>

    <div
      v-show="open"
      class="toolbox-body"
    >
      <div
        v-for="(nodes, category) in groupedNodes"
        :key="category"
        class="category"
      >
        <!-- 分类标题 -->
        <div
          class="category-header"
          @click="toggleCategory(category)"
        >
          <div class="header-left">
            <span
              class="category-dot"
              :style="{ background: getCategoryColor(category) }"
            />

            <span class="category-name">
              {{ getCategoryName(category) }}
            </span>

            <span class="category-count">
              {{ nodes.length }}
            </span>
          </div>

          <el-icon
            class="arrow"
            :class="{ open: expandMap[category] }"
          >
            <ArrowRight />
          </el-icon>
        </div>

        <!-- 分类内容 -->
        <transition name="expand">
          <div
            v-show="expandMap[category]"
            class="category-content"
          >
            <div
              v-for="node in nodes"
              :key="node.type"
              class="node-item"
              draggable="true"
              @dragstart="handleDragStart($event, node)"
              @dragend="handleDragEnd"
            >
              <span
                class="node-dot"
                :style="{ background: node.color }"
              />

              <div class="node-info">
                <div class="node-name">
                  {{ node.name }}
                </div>

                <div class="node-type">
                  {{ node.type }}
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from "vue";
import {
  ArrowRight,
  DArrowLeft,
  DArrowRight
} from "@element-plus/icons-vue";

const props = defineProps<{
  nodeTypes: any[];
  open?: boolean;
}>();

const emit = defineEmits<{
  (e: "toggle"): void;
  (e: "drag-start", event: DragEvent, node: any): void;
  (e: "drag-end"): void;
}>();

const groupedNodes = computed(() => {
  const map: Record<string, any[]> = {};

  props.nodeTypes.forEach((n) => {
    const key = n.category || "OTHER";

    if (!map[key]) map[key] = [];

    map[key].push(n);
  });

  return map;
});

const expandMap = reactive<Record<string, boolean>>({
  FILTER: true,
  ACTION: true,
  TRANSFORM: true,
  FLOW: true,
  EXTERNAL: true,
  AI: true
});

const toggleCategory = (category: string) => {
  expandMap[category] = !expandMap[category];
};

const getCategoryName = (category: string) => {
  const map: Record<string, string> = {
    FILTER: "过滤组件",
    ACTION: "动作组件",
    TRANSFORM: "转换组件",
    FLOW: "流程组件",
    EXTERNAL: "外部组件",
    AI: "AI组件"
  };

  return map[category] || category;
};

const getCategoryColor = (category: string) => {
  const map: Record<string, string> = {
    FILTER: "#409EFF",
    ACTION: "#E6A23C",
    TRANSFORM: "#67C23A",
    FLOW: "#F56C6C",
    EXTERNAL: "#909399",
    AI: "#9B59B6"
  };

  return map[category] || "#409EFF";
};

const handleDragStart = (event: DragEvent, node: any) => {
  if (!event.dataTransfer) return;

  event.dataTransfer.effectAllowed = "copy";

  event.dataTransfer.setData(
    "application/json",
    JSON.stringify(node)
  );

  emit("drag-start", event, node);
};

const handleDragEnd = () => {
  emit("drag-end");
};
</script>

<style scoped>
.toolbox-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-right: 1px solid #ebeef5;
}

.toolbox-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 54px;
  padding: 0 14px;
  font-weight: 600;
  border-bottom: 1px solid #ebeef5;
}

.toolbox-body {
  flex: 1;
  overflow-y: auto;
}

.category {
  border-bottom: 1px solid #f3f3f3;
}

.category-header {
  height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 0 14px;
  transition: .2s;
}

.category-header:hover {
  background: #f8f9fb;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.category-name {
  font-size: 13px;
  font-weight: 600;
}

.category-count {
  color: #999;
  font-size: 11px;
}

.arrow {
  transition: .2s;
}

.arrow.open {
  transform: rotate(90deg);
}

.category-content {
  padding: 6px;
}

.node-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  margin-bottom: 4px;
  border-radius: 6px;
  cursor: grab;
  transition: .2s;
}

.node-item:hover {
  background: #eef5ff;
}

.node-item:active {
  cursor: grabbing;
}

.node-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.node-info {
  display: flex;
  flex-direction: column;
}

.node-name {
  font-size: 13px;
  color: #303133;
}

.node-type {
  font-size: 11px;
  color: #999;
  font-family: monospace;
}

.expand-enter-active,
.expand-leave-active {
  transition: all .2s;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>