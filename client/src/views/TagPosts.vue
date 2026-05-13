<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { postApi, tagApi } from '../api'
import PostCard from '../components/PostCard.vue'

const route = useRoute()
const posts = ref([])
const tags = ref([])
const currentTag = ref(null)
const total = ref(0)
const page = ref(1)
const pageSize = 10
const loading = ref(true)

async function fetchPosts() {
  loading.value = true
  try {
    const tagId = route.params.id
    const res = await postApi.list({ tag_id: tagId, page: page.value, pageSize })
    posts.value = res.posts || []
    total.value = res.total || 0
  } finally {
    loading.value = false
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

watch(() => route.params.id, () => {
  page.value = 1
  fetchPosts()
  const tag = tags.value.find(t => t.id == route.params.id)
  currentTag.value = tag || null
})

onMounted(async () => {
  await fetchTags()
  const tag = tags.value.find(t => t.id == route.params.id)
  currentTag.value = tag || null
  fetchPosts()
})

const totalPages = () => Math.ceil(total.value / pageSize) || 1
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1 class="page-title" v-if="currentTag">#{{ currentTag.name }}</h1>
      <h1 class="page-title" v-else>标签</h1>
      <p class="page-desc" v-if="currentTag">共 {{ total }} 篇相关内容</p>
    </div>

    <!-- 标签云 -->
    <div class="tag-cloud" v-if="tags.length">
      <router-link
        v-for="tag in tags"
        :key="tag.id"
        :to="`/tags/${tag.id}`"
        class="tag-badge tag-cloud-item"
        :class="{ 'tag-cloud-item--active': tag.id == route.params.id }"
      >#{{ tag.name }}</router-link>
    </div>

    <!-- 骨架屏 -->
    <div v-if="loading" class="card-grid">
      <div v-for="i in 4" :key="i" class="skeleton" style="height: 200px" />
    </div>

    <!-- 内容列表 -->
    <div v-else-if="posts.length" class="card-grid">
      <PostCard v-for="post in posts" :key="post.id" :post="post" />
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <span class="empty-icon">🏷️</span>
      <p>这个标签下还没有内容… 等待主人公到来 ✨</p>
    </div>

    <div class="pagination" v-if="totalPages() > 1">
      <button class="page-btn glass-btn" :disabled="page <= 1" @click="changePage(page - 1)">← 上一页</button>
      <span class="page-info">{{ page }} / {{ totalPages() }}</span>
      <button class="page-btn glass-btn" :disabled="page >= totalPages()" @click="changePage(page + 1)">下一页 →</button>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  text-align: center;
  margin-bottom: 24px;
}

.page-desc {
  color: var(--color-text-muted);
  font-size: 15px;
  margin-top: 8px;
}

.tag-cloud {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 32px;
}

.tag-cloud-item {
  font-size: 13px;
  text-decoration: none;
}

.tag-cloud-item--active {
  color: var(--color-white);
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.card-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 720px;
  margin: 0 auto;
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

@media (max-width: 768px) {
  .card-grid {
    gap: 12px;
  }
}
</style>
