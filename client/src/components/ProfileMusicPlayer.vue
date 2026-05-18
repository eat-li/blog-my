<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useMusicStore } from '../stores/music'
import { configApi } from '../api'

const store = useMusicStore()
const { currentIndex, isPlaying, configLoaded } = storeToRefs(store)

const currentSong = computed(() => store.currentSong)
const progressPercent = computed(() => store.progressPercent)
const hasSongs = computed(() => store.hasSongs)

function togglePlay() { store.togglePlay() }
function next() { store.next() }

async function init() {
  try {
    const config = await configApi.getPublic()
    if (!store.initFromConfig(config)) return
    store.initAudio()
  } catch { /* 静默失败 */ }
}

onMounted(init)

onUnmounted(() => {
  // 不销毁 Audio，浮动播放器可能还在使用
  // 只是当前组件卸载，store 状态保留
})
</script>

<template>
  <div v-if="configLoaded && hasSongs" class="profile-music">
    <!-- 封面 -->
    <div class="pm-cover" :class="{ 'pm-cover--spinning': isPlaying }">
      <img v-if="currentSong?.cover" :src="currentSong.cover" :alt="currentSong.title" class="pm-cover-img" />
      <span v-else class="pm-cover-icon">&#9835;</span>
    </div>

    <!-- 信息区 -->
    <div class="pm-info">
      <span class="pm-title">{{ currentSong?.title || '无标题' }}</span>
      <span class="pm-artist" v-if="currentSong?.artist">{{ currentSong.artist }}</span>
      <span class="pm-artist" v-else>未在播放</span>
    </div>

    <!-- 进度条 -->
    <div class="pm-progress-wrap">
      <div class="pm-progress" @click="(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        store.seekTo(pct)
      }">
        <div class="pm-progress-fill" :style="{ width: progressPercent + '%' }" />
      </div>
    </div>

    <!-- 控制按钮 -->
    <div class="pm-controls">
      <button class="pm-btn pm-btn--play" @click="togglePlay" :title="isPlaying ? '暂停' : '播放'">
        <svg v-if="isPlaying" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
        <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>
      <button class="pm-btn" @click="next" title="下一首">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.profile-music {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  background: #f8f0e6;
  border: 1px solid rgba(139, 69, 19, 0.08);
  transition: all var(--transition-base);
  max-width: 620px;
  position: relative;
}

.profile-music:hover {
  background: #f3e8d8;
  border-color: rgba(139, 69, 19, 0.15);
}

/* 封面 */
.pm-cover {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent-article));
  box-shadow: 0 2px 12px rgba(139, 69, 19, 0.15);
  overflow: hidden;
}

.pm-cover--spinning .pm-cover-img {
  animation: pmSpin 8s linear infinite;
}

@keyframes pmSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.pm-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pm-cover-icon {
  font-size: 18px;
  color: #fff;
  line-height: 1;
}

/* 信息 */
.pm-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.pm-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pm-artist {
  font-size: 11px;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 进度条 — hover 时浮现 */
.pm-progress-wrap {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: -5px;
  opacity: 0;
  transform: translateY(2px);
  transition: opacity 0.25s ease, transform 0.25s ease;
  pointer-events: none;
}

.profile-music:hover .pm-progress-wrap {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.pm-progress {
  width: 100%;
  height: 3px;
  background: rgba(139, 69, 19, 0.08);
  border-radius: 2px;
  cursor: pointer;
  position: relative;
}

.pm-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent-article));
  border-radius: 2px;
  transition: width 0.15s linear;
}

/* 控制按钮 */
.pm-controls {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.pm-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: 50%;
  transition: all var(--transition-fast);
}

.pm-btn:hover {
  color: var(--color-primary);
  background: rgba(139, 69, 19, 0.08);
}

.pm-btn--play {
  width: 34px;
  height: 34px;
  background: var(--glass-bg);
  border: 1px solid rgba(139, 69, 19, 0.15);
  color: var(--color-primary);
}

.pm-btn--play:hover {
  background: var(--glass-bg-hover);
  border-color: var(--color-primary);
  box-shadow: 0 2px 12px var(--color-primary-glow);
  transform: scale(1.05);
}

/* 暗色模式 */
[data-theme="dark"] .profile-music {
  background: rgba(255, 250, 240, 0.06);
  border-color: rgba(255, 255, 255, 0.06);
}

[data-theme="dark"] .profile-music:hover {
  background: rgba(255, 250, 240, 0.10);
  border-color: rgba(255, 255, 255, 0.10);
}

[data-theme="dark"] .pm-progress {
  background: rgba(255, 255, 255, 0.08);
}

/* 移动端始终显示进度条 */
@media (max-width: 768px) {
  .profile-music {
    gap: 8px;
    padding: 8px 12px;
    flex-wrap: wrap;
  }

  .pm-progress-wrap {
    position: static;
    opacity: 1;
    transform: none;
    pointer-events: auto;
    order: 10;
    width: 100%;
    flex-basis: 100%;
    margin-top: 2px;
  }

  .pm-controls {
    margin-left: auto;
  }
}
</style>
