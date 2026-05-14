<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
let animationId = null
let time = 0

// 检测移动端 — 自动减少花瓣数量
function isMobile() {
  return window.innerWidth < 768 || 'ontouchstart' in window
}

// 三种花瓣类型的配置
const petalConfigs = [
  {
    // 经典五瓣樱花（俯视）
    draw(ctx, size) {
      const cx = size / 2, cy = size / 2
      // 5个花瓣围绕中心
      for (let i = 0; i < 5; i++) {
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate((i / 5) * Math.PI * 2 - Math.PI / 2)
        ctx.translate(size * 0.22, 0)
        ctx.beginPath()
        ctx.ellipse(0, 0, size * 0.18, size * 0.07, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
      // 花蕊
      ctx.beginPath()
      ctx.arc(cx, cy, size * 0.06, 0, Math.PI * 2)
      ctx.fillStyle = '#d4607a'
      ctx.fill()
    },
    gradient: ['#ffe0ee', '#f8a0be', '#e87096'],
  },
  {
    // 侧视单片花瓣（心形）
    draw(ctx, size) {
      const cx = size / 2
      ctx.beginPath()
      ctx.moveTo(cx, size * 0.65)
      ctx.bezierCurveTo(cx, size * 0.15, cx - size * 0.42, size * 0.15, cx - size * 0.42, size * 0.45)
      ctx.bezierCurveTo(cx - size * 0.42, size * 0.65, cx, size * 0.78, cx, size * 0.95)
      ctx.bezierCurveTo(cx, size * 0.78, cx + size * 0.42, size * 0.65, cx + size * 0.42, size * 0.45)
      ctx.bezierCurveTo(cx + size * 0.42, size * 0.15, cx, size * 0.15, cx, size * 0.65)
      ctx.fill()
    },
    gradient: ['#fff0f5', '#fbb8d0', '#ea88a4'],
  },
  {
    // 花苞（小巧椭圆 + 尖端）
    draw(ctx, size) {
      const cx = size / 2, cy = size / 2
      ctx.beginPath()
      ctx.ellipse(cx, cy + size * 0.06, size * 0.38, size * 0.44, 0, 0, Math.PI * 2)
      ctx.fill()
      // 小尖端
      ctx.beginPath()
      ctx.moveTo(cx, cy - size * 0.3)
      ctx.lineTo(cx - size * 0.07, cy - size * 0.48)
      ctx.lineTo(cx + size * 0.07, cy - size * 0.48)
      ctx.closePath()
      ctx.fill()
    },
    gradient: ['#fff5f8', '#fcc8da', '#f298b4'],
  },
]

// 预渲染花瓣到离屏 Canvas
const CACHE_SIZE = 60
function prerenderPetal(type) {
  const canvas = document.createElement('canvas')
  canvas.width = CACHE_SIZE
  canvas.height = CACHE_SIZE
  const ctx = canvas.getContext('2d')

  const cfg = petalConfigs[type]
  const cx = CACHE_SIZE / 2, cy = CACHE_SIZE / 2
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, CACHE_SIZE * 0.5)
  gradient.addColorStop(0, cfg.gradient[0])
  gradient.addColorStop(0.45, cfg.gradient[1])
  gradient.addColorStop(1, cfg.gradient[2])
  ctx.fillStyle = gradient

  cfg.draw(ctx, CACHE_SIZE)
  return canvas
}

// 创建所有花瓣数据
function createPetals(mobile) {
  const layers = [
    { count: mobile ? 5 : 10, minSize: 8,  maxSize: 14, minSpeed: 0.4, maxSpeed: 0.7, minDrift: 0.02, maxDrift: 0.06, opacity: [0.15, 0.35] },
    { count: mobile ? 8 : 16, minSize: 14, maxSize: 22, minSpeed: 0.7, maxSpeed: 1.2, minDrift: 0.04, maxDrift: 0.12, opacity: [0.35, 0.6]  },
    { count: mobile ? 5 : 9,  minSize: 20, maxSize: 32, minSpeed: 1.1, maxSpeed: 1.8, minDrift: 0.06, maxDrift: 0.2,  opacity: [0.5, 0.85]  },
  ]

  const h = window.innerHeight
  const w = window.innerWidth
  const petals = []
  let id = 0

  layers.forEach((layer) => {
    for (let i = 0; i < layer.count; i++) {
      petals.push({
        id: id++,
        type: Math.floor(Math.random() * 3),
        x: Math.random() * w,
        y: Math.random() * h * 1.3 - h * 0.15, // 随机分布在屏幕各处
        size: layer.minSize + Math.random() * (layer.maxSize - layer.minSize),
        speedY: layer.minSpeed + Math.random() * (layer.maxSpeed - layer.minSpeed),
        driftX: (Math.random() > 0.5 ? 1 : -1) * (layer.minDrift + Math.random() * (layer.maxDrift - layer.minDrift)),
        rotation: Math.random() * Math.PI * 2,
        spinSpeed: (Math.random() > 0.5 ? 1 : -1) * (0.003 + Math.random() * 0.025),
        opacity: layer.opacity[0] + Math.random() * (layer.opacity[1] - layer.opacity[0]),
        swayAmp: 8 + Math.random() * 42,
        swaySpeed: 0.8 + Math.random() * 2.2,
        swayPhase: Math.random() * Math.PI * 2,
      })
    }
  })
  return petals
}

// --- 生命周期 ---

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const mobile = isMobile()
  const petalCache = [0, 1, 2].map(i => prerenderPetal(i))
  const petals = createPetals(mobile)

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2) // 限制 DPR 避免移动端性能问题
    canvas.width = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr
    canvas.style.width = window.innerWidth + 'px'
    canvas.style.height = window.innerHeight + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  resize()
  window.addEventListener('resize', resize)

  function animate() {
    time += 1 / 60
    const w = window.innerWidth
    const h = window.innerHeight

    ctx.clearRect(0, 0, w, h)

    for (let i = 0; i < petals.length; i++) {
      const p = petals[i]

      // 更新位置
      p.y += p.speedY
      const sway = Math.sin(time * p.swaySpeed + p.swayPhase) * p.swayAmp
      p.x += p.driftX + sway * 0.03
      p.rotation += p.spinSpeed

      // 超出底部 — 回收到顶部
      if (p.y > h + p.size * 2) {
        p.y = -(p.size * 2 + Math.random() * h * 0.3)
        p.x = Math.random() * w
        p.rotation = Math.random() * Math.PI * 2
      }
      // 超出左右边界 — 回绕
      if (p.x > w + p.size) p.x = -p.size
      if (p.x < -p.size) p.x = w + p.size

      // 绘制花瓣
      ctx.save()
      ctx.globalAlpha = p.opacity
      ctx.translate(p.x + sway, p.y)
      ctx.rotate(p.rotation)
      const s = p.size
      ctx.drawImage(petalCache[p.type], -s / 2, -s * 0.62, s, s * 1.25)
      ctx.restore()
    }

    animationId = requestAnimationFrame(animate)
  }

  animationId = requestAnimationFrame(animate)

  onUnmounted(() => {
    cancelAnimationFrame(animationId)
    window.removeEventListener('resize', resize)
  })
})
</script>

<template>
  <canvas ref="canvasRef" class="sakura-canvas" aria-hidden="true" />
</template>

<style scoped>
.sakura-canvas {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9998;
}
</style>
