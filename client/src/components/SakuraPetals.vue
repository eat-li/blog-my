<script setup>
import { ref } from 'vue'

// 三种樱花花瓣 SVG
const petalTypes = [
  {
    // 经典五瓣樱花 — 俯视
    viewBox: '0 0 40 40',
    paths: [
      { d: 'M20 5 C13 3 4 8 5 18 C6 25 17 28 20 34 C23 28 34 25 35 18 C36 8 27 3 20 5Z', fill: 'url(#pg1)' },
    ],
    gradient: { id: 'pg1', stops: [{ o: '0%', c: '#ffe0ee' }, { o: '45%', c: '#f8a0be' }, { o: '100%', c: '#e87096' }] },
  },
  {
    // 侧视单片花瓣 — 心形
    viewBox: '0 0 28 36',
    paths: [
      { d: 'M14 3 C6 1 1 9 2 17 C3 25 11 31 14 36 C17 31 25 25 26 17 C27 9 22 1 14 3Z', fill: 'url(#pg2)' },
    ],
    gradient: { id: 'pg2', stops: [{ o: '0%', c: '#fff0f5' }, { o: '50%', c: '#fbb8d0' }, { o: '100%', c: '#ea88a4' }] },
  },
  {
    // 花苞 — 小巧三瓣
    viewBox: '0 0 24 24',
    paths: [
      { d: 'M12 4 C7 3 3 7 3 12 C3 16 9 19 12 22 C15 19 21 16 21 12 C21 7 17 3 12 4Z', fill: 'url(#pg3)' },
    ],
    gradient: { id: 'pg3', stops: [{ o: '0%', c: '#fff5f8' }, { o: '60%', c: '#fcc8da' }, { o: '100%', c: '#f298b4' }] },
  },
]

function createPetals() {
  const result = []
  const layers = [
    { count: 10, minSize: 8,  maxSize: 14, minDur: 16, maxDur: 24, minDrift: 20,  maxDrift: 50,  opacity: [0.15, 0.35], blur: true },
    { count: 16, minSize: 14, maxSize: 22, minDur: 12, maxDur: 18, minDrift: 40,  maxDrift: 100, opacity: [0.35, 0.6],  blur: false },
    { count: 9,  minSize: 20, maxSize: 32, minDur: 8,  maxDur: 14, minDrift: 60,  maxDrift: 160, opacity: [0.5, 0.85],  blur: false },
  ]

  let id = 0
  layers.forEach((layer) => {
    for (let i = 0; i < layer.count; i++) {
      result.push({
        id: id++,
        type: Math.floor(Math.random() * petalTypes.length),
        left: Math.random() * 100,
        startY: -(Math.random() * 130 + 15),
        delay: Math.random() * 22,
        duration: layer.minDur + Math.random() * (layer.maxDur - layer.minDur),
        size: layer.minSize + Math.random() * (layer.maxSize - layer.minSize),
        opacity: layer.opacity[0] + Math.random() * (layer.opacity[1] - layer.opacity[0]),
        rotation: 360 + Math.random() * 900,
        spinDir: Math.random() > 0.5 ? 1 : -1,
        drift: layer.minDrift + Math.random() * (layer.maxDrift - layer.minDrift),
        sway: 12 + Math.random() * 50,
        blur: layer.blur && Math.random() > 0.5,
        swayAnim: Math.floor(Math.random() * 3),
      })
    }
  })
  return result
}

const petals = ref(createPetals())
const allGradients = petalTypes.map(t => t.gradient)
</script>

