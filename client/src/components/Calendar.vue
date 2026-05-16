<script setup>
import { ref, computed } from 'vue'

const currentDate = new Date()
const year = ref(currentDate.getFullYear())
const month = ref(currentDate.getMonth())
const today = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`

const weekDays = ['一', '二', '三', '四', '五', '六', '日']

// 节日分类：festival=传统节日 / term=节气 / national=国家节日 / western=西方节日 / love=有爱节日
const holidayDefs = [
  // 传统农历节日
  { mmdd: '02-16', name: '除夕', type: 'festival' },
  { mmdd: '02-17', name: '春节', type: 'festival' },
  { mmdd: '03-04', name: '元宵', type: 'festival' },
  { mmdd: '06-19', name: '端午', type: 'festival' },
  { mmdd: '08-29', name: '七夕', type: 'festival' },
  { mmdd: '09-27', name: '中秋', type: 'festival' },
  { mmdd: '10-14', name: '重阳', type: 'festival' },
  // 国家节日
  { mmdd: '01-01', name: '元旦', type: 'national' },
  { mmdd: '04-05', name: '清明', type: 'national' },
  { mmdd: '05-01', name: '劳动节', type: 'national' },
  { mmdd: '05-04', name: '青年节', type: 'national' },
  { mmdd: '06-01', name: '儿童节', type: 'national' },
  { mmdd: '07-01', name: '建党节', type: 'national' },
  { mmdd: '08-01', name: '建军节', type: 'national' },
  { mmdd: '09-10', name: '教师节', type: 'national' },
  { mmdd: '10-01', name: '国庆节', type: 'national' },
  // 西方节日
  { mmdd: '02-14', name: '情人节', type: 'western' },
  { mmdd: '04-01', name: '愚人节', type: 'western' },
  { mmdd: '10-31', name: '万圣节', type: 'western' },
  { mmdd: '12-24', name: '平安夜', type: 'western' },
  { mmdd: '12-25', name: '圣诞节', type: 'western' },
  { mmdd: '12-31', name: '跨年夜', type: 'western' },
  // 节气
  { mmdd: '02-04', name: '立春', type: 'term' },
  { mmdd: '02-19', name: '雨水', type: 'term' },
  { mmdd: '03-05', name: '惊蛰', type: 'term' },
  { mmdd: '03-20', name: '春分', type: 'term' },
  { mmdd: '04-05', name: '清明', type: 'term' },
  { mmdd: '04-20', name: '谷雨', type: 'term' },
  { mmdd: '05-05', name: '立夏', type: 'term' },
  { mmdd: '05-21', name: '小满', type: 'term' },
  { mmdd: '06-05', name: '芒种', type: 'term' },
  { mmdd: '06-21', name: '夏至', type: 'term' },
  { mmdd: '07-07', name: '小暑', type: 'term' },
  { mmdd: '07-22', name: '大暑', type: 'term' },
  { mmdd: '08-07', name: '立秋', type: 'term' },
  { mmdd: '08-23', name: '处暑', type: 'term' },
  { mmdd: '09-07', name: '白露', type: 'term' },
  { mmdd: '09-22', name: '秋分', type: 'term' },
  { mmdd: '10-08', name: '寒露', type: 'term' },
  { mmdd: '10-23', name: '霜降', type: 'term' },
  { mmdd: '11-07', name: '立冬', type: 'term' },
  { mmdd: '11-22', name: '小雪', type: 'term' },
  { mmdd: '12-07', name: '大雪', type: 'term' },
  { mmdd: '12-21', name: '冬至', type: 'term' },
  { mmdd: '01-05', name: '小寒', type: 'term' },
  { mmdd: '01-20', name: '大寒', type: 'term' },
]

// 建立快速查找
const holidayMap = new Map()
holidayDefs.forEach(h => holidayMap.set(h.mmdd, h))

// 可变节日
function findMotherDay(y) {
  const first = new Date(y, 4, 1)
  const d = (7 - first.getDay()) % 7 + 8
  return { mmdd: `05-${String(d).padStart(2, '0')}`, name: '母亲节', type: 'love' }
}
function findFatherDay(y) {
  const first = new Date(y, 5, 1)
  const d = (7 - first.getDay()) % 7 + 15
  return { mmdd: `06-${String(d).padStart(2, '0')}`, name: '父亲节', type: 'love' }
}
function findThanksgiving(y) {
  const first = new Date(y, 10, 1)
  const d = (11 - first.getDay()) % 7 + 22
  return { mmdd: `11-${String(d).padStart(2, '0')}`, name: '感恩节', type: 'western' }
}

function getHoliday(dateStr) {
  const mmdd = dateStr.slice(5)
  const y = parseInt(dateStr.slice(0, 4))
  // 先查固定
  if (holidayMap.has(mmdd)) return holidayMap.get(mmdd)
  // 可变节日
  const mother = findMotherDay(y)
  if (mmdd === mother.mmdd) return mother
  const father = findFatherDay(y)
  if (mmdd === father.mmdd) return father
  const thanks = findThanksgiving(y)
  if (mmdd === thanks.mmdd) return thanks
  return null
}

const days = computed(() => {
  const y = year.value
  const m = month.value
  const firstDay = new Date(y, m, 1).getDay()
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const daysInPrevMonth = new Date(y, m, 0).getDate()
  const offset = (firstDay + 6) % 7
  const cells = []

  for (let i = offset - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i
    const pm = m === 0 ? 11 : m - 1
    const py = m === 0 ? y - 1 : y
    cells.push({ num: d, date: `${py}-${String(pm + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, otherMonth: true })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const h = getHoliday(dateStr)
    cells.push({
      num: d, date: dateStr, otherMonth: false,
      isToday: dateStr === today,
      holiday: h,
    })
  }

  const remaining = (7 - cells.length % 7) % 7
  for (let d = 1; d <= remaining; d++) {
    const nm = m === 11 ? 0 : m + 1
    const ny = m === 11 ? y + 1 : y
    cells.push({ num: d, date: `${ny}-${String(nm + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, otherMonth: true })
  }

  return cells
})

const monthLabel = computed(() => `${year.value}年 ${month.value + 1}月`)

function prevMonth() {
  if (month.value === 0) { month.value = 11; year.value-- }
  else month.value--
}
function nextMonth() {
  if (month.value === 11) { month.value = 0; year.value++ }
  else month.value++
}

const upcoming = computed(() => {
  const todayFull = today
  const candidates = []

  for (let m = month.value; m < month.value + 6; m++) {
    const realM = m % 12
    const realY = year.value + Math.floor(m / 12)
    for (let d = 1; d <= 31; d++) {
      const dateStr = `${realY}-${String(realM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      if (dateStr < todayFull) continue
      const h = getHoliday(dateStr)
      if (h) {
        candidates.push({ date: dateStr, ...h })
        break // 每个月只取第一个节日
      }
    }
  }

  candidates.sort((a, b) => a.date.localeCompare(b.date))
  if (!candidates.length) return null
  const next = candidates[0]
  const daysLeft = Math.ceil((new Date(next.date) - new Date(todayFull)) / 86400000)
  return { ...next, daysLeft }
})
</script>

<template>
  <div class="sidebar-card glass-card calendar-card">
    <div class="cal-header">
      <button class="cal-nav" @click="prevMonth" aria-label="上个月">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h3 class="cal-title">{{ monthLabel }}</h3>
      <button class="cal-nav" @click="nextMonth" aria-label="下个月">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>

    <div class="cal-weekdays">
      <span v-for="wd in weekDays" :key="wd" class="cal-weekday">{{ wd }}</span>
    </div>

    <div class="cal-grid">
      <div
        v-for="(day, i) in days"
        :key="i"
        class="cal-day"
        :class="{
          'cal-day--other': day.otherMonth,
          'cal-day--today': day.isToday,
          'cal-day--has-holiday': day.holiday && !day.otherMonth,
          [`cal-day--type-${day.holiday?.type}`]: day.holiday && !day.otherMonth,
        }"
        :title="day.holiday ? day.holiday.name : ''"
      >
        <span class="cal-day-num">{{ day.num }}</span>
        <span v-if="day.holiday && !day.otherMonth" class="cal-day-holiday">{{ day.holiday.name }}</span>
      </div>
    </div>

    <!-- 最近节日 -->
    <div v-if="upcoming" class="cal-upcoming">
      <svg class="cal-upcoming-dot" width="8" height="8" viewBox="0 0 8 8">
        <circle cx="4" cy="4" r="3" fill="currentColor"/>
      </svg>
      <span class="cal-upcoming-label">最近节日</span>
      <span class="cal-upcoming-name" :class="`cal-upcoming-name--${upcoming.type}`">{{ upcoming.name }}</span>
      <span class="cal-upcoming-days">{{ upcoming.daysLeft === 0 ? '就是今天' : `${upcoming.daysLeft} 天后` }}</span>
    </div>
  </div>
