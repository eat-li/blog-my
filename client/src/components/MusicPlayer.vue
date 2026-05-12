<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { configApi } from '../api'

// ——— 状态 ———
const songs = ref([])
const currentIndex = ref(0)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(0.5)
const shuffle = ref(false)
const expanded = ref(false)
const configLoaded = ref(false)

const STORAGE_PREFIX = 'music_'
const audio = new Audio()

// ——— 计算属性 ———
const currentSong = computed(() => songs.value[currentIndex.value] || null)
const progressPercent = computed(() =>
  duration.value ? (currentTime.value / duration.value) * 100 : 0
)
const hasSongs = computed(() => songs.value.length > 0)

// shuffledIndexes 存储洗牌后的索引序列
const shuffledIndexes = ref([])
const displayPlaylist = computed(() => {
  if (!shuffle.value || shuffledIndexes.value.length === 0) {
    return songs.value.map((s, i) => ({ ...s, index: i }))
  }
  return shuffledIndexes.value.map(i => ({ ...songs.value[i], index: i }))
})

// ——— localStorage 读写 ———
function saveState() {
  try {
    localStorage.setItem(STORAGE_PREFIX + 'playing', isPlaying.value)
    localStorage.setItem(STORAGE_PREFIX + 'current', currentIndex.value)
    localStorage.setItem(STORAGE_PREFIX + 'time', currentTime.value)
    localStorage.setItem(STORAGE_PREFIX + 'volume', volume.value)
  } catch { /* quota exceeded, ignore */ }
}

function restoreState() {
  try {
    const p = localStorage.getItem(STORAGE_PREFIX + 'playing')
    const c = localStorage.getItem(STORAGE_PREFIX + 'current')
    const t = localStorage.getItem(STORAGE_PREFIX + 'time')
    const v = localStorage.getItem(STORAGE_PREFIX + 'volume')

    if (c !== null) {
      const idx = parseInt(c)
      if (!isNaN(idx) && idx >= 0 && idx < songs.value.length) currentIndex.value = idx
    }
    if (p !== null) isPlaying.value = p === 'true'
    if (t !== null && !isNaN(parseFloat(t))) currentTime.value = parseFloat(t)
    if (v !== null && !isNaN(parseFloat(v))) volume.value = Math.max(0, Math.min(1, parseFloat(v)))
  } catch { /* corrupted, ignore */ }
}

// ——— 洗牌 ———
function generateShuffledOrder() {
  const n = songs.value.length
  const arr = Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  shuffledIndexes.value = arr
}

// ——— 音频事件 ———
function onLoadedMetadata() { duration.value = audio.duration }
function onTimeUpdate() { currentTime.value = audio.currentTime }
function onEnded() {
  next()
}
function onError() {
  // 加载失败，1秒后切到下一首
  setTimeout(() => {
    if (songs.value.length) next()
  }, 1000)
}
function onPlay() { isPlaying.value = true }
function onPause() { isPlaying.value = false }

function bindAudioEvents() {
  audio.addEventListener('loadedmetadata', onLoadedMetadata)
  audio.addEventListener('timeupdate', onTimeUpdate)
  audio.addEventListener('ended', onEnded)
  audio.addEventListener('error', onError)
  audio.addEventListener('play', onPlay)
  audio.addEventListener('pause', onPause)
}

function unbindAudioEvents() {
  audio.removeEventListener('loadedmetadata', onLoadedMetadata)
  audio.removeEventListener('timeupdate', onTimeUpdate)
  audio.removeEventListener('ended', onEnded)
  audio.removeEventListener('error', onError)
  audio.removeEventListener('play', onPlay)
  audio.removeEventListener('pause', onPause)
}

// ——— 核心操作 ———
function loadSong(index) {
  if (!songs.value[index]) return
  currentIndex.value = index
  audio.src = songs.value[index].url
  audio.load()
}

function playSong(index) {
  loadSong(index)
  audio.play().catch(() => {})
}

function togglePlay() {
  if (!currentSong.value) return
  if (isPlaying.value) {
    audio.pause()
  } else {
    audio.play().catch(() => {})
  }
}

function next() {
  if (!songs.value.length) return
  if (shuffle.value && shuffledIndexes.value.length) {
    // 找到当前 index 在洗牌序中的位置，取下一个
    const pos = shuffledIndexes.value.indexOf(currentIndex.value)
    const nextPos = (pos + 1) % shuffledIndexes.value.length
    playSong(shuffledIndexes.value[nextPos])
  } else {
    playSong((currentIndex.value + 1) % songs.value.length)
  }
}

function prev() {
  if (!songs.value.length) return
  if (shuffle.value && shuffledIndexes.value.length) {
    const pos = shuffledIndexes.value.indexOf(currentIndex.value)
    const prevPos = (pos - 1 + shuffledIndexes.value.length) % shuffledIndexes.value.length
    playSong(shuffledIndexes.value[prevPos])
  } else {
    playSong((currentIndex.value - 1 + songs.value.length) % songs.value.length)
  }
}

