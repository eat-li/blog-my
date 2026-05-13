<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const visible = ref(false)
const phase = ref('enter')  // enter → hold → leave

onMounted(() => {
  // 仅首页且当前会话首次访问时显示
  if (route.path !== '/') return
  if (sessionStorage.getItem('entry_loaded')) return

  sessionStorage.setItem('entry_loaded', '1')
  visible.value = true

  // 入场 → 停留 → 退场
  setTimeout(() => { phase.value = 'hold' }, 400)
  setTimeout(() => { phase.value = 'leave' }, 1800)
  setTimeout(() => { visible.value = false }, 2400)
})
</script>

<template>
  <transition name="entry-fade">
    <div v-if="visible" class="entry-overlay" :class="'phase-' + phase">
      <div class="entry-center">
        <!-- Logo 标记 -->
        <div class="entry-mark">
          <span class="entry-mark-text">E</span>
          <div class="entry-mark-ring" />
        </div>

        <!-- 标题 -->
        <h1 class="entry-title">EatLi</h1>
        <p class="entry-subtitle">记录技术与日常</p>

        <!-- 进度指示 -->
        <div class="entry-bar">
          <div class="entry-bar-fill" />
        </div>
      </div>

      <!-- 底部装饰粒子 -->
      <div class="entry-particles">
        <span v-for="i in 6" :key="i" class="entry-particle" :style="{ animationDelay: (i * 0.12) + 's' }" />
      </div>
    </div>
  </transition>
</template>

<style scoped>
.entry-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, #F5F0E8 0%, #EDE4D8 50%, #E8DDD0 100%);
  overflow: hidden;
}

/* Logo 标记 */
.entry-mark {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.entry-mark-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid rgba(139, 69, 19, 0.2);
  animation: markPulse 2s ease-in-out infinite;
}

@keyframes markPulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.15); opacity: 0.8; }
}

.entry-mark-text {
  position: relative;
  z-index: 1;
  font-family: var(--font-serif);
  font-size: 36px;
  font-weight: 900;
  color: var(--color-primary);
}

/* 标题 */
.entry-title {
  font-family: var(--font-serif);
  font-size: 28px;
  font-weight: 900;
  color: var(--color-text);
  text-align: center;
  letter-spacing: 3px;
  margin-bottom: 8px;
}

.entry-subtitle {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--color-text-muted);
  text-align: center;
  letter-spacing: 2px;
  margin-bottom: 36px;
}

/* 进度条 */
.entry-bar {
  width: 160px;
  height: 2px;
  background: rgba(139, 69, 19, 0.08);
  border-radius: 2px;
  overflow: hidden;
  margin: 0 auto;
}

.entry-bar-fill {
  height: 100%;
  width: 0;
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent-article));
  border-radius: 2px;
  animation: barGrow 1.6s ease-in-out forwards;
}

@keyframes barGrow {
  0%   { width: 0; }
  50%  { width: 70%; }
  100% { width: 100%; }
}

/* 底部装饰粒子 */
.entry-particles {
  position: absolute;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
}

.entry-particle {
  display: block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(139, 69, 19, 0.18);
  animation: particleFloat 1.8s ease-in-out infinite;
}

@keyframes particleFloat {
  0%, 100% { transform: translateY(0); opacity: 0.3; }
  50% { transform: translateY(-12px); opacity: 0.8; }
}

/* 阶段控制 */
.phase-enter .entry-center {
  opacity: 0;
  transform: translateY(16px);
  transition: all 0.5s ease;
}

.phase-hold .entry-center {
  opacity: 1;
  transform: translateY(0);
  transition: all 0.5s ease;
}

.phase-leave .entry-center {
  opacity: 0;
  transform: translateY(-12px);
  transition: all 0.5s ease;
}

/* 过渡 */
.entry-fade-leave-active {
  transition: opacity 0.5s ease;
}
.entry-fade-leave-to {
  opacity: 0;
}
</style>
