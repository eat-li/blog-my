<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const mobileMenuOpen = ref(false)

const blogDropdownOpen = ref(false)

const navItems = [
  { path: '/', label: '首页', icon: '⌂' },
  {
    label: '博客', icon: '☗',
    children: [
      { path: '/articles', label: '文章', icon: '✎', color: 'var(--color-accent-article)' },
      { path: '/anime', label: '动漫', icon: '◉', color: 'var(--color-accent-anime)' },
      { path: '/galgame', label: 'Galgame', icon: '◈', color: 'var(--color-accent-galgame)' },
      { path: '/articles/archive', label: '归档', icon: '☰', color: 'var(--color-primary)' },
    ]
  },
  { path: '/guestbook', label: '留言板', icon: '☰' },
  { path: '/diary', label: '日记', icon: '~' },
  { path: '/gallery', label: '画廊', icon: '▥' },
  { path: '/links', label: '友链', icon: '⚭' },
  { path: '/about', label: '关于', icon: '◎' },
]

function isBlogActive() {
  const path = router.currentRoute.value.path
  return path.startsWith('/articles') || path.startsWith('/anime') || path.startsWith('/galgame')
}

function toggleBlogDropdown() {
  blogDropdownOpen.value = !blogDropdownOpen.value
}

function closeBlogDropdown() {
  blogDropdownOpen.value = false
}

watch(() => router.currentRoute.value.path, () => {
  mobileMenuOpen.value = false
})
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <router-link to="/" class="logo">
        <span class="logo-icon">✦</span>
        <span class="logo-text">EatLi</span>
        <span class="logo-dot">.</span>
      </router-link>

      <nav class="nav-links">
        <template v-for="item in navItems" :key="item.path || item.label">
          <!-- 有子项：博客下拉 -->
          <div
            v-if="item.children"
            class="nav-dropdown"
            @mouseenter="blogDropdownOpen = true"
            @mouseleave="closeBlogDropdown"
          >
            <button
              class="nav-link nav-dropdown-trigger"
              :class="{ 'nav-link--active': isBlogActive() }"
              @click="toggleBlogDropdown"
            >
              <span class="nav-link-icon">{{ item.icon }}</span>
              <span class="nav-link-label">{{ item.label }}</span>
              <span class="dropdown-arrow" :class="{ 'dropdown-arrow--open': blogDropdownOpen }">▾</span>
            </button>
            <transition name="dropdown-fade">
              <div v-if="blogDropdownOpen" class="dropdown-menu glass-card">
                <router-link
                  v-for="child in item.children"
                  :key="child.path"
                  :to="child.path"
                  class="dropdown-item"
                  active-class="dropdown-item--active"
                  @click="closeBlogDropdown"
                >
                  <span class="dropdown-item-icon" :style="{ color: child.color }">{{ child.icon }}</span>
                  <span>{{ child.label }}</span>
                </router-link>
              </div>
            </transition>
          </div>

          <!-- 普通导航项 -->
          <router-link
            v-else
            :to="item.path"
            class="nav-link"
            active-class="nav-link--active"
          >
            <span class="nav-link-icon">{{ item.icon }}</span>
            <span class="nav-link-label">{{ item.label }}</span>
          </router-link>
        </template>
      </nav>

      <button
        class="menu-toggle glass-btn"
        :class="{ 'menu-toggle--open': mobileMenuOpen }"
        @click="mobileMenuOpen = !mobileMenuOpen"
        aria-label="菜单"
      >
        <span class="menu-bar" />
        <span class="menu-bar" />
        <span class="menu-bar" />
      </button>
    </div>

    <!-- 移动端菜单 -->
    <transition name="menu-slide">
      <div v-if="mobileMenuOpen" class="mobile-menu">
        <template v-for="item in navItems" :key="item.path || item.label">
          <template v-if="item.children">
            <router-link
              v-for="child in item.children"
              :key="child.path"
              :to="child.path"
              class="mobile-link"
              active-class="mobile-link--active"
            >
              <span class="mobile-link-icon" :style="{ color: child.color }">{{ child.icon }}</span>
              {{ child.label }}
            </router-link>
          </template>
          <router-link
            v-else
            :to="item.path"
            class="mobile-link"
            active-class="mobile-link--active"
          >
            <span class="mobile-link-icon">{{ item.icon }}</span>
            {{ item.label }}
          </router-link>
        </template>
      </div>
    </transition>
  </header>