function toggleShuffle() {
  shuffle.value = !shuffle.value
  if (shuffle.value) generateShuffledOrder()
  else shuffledIndexes.value = []
  saveState()
}

function setVolume(e) {
  volume.value = parseFloat(e.target.value)
}

function seekTo(event) {
  const rect = event.currentTarget.getBoundingClientRect()
  const x = event.clientX - rect.left
  const pct = Math.max(0, Math.min(1, x / rect.width))
  audio.currentTime = pct * duration.value
}

function selectSong(index) {
  if (index === currentIndex.value && currentSong.value) {
    togglePlay()
    return
  }
  playSong(index)
}

// ——— 自动播放策略 ———
async function tryAutoplay() {
  try {
    await audio.play()
    isPlaying.value = true
  } catch {
    isPlaying.value = false
  }
}

// ——— 时间格式化 ———
function fmtTime(s) {
  if (!s || isNaN(s)) return '00:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

// ——— 初始化 ———
async function init() {
  try {
    const config = await configApi.getPublic()
    if (!config.music || !config.music.songs?.length) return

    songs.value = config.music.songs
    volume.value = config.music.volume ?? 0.5
    shuffle.value = config.music.shuffle ?? false
    audio.volume = volume.value

    if (shuffle.value) generateShuffledOrder()

    restoreState()
    bindAudioEvents()
    loadSong(currentIndex.value)

    // 恢复播放进度
    const savedTime = parseFloat(localStorage.getItem(STORAGE_PREFIX + 'time'))
    if (savedTime > 0 && !isNaN(savedTime)) {
      audio.addEventListener('loadedmetadata', function restore() {
        audio.currentTime = savedTime
        audio.removeEventListener('loadedmetadata', restore)
      }, { once: true })
    }

    if (isPlaying.value || config.music.autoplay) {
      tryAutoplay()
    }

    configLoaded.value = true
  } catch { /* config load failed, silently ignore */ }
}

// ——— 生命周期 ———
onMounted(init)

const saveInterval = setInterval(saveState, 5000)

onUnmounted(() => {
  saveState()
  clearInterval(saveInterval)
  unbindAudioEvents()
  audio.pause()
})

// 关键状态变化即时保存
watch([isPlaying, currentIndex], () => saveState())
watch(volume, () => { audio.volume = volume.value; saveState() })
</script>

<template>
  <div v-if="configLoaded && hasSongs" class="music-player" :class="{ 'music-player--expanded': expanded }">
    <!-- 迷你模式 -->
    <transition name="music-mini-fade">
      <div v-if="!expanded" class="music-mini glass-card" @click="expanded = true" title="展开播放器">
        <span class="music-icon" :class="{ playing: isPlaying }">♬</span>
        <span class="music-title-mini">{{ currentSong?.title || '无标题' }}</span>
        <span class="music-artist-mini" v-if="currentSong?.artist">- {{ currentSong.artist }}</span>
        <span class="music-badge-mini" v-if="isPlaying">♪</span>
      </div>
    </transition>

    <!-- 展开模式 -->
    <transition name="music-expand">
      <div v-if="expanded" class="music-expanded glass-card">
        <!-- 头部 -->
        <div class="music-header">
          <span class="music-header-title">♬ 今の音楽</span>
          <button class="music-close" @click="expanded = false" title="收起">✕</button>
        </div>

        <!-- 进度条 -->
        <div class="music-progress-area">
          <div class="music-progress-bar" @click="seekTo">
            <div class="music-progress-fill" :style="{ width: progressPercent + '%' }" />
            <div class="music-progress-thumb" :style="{ left: progressPercent + '%' }" />
          </div>
          <div class="music-time">
            <span>{{ fmtTime(currentTime) }}</span>
            <span>{{ fmtTime(duration) }}</span>
          </div>
        </div>

        <!-- 控制按钮 -->
        <div class="music-controls">
          <button class="music-btn music-btn-shuffle" :class="{ active: shuffle }" @click="toggleShuffle" title="随机播放">🔀</button>
          <button class="music-btn" @click="prev" title="上一首">⏮</button>
          <button class="music-btn music-btn-play" @click="togglePlay" :title="isPlaying ? '暂停' : '播放'">
            {{ isPlaying ? '⏸' : '▶' }}
          </button>
          <button class="music-btn" @click="next" title="下一首">⏭</button>
          <button class="music-btn" @click.stop :title="isPlaying ? '播放中' : '已暂停'" style="cursor:default;font-size:12px">
            {{ isPlaying ? '♪' : '◼' }}
          </button>
        </div>

        <!-- 音量 -->
        <div class="music-volume">
          <span class="music-volume-icon">🔊</span>
          <input
            type="range"
            class="music-volume-slider"
            min="0" max="1" step="0.01"
            :value="volume"
            @input="setVolume"
          />
        </div>

        <!-- 播放列表 -->
        <div class="music-playlist">
          <div
            v-for="item in displayPlaylist"
            :key="item.index"
            class="music-playlist-item"
            :class="{ active: item.index === currentIndex }"
            @click="selectSong(item.index)"
          >
            <span class="music-playlist-index">
              {{ item.index === currentIndex ? (isPlaying ? '♪' : '◼') : item.index + 1 }}
            </span>
            <div class="music-playlist-info">
              <div class="music-playlist-title">{{ item.title }}</div>
              <div class="music-playlist-artist" v-if="item.artist">{{ item.artist }}</div>
            </div>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<style scoped>
.music-player {
  position: fixed;
  bottom: 24px;
  left: 20px;
  z-index: 910;
}

/* ——— 迷你模式 ——— */
.music-mini {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  cursor: pointer;
  transform: translateY(0);
  transition: all var(--transition-glass);
}

.music-mini:hover {
  transform: translateY(-3px);
}

.music-icon {
  font-size: 18px;
  color: var(--color-text-muted);
  transition: color var(--transition-fast);
}

.music-icon.playing {
  color: var(--color-primary);
  animation: notePulse 1.2s ease-in-out infinite;
}

@keyframes notePulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.2); opacity: 1; }
}

