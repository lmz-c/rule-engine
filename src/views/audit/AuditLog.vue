<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>审计日志</h2>
        <el-tag size="small" type="info">共 {{ total }} 条记录</el-tag>
      </div>
      <div class="header-right">
        <el-button @click="loadData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button type="primary" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchForm.deviceId"
        placeholder="设备ID"
        clearable
        style="width: 150px"
      />
      <el-input
        v-model="searchForm.chainId"
        placeholder="规则链ID"
        clearable
        style="width: 180px"
      />
      <el-select
        v-model="searchForm.status"
        placeholder="执行状态"
        clearable
        style="width: 130px"
      >
        <el-option label="成功" value="SUCCESS" />
        <el-option label="失败" value="FAILED" />
      </el-select>
      <el-date-picker
        v-model="dateRange"
        type="datetimerange"
        range-separator="至"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
        style="width: 340px"
        value-format="YYYY-MM-DD HH:mm:ss"
      />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <!-- 表格 -->
    <el-table
      :data="tableData"
      border
      stripe
      v-loading="loading"
      style="width: 100%"
    >
      <el-table-column prop="traceId" label="链路ID" width="240">
        <template #default="{ row }">
          <el-link type="primary" @click="handleViewTrace(row)">
            {{ row.traceId }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column prop="chainId" label="规则链ID" width="160" />
      <el-table-column prop="nodeId" label="节点ID" width="120" />
      <el-table-column prop="nodeType" label="节点类型" width="140" />
      <el-table-column prop="deviceId" label="设备ID" width="140" />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'SUCCESS' ? 'success' : 'danger'" size="small">
            {{ row.status === 'SUCCESS' ? '成功' : '失败' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="costTime" label="耗时(ms)" width="100" align="center">
        <template #default="{ row }">
          <span :style="{ color: row.costTime > 500 ? '#f56c6c' : '#67c23a' }">
            {{ row.costTime || 0 }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="执行时间" width="180">
        <template #default="{ row }">
          {{ formatTime(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button size="small" text @click="handleViewDetail(row)">
            详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
      />
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="执行详情" width="700px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="链路ID">{{ detailData?.traceId }}</el-descriptions-item>
        <el-descriptions-item label="规则链ID">{{ detailData?.chainId }}</el-descriptions-item>
        <el-descriptions-item label="节点ID">{{ detailData?.nodeId }}</el-descriptions-item>
        <el-descriptions-item label="节点类型">{{ detailData?.nodeType }}</el-descriptions-item>
        <el-descriptions-item label="设备ID">{{ detailData?.deviceId }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="detailData?.status === 'SUCCESS' ? 'success' : 'danger'" size="small">
            {{ detailData?.status === 'SUCCESS' ? '成功' : '失败' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="耗时">{{ detailData?.costTime }}ms</el-descriptions-item>
        <el-descriptions-item label="执行时间">{{ formatTime(detailData?.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="输入数据">
          <el-input
            :model-value="formatJson(detailData?.inputData)"
            type="textarea"
            :rows="4"
            readonly
          />
        </el-descriptions-item>
        <el-descriptions-item v-if="detailData?.outputData" label="输出数据">
          <el-input
            :model-value="formatJson(detailData?.outputData)"
            type="textarea"
            :rows="3"
            readonly
          />
        </el-descriptions-item>
        <el-descriptions-item v-if="detailData?.errorMsg" label="错误信息">
          <el-alert :title="detailData.errorMsg" type="error" :closable="false" />
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 链路追踪弹窗 -->
    <el-dialog v-model="traceVisible" title="链路追踪" width="800px">
      <el-timeline>
        <el-timeline-item
          v-for="(item, index) in traceData"
          :key="index"
          :type="item.status === 'SUCCESS' ? 'success' : 'danger'"
          :timestamp="formatTime(item.createTime)"
          placement="top"
        >
          <el-card>
            <div>
              <el-tag :type="item.status === 'SUCCESS' ? 'success' : 'danger'" size="small">
                {{ item.nodeType }}
              </el-tag>
              <span style="margin-left: 8px; font-weight: 500;">{{ item.nodeId }}</span>
              <span style="margin-left: 8px; color: #909399; font-size: 12px;">
                耗时: {{ item.costTime }}ms
              </span>
            </div>
            <div style="margin-top: 8px; font-size: 13px; color: #606266;">
              输入: {{ truncateJson(item.inputData) }}
            </div>
            <div v-if="item.outputData" style="font-size: 13px; color: #606266;">
              输出: {{ truncateJson(item.outputData) }}
            </div>
            <div v-if="item.errorMsg" style="color: #f56c6c; font-size: 13px;">
              错误: {{ item.errorMsg }}
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Download } from '@element-plus/icons-vue'
import { getAuditLogs, getAuditTrace } from '@/api/audit'
import dayjs from 'dayjs'

// ===== 状态 =====
const loading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const detailVisible = ref(false)
const detailData = ref<any>(null)
const traceVisible = ref(false)
const traceData = ref<any[]>([])
const dateRange = ref<any[]>([])

const searchForm = reactive({
  deviceId: '',
  chainId: '',
  status: ''
})

// ===== 加载数据 =====
const loadData = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pageNum.value,
      size: pageSize.value,
      ...searchForm
    }
    if (dateRange.value && dateRange.value.length === 2) {
      params.startTime = dateRange.value[0]
      params.endTime = dateRange.value[1]
    }
    const res = await getAuditLogs(params)
    tableData.value = res.data || []
    total.value = res.data.length || 0
    console.log(res, tableData.value, total.value);
    
    
  } catch (e) {
    ElMessage.error('加载审计日志失败')
  } finally {
    loading.value = false
  }
}

// ===== 搜索 =====
const handleSearch = () => {
  pageNum.value = 1
  loadData()
}

const resetSearch = () => {
  searchForm.deviceId = ''
  searchForm.chainId = ''
  searchForm.status = ''
  dateRange.value = []
  handleSearch()
}

// ===== 查看详情 =====
const handleViewDetail = (row: any) => {
  detailData.value = row
  detailVisible.value = true
}

// ===== 查看链路追踪 =====
const handleViewTrace = async (row: any) => {
  try {
    const res = await getAuditTrace(row.traceId)
    traceData.value = res.data || []
    traceVisible.value = true
  } catch (e) {
    ElMessage.error('获取链路追踪失败')
  }
}

// ===== 导出 =====
const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

// ===== 工具函数 =====
const formatTime = (time: string) => {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
}

const formatJson = (str: string) => {
  try {
    return JSON.stringify(JSON.parse(str), null, 2)
  } catch {
    return str || '-'
  }
}

const truncateJson = (str: string) => {
  try {
    const obj = JSON.parse(str)
    const text = JSON.stringify(obj)
    return text.length > 100 ? text.substring(0, 100) + '...' : text
  } catch {
    return str || '-'
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
  overflow: hidden;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 8px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h2 {
  margin: 0;
  font-size: 18px;
}

.header-right {
  display: flex;
  gap: 10px;
}

.search-bar {
  display: flex;
  gap: 10px;
  padding: 12px 20px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 16px;
  align-items: center;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.pagination-wrapper {
  padding: 16px 20px;
  background: #fff;
  border-radius: 8px;
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

.el-table {
  flex: 1;
}

:deep(.el-timeline-item__wrapper) {
  padding-left: 28px;
}

:deep(.el-timeline-item__content) {
  padding: 0 4px;
}
</style>