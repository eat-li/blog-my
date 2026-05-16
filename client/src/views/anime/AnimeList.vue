<script setup>
import { ref, onMounted, watch } from 'vue'
import { postApi, tagApi } from '../../api'
import PostCard from '../../components/PostCard.vue'
import Calendar from '../../components/Calendar.vue'
import TimeProgress from '../../components/TimeProgress.vue'

const posts = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 10
const loading = ref(true)

// 侧边栏数据
const randomPosts = ref([])
const tags = ref([])
const randomLoading = ref(false)

const typeColor = {
  article: 'var(--color-accent-article)',
  anime: 'var(--color-accent-anime)',
  galgame: 'var(--color-accent-galgame)',
}
const typeRoute = { article: 'articles', anime: 'anime', galgame: 'galgame' }

async function fetchPosts() {
  loading.value = true
  try {
    const res = await postApi.list({ type: 'anime', page: page.value, pageSize })
    posts.value = res.posts || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

async function fetchRandomPosts() {
  randomLoading.value = true
  try {
    const res = await postApi.list({ type: 'anime', pageSize: 5, random: 'true' })
    randomPosts.value = res.posts || []
  } catch (e) { /* ignore */ } finally {
    randomLoading.value = false
  }
}

async function fetchTags() {
  try {
    const res = await tagApi.list()
    tags.value = res.tags || res || []
  } catch (e) { /* ignore */ }
}

function changePage(p) {
  page.value = p
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function linkOf(post) {
  return `/${typeRoute[post.type] || 'anime'}/${post.id}`
}

onMounted(() => {
  fetchPosts()
  fetchRandomPosts()
  fetchTags()
})

watch(page, fetchPosts)

const totalPages = () => Math.ceil(total.value / pageSize) || 1
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1 class="page-title">◉ 动漫感想</h1>
      <p class="page-desc">关于动画的一切碎碎念</p>
    </div>

    <div class="list-layout">
      <div class="list-main">
        <div v-if="loading" class="card-grid">
          <div v-for="i in 4" :key="i" class="skeleton" style="height: 200px" />
        </div>

        <div v-else-if="posts.length" class="card-grid">
          <PostCard v-for="post in posts" :key="post.id" :post="post" />
        </div>

        <div v-else class="empty-state">
          <span class="empty-icon">📺</span>
          <p>这个区域还没有剧情触发… 等待主人公到来 ✨</p>
        </div>

        <div class="pagination" v-if="totalPages() > 1">
          <button class="page-btn glass-btn" :disabled="page <= 1" @click="changePage(page - 1)">← 上一页</button>
          <span class="page-info">{{ page }} / {{ totalPages() }}</span>
          <button class="page-btn glass-btn" :disabled="page >= totalPages()" @click="changePage(page + 1)">下一页 →</button>
        </div>
      </div>

      <aside class="list-sidebar">
        <div class="sidebar-card glass-card">
          <h3 class="sidebar-title">✦ 随机推荐</h3>
          <div class="random-list" :class="{ 'is-loading': randomLoading }">
            <router-link
              v-for="post in randomPosts"
              :key="post.id"
              :to="linkOf(post)"
              class="random-item"
            >
              <span class="random-dot" :style="{ background: typeColor[post.type] }" />
              <span class="random-text">{{ post.title }}</span>
            </router-link>
          </div>
          <button class="refresh-btn" @click="fetchRandomPosts" :disabled="randomLoading">
            {{ randomLoading ? '...' : '↻ 换一批' }}
          </button>
        </div>

        <div class="sidebar-card glass-card" v-if="tags.length">
          <h3 class="sidebar-title">✦ 标签云</h3>
          <div class="tag-cloud">
            <router-link
              v-for="tag in tags"
              :key="tag.id"
              :to="`/tags/${tag.id}`"
              class="tag-cloud-item"
            >#{{ tag.name }}</router-link>
          </div>
        </div>

        <Calendar />
        <TimeProgress />
      </aside>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-desc {
  color: var(--color-text-muted);
  font-size: 15px;
  margin-top: 8px;
}

.list-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 24px;
  max-width: 1060px;
  margin: 0 auto;
}

.list-main {
  min-width: 0;
}

.card-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 40px;
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

.list-sidebar {
  position: sticky;
  top: 80px;
  align-self: start;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-card {
  padding: 20px;
}

.sidebar-card:hover {
  transform: none;
}

.sidebar-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: 14px;
  font-family: var(--font-sans);
}

.random-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  transition: opacity 0.2s ease;
}

.random-list.is-loading {
  opacity: 0.4;
}

.random-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: var(--color-text-secondary);
  font-size: 13px;
  transition: all var(--transition-fast);
}

.random-item:hover {
  background: rgba(139, 69, 19, 0.05);
  color: var(--color-text);
}

.random-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.random-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.refresh-btn {
  display: block;
  width: 100%;
  margin-top: 10px;
  padding: 6px;
  font-size: 12px;
  font-family: var(--font-sans);
  color: var(--color-text-muted);
  background: none;
  border: 1px dashed var(--glass-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.refresh-btn:hover:not(:disabled) {
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: wait;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-cloud-item {
  display: inline-block;
  padding: 3px 10px;
  font-size: 12px;
  color: var(--color-text-secondary);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-full);
  text-decoration: none;
  transition: all var(--transition-base);
}

.tag-cloud-item:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

@media (max-width: 1024px) {
  .list-layout {
    grid-template-columns: 1fr;
  }

  .list-sidebar {
    position: static;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .card-grid {
    gap: 12px;
  }

  .list-sidebar {
    grid-template-columns: 1fr;
  }
}
</style>
