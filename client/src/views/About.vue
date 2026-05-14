<script setup>
import { ref, onMounted } from 'vue'
import { configApi, statsApi, postApi } from '../api'

const siteInfo = ref(null)
const socialLinks = ref({})
const stats = ref(null)
const heatmap = ref({})
const aboutPage = ref(null)
const loading = ref(true)

const socialIcons = {
  github: '⬡', bilibili: '▸', email: '✉', twitter: '✕',
  weibo: '◎', douyin: '♬', zhihu: '▼', juejin: '◆',
}

const socialLabels = {
  github: 'GitHub', bilibili: 'Bilibili', email: '邮箱',
  twitter: 'Twitter', weibo: '微博', douyin: '抖音',
  zhihu: '知乎', juejin: '掘金',
}

onMounted(async () => {
  try {
    const [config, statsRes, heatmapRes] = await Promise.all([
      configApi.getPublic(),
      statsApi.profile(),
      postApi.heatmap()
    ])
    siteInfo.value = config.site_info || null
    socialLinks.value = config.social_links || {}
    aboutPage.value = config.about_page || null
    stats.value = statsRes.data || statsRes || null
    heatmap.value = heatmapRes.heatmap || {}
  } catch (e) { /* ignore */ }
  finally { loading.value = false }
})

const socialEntries = () => Object.entries(socialLinks.value).map(([k, v]) => ({ key: k, url: v }))

function getHeatColor(count) {
  if (!count) return 'rgba(139, 69, 19, 0.04)'
  if (count === 1) return 'rgba(139, 69, 19, 0.12)'
  if (count === 2) return 'rgba(139, 69, 19, 0.25)'
  if (count === 3) return 'rgba(139, 69, 19, 0.45)'
  return 'rgba(139, 69, 19, 0.7)'
}

// 从 aboutPage 配置取对应 section，fallback 到空对象
function getSection(name) {
  return (aboutPage.value && aboutPage.value[name]) ? aboutPage.value[name] : {}
}
</script>

