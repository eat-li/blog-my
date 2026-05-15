<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { messageApi } from '../../api'
import { useConfirm } from '../../composables/useConfirm'

const router = useRouter()
const { alert: showAlert, confirm } = useConfirm()
const messages = ref([])
const total = ref(0)
const loading = ref(false)
const filterStatus = ref('')
const page = ref(1)
const pageSize = 15

watch(filterStatus, () => { page.value = 1; fetchMessages() })
watch(page, fetchMessages)
onMounted(fetchMessages)

async function fetchMessages() {
  loading.value = true
  try {
    const params = { page: page.value, pageSize }
    if (filterStatus.value) params.status = filterStatus.value
    const res = await messageApi.adminList(params)
    messages.value = res.messages || []
    total.value = res.total || 0
  } catch (e) {
    if (e.response?.status === 401) router.push('/admin/login')
  } finally {
    loading.value = false
  }
}

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))
function formatDate(date) {
  return new Date(date).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

async function handleReview(id, status) {
  try {
    await messageApi.review(id, status)
    fetchMessages()
  } catch (e) {
    await showAlert(e.response?.data?.message || '操作失败')
  }
}

async function handleDelete(id) {
  if (!await confirm('确定删除这条留言？')) return
  try {
    await messageApi.delete(id)
    fetchMessages()
  } catch (e) {
    await showAlert(e.response?.data?.message || '删除失败')
  }
}

const statusMap = { pending: '待审核', approved: '已通过', rejected: '已拒绝' }
const statusColor = { pending: 'var(--color-accent-article)', approved: 'var(--color-accent-galgame)', rejected: 'var(--color-accent-anime)' }
</script>

<template>
  <div class="messages-admin">
    <h2 class="page-title">留言管理</h2>

    <!-- 筛选 -->
    <div class="ma-filters">
      <button class="filter-btn glass-btn" :class="{ 'filter-btn--active': !filterStatus }" @click="filterStatus = ''">全部</button>
      <button v-for="s in ['pending', 'approved', 'rejected']" :key="s"
        class="filter-btn glass-btn" :class="{ 'filter-btn--active': filterStatus === s }"
        @click="filterStatus = s"
      >{{ statusMap[s] }}</button>
    </div>

    <!-- 加载 -->
    <div v-if="loading && !messages.length" class="ma-skeleton">
      <div v-for="i in 5" :key="i" class="skeleton" style="height:64px;margin-bottom:8px;border-radius:8px" />
    </div>

    <!-- 列表 -->
    <div v-if="!loading || messages.length" class="ma-list">
      <div v-for="msg in messages" :key="msg.id" class="ma-card glass-card">
        <div class="ma-card-top">
          <span class="ma-nickname">{{ msg.nickname }}</span>
          <span v-if="msg.email" class="ma-email">{{ msg.email }}</span>
          <span class="ma-date">{{ formatDate(msg.createdAt) }}</span>
          <span class="ma-ip">{{ msg.ip }}</span>
        </div>
        <p class="ma-content">{{ msg.content }}</p>
        <div class="ma-card-bottom">
          <span class="ma-status" :style="{ color: statusColor[msg.status] }">
            {{ statusMap[msg.status] }}
          </span>
          <div class="ma-actions" v-if="msg.status === 'pending'">
            <button class="action-btn glass-btn action-approve" @click="handleReview(msg.id, 'approved')">✓ 通过</button>
            <button class="action-btn glass-btn action-reject" @click="handleReview(msg.id, 'rejected')">✕ 拒绝</button>
          </div>
          <div class="ma-actions" v-else>
            <button class="action-btn glass-btn action-delete" @click="handleDelete(msg.id)">删除</button>
          </div>
        </div>
      </div>

      <div v-if="!messages.length" class="ma-empty glass-card">
        <p>暂无留言</p>
      </div>
    </div>

    <!-- 分页 -->
    <div class="ma-pagination" v-if="totalPages > 1">
      <button class="glass-btn" :disabled="page <= 1" @click="page--">← 上一页</button>
      <span class="page-info">{{ page }} / {{ totalPages }}</span>
      <button class="glass-btn" :disabled="page >= totalPages" @click="page++">下一页 →</button>
    </div>
  </div>
</template>

<style scoped>
.messages-admin {
  max-width: 800px;
}

.page-title {
  font-size: 22px;
  margin-bottom: 20px;
}
.page-title::after { display: none; }

.ma-filters {
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

.ma-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ma-card {
  padding: 16px 20px;
}

.ma-card-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.ma-nickname {
  font-weight: 600;
  font-size: 14px;
}

.ma-email {
  font-size: 12px;
  color: var(--color-text-muted);
}

.ma-date {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-left: auto;
}

.ma-ip {
  font-size: 11px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
}

.ma-content {
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 12px;
}

.ma-card-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ma-status {
  font-size: 13px;
  font-weight: 500;
}

.ma-actions {
  display: flex;
  gap: 6px;
}

.action-btn {
  font-size: 13px;
  padding: 8px 18px;
  min-height: 40px;
}

.action-approve:hover { color: var(--color-accent-galgame); border-color: rgba(123,168,114,0.3); }
.action-reject:hover { color: var(--color-accent-anime); border-color: rgba(232,91,91,0.3); }
.action-delete:hover { color: var(--color-accent-anime); border-color: rgba(232,91,91,0.3); }

.ma-empty {
  padding: 48px;
  text-align: center;
  color: var(--color-text-muted);
}

.ma-pagination {
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
  .ma-ip, .ma-email { display: none; }

  .ma-card {
    padding: 14px 16px;
  }

  .ma-card-bottom {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .ma-actions {
    width: 100%;
  }

  .action-btn {
    flex: 1;
    justify-content: center;
  }
}
</style>
