<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const messages = [
  'にゃん～', 'こんにちは！', '見てくれてありがとう ♪',
  '今日もいい日だね', '頑張って！', 'おやすみなさい…',
]
const showBubble = ref(false)
const bubbleText = ref('')
let bubbleTimer = null

function randomBubble() {
  bubbleText.value = messages[Math.floor(Math.random() * messages.length)]
  showBubble.value = true
  clearTimeout(bubbleTimer)
  bubbleTimer = setTimeout(() => {
    showBubble.value = false
  }, 3000)
}

let idleTimer = null
function startIdleTimer() {
  idleTimer = setInterval(() => {
    if (Math.random() > 0.5) randomBubble()
  }, 12000)
}

onMounted(() => {
  // First bubble after 3s
  setTimeout(randomBubble, 3000)
  startIdleTimer()
})

onUnmounted(() => {
  clearTimeout(bubbleTimer)
  clearInterval(idleTimer)
})
</script>

<template>
  <div class="mascot-wrapper" @click="randomBubble">
    <!-- 对话气泡 -->
    <transition name="bubble-pop">
      <div v-if="showBubble" class="mascot-bubble glass-card">
        <span class="bubble-arrow" />
        <p class="bubble-text">{{ bubbleText }}</p>
      </div>
    </transition>

    <!-- 像素猫 -->
    <div class="mascot-body">
      <div class="mascot-cat">
        <div class="cat-ears">
          <span class="ear ear-l" />
          <span class="ear ear-r" />
        </div>
        <div class="cat-face">
          <span class="eye eye-l" />
          <span class="eye eye-r" />
          <span class="nose" />
          <span class="mouth" />
        </div>
        <div class="cat-body">
          <div class="paw paw-l">ฅ</div>
          <div class="paw paw-r">ฅ</div>
        </div>
        <div class="cat-tail">~</div>
      </div>
    </div>

    <!-- 漂浮粒子 -->
    <span class="particle p1">✦</span>
    <span class="particle p2">♥</span>
    <span class="particle p3">.</span>
  </div>
</template>

<style scoped>
.mascot-wrapper {
  position: fixed;
  right: 20px;
  bottom: 90px;
  z-index: 900;
  cursor: pointer;
  user-select: none;
}

/* 对话气泡 */
.mascot-bubble {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 12px;
  padding: 10px 18px;
  min-width: 120px;
  text-align: center;
  white-space: nowrap;
}

.bubble-arrow {
  position: absolute;
  bottom: -6px;
  right: 30px;
  width: 12px;
  height: 12px;
  background: var(--color-bg-glass-strong);
  border: 1px solid var(--glass-border);
  border-top: none;
  border-left: none;
  transform: rotate(45deg);
  backdrop-filter: blur(8px);
}

.bubble-text {
  font-size: 14px;
  color: var(--color-text);
  font-weight: 500;
}

/* 气泡弹出动画 */
.bubble-pop-enter-active {
  animation: bubbleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.bubble-pop-leave-active {
  animation: bubbleIn 0.25s ease-in reverse;
}
@keyframes bubbleIn {
  0% { opacity: 0; transform: scale(0.5) translateY(10px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

/* 像素猫身体 */
.mascot-body {
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.mascot-cat {
  display: flex;
  flex-direction: column;
  align-items: center;
  filter: drop-shadow(0 4px 12px rgba(139, 69, 19, 0.15));
}

/* 耳朵 */
.cat-ears {
  display: flex;
  gap: 18px;
  margin-bottom: -4px;
}

.ear {
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 14px solid var(--color-primary);
  opacity: 0.7;
}

.ear-l { transform: rotate(-10deg); }
.ear-r { transform: rotate(10deg); }

/* 脸 */
.cat-face {
  width: 44px;
  height: 36px;
  background: var(--color-bg-glass-strong);
  backdrop-filter: blur(4px);
  border: 2px solid var(--color-primary);
  border-radius: 50% 50% 40% 40%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: relative;
}

.eye {
  width: 6px;
  height: 6px;
  background: var(--color-text);
  border-radius: 50%;
  animation: eyeBlink 3s ease-in-out infinite;
}

.eye-l { animation-delay: 0s; }
.eye-r { animation-delay: 0.1s; }

@keyframes eyeBlink {
  0%, 96%, 100% { transform: scaleY(1); }
  98% { transform: scaleY(0.1); }
}

.nose {
  position: absolute;
  bottom: 8px;
  width: 4px;
  height: 3px;
  background: var(--color-accent-anime);
  border-radius: 50%;
}

.mouth {
  display: none;
}

/* 身体 */
.cat-body {
  display: flex;
  gap: 8px;
  margin-top: 2px;
}

.paw {
  font-size: 14px;
  color: var(--color-text-secondary);
  animation: pawWave 1.5s ease-in-out infinite;
}

.paw-l { animation-delay: 0s; }
.paw-r { animation-delay: 0.75s; }

@keyframes pawWave {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-10deg); }
  75% { transform: rotate(10deg); }
}

/* 尾巴 */
.cat-tail {
  font-size: 20px;
  color: var(--color-primary);
  opacity: 0.5;
  margin-top: -4px;
  animation: tailWag 1s ease-in-out infinite;
}

@keyframes tailWag {
  0%, 100% { transform: rotate(-15deg) scaleX(-1); }
  50% { transform: rotate(15deg) scaleX(-1); }
}

/* 漂浮粒子 */
.particle {
  position: absolute;
  font-size: 12px;
  opacity: 0;
  pointer-events: none;
}

.p1 {
  top: -10px;
  left: -20px;
  color: var(--color-accent-article);
  animation: floatUp 3s ease-out infinite;
  animation-delay: 0s;
}

.p2 {
  top: -5px;
  right: -15px;
  color: var(--color-accent-anime);
  animation: floatUp 3.5s ease-out infinite;
  animation-delay: 1s;
}

.p3 {
  top: 10px;
  left: -30px;
  color: var(--color-accent-galgame);
  animation: floatUp 2.5s ease-out infinite;
  animation-delay: 2s;
}

@keyframes floatUp {
  0% { opacity: 0; transform: translateY(0) scale(0.5); }
  20% { opacity: 1; transform: translateY(-10px) scale(1); }
  100% { opacity: 0; transform: translateY(-30px) scale(0.5); }
}

/* 移动端隐藏 */
@media (max-width: 768px) {
  .mascot-wrapper {
    display: none;
  }
}
</style>
