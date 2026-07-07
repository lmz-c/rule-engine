<template>
  <div class="device-page">
    <div class="page-header">
      <h2>设备管理</h2>
      <el-button type="primary" @click="handleAdd">+ 注册设备</el-button>
    </div>
    <el-table :data="deviceList" border stripe>
      <el-table-column prop="deviceId" label="设备ID" width="150" />
      <el-table-column prop="deviceName" label="设备名称" />
      <el-table-column prop="productKey" label="产品" width="120" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">
            {{ row.status === 1 ? '在线' : '离线' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" text @click="handleBind(row)">绑定规则</el-button>
          <el-button size="small" text type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const deviceList = ref([])

onMounted(async () => {
  // TODO: 调用设备列表API
})

const handleAdd = () => {}
const handleBind = (row: any) => {}
const handleDelete = (row: any) => {}
</script>

<style scoped>
.device-page {
  padding: 20px;
  height: 100%;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.page-header h2 {
  margin: 0;
}
</style>