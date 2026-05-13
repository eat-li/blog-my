<script setup>
import { ref, onMounted } from 'vue'
import { postApi, statsApi, tagApi, configApi } from '../api'
import NewsTicker from '../components/NewsTicker.vue'
import AnnouncementBar from '../components/AnnouncementBar.vue'
import HomeMessages from '../components/HomeMessages.vue'
import HomePostItem from '../components/HomePostItem.vue'
import TypeWriter from '../components/TypeWriter.vue'
import Calendar from '../components/Calendar.vue'
import TimeProgress from '../components/TimeProgress.vue'

const latest = ref({ article: [], anime: [], galgame: [] })
const stats = ref(null)
const heatmap = ref({})
const repos = ref([])
const tags = ref([])
const siteInfo = ref(null)
const loading = ref(true)

const typeSections = [
  { key: 'article', label: '文章', color: 'var(--color-accent-article)', link: '/articles' },
  { key: 'anime', label: '动漫', color: 'var(--color-accent-anime)', link: '/anime' },
  { key: 'galgame', label: 'Galgame', color: 'var(--color-accent-galgame)', link: '/galgame' },
]

const statItems = [
  { key: 'articles', label: '文章', color: 'var(--color-accent-article)' },
  { key: 'anime', label: '动漫', color: 'var(--color-accent-anime)' },
  { key: 'galgame', label: 'Galgame', color: 'var(--color-accent-galgame)' },
  { key: 'totalChars', label: '总字数', color: 'var(--color-primary)' },
  { key: 'totalViews', label: '次阅读', color: 'var(--color-primary)' },
]

function formatStatVal(key, val) {
  if (key === 'totalChars') return val > 10000 ? (val / 10000).toFixed(1) + 'w' : val
  if (key === 'totalViews') return val > 1000 ? (val / 1000).toFixed(1) + 'k' : val
  return val
}

// 热力图颜色
function heatColor(count) {
  if (!count) return 'rgba(139, 69, 19, 0.05)'
  if (count === 1) return 'rgba(139, 69, 19, 0.15)'
  if (count === 2) return 'rgba(139, 69, 19, 0.3)'
  if (count === 3) return 'rgba(139, 69, 19, 0.5)'
  return 'rgba(139, 69, 19, 0.75)'
}

// GitHub 语言颜色
const langColors = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Vue: '#41b883',
  Python: '#3572A5', Go: '#00ADD8', Rust: '#dea584', CSS: '#563d7c', HTML: '#e34c26',
}

onMounted(async () => {
  const safeCall = (fn, fallback) => fn().catch(() => fallback)

  const [latestRes, statsRes, heatmapRes, tagsRes, config] = await Promise.all([
    safeCall(postApi.latest, { article: [], anime: [], galgame: [] }),
    safeCall(statsApi.profile, null),
    safeCall(postApi.heatmap, { heatmap: {} }),
    safeCall(tagApi.list, []),
    safeCall(configApi.getPublic, {}),
  ])

  latest.value = latestRes || { article: [], anime: [], galgame: [] }
  stats.value = statsRes?.data || statsRes || null
  heatmap.value = heatmapRes?.heatmap || {}
  tags.value = (tagsRes?.tags || tagsRes || []).slice(0, 15)
  siteInfo.value = config?.site_info || null

  // 直接从 GitHub API 获取仓库（浏览器走系统代理）
  const ghUsername = config?.github_config?.username
  if (ghUsername) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 6000)
      const resp = await fetch(
        `https://api.github.com/users/${ghUsername}/repos?sort=stars&per_page=6`,
        {
          headers: { Accept: 'application/vnd.github.v3+json' },
          signal: controller.signal
        }
      )
      clearTimeout(timer)
      if (resp.ok) {
        const data = await resp.json()
        repos.value = (Array.isArray(data) ? data : [])
          .filter(r => !r.fork)
          .slice(0, 5)
          .map(r => ({
            id: r.id,
            name: r.name,
            description: r.description,
            html_url: r.html_url,
            stargazers_count: r.stargazers_count,
            language: r.language,
            updated_at: r.updated_at
          }))
      }
    } catch { /* GitHub 不可达，repos 保持空数组 */ }
  }

  loading.value = false
})
</script>

