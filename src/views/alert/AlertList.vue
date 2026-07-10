<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>告警管理</h2>
        <el-tag size="small" type="danger">待处理: {{ pendingCount }}</el-tag>
      </div>
      <div class="header-right">
        <el-button @click="loadData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon danger"><el-icon><WarningFilled /></el-icon></div>
          <div>
            <div class="stat-value">{{ statistics.critical || 0 }}</div>
            <div class="stat-label">严重告警</div>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon warning"><el-icon><Warning /></el-icon></div>
          <div>
            <div class="stat-value">{{ statistics.warning || 0 }}</div>
            <div class="stat-label">警告</div>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon info"><el-icon><InfoFilled /></el-icon></div>
          <div>
            <div class="stat-value">{{ statistics.info || 0 }}</div>
            <div class="stat-label">提示</div>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon success"><el-icon><CircleCheck /></el-icon></div>
          <div>
            <div class="stat-value">{{ statistics.cleared || 0 }}</div>
            <div class="stat-label">已清除</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchForm.deviceId"
        placeholder="设备ID"
        clearable
        style="width: 160px"
      />
      <el-select
        v-model="searchForm.severity"
        placeholder="告警级别"
        clearable
        style="width: 140px"
      >
        <el-option label="严重" value="CRITICAL" />
        <el-option label="警告" value="WARNING" />
        <el-option label="提示" value="INFO" />
      </el-select>
      <el-select
        v-model="searchForm.status"
        placeholder="状态"
        clearable
        style="width: 140px"
      >
        <el-option label="待处理" value="PENDING" />
        <el-option label="已清除" value="CLEARED" />
        <el-option label="已忽略" value="IGNORED" />
      </el-select>
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
      <el-table-column prop="alertId" label="告警ID" width="160" />
      <el-table-column prop="deviceId" label="设备ID" width="140" />
      <el-table-column prop="severity" label="级别" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getSeverityType(row.severity)" size="small">
            {{ getSeverityLabel(row.severity) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="content" label="告警内容" min-width="200" />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'PENDING' ? 'danger' : 'success'" size="small">
            {{ row.status === 'PENDING' ? '待处理' : '已清除' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="发生时间" width="180">
        <template #default="{ row }">
          {{ formatTime(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="row.status === 'PENDING'"
            size="small"
            type="success"
            text
            @click="handleClear(row)"
          >
            清除
          </el-button>
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
    <el-dialog v-model="detailVisible" title="告警详情" width="500px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="告警ID">{{ detailData?.alertId }}</el-descriptions-item>
        <el-descriptions-item label="设备ID">{{ detailData?.deviceId }}</el-descriptions-item>
        <el-descriptions-item label="级别">
          <el-tag :type="getSeverityType(detailData?.severity)" size="small">
            {{ getSeverityLabel(detailData?.severity) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="detailData?.status === 'PENDING' ? 'danger' : 'success'" size="small">
            {{ detailData?.status === 'PENDING' ? '待处理' : '已清除' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="告警内容">{{ detailData?.content }}</el-descriptions-item>
        <el-descriptions-item label="发生时间">{{ formatTime(detailData?.createTime) }}</el-descriptions-item>
        <el-descriptions-item v-if="detailData?.clearTime" label="清除时间">
          {{ formatTime(detailData?.clearTime) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, WarningFilled, Warning, InfoFilled, CircleCheck } from '@element-plus/icons-vue'
import { getAlertList, clearAlert, getAlertStatistics, getAlertByDevice } from '@/api/alert'
import dayjs from 'dayjs'

// ===== 状态 =====
const loading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)
const pendingCount = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const detailVisible = ref(false)
const detailData = ref<any>(null)

const searchForm = reactive({
  deviceId: '',
  severity: '',
  status: ''
})

const statistics = ref({
  critical: 0,
  warning: 0,
  info: 0,
  cleared: 0
})

// ===== 加载数据 =====
const loadData = async () => {
  loading.value = true
  try {
    let res
    // 如果输入了设备ID，调用按设备查询接口
    if (searchForm.deviceId) {
      res = await getAlertByDevice(searchForm.deviceId)
      tableData.value = res.data || []
      total.value = tableData.value.length
      
    } else {
      const params = {
        page: pageNum.value,
        size: pageSize.value,
        ...searchForm
      }
      res = await getAlertList(params)
      tableData.value = res.data || []
      total.value = res.data.length || 0
    }

    // 统计待处理数量
    pendingCount.value = tableData.value.filter((item: any) => item.status === 'PENDING').length

    // 加载统计
    loadStatistics()
  } catch (e) {
    ElMessage.error('加载告警列表失败')
  } finally {
    loading.value = false
  }
}

const loadStatistics = async () => {
  try {
    const res = await getAlertStatistics()
    statistics.value = res.data || {}
  } catch (e) {
    // 忽略统计加载失败
  }
}

// ===== 搜索 =====
const handleSearch = () => {
  pageNum.value = 1
  loadData()
}

const resetSearch = () => {
  searchForm.deviceId = ''
  searchForm.severity = ''
  searchForm.status = ''
  handleSearch()
}

// ===== 清除告警 =====
const handleClear = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要清除告警「${row.alertId}」吗？`, '提示', {
      type: 'info'
    })
    await clearAlert(row.alertId)
    ElMessage.success('告警已清除')
    loadData()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('清除失败')
    }
  }
}

// ===== 查看详情 =====
const handleViewDetail = (row: any) => {
  detailData.value = row
  detailVisible.value = true
}

// ===== 工具函数 =====
const getSeverityType = (severity: string) => {
  const map: Record<string, string> = {
    CRITICAL: 'danger',
    WARNING: 'warning',
    INFO: 'info'
  }
  return map[severity] || 'info'
}

const getSeverityLabel = (severity: string) => {
  const map: Record<string, string> = {
    CRITICAL: '严重',
    WARNING: '警告',
    INFO: '提示'
  }
  return map[severity] || severity
}

const formatTime = (time: string) => {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
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

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.stat-card {
  border-radius: 8px;
}

.stat-card :deep(.el-card__body) {
  padding: 16px 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.stat-icon.danger {
  background: #fef0f0;
  color: #f56c6c;
}

.stat-icon.warning {
  background: #fdf6ec;
  color: #e6a23c;
}

.stat-icon.info {
  background: #ecf5ff;
  color: #409eff;
}

.stat-icon.success {
  background: #f0f9eb;
  color: #67c23a;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #909399;
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
</style>