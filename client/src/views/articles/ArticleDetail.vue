<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { postApi, configApi } from '../../api'
import ArticleTOC from '../../components/ArticleTOC.vue'
import { useHighlight } from '../../composables/useHighlight'

const route = useRoute()
const post = ref(null)
const loading = ref(true)
const error = ref(null)
const tocRef = ref(null)
const siteInfo = ref({})

const writingNote = computed(() => post.value?.metadata?.writing_note)

// 渲染用的 HTML：优先使用 TOC 处理后的（已补标题 id）
const renderContent = computed(() => {
  if (tocRef.value?.enrichedHTML) return tocRef.value.enrichedHTML
  return post.value?.content || ''
})

const contentRef = ref(null)
useHighlight(contentRef, renderContent)

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

onMounted(async () => {
  try {
    const [res, config] = await Promise.all([
      postApi.detail(route.params.id),
      configApi.getPublic().catch(() => ({}))
    ])
    post.value = res.post || res
    siteInfo.value = config?.site_info || {}
    postApi.view(route.params.id).catch(() => {})
  } catch (e) {
    error.value = '内容不存在或已被删除'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="page article-detail">
    <div v-if="loading" class="detail-loading">
      <div class="skeleton" style="height: 32px; width: 60%; margin-bottom: 16px" />
      <div class="skeleton" style="height: 16px; width: 40%; margin-bottom: 32px" />
      <div class="skeleton" style="height: 300px" />
    </div>

    <div v-else-if="error" class="empty-state">
      <p>{{ error }}</p>
      <router-link to="/articles" class="glass-btn" style="margin-top: 16px">返回文章列表</router-link>
    </div>

    <template v-else-if="post">
      <!-- 双栏布局 -->
      <div class="detail-layout">
        <!-- 左侧 TOC -->
        <ArticleTOC
          ref="tocRef"
          :content="post.content"
          :avatar="siteInfo.avatar"
          :signature="siteInfo.signature"
        />

        <!-- 右侧正文 -->
        <article class="detail-main">
          <header class="detail-header">
            <span class="type-badge article">文章</span>
            <span class="detail-category" v-if="post.Category?.name">{{ post.Category.name }}</span>
            <h1 class="detail-title">{{ post.title }}</h1>
            <div class="detail-meta">
              <span>{{ (post.views || 0).toLocaleString() }} 次阅读</span>
              <span>{{ formatDate(post.createdAt) }}</span>
            </div>
          </header>

          <div class="detail-cover" v-if="post.cover_image">
            <img :src="post.cover_image" :alt="post.title" />
          </div>

          <div ref="contentRef" class="detail-content prose" v-html="renderContent" />

          <div class="detail-tags" v-if="post.Tags?.length">
            <router-link
              v-for="tag in post.Tags"
              :key="tag.id"
              :to="`/tags/${tag.id}`"
              class="tag-badge"
            >#{{ tag.name }}</router-link>
          </div>

          <div class="writing-note glass-card" v-if="writingNote">
            <div class="writing-note-header">创作手记</div>
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
      </div>

      <div class="section-divider">&#9473; &#9473; &#9473; &#9473; セーブ &#9473; &#9473; &#9473; &#9473;</div>

      <div class="detail-back">
        <router-link to="/articles" class="glass-btn">返回文章列表</router-link>
      </div>
    </template>
  </div>
</template>

<style scoped>
.article-detail {
  max-width: 1100px;
  margin: 0 auto;
}

/* 双栏布局 — TOC 固定定位，此处留出左侧空间 */
.detail-layout {
  padding-left: 252px;  /* TOC 宽度 220px + 间距 32px */
}

.detail-main {
  flex: 1;
  min-width: 0;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: 40px 48px;
  box-shadow: var(--glass-shadow);
}

.detail-loading {
  padding: 40px 0;
}

.detail-header {
  margin-bottom: 32px;
}

.detail-category {
  display: inline-block;
  font-size: 13px;
  color: var(--color-text-muted);
  background: var(--glass-bg);
  padding: 2px 10px;
  border-radius: var(--radius-full);
  margin-left: 8px;
  vertical-align: middle;
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
  color: var(--color-text);
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

@media (max-width: 1024px) {
  .article-detail {
    max-width: 800px;
  }

  .detail-layout {
    padding-left: 0;
    flex-direction: column;
    gap: 0;
  }
}

@media (max-width: 768px) {
  .detail-main {
    padding: 24px 20px;
    border-radius: var(--radius-lg);
  }

  .detail-title {
    font-size: 24px;
  }

  .writing-note-meta {
    gap: 8px;
  }
}
</style>