<template>
  <div class="home">
    <!-- 动漫名言滚动 -->
    <section class="hero-ticker">
      <NewsTicker />
    </section>

    <!-- 公告栏 -->
    <AnnouncementBar />

    <div class="home-layout">
      <!-- ========================
           左侧主内容区
           ======================== -->
      <div class="home-main">
        <!-- Profile 卡片 -->
        <section class="profile-card glass-card">
          <div class="profile-avatar">
            <div class="avatar-ring">
              <img v-if="siteInfo?.avatar" :src="siteInfo.avatar" class="avatar-img" alt="avatar" />
              <span v-else class="avatar-letter">E</span>
            </div>
          </div>
          <div class="profile-body">
            <h1 class="profile-name">{{ siteInfo?.title || 'EatLi' }}</h1>
            <div class="profile-signature">
              <TypeWriter
                :text="siteInfo?.signature || '「 普通宅男 / 前端开发 / Galgame 玩家 」'"
                :speed="70"
                :loop="true"
              />
            </div>
            <div class="profile-stats" v-if="stats">
              <div
                v-for="s in statItems"
                :key="s.key"
                class="profile-stat"
              >
                <span class="ps-value" :style="{ color: s.color }">{{ formatStatVal(s.key, stats[s.key] || 0) }}</span>
                <span class="ps-label">{{ s.label }}</span>
              </div>
            </div>
            <div v-if="siteInfo?.tech_stack?.length" class="profile-tech">
              <span
                v-for="tech in siteInfo.tech_stack"
                :key="tech"
                class="tech-badge"
              >{{ tech }}</span>
            </div>
          </div>
        </section>

        <!-- 加载态 -->
        <template v-if="loading">
          <section v-for="s in typeSections" :key="s.key" class="content-section">
            <div class="section-head">
              <h2 class="section-head-title" :style="{ color: s.color }">最新{{ s.label }}</h2>
            </div>
            <div class="card-grid">
              <div v-for="i in 2" :key="i" class="skeleton" style="height: 90px" />
            </div>
          </section>
        </template>

        <!-- 各类型最新内容 -->
        <template v-else>
          <section
            v-for="section in typeSections"
            :key="section.key"
            class="content-section"
          >
            <div class="section-head">
              <h2 class="section-head-title" :style="{ color: section.color }">最新{{ section.label }}</h2>
              <router-link :to="section.link" class="section-head-more glass-btn">查看全部 →</router-link>
            </div>

            <div v-if="latest[section.key]?.length" class="card-grid">
              <HomePostItem
                v-for="post in latest[section.key]"
                :key="post.id"
                :post="post"
              />
            </div>

            <div v-else class="empty-block glass-card">
              <span class="empty-icon-sm">📝</span>
              <p>这个区域还没有剧情触发… 等待主人公到来 ✨</p>
            </div>
          </section>
        </template>
      </div>

      <!-- ========================
           右侧侧边栏
           ======================== -->
      <aside class="home-sidebar">
        <!-- 写作热力图 -->
        <div class="sidebar-card glass-card" v-if="Object.keys(heatmap).length">
          <h3 class="sidebar-title">🔥 写作活跃度</h3>
          <div class="heatmap-grid">
            <div
              v-for="(count, date) in heatmap"
              :key="date"
              class="heatmap-cell"
              :style="{ background: heatColor(count) }"
              :title="`${date}: ${count} 篇`"
            />
          </div>
          <div class="heatmap-legend">
            <span>少</span>
            <span class="legend-sq" v-for="n in 5" :key="n" :style="{ background: heatColor(n - 1 || 0.5) }" />
            <span>多</span>
          </div>
        </div>

        <!-- 日历 -->
        <Calendar />

        <!-- 时间进度 -->
        <TimeProgress />

        <!-- GitHub 项目 -->
        <div class="sidebar-card glass-card" v-if="repos.length">
          <h3 class="sidebar-title">⬡ GitHub 项目</h3>
          <a
            v-for="repo in repos"
            :key="repo.id"
            :href="repo.html_url || repo.url"
            target="_blank"
            rel="noopener"
            class="sidebar-repo"
          >
            <div class="sidebar-repo-head">
              <span class="sidebar-repo-name">{{ repo.name }}</span>
              <span class="sidebar-repo-star" v-if="repo.stargazers_count != null">★ {{ repo.stargazers_count }}</span>
            </div>
            <p class="sidebar-repo-desc" v-if="repo.description">{{ repo.description }}</p>
            <div class="sidebar-repo-foot">
              <span class="sidebar-repo-lang" v-if="repo.language">
                <span class="lang-dot" :style="{ background: langColors[repo.language] || '#999' }" />
                {{ repo.language }}
              </span>
            </div>
          </a>
          <router-link to="/projects" class="sidebar-more">查看全部项目 →</router-link>
        </div>

        <!-- 标签云 -->
        <div class="sidebar-card glass-card" v-if="tags.length">
          <h3 class="sidebar-title">🏷️ 标签</h3>
          <div class="tag-cloud">
            <router-link
              v-for="tag in tags"
              :key="tag.id"
              :to="`/tags/${tag.id}`"
              class="tag-badge"
            >#{{ tag.name }}</router-link>
          </div>
        </div>
      </aside>
    </div>

    <!-- 留言板 -->
    <HomeMessages />

    <!-- 底部装饰 -->
    <div class="home-footer">
      <p class="home-footer-text">✦ 每一次更新都是一次新的冒险 ✦</p>
    </div>
  </div>
</template>

<style scoped>
.home {
  width: 100%;
}

.hero-ticker {
  margin-bottom: 28px;
}

/* =====================
   双栏布局
   ===================== */
.home-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 28px;
  align-items: start;
}