<template>
  <div class="page about-page">
    <!-- 顶部头像区 -->
    <div class="about-hero glass-card">
      <div class="about-avatar">
        <div class="avatar-ring-lg">
          <img v-if="siteInfo?.avatar" :src="siteInfo.avatar" class="avatar-img" alt="avatar" />
          <span v-else class="avatar-letter">E</span>
        </div>
      </div>
      <h1 class="about-name" v-if="siteInfo">{{ siteInfo.title || 'EatLi' }}</h1>
      <h1 class="about-name" v-else>EatLi</h1>
      <p class="about-signature">{{ siteInfo?.signature || '普通宅男 / 前端开发 / Galgame 玩家' }}</p>
    </div>

    <!-- 加载态 -->
    <template v-if="loading">
      <div class="skeleton" style="height: 100px; margin-bottom: 16px" />
      <div class="skeleton" style="height: 160px; margin-bottom: 16px" />
      <div class="skeleton" style="height: 120px; margin-bottom: 16px" />
    </template>

    <template v-else>
      <!-- 一、欢迎提示 -->
      <section class="about-section glass-card">
        <h2 class="section-heading">
          <span class="section-num">01</span>
          {{ getSection('welcome').heading || '欢迎来到我的小站' }}
        </h2>
        <div class="section-body">
          <p v-for="(text, i) in (getSection('welcome').paragraphs || [])" :key="i">{{ text }}</p>
        </div>
      </section>

      <!-- 二、网站技术搭建 -->
      <section class="about-section glass-card">
        <h2 class="section-heading">
          <span class="section-num">02</span>
          {{ getSection('siteTech').heading || '网站技术搭建' }}
        </h2>
        <div class="section-body">
          <p>{{ getSection('siteTech').intro || '' }}</p>
          <div class="tech-specs" v-if="getSection('siteTech').specs?.length">
            <div v-for="item in getSection('siteTech').specs" :key="item.label" class="tech-spec">
              <span class="spec-label">{{ item.label }}</span>
              <span class="spec-value">{{ item.value }}</span>
            </div>
          </div>
          <p class="section-note" v-if="getSection('siteTech').note">{{ getSection('siteTech').note }}</p>
        </div>
      </section>

      <!-- 三、关于我自己 -->
      <section class="about-section glass-card">
        <h2 class="section-heading">
          <span class="section-num">03</span>
          {{ getSection('aboutMe').heading || '关于我自己' }}
        </h2>
        <div class="section-body">
          <p>{{ siteInfo?.description || '一个热爱前端开发的宅男。' }}</p>
          <p v-for="(text, i) in (getSection('aboutMe').paragraphs || [])" :key="'me'+i">{{ text }}</p>
        </div>
      </section>

      <!-- 个人数据 -->
      <div class="about-stats glass-card" v-if="stats">
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-num">{{ stats.articles || 0 }}</span>
            <span class="stat-lbl">篇文章</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">{{ stats.anime || 0 }}</span>
            <span class="stat-lbl">部番</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">{{ stats.galgame || 0 }}</span>
            <span class="stat-lbl">部 Galgame</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">{{ stats.totalChars ? (stats.totalChars / 10000).toFixed(1) + 'w' : '0' }}</span>
            <span class="stat-lbl">字</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">{{ (stats.totalViews || 0).toLocaleString() }}</span>
            <span class="stat-lbl">次阅读</span>
          </div>
        </div>
      </div>

      <!-- 四、个人感悟 -->
      <section class="about-section glass-card">
        <h2 class="section-heading">
          <span class="section-num">04</span>
          {{ getSection('reflections').heading || '个人感悟' }}
        </h2>
        <div class="section-body">
          <p v-for="(text, i) in (getSection('reflections').paragraphs || [])" :key="'ref'+i">{{ text }}</p>
        </div>
      </section>

      <!-- 五、个人技术栈 -->
      <section class="about-section glass-card">
        <h2 class="section-heading">
          <span class="section-num">05</span>
          {{ getSection('techStack').heading || '个人技术栈' }}
        </h2>
        <div class="section-body">
          <p>{{ getSection('techStack').intro || '' }}</p>
          <div class="stack-grid" v-if="getSection('techStack').items?.length">
            <div v-for="tech in getSection('techStack').items" :key="tech.name" class="stack-item">
              <span class="stack-dot" :style="{ background: tech.color || '#888' }" />
              <div class="stack-info">
                <span class="stack-name">{{ tech.name }}</span>
                <span class="stack-desc">{{ tech.desc }}</span>
              </div>
            </div>
          </div>
          <div v-if="siteInfo?.tech_stack?.length" class="stack-tags">
            <span v-for="tech in siteInfo.tech_stack" :key="tech" class="stack-tag">{{ tech }}</span>
          </div>
        </div>
      </section>

      <!-- 社交链接 -->
      <div class="about-social glass-card" v-if="socialEntries().length">
        <h3 class="social-title">找到我</h3>
        <div class="social-links">
          <a
            v-for="link in socialEntries()"
            :key="link.key"
            :href="link.url"
            target="_blank"
            rel="noopener"
            class="social-link glass-btn"
          >
            <span class="social-icon">{{ socialIcons[link.key] || '○' }}</span>
            <span>{{ socialLabels[link.key] || link.key }}</span>
          </a>
        </div>
      </div>

      <!-- 写作热力图 -->
      <div class="about-heatmap glass-card" v-if="Object.keys(heatmap).length">
        <h3 class="social-title">写作活跃度</h3>
        <div class="heatmap-grid">
          <div
            v-for="(count, date) in heatmap"
            :key="date"
            class="heatmap-cell"
            :style="{ background: getHeatColor(count) }"
            :title="`${date}: ${count} 篇`"
          />
        </div>
        <div class="heatmap-legend">
          <span>少</span>
          <span class="legend-swatch" style="background: rgba(139, 69, 19, 0.06)" />
          <span class="legend-swatch" style="background: rgba(139, 69, 19, 0.18)" />
          <span class="legend-swatch" style="background: rgba(139, 69, 19, 0.35)" />
          <span class="legend-swatch" style="background: rgba(139, 69, 19, 0.6)" />
          <span class="legend-swatch" style="background: rgba(139, 69, 19, 0.85)" />
          <span>多</span>
        </div>
      </div>
    </template>
  </div>
