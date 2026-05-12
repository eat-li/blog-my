<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const now = ref(new Date())
let timer = null

onMounted(() => {
  timer = setInterval(() => { now.value = new Date() }, 60000)
})
onUnmounted(() => clearInterval(timer))

const year = computed(() => now.value.getFullYear())
const month = computed(() => now.value.getMonth())
const date = computed(() => now.value.getDate())
const dayOfWeek = computed(() => now.value.getDay()) // 0=Sun

// 今年
const dayOfYear = computed(() => {
  const start = new Date(year.value, 0, 1)
  return Math.floor((now.value - start) / 86400000) + 1
})
const daysInYear = computed(() => {
  return (year.value % 4 === 0 && year.value % 100 !== 0) || year.value % 400 === 0 ? 366 : 365
})
const yearRemaining = computed(() => daysInYear.value - dayOfYear.value)
const yearPercent = computed(() => Math.round((dayOfYear.value / daysInYear.value) * 100))

// 本月
const daysInMonth = computed(() => new Date(year.value, month.value + 1, 0).getDate())
const monthRemaining = computed(() => daysInMonth.value - date.value)
const monthPercent = computed(() => Math.round((date.value / daysInMonth.value) * 100))

// 本周（周一为始，周日为末）
const weekDayIndex = computed(() => dayOfWeek.value === 0 ? 6 : dayOfWeek.value - 1) // 0=Mon
const weekRemaining = computed(() => 6 - weekDayIndex.value)
const weekPercent = computed(() => Math.round(((weekDayIndex.value + 1) / 7) * 100))

const items = computed(() => [
  {
    label: '今年剩余',
    remaining: yearRemaining.value,
    unit: '天',
    percent: yearPercent.value,
    color: 'var(--color-accent-article)',
    bg: 'rgba(232, 137, 91, 0.12)',
  },
  {
    label: '本月剩余',
    remaining: monthRemaining.value,
    unit: '天',
    percent: monthPercent.value,
    color: 'var(--color-accent-anime)',
    bg: 'rgba(232, 91, 91, 0.12)',
  },
  {
    label: '本周剩余',
    remaining: weekRemaining.value,
    unit: '天',
    percent: weekPercent.value,
    color: 'var(--color-accent-galgame)',
    bg: 'rgba(123, 168, 114, 0.12)',
  },
])

// 格式化剩余天数
function fmtRemaining(val, unit) {
  if (val <= 0) return '最后一天'
  if (val === 1) return `还有 1 ${unit}`
  return `还有 ${val} ${unit}`
}
</script>

<template>
  <div class="sidebar-card glass-card time-progress-card">
    <h3 class="tp-title">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="tp-title-icon">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      时间进度
    </h3>

    <div class="tp-list">
      <div v-for="item in items" :key="item.label" class="tp-item">
        <div class="tp-head">
          <span class="tp-label">{{ item.label }}</span>
          <span class="tp-remaining">{{ fmtRemaining(item.remaining, item.unit) }}</span>
        </div>
        <div class="tp-bar" :style="{ background: item.bg }">
          <div
            class="tp-bar-fill"
            :style="{ width: item.percent + '%', background: item.color }"
          />
        </div>
        <span class="tp-percent">{{ item.percent }}%</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.time-progress-card {
  padding: 18px 20px;
}

.tp-title {
  font-family: var(--font-serif);
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tp-title-icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.tp-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.tp-item {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  gap: 4px 12px;
  align-items: center;
}

.tp-head {
  display: contents;
}

.tp-label {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.tp-remaining {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-text-muted);
  text-align: right;
  white-space: nowrap;
}

.tp-bar {
  grid-column: 1;
  height: 5px;
  border-radius: 999px;
  overflow: hidden;
}

.tp-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.tp-percent {
  grid-column: 2;
  grid-row: 2;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  text-align: right;
}
</style>
