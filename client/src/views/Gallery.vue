<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { galleryApi } from '../api'

const items = ref([])
const loading = ref(true)
const activeAlbum = ref('全部')
const albums = computed(() => {
  const set = new Set()
  items.value.forEach(item => {
    if (item.album) set.add(item.album)
  })
  return ['全部', ...Array.from(set)]
})

const filteredItems = computed(() => {
  if (activeAlbum.value === '全部') return items.value
  return items.value.filter(item => item.album === activeAlbum.value)
})

// 灯箱
const lightboxVisible = ref(false)
const lightboxIndex = ref(0)
const lightboxSrc = computed(() => {
  if (!lightboxVisible.value || !filteredItems.value.length) return ''
  return filteredItems.value[lightboxIndex.value]?.url || ''
})
const lightboxItem = computed(() => {
  if (!lightboxVisible.value || !filteredItems.value.length) return null
  return filteredItems.value[lightboxIndex.value] || null
})
const lightboxTotal = computed(() => filteredItems.value.length)

function openLightbox(index) {
  lightboxIndex.value = index
  lightboxVisible.value = true
  document.body.style.overflow = 'hidden'
}

function closeLightbox() {
  lightboxVisible.value = false
  document.body.style.overflow = ''
}

function prevImage() {
  if (lightboxIndex.value > 0) {
    lightboxIndex.value--
  } else {
    lightboxIndex.value = lightboxTotal.value - 1
  }
}

function nextImage() {
  if (lightboxIndex.value < lightboxTotal.value - 1) {
    lightboxIndex.value++
  } else {
    lightboxIndex.value = 0
  }
}

function handleKeydown(e) {
  if (!lightboxVisible.value) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowLeft') prevImage()
  if (e.key === 'ArrowRight') nextImage()
}

async function fetchItems() {
  loading.value = true
  try {
    const res = await galleryApi.list()
    items.value = res.data || []
  } catch { /* ignore */ } finally { loading.value = false }
}

