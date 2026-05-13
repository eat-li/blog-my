<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { quoteApi } from '../api'

const quotes = ref([])

const currentIndex = ref(0)
let timer = null

onMounted(async () => {
  try {
    const res = await quoteApi.list()
    quotes.value = res.data || []
  } catch {
    quotes.value = []
  }
  if (quotes.value.length) {
    timer = setInterval(() => {
      currentIndex.value = (currentIndex.value + 1) % quotes.value.length
    }, 5000)
  }
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div v-if="quotes.length" class="ticker-wrapper">
    <div class="ticker-label">現在再生中</div>
    <div class="ticker-stage">
      <transition name="ticker-slide" mode="out-in">
        <div class="ticker-content" :key="currentIndex">
          <p class="ticker-ja">{{ quotes[currentIndex].ja }}</p>
          <p class="ticker-zh">{{ quotes[currentIndex].zh }}</p>
          <p class="ticker-source">— {{ quotes[currentIndex].source }}</p>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.ticker-wrapper {
  width: 100%;
  background: var(--glass-bg-strong);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: 20px 24px;
  position: relative;
  overflow: hidden;
}

.ticker-wrapper::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, rgba(232, 137, 91, 0.05), rgba(232, 91, 91, 0.05), rgba(123, 168, 114, 0.05));
  pointer-events: none;
}

.ticker-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-muted);
  letter-spacing: 2px;
  margin-bottom: 10px;
  text-transform: uppercase;
}

.ticker-stage {
  min-height: 80px;
  position: relative;
}

.ticker-content {
  position: absolute;
  width: 100%;
}

.ticker-ja {
  font-family: 'Noto Serif SC', 'Yu Mincho', serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 6px;
  letter-spacing: 1px;
}

.ticker-zh {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 6px;
}

.ticker-source {
  font-size: 12px;
  color: var(--color-text-muted);
  font-style: italic;
}

/* 切换动画 */
.ticker-slide-enter-active,
.ticker-slide-leave-active {
  transition: all 0.2s ease;
}

.ticker-slide-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.ticker-slide-leave-to {
  opacity: 0;
  transform: translateY(-16px);
}

@media (max-width: 768px) {
  .ticker-wrapper {
    padding: 16px;
  }
  .ticker-ja {
    font-size: 16px;
  }
}
</style>
