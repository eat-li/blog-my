<script setup>
import { ref, onMounted, watch } from 'vue'
import { messageApi } from '../api'

const messages = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 10
const loading = ref(true)

const form = ref({ nickname: '', email: '', content: '' })
const submitting = ref(false)
const formError = ref('')
const formSuccess = ref(false)
const replyTo = ref(null)

async function fetchMessages() {
  loading.value = true
  try {
    const res = await messageApi.list({ page: page.value, pageSize })
    messages.value = res.messages || []
    total.value = res.total || 0
  } catch (e) {
    /* ignore */
  } finally {
    loading.value = false
  }
}

async function submitMessage() {
  formError.value = ''
  if (!form.value.nickname.trim() || !form.value.content.trim()) {
    formError.value = '昵称和内容不能为空'
    return
  }
  if (form.value.nickname.trim().length < 2 || form.value.nickname.trim().length > 20) {
    formError.value = '昵称需要 2-20 个字'
    return
  }
  if (form.value.content.trim().length < 2 || form.value.content.trim().length > 500) {
    formError.value = '内容需要 2-500 个字'
    return
  }
  submitting.value = true
  try {
    const data = { nickname: form.value.nickname.trim(), content: form.value.content.trim() }
    if (form.value.email.trim()) data.email = form.value.email.trim()
    if (replyTo.value) data.parent_id = replyTo.value.id
    await messageApi.create(data)
    form.value = { nickname: '', email: '', content: '' }
    replyTo.value = null
    formSuccess.value = true
    setTimeout(() => { formSuccess.value = false }, 3000)
    page.value = 1
    fetchMessages()
  } catch (e) {
    formError.value = e?.response?.data?.message || '提交失败，请稍后再试'
  } finally {
    submitting.value = false
  }
}

function replyToMessage(msg) {
  replyTo.value = msg
  form.value.content = `@${msg.nickname} `
  window.scrollTo({ top: 200, behavior: 'smooth' })
}

function cancelReply() {
  replyTo.value = null
  form.value.content = ''
}

