<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { postApi } from '../../api'

const route = useRoute()
const post = ref(null)
const loading = ref(true)
const error = ref(null)

const metadata = computed(() => post.value?.metadata || {})
const writingNote = computed(() => metadata.value?.writing_note)

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function starRating(score) {
  return '★'.repeat(Math.round(score / 2)) + '☆'.repeat(5 - Math.round(score / 2))
}

onMounted(async () => {
  try {
    const res = await postApi.detail(route.params.id)
    post.value = res.post || res
    postApi.view(route.params.id).catch(() => {})
  } catch (e) {
    error.value = '内容不存在或已被删除'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="page galgame-detail">
    <div v-if="loading" class="detail-loading">
      <div class="skeleton" style="height: 32px; width: 60%; margin-bottom: 16px" />
      <div class="skeleton" style="height: 16px; width: 40%; margin-bottom: 32px" />
      <div class="skeleton" style="height: 300px" />
    </div>

    <div v-else-if="error" class="empty-state">
      <span class="empty-icon">🎮</span>
      <p>{{ error }}</p>
      <router-link to="/galgame" class="glass-btn" style="margin-top: 16px">返回 Galgame 列表</router-link>
    </div>

    <template v-else-if="post">
      <article class="detail-main">
        <header class="detail-header">
          <span class="type-badge galgame">◈ Galgame</span>
          <h1 class="detail-title">{{ post.title }}</h1>
          <div class="detail-meta">
            <span>👁️ {{ (post.views || 0).toLocaleString() }} 次阅读</span>
            <span>{{ formatDate(post.createdAt) }}</span>
          </div>
        </header>

        <!-- 游戏信息卡 -->
        <div class="info-card glass-card" v-if="metadata.game_name || post.rating">
          <div class="info-card-row">
            <span class="info-label" v-if="metadata.game_name">🎮 游戏名</span>
            <span class="info-value" v-if="metadata.game_name">{{ metadata.game_name }}</span>
          </div>
          <div class="info-card-row" v-if="post.rating">
            <span class="info-label">⭐ 评分</span>
            <span class="info-value rating-stars">{{ starRating(post.rating) }} {{ post.rating }}/10</span>
          </div>
          <div class="info-card-row" v-if="metadata.developer">
            <span class="info-label">🏢 开发商</span>
            <span class="info-value">{{ metadata.developer }}</span>
          </div>
          <div class="info-card-row" v-if="metadata.play_hours">
            <span class="info-label">⏱️ 游玩时长</span>
            <span class="info-value">{{ metadata.play_hours }} 小时</span>
          </div>
          <div class="info-card-row" v-if="metadata.play_date">
            <span class="info-label">📅 游玩日期</span>
            <span class="info-value">{{ metadata.play_date }}</span>
          </div>
          <div class="info-card-row" v-if="metadata.platform">
            <span class="info-label">💻 平台</span>
            <span class="info-value">{{ metadata.platform }}</span>
          </div>
        </div>

        <!-- 角色列表 -->
        <div class="character-section" v-if="metadata.characters?.length">
          <h3 class="character-title">🎭 主要角色</h3>
          <div class="character-list">
            <span v-for="char in metadata.characters" :key="char" class="character-tag">{{ char }}</span>
          </div>
        </div>

        <div class="detail-cover" v-if="post.cover_image">
          <img :src="post.cover_image" :alt="post.title" />
        </div>

        <div class="detail-content prose" v-html="post.content" />

        <div class="detail-tags" v-if="post.Tags?.length">
          <router-link v-for="tag in post.Tags" :key="tag.id" :to="`/tags/${tag.id}`" class="tag-badge">#{{ tag.name }}</router-link>
        </div>

        <div class="writing-note glass-card" v-if="writingNote">
          <div class="writing-note-header">✦ 创作手记</div>
          <div class="writing-note-body">
            <div class="writing-note-meta">
              <span v-if="writingNote.mood">心情：{{ writingNote.mood }}</span>
              <span v-if="writingNote.bgm">听歌：{{ writingNote.bgm }}</span>
              <span v-if="writingNote.weather">天气：{{ writingNote.weather }}</span>
            </div>
            <p class="writing-note-text" v-if="writingNote.note">「{{ writingNote.note }}」</p>
          </div>
        </div>
      </article>

      <div class="section-divider">━─━─━─ セーブ ─━─━─━</div>

      <div class="detail-back">
        <router-link to="/galgame" class="glass-btn">← 返回 Galgame 列表</router-link>
      </div>
    </template>
  </div>
</template>

<style scoped>
.galgame-detail {
  max-width: 800px;
  margin: 0 auto;
}

.detail-loading {
  padding: 40px 0;
}

.detail-main {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: 40px 48px;
  box-shadow: var(--glass-shadow);
}

.detail-header {
  margin-bottom: 24px;
}

.detail-title {
  font-size: 32px;
  font-weight: 900;
  margin-top: 16px;
  line-height: 1.3;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
  font-size: 14px;
  color: var(--color-text-muted);
}

.info-card {
  padding: 20px 24px;
  margin-bottom: 28px;
  border-color: rgba(123, 168, 114, 0.15);
}

.info-card-row {
  display: flex;
  align-items: center;
  padding: 6px 0;
  font-size: 14px;
}

.info-card-row + .info-card-row {
  border-top: 1px solid rgba(139, 69, 19, 0.06);
}

.info-label {
  width: 110px;
  flex-shrink: 0;
  color: var(--color-text-muted);
  font-size: 13px;
}

.info-value {
  color: var(--color-text-secondary);
}

.rating-stars {
  color: #f0b400;
  font-weight: 600;
  letter-spacing: 2px;
}

/* 角色列表 */
.character-section {
  margin-bottom: 28px;
}

.character-title {
  font-family: var(--font-serif);
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--color-text);
}

.character-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.character-tag {
  padding: 4px 14px;
  font-size: 13px;
  color: var(--color-accent-galgame);
  background: rgba(123, 168, 114, 0.08);
  border: 1px solid rgba(123, 168, 114, 0.2);
  border-radius: var(--radius-full);
}

.detail-cover {
  margin-bottom: 32px;
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.detail-cover img {
  width: 100%;
  display: block;
}

.detail-content {
  font-size: 16px;
  line-height: 1.85;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid var(--glass-border);
}

.writing-note {
  margin-top: 32px;
  padding: 24px 28px;
  border-color: rgba(139, 69, 19, 0.15);
}

.writing-note-header {
  font-family: var(--font-serif);
  font-size: 15px;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 16px;
}

.writing-note-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
}

.writing-note-text {
  font-size: 14px;
  color: var(--color-text-secondary);
  font-style: italic;
  line-height: 1.7;
}

.section-divider {
  text-align: center;
  padding: 40px 0;
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--color-text-muted);
  letter-spacing: 2px;
  user-select: none;
}

.detail-back {
  text-align: center;
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
  .detail-main {
    padding: 24px 20px;
    border-radius: var(--radius-lg);
  }

  .detail-title {
    font-size: 24px;
  }

  .info-label {
    width: 90px;
  }

  .writing-note-meta {
    gap: 8px;
  }
}
</style>
