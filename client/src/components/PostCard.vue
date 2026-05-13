<script setup>
import { computed } from 'vue'

const props = defineProps({
  post: { type: Object, required: true }
})

const typeIcon = { article: '✎', anime: '◉', galgame: '◈' }
const typeLabel = { article: '文章', anime: '动漫', galgame: 'Galgame' }
const typeColor = {
  article: 'var(--color-accent-article)',
  anime: 'var(--color-accent-anime)',
  galgame: 'var(--color-accent-galgame)'
}

const link = computed(() => {
  const prefix = props.post.type === 'article' ? 'articles' : props.post.type
  return `/${prefix}/${props.post.id}`
})
const accentColor = computed(() => typeColor[props.post.type] || typeColor.article)

// 封面图：优先 cover_image，其次从内容提取第一张图片
const coverSrc = computed(() => {
  if (props.post.cover_image) return props.post.cover_image
  const match = /<img[^>]+src\s*=\s*"([^">]+)"/i.exec(props.post.content || '')
  return match?.[1] || null
})

function formatDate(d) {
  if (!d) return ''
  const date = new Date(d)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}
</script>

<template>
  <router-link :to="link" class="post-card glass-card">
    <div class="card-accent-bar" :style="{ background: accentColor }" />

    <div class="card-cover" v-if="coverSrc">
      <img :src="coverSrc" :alt="post.title" loading="lazy" />
    </div>
    <div class="card-cover card-cover--placeholder" v-else>
      <span class="cover-icon">{{ typeIcon[post.type] }}</span>
    </div>

    <div class="card-body">
      <div class="card-type-row">
        <span class="type-badge" :class="post.type">
          {{ typeIcon[post.type] }} {{ typeLabel[post.type] }}
        </span>
        <span class="card-rating" v-if="post.rating">
          ★ {{ post.rating }}
        </span>
        <span class="card-category" v-if="post.Category?.name">
          {{ post.Category.name }}
        </span>
      </div>

      <h3 class="card-title">{{ post.title }}</h3>
      <p class="card-summary" v-if="post.summary">{{ post.summary }}</p>

      <div class="card-meta">
        <span class="card-views">👁️ {{ (post.views || 0).toLocaleString() }} 次</span>
        <span class="card-date">{{ formatDate(post.createdAt) }}</span>
      </div>
    </div>
  </router-link>
</template>

<style scoped>
.post-card {
  position: relative;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  cursor: var(--cursor-sparkle-glow);
  transform: perspective(800px) rotateX(0deg) translateY(0);
  transition:
    transform var(--transition-base),
    box-shadow var(--transition-base),
    background var(--transition-base),
    border-color var(--transition-base);
}

.post-card:hover {
  transform: perspective(800px) rotateX(1deg) translateY(-6px);
  box-shadow:
    var(--glass-shadow-hover),
    0 0 30px var(--color-primary-glow);
  border-color: var(--glass-border-hover);
}

.card-accent-bar {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  opacity: 0;
  transform: scaleX(0);
  transform-origin: left;
  transition: all var(--transition-base);
}

.post-card:hover .card-accent-bar {
  opacity: 1;
  transform: scaleX(1);
}

.card-cover {
  width: 100%;
  height: 130px;
  overflow: hidden;
  flex-shrink: 0;
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-base);
}

.post-card:hover .card-cover img {
  transform: scale(1.05);
}

.card-cover--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.04), rgba(139, 69, 19, 0.08));
}

.cover-icon {
  font-size: 48px;
  opacity: 0.3;
}

.card-body {
  padding: 14px 18px 18px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-type-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.card-category {
  font-size: 12px;
  color: var(--color-text-muted);
  padding: 2px 8px;
  background: var(--glass-bg);
  border-radius: var(--radius-full);
}

.card-rating {
  font-size: 13px;
  color: #f0b400;
  font-weight: 600;
  margin-left: auto;
}

.card-title {
  font-family: var(--font-serif);
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 6px;
  line-height: 1.4;
  transition: color var(--transition-fast);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-card:hover .card-title {
  color: v-bind(accentColor);
}

.card-summary {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin-bottom: auto;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 10px;
}

.card-views {
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-date {
  font-family: var(--font-mono);
  font-size: 11px;
}

@media (max-width: 768px) {
  .card-cover {
    height: 110px;
  }

  .card-body {
    padding: 12px 14px 16px;
  }

  .card-title {
    font-size: 15px;
  }
}
</style>
