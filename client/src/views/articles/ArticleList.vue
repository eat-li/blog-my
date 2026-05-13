<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { postApi, categoryApi } from '../../api'
import PostCard from '../../components/PostCard.vue'

const route = useRoute()
const posts = ref([])
const categories = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 10
const loading = ref(true)
const activeCategory = ref(null)

async function fetchPosts() {
  loading.value = true
  try {
    const params = { type: 'article', page: page.value, pageSize }
    if (activeCategory.value) params.category_id = activeCategory.value
    const res = await postApi.list(params)
    posts.value = res.posts || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

async function fetchCategories() {
  try {
    const res = await categoryApi.list()
    categories.value = res.categories || res || []
  } catch (e) { /* ignore */ }
}

function changePage(p) {
  page.value = p
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function selectCategory(id) {
  activeCategory.value = activeCategory.value === id ? null : id
  page.value = 1
}

onMounted(() => {
  fetchCategories()
  fetchPosts()
})

watch(page, fetchPosts)
watch(activeCategory, fetchPosts)

const totalPages = () => Math.ceil(total.value / pageSize) || 1
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1 class="page-title">✎ 文章</h1>
      <p class="page-desc">技术、生活与思考</p>
    </div>

    <!-- 分类筛选 -->
    <div class="category-filter" v-if="categories.length">
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="filter-btn"
        :class="{ 'filter-btn--active': activeCategory === cat.id }"
        @click="selectCategory(cat.id)"
      >
        {{ cat.name }}
      </button>
    </div>

    <!-- 骨架屏 -->
    <div v-if="loading" class="card-grid">
      <div v-for="i in 4" :key="i" class="skeleton" style="height: 200px" />
    </div>

    <!-- 文章列表 -->
    <div v-else-if="posts.length" class="card-grid">
      <PostCard v-for="post in posts" :key="post.id" :post="post" />
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <span class="empty-icon">📝</span>
      <p>这个区域还没有剧情触发… 等待主人公到来 ✨</p>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="totalPages() > 1">
      <button
        class="page-btn glass-btn"
        :disabled="page <= 1"
        @click="changePage(page - 1)"
      >← 上一页</button>
      <span class="page-info">{{ page }} / {{ totalPages() }}</span>
      <button
        class="page-btn glass-btn"
        :disabled="page >= totalPages()"
        @click="changePage(page + 1)"
      >下一页 →</button>
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

.category-filter {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 32px;
}

.filter-btn {
  padding: 6px 18px;
  font-size: 13px;
  font-family: var(--font-sans);
  color: var(--color-text-secondary);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-full);
  cursor: var(--cursor-sparkle-glow);
  transition: all var(--transition-base);
}

.filter-btn:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

.filter-btn--active {
  color: var(--color-white);
  background: var(--color-accent-article);
  border-color: var(--color-accent-article);
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
