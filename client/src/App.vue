<script setup>
import { ref, onMounted } from 'vue'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import SakuraPetals from './components/SakuraPetals.vue'
import PixelMascot from './components/PixelMascot.vue'
import PageFlipLoader from './components/PageFlipLoader.vue'
import MusicPlayer from './components/MusicPlayer.vue'

const bgOrbs = ref([
  { x: 20, y: 10, size: 500, color: 'rgba(232, 137, 91, 0.08)', dx: 1, dy: 0.5 },
  { x: 80, y: 20, size: 400, color: 'rgba(123, 168, 114, 0.06)', dx: -0.7, dy: 0.8 },
  { x: 50, y: 80, size: 450, color: 'rgba(232, 91, 91, 0.05)', dx: 0.6, dy: -0.4 },
])

function animateOrbs() {
  bgOrbs.value.forEach(orb => {
    orb.x += orb.dx * 0.03
    orb.y += orb.dy * 0.03
    if (orb.x < -10 || orb.x > 110) orb.dx *= -1
    if (orb.y < -10 || orb.y > 110) orb.dy *= -1
  })
  requestAnimationFrame(animateOrbs)
}

onMounted(animateOrbs)
</script>

<template>
  <div class="app-wrapper">
    <!-- 落樱 (全局) -->
    <SakuraPetals />

    <!-- 翻页加载动画 -->
    <PageFlipLoader />

    <!-- 动态光晕层 -->
    <div class="bg-orbs">
      <div
        v-for="(orb, i) in bgOrbs"
        :key="i"
        class="bg-orb"
        :style="{
          left: orb.x + '%',
          top: orb.y + '%',
          width: orb.size + 'px',
          height: orb.size + 'px',
          background: orb.color,
        }"
      />
    </div>

    <AppHeader />
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade-slide" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <AppFooter />

    <!-- 背景音乐播放器 (全局) -->
    <MusicPlayer />

    <!-- 像素吉祥物 (全局) -->
    <PixelMascot />

    <!-- 磨砂玻璃装饰条 -->
    <div class="glass-edge glass-edge-t" />
    <div class="glass-edge glass-edge-b" />
  </div>
</template>

<style scoped>
.app-wrapper {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 动态光晕层 */
.bg-orbs {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  transform: translate(-50%, -50%);
  will-change: transform;
}

/* 主内容区 */
.main-content {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 20px 48px;
  position: relative;
}

/* 装饰玻璃条 */
.glass-edge {
  position: fixed;
  left: 0;
  right: 0;
  height: 1px;
  z-index: 0;
  pointer-events: none;
}

.glass-edge-t {
  top: 60px;
  background: linear-gradient(90deg, transparent, var(--glass-border), transparent);
}

.glass-edge-b {
  bottom: 0;
  background: linear-gradient(90deg, transparent, var(--glass-border), transparent);
}

@media (max-width: 768px) {
  .main-content {
    padding: 20px 14px 32px;
  }
}
</style>