.music-title-mini {
  font-size: 13px;
  color: var(--color-text-secondary);
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.music-artist-mini {
  font-size: 12px;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80px;
}

.music-badge-mini {
  font-size: 12px;
  color: var(--color-primary);
  opacity: 0.8;
  margin-left: -2px;
}

/* ——— 展开模式 ——— */
.music-expanded {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 280px;
  max-height: 420px;
  display: flex;
  flex-direction: column;
  background: var(--glass-bg-strong);
  backdrop-filter: var(--glass-blur-strong);
  -webkit-backdrop-filter: var(--glass-blur-strong);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.music-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 10px;
  border-bottom: 1px solid var(--glass-border);
}

.music-header-title {
  font-family: var(--font-serif);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.music-close {
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  font-size: 16px;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all var(--transition-fast);
}

.music-close:hover { color: var(--color-text); background: rgba(139, 69, 19, 0.06); }

/* 进度条 */
.music-progress-area {
  padding: 10px 16px 0;
}

.music-progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(139, 69, 19, 0.1);
  border-radius: 2px;
  cursor: pointer;
  position: relative;
}

.music-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent-article));
  border-radius: 2px;
  transition: width 0.1s linear;
}

.music-progress-thumb {
  position: absolute;
  top: -4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-primary);
  box-shadow: 0 0 4px var(--color-primary-glow);
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.music-progress-bar:hover .music-progress-thumb { opacity: 1; }

.music-time {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
}

/* 控制按钮 */
.music-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 8px 16px;
}

.music-btn {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 15px;
  padding: 4px;
  border-radius: 50%;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.music-btn:hover { color: var(--color-primary); transform: scale(1.1); }

.music-btn-play {
  width: 40px;
  height: 40px;
  font-size: 17px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  transition: all var(--transition-glass);
}

.music-btn-play:hover {
  background: var(--glass-bg-hover);
  box-shadow: 0 4px 16px var(--color-primary-glow);
  transform: scale(1.1);
}

.music-btn-shuffle.active { color: var(--color-primary); }

/* 音量 */
.music-volume {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 16px 10px;
}

.music-volume-icon {
  font-size: 14px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.music-volume-slider {
  -webkit-appearance: none;
  appearance: none;
  flex: 1;
  height: 4px;
  background: rgba(139, 69, 19, 0.1);
  border-radius: 2px;
  outline: none;
}

.music-volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  box-shadow: 0 0 4px var(--color-primary-glow);
}

.music-volume-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  border: none;
  box-shadow: 0 0 4px var(--color-primary-glow);
}

/* 播放列表 */
.music-playlist {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px 8px;
  max-height: 180px;
}

.music-playlist::-webkit-scrollbar {
  width: 4px;
}

.music-playlist::-webkit-scrollbar-thumb {
  background: rgba(139, 69, 19, 0.15);
  border-radius: 2px;
}

.music-playlist-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 13px;
  color: var(--color-text-secondary);
}

.music-playlist-item:hover {
  background: rgba(139, 69, 19, 0.06);
}

.music-playlist-item.active {
  background: rgba(139, 69, 19, 0.08);
  color: var(--color-primary);
  font-weight: 500;
}

.music-playlist-index {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-text-muted);
  width: 18px;
  text-align: center;
  flex-shrink: 0;
}

.music-playlist-info {
  flex: 1;
  min-width: 0;
}

.music-playlist-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.music-playlist-artist {
  font-size: 11px;
  color: var(--color-text-muted);
}

/* 过渡动画 */
.music-mini-fade-enter-active,
.music-mini-fade-leave-active {
  transition: all 0.2s ease;
}
.music-mini-fade-enter-from,
.music-mini-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.music-expand-enter-active,
.music-expand-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: bottom left;
}
.music-expand-enter-from,
.music-expand-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.9);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .music-player {
    bottom: 16px;
    left: 12px;
  }

  .music-expanded {
    width: 260px;
    max-height: 360px;
  }

  .music-mini {
    padding: 8px 14px;
  }

  .music-title-mini {
    max-width: 80px;
  }

  .music-artist-mini {
    display: none;
  }
}
</style>