.home-main {
  min-width: 0;
}

.home-sidebar {
  position: sticky;
  top: 80px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* =====================
   Profile 卡片
   ===================== */
.profile-card {
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 36px 40px;
  margin-bottom: 40px;
  transition: all var(--transition-base);
}

.profile-card:hover {
  box-shadow: var(--glass-shadow-hover);
  border-color: var(--glass-border-hover);
}

.profile-avatar {
  flex-shrink: 0;
}

.avatar-ring {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent-article));
  position: relative;
}

.avatar-ring::before {
  content: '';
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  background: var(--color-bg-glass-strong);
  backdrop-filter: blur(4px);
}

.avatar-letter {
  position: relative;
  z-index: 1;
  font-family: var(--font-serif);
  font-size: 40px;
  font-weight: 900;
  color: var(--color-primary);
}

.avatar-img {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.profile-body {
  flex: 1;
  min-width: 0;
}

.profile-name {
  font-size: 28px;
  font-weight: 900;
  margin-bottom: 6px;
  background: linear-gradient(135deg, var(--color-text), var(--color-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.profile-signature {
  font-family: var(--font-mono);
  font-size: 14px;
  margin-bottom: 18px;
  line-height: 1.5;
}

.profile-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
}

.profile-stat {
  display: flex;
  align-items: center;
  gap: 5px;
}

.ps-icon {
  font-size: 15px;
}

.ps-value {
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
}

.ps-label {
  font-size: 12px;
  color: var(--color-text-muted);
}

/* 技术栈标签 */
.profile-tech {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(139, 69, 19, 0.08);
}

.tech-badge {
  font-family: var(--font-mono);
  font-size: 12px;
  padding: 4px 14px;
  border-radius: 999px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.tech-badge:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: rgba(139, 69, 19, 0.06);
}

/* =====================
   内容分区头部
   ===================== */
.content-section {
  margin-bottom: 44px;
}

.section-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  max-width: 680px;
}

.section-head-icon {
  font-size: 20px;
}

.section-head-title {
  font-family: var(--font-serif);
  font-size: 22px;
  font-weight: 700;
  flex: 1;
}

.section-head-more {
  font-size: 13px;
  padding: 6px 16px;
}

/* =====================
   卡片网格
   ===================== */
.card-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 680px;
}

.empty-block {
  text-align: center;
  padding: 40px;
  color: var(--color-text-muted);
}

.empty-icon-sm {
  font-size: 36px;
  display: block;
  margin-bottom: 12px;
}

/* =====================
   侧边栏通用
   ===================== */
.sidebar-card {
  padding: 22px 24px;
}

.sidebar-title {
  font-family: var(--font-serif);
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(139, 69, 19, 0.08);
}

.sidebar-more {
  display: block;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-muted);
  text-decoration: none;
  margin-top: 14px;
  transition: color var(--transition-fast);
}

.sidebar-more:hover {
  color: var(--color-primary);
}

/* ---------- 热力图 ---------- */
.heatmap-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-bottom: 10px;
}

.heatmap-cell {
  width: 13px;
  height: 13px;
  border-radius: 2px;
  transition: transform var(--transition-fast);
}

.heatmap-cell:hover {
  transform: scale(1.6);
  z-index: 1;
}

.heatmap-legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 3px;
  font-size: 11px;
  color: var(--color-text-muted);
}

.legend-sq {
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

/* ---------- GitHub 项目 ---------- */
.sidebar-repo {
  display: block;
  text-decoration: none;
  color: inherit;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
  margin-bottom: 4px;
}

.sidebar-repo:hover {
  background: rgba(139, 69, 19, 0.04);
}

.sidebar-repo-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.sidebar-repo-name {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-repo-star {
  font-size: 12px;
  font-weight: 600;
  color: #f0b400;
  flex-shrink: 0;
}

.sidebar-repo-desc {
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 4px;
}

.sidebar-repo-foot {
  display: flex;
  align-items: center;
}

.sidebar-repo-lang {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--color-text-muted);
}

.lang-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

/* ---------- 标签云 ---------- */
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-cloud .tag-badge {
  font-size: 12px;
  padding: 3px 12px;
}

/* =====================
   底部
   ===================== */
.home-footer {
  text-align: center;
  padding: 48px 0 16px;
}

.home-footer-text {
  font-family: var(--font-serif);
  font-size: 15px;
  color: var(--color-text-muted);
  letter-spacing: 2px;
}

/* =====================
   响应式
   ===================== */
@media (max-width: 1024px) {
  .home-layout {
    grid-template-columns: 1fr;
  }

  .home-sidebar {
    position: static;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .profile-card {
    flex-direction: column;
    text-align: center;
    padding: 28px 20px;
    gap: 20px;
  }

  .profile-stats {
    justify-content: center;
  }

  .card-grid {
    gap: 12px;
  }

  .section-head {
    flex-wrap: wrap;
  }

  .home-sidebar {
    grid-template-columns: 1fr;
  }
}
</style>
