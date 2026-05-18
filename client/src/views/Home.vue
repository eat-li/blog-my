<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { postApi, statsApi, tagApi, configApi } from '../api'
import NewsTicker from '../components/NewsTicker.vue'
import AnnouncementBar from '../components/AnnouncementBar.vue'
import HomeMessages from '../components/HomeMessages.vue'
import HomePostItem from '../components/HomePostItem.vue'
import TypeWriter from '../components/TypeWriter.vue'
import Calendar from '../components/Calendar.vue'
import TimeProgress from '../components/TimeProgress.vue'
import githubIcon from '../assets/github.svg'
import bilibiliIcon from '../assets/bilibili.svg'
import douyinIcon from '../assets/douyin.svg'

const socialSvgMap = {
  github: githubIcon,
  bilibili: bilibiliIcon,
  douyin: douyinIcon,
}

const latest = ref({ article: [], anime: [], galgame: [] })
const stats = ref(null)
const heatmap = ref({})
const repos = ref([])
const tags = ref([])
const siteInfo = ref(null)
const socialLinks = ref({})
const siteUptime = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })
let uptimeTimer = null
let _launchDate = null
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

// 社交平台图标（SVG paths）和颜色映射
const socialPlatforms = {
  github: {
    label: 'GitHub',
    color: '#24292e',
    viewBox: '0 0 1024 1024',
    paths: [
      { d: 'M20.48 503.72608c0 214.4256 137.4208 396.73856 328.94976 463.6672 25.8048 6.5536 21.87264-11.8784 21.87264-24.33024v-85.07392c-148.93056 17.44896-154.86976-81.1008-164.94592-97.52576-20.23424-34.52928-67.91168-43.33568-53.69856-59.76064 33.91488-17.44896 68.48512 4.42368 108.46208 63.61088 28.95872 42.88512 85.44256 35.6352 114.15552 28.4672a138.8544 138.8544 0 0 1 38.0928-66.7648c-154.25536-27.60704-218.60352-121.77408-218.60352-233.79968 0-54.31296 17.94048-104.2432 53.0432-144.54784-22.36416-66.43712 2.08896-123.24864 5.3248-131.6864 63.81568-5.7344 130.00704 45.6704 135.168 49.68448 36.2496-9.78944 77.57824-14.9504 123.82208-14.9504 46.4896 0 88.064 5.3248 124.5184 15.23712 12.288-9.4208 73.80992-53.53472 133.12-48.128 3.15392 8.43776 27.0336 63.93856 6.02112 129.4336 35.59424 40.38656 53.69856 90.76736 53.69856 145.24416 0 112.18944-64.7168 206.4384-219.42272 233.71776a140.0832 140.0832 0 0 1 41.7792 99.9424v123.4944c0.86016 9.87136 0 19.6608 16.50688 19.6608 194.31424-65.49504 334.2336-249.15968 334.2336-465.5104C1002.57792 232.48896 782.66368 12.77952 511.5904 12.77952 240.18944 12.65664 20.48 232.40704 20.48 503.72608z' }
    ]
  },
  bilibili: {
    label: 'Bilibili',
    color: '#20B0E3',
    viewBox: '0 0 1129 1024',
    paths: [
      { d: 'M234.909 9.656a80.468 80.468 0 0 1 68.398 0 167.374 167.374 0 0 1 41.843 30.578l160.937 140.82h115.07l160.936-140.82a168.983 168.983 0 0 1 41.843-30.578A80.468 80.468 0 0 1 930.96 76.445a80.468 80.468 0 0 1-17.703 53.914 449.818 449.818 0 0 1-35.406 32.187 232.553 232.553 0 0 1-22.531 18.508h100.585a170.593 170.593 0 0 1 118.289 53.109 171.397 171.397 0 0 1 53.914 118.288v462.693a325.897 325.897 0 0 1-4.024 70.007 178.64 178.64 0 0 1-80.468 112.656 173.007 173.007 0 0 1-92.539 25.75h-738.7a341.186 341.186 0 0 1-72.421-4.024A177.835 177.835 0 0 1 28.91 939.065a172.202 172.202 0 0 1-27.36-92.539V388.662a360.498 360.498 0 0 1 0-66.789A177.03 177.03 0 0 1 162.487 178.64h105.414c-16.899-12.07-31.383-26.555-46.672-39.43a80.468 80.468 0 0 1-25.75-65.984 80.468 80.468 0 0 1 39.43-63.57M216.4 321.873a80.468 80.468 0 0 0-63.57 57.937 108.632 108.632 0 0 0 0 30.578v380.615a80.468 80.468 0 0 0 55.523 80.469 106.218 106.218 0 0 0 34.601 5.632h654.208a80.468 80.468 0 0 0 76.444-47.476 112.656 112.656 0 0 0 8.047-53.109v-354.06a135.187 135.187 0 0 0 0-38.625 80.468 80.468 0 0 0-52.304-54.719 129.554 129.554 0 0 0-49.89-7.242H254.22a268.764 268.764 0 0 0-37.82 0z' },
      { d: 'M348.369 447.404a80.468 80.468 0 0 1 55.523 18.507 80.468 80.468 0 0 1 28.164 59.547v80.468a80.468 80.468 0 0 1-16.094 51.5 80.468 80.468 0 0 1-131.968-9.656 104.609 104.609 0 0 1-10.46-54.719v-80.468a80.468 80.468 0 0 1 70.007-67.593z m416.02 0a80.468 80.468 0 0 1 86.102 75.64v80.468a94.148 94.148 0 0 1-12.07 53.11 80.468 80.468 0 0 1-132.773 0 95.757 95.757 0 0 1-12.875-57.133V519.02a80.468 80.468 0 0 1 70.007-70.812z' }
    ]
  },
  douyin: {
    label: '抖音',
    color: '#111',
    viewBox: '0 0 1024 1024',
    paths: [
      { d: 'M937.4 423.9c-84 0-165.7-27.3-232.9-77.8v352.3c0 179.9-138.6 325.6-309.6 325.6S85.3 878.3 85.3 698.4c0-179.9 138.6-325.6 309.6-325.6 17.1 0 33.7 1.5 49.9 4.3v186.6c-15.5-6.1-32-9.2-48.6-9.2-76.3 0-138.2 65-138.2 145.3 0 80.2 61.9 145.3 138.2 145.3 76.2 0 138.1-65.1 138.1-145.3V0H707c0 134.5 103.7 243.5 231.6 243.5v180.3l-1.2 0.1' }
    ]
  },
  email: {
    label: 'Email',
    color: '#8B4513',
    viewBox: '0 0 24 24',
    paths: [
      { d: 'M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z' }
    ]
  },
}

