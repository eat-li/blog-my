<script setup>
import { ref, onMounted } from 'vue'

const petals = ref([])

onMounted(() => {
  const petalChars = ['🌸', '✿', '❀', '✾', '❁']
  for (let i = 0; i < 25; i++) {
    petals.value.push({
      id: i,
      char: petalChars[i % petalChars.length],
      left: Math.random() * 100,
      delay: Math.random() * 12,
      duration: 8 + Math.random() * 10,
      swing: 60 + Math.random() * 80,
      size: 14 + Math.random() * 14,
      opacity: 0.3 + Math.random() * 0.5,
      blur: Math.random() > 0.6,
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
        fontSize: p.size + 'px',
        opacity: p.opacity,
        filter: p.blur ? 'blur(1px)' : 'none',
      }"
    >
      <span
        class="petal-inner"
        :style="{ '--swing': p.swing + 'px' }"
      >{{ p.char }}</span>
    </span>
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

/* 内层负责左右摇摆（使用 transform 而非 margin-left，避免触发布局） */
.petal-inner {
  display: inline-block;
  will-change: transform;
  animation: petalSway1 4s ease-in-out infinite;
}

.sakura-petal:nth-child(even) .petal-inner {
  animation-name: petalSway2;
}

@keyframes petalFall {
  0%   { transform: translateY(-30px) rotate(0deg); }
  100% { transform: translateY(105vh) rotate(720deg); }
}

@keyframes petalSway1 {
  0%   { transform: translateX(0); }
  25%  { transform: translateX(var(--swing)); }
  50%  { transform: translateX(calc(var(--swing) * -0.5)); }
  75%  { transform: translateX(calc(var(--swing) * 0.7)); }
  100% { transform: translateX(calc(var(--swing) * -0.3)); }
}

@keyframes petalSway2 {
  0%   { transform: translateX(0); }
  25%  { transform: translateX(calc(var(--swing) * -0.6)); }
  50%  { transform: translateX(calc(var(--swing) * 0.8)); }
  75%  { transform: translateX(calc(var(--swing) * -0.4)); }
  100% { transform: translateX(calc(var(--swing) * 0.5)); }
}
</style>
