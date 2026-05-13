<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const sidebarOpen = ref(false)

const navGroups = [
  {
    label: '管理',
    items: [
      { path: '/admin', label: '控制台', icon: '◈' },
      { path: '/admin/posts', label: '内容管理', icon: '✎' },
      { path: '/admin/messages', label: '留言管理', icon: '☰' },
      { path: '/admin/links', label: '友链管理', icon: '⚭' },
      { path: '/admin/quotes', label: '名言管理', icon: '☰' },
      { path: '/admin/announcements', label: '公告管理', icon: '◇' },
    ],
  },
  {
    label: '设置',
    items: [
      { path: '/admin/settings', label: '站点设置', icon: '⚙' },
    ],
  },
]

const isActive = (path) => {
  if (path === '/admin') return route.path === '/admin'
  return route.path.startsWith(path)
}

function handleLogout() {
  auth.logout()
  router.push('/admin/login')
}

function goBack() {
  router.push('/')
}
</script>

<template>
  <div class="admin-wrapper">
    <!-- 侧边栏遮罩 -->
    <div
      class="sidebar-overlay"
      :class="{ 'sidebar-overlay--show': sidebarOpen }"
      @click="sidebarOpen = false"
    />

    <!-- 侧边栏 -->
    <aside class="admin-sidebar" :class="{ 'admin-sidebar--open': sidebarOpen }">
      <div class="sidebar-header">
        <router-link to="/admin" class="sidebar-logo">
          <span class="logo-mark">✦</span>
          <span class="logo-text">EatLi</span>
        </router-link>
        <button class="sidebar-close glass-btn" @click="sidebarOpen = false">✕</button>
      </div>

      <nav class="sidebar-nav">
        <div v-for="group in navGroups" :key="group.label" class="nav-group">
          <p class="nav-group-label">{{ group.label }}</p>
          <router-link
            v-for="item in group.items"
            :key="item.path"
            :to="item.path"
            class="nav-item"
            :class="{ 'nav-item--active': isActive(item.path) }"
            @click="sidebarOpen = false"
          >
            <span class="nav-item-icon">{{ item.icon }}</span>
            <span class="nav-item-label">{{ item.label }}</span>
          </router-link>
        </div>
      </nav>

      <div class="sidebar-footer">
        <button class="sidebar-btn glass-btn" @click="goBack">
          ← 返回前台
        </button>
        <button class="sidebar-btn glass-btn sidebar-btn--danger" @click="handleLogout">
          退出登录
        </button>
      </div>
    </aside>

    <!-- 主内容区 -->
    <div class="admin-main">
      <!-- 顶部栏 -->
      <header class="admin-topbar">
        <button class="topbar-menu-btn glass-btn" @click="sidebarOpen = true">
          <span class="menu-icon">☰</span>
        </button>
        <h2 class="topbar-title">{{ route.meta?.title || '管理后台' }}</h2>
        <div class="topbar-right">
          <span class="topbar-user" v-if="auth.user">
            {{ auth.user.nickname || auth.user.username }}
          </span>
        </div>
      </header>

      <!-- 页面内容 -->
      <main class="admin-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-wrapper {
  display: flex;
  min-height: 100vh;
  background: var(--color-bg-start);
}

/* 侧边栏遮罩 */
.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 900;
  background: rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.3s;
}

/* =====================
   侧边栏
   ===================== */
.admin-sidebar {
  width: 240px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--glass-bg-strong);
  backdrop-filter: var(--glass-blur-strong);
  -webkit-backdrop-filter: var(--glass-blur-strong);
  border-right: 1px solid var(--glass-border);
  height: 100vh;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
  border-bottom: 1px solid var(--glass-border);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
}

.logo-mark {
  font-size: 18px;
  color: var(--color-primary);
}

.logo-text {
  font-family: var(--font-serif);
  font-size: 20px;
  font-weight: 900;
  color: var(--color-text);
}

.sidebar-close {
  display: none;
  width: 32px;
  height: 32px;
  padding: 0;
  font-size: 14px;
}

/* 导航 */
.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  overflow-y: auto;
}

.nav-group {
  margin-bottom: 24px;
}

.nav-group-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 0 12px;
  margin-bottom: 6px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  font-size: 14px;
  color: var(--color-text-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  margin-bottom: 2px;
}

.nav-item:hover {
  color: var(--color-text);
  background: rgba(139, 69, 19, 0.06);
}

.nav-item--active {
  color: var(--color-primary);
  background: rgba(139, 69, 19, 0.08);
  font-weight: 500;
}

.nav-item-icon {
  font-size: 15px;
  width: 20px;
  text-align: center;
}

/* 底部按钮 */
.sidebar-footer {
  padding: 16px 12px;
  border-top: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar-btn {
  width: 100%;
  padding: 8px 16px;
  font-size: 13px;
  justify-content: flex-start;
}

.sidebar-btn--danger {
  color: var(--color-accent-anime);
}

.sidebar-btn--danger:hover {
  background: rgba(232, 91, 91, 0.1);
  border-color: rgba(232, 91, 91, 0.3);
}

/* =====================
   主内容区
   ===================== */
.admin-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

/* 顶部栏 */
.admin-topbar {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-bottom: 1px solid var(--glass-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.topbar-menu-btn {
  display: none;
  width: 36px;
  height: 36px;
  padding: 0;
  margin-right: 12px;
  font-size: 18px;
}

.menu-icon {
  line-height: 1;
}

.topbar-title {
  font-family: var(--font-sans);
  font-size: 16px;
  font-weight: 600;
  flex: 1;
}

.topbar-right {
  display: flex;
  align-items: center;
}

.topbar-user {
  font-size: 14px;
  color: var(--color-text-secondary);
}

/* 页面内容 */
.admin-content {
  flex: 1;
  padding: 24px;
}

@media (max-width: 768px) {
  .admin-sidebar {
    position: fixed;
    left: -240px;
    top: 0;
    bottom: 0;
    z-index: 1000;
    transition: left 0.3s ease;
  }

  .admin-sidebar--open {
    left: 0;
  }

  .sidebar-overlay--show {
    display: block;
    opacity: 1;
  }

  .sidebar-close {
    display: inline-flex;
  }

  .topbar-menu-btn {
    display: inline-flex;
  }

  .admin-content {
    padding: 16px;
  }
}
</style>
