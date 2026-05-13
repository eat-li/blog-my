<script setup>
import { ref, onMounted, watch } from 'vue'
import { postApi } from '../../api'
import PostCard from '../../components/PostCard.vue'

const posts = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 10
const loading = ref(true)

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

function changePage(p) {
  page.value = p
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(fetchPosts)
watch(page, fetchPosts)

const totalPages = () => Math.ceil(total.value / pageSize) || 1
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1 class="page-title">◉ 动漫感想</h1>
      <p class="page-desc">关于动画的一切碎碎念</p>
    </div>

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
