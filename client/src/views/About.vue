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
</script>

<template>
  <div class="page about-page">
    <!-- 个人介绍 -->
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
      <p class="about-desc" v-if="siteInfo?.description">{{ siteInfo.description }}</p>
    </div>

    <!-- 骨架屏 -->
    <template v-if="loading">
      <div class="skeleton" style="height: 80px; margin-bottom: 20px" />
      <div class="skeleton" style="height: 200px; margin-bottom: 20px" />
    </template>

    <template v-else>
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

      <!-- 社交链接 -->
      <div class="about-social glass-card" v-if="socialEntries().length">
        <h3 class="about-section-title">通过以下平台找到我</h3>
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
        <h3 class="about-section-title">🔥 写作活跃度</h3>
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

.about-hero {
  text-align: center;
  padding: 48px 40px;
  margin-bottom: 24px;
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
  margin-bottom: 16px;
}

.about-desc {
  font-size: 15px;
  color: var(--color-text-muted);
  line-height: 1.7;
}

.about-section-title {
  font-family: var(--font-serif);
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--color-text);
}

/* 数据统计 */
.about-stats {
  padding: 28px 32px;
  margin-bottom: 24px;
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
  font-size: 24px;
  font-weight: 900;
  color: var(--color-primary);
}

.stat-lbl {
  font-size: 13px;
  color: var(--color-text-muted);
  margin-top: 4px;
}

/* 社交链接 */
.about-social {
  padding: 28px 32px;
  margin-bottom: 24px;
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

/* 热力图 */
.about-heatmap {
  padding: 28px 32px;
  margin-bottom: 24px;
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

  .about-stats,
  .about-social,
  .about-heatmap {
    padding: 20px;
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