<template>
  <div class="sakura-container" aria-hidden="true">
    <!-- SVG 渐变定义 -->
    <svg style="position:absolute;width:0;height:0" aria-hidden="true">
      <defs>
        <radialGradient v-for="g in allGradients" :key="g.id" :id="g.id" cx="50%" cy="30%" r="70%">
          <stop v-for="(s, si) in g.stops" :key="si" :offset="s.o" :stop-color="s.c" />
        </radialGradient>
      </defs>
    </svg>

    <!-- 花瓣 -->
    <div
      v-for="p in petals"
      :key="p.id"
      class="sakura-petal"
      :style="{
        left: p.left + '%',
        top: p.startY + 'px',
        animationDelay: p.delay + 's',
        animationDuration: p.duration + 's',
        '--rotate': (p.rotation * p.spinDir) + 'deg',
        '--drift': p.drift + 'px',
        filter: p.blur ? 'blur(1.5px)' : 'none',
      }"
    >
      <span
        class="petal-inner"
        :class="'sway-' + p.swayAnim"
        :style="{ '--sway': p.sway + 'px' }"
      >
        <svg
          :viewBox="petalTypes[p.type].viewBox"
          :width="p.size"
          :height="p.size * 1.25"
          :style="{ opacity: p.opacity }"
        >
          <path
            v-for="(pt, pti) in petalTypes[p.type].paths"
            :key="pti"
            :d="pt.d"
            :fill="pt.fill"
          />
        </svg>
      </span>
    </div>
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

/* 外层：下落 + 旋转 + 水平漂移 */
.sakura-petal {
  position: absolute;
  will-change: transform;
  animation: petalFall linear infinite;
}

/* 内层：左右摇摆（transform 不触发布局） */
.petal-inner {
  display: block;
  will-change: transform;
  filter: drop-shadow(0 1px 3px rgba(180, 100, 120, 0.12));
}

/* === 下落动画 === */
@keyframes petalFall {
  0%   { transform: translateY(0) rotate(0deg) translateX(0); }
  12%  { transform: translateY(12vh) rotate(calc(var(--rotate) * 0.15)) translateX(calc(var(--drift) * 0.2)); }
  28%  { transform: translateY(28vh) rotate(calc(var(--rotate) * 0.35)) translateX(calc(var(--drift) * 0.45)); }
  44%  { transform: translateY(44vh) rotate(calc(var(--rotate) * 0.52)) translateX(calc(var(--drift) * 0.25)); }
  58%  { transform: translateY(58vh) rotate(calc(var(--rotate) * 0.66)) translateX(calc(var(--drift) * 0.65)); }
  72%  { transform: translateY(72vh) rotate(calc(var(--rotate) * 0.8)) translateX(calc(var(--drift) * 0.4)); }
  86%  { transform: translateY(86vh) rotate(calc(var(--rotate) * 0.93)) translateX(calc(var(--drift) * 0.7)); }
  100% { transform: translateY(105vh) rotate(var(--rotate)) translateX(calc(var(--drift) * 0.5)); }
}

/* === 三种摇摆 === */
/* 模式0：缓弧线 */
.sway-0 {
  animation: sway0 5s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}
@keyframes sway0 {
  0%   { transform: translateX(0); }
  30%  { transform: translateX(var(--sway)); }
  65%  { transform: translateX(calc(var(--sway) * -0.6)); }
  100% { transform: translateX(calc(var(--sway) * 0.15)); }
}

/* 模式1：快速细颤 */
.sway-1 {
  animation: sway1 3.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes sway1 {
  0%   { transform: translateX(0); }
  22%  { transform: translateX(calc(var(--sway) * -0.8)); }
  48%  { transform: translateX(calc(var(--sway) * 0.5)); }
  72%  { transform: translateX(calc(var(--sway) * -0.3)); }
  100% { transform: translateX(0); }
}

/* 模式2：不对称偏漂 */
.sway-2 {
  animation: sway2 6.5s cubic-bezier(0.35, 0, 0.65, 1) infinite;
}
@keyframes sway2 {
  0%   { transform: translateX(0); }
  28%  { transform: translateX(calc(var(--sway) * 0.75)); }
  52%  { transform: translateX(calc(var(--sway) * -1.0)); }
  78%  { transform: translateX(calc(var(--sway) * 0.4)); }
  100% { transform: translateX(calc(var(--sway) * -0.1)); }
}
</style>
