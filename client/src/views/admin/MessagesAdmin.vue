<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { messageApi, configApi } from '../../api'
import { useConfirm } from '../../composables/useConfirm'

const router = useRouter()
const { alert: showAlert, confirm } = useConfirm()
const messages = ref([])
const total = ref(0)
const loading = ref(false)
const filterStatus = ref('')
const page = ref(1)
const pageSize = 15
const siteInfo = ref(null)

watch(filterStatus, () => { page.value = 1; fetchMessages() })
watch(page, fetchMessages)
onMounted(() => {
  configApi.getPublic().then(config => { siteInfo.value = config?.site_info || null }).catch(() => {})
  fetchMessages()
})

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

async function handleDeleteReply(id) {
  if (!await confirm('确定删除这条回复？')) return
  try {
    await messageApi.delete(id)
    fetchMessages()
  } catch (e) {
    await showAlert(e.response?.data?.message || '删除失败')
  }
}

const statusMap = { pending: '待审核', approved: '已通过', rejected: '已拒绝' }
const statusColor = { pending: 'var(--color-accent-article)', approved: 'var(--color-accent-galgame)', rejected: 'var(--color-accent-anime)' }

const replyTo = ref(null)
const replyContent = ref('')
const replySubmitting = ref(false)

function startReply(msg) {
  replyTo.value = msg.id
  replyContent.value = ''
}

function cancelReply() {
  replyTo.value = null
  replyContent.value = ''
}

async function handleReply() {
  if (!replyContent.value.trim()) return
  replySubmitting.value = true
  try {
    await messageApi.reply(replyTo.value, replyContent.value.trim())
    cancelReply()
    fetchMessages()
  } catch (e) {
    await showAlert(e.response?.data?.message || '回复失败')
  } finally {
    replySubmitting.value = false
  }
}
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

        <!-- 回复列表 -->
        <div class="ma-replies" v-if="msg.Messages?.length">
          <div v-for="reply in msg.Messages" :key="reply.id" class="ma-reply-item">
            <span class="ma-reply-author" :class="{ 'ma-reply-author--admin': reply.nickname === '博主' }">
              {{ reply.nickname === '博主' ? (siteInfo?.title || '博主') : reply.nickname }}
            </span>
            <span class="ma-reply-content">{{ reply.content }}</span>
            <span class="ma-reply-date">{{ formatDate(reply.createdAt) }}</span>
            <button class="ma-reply-del" @click="handleDeleteReply(reply.id)" title="删除回复">×</button>
          </div>
        </div>

        <!-- 回复表单 -->
        <div class="ma-reply-form" v-if="replyTo === msg.id">
          <textarea
            v-model="replyContent"
            class="glass-input ma-reply-input"
            placeholder="输入回复内容..."
            maxlength="500"
            rows="3"
          />
          <div class="ma-reply-actions">
            <button class="glass-btn ma-reply-submit" :disabled="replySubmitting || !replyContent.trim()" @click="handleReply">
              {{ replySubmitting ? '提交中...' : '发送回复' }}
            </button>
            <button class="glass-btn ma-reply-cancel" @click="cancelReply">取消</button>
          </div>
        </div>

        <div class="ma-card-bottom">
          <span class="ma-status" :style="{ color: statusColor[msg.status] }">
            {{ statusMap[msg.status] }}
          </span>
          <div class="ma-actions" v-if="msg.status === 'pending'">
            <button class="action-btn glass-btn action-approve" @click="handleReview(msg.id, 'approved')">✓ 通过</button>
            <button class="action-btn glass-btn action-reject" @click="handleReview(msg.id, 'rejected')">✕ 拒绝</button>
            <button class="action-btn glass-btn action-reply" @click="startReply(msg)">回复</button>
          </div>
          <div class="ma-actions" v-else>
            <button class="action-btn glass-btn action-reply" @click="startReply(msg)">回复</button>
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
.action-reply:hover { color: var(--color-primary); border-color: rgba(139,69,19,0.3); }

/* 回复列表 */
.ma-replies {
  margin: 10px 0 4px;
  padding-left: 14px;
  border-left: 2px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ma-reply-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 13px;
  flex-wrap: wrap;
}

.ma-reply-author {
  font-weight: 600;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.ma-reply-author--admin {
  color: var(--color-primary);
}

.ma-reply-content {
  color: var(--color-text-secondary);
  flex: 1;
  min-width: 0;
}

.ma-reply-date {
  font-size: 11px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  flex-shrink: 0;
}

.ma-reply-del {
  background: none;
  border: none;
  font-size: 16px;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  margin-left: auto;
  flex-shrink: 0;
  opacity: 0;
  transition: all var(--transition-fast);
}

.ma-reply-item:hover .ma-reply-del {
  opacity: 1;
}

.ma-reply-del:hover {
  color: var(--color-accent-anime);
}

/* 回复表单 */
.ma-reply-form {
  margin: 10px 0 4px;
}

.ma-reply-input {
  width: 100%;
  resize: vertical;
  min-height: 70px;
  font-family: var(--font-sans);
  margin-bottom: 8px;
}

.ma-reply-actions {
  display: flex;
  gap: 8px;
}

.ma-reply-submit {
  font-size: 13px;
  padding: 6px 18px;
}

.ma-reply-cancel {
  font-size: 13px;
  padding: 6px 14px;
  color: var(--color-text-muted);
}

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
