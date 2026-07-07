<template>
  <el-container class="main-layout">
    <!-- 顶部导航 -->
    <el-header class="header">
      <div class="header-left">
        <div class="logo">
          <span class="logo-icon">🔷</span>
          <span class="logo-text">EdgeNexus</span>
          <span class="logo-sub">边缘网关开发实践</span>
        </div>
        <el-tag size="small" type="success" class="env-tag">开发环境</el-tag>
      </div>
      <div class="header-right">
        <el-button size="small" text @click="showHelp">
          <el-icon><QuestionFilled /></el-icon>
          文档
        </el-button>
        <el-dropdown @command="handleCommand">
          <span class="user-info">
            <el-avatar :size="28" icon="UserFilled" />
            <span style="margin-left: 8px;">{{ username }}</span>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <el-container>
      <!-- 左侧边栏 -->
      <el-aside class="sidebar" width="220px">
        <el-menu
          :default-active="$route.path"
          router
          class="sidebar-menu"
          background-color="#1f2d3d"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/device">
            <el-icon><Monitor /></el-icon>
            <span>设备管理</span>
          </el-menu-item>
          <el-menu-item index="/rule-chain">
            <el-icon><Share /></el-icon>
            <span>规则引擎</span>
          </el-menu-item>
          <el-menu-item index="/alert">
            <el-icon><Warning /></el-icon>
            <span>告警管理</span>
          </el-menu-item>
          <el-menu-item index="/audit">
            <el-icon><Document /></el-icon>
            <span>审计日志</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { QuestionFilled, Monitor, Share, Warning, Document, UserFilled } from '@element-plus/icons-vue'

const router = useRouter()
const username = ref('admin')

const showHelp = () => {
  window.open('https://github.com/your-repo', '_blank')
}

const handleCommand = (command: string) => {
  if (command === 'logout') {
    localStorage.removeItem('token')
    router.push('/login')
    ElMessage.success('已退出登录')
  }
}
</script>

<style scoped>
.main-layout {
  height: 100vh;
}

.header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 56px !important;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  font-size: 24px;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: #303133;
}

.logo-sub {
  font-size: 12px;
  color: #909399;
  margin-left: 4px;
}

.env-tag {
  margin-left: 8px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.user-info:hover {
  background: #f5f7fa;
}

.sidebar {
  background: #1f2d3d;
  height: calc(100vh - 56px);
}

.sidebar-menu {
  border-right: none;
  height: 100%;
}

.main-content {
  background: #f0f2f5;
  padding: 0;
  height: calc(100vh - 56px);
  overflow: hidden;
}
</style>