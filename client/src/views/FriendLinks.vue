<script setup>
import { ref, onMounted } from 'vue'
import { friendlinkApi } from '../api'

const links = ref([])
const loading = ref(true)

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
