<script setup>
import { ref, reactive, onMounted } from 'vue'
import { friendlinkApi } from '../api'

const links = ref([])
const loading = ref(true)

// 申请表单
const showForm = ref(false)
const submitting = ref(false)
const cooldown = ref(0) // 提交冷却倒计时（秒）
const submitMsg = ref('')
const submitOk = ref(false)
const form = reactive({
  nickname: '',
  avatar: '',
  signature: '',
  url: ''
})

const formErrors = reactive({
  nickname: '',
  url: ''
})

function toggleForm() {
  showForm.value = !showForm.value
  submitMsg.value = ''
  formErrors.nickname = ''
  formErrors.url = ''
}

function validateForm() {
  let valid = true
  formErrors.nickname = ''
  formErrors.url = ''

  if (!form.nickname.trim()) {
    formErrors.nickname = '请输入昵称'
    valid = false
  }
  if (!form.url.trim()) {
    formErrors.url = '请输入网站链接'
    valid = false
  } else if (!/^https?:\/\/.+/.test(form.url.trim())) {
    formErrors.url = '请输入正确的链接（以 http:// 或 https:// 开头）'
    valid = false
  }
  return valid
}

async function handleSubmit() {
  if (!validateForm()) return
  submitting.value = true
  submitMsg.value = ''
  try {
    await friendlinkApi.apply({
      nickname: form.nickname.trim(),
      avatar: form.avatar.trim(),
      signature: form.signature.trim(),
      url: form.url.trim()
    })
    submitOk.value = true
    submitMsg.value = '友链申请已提交，等待审核通过后即可显示'
    form.nickname = ''
    form.avatar = ''
    form.signature = ''
    form.url = ''
    // 启动提交冷却 60 秒
    cooldown.value = 60
    const timer = setInterval(() => {
      cooldown.value--
      if (cooldown.value <= 0) clearInterval(timer)
    }, 1000)
  } catch (e) {
    submitOk.value = false
    submitMsg.value = e?.response?.data?.message || '提交失败，请稍后再试'
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    const res = await friendlinkApi.list()
    links.value = res.data || []
  } catch (e) {
    console.error('获取友链失败', e)
  } finally {
    loading.value = false
  }
})

function onAvatarError(e) {
  e.target.src = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72">' +
    '<rect width="72" height="72" fill="%23F5F0E8"/>' +
    '<text x="36" y="48" text-anchor="middle" font-size="32" fill="%238B4513">⚭</text></svg>'
  )
}

function visitLink(link) {
  window.open(link.url, '_blank', 'noopener')
}
</script>

<template>
  <div class="friendlinks-page page">
    <h1 class="page-title">友链</h1>
    <p class="page-desc">相逢即是缘，这些是我的朋友们</p>

    <!-- 骨架屏 -->
    <div v-if="loading" class="fl-grid">
      <div v-for="i in 6" :key="i" class="fl-card-skeleton skeleton" />
    </div>

    <!-- 友链网格 -->
    <div v-else-if="links.length" class="fl-grid">
      <div
        v-for="link in links"
        :key="link.id"
        class="fl-card glass-card"
        @click="visitLink(link)"
      >
        <div class="fl-avatar-wrap">
          <div class="fl-avatar-ring">
            <img
              :src="link.avatar || ''"
              :alt="link.nickname"
              class="fl-avatar"
              loading="lazy"
              @error="onAvatarError"
            />
          </div>
        </div>
        <h3 class="fl-nickname">{{ link.nickname }}</h3>
        <p class="fl-signature">{{ link.signature || '这个人很懒，什么都没写~' }}</p>
        <div class="fl-visit">
          <span class="fl-visit-text">拜访</span>
          <span class="fl-visit-arrow">→</span>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="fl-empty glass-card">
      <div class="fl-empty-icon">✦</div>
      <p>暂无友链，敬请期待</p>
    </div>

    <!-- 申请友链 -->
    <div class="apply-section">
      <button
        v-if="!showForm"
        class="apply-toggle glass-btn"
        @click="toggleForm"
      >✦ 申请友链</button>

      <div v-else class="apply-card glass-card">
        <h2 class="apply-title">申请友链</h2>
        <p class="apply-desc">提交后将进入审核，通过后即可展示在友链列表中</p>

        <form class="apply-form" @submit.prevent="handleSubmit">
          <div class="apply-field">
            <label class="apply-label">
              昵称 <span class="apply-required">*</span>
            </label>
            <input
              v-model="form.nickname"
              type="text"
              class="apply-input"
              placeholder="你的网站名称"
              maxlength="50"
            />
            <span class="apply-error" v-if="formErrors.nickname">{{ formErrors.nickname }}</span>
          </div>

          <div class="apply-field">
            <label class="apply-label">头像链接</label>
            <input
              v-model="form.avatar"
              type="text"
              class="apply-input"
              placeholder="头像图片 URL（可选）"
            />
          </div>

          <div class="apply-field">
            <label class="apply-label">个性签名</label>
            <input
              v-model="form.signature"
              type="text"
              class="apply-input"
              placeholder="一句话介绍（可选）"
              maxlength="200"
            />
          </div>

          <div class="apply-field">
            <label class="apply-label">
              网站链接 <span class="apply-required">*</span>
            </label>
            <input
              v-model="form.url"
              type="text"
              class="apply-input"
              placeholder="https://your-site.com"
            />
            <span class="apply-error" v-if="formErrors.url">{{ formErrors.url }}</span>
          </div>

          <div class="apply-actions">
            <button
              type="submit"
              class="apply-submit glass-btn"
              :disabled="submitting || cooldown > 0"
            >{{ submitting ? '提交中…' : cooldown > 0 ? `请稍候 ${cooldown}s` : '提交申请' }}</button>
            <button
              type="button"
              class="apply-cancel glass-btn"
              @click="toggleForm"
            >取消</button>
          </div>

          <p class="apply-msg" :class="{ 'apply-msg--ok': submitOk }" v-if="submitMsg">
            {{ submitMsg }}
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.friendlinks-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-title {
  font-size: 28px;
  text-align: center;
  display: block;
}

