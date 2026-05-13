<script setup>
import { ref, onMounted } from 'vue'
import { configApi, statsApi, postApi } from '../api'

const siteInfo = ref(null)
const socialLinks = ref({})
const stats = ref(null)
const heatmap = ref({})
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

// 技术栈数据
const techStack = [
  
  { name: 'Vue 3', desc: '前端框架，组合式 API + Vite 构建', color: '#41b883' },
  { name: 'Express 5', desc: '后端框架，三层分层架构', color: '#888' },
  { name: 'MySQL', desc: '关系型数据库，Sequelize ORM', color: '#4479A1' },
  { name: '阿里云 OSS', desc: '对象存储，图片音频上传', color: '#FF6A00' },
  { name: 'Pinia', desc: '状态管理，Token 鉴权', color: '#f0b400' },
  { name: 'Axios', desc: 'HTTP 请求，拦截器封装', color: '#5A29E4' },
]

const siteTech = [
  { label: '设计风格', value: '磨砂玻璃 Glassmorphism' },
  { label: '动画特效', value: '落樱飘落、翻页加载、像素吉祥物' },
  { label: '部署方式', value: '前后端分离，Vite 代理开发' },
  { label: '认证方案', value: 'JWT Bearer Token + 路由守卫' },
]
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
          欢迎来到我的小站
        </h2>
        <div class="section-body">
          <p>欢迎来到 EatLi 的博客，一个记录技术成长与二次元生活的小角落。</p>
          <p>这里有前端开发的技术沉淀，也有动漫和 Galgame 的观后感，每一篇文章都是我用心写下的笔记。希望你能在这里找到感兴趣的內容，无论是代码还是故事。</p>
          <p>如果有什么想说的，欢迎去留言板留下足迹。</p>
        </div>
      </section>

      <!-- 二、网站技术搭建 -->
      <section class="about-section glass-card">
        <h2 class="section-heading">
          <span class="section-num">02</span>
          网站技术搭建
        </h2>
        <div class="section-body">
          <p>本站采用前后端分离架构，前端基于 Vue 3 + Vite 构建，后端基于 Express 5 + Sequelize + MySQL，文件存储使用阿里云 OSS。</p>
          <div class="tech-specs">
            <div v-for="item in siteTech" :key="item.label" class="tech-spec">
              <span class="spec-label">{{ item.label }}</span>
              <span class="spec-value">{{ item.value }}</span>
            </div>
          </div>
          <p class="section-note">整体 UI 采用磨砂玻璃（Glassmorphism）设计系统，温暖复古配色，配合落樱飘落、翻页加载等交互细节，营造一个舒适复古的个人空間。</p>
        </div>
      </section>

      <!-- 三、关于我自己 -->
      <section class="about-section glass-card">
        <h2 class="section-heading">
          <span class="section-num">03</span>
          关于我自己
        </h2>
        <div class="section-body">
          <p>{{ siteInfo?.description || '一个热爱前端开发的宅男，喜欢研究新奇的 Web 技术，也沉迷于优秀的故事作品。' }}</p>
          <p>工作之余最大的爱好就是推 Galgame 和追番，尤其偏爱 Key 社的催泪作品和芳文社的日常番。每年都会认真挑选几部新作来写感想，这已经成为生活中不可或缺的一部分。</p>
          <p>技术方面，目前专注于 Vue 生态和 Node.js 后端开发，对 UI 设计和交互体验有较高的追求，喜欢打磨细节。</p>
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
          个人感悟
        </h2>
        <div class="section-body">
          <p>写博客是一件需要坚持的事情。每写完一篇文章，都感觉自己又沉淀了一些東西。技术文章帮助自己梳理知识体系，动漫和 Galgame 的感想则是对美好作品的致敬。</p>
          <p>一个好的故事能改变一个人看待世界的方式。Key 社的作品教会我「即使结局注定悲伤，过程依然值得珍惜」；日常番则提醒我「平凡的日子也可以闪闪发光」。</p>
          <p>写代码也是如此 — 好的代码不只是功能的堆砌，更是对细节的尊重。从 UI 的交互动效到后端的分层架构，每一个决策背后都代表着一种审美。</p>
        </div>
      </section>

      <!-- 五、个人技术栈 -->
      <section class="about-section glass-card">
        <h2 class="section-heading">
          <span class="section-num">05</span>
          个人技术栈
        </h2>
        <div class="section-body">
          <p>以下是我目前主要使用的技术和工具，持续学习中。</p>
          <div class="stack-grid">
            <div v-for="tech in techStack" :key="tech.name" class="stack-item">
              <span class="stack-dot" :style="{ background: tech.color }" />
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