function getSocialInfo(key) {
  return socialPlatforms[key] || null
}

function calcUptime() {
  if (!_launchDate) return
  const diff = Date.now() - new Date(_launchDate).getTime()
  const s = Math.floor(diff / 1000)
  siteUptime.value = {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  }
}

function startUptime(launchDate) {
  _launchDate = launchDate
  calcUptime()
  uptimeTimer = setInterval(calcUptime, 1000)
}

function handleVisibility() {
  if (document.hidden) {
    if (uptimeTimer) { clearInterval(uptimeTimer); uptimeTimer = null }
  } else {
    if (!uptimeTimer && _launchDate) {
      calcUptime()
      uptimeTimer = setInterval(calcUptime, 1000)
    }
  }
}

onMounted(async () => {
  const safeCall = (fn, fallback) => fn().catch(() => fallback)

  // 关键优化：config 单独优先请求，让头像和站点信息尽快渲染（LCP 优化）
  const config = await safeCall(configApi.getPublic, {})
  siteInfo.value = config?.site_info || null
  socialLinks.value = config?.social_links || {}

  if (config?.site_info?.launch_date) {
    startUptime(config.site_info.launch_date)
    document.addEventListener('visibilitychange', handleVisibility)
  }

  const repoList = config?.github_config?.repos
  if (repoList?.length) {
    repos.value = repoList.slice(0, 6)
  }

  // 其余 API 并行请求（不阻塞头像渲染）
  const [latestRes, statsRes, heatmapRes, tagsRes] = await Promise.all([
    safeCall(postApi.latest, { article: [], anime: [], galgame: [] }),
    safeCall(statsApi.profile, null),
    safeCall(postApi.heatmap, { heatmap: {} }),
    safeCall(tagApi.list, []),
  ])

  latest.value = latestRes || { article: [], anime: [], galgame: [] }
  stats.value = statsRes?.data || statsRes || null
  heatmap.value = heatmapRes?.heatmap || {}
  tags.value = (tagsRes?.tags || tagsRes || []).slice(0, 15)

  loading.value = false
})

