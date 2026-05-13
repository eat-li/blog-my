<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { announcementApi } from '../api'

const announcements = ref([])
const currentIndex = ref(0)
let timer = null

onMounted(async () => {
  try {
    const res = await announcementApi.active()
    announcements.value = res.data || []
    if (announcements.value.length > 1) {
      startCarousel()
    }
  } catch {
    // 公告获取失败，静默处理
  }
})

onUnmounted(() => {
  clearInterval(timer)
})

function startCarousel() {
  timer = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % announcements.value.length
  }, 4000)
}

function goTo(index) {
  currentIndex.value = index
  // 手动切换时重置计时器
  if (announcements.value.length > 1) {
    clearInterval(timer)
    startCarousel()
  }
}
</script>

<template>
  <div v-if="announcements.length" class="announce-bar glass-card">
    <div class="announce-content">
      <transition name="announce-fade" mode="out-in">
        <p :key="currentIndex" class="announce-text">
          {{ announcements[currentIndex]?.content }}
        </p>
      </transition>
    </div>

    <!-- 指示器 -->
    <div v-if="announcements.length > 1" class="announce-dots">
      <button
        v-for="(_, i) in announcements"
        :key="i"
        class="announce-dot"
        :class="{ 'announce-dot--active': i === currentIndex }"
        @click="goTo(i)"
      />
    </div>
  </div>
</template>

<style scoped>
.announce-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 22px;
  margin-bottom: 24px;
  border-left: 3px solid var(--color-primary);
  overflow: hidden;
}

.announce-content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.announce-text {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.announce-dots {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.announce-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1.5px solid var(--glass-border);
  background: transparent;
  cursor: pointer;
  padding: 0;
  transition: all var(--transition-fast);
}

.announce-dot--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.announce-dot:hover {
  border-color: var(--color-primary);
}

/* 过渡动画 */
.announce-fade-enter-active,
.announce-fade-leave-active {
  transition: all 0.3s ease;
}
.announce-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.announce-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
