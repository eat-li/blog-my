<script setup>
import { usePageTransition } from '../composables/usePageTransition'

const { isFliping, phase, currentText } = usePageTransition()
</script>

<template>
  <transition name="loader-fade">
    <div v-if="isFliping" class="pageflip-overlay" :class="'phase-' + phase">
      <!-- 翻卷角（使用 clip-path + transform 替代 border-width，避免触发布局） -->
      <div class="flip-corner">
        <div class="corner-fold" />
        <div class="corner-shadow" />
      </div>

      <!-- 加载中心 -->
      <div class="loader-center" :class="{ 'loader-out': phase === 'unfold' }">
        <div class="loader-star-wrap">
          <span class="loader-star">✦</span>
        </div>
        <p class="loader-text">{{ currentText }}</p>
        <div class="loader-bar">
          <div class="loader-bar-fill" />
        </div>
      </div>

      <!-- 纸张纹理背景 -->
      <div class="flip-bg" />
    </div>
  </transition>
</template>

<style scoped>
.pageflip-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-end);
  pointer-events: all;
  overflow: hidden;
}

/* 翻卷角 */
.flip-corner {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 250px;
  height: 250px;
}

.corner-fold {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 250px;
  height: 250px;
  background: var(--color-bg-start);
  clip-path: polygon(100% 100%, 100% 0%, 0% 100%);
  transform-origin: right bottom;
  filter: drop-shadow(-6px -6px 16px rgba(0, 0, 0, 0.06));
  animation: cornerFold 0.5s ease-in-out forwards;
}

@keyframes cornerFold {
  0%   { transform: scale(0); }
  100% { transform: scale(1); }
}

.corner-shadow {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 260px;
  height: 260px;
  background: rgba(0, 0, 0, 0.02);
  clip-path: polygon(100% 100%, 100% 0%, 0% 100%);
  transform-origin: right bottom;
  animation: cornerShadow 0.6s ease-in-out forwards;
}

@keyframes cornerShadow {
  0%   { transform: scale(0); }
  60%  { transform: scale(1); }
  100% { transform: scale(1); opacity: 0; }
}

/* 加载中心 */
.loader-center {
  text-align: center;
  z-index: 1;
  transition: all 0.4s ease;
}

.loader-out {
  opacity: 0;
  transform: translateY(-20px);
}

.loader-star-wrap {
  margin-bottom: 20px;
}

.loader-star {
  display: inline-block;
  font-size: 36px;
  color: var(--color-primary);
  animation: starSpin 1.2s ease-in-out infinite;
}

@keyframes starSpin {
  0%   { transform: scale(1) rotate(0deg); opacity: 0.5; }
  25%  { transform: scale(1.2) rotate(90deg); opacity: 1; }
  50%  { transform: scale(1) rotate(180deg); opacity: 0.5; }
  75%  { transform: scale(1.2) rotate(270deg); opacity: 1; }
  100% { transform: scale(1) rotate(360deg); opacity: 0.5; }
}

.loader-text {
  font-family: var(--font-serif);
  font-size: 20px;
  color: var(--color-text-secondary);
  margin-bottom: 24px;
  letter-spacing: 2px;
}

/* 加载条 */
.loader-bar {
  width: 180px;
  height: 3px;
  background: rgba(139, 69, 19, 0.08);
  border-radius: 3px;
  overflow: hidden;
  margin: 0 auto;
}

.loader-bar-fill {
  height: 100%;
  width: 30%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent-article));
  border-radius: 3px;
  animation: barSlide 0.9s ease-in-out infinite;
}

@keyframes barSlide {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(430%); }
}

/* unfold 阶段 */
.phase-unfold .corner-fold {
  animation: cornerUnfold 0.5s ease-in-out forwards;
}

@keyframes cornerUnfold {
  0%   { transform: scale(1); }
  100% { transform: scale(0); }
}

.phase-unfold .corner-shadow {
  animation: none;
  opacity: 0;
}

/* 背景纸纹 */
.flip-bg {
  position: absolute;
  inset: 0;
  opacity: 0.05;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size: 256px 256px;
}

/* loader 淡入淡出 */
.loader-fade-enter-active {
  transition: opacity 0.3s ease;
}
.loader-fade-leave-active {
  transition: opacity 0.4s ease;
}
.loader-fade-enter-from,
.loader-fade-leave-to {
  opacity: 0;
}
</style>
