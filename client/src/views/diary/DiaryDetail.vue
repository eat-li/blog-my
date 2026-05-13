<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { diaryApi } from '../../api'

const route = useRoute()
const diary = ref(null)
const loading = ref(true)
const currentImage = ref(0)

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
    hour: '2-digit', minute: '2-digit'
  })
}

onMounted(async () => {
  try {
    const res = await diaryApi.detail(route.params.id)
    diary.value = res.data
  } catch {
    diary.value = null
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="page diary-detail-page">
    <!-- 加载态 -->
    <template v-if="loading">
      <div class="skeleton" style="height: 300px; margin-bottom: 20px; border-radius: 12px" />
      <div class="skeleton" style="height: 40px; width: 60%; margin-bottom: 12px" />
      <div class="skeleton" style="height: 200px" />
    </template>

    <!-- 不存在 -->
    <div v-else-if="!diary" class="empty-state glass-card">
      <p>日记不存在或未公开</p>
      <router-link to="/diary" class="back-link">返回日记列表</router-link>
    </div>

    <!-- 日记内容 -->
    <template v-else>
      <!-- 图片展示 -->
      <div class="detail-gallery glass-card" v-if="diary.images?.length">
        <img :src="diary.images[currentImage]" alt="" class="gallery-main" />
        <div class="gallery-thumbs" v-if="diary.images.length > 1">
          <button
            v-for="(img, i) in diary.images"
            :key="i"
            class="gallery-thumb"
            :class="{ 'gallery-thumb--active': i === currentImage }"
            @click="currentImage = i"
          >
            <img :src="img" alt="" loading="lazy" />
          </button>
        </div>
      </div>

      <!-- 元信息 -->
      <div class="detail-header glass-card">
        <div class="detail-meta">
          <span class="detail-mood" v-if="diary.mood">{{ diary.mood }}</span>
          <span class="detail-weather" v-if="diary.weather">{{ diary.weather }}</span>
          <time class="detail-date">{{ formatDate(diary.createdAt) }}</time>
        </div>
        <h1 class="detail-title">{{ diary.title }}</h1>
      </div>

      <!-- 正文 -->
      <div class="detail-body glass-card">
        <div class="detail-content" v-html="diary.content.replace(/\n/g, '<br>')" />
      </div>

      <!-- 返回 -->
      <div class="detail-back">
        <router-link to="/diary" class="glass-btn">返回日记列表</router-link>
      </div>
    </template>
  </div>
</template>

<style scoped>
.diary-detail-page {
  max-width: 780px;
  margin: 0 auto;
}

/* 图片画廊 */
.detail-gallery {
  padding: 0;
  overflow: hidden;
  margin-bottom: 20px;
}

.gallery-main {
  width: 100%;
  max-height: 480px;
  object-fit: contain;
  background: #1a1a1a;
  display: block;
}

.gallery-thumbs {
  display: flex;
  gap: 6px;
  padding: 10px 12px;
  overflow-x: auto;
}

.gallery-thumb {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
  background: none;
  transition: border-color var(--transition-fast);
}

.gallery-thumb--active {
  border-color: var(--color-primary);
}

.gallery-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 头部 */
.detail-header {
  padding: 24px 28px;
  margin-bottom: 18px;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.detail-mood {
  font-size: 12px;
  padding: 3px 12px;
  border-radius: 999px;
  background: rgba(139, 69, 19, 0.08);
  color: var(--color-primary);
  font-weight: 500;
}

.detail-weather {
  font-size: 12px;
  padding: 3px 12px;
  border-radius: 999px;
  background: rgba(123, 168, 114, 0.08);
  color: var(--color-accent-galgame);
  font-weight: 500;
}

.detail-date {
  font-size: 13px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  margin-left: auto;
}

.detail-title {
  font-family: var(--font-serif);
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
}

/* 正文 */
.detail-body {
  padding: 28px 32px;
  margin-bottom: 18px;
}

.detail-content {
  font-size: 15px;
  line-height: 2;
  color: var(--color-text-secondary);
}

/* 返回 */
.detail-back {
  text-align: center;
  margin-top: 24px;
}

.detail-back a {
  font-size: 13px;
  padding: 8px 24px;
  text-decoration: none;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-text-muted);
  font-size: 14px;
}

.back-link {
  display: inline-block;
  margin-top: 12px;
  font-size: 13px;
  color: var(--color-primary);
  text-decoration: none;
}

@media (max-width: 768px) {
  .detail-body {
    padding: 20px;
  }

  .detail-header {
    padding: 20px;
  }

  .detail-title {
    font-size: 20px;
  }
}
</style>
