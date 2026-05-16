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

// 从正文提取纯文本摘要，截断到合适长度
const excerpt = computed(() => {
  const html = props.post.content || ''
  const text = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
  if (text.length > 160) return text.slice(0, 160) + '…'
  return text
})

function formatDate(d) {
  if (!d) return ''
  const date = new Date(d)
  const now = new Date()
  const diff = now - date
  if (diff < 86400000) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  if (diff < 604800000) {
    const days = ['日', '一', '二', '三', '四', '五', '六']
    return '周' + days[date.getDay()]
  }
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}
</script>

<template>
  <router-link :to="link" class="home-post">
    <span class="home-post-dot" :style="{ background: accentColor }" />
    <div class="home-post-body">
      <div class="home-post-head">
        <span class="home-post-type" :style="{ color: accentColor }">
          {{ typeIcon[post.type] }} {{ typeLabel[post.type] }}
        </span>
        <span class="home-post-date">{{ formatDate(post.createdAt) }}</span>
      </div>
      <h3 class="home-post-title">{{ post.title }}</h3>
      <p class="home-post-excerpt">{{ excerpt }}</p>
    </div>
    <div v-if="coverSrc" class="home-post-cover">
      <img :src="coverSrc" :alt="post.title" loading="lazy" />
    </div>
  </router-link>
</template>

<style scoped>
.home-post {
  display: flex;
  gap: 14px;
  padding: 16px 20px;
  text-decoration: none;
  color: inherit;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
}

.home-post:hover {
  background: rgba(139, 69, 19, 0.04);
  border-color: var(--glass-border-hover);
  transform: translateX(4px);
}

.home-post-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 8px;
  transition: transform var(--transition-fast);
}

.home-post:hover .home-post-dot {
  transform: scale(1.6);
}

.home-post-body {
  flex: 1;
  min-width: 0;
}

.home-post-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.home-post-type {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.home-post-date {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
}

.home-post-title {
  font-family: var(--font-serif);
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
  margin-bottom: 6px;
  transition: color var(--transition-fast);
}

.home-post:hover .home-post-title {
  color: v-bind(accentColor);
}

.home-post-excerpt {
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 封面图 */
.home-post-cover {
  flex-shrink: 0;
  width: 120px;
  height: 80px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  align-self: center;
}

.home-post-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-base);
}

.home-post:hover .home-post-cover img {
  transform: scale(1.08);
}

@media (max-width: 768px) {
  .home-post {
    padding: 14px 16px;
    gap: 10px;
  }

  .home-post-title {
    font-size: 15px;
  }

  .home-post-excerpt {
    font-size: 12px;
  }

  .home-post-cover {
    width: 90px;
    height: 64px;
  }
}
</style>
