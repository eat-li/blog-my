<script setup>
import { ref, onMounted, computed } from 'vue'
import { statsApi } from '../api'

const report = ref(null)
const loading = ref(true)
const error = ref(null)
const selectedYear = ref(new Date().getFullYear())

const yearlyData = computed(() => report.value || {})
const hasData = computed(() => {
  const d = yearlyData.value
  return d && (d.total_posts || d.total_words || d.monthly?.length)
})

async function fetchReport() {
  loading.value = true
  try {
    const res = await statsApi.yearly(selectedYear.value)
    report.value = res.data || res
  } catch (e) {
    error.value = '无法获取年度报告数据'
  } finally {
    loading.value = false
  }
}

function changeYear(dir) {
  selectedYear.value += dir
  fetchReport()
}

function maxMonthlyCount() {
  if (!yearlyData.value.monthly) return 1
  return Math.max(...yearlyData.value.monthly.map(m => m.count), 1)
}

onMounted(fetchReport)
</script>

<template>
  <div class="page yearly-report">
    <div class="page-header">
      <h1 class="page-title">📊 年度报告</h1>
      <div class="year-switcher">
        <button class="year-btn glass-btn" @click="changeYear(-1)">←</button>
        <span class="year-label">{{ selectedYear }}</span>
        <button class="year-btn glass-btn" :disabled="selectedYear >= new Date().getFullYear()" @click="changeYear(1)">→</button>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="report-skeleton">
      <div class="skeleton" style="height: 120px; margin-bottom: 24px" />
      <div class="skeleton" style="height: 200px; margin-bottom: 24px" />
      <div class="skeleton" style="height: 160px" />
    </div>

    <!-- 错误 -->
    <div v-else-if="error" class="empty-state">
      <span class="empty-icon">📊</span>
      <p>{{ error }}</p>
    </div>

    <!-- 没有数据 -->
    <div v-else-if="!hasData" class="empty-state">
      <span class="empty-icon">📭</span>
      <p>{{ selectedYear }} 年还没有数据… 赶紧写点什么吧 ✨</p>
    </div>

    <template v-else>
      <!-- 概览卡片 -->
      <div class="overview-cards">
        <div class="overview-card glass-card">
          <span class="overview-icon">📝</span>
          <span class="overview-value">{{ yearlyData.total_posts || 0 }}</span>
          <span class="overview-label">篇内容</span>
        </div>
        <div class="overview-card glass-card">
          <span class="overview-icon">✏️</span>
          <span class="overview-value">{{ (yearlyData.total_words || 0).toLocaleString() }}</span>
          <span class="overview-label">字</span>
        </div>
        <div class="overview-card glass-card">
          <span class="overview-icon">👁️</span>
          <span class="overview-value">{{ (yearlyData.total_views || 0).toLocaleString() }}</span>
          <span class="overview-label">次阅读</span>
        </div>
        <div class="overview-card glass-card">
          <span class="overview-icon">⭐</span>
          <span class="overview-value">{{ yearlyData.avg_rating || '--' }}</span>
          <span class="overview-label">平均评分</span>
        </div>
      </div>

      <!-- 月度分布 -->
      <div class="section-block glass-card" v-if="yearlyData.monthly?.length">
        <h3 class="section-title">📈 月度发布趋势</h3>
        <div class="monthly-chart">
          <div
            v-for="m in yearlyData.monthly"
            :key="m.month"
            class="chart-bar-wrapper"
          >
            <span class="chart-value">{{ m.count }}</span>
            <div class="chart-bar">
              <div
                class="chart-bar-fill"
                :style="{ height: (m.count / maxMonthlyCount() * 100) + '%' }"
              />
            </div>
            <span class="chart-label">{{ m.month }}月</span>
          </div>
        </div>
      </div>

      <!-- 年度之最 -->
      <div class="section-block glass-card" v-if="yearlyData.most_viewed || yearlyData.best_rated_anime || yearlyData.best_rated_galgame">
        <h3 class="section-title">🏆 年度之最</h3>
        <div class="best-list">
          <div class="best-item" v-if="yearlyData.most_viewed">
            <span class="best-tag">最受欢迎</span>
            <span class="best-title">{{ yearlyData.most_viewed.title }}</span>
            <span class="best-stat">👁️ {{ (yearlyData.most_viewed.views || 0).toLocaleString() }}</span>
          </div>
          <div class="best-item" v-if="yearlyData.best_rated_anime">
            <span class="best-tag">评分最高动漫</span>
            <span class="best-title">{{ yearlyData.best_rated_anime.title }}</span>
            <span class="best-stat">★ {{ yearlyData.best_rated_anime.rating }}/10</span>
          </div>
          <div class="best-item" v-if="yearlyData.best_rated_galgame">
            <span class="best-tag">评分最高 Galgame</span>
            <span class="best-title">{{ yearlyData.best_rated_galgame.title }}</span>
            <span class="best-stat">★ {{ yearlyData.best_rated_galgame.rating }}/10</span>
          </div>
          <div class="best-item" v-if="yearlyData.longest_post">
            <span class="best-tag">最长单篇</span>
            <span class="best-title">{{ yearlyData.longest_post.title }}</span>
            <span class="best-stat">{{ (yearlyData.longest_post.word_count || 0).toLocaleString() }} 字</span>
          </div>
        </div>
      </div>

      <!-- 类型分布 -->
      <div class="section-block glass-card" v-if="yearlyData.type_distribution">
        <h3 class="section-title">📊 类型分布</h3>
        <div class="type-bars">
          <div class="type-bar-item">
            <span class="type-bar-label">✎ 文章</span>
            <div class="type-bar-track">
              <div class="type-bar-fill article" :style="{ width: (yearlyData.type_distribution.article / (yearlyData.total_posts || 1) * 100) + '%' }" />
            </div>
            <span class="type-bar-value">{{ yearlyData.type_distribution.article || 0 }}</span>
          </div>
          <div class="type-bar-item">
            <span class="type-bar-label">◉ 动漫</span>
            <div class="type-bar-track">
              <div class="type-bar-fill anime" :style="{ width: (yearlyData.type_distribution.anime / (yearlyData.total_posts || 1) * 100) + '%' }" />
            </div>
            <span class="type-bar-value">{{ yearlyData.type_distribution.anime || 0 }}</span>
          </div>
          <div class="type-bar-item">
            <span class="type-bar-label">◈ Galgame</span>
            <div class="type-bar-track">
              <div class="type-bar-fill galgame" :style="{ width: (yearlyData.type_distribution.galgame / (yearlyData.total_posts || 1) * 100) + '%' }" />
            </div>
            <span class="type-bar-value">{{ yearlyData.type_distribution.galgame || 0 }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.yearly-report {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.year-switcher {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 12px;
}

.year-btn {
  padding: 6px 14px;
  font-size: 14px;
}

.year-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  transform: none;
}

.year-label {
  font-family: var(--font-mono);
  font-size: 28px;
  font-weight: 900;
  color: var(--color-primary);
}

.report-skeleton {
  padding: 20px 0;
}

/* 概览卡片 */
.overview-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.overview-card {
  padding: 24px 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.overview-icon {
  font-size: 28px;
}

.overview-value {
  font-family: var(--font-mono);
  font-size: 24px;
  font-weight: 900;
  color: var(--color-text);
}

.overview-label {
  font-size: 13px;
  color: var(--color-text-muted);
}

/* 通用区块 */
.section-block {
  padding: 28px 32px;
  margin-bottom: 24px;
}

.section-title {
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 24px;
}

/* 月度图表 */
.monthly-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 4px;
  height: 200px;
  padding-top: 16px;
}

.chart-bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.chart-value {
  font-size: 11px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  margin-bottom: 4px;
}

.chart-bar {
  flex: 1;
  width: 100%;
  max-width: 40px;
  display: flex;
  align-items: flex-end;
  background: rgba(139, 69, 19, 0.04);
  border-radius: 4px 4px 0 0;
  overflow: hidden;
}

.chart-bar-fill {
  width: 100%;
  background: linear-gradient(180deg, var(--color-primary), var(--color-accent-article));
  border-radius: 4px 4px 0 0;
  min-height: 2px;
  transition: height 0.5s ease;
}

.chart-label {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 6px;
}

/* 年度之最 */
.best-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.best-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--glass-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
}

.best-tag {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  background: rgba(139, 69, 19, 0.08);
  color: var(--color-primary);
  font-weight: 600;
  flex-shrink: 0;
}

.best-title {
  flex: 1;
  font-size: 14px;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.best-stat {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

/* 类型分布 */
.type-bars {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.type-bar-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.type-bar-label {
  width: 90px;
  font-size: 13px;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.type-bar-track {
  flex: 1;
  height: 8px;
  background: rgba(139, 69, 19, 0.05);
  border-radius: 4px;
  overflow: hidden;
}

.type-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.type-bar-fill.article { background: var(--color-accent-article); }
.type-bar-fill.anime { background: var(--color-accent-anime); }
.type-bar-fill.galgame { background: var(--color-accent-galgame); }

.type-bar-value {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--color-text-muted);
  width: 24px;
  text-align: right;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--color-text-muted);
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .section-block {
    padding: 20px;
  }

  .monthly-chart {
    height: 140px;
  }

  .chart-bar {
    max-width: 28px;
  }

  .best-item {
    flex-wrap: wrap;
  }

  .best-title {
    flex: 100%;
    order: 3;
  }

  .type-bar-label {
    width: 70px;
    font-size: 12px;
  }
}
</style>
