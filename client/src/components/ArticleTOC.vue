<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  content: { type: String, default: '' },
  avatar: { type: String, default: '' },
  signature: { type: String, default: '' }
})

const headings = ref([])
const activeId = ref('')
const tocOpen = ref(false)

let observer = null

// 解析 HTML 提取标题，补 id
function parseHeadings(html) {
  if (!html) return []
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const els = doc.querySelectorAll('h1, h2, h3, h4')
  const result = []

  els.forEach((el, i) => {
    const level = parseInt(el.tagName.charAt(1))
    const text = el.textContent.trim()
    if (!text) return
    let id = el.getAttribute('id')
    if (!id) {
      id = 'heading-' + i + '-' + encodeURIComponent(text.slice(0, 30))
      el.setAttribute('id', id)
    }
    result.push({ id, level, text })
  })

  return result
}

// 字数统计（去 HTML 标签）
const wordCount = computed(() => {
  if (!props.content) return 0
  return props.content.replace(/<[^>]+>/g, '').replace(/\s+/g, '').length
})

// 阅读时间（中文约 300 字/分钟）
const readingTime = computed(() => Math.max(1, Math.ceil(wordCount.value / 300)))

// 格式化字数
const fmtWordCount = computed(() => {
  const n = wordCount.value
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return n
})

// 提取序列化后的 HTML（已补 id），供外部渲染
const enrichedHTML = computed(() => {
  if (!props.content) return ''
  const parser = new DOMParser()
  const doc = parser.parseFromString(props.content, 'text/html')
  const els = doc.querySelectorAll('h1, h2, h3, h4')
  els.forEach((el, i) => {
    if (!el.getAttribute('id')) {
      el.setAttribute('id', 'heading-' + i + '-' + encodeURIComponent(el.textContent.trim().slice(0, 30)))
    }
  })
  return doc.body.innerHTML
})

// 监听正文滚动，高亮当前标题
function setupObserver() {
  if (observer) observer.disconnect()

  const targets = []
  headings.value.forEach(h => {
    const el = document.getElementById(h.id)
    if (el) targets.push(el)
  })

  if (!targets.length) return

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeId.value = entry.target.id
          break
        }
      }
    },
    { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
  )

  targets.forEach(el => observer.observe(el))
}

function scrollToHeading(id) {
  tocOpen.value = false
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeId.value = id
  }
}

function getIndentClass(level) {
  return `toc-indent-${level}`
}

watch(() => props.content, () => {
  headings.value = parseHeadings(props.content)
  nextTick(() => setupObserver())
})

onMounted(() => {
  if (props.content) {
    headings.value = parseHeadings(props.content)
    nextTick(() => setupObserver())
  }
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})

defineExpose({ enrichedHTML })
</script>

<template>
  <div class="toc-wrapper" :class="{ 'toc-wrapper--open': tocOpen }">
    <!-- 移动端浮动按钮 -->
    <button class="toc-toggle glass-btn" @click="tocOpen = !tocOpen">
      <span class="toc-toggle-icon">&#9776;</span>
      <span>目录</span>
    </button>

    <!-- TOC 面板 -->
    <aside class="toc-panel glass-card">
      <!-- 作者信息 -->
      <div class="toc-author" v-if="avatar || signature">
        <div class="toc-author-avatar" v-if="avatar">
          <img :src="avatar" alt="avatar" />
        </div>
        <p class="toc-author-sig" v-if="signature">{{ signature }}</p>
      </div>

      <!-- 阅读统计 -->
      <div class="toc-stats">
        <div class="toc-stat">
          <span class="toc-stat-value">{{ readingTime }} min</span>
          <span class="toc-stat-label">阅读时长</span>
        </div>
        <div class="toc-stat">
          <span class="toc-stat-value">{{ fmtWordCount }}</span>
          <span class="toc-stat-label">字数</span>
        </div>
      </div>

      <!-- 目录树 -->
      <div class="toc-tree" v-if="headings.length">
        <h4 class="toc-title">目录</h4>
        <nav class="toc-nav">
          <a
            v-for="h in headings"
            :key="h.id"
            :class="['toc-link', getIndentClass(h.level), { 'toc-link--active': activeId === h.id }]"
            @click.prevent="scrollToHeading(h.id)"
          >{{ h.text }}</a>
        </nav>
      </div>

      <div class="toc-empty" v-else>
        <p>暂无目录</p>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.toc-wrapper {
  position: fixed;
  top: 88px;
  left: max(24px, calc((100vw - 1100px) / 2));
  width: 220px;
  z-index: 100;
}

/* 移动端折叠按钮 */
.toc-toggle {
  display: none;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  padding: 8px 16px;
  margin-bottom: 12px;
}

.toc-toggle-icon {
  font-size: 16px;
}

/* 作者信息 */
.toc-author {
  text-align: center;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--glass-border);
}

.toc-author-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 10px;
  border: 2px solid var(--glass-border);
}

.toc-author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.toc-author-sig {
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  font-style: italic;
}

/* 面板 */
.toc-panel {
  padding: 20px;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(139, 69, 19, 0.15) transparent;
}

/* 阅读统计 */
.toc-stats {
  display: flex;
  gap: 12px;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--glass-border);
}

.toc-stat {
  flex: 1;
  text-align: center;
}

.toc-stat-value {
  display: block;
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 700;
  color: var(--color-primary);
}

.toc-stat-label {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 2px;
}

/* 目录树 */
.toc-title {
  font-family: var(--font-serif);
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 12px;
}

.toc-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.toc-link {
  display: block;
  font-size: 13px;
  color: var(--color-text-muted);
  text-decoration: none;
  padding: 5px 8px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toc-link:hover {
  color: var(--color-text);
  background: rgba(139, 69, 19, 0.05);
}

.toc-link--active {
  color: var(--color-primary);
  background: rgba(139, 69, 19, 0.08);
  font-weight: 500;
}

/* 层级缩进 */
.toc-indent-1 { padding-left: 8px; font-weight: 600; }
.toc-indent-2 { padding-left: 20px; }
.toc-indent-3 { padding-left: 32px; font-size: 12px; }
.toc-indent-4 { padding-left: 44px; font-size: 12px; }

/* 空状态 */
.toc-empty {
  text-align: center;
  padding: 24px 0;
  color: var(--color-text-muted);
  font-size: 13px;
}

/* 移动端 */
@media (max-width: 1024px) {
  .toc-wrapper {
    position: static;
    width: 100%;
    margin-bottom: 20px;
  }

  .toc-toggle {
    display: flex;
  }

  .toc-panel {
    display: none;
  }

  .toc-wrapper--open .toc-panel {
    display: block;
  }
}
</style>
