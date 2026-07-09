<template>
  <div class="editor-container">
    <!-- 左侧：节点工具箱 -->
    <div class="toolbox-panel" :style="{ width: toolboxWidth + 'px' }">
      <div class="toolbox-header">
        <span>📦 组件工具箱</span>
        <el-button size="small" text @click="toggleToolbox">
          <el-icon><DArrowLeft v-if="toolboxOpen" /><DArrowRight v-else /></el-icon>
        </el-button>
      </div>
      <div v-show="toolboxOpen" class="toolbox-body">
        <el-collapse v-model="activeCategories">
          <el-collapse-item
            v-for="(nodes, category) in groupedNodes"
            :key="category"
            :name="category"
            :title="getCategoryName(category)"
          >
            <div
              v-for="node in nodes"
              :key="node.type"
              class="node-item"
              draggable="true"
              @dragstart="onDragStart($event, node)"
              @dragend="onDragEnd"
            >
              <span class="node-dot" :style="{ background: node.color || '#409EFF' }"></span>
              <span class="node-name">{{ node.name }}</span>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>

    <!-- 中间：画布 -->
    <div class="canvas-wrapper">
      <!-- 顶部工具栏 -->
      <div class="canvas-toolbar">
        <el-button-group>
          <el-button size="small" type="primary" @click="handleSave">保存</el-button>
          <el-button size="small" @click="handleLoadExample">示例</el-button>
          <el-button size="small" @click="showRunDialog">运行</el-button>
          <el-button size="small" @click="handleClear">🗑️ 清空</el-button>
        </el-button-group>
        <div class="canvas-info">
          <span>节点: {{ nodeCount }}</span>
          <span>连线: {{ edgeCount }}</span>
        </div>
      </div>

      <!-- 画布 -->
      <div class="canvas-area" ref="canvasRef" >
        <VueFlow
          v-model:nodes="nodes"
          v-model:edges="edges"
          :node-types="nodeTypes"
          :default-viewport="{ zoom: 1, x: 0, y: 0 }"
          @node-click="onNodeClick"
          @edge-click="onEdgeClick"
          @connect="onConnect"
          @node-drag-stop="onNodeDragStop"
          @drop="onDrop" 
          @dragover="onDragOver"
          @init="onInit"
        >
          <Background pattern-color="#ddd" :gap="20" />
          <Controls position="bottom-right" />
        </VueFlow>
      </div>
    </div>
    <!-- 可拖动的分隔条（右侧面板宽度调节） -->
    <div class="resize-handle" @mousedown="startResize">
      <div class="resize-handle-inner"></div>
    </div>
    <!-- 右侧：属性面板 -->
    <div class="property-panel" :style="{ width: propertyWidth + 'px' }">
      <div class="property-header">
        <span>⚙️ 属性配置</span>
        <el-button size="small" text @click="toggleProperty">
          <el-icon><DArrowRight v-if="propertyOpen" /><DArrowLeft v-else /></el-icon>
        </el-button>
      </div>
      <div v-show="propertyOpen" class="property-body">
        <!-- 系统操作 -->
        <div class="property-section">
          <div class="section-title">系统操作</div>
          <div class="section-content">
            <el-button size="small" @click="handleZoomIn" style="width:100%;margin-bottom:4px">🔍 放大</el-button>
            <el-button size="small" @click="handleZoomOut" style="width:100%;margin-bottom:4px">🔍 缩小</el-button>
            <el-button size="small" @click="handleFitView" style="width:100%;margin-bottom:4px">📐 适应画布</el-button>
          </div>
        </div>

        <!-- 网格设置 -->
        <div class="property-section">
          <div class="section-title">网格设置</div>
          <div class="section-content">
            <el-form size="small">
              <el-form-item label="网格大小">
                <el-input-number v-model="gridSize" :min="10" :max="50" :step="5" />
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
                <el-input v-model="selectedNode.data.label" size="small" />
              </el-form-item>
              <el-form-item label="类型">
                <el-input :value="selectedNode.data.type" disabled size="small" />
              </el-form-item>
              <template v-for="(field, key) in configSchema" :key="key">
                <el-form-item :label="key">
                  <el-input
                    v-if="field.type === 'string'"
                    v-model="selectedNode.data.config[key]"
                    size="small"
                    :placeholder="field.placeholder"
                  />
                  <el-input-number
                    v-else-if="field.type === 'number'"
                    v-model="selectedNode.data.config[key]"
                    size="small"
                    :placeholder="field.placeholder"
                    controls-position="right"
                  />
                  <el-select
                    v-else-if="field.type === 'enum'"
                    v-model="selectedNode.data.config[key]"
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
                  <el-input
                    v-else-if="field.type === 'textarea'"
                    v-model="selectedNode.data.config[key]"
                    type="textarea"
                    :rows="3"
                    size="small"
                    :placeholder="field.placeholder"
                  />
                  <el-switch
                    v-else-if="field.type === 'boolean'"
                    v-model="selectedNode.data.config[key]"
                    size="small"
                  />
                </el-form-item>
              </template>
              <el-form-item>
                <el-button size="small" type="danger" @click="handleDeleteNode">删除节点</el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
        <div v-else class="empty-tip">点击画布上的节点进行配置</div>
      </div>
    </div>
    <!-- 运行对话框 -->
    <RunDialog
      v-show="runDialogVisible"
      v-model="runDialogVisible"
      :chain-id="currentChainId"
      @success="onRunSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DArrowLeft, DArrowRight } from '@element-plus/icons-vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { getNodeTypes, saveRuleChain, getRuleChain } from '@/api/ruleChain'
