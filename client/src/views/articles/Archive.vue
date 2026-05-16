<script setup>
import { ref, computed, onMounted } from 'vue'
import { postApi } from '../../api'

const archive = ref({})
const loading = ref(true)
const expandedYears = ref(new Set())
const expandedMonths = ref(new Set())

const typeColor = {
  article: 'var(--color-accent-article)',
  anime: 'var(--color-accent-anime)',
  galgame: 'var(--color-accent-galgame)',
}

const typeLabel = { article: '文章', anime: '动漫', galgame: 'Galgame' }

const typeRoute = { article: 'articles', anime: 'anime', galgame: 'galgame' }

const yearList = computed(() =>
  Object.keys(archive.value).map(Number).sort((a, b) => b - a)
)

function monthList(year) {
  return Object.keys(archive.value[year]).map(Number).sort((a, b) => b - a)
}

function yearCount(year) {
  return Object.values(archive.value[year]).reduce((sum, posts) => sum + posts.length, 0)
}

function toggleYear(year) {
  const s = new Set(expandedYears.value)
  s.has(year) ? s.delete(year) : s.add(year)
  expandedYears.value = s
}

function toggleMonth(year, month) {
  const key = `${year}-${month}`
  const s = new Set(expandedMonths.value)
  s.has(key) ? s.delete(key) : s.add(key)
  expandedMonths.value = s
}

function linkOf(post) {
  return `/${typeRoute[post.type]}/${post.id}`
}

function formatDay(d) {
  return new Date(d).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

onMounted(async () => {
  try {
    archive.value = await postApi.archive()
    // 默认展开最新年份
    const years = Object.keys(archive.value).map(Number).sort((a, b) => b - a)
    if (years.length) {
      expandedYears.value = new Set([years[0]])
    }
  } catch { /* ignore */ }
  loading.value = false
})
</script>

<template>
  <div class="page archive-page">
    <div class="page-header">
      <h1 class="page-title">✎ 归档</h1>
      <p class="page-desc">所有已发布内容的时间线</p>
      <router-link to="/articles" class="archive-back glass-btn">← 返回文章</router-link>
    </div>

    <div v-if="loading" class="archive-loading">
      <div v-for="i in 3" :key="i" class="skeleton" style="height: 60px; margin-bottom: 12px; border-radius: 10px" />
    </div>

    <div v-else-if="yearList.length" class="archive-list">
      <div v-for="year in yearList" :key="year" class="archive-year glass-card">
        <button class="year-header" @click="toggleYear(year)">
          <span class="year-label">{{ year }}</span>
          <span class="year-count">{{ yearCount(year) }} 篇</span>
          <span class="year-arrow" :class="{ open: expandedYears.has(year) }">›</span>
        </button>

        <div v-if="expandedYears.has(year)" class="archive-months">
          <div v-for="month in monthList(year)" :key="month" class="archive-month">
            <button class="month-header" @click="toggleMonth(year, month)">
              <span class="month-label">{{ String(month).padStart(2, '0') }} 月</span>
              <span class="month-count">{{ archive[year][month].length }} 篇</span>
              <span class="month-arrow" :class="{ open: expandedMonths.has(year + '-' + month) }">›</span>
            </button>

            <Transition name="slide">
              <div v-if="expandedMonths.has(year + '-' + month)" class="archive-posts">
                <router-link
                  v-for="post in archive[year][month]"
                  :key="post.id"
                  :to="linkOf(post)"
                  class="archive-item"
                >
                  <span class="item-dot" :style="{ background: typeColor[post.type] }" />
                  <span class="item-type" :style="{ color: typeColor[post.type] }">{{ typeLabel[post.type] }}</span>
                  <span class="item-title">{{ post.title }}</span>
                  <span class="item-date">{{ formatDay(post.createdAt) }}</span>
                </router-link>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state glass-card">
      <p>还没有发布任何内容</p>
    </div>
  </div>
</template>

<style scoped>
.archive-page {
  max-width: 720px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-desc {
  color: var(--color-text-muted);
  font-size: 15px;
  margin-top: 8px;
}

.archive-back {
  display: inline-block;
  margin-top: 12px;
  font-size: 13px;
  padding: 6px 18px;
}

/* 年份块 */
.archive-year {
  padding: 0;
  margin-bottom: 16px;
  overflow: hidden;
}

.year-header {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 18px 24px;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--color-text);
  transition: background var(--transition-fast);
}

.year-header:hover {
  background: rgba(139, 69, 19, 0.04);
}

.year-label {
  font-family: var(--font-serif);
  font-size: 22px;
  font-weight: 900;
  background: linear-gradient(135deg, var(--color-text), var(--color-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.year-count {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--color-text-muted);
  margin-left: 14px;
}

.year-arrow {
  margin-left: auto;
  font-size: 22px;
  color: var(--color-text-muted);
  transition: transform 0.25s ease;
  line-height: 1;
}

.year-arrow.open {
  transform: rotate(90deg);
}

/* 月份块 */
.archive-months {
  padding: 0 24px 12px;
}

.archive-month {
  margin-bottom: 4px;
}

.month-header {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--color-text);
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}

.month-header:hover {
  background: rgba(139, 69, 19, 0.05);
}

.month-label {
  font-family: var(--font-mono);
  font-size: 15px;
  font-weight: 600;
}

.month-count {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-left: 10px;
}

.month-arrow {
  margin-left: auto;
  font-size: 16px;
  color: var(--color-text-muted);
  transition: transform 0.25s ease;
  line-height: 1;
}

.month-arrow.open {
  transform: rotate(90deg);
}

/* 文章列表 */
.archive-posts {
  padding: 4px 0 4px 12px;
}

.archive-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.archive-item:hover {
  background: rgba(139, 69, 19, 0.05);
  color: var(--color-text);
}

.item-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.item-type {
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
  min-width: 48px;
}

.item-title {
  flex: 1;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-date {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

/* 展开动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 2000px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-text-muted);
}

@media (max-width: 768px) {
  .year-header {
    padding: 14px 18px;
  }

  .year-label {
    font-size: 18px;
  }

  .archive-months {
    padding: 0 14px 10px;
  }
}
</style>
