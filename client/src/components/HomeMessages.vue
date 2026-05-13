<script setup>
import { ref, onMounted } from 'vue'
import { messageApi } from '../api'

const messages = ref([])
const total = ref(0)
const loading = ref(true)

const form = ref({ nickname: '', content: '' })
const submitting = ref(false)
const formError = ref('')
const formSuccess = ref(false)

async function fetchMessages() {
  loading.value = true
  try {
    const res = await messageApi.list({ page: 1, pageSize: 5 })
    messages.value = res.messages || []
    total.value = res.total || 0
  } catch {
    // 静默处理
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
    await messageApi.create({
      nickname: form.value.nickname.trim(),
      content: form.value.content.trim()
    })
    form.value = { nickname: '', content: '' }
    formSuccess.value = true
    setTimeout(() => { formSuccess.value = false }, 3000)
    fetchMessages()
  } catch (e) {
    formError.value = e?.response?.data?.message || '提交失败，请稍后再试'
  } finally {
    submitting.value = false
  }
}

function formatDate(d) {
  if (!d) return ''
  const date = new Date(d)
  const now = new Date()
  const diff = now - date
  if (diff < 3600000) return Math.floor(diff / 60000) + ' 分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + ' 小时前'
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

onMounted(fetchMessages)
</script>

<template>
  <section class="hm-section">
    <div class="hm-head">
      <h2 class="hm-title">留言板</h2>
      <span class="hm-count" v-if="total">共 {{ total }} 条</span>
      <router-link to="/guestbook" class="hm-more glass-btn">查看更多 →</router-link>
    </div>

    <!-- 留言表单 -->
    <div class="hm-form glass-card">
      <div class="hm-form-row">
        <input
          v-model="form.nickname"
          type="text"
          class="glass-input hm-nickname"
          placeholder="昵称"
          maxlength="20"
        />
        <input
          v-model="form.content"
          type="text"
          class="glass-input hm-content"
          placeholder="说点什么吧..."
          maxlength="500"
          @keyup.enter="submitMessage"
        />
        <button
          class="glass-btn hm-submit"
          :disabled="submitting"
          @click="submitMessage"
        >
          {{ submitting ? '...' : '发送' }}
        </button>
      </div>
      <div class="hm-form-foot">
        <span class="hm-error" v-if="formError">{{ formError }}</span>
        <span class="hm-success" v-if="formSuccess">留言成功，审核后可见~</span>
      </div>
    </div>

    <!-- 留言列表 -->
    <div v-if="loading" class="hm-skeleton">
      <div v-for="i in 3" :key="i" class="skeleton" style="height:48px;margin-bottom:10px;border-radius:8px" />
    </div>

    <div v-else-if="messages.length" class="hm-list">
      <div v-for="msg in messages" :key="msg.id" class="hm-item glass-card">
        <div class="hm-avatar">
          <span class="hm-avatar-text">{{ msg.nickname.charAt(0).toUpperCase() }}</span>
        </div>
        <div class="hm-body">
          <div class="hm-meta">
            <span class="hm-author">{{ msg.nickname }}</span>
            <span class="hm-date">{{ formatDate(msg.createdAt) }}</span>
          </div>
          <p class="hm-text">{{ msg.content }}</p>
          <!-- 回复 -->
          <div class="hm-replies" v-if="msg.Messages?.length">
            <div v-for="reply in msg.Messages" :key="reply.id" class="hm-reply">
              <span class="hm-reply-author">{{ reply.nickname }}</span>
              <span class="hm-reply-text">{{ reply.content }}</span>
            </div>
          </div>
        </div>
      </div>

      <router-link v-if="total > 5" to="/guestbook" class="hm-view-all">
        查看全部 {{ total }} 条留言 →
      </router-link>
    </div>

    <div v-else class="hm-empty glass-card">
      <p>还没有留言，来坐沙发吧~</p>
    </div>
  </section>
</template>

<style scoped>
.hm-section {
  margin-top: 20px;
}

.hm-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.hm-title {
  font-family: var(--font-serif);
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
}

.hm-count {
  font-size: 13px;
  color: var(--color-text-muted);
}

.hm-more {
  margin-left: auto;
  font-size: 12px;
  padding: 5px 14px;
}

/* 表单 */
.hm-form {
  padding: 16px 20px;
  margin-bottom: 16px;
}

.hm-form-row {
  display: flex;
  gap: 10px;
}

.hm-nickname {
  width: 130px;
  flex-shrink: 0;
}

.hm-content {
  flex: 1;
  min-width: 0;
}

.hm-submit {
  flex-shrink: 0;
  padding: 0 20px;
  font-size: 13px;
  background: rgba(139, 69, 19, 0.08);
  border-color: rgba(139, 69, 19, 0.2);
  color: var(--color-primary);
}

.hm-submit:hover {
  background: rgba(139, 69, 19, 0.15);
}

.hm-form-foot {
  margin-top: 8px;
  min-height: 18px;
}

.hm-error {
  font-size: 12px;
  color: var(--color-accent-anime);
}

.hm-success {
  font-size: 12px;
  color: var(--color-accent-galgame);
}

/* 列表 */
.hm-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hm-item {
  display: flex;
  gap: 14px;
  padding: 14px 18px;
}

.hm-avatar {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent-article));
  display: flex;
  align-items: center;
  justify-content: center;
}

.hm-avatar-text {
  font-family: var(--font-serif);
  font-size: 14px;
  font-weight: 700;
  color: #fff;
}

.hm-body {
  flex: 1;
  min-width: 0;
}

.hm-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.hm-author {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
}

.hm-date {
  font-size: 11px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
}

.hm-text {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

/* 回复 */
.hm-replies {
  margin-top: 8px;
  padding-left: 12px;
  border-left: 2px solid var(--glass-border);
}

.hm-reply {
  font-size: 13px;
  line-height: 1.6;
  padding: 2px 0;
}

.hm-reply-author {
  font-weight: 600;
  color: var(--color-text);
  margin-right: 6px;
}

.hm-reply-text {
  color: var(--color-text-secondary);
}

/* 查看全部 */
.hm-view-all {
  display: block;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-muted);
  text-decoration: none;
  padding: 12px;
  transition: color var(--transition-fast);
}

.hm-view-all:hover {
  color: var(--color-primary);
}

/* 空状态 */
.hm-empty {
  padding: 36px;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 14px;
}

.hm-skeleton {
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .hm-form-row {
    flex-direction: column;
  }

  .hm-nickname {
    width: 100%;
  }

  .hm-submit {
    padding: 10px;
  }

  .hm-head {
    flex-wrap: wrap;
  }
}
</style>