</template>


<style scoped>
.about-page {
  max-width: 720px;
  margin: 0 auto;
}

/* ---------- 顶部头像 ---------- */
.about-hero {
  text-align: center;
  padding: 48px 40px;
  margin-bottom: 28px;
}

.about-avatar {
  margin-bottom: 24px;
}

.avatar-ring-lg {
  width: 120px;
  height: 120px;
  margin: 0 auto;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent-article));
  position: relative;
}

.avatar-ring-lg::before {
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
  font-size: 44px;
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

.about-name {
  font-size: 30px;
  margin-bottom: 12px;
  background: linear-gradient(135deg, var(--color-text), var(--color-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.about-signature {
  font-family: var(--font-mono);
  font-size: 14px;
  color: var(--color-text-secondary);
}

/* ---------- 通用分段卡片 ---------- */
.about-section {
  padding: 28px 32px;
  margin-bottom: 18px;
}

.section-heading {
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-num {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-muted);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  padding: 2px 10px;
  flex-shrink: 0;
}

.section-body p {
  font-size: 15px;
  line-height: 1.85;
  color: var(--color-text-secondary);
  margin: 0 0 12px;
}

.section-body p:last-child {
  margin-bottom: 0;
}

.section-note {
  font-size: 14px !important;
  color: var(--color-text-muted) !important;
  font-style: italic;
}

/* ---------- 网站技术规格 ---------- */
.tech-specs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 16px 0;
}

.tech-spec {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 14px;
  background: var(--glass-bg);
  border-radius: var(--radius-sm);
  border: 1px solid var(--glass-border);
}

.spec-label {
  font-size: 12px;
  color: var(--color-text-muted);
}

.spec-value {
  font-size: 14px;
  color: var(--color-text);
  font-weight: 500;
}

/* ---------- 技术栈 ---------- */
.stack-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin: 16px 0;
}

.stack-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  background: var(--glass-bg);
  border-radius: var(--radius-sm);
  border: 1px solid var(--glass-border);
}

.stack-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 4px;
  flex-shrink: 0;
}

.stack-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.stack-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.stack-desc {
  font-size: 12px;
  color: var(--color-text-muted);
}

.stack-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.stack-tag {
  font-family: var(--font-mono);
  font-size: 12px;
  padding: 4px 14px;
  border-radius: 999px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  color: var(--color-text-secondary);
}

/* ---------- 统计数据 ---------- */
.about-stats {
  padding: 24px 32px;
  margin-bottom: 18px;
}

.stats-grid {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 16px;
}

.stat-item {
  text-align: center;
}

.stat-num {
  display: block;
  font-family: var(--font-mono);
  font-size: 22px;
  font-weight: 900;
  color: var(--color-primary);
}

.stat-lbl {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 4px;
}

/* ---------- 社交链接 ---------- */
.about-social {
  padding: 24px 32px;
  margin-bottom: 18px;
}

.social-title {
  font-family: var(--font-serif);
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
}

.social-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.social-link {
  font-size: 13px;
  padding: 8px 18px;
  text-decoration: none;
  color: var(--color-text-secondary);
  gap: 6px;
}

.social-icon {
  font-size: 15px;
}

/* ---------- 热力图 ---------- */
.about-heatmap {
  padding: 24px 32px;
  margin-bottom: 18px;
}

.heatmap-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-bottom: 16px;
}

.heatmap-cell {
  width: 14px;
  height: 14px;
  border-radius: 2px;
  transition: transform var(--transition-fast);
}

.heatmap-cell:hover {
  transform: scale(1.5);
  z-index: 1;
}

.heatmap-legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.legend-swatch {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

@media (max-width: 768px) {
  .about-hero {
    padding: 32px 24px;
  }

  .about-section,
  .about-stats,
  .about-social,
  .about-heatmap {
    padding: 20px;
  }

  .tech-specs,
  .stack-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    gap: 12px;
  }

  .stat-num {
    font-size: 20px;
  }

  .heatmap-cell {
    width: 11px;
    height: 11px;
  }

  .social-links {
    flex-direction: column;
  }

  .social-link {
    justify-content: center;
  }
}
</style>
