<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import request from '../utils/request'
import { statsApi } from '../api'

const hasLaunched = ref(false)
const siteUptime = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })
const totalViews = ref(0)
const socialLinks = ref([])
const year = ref(new Date().getFullYear())
let timer = null

const socialIcons = {
  github: '⬡',
  bilibili: '▸',
  email: '✉',
  twitter: '✕',
  weibo: '◎',
  douyin: '♬',
  zhihu: '▼',
  juejin: '◆',
}

const socialLabels = {
  github: 'GitHub',
  bilibili: 'Bilibili',
  email: 'Email',
  twitter: 'Twitter',
  weibo: '微博',
  douyin: '抖音',
  zhihu: '知乎',
  juejin: '掘金',
}

function calcUptime(launchDate) {
  const diff = Date.now() - new Date(launchDate).getTime()
  const s = Math.floor(diff / 1000)
  siteUptime.value = {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  }
}

async function fetchFooterData() {
  try {
    const config = await request.get('/config/public')
    if (config.site_info?.launch_date) {
      hasLaunched.value = true
      calcUptime(config.site_info.launch_date)
      timer = setInterval(() => calcUptime(config.site_info.launch_date), 1000)
    }
    if (config.social_links) {
      socialLinks.value = Object.entries(config.social_links).map(([key, url]) => ({ key, url }))
    }
  } catch (e) { /* ignore */ }

  try {
    const stats = await statsApi.profile()
    totalViews.value = stats.totalViews || 0
  } catch (e) { /* ignore */ }
}

onMounted(fetchFooterData)
onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <!-- 社交链接 -->
      <div class="footer-social" v-if="socialLinks.length">
        <a
          v-for="link in socialLinks"
          :key="link.key"
          :href="link.url"
          target="_blank"
          rel="noopener"
          class="social-icon-link"
          :title="socialLabels[link.key] || link.key"
        >
          <span class="social-icon">{{ socialIcons[link.key] || '○' }}</span>
          <span class="social-label">{{ socialLabels[link.key] || link.key }}</span>
        </a>
      </div>

      <!-- 站点信息 -->
      <div class="footer-info">
        <div class="footer-divider" />
        <p class="footer-copy">
          &copy; {{ year }}
          <span class="footer-brand">EatLi</span>
          <span class="footer-sep">·</span>
          用
          <span class="footer-heart">♥</span>
          书写每一行
        </p>
        <p class="footer-uptime" v-if="hasLaunched">
          <span class="uptime-label">🕰 存活</span>
          <span class="uptime-value">
            {{ String(siteUptime.days).padStart(3, '0') }}<span class="uptime-unit">天</span>
            {{ String(siteUptime.hours).padStart(2, '0') }}<span class="uptime-unit">时</span>
            {{ String(siteUptime.minutes).padStart(2, '0') }}<span class="uptime-unit">分</span>
            {{ String(siteUptime.seconds).padStart(2, '0') }}<span class="uptime-unit">秒</span>
          </span>
        </p>
        <p class="footer-views" v-if="totalViews > 0">
          <span class="views-label">👁 总访问</span>
          <span class="views-value">
            {{ totalViews.toLocaleString() }}<span class="views-unit">次</span>
          </span>
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  position: relative;
  margin-top: 80px;
  padding: 32px 0 40px;
  background: rgba(44, 44, 44, 0.04);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid var(--glass-border);
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
}

/* 社交链接 */
.footer-social {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.social-icon-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 13px;
  color: var(--color-text-secondary);
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-full);
  text-decoration: none;
  transition: all var(--transition-base);
}

.social-icon-link:hover {
  color: var(--color-primary);
  background: var(--glass-bg-hover);
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 69, 19, 0.1);
}

.social-icon {
  font-size: 16px;
  line-height: 1;
}

.social-label {
  font-weight: 500;
}

/* 分割线 */
.footer-divider {
  width: 60px;
  height: 1px;
  margin: 0 auto 20px;
  background: linear-gradient(90deg, transparent, var(--color-primary), transparent);
  opacity: 0.3;
}

/* 站点信息 */
.footer-info p {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 4px 0;
}

.footer-brand {
  font-family: var(--font-serif);
  font-weight: 700;
  color: var(--color-text-secondary);
}

.footer-sep {
  margin: 0 4px;
  opacity: 0.5;
}

.footer-heart {
  display: inline-block;
  color: var(--color-accent-anime);
  animation: heartBeat 1.5s ease-in-out infinite;
  margin: 0 2px;
}

@keyframes heartBeat {
  0%, 100% { transform: scale(1); }
  15% { transform: scale(1.2); }
  30% { transform: scale(1); }
  45% { transform: scale(1.15); }
  60% { transform: scale(1); }
}

/* 存活时间 */
.footer-uptime {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  padding: 6px 16px;
  background: var(--glass-bg);
  border-radius: var(--radius-full);
  border: 1px solid var(--glass-border);
  font-variant-numeric: tabular-nums;
}

.uptime-label {
  font-size: 12px;
  color: var(--color-text-muted);
}

.uptime-value {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--color-text-secondary);
  letter-spacing: 1px;
}

.uptime-unit {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-right: 2px;
}

.uptime-unit:last-child {
  margin-right: 0;
}

/* 访问量 */
.footer-views {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  padding: 6px 16px;
  background: var(--glass-bg);
  border-radius: var(--radius-full);
  border: 1px solid var(--glass-border);
}

.views-label {
  font-size: 12px;
  color: var(--color-text-muted);
}

.views-value {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--color-primary);
  font-weight: 500;
  letter-spacing: 1px;
}

.views-unit {
  font-size: 11px;
  color: var(--color-text-muted);
}

@media (max-width: 768px) {
  .app-footer {
    margin-top: 48px;
    padding: 24px 0 32px;
  }
  .social-icon-link {
    padding: 6px 12px;
    font-size: 12px;
  }
  .social-label {
    display: none;
  }
  .footer-uptime {
    padding: 4px 12px;
  }
  .footer-views {
    padding: 4px 12px;
  }
}
</style>
