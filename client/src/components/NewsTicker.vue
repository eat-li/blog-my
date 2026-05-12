<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const quotes = [
  { ja: '汐は美しい… 今は、この奇跡を抱きしめよう', zh: '汐是美丽的… 现在，让我拥抱这份奇迹', source: 'CLANNAD ~After Story~' },
  { ja: 'エル・プサイ・コングルゥ', zh: 'El Psy Kongroo', source: 'Steins;Gate' },
  { ja: '僕たちは、きっと、この先も、ずっと…', zh: '我们一定，从今以后，也会一直…', source: '天気の子' },
  { ja: 'まだ会ったことのない君を、探している', zh: '还在寻找着，未曾谋面的你', source: '君の名は。' },
  { ja: '逃げちゃダメだ、逃げちゃダメだ', zh: '不能逃、不能逃', source: '新世紀エヴァンゲリオン' },
  { ja: '世界は美しさと残酷さでできている', zh: '世界由美丽与残酷构成', source: '魔法少女まどか☆マギカ' },
  { ja: '人生って、楽しいことばかりじゃないさ', zh: '人生啊，不全是开心的事呢', source: '3月のライオン' },
  { ja: '何かを得るためには、同等の代償が必要', zh: '想要得到什么，就需要付出同等的代价', source: '鋼の錬金術師' },
  { ja: '人は一人では生きていけない', zh: '人无法独自活下去', source: 'ONE PIECE' },
  { ja: '自分の生きている世界を、好きでありたい', zh: '希望自己能喜欢自己生活的这个世界', source: '響け！ユーフォニアム' },
]

const currentIndex = ref(0)
let timer = null

onMounted(() => {
  timer = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % quotes.length
  }, 5000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="ticker-wrapper">
    <div class="ticker-label">♪ 現在再生中</div>
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
