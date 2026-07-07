<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>规则引擎</h2>
        <el-tag size="small" type="info">共 {{ total }} 条规则链</el-tag>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新建规则链
        </el-button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索规则链名称..."
        clearable
        style="width: 240px"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
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
      <el-table-column prop="name" label="规则链名称" min-width="150">
        <template #default="{ row }">
          <el-link type="primary" @click="handleEdit(row)">
            {{ row.name }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column prop="chainId" label="规则链ID" width="180" />
      <el-table-column prop="description" label="描述" min-width="120">
        <template #default="{ row }">
          {{ row.description || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? '已启用' : '已停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="version" label="版本" width="80" align="center" />
      <el-table-column prop="updateTime" label="更新时间" width="180">
        <template #default="{ row }">
          {{ formatTime(row.updateTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <el-button size="small" text @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button
            size="small"
            text
            :type="row.status === 1 ? 'warning' : 'success'"
            @click="handleToggleStatus(row)"
          >
            {{ row.status === 1 ? '停用' : '启用' }}
          </el-button>
          <el-button
            size="small"
            text
            type="danger"
            @click="handleDelete(row)"
          >
            删除
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { getRuleChainList, deleteRuleChain, updateChainStatus } from '@/api/ruleChain'
import dayjs from 'dayjs'

const router = useRouter()

// ===== 状态 =====
const loading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const searchKeyword = ref('')

// ===== 加载数据 =====
const loadData = async () => {
  loading.value = true
  try {
    const res = await getRuleChainList({
      page: pageNum.value,
      size: pageSize.value,
      keyword: searchKeyword.value
    })
    const list = Array.isArray(res.data) ? res.data : res.data?.list || []
    tableData.value = list
    total.value = Array.isArray(res.data) ? res.data.length : res.data?.total || 0
  } catch (e) {
    ElMessage.error('加载规则链列表失败')
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
  handleSearch()
}

// ===== 新建 =====
const handleCreate = () => {
  router.push('/rule-chain/editor')
}

// ===== 编辑 =====
const handleEdit = (row: any) => {
  router.push(`/rule-chain/editor/${row.chainId}`)
}

// ===== 切换状态 =====
const handleToggleStatus = async (row: any) => {
  const action = row.status === 1 ? '停用' : '启用'
  try {
    await ElMessageBox.confirm(`确定要${action}规则链「${row.name}」吗？`, '提示', {
      type: 'warning'
    })
    const newStatus = row.status === 1 ? 0 : 1
    await updateChainStatus(row.chainId, newStatus)
    ElMessage.success(`${action}成功`)
    loadData()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error(`${action}失败`)
    }
  }
}

// ===== 删除 =====
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除规则链「${row.name}」吗？此操作不可恢复！`, '警告', {
      type: 'error'
    })
    await deleteRuleChain(row.chainId)
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
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 8px;
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
}

.pagination-wrapper {
  padding: 16px 20px;
  background: #fff;
  border-radius: 8px;
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>