import CustomNode from '@/components/rule-chain/CustomNode.vue'
import { nextTick } from 'vue'
import RunDialog from '@/components/rule-chain/RunDialog.vue'
// import RunDialogManual from '@/components/rule-chain/RunDialogManual.vue'


const route = useRoute()
const router = useRouter()

// ===== 状态 =====
const toolboxOpen = ref(true)
const propertyOpen = ref(true)
const toolboxWidth = ref(240)
const propertyWidth = ref(320)
const gridSize = ref(20)
const allNodeTypes = ref<any[]>([])
const selectedNode = ref<any>(null)
const configSchema = ref<any>({})
const canvasRef = ref<HTMLElement | null>(null)
const chainId = route.params.chainId as string
const minWidth = 240
const maxWidth = 600
const isResizing = ref(false)
const runDialogVisible = ref(false)
const currentChainId = ref<string>('')

// ===== VueFlow =====
const { nodes, edges, addNodes, addEdges, getNodes, getEdges, updateNode, fitView, removeNodes, removeEdges ,screenToFlowCoordinate} = useVueFlow()
const nodeTypes = {
  'custom-node': CustomNode
}

const startResize = (e: MouseEvent) => {
  e.preventDefault()  
  isResizing.value = true
  document.body.style.cursor = 'col-resize'  
  document.body.style.userSelect = 'none'   
  
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
}

const onResize = (e: MouseEvent) => {
  if (!isResizing.value) return

  const containerRect = document.querySelector('.editor-container')?.getBoundingClientRect()
  if (!containerRect) return
  
  const newWidth = containerRect.right - e.clientX

  if (newWidth >= minWidth && newWidth <= maxWidth) {
    propertyWidth.value = newWidth
  }
}

const onInit = (instance: any) => {
  console.log(instance,223)

  console.log(instance.getNodes(),224)
}
const stopResize = () => {
  isResizing.value = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
  
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
}


onUnmounted(() => {
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
})

// ===== 计算属性 =====
const groupedNodes = computed(() => {
  const groups: Record<string, any[]> = {}
  allNodeTypes.value.forEach(node => {
    if (!groups[node.category]) groups[node.category] = []
    groups[node.category].push(node)
  })
  return groups
})

const activeCategories = ref([
  'FILTER',
  'ACTION',
  'TRANSFORM',
  'FLOW',
  'EXTERNAL',
  'AI'
])
const nodeCount = computed(() => getNodes.value.filter(n => n.type === 'custom-node').length)
const edgeCount = computed(() => getEdges.value.length)

// ===== 获取分类名称 =====
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

// ===== 加载数据 =====
onMounted(async () => {
  try {
    const res = await getNodeTypes()
    allNodeTypes.value = res.data
    if (chainId) {
      await loadChain(chainId)
    } else {
      loadExample()
    }
    await nextTick()
  } catch (e) {
    ElMessage.error('加载节点类型失败')
  }
})