onUnmounted(() => {
  if (uptimeTimer) { clearInterval(uptimeTimer); uptimeTimer = null }
  document.removeEventListener('visibilitychange', handleVisibility)
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
              <img
                :src="siteInfo?.avatar || ''"
                class="avatar-img"
                :class="{ 'avatar-img--hidden': !siteInfo?.avatar }"
                alt="avatar"
              />
              <span v-if="!siteInfo?.avatar" class="avatar-letter">E</span>
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
            <!-- 网站存活时间 -->
            <div class="profile-uptime" v-if="siteInfo?.launch_date">
              <span class="uptime-quote">就连永恒，也是由这样的瞬间构成</span>
              <span class="uptime-digits">
                {{ String(siteUptime.days).padStart(3, '0') }}<span class="uptime-unit">天</span>
                {{ String(siteUptime.hours).padStart(2, '0') }}<span class="uptime-unit">时</span>
                {{ String(siteUptime.minutes).padStart(2, '0') }}<span class="uptime-unit">分</span>
                {{ String(siteUptime.seconds).padStart(2, '0') }}<span class="uptime-unit">秒</span>
              </span>
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

        <!-- 联系方式 -->
        <div class="sidebar-card glass-card" v-if="Object.keys(socialLinks).length">
          <h3 class="sidebar-title">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="sidebar-title-icon">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            联系方式
          </h3>
          <div class="contact-list">
            <a
              v-for="(url, key) in socialLinks"
              :key="key"
              :href="key === 'email' ? `mailto:${url}` : url"
              :target="key === 'email' ? '_self' : '_blank'"
              rel="noopener"
              class="contact-item"
            >
              <span
                class="contact-icon"
                :class="{ 'contact-icon-custom': socialSvgMap[key] }"
                :style="{ background: socialSvgMap[key] ? 'transparent' : (getSocialInfo(key)?.color || '#888') }"
              >
                <img
                  v-if="socialSvgMap[key]"
                  :src="socialSvgMap[key]"
                  width="22"
                  height="22"
                  class="contact-icon-svg"
                  :alt="getSocialInfo(key)?.label || key"
                />
                <svg v-else-if="getSocialInfo(key)" width="14" height="14" :viewBox="getSocialInfo(key).viewBox">
                  <path
                    v-for="(p, pi) in getSocialInfo(key).paths"
                    :key="pi"
                    :d="p.d"
                    :fill="p.fill || '#fff'"
                    :opacity="p.opacity || '1'"
                  />
                </svg>
                <span v-else class="contact-icon-text">{{ key.slice(0, 2).toUpperCase() }}</span>
              </span>
              <span class="contact-label">{{ getSocialInfo(key)?.label || key }}</span>
              <svg class="contact-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- GitHub 项目 -->
        <div class="sidebar-card glass-card" v-if="repos.length">
          <h3 class="sidebar-title">⬡ GitHub 项目</h3>
          <a
            v-for="(repo, index) in repos"
            :key="index"
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
                <span class="lang-dot" :style="{ background: repo.language_color || langColors[repo.language] || '#999' }" />
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
  max-width: 680px;
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

.avatar-img--hidden {
  opacity: 0;
  position: absolute;
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

/* 网站存活时间 */
.profile-uptime {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid rgba(139, 69, 19, 0.08);
  flex-wrap: wrap;
}

.uptime-quote {
  font-family: var(--font-serif);
  font-size: 12px;
  color: var(--color-text-muted);
  font-style: italic;
  white-space: nowrap;
}

.uptime-digits {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--color-text-secondary);
  letter-spacing: 1px;
  font-variant-numeric: tabular-nums;
}

.uptime-unit {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-right: 1px;
}

.uptime-unit:last-child {
  margin-right: 0;
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

/* ---------- 联系方式 ---------- */
.sidebar-title-icon {
  color: var(--color-primary);
  flex-shrink: 0;
  margin-right: 2px;
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 4px;
}

.contact-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: var(--color-text-secondary);
  font-size: 13px;
  transition: all var(--transition-fast);
}

.contact-item:hover {
  background: rgba(139, 69, 19, 0.05);
  color: var(--color-text);
  transform: translateX(3px);
}

.contact-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  color: #fff;
  flex-shrink: 0;
  transition: transform var(--transition-fast);
}

.contact-item:hover .contact-icon {
  transform: scale(1.1);
}

.contact-icon-custom {
  border: 1px solid var(--glass-border);
}

.contact-icon-svg {
  display: block;
  object-fit: contain;
}

.contact-icon-text {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.contact-label {
  flex: 1;
  font-weight: 500;
}

.contact-arrow {
  color: var(--color-text-muted);
  opacity: 0;
  transform: translateX(-4px);
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.contact-item:hover .contact-arrow {
  opacity: 1;
  transform: translateX(0);
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