</template>

<style scoped>
.calendar-card {
  padding: 18px 20px;
}

.cal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.cal-title {
  font-family: var(--font-serif);
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.cal-nav {
  width: 28px;
  height: 28px;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  background: var(--glass-bg);
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  padding: 0;
}

.cal-nav:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
  background: var(--glass-bg-hover);
}

.cal-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 6px;
}

.cal-weekday {
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
  padding: 6px 0;
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.cal-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  cursor: default;
  transition: all var(--transition-fast);
  min-height: 36px;
}

.cal-day:hover {
  background: rgba(139, 69, 19, 0.06);
}

.cal-day--other {
  opacity: 0.25;
  pointer-events: none;
}

.cal-day--today {
  background: var(--color-primary);
}

.cal-day--today .cal-day-num {
  color: #fff;
  font-weight: 700;
}

.cal-day-num {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-text);
  line-height: 1;
}

/* 节日文字 — 按分类着色 */
.cal-day-holiday {
  font-size: 9px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  line-height: 1.2;
  text-align: center;
  margin-top: 1px;
}

.cal-day--type-festival .cal-day-holiday {
  color: var(--color-accent-anime);
}

.cal-day--type-national .cal-day-holiday {
  color: var(--color-accent-article);
}

.cal-day--type-western .cal-day-holiday {
  color: var(--color-text-muted);
}

.cal-day--type-love .cal-day-holiday {
  color: #D4677A;
}

.cal-day--type-term .cal-day-holiday {
  color: var(--color-accent-galgame);
}

/* 今天 + 节日的处理 */
.cal-day--today .cal-day-holiday {
  color: rgba(255, 255, 255, 0.85);
}

/* 节日日期微背景 */
.cal-day--has-holiday:not(.cal-day--today) {
  background: rgba(139, 69, 19, 0.04);
}

/* 最近节日 */
.cal-upcoming {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(139, 69, 19, 0.08);
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.cal-upcoming-dot {
  color: var(--color-primary);
  flex-shrink: 0;
}

.cal-upcoming-label {
  font-size: 11px;
  color: var(--color-text-muted);
}

.cal-upcoming-name {
  font-size: 13px;
  font-weight: 600;
}

.cal-upcoming-name--festival { color: var(--color-accent-anime); }
.cal-upcoming-name--national { color: var(--color-accent-article); }
.cal-upcoming-name--western { color: var(--color-text-muted); }
.cal-upcoming-name--love { color: #D4677A; }
.cal-upcoming-name--term { color: var(--color-accent-galgame); }

.cal-upcoming-days {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-left: auto;
}
</style>
