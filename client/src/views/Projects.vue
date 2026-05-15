<script setup>
import { ref, onMounted } from 'vue'
import { configApi } from '../api'

const repos = ref([])
const loading = ref(true)
const error = ref(null)

const langColors = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Vue: '#41b883',
  Python: '#3572A5',
  Go: '#00ADD8',
  Rust: '#dea584',
  Java: '#b07219',
  CSS: '#563d7c',
  HTML: '#e34c26',
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

onMounted(async () => {
  try {
    const config = await configApi.getPublic()
    const repoList = config?.github_config?.repos
    if (!repoList?.length) {
      error.value = '暂未配置开源项目'
      return
    }
    repos.value = repoList
  } catch (e) {
    error.value = '加载项目数据失败'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1 class="page-title">✦ 开源项目</h1>
    </div>

    <!-- 骨架屏 -->
    <div v-if="loading" class="repo-grid">
      <div v-for="i in 4" :key="i" class="skeleton" style="height: 160px" />
    </div>

    <!-- 错误 -->
    <div v-else-if="error" class="empty-state">
      <span class="empty-icon">⬡</span>
      <p>{{ error }}</p>
    </div>

    <!-- 项目列表 -->
    <div v-else-if="repos.length" class="repo-grid">
      <a
        v-for="(repo, index) in repos"
        :key="index"
        :href="repo.html_url || repo.url"
        target="_blank"
        rel="noopener"
        class="repo-card glass-card"
      >
        <div class="repo-header">
          <span class="repo-icon">⬡</span>
          <h3 class="repo-name">{{ repo.name }}</h3>
          <span class="repo-stars" v-if="repo.stargazers_count != null">★ {{ repo.stargazers_count }}</span>
        </div>

        <p class="repo-desc" v-if="repo.description">{{ repo.description }}</p>

        <div class="repo-footer">
          <span class="repo-lang" v-if="repo.language">
            <span
              class="lang-dot"
              :style="{ background: langColors[repo.language] || '#999' }"
            />
            {{ repo.language }}
          </span>
          <span class="repo-updated">更新于 {{ formatDate(repo.updated_at || repo.updatedAt) }}</span>
        </div>
      </a>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <span class="empty-icon">📦</span>
      <p>暂无公开项目</p>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-desc {
  color: var(--color-text-muted);
  font-size: 15px;
  margin-top: 8px;
  font-family: var(--font-mono);
}

.repo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;
}

.repo-card {
  display: flex;
  flex-direction: column;
  padding: 24px;
  text-decoration: none;
  color: inherit;
  cursor: var(--cursor-sparkle-glow);
}

.repo-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.repo-icon {
  font-size: 16px;
  color: var(--color-primary);
  flex-shrink: 0;
}

.repo-name {
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 600;
  color: var(--color-primary);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.repo-stars {
  font-size: 13px;
  font-weight: 600;
  color: #f0b400;
  flex-shrink: 0;
}

.repo-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  flex: 1;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.repo-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--color-text-muted);
}

.repo-lang {
  display: flex;
  align-items: center;
  gap: 5px;
}

.lang-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.repo-updated {
  font-family: var(--font-mono);
  font-size: 11px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--color-text-muted);
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .repo-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
