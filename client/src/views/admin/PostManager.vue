<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { postApi } from '../../api'
import { useConfirm } from '../../composables/useConfirm'

const router = useRouter()
const { alert: showAlert, confirm } = useConfirm()
const posts = ref([])
const total = ref(0)
const loading = ref(false)
const page = ref(1)
const pageSize = 10
const filterType = ref('')
const deleting = ref(null)

watch(filterType, () => { page.value = 1; fetchPosts() })
watch(page, fetchPosts)

onMounted(fetchPosts)

async function fetchPosts() {
  loading.value = true
  try {
    const params = { page: page.value, pageSize, status: 'all' }
    if (filterType.value) params.type = filterType.value
    const res = await postApi.list(params)
    posts.value = res.posts || []
    total.value = res.total || 0
  } catch (e) {
    if (e.response?.status === 401) router.push('/admin/login')
  } finally {
    loading.value = false
  }
}

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

function typeLabel(type) {
  return { article: '文章', anime: '动漫', galgame: 'Galgame' }[type] || type
}

function statusLabel(status) {
  return status === 'published' ? '已发布' : '草稿'
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

async function handleDelete(id) {
  if (!await confirm('确定删除这篇内容吗？')) return
  deleting.value = id
  try {
    await postApi.delete(id)
    fetchPosts()
  } catch (e) {
    await showAlert(e.response?.data?.message || '删除失败')
  } finally {
    deleting.value = null
  }
}
</script>

<template>
  <div class="post-manager">
    <div class="pm-header">
      <h2 class="page-title">内容管理</h2>
      <router-link to="/admin/posts/create" class="glass-btn create-btn">✎ 写新内容</router-link>
    </div>

    <!-- 筛选 -->
    <div class="pm-filters">
      <button
        class="filter-btn glass-btn"
        :class="{ 'filter-btn--active': !filterType }"
        @click="filterType = ''"
      >全部</button>
      <button
        v-for="t in ['article', 'anime', 'galgame']"
        :key="t"
        class="filter-btn glass-btn"
        :class="['filter-btn--' + t, { 'filter-btn--active': filterType === t }]"
        @click="filterType = t"
      >{{ typeLabel(t) }}</button>
    </div>

    <!-- 加载态 -->
    <div v-if="loading && !posts.length" class="pm-skeleton">
      <div v-for="i in 5" :key="i" class="skeleton" style="height:56px;margin-bottom:8px;border-radius:8px" />
    </div>

    <!-- 列表 -->
    <div v-if="!loading || posts.length" class="pm-table glass-card">
      <div class="pm-table-head">
        <span class="th-type">类型</span>
        <span class="th-title">标题</span>
        <span class="th-status">状态</span>
        <span class="th-views">浏览</span>
        <span class="th-date">更新于</span>
        <span class="th-actions">操作</span>
      </div>

      <div
        v-for="post in posts"
        :key="post.id"
        class="pm-table-row"
      >
        <span class="td-type">
          <span class="type-badge" :class="post.type">{{ typeLabel(post.type) }}</span>
        </span>
        <span class="td-title" :title="post.title">{{ post.title }}</span>
        <span class="td-status">
          <span class="status-dot" :class="post.status === 'published' ? 'dot-published' : 'dot-draft'" />
          {{ statusLabel(post.status) }}
        </span>
        <span class="td-views">{{ post.views || 0 }}</span>
        <span class="td-date">{{ formatDate(post.updatedAt || post.createdAt) }}</span>
        <span class="td-actions">
          <router-link
            :to="`/admin/posts/edit/${post.id}`"
            class="action-btn glass-btn"
          >编辑</router-link>
          <button
            class="action-btn action-btn--danger glass-btn"
            :disabled="deleting === post.id"
            @click="handleDelete(post.id)"
          >{{ deleting === post.id ? '…' : '删除' }}</button>
        </span>
      </div>

      <div v-if="!posts.length" class="pm-empty">
        <p>还没有内容，开始写第一篇吧 ✎</p>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pm-pagination" v-if="totalPages > 1">
      <button
        class="glass-btn"
        :disabled="page <= 1"
        @click="page--"
      >← 上一页</button>
      <span class="page-info">{{ page }} / {{ totalPages }}</span>
      <button
        class="glass-btn"
        :disabled="page >= totalPages"
        @click="page++"
      >下一页 →</button>
    </div>
  </div>
</template>

<style scoped>
.pm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page-title {
  font-size: 22px;
  margin-bottom: 0;
}

.page-title::after {
  display: none;
}

.create-btn {
  padding: 10px 20px;
  font-size: 14px;
}

/* 筛选 */
.pm-filters {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-btn {
  font-size: 13px;
  padding: 6px 16px;
}

.filter-btn--active {
  color: var(--color-primary);
  border-color: var(--color-primary);
  background: rgba(139, 69, 19, 0.08);
}

/* 表格 */
.pm-table {
  overflow: hidden;
}

.pm-table-head {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--glass-border);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pm-table-row {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  font-size: 14px;
  border-bottom: 1px solid rgba(139, 69, 19, 0.04);
  transition: background var(--transition-fast);
}

.pm-table-row:last-child {
  border-bottom: none;
}

.pm-table-row:hover {
  background: rgba(139, 69, 19, 0.02);
}

.th-type, .td-type { width: 90px; flex-shrink: 0; }
.th-title, .td-title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.th-status, .td-status { width: 80px; flex-shrink: 0; text-align: center; }
.th-views, .td-views { width: 60px; flex-shrink: 0; text-align: center; color: var(--color-text-muted); font-size: 13px; }
.th-date, .td-date { width: 120px; flex-shrink: 0; text-align: center; color: var(--color-text-muted); font-size: 13px; }
.th-actions, .td-actions { width: 120px; flex-shrink: 0; text-align: right; }

.td-title {
  font-weight: 500;
}

.td-actions {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}

.action-btn {
  padding: 4px 12px;
  font-size: 12px;
}

.action-btn--danger:hover {
  color: var(--color-accent-anime);
  border-color: rgba(232, 91, 91, 0.3);
}

/* 状态圆点 */
.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 4px;
}

.dot-published { background: var(--color-accent-galgame); }
.dot-draft { background: var(--color-text-muted); }

/* 空状态 */
.pm-empty {
  padding: 48px 24px;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 14px;
}

/* 分页 */
.pm-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
}

.page-info {
  font-size: 14px;
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .pm-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  .th-views, .td-views { display: none; }
  .th-date, .td-date { display: none; }
}
</style>