onMounted(() => {
  fetchItems()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="gallery-page">
    <h2 class="page-title">画廊</h2>
    <p class="page-subtitle">用图片记录生活的碎片</p>

    <!-- 相册筛选 -->
    <div class="gallery-filters" v-if="albums.length > 1">
      <button
        v-for="album in albums"
        :key="album"
        class="filter-tag glass-btn"
        :class="{ 'filter-tag--active': activeAlbum === album }"
        @click="activeAlbum = album"
      >{{ album }}</button>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="gallery-loading glass-card">
      <p>加载中...</p>
    </div>

    <!-- 空状态 -->
    <div v-else-if="!filteredItems.length" class="gallery-empty glass-card">
      <p>相册里还没有照片哦</p>
    </div>

    <!-- 图片网格 -->
    <div v-else class="gallery-grid">
      <div
        v-for="(item, index) in filteredItems"
        :key="item.id"
        class="gallery-card glass-card"
        @click="openLightbox(index)"
      >
        <div class="gallery-card-img">
          <img :src="item.thumbnail_url || item.url" :alt="item.title" loading="lazy" />
        </div>
        <div class="gallery-card-body">
          <h4 class="gallery-card-title">{{ item.title }}</h4>
          <span class="gallery-card-album" v-if="item.album">{{ item.album }}</span>
        </div>
      </div>
    </div>

    <!-- 灯箱 -->
    <Teleport to="body">
      <transition name="lightbox-fade">
        <div v-if="lightboxVisible" class="lightbox-overlay" @click.self="closeLightbox">
          <button class="lightbox-close glass-btn" @click="closeLightbox" aria-label="关闭">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
              <line x1="4" y1="4" x2="16" y2="16" /><line x1="16" y1="4" x2="4" y2="16" />
            </svg>
          </button>

          <button
            v-if="lightboxTotal > 1"
            class="lightbox-nav lightbox-prev glass-btn"
            @click.stop="prevImage"
            aria-label="上一张"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.5">
              <polyline points="14,4 6,11 14,18" />
            </svg>
          </button>

          <div class="lightbox-content">
            <img :src="lightboxSrc" :alt="lightboxItem?.title" class="lightbox-image" />
            <div class="lightbox-info" v-if="lightboxItem">
              <h3 class="lightbox-title">{{ lightboxItem.title }}</h3>
              <p class="lightbox-desc" v-if="lightboxItem.description">{{ lightboxItem.description }}</p>
              <span class="lightbox-counter" v-if="lightboxTotal > 1">{{ lightboxIndex + 1 }} / {{ lightboxTotal }}</span>
            </div>
          </div>

          <button
            v-if="lightboxTotal > 1"
            class="lightbox-nav lightbox-next glass-btn"
            @click.stop="nextImage"
            aria-label="下一张"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.5">
              <polyline points="8,4 16,11 8,18" />
            </svg>
          </button>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<style scoped>
.gallery-page { max-width: 960px; }

.page-title { margin-bottom: 4px; }

.page-subtitle {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 0 0 20px;
}

/* 筛选标签 */
.gallery-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.filter-tag {
  font-size: 13px;
  padding: 6px 16px;
  border-radius: 999px;
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.filter-tag:hover {
  color: var(--color-text);
  border-color: rgba(139, 69, 19, 0.25);
}

.filter-tag--active {
  background: rgba(139, 69, 19, 0.1);
  border-color: rgba(139, 69, 19, 0.3);
  color: var(--color-primary);
  font-weight: 600;
}

/* 网格 */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.gallery-card {
  overflow: hidden;
  cursor: pointer;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.gallery-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(139, 69, 19, 0.1);
}

.gallery-card-img {
  width: 100%;
  aspect-ratio: 4/3;
  overflow: hidden;
}

.gallery-card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-base);
}

.gallery-card:hover .gallery-card-img img {
  transform: scale(1.05);
}

.gallery-card-body {
  padding: 10px 14px 10px;
}

.gallery-card-title {
  font-size: 13px;
  font-weight: 600;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gallery-card-album {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 2px;
  display: inline-block;
}

/* 加载/空状态 */
.gallery-loading,
.gallery-empty {
  padding: 48px;
  text-align: center;
  color: var(--color-text-muted);
}

/* 灯箱 */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.88);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 85vw;
  max-height: 90vh;
}

.lightbox-image {
  max-width: 85vw;
  max-height: 75vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 16px 64px rgba(0, 0, 0, 0.4);
}

.lightbox-info {
  text-align: center;
  margin-top: 16px;
  color: rgba(255, 255, 255, 0.9);
}

.lightbox-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.lightbox-desc {
  font-size: 13px;
  margin: 4px 0 0;
  color: rgba(255, 255, 255, 0.6);
  max-width: 480px;
}

.lightbox-counter {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  margin-top: 6px;
  display: inline-block;
}

.lightbox-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 44px;
  height: 44px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  cursor: pointer;
  transition: all var(--transition-fast);
  z-index: 10;
}

.lightbox-close:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.15);
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.lightbox-nav:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.15);
}

.lightbox-prev { left: 20px; }
.lightbox-next { right: 20px; }

/* 灯箱动画 */
.lightbox-fade-enter-active,
.lightbox-fade-leave-active {
  transition: opacity 0.25s ease;
}

.lightbox-fade-enter-from,
.lightbox-fade-leave-to {
  opacity: 0;
}

@media (max-width: 1024px) {
  .gallery-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .gallery-grid { grid-template-columns: repeat(2, 1fr); }

  .lightbox-content { max-width: 95vw; }
  .lightbox-image { max-width: 95vw; max-height: 65vh; }
  .lightbox-nav { width: 40px; height: 40px; }
  .lightbox-prev { left: 8px; }
  .lightbox-next { right: 8px; }
}
</style>
