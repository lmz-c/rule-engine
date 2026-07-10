<template>
  <div class="device-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>设备管理</h2>
        <el-tag size="small" type="info">共 {{ total }} 台设备</el-tag>
      </div>
      <div class="header-right">
        <el-button @click="loadData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          注册设备
        </el-button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索设备ID/名称..."
        clearable
        style="width: 220px"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select
        v-model="searchStatus"
        placeholder="设备状态"
        clearable
        style="width: 120px"
      >
        <el-option label="在线" :value="1" />
        <el-option label="离线" :value="0" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon total"><el-icon><Monitor /></el-icon></div>
          <div>
            <div class="stat-value">{{ total }}</div>
            <div class="stat-label">总设备</div>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon online"><el-icon><CircleCheck /></el-icon></div>
          <div>
            <div class="stat-value">{{ onlineCount }}</div>
            <div class="stat-label">在线</div>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon offline"><el-icon><CircleClose /></el-icon></div>
          <div>
            <div class="stat-value">{{ offlineCount }}</div>
            <div class="stat-label">离线</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 表格 -->
    <el-table
      :data="deviceList"
      border
      stripe
      v-loading="loading"
      style="width: 100%"
    >
      <el-table-column prop="deviceId" label="设备ID" width="150" />
      <el-table-column prop="deviceName" label="设备名称" min-width="120" />
      <el-table-column prop="productKey" label="产品" width="120" />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? '在线' : '离线' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="位置" width="180">
        <template #default="{ row }">
          <span v-if="row.latitude && row.longitude">
            {{ row.latitude }}, {{ row.longitude }}
          </span>
          <span v-else style="color:#c0c4cc;">未设置</span>
        </template>
      </el-table-column>
      <el-table-column prop="lastOnlineTime" label="最后上线" width="180">
        <template #default="{ row }">
          {{ row.lastOnlineTime ? formatTime(row.lastOnlineTime) : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <el-button size="small" text @click="handleDetail(row)">详情</el-button>
          <el-button size="small" text type="primary" @click="handleBind(row)">绑定规则</el-button>
          <el-button size="small" text type="danger" @click="handleDelete(row)">删除</el-button>
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

    <!-- 注册设备对话框 -->
    <el-dialog v-model="dialogVisible" title="注册设备" width="500px">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="设备ID" prop="deviceId">
          <el-input v-model="formData.deviceId" placeholder="请输入设备ID" />
        </el-form-item>
        <el-form-item label="设备名称" prop="deviceName">
          <el-input v-model="formData.deviceName" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="产品" prop="productKey">
          <el-select v-model="formData.productKey" placeholder="请选择产品" style="width:100%">
            <el-option label="温度传感器" value="TEMP_SENSOR" />
            <el-option label="湿度传感器" value="HUMID_SENSOR" />
            <el-option label="边缘网关" value="GATEWAY" />
          </el-select>
        </el-form-item>
        <el-form-item label="位置">
          <div style="display:flex;gap:8px;">
            <el-input v-model="formData.latitude" placeholder="纬度" style="flex:1" />
            <el-input v-model="formData.longitude" placeholder="经度" style="flex:1" />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitRegister">注册</el-button>
      </template>
    </el-dialog>

    <!-- 设备详情对话框 -->
    <el-dialog v-model="detailVisible" title="设备详情" width="500px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="设备ID">{{ detailData?.deviceId }}</el-descriptions-item>
        <el-descriptions-item label="设备名称">{{ detailData?.deviceName }}</el-descriptions-item>
        <el-descriptions-item label="产品">{{ detailData?.productKey }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="detailData?.status === 1 ? 'success' : 'info'" size="small">
            {{ detailData?.status === 1 ? '在线' : '离线' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="位置">
          {{ detailData?.latitude && detailData?.longitude ? `${detailData.latitude}, ${detailData.longitude}` : '未设置' }}
        </el-descriptions-item>
        <el-descriptions-item label="最后上线">
          {{ detailData?.lastOnlineTime ? formatTime(detailData.lastOnlineTime) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="注册时间">
          {{ detailData?.createTime ? formatTime(detailData.createTime) : '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Plus, Search, Monitor, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import { getDeviceList, registerDevice, deleteDevice, getDeviceDetail ,getDevice} from '@/api/device'
import dayjs from 'dayjs'

const router = useRouter()

// ===== 状态 =====
const loading = ref(false)
const deviceList = ref<any[]>([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const searchKeyword = ref('')
const searchStatus = ref<number | undefined>(undefined)
const dialogVisible = ref(false)
const detailVisible = ref(false)
const submitting = ref(false)
const detailData = ref<any>(null)
const formRef = ref()

// ===== 计算统计 =====
const onlineCount = computed(() => {
  return deviceList.value.filter(d => d.status === 1).length
})

const offlineCount = computed(() => {
  return deviceList.value.filter(d => d.status === 0).length
})

// ===== 表单数据 =====
const formData = reactive({
  deviceId: '',
  deviceName: '',
  productKey: '',
  latitude: '',
  longitude: ''
})

const formRules = {
  deviceId: [{ required: true, message: '请输入设备ID', trigger: 'blur' }],
  deviceName: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  productKey: [{ required: true, message: '请选择产品', trigger: 'change' }]
}

// ===== 加载数据 =====
const loadData = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (searchKeyword.value) {
      params.deviceId = searchKeyword.value
    }
    if (searchStatus.value !== undefined) {
      params.status = searchStatus.value
    }
    const res = await getDevice(params)
    deviceList.value = res.data || []
    total.value = deviceList.value.length
  } catch (e) {
    ElMessage.error('加载设备列表失败')
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
  searchKeyword.value = ''
  searchStatus.value = undefined
  handleSearch()
}

// ===== 注册设备 =====
const handleAdd = () => {
  // 重置表单
  formData.deviceId = ''
  formData.deviceName = ''
  formData.productKey = ''
  formData.latitude = ''
  formData.longitude = ''
  dialogVisible.value = true
}

const submitRegister = async () => {
  await formRef.value?.validate()
  submitting.value = true
  try {
    const data: any = {
      deviceId: formData.deviceId,
      deviceName: formData.deviceName,
      productKey: formData.productKey
    }
    if (formData.latitude && formData.longitude) {
      data.latitude = parseFloat(formData.latitude)
      data.longitude = parseFloat(formData.longitude)
    }
    await registerDevice(data)
    ElMessage.success('设备注册成功')
    dialogVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error('注册失败')
  } finally {
    submitting.value = false
  }
}

// ===== 设备详情 =====
const handleDetail = async (row: any) => {
  try {
    const res = await getDeviceDetail(row.deviceId)
    detailData.value = res.data
    detailVisible.value = true
  } catch (e) {
    ElMessage.error('获取设备详情失败')
  }
}

// ===== 绑定规则 =====
const handleBind = (row: any) => {
  // 跳转到规则链编辑器，并传递设备ID
  router.push(`/rule-chain/editor?deviceId=${row.deviceId}`)
}

// ===== 删除设备 =====
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除设备「${row.deviceName}」吗？此操作不可恢复！`,
      '警告',
      { type: 'error' }
    )
    await deleteDevice(row.deviceId)
    ElMessage.success('删除成功')
    loadData()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// ===== 格式化时间 =====
const formatTime = (time: string) => {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
}

// ===== 初始化 =====
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.device-page {
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

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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

.stat-icon.total {
  background: #ecf5ff;
  color: #409eff;
}

.stat-icon.online {
  background: #f0f9eb;
  color: #67c23a;
}

.stat-icon.offline {
  background: #fef0f0;
  color: #f56c6c;
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

.pagination-wrapper {
  padding: 16px 20px;
  background: #fff;
  border-radius: 8px;
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

:deep(.el-table) {
  flex: 1;
}
</style>