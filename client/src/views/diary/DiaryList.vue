<script setup>
import { ref, onMounted, watch } from 'vue'
import { diaryApi } from '../../api'

const diaries = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 10
const loading = ref(true)
const selectedMood = ref('')

const moodOptions = [
  { value: '', label: '全部心情' },
  { value: '开心', label: '开心' },
  { value: '平静', label: '平静' },
  { value: '难过', label: '难过' },
  { value: '兴奋', label: '兴奋' },
  { value: '怀旧', label: '怀旧' },
  { value: '思考', label: '思考' },
  { value: '感恩', label: '感恩' },
]

const weatherLabels = {
  '晴': '晴', '多云': '多云', '阴': '阴', '雨': '雨', '雪': '雪', '风': '风'
}

async function fetchDiaries() {
  loading.value = true
  try {
    const params = { page: page.value, limit: pageSize }
    if (selectedMood.value) params.mood = selectedMood.value
    const res = await diaryApi.list(params)
    const data = res.data
    diaries.value = data?.list || []
    total.value = data?.total || 0
  } catch {
    // 静默处理
  } finally {
    loading.value = false
  }
}

function changeMood(mood) {
  selectedMood.value = mood
  page.value = 1
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

const totalPages = () => Math.max(1, Math.ceil(total.value / pageSize)) || 1

onMounted(fetchDiaries)
watch(page, fetchDiaries)
watch(selectedMood, fetchDiaries)
</script>

<template>
  <div class="page diary-list-page">
    <div class="page-header">
      <h1 class="page-title">日记心情</h1>
      <p class="page-desc">记录日常的点点滴滴，每一刻都值得被铭记</p>
    </div>

    <!-- 心情筛选 -->
    <div class="mood-filter">
      <button
        v-for="m in moodOptions"
        :key="m.value"
        class="glass-btn mood-btn"
        :class="{ 'mood-btn--active': selectedMood === m.value }"
        @click="changeMood(m.value)"
      >{{ m.label }}</button>
    </div>

    <!-- 加载态 -->
    <div v-if="loading" class="diary-grid">
      <div v-for="i in 4" :key="i" class="skeleton" style="height: 220px; border-radius: 12px" />
    </div>

    <!-- 日记列表 -->
    <div v-else-if="diaries.length" class="diary-grid">
      <router-link
        v-for="diary in diaries"
        :key="diary.id"
        :to="`/diary/${diary.id}`"
        class="diary-card glass-card"
      >
        <!-- 缩略图 -->
        <div class="diary-thumb" v-if="diary.images?.length">
          <img :src="diary.images[0]" alt="" loading="lazy" />
          <span class="thumb-count" v-if="diary.images.length > 1">+{{ diary.images.length - 1 }}</span>
        </div>

        <div class="diary-body">
          <div class="diary-tags">
            <span class="diary-mood" v-if="diary.mood">{{ diary.mood }}</span>
            <span class="diary-weather" v-if="diary.weather">{{ diary.weather }}</span>
          </div>
          <h3 class="diary-title">{{ diary.title }}</h3>
          <p class="diary-excerpt">{{ diary.content.slice(0, 120) }}{{ diary.content.length > 120 ? '...' : '' }}</p>
          <time class="diary-date">{{ formatDate(diary.createdAt) }}</time>
        </div>
      </router-link>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state glass-card">
      <p>还没有日记，先记录下今天的心情吧</p>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="totalPages() > 1">
      <button class="page-btn glass-btn" :disabled="page <= 1" @click="page--">上一页</button>
      <span class="page-info">{{ page }} / {{ totalPages() }}</span>
      <button class="page-btn glass-btn" :disabled="page >= totalPages()" @click="page++">下一页</button>
    </div>
  </div>
</template>

<style scoped>
.diary-list-page {
  max-width: 860px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 24px;
}

.page-desc {
  color: var(--color-text-muted);
  font-size: 14px;
  margin-top: 6px;
}

/* 心情筛选 */
.mood-filter {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-bottom: 28px;
}

.mood-btn {
  font-size: 13px;
  padding: 6px 18px;
}

.mood-btn--active {
  background: rgba(139, 69, 19, 0.1);
  border-color: var(--color-primary);
  color: var(--color-primary);
  font-weight: 600;
}

/* 日记网格 */
.diary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-bottom: 24px;
}

.diary-card {
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  padding: 0;
  transition: all var(--transition-base);
}

.diary-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--glass-shadow-hover);
}

/* 缩略图 */
.diary-thumb {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
  background: var(--glass-bg);
}

.diary-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-count {
  position: absolute;
  right: 10px;
  bottom: 10px;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  backdrop-filter: blur(4px);
}

/* 卡片内容 */
.diary-body {
  padding: 18px 20px;
}

.diary-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.diary-mood,
.diary-weather {
  font-size: 11px;
  padding: 2px 10px;
  border-radius: 999px;
  font-weight: 500;
}

.diary-mood {
  background: rgba(139, 69, 19, 0.08);
  color: var(--color-primary);
}

.diary-weather {
  background: rgba(123, 168, 114, 0.08);
  color: var(--color-accent-galgame);
}

.diary-title {
  font-family: var(--font-serif);
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.diary-excerpt {
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 12px;
}

.diary-date {
  font-size: 12px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-text-muted);
  font-size: 14px;
}

/* 分页 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 28px;
}

.page-btn {
  padding: 8px 20px;
  font-size: 13px;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

.page-info {
  font-family: var(--font-mono);
  font-size: 14px;
  color: var(--color-text-muted);
}

@media (max-width: 768px) {
  .diary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
