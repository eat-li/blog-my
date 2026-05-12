<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { statsApi, postApi, messageApi } from '../../api'

const router = useRouter()
const auth = useAuthStore()

const profile = ref(null)
const recentPosts = ref([])
const recentMessages = ref([])
const loading = ref(true)

onMounted(async () => {
  if (!auth.user) {
    try {
      await auth.fetchUser()
    } catch { /* will redirect */ }
  }
  await fetchData()
})

async function fetchData() {
  loading.value = true
  try {
    const [profileRes, postsRes, msgsRes] = await Promise.all([
      statsApi.profile(),
      postApi.list({ pageSize: 5, status: 'all' }),
      messageApi.adminList({ pageSize: 5 }),
    ])
    profile.value = profileRes
    recentPosts.value = postsRes.posts || []
    recentMessages.value = msgsRes.messages || []
  } catch (e) {
    if (e.response?.status === 401) {
      router.push('/admin/login')
    }
  } finally {
    loading.value = false
  }
}

const statCards = computed(() => {
  if (!profile.value) return []
  return [
    { label: '文章', value: profile.value.articles, icon: '✎', color: 'var(--color-accent-article)', path: '/admin/posts?type=article' },
    { label: '动漫', value: profile.value.anime, icon: '◉', color: 'var(--color-accent-anime)', path: '/admin/posts?type=anime' },
    { label: 'Galgame', value: profile.value.galgame, icon: '◈', color: 'var(--color-accent-galgame)', path: '/admin/posts?type=galgame' },
    { label: '总浏览量', value: profile.value.totalViews?.toLocaleString() || 0, icon: '👁', color: 'var(--color-primary)', path: '' },
  ]
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="dashboard">
    <!-- 欢迎 -->
    <div class="dash-welcome glass-card">
      <div class="welcome-text">
        <h1>欢迎回来，{{ auth.user?.nickname || '管理员' }}</h1>
        <p>今天也是美好的一天。</p>
      </div>
      <router-link to="/admin/posts/create" class="glass-btn welcome-btn">
        ✎ 写新内容
      </router-link>
    </div>

    <!-- 统计卡片 -->
    <div class="dash-stats" v-if="statCards.length">
      <div
        v-for="stat in statCards"
        :key="stat.label"
        class="stat-card glass-card"
        :class="{ 'stat-card--clickable': stat.path }"
        @click="stat.path && router.push(stat.path)"
      >
        <div class="stat-top">
          <span class="stat-icon" :style="{ color: stat.color }">{{ stat.icon }}</span>
          <span class="stat-value">{{ stat.value }}</span>
        </div>
        <p class="stat-label">{{ stat.label }}</p>
      </div>
    </div>

    <!-- 骨架屏 -->
    <div v-if="loading" class="dash-loading">
      <div class="skeleton" style="height:100px;margin-bottom:20px" />
      <div class="skeleton" style="height:60px;margin-bottom:12px" />
      <div class="skeleton" style="height:60px;margin-bottom:12px" />
    </div>

    <!-- 最近内容 + 留言 -->
    <div v-if="!loading" class="dash-grid">
      <div class="dash-section">
        <div class="section-head">
          <h3>最近内容</h3>
          <router-link to="/admin/posts" class="section-more">查看全部 →</router-link>
        </div>
        <div class="dash-list glass-card" v-if="recentPosts.length">
          <router-link
            v-for="post in recentPosts"
            :key="post.id"
            :to="`/admin/posts/edit/${post.id}`"
            class="dash-list-item"
          >
            <span class="type-badge" :class="post.type">{{ post.type }}</span>
            <span class="item-title">{{ post.title }}</span>
            <span class="item-date">{{ formatDate(post.createdAt) }}</span>
          </router-link>
        </div>
        <div v-else class="dash-empty glass-card">
          <p>还没有内容，去写第一篇吧 ✎</p>
        </div>
      </div>

      <div class="dash-section">
        <div class="section-head">
          <h3>最近留言</h3>
          <router-link to="/admin/messages" class="section-more">查看全部 →</router-link>
        </div>
        <div class="dash-list glass-card" v-if="recentMessages.length">
          <div
            v-for="msg in recentMessages"
            :key="msg.id"
            class="dash-list-item"
          >
            <span class="item-nick">{{ msg.nickname }}</span>
            <span class="item-msg">{{ msg.content?.slice(0, 30) }}{{ msg.content?.length > 30 ? '...' : '' }}</span>
            <span class="item-status" :class="'status-' + msg.status">{{ msg.status }}</span>
          </div>
        </div>
        <div v-else class="dash-empty glass-card">
          <p>还没有留言</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 960px;
}

/* 欢迎 */
.dash-welcome {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28px 32px;
  margin-bottom: 24px;
}

.welcome-text h1 {
  font-size: 22px;
  margin-bottom: 4px;
}

.welcome-text p {
  font-size: 14px;
  color: var(--color-text-muted);
}

.welcome-btn {
  font-size: 14px;
  padding: 10px 20px;
}

/* 统计卡片 */
.dash-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}

.stat-card {
  padding: 20px;
  cursor: default;
}

.stat-card--clickable {
  cursor: pointer;
}

.stat-card--clickable:hover {
  transform: translateY(-3px);
}

.stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.stat-icon {
  font-size: 20px;
}

.stat-value {
  font-family: var(--font-mono);
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
}

.stat-label {
  font-size: 13px;
  color: var(--color-text-muted);
}

/* 网格 */
.dash-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-head h3 {
  font-family: var(--font-sans);
  font-size: 16px;
  font-weight: 600;
}

.section-more {
  font-size: 13px;
  color: var(--color-primary);
}

/* 列表 */
.dash-list {
  padding: 8px;
}

.dash-list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--color-text);
  transition: background var(--transition-fast);
  cursor: pointer;
}

.dash-list-item:hover {
  background: rgba(139, 69, 19, 0.04);
}

.item-title {
  flex: 1;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-nick {
  font-weight: 500;
  font-size: 14px;
  min-width: 50px;
}

.item-msg {
  flex: 1;
  font-size: 13px;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-date {
  font-size: 12px;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.item-status {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-weight: 500;
}

.status-pending { background: rgba(232, 137, 91, 0.12); color: var(--color-accent-article); }
.status-approved { background: rgba(123, 168, 114, 0.12); color: var(--color-accent-galgame); }
.status-rejected { background: rgba(232, 91, 91, 0.12); color: var(--color-accent-anime); }

/* 空状态 */
.dash-empty {
  padding: 40px 24px;
  text-align: center;
}

.dash-empty p {
  font-size: 14px;
  color: var(--color-text-muted);
}

/* 加载 */
.dash-loading {
  margin-bottom: 28px;
}

@media (max-width: 768px) {
  .dash-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  .dash-grid {
    grid-template-columns: 1fr;
  }
  .dash-welcome {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
}
</style>