.page-title::after {
  left: 50%;
  transform: translateX(-50%);
}

.page-desc {
  text-align: center;
  color: var(--color-text-muted);
  font-size: 15px;
  margin-bottom: 36px;
}

/* 网格布局 */
.fl-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

/* 卡片骨架 */
.fl-card-skeleton {
  height: 220px;
  border-radius: var(--radius-lg);
}

/* 友链卡片 */
.fl-card {
  padding: 28px 20px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
}

.fl-card:hover .fl-avatar-ring {
  transform: scale(1.05);
  box-shadow: 0 8px 28px rgba(139, 69, 19, 0.18);
}

.fl-card:hover .fl-visit-arrow {
  transform: translateX(4px);
}

/* 头像环 */
.fl-avatar-wrap {
  margin-bottom: 16px;
}

.fl-avatar-ring {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  padding: 3px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent-article));
  transition: all var(--transition-glass);
}

.fl-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  background: var(--color-bg-start);
  border: 2px solid var(--color-white);
}

/* 昵称 */
.fl-nickname {
  font-family: var(--font-serif);
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--color-text);
}

/* 签名 */
.fl-signature {
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.5;
  margin-bottom: 16px;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 拜访 */
.fl-visit {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--color-primary);
  font-weight: 500;
}

.fl-visit-arrow {
  font-size: 14px;
  transition: transform var(--transition-fast);
}

/* 空状态 */
.fl-empty {
  padding: 64px;
  text-align: center;
  color: var(--color-text-muted);
}

.fl-empty-icon {
  font-size: 40px;
  color: var(--color-primary);
  opacity: 0.5;
  margin-bottom: 12px;
}

/* =====================
   申请友链表单
   ===================== */
.apply-section {
  margin-top: 48px;
  text-align: center;
}

.apply-toggle {
  font-size: 15px;
  padding: 12px 32px;
  letter-spacing: 1px;
}

.apply-card {
  text-align: left;
  padding: 36px 40px;
  max-width: 560px;
  margin: 0 auto;
}

.apply-title {
  font-family: var(--font-serif);
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
}

.apply-desc {
  font-size: 13px;
  color: var(--color-text-muted);
  margin-bottom: 28px;
  line-height: 1.6;
}

.apply-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.apply-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.apply-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.apply-required {
  color: var(--color-accent-anime);
}

.apply-input {
  font-family: var(--font-sans);
  font-size: 14px;
  padding: 10px 14px;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  color: var(--color-text);
  backdrop-filter: var(--glass-blur);
  transition: border-color var(--transition-fast);
  outline: none;
}

.apply-input:focus {
  border-color: var(--color-primary);
}

.apply-input::placeholder {
  color: var(--color-text-muted);
  opacity: 0.6;
}

.apply-error {
  font-size: 12px;
  color: var(--color-accent-anime);
}

.apply-actions {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}

.apply-submit {
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 600;
}

.apply-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.apply-cancel {
  padding: 10px 24px;
  font-size: 14px;
  opacity: 0.6;
}

.apply-msg {
  font-size: 13px;
  text-align: center;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  background: rgba(139, 69, 19, 0.06);
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.apply-msg--ok {
  background: rgba(123, 168, 114, 0.12);
  color: #5a8a4e;
}

/* 响应式 */
@media (max-width: 768px) {
  .fl-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .fl-grid {
    grid-template-columns: 1fr;
  }

  .friendlinks-page {
    padding: 24px 16px;
  }
}
</style>