// ===== 加载规则链 =====
const loadChain = async (id: string) => {
  try {
    const res = await getRuleChain(id)
    const data = res.data
    const config = JSON.parse(data.configJson)
    // 还原节点和连线
    const nodes = config.nodes.map((n: any) => ({
      id: n.id,
      type: 'custom-node',
      position: n.position || { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
      data: {
        label: n.label || n.type,
        type: n.type,
        config: n.config || {},
        configSchema: getNodeConfigSchema(n.type)
      }
    }))
    const edges = config.connections.map((c: any) => ({
      id: `e_${c.from}_${c.to}`,
      source: c.from,
      sourceHandle: c.label || 'Success',
      target: c.to
    }))
    addNodes(nodes)
    addEdges(edges)
  } catch (e) {
    ElMessage.error('加载规则链失败')
  }
}

// ===== 获取节点配置Schema =====
const getNodeConfigSchema = (type: string) => {
  const found = allNodeTypes.value.find(n => n.type === type)
  return found?.configSchema || {}
}

// ===== 拖拽 =====
const onDragStart = (event: DragEvent, node: any) => {
  event.dataTransfer?.setData('application/json', JSON.stringify(node))
  event.dataTransfer!.effectAllowed = 'move'
}

const onDragEnd = () => {}

const onDrop = (event: DragEvent) => {

  event.preventDefault()

  const raw = event.dataTransfer?.getData('application/json')

  if (!raw) return

  const nodeData = JSON.parse(raw)

  // 浏览器坐标 -> Flow坐标
  const position = screenToFlowCoordinate({
    x: event.clientX,
    y: event.clientY
  })
    console.log({
      clientX:event.clientX,
      clientY:event.clientY,
      position,
  })

  const newNode = {
    id: `node_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: 'custom-node',

    position,

    data: {
      label: nodeData.name,
      type: nodeData.type,
      config: {},
      configSchema: nodeData.configSchema
    }
  }

  addNodes([newNode])
}

const onDragOver = (event: DragEvent) => {
  event.preventDefault()

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}
// ===== 节点点击 =====
const onNodeClick = (event: any) => {
  const node = event.node
  selectedNode.value = node
  configSchema.value = node.data.configSchema || {}
}

// ===== 连线 =====
const onConnect = (connection: any) => {
  console.log('connect', connection)
  const edge = {
    id: `e_${Date.now()}`,

    source: connection.source,
    target: connection.target,

    sourceHandle: connection.sourceHandle,
    targetHandle: connection.targetHandle,

    type: 'default',

    label: 'Success',

    data: {
      relation: 'Success'
    }
  }

  addEdges([edge])
  console.log('当前所有边', getEdges.value)
  console.log(getNodes.value)
  console.log(
    JSON.stringify(getEdges.value, null, 2)
  )
  console.log(
    JSON.stringify(getNodes.value[0], null, 2)
  )
}

const onEdgeClick = (event: any) => {
  // 可以在这里实现删除连线的功能
}

const onNodeDragStop = (event: any) => {}

// ===== 保存 =====
const handleSave = async () => {
  try {
    const nodes = getNodes.value
      .filter(n => n.type === 'custom-node')
      .map((n: any) => ({
        id: n.id,
        type: n.data.type,
        config: n.data.config || {},
        label: n.data.label,
        position: n.position
      }))

    const connections = getEdges.value.map((e: any) => ({
      from: e.source,
      label: e.sourceHandle || 'Success',
      to: e.target
    }))

    const data = {
      name: '规则链_' + new Date().toLocaleString(),
      status: 1,
      configJson: JSON.stringify({ nodes, connections })
    }

    const res = await saveRuleChain(data)
    localStorage.setItem('lastSavedRuleChain', res.data)
    ElMessage.success('保存成功')
    return res.data
  } catch (e) {
    ElMessage.error('保存失败')
    return null
  }
}

// ===== 示例数据 输入节点=====
const loadExample = () => {
  const nodes = [
    {
      id: 'input_1',
      type: 'custom-node',
      position: { x: 200, y: 200 },
      data: {
        label: '输入',
        type: 'INPUT',
        config: {
          source: 'MQTT'
        },
        configSchema: {}   // 无配置表单
      }
    }
  ]
  addNodes(nodes)
}

const handleLoadExample = loadExample

// ===== 清空 =====
const handleClear = async () => {
  try {
    await ElMessageBox.confirm('确定要清空画布吗？', '提示', { type: 'warning' })
    const currentNodes = getNodes.value
    // 保留输入节点
    const inputNode = currentNodes.find(n => n.data?.type === 'INPUT')
    const nodesToRemove = currentNodes.filter(n => n !== inputNode)
    nodesToRemove.forEach(n => removeNodes([n.id]))
    edges.value = []
    selectedNode.value = null
    ElMessage.success('已清空')
  } catch {}
}
// 执行代码
const handleExecute = () =>{}
// ===== 视图控制 =====
const handleZoomIn = () => {
  const zoom = fitView() // 简化为适应视图
}

const handleZoomOut = () => {
  const zoom = fitView()
}

const handleFitView = () => {
  fitView()
}

// ===== 删除节点 =====
const handleDeleteNode = async () => {
  if (!selectedNode.value) return
  try {
    await ElMessageBox.confirm('确定要删除此节点吗？', '提示', { type: 'warning' })
    removeNodes([selectedNode.value.id])
    selectedNode.value = null
    configSchema.value = {}
    ElMessage.success('已删除')
  } catch {}
}

// ===== 切换面板 =====
const toggleToolbox = () => {
  toolboxOpen.value = !toolboxOpen.value
  toolboxWidth.value = toolboxOpen.value ? 240 : 0
}

const toggleProperty = () => {
  propertyOpen.value = !propertyOpen.value
  propertyWidth.value = propertyOpen.value ? 320 : 0
}

// ===== 显示运行对话框 =====
const showRunDialog = async () => {
  if (getNodes.value.filter(n => n.type === 'custom-node').length === 0) {
    ElMessage.warning('画布为空，请先添加节点')
    return
  }
  
  try {
    console.log('Opening dialog...')
    
    if (localStorage.getItem('lastSavedRuleChain')) {
      currentChainId.value = localStorage.getItem('lastSavedRuleChain') as string
      console.log('Chain ID set:', currentChainId.value)
      // 直接设置，不需要 nextTick
      runDialogVisible.value = true
      console.log('Dialog visibility set to true')
      return
    }
    
    const res = await handleSave()
    if (res) {
      currentChainId.value = res
      runDialogVisible.value = true
    }
  } catch (e) {
    console.error('Error in showRunDialog:', e)
    ElMessage.error('保存失败，请检查规则链配置')
  }
}


// 运行成功回调
const onRunSuccess = () => {
  ElMessage.success('规则链执行成功，请查看响应体')
}
</script>

<style scoped>
.editor-container {
  display: flex;
  height: 100%;
  background: #f0f2f5;
}

/* ===== 工具箱 ===== */
.toolbox-panel {
  background: #fff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  overflow: hidden;
  flex-shrink: 0;
  height: 100%;
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
}

.toolbox-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

:deep(.el-collapse) {
  border: none;
}

:deep(.el-collapse-item__header) {
  font-size: 13px;
  padding: 0 16px;
  height: 32px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-collapse-item__wrap) {
  border-bottom: none;
}

:deep(.el-collapse-item__content) {
  padding: 4px 8px;
}

.node-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  margin: 2px 0;
  cursor: grab;
  border-radius: 4px;
  font-size: 13px;
  transition: background 0.2s;
}

.node-item:hover {
  background: #ecf5ff;
}

.node-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ===== 画布 ===== */
.canvas-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.canvas-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.canvas-info {
  font-size: 13px;
  color: #909399;
}

.canvas-info span {
  margin-left: 16px;
}

.canvas-area {
  flex:1;
  position:relative;
  overflow:hidden;
  background: #f7f8fa;
  position: relative;
}

.canvas-area :deep(.vue-flow) {
  width: 100%;
  height: 100%;
}

/* ===== 属性面板 ===== */
.property-panel {
  background: #fff;
  border-left: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  overflow: hidden;
  flex-shrink: 0;
  height: 100%;
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
}

.property-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
}

.property-section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 8px;
}

.section-content {
  padding: 4px 0;
}

.section-content :deep(.el-form-item) {
  margin-bottom: 8px;
}

.section-content :deep(.el-form-item__label) {
  font-size: 12px;
}

.empty-tip {
  color: #c0c4cc;
  text-align: center;
  padding: 40px 0;
  font-size: 14px;
}
/* ===== 可拖动分隔条 ===== */
.resize-handle {
  position: relative;
  width: 0;                     
  padding: 0 4px;              
  cursor: col-resize;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  transition: background 0.15s;
  z-index: 10;
  
  &:hover {
    background: rgba(64, 158, 255, 0.1);
    
    .resize-handle-inner {
      background: #409EFF;
      width: 2px;               
    }
  }
}

.resize-handle-inner {
  width: 1px;                  
  height: 60px;                
  border-radius: 2px;
  background: #d9d9d9;
  transition: all 0.2s;
}
</style>