</template>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur-strong);
  -webkit-backdrop-filter: var(--glass-blur-strong);
  border-bottom: 1px solid var(--glass-border);
  box-shadow: 0 4px 20px rgba(139, 69, 19, 0.04);
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

/* Logo */
.logo {
  display: flex;
  align-items: baseline;
  text-decoration: none;
  gap: 2px;
  flex-shrink: 0;
}

.logo-icon {
  font-size: 18px;
  color: var(--color-primary);
  animation: logoSpin 6s ease-in-out infinite;
}

@keyframes logoSpin {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(180deg) scale(1.1); }
}

.logo-text {
  font-family: var(--font-serif);
  font-size: 22px;
  font-weight: 900;
  color: var(--color-text);
  letter-spacing: 1px;
}

.logo-dot {
  font-family: var(--font-serif);
  font-size: 26px;
  font-weight: 700;
  color: var(--color-primary);
}

/* 桌面导航 */
.nav-links {
  display: flex;
  gap: 2px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  text-decoration: none;
  color: var(--color-text-secondary);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  font-size: 14px;
  font-weight: 500;
  position: relative;
}

.nav-link-icon {
  font-size: 13px;
  opacity: 0.6;
  transition: opacity var(--transition-fast);
}

.nav-link:hover {
  color: var(--color-text);
  background: rgba(139, 69, 19, 0.06);
}

.nav-link:hover .nav-link-icon {
  opacity: 1;
}

.nav-link--active {
  color: var(--color-primary);
  background: rgba(139, 69, 19, 0.08);
}

.nav-link--active::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 2px;
  background: var(--color-primary);
  border-radius: 2px;
}

/* 博客下拉菜单 */
.nav-dropdown {
  position: relative;
}

.nav-dropdown-trigger {
  background: none;
  border: none;
  font-family: inherit;
  cursor: var(--cursor-sparkle-glow);
  gap: 6px;
}

.dropdown-arrow {
  font-size: 10px;
  margin-left: -2px;
  transition: transform var(--transition-base);
  opacity: 0.5;
}

.dropdown-arrow--open {
  transform: rotate(180deg);
  opacity: 1;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 150px;
  padding: 8px;
  border-radius: var(--radius-md);
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  text-decoration: none;
  color: var(--color-text-secondary);
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  transition: all var(--transition-fast);
}

.dropdown-item:hover {
  background: rgba(139, 69, 19, 0.06);
  color: var(--color-text);
}

.dropdown-item--active {
  color: var(--color-primary);
  background: rgba(139, 69, 19, 0.08);
}

.dropdown-item-icon {
  font-size: 15px;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.2s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* 移动端汉堡按钮 */
.menu-toggle {
  display: none;
  width: 40px;
  height: 40px;
  padding: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  border-radius: var(--radius-md);
}

.menu-bar {
  display: block;
  width: 18px;
  height: 2px;
  background: var(--color-text);
  border-radius: 2px;
  transition: all var(--transition-base);
}

.menu-toggle--open .menu-bar:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}
.menu-toggle--open .menu-bar:nth-child(2) {
  opacity: 0;
}
.menu-toggle--open .menu-bar:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}

/* 移动端面板 */
.mobile-menu {
  display: none;
  padding: 8px 20px 16px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur-strong);
  -webkit-backdrop-filter: var(--glass-blur-strong);
}

.mobile-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  text-decoration: none;
  color: var(--color-text-secondary);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  font-size: 15px;
}

.mobile-link-icon {
  font-size: 15px;
  width: 24px;
  text-align: center;
}

.mobile-link:hover,
.mobile-link--active {
  color: var(--color-primary);
  background: rgba(139, 69, 19, 0.06);
}

/* 菜单展开动画 */
.menu-slide-enter-active,
.menu-slide-leave-active {
  transition: all 0.3s ease;
}
.menu-slide-enter-from,
.menu-slide-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }

  .menu-toggle {
    display: flex;
  }

  .mobile-menu {
    display: block;
  }
}
</style>
