<script setup>
import { ref, onMounted } from 'vue'

const isDark = ref(false)

function toggle() {
  isDark.value = !isDark.value
  applyTheme()
}

function applyTheme() {
  const theme = isDark.value ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}

onMounted(() => {
  const saved = localStorage.getItem('theme')
  if (saved) {
    isDark.value = saved === 'dark'
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  applyTheme()
})
</script>

<template>
  <button
    class="theme-toggle"
    :class="{ 'theme-toggle--dark': isDark }"
    @click="toggle"
    :aria-label="isDark ? '切换到日间模式' : '切换到夜间模式'"
    :title="isDark ? '日间模式' : '夜间模式'"
  >
    <div class="toggle-track">
      <div class="toggle-thumb">
        <!-- 太阳 -->
        <svg v-if="!isDark" class="toggle-icon sun-icon" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2" />
          <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        <!-- 月亮 -->
        <svg v-else class="toggle-icon moon-icon" viewBox="0 0 24 24" fill="none">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <!-- 装饰星星 -->
      <span class="star star--1" />
      <span class="star star--2" />
      <span class="star star--3" />
    </div>
  </button>
</template>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 28px;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
}

.toggle-track {
  position: relative;
  width: 52px;
  height: 28px;
  border-radius: 14px;
  background: linear-gradient(135deg, #F5E6C8, #E8D5B0);
  border: 1px solid rgba(139, 69, 19, 0.15);
  transition: all 0.45s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.theme-toggle--dark .toggle-track {
  background: linear-gradient(135deg, #2A2420, #1A1612);
  border-color: rgba(198, 139, 94, 0.2);
}

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFE4B5, #F5C882);
  box-shadow: 0 2px 8px rgba(139, 69, 19, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-toggle--dark .toggle-thumb {
  left: 27px;
  background: linear-gradient(135deg, #3D3430, #2A2420);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 12px rgba(198, 139, 94, 0.15);
}

.toggle-icon {
  width: 14px;
  height: 14px;
  color: #8B4513;
  transition: all 0.35s ease;
}

.theme-toggle--dark .toggle-icon {
  color: #C68B5E;
}

.sun-icon {
  animation: sunRotate 0.5s ease;
}

.moon-icon {
  animation: moonFade 0.5s ease;
}

@keyframes sunRotate {
  from { transform: rotate(-90deg) scale(0.5); opacity: 0; }
  to { transform: rotate(0deg) scale(1); opacity: 1; }
}

@keyframes moonFade {
  from { transform: rotate(90deg) scale(0.5); opacity: 0; }
  to { transform: rotate(0deg) scale(1); opacity: 1; }
}

/* 装饰星星 */
.star {
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #FFF8E7;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.theme-toggle--dark .star {
  opacity: 1;
}

.star--1 {
  top: 6px;
  left: 10px;
  animation: twinkle 2s ease-in-out infinite;
}

.star--2 {
  top: 16px;
  left: 18px;
  width: 2px;
  height: 2px;
  animation: twinkle 2.5s ease-in-out 0.5s infinite;
}

.star--3 {
  top: 8px;
  left: 38px;
  width: 2px;
  height: 2px;
  animation: twinkle 1.8s ease-in-out 1s infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}
</style>