function changePage(p) {
  page.value = p
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

onMounted(fetchMessages)
watch(page, fetchMessages)

const totalPages = () => Math.ceil(total.value / pageSize) || 1
</script>

<template>
  <div class="page guestbook">
    <div class="page-header">
      <h1 class="page-title">☰ 留言板</h1>
      <p class="page-desc">说点什么吧，每条留言都会被珍惜 ✨</p>
    </div>

    <!-- 留言表单 -->
    <div class="message-form glass-card">
      <div class="form-header">
        <span class="form-title">写下留言</span>
        <span class="form-replying" v-if="replyTo">
          回复 @{{ replyTo.nickname }}
          <button class="cancel-reply" @click="cancelReply">×</button>
        </span>
      </div>

      <div class="form-row">
        <input
          v-model="form.nickname"
          type="text"
          class="glass-input"
          placeholder="昵称 *"
          maxlength="20"
        />
        <input
          v-model="form.email"
          type="email"
          class="glass-input"
          placeholder="邮箱（可选，用于头像）"
        />
      </div>

      <textarea
        v-model="form.content"
        class="glass-input form-textarea"
        placeholder="说点什么吧..."
        maxlength="500"
        rows="4"
      />

      <div class="form-footer">
        <span class="form-error" v-if="formError">{{ formError }}</span>
        <span class="form-success" v-if="formSuccess">留言提交成功，审核后可见~</span>
        <button class="glass-btn form-submit" :disabled="submitting" @click="submitMessage">
          {{ submitting ? '提交中...' : '提交留言' }}
        </button>
      </div>
    </div>

    <!-- 留言列表 -->
    <div class="message-section">
      <h3 class="message-count">共 {{ total }} 条留言</h3>

      <div v-if="loading" class="message-loading">
        <div v-for="i in 3" :key="i" class="skeleton" style="height: 100px; margin-bottom: 16px" />
      </div>

      <div v-else-if="messages.length">
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="message-item glass-card"
        >
          <div class="message-avatar">
            <span class="avatar-text">{{ msg.nickname.charAt(0).toUpperCase() }}</span>
          </div>
          <div class="message-body">
            <div class="message-meta">
              <span class="message-author">{{ msg.nickname }}</span>
              <span class="message-date">{{ formatDate(msg.createdAt) }}</span>
            </div>
            <p class="message-content">{{ msg.content }}</p>
            <button class="message-reply-btn" @click="replyToMessage(msg)">回复</button>

            <!-- 回复列表 -->
            <div class="message-replies" v-if="msg.replies?.length">
              <div v-for="reply in msg.replies" :key="reply.id" class="reply-item">
                <div class="reply-avatar">
                  <span class="avatar-text-sm">{{ reply.nickname.charAt(0).toUpperCase() }}</span>
                </div>
                <div class="reply-body">
                  <div class="reply-meta">
                    <span class="reply-author">{{ reply.nickname }}</span>
                    <span class="reply-date">{{ formatDate(reply.createdAt) }}</span>
                  </div>
                  <p class="reply-content">{{ reply.content }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <span class="empty-icon">💬</span>
        <p>还没有留言… 成为第一个留下足迹的人吧 ✨</p>
      </div>

      <div class="pagination" v-if="totalPages() > 1">
        <button class="page-btn glass-btn" :disabled="page <= 1" @click="changePage(page - 1)">← 上一页</button>
        <span class="page-info">{{ page }} / {{ totalPages() }}</span>
        <button class="page-btn glass-btn" :disabled="page >= totalPages()" @click="changePage(page + 1)">下一页 →</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.guestbook {
  max-width: 720px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-desc {
  color: var(--color-text-muted);
  font-size: 15px;
  margin-top: 8px;
}

/* 留言表单 */
.message-form {
  padding: 28px;
  margin-bottom: 40px;
}

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.form-title {
  font-family: var(--font-serif);
  font-size: 17px;
  font-weight: 700;
}

.form-replying {
  font-size: 13px;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  gap: 4px;
}

.cancel-reply {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 18px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}

.cancel-reply:hover {
  color: var(--color-accent-anime);
}

.form-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  font-family: var(--font-sans);
  margin-bottom: 16px;
}

.form-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  flex-wrap: wrap;
}

.form-error {
  font-size: 13px;
  color: var(--color-accent-anime);
  flex: 1;
}

.form-success {
  font-size: 13px;
  color: var(--color-accent-galgame);
  flex: 1;
}

.form-submit {
  padding: 10px 28px;
  font-size: 14px;
}

/* 留言列表 */
.message-count {
  font-family: var(--font-serif);
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-muted);
  margin-bottom: 20px;
  text-align: center;
}

.message-item {
  display: flex;
  gap: 16px;
  padding: 20px 24px;
  margin-bottom: 16px;
}

.message-avatar {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent-article));
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 700;
  color: #fff;
}

.message-body {
  flex: 1;
  min-width: 0;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.message-author {
  font-weight: 600;
  font-size: 14px;
  color: var(--color-text);
}

.message-date {
  font-size: 12px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
}

.message-content {
  font-size: 15px;
  line-height: 1.7;
  color: var(--color-text-secondary);
}

.message-reply-btn {
  background: none;
  border: none;
  font-size: 12px;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 4px 0;
  margin-top: 8px;
  transition: color var(--transition-fast);
}

.message-reply-btn:hover {
  color: var(--color-primary);
}

/* 回复 */
.message-replies {
  margin-top: 16px;
  padding-left: 16px;
  border-left: 2px solid var(--glass-border);
}

.reply-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
}

.reply-item + .reply-item {
  border-top: 1px solid rgba(139, 69, 19, 0.06);
}

.reply-avatar {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-text-muted), var(--color-text-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text-sm {
  font-size: 13px;
  font-weight: 700;
  color: #fff;
}

.reply-body {
  flex: 1;
  min-width: 0;
}

.reply-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.reply-author {
  font-size: 13px;
  font-weight: 600;
}

.reply-date {
  font-size: 11px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
}

.reply-content {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
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
  margin-top: 32px;
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
  .message-form {
    padding: 20px;
  }

  .form-row {
    flex-direction: column;
    gap: 8px;
  }

  .message-item {
    padding: 16px 18px;
  }

  .form-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .form-submit {
    width: 100%;
  }
}
</style>
