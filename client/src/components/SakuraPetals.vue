<script setup>
import { ref, onMounted } from 'vue'

const petals = ref([])

onMounted(() => {
  const petalChars = ['🌸', '✿', '❀', '✾', '❁']
  // Create 25 petals with randomized properties
  for (let i = 0; i < 25; i++) {
    petals.value.push({
      id: i,
      char: petalChars[i % petalChars.length],
      left: Math.random() * 100,
      delay: Math.random() * 12,       // 0-12s 延迟开始
      duration: 8 + Math.random() * 10, // 8-18s 飘落时长
      swing: 60 + Math.random() * 80,   // 左右摇摆幅度
      size: 14 + Math.random() * 14,    // 14-28px 大小
      opacity: 0.3 + Math.random() * 0.5,
      blur: Math.random() > 0.6,        // 部分模糊增加景深
    })
  }
})
</script>

<template>
  <div class="sakura-container" aria-hidden="true">
    <span
      v-for="p in petals"
      :key="p.id"
      class="sakura-petal"
      :style="{
        left: p.left + '%',
        animationDelay: p.delay + 's',
        animationDuration: p.duration + 's',
        '--swing': p.swing + 'px',
        fontSize: p.size + 'px',
        opacity: p.opacity,
        filter: p.blur ? 'blur(1px)' : 'none',
      }"
    >{{ p.char }}</span>
  </div>
</template>

<style scoped>
.sakura-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9998;
  overflow: hidden;
}

.sakura-petal {
  position: absolute;
  top: -30px;
  will-change: transform;
  animation: petalFall linear infinite;
  animation-fill-mode: both;
}

.sakura-petal:nth-child(odd) {
  animation-name: petalFall, petalSway1;
}

.sakura-petal:nth-child(even) {
  animation-name: petalFall, petalSway2;
}

@keyframes petalFall {
  0% {
    transform: translateY(-30px) rotate(0deg);
  }
  100% {
    transform: translateY(105vh) rotate(720deg);
  }
}

@keyframes petalSway1 {
  0%   { margin-left: 0; }
  25%  { margin-left: var(--swing); }
  50%  { margin-left: calc(var(--swing) * -0.5); }
  75%  { margin-left: calc(var(--swing) * 0.7); }
  100% { margin-left: calc(var(--swing) * -0.3); }
}

@keyframes petalSway2 {
  0%   { margin-left: 0; }
  25%  { margin-left: calc(var(--swing) * -0.6); }
  50%  { margin-left: calc(var(--swing) * 0.8); }
  75%  { margin-left: calc(var(--swing) * -0.4); }
  100% { margin-left: calc(var(--swing) * 0.5); }
}
</style>
