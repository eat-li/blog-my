<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { galleryApi } from '../../api'
import { useOssUpload } from '../../composables/useOssUpload'
import { useConfirm } from '../../composables/useConfirm'

const { alert: showAlert, confirm } = useConfirm()
const items = ref([])
const total = ref(0)
const loading = ref(false)
const page = ref(1)
const pageSize = 12

const uploader = useOssUpload()

// 表单
const editingId = ref(null)
const formVisible = ref(false)
const formSaving = ref(false)
const form = ref({ title: '', description: '', url: '', thumbnail_url: '', album: '' })

async function fetchItems() {
  loading.value = true
  try {
    const res = await galleryApi.adminList({ page: page.value, limit: pageSize })
    items.value = res.data?.list || []
    total.value = res.data?.total || 0
  } catch { /* ignore */ } finally { loading.value = false }
}

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

watch(page, fetchItems)
onMounted(fetchItems)

function openAdd() {
  editingId.value = null
  form.value = { title: '', description: '', url: '', thumbnail_url: '', album: '' }
  formVisible.value = true
}

function openEdit(item) {
  editingId.value = item.id
  form.value = {
    title: item.title,
    description: item.description || '',
    url: item.url,
    thumbnail_url: item.thumbnail_url || '',
    album: item.album || ''
  }
  formVisible.value = true
}

function cancelForm() {
  formVisible.value = false
  editingId.value = null
}

// 上传
async function handleUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const err = uploader.validateImage(file)
  if (err) { await showAlert(err); return }
  const result = await uploader.upload(file, 'gallery/')
  if (result) {
    form.value.url = result.url
    form.value.thumbnail_url = result.url
    if (!form.value.title) form.value.title = file.name.replace(/\.[^.]+$/, '')
  } else {
    await showAlert(uploader.error.value || '上传失败')
  }
  e.target.value = ''
}

async function submitForm() {
  if (!form.value.title || !form.value.url) return await showAlert('标题和图片不能为空')
  formSaving.value = true
  try {
    if (editingId.value) {
      await galleryApi.update(editingId.value, form.value)
    } else {
      await galleryApi.create(form.value)
    }
    formVisible.value = false
    editingId.value = null
    fetchItems()
  } catch (e) {
    await showAlert(e.response?.data?.message || '保存失败')
  } finally { formSaving.value = false }
}

async function handleDelete(id) {
  if (!await confirm('确定删除这张图片？')) return
  try {
    await galleryApi.delete(id)
    fetchItems()
  } catch (e) {
    await showAlert(e.response?.data?.message || '删除失败')
  }
}
</script>

<template>
  <div class="ga-admin">
    <div class="ga-header">
      <h2 class="page-title">画廊管理</h2>
      <button class="glass-btn ga-add-btn" @click="openAdd" v-if="!formVisible">+ 添加图片</button>
    </div>

    <!-- 编辑面板 -->
    <transition name="dropdown-fade">
      <div v-if="formVisible" class="ga-form glass-card">
        <h3 class="ga-form-title">{{ editingId ? '编辑图片' : '添加图片' }}</h3>
        <div class="ga-form-grid">
          <div class="ga-field ga-field-full">
            <label class="ga-label">上传图片</label>
            <div class="ga-upload-area">
              <img v-if="form.url" :src="form.url" class="ga-preview" alt="" />
              <label class="ga-upload-btn glass-btn" :class="{ 'ga-upload-btn--loading': uploader.uploading.value }">
                <input type="file" accept="image/*" hidden @change="handleUpload" />
                <span>{{ uploader.uploading.value ? '上传中...' : (form.url ? '更换图片' : '选择图片') }}</span>
              </label>
            </div>
            <!-- 上传进度 -->
            <div v-if="uploader.uploading.value" class="upload-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: uploader.progress.value + '%' }"></div>
              </div>
              <span class="progress-text">{{ uploader.progress.value }}%</span>
            </div>
          </div>
          <div class="ga-field">
            <label class="ga-label">标题 <span class="required">*</span></label>
            <input v-model="form.title" class="glass-input" placeholder="图片标题" maxlength="100" />
          </div>
          <div class="ga-field">
            <label class="ga-label">相册</label>
            <input v-model="form.album" class="glass-input" placeholder="如：日常、旅行、截图" maxlength="50" />
          </div>
          <div class="ga-field ga-field-full">
            <label class="ga-label">描述</label>
            <textarea v-model="form.description" class="glass-input" rows="2" placeholder="图片描述（可选）" />
          </div>
        </div>
        <div class="ga-form-actions">
          <button class="glass-btn ga-submit" :disabled="formSaving" @click="submitForm">
            {{ formSaving ? '保存中...' : '保存' }}
          </button>
          <button class="glass-btn ga-cancel" @click="cancelForm">取消</button>
        </div>
      </div>
    </transition>

    <!-- 列表 -->
    <div class="ga-grid">
      <div v-for="item in items" :key="item.id" class="ga-card glass-card">
        <div class="ga-card-img">
          <img :src="item.thumbnail_url || item.url" :alt="item.title" loading="lazy" />
        </div>
        <div class="ga-card-body">
          <h4 class="ga-card-title">{{ item.title }}</h4>
          <span class="ga-card-album" v-if="item.album">{{ item.album }}</span>
        </div>
        <div class="ga-card-actions">
          <button class="action-btn glass-btn action-edit" @click="openEdit(item)">编辑</button>
          <button class="action-btn glass-btn action-delete" @click="handleDelete(item.id)">删除</button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && !items.length" class="ga-empty glass-card">
      <p>画廊还是空的，点击上方按钮添加第一张图片</p>
    </div>

    <!-- 分页 -->
    <div class="ga-pagination" v-if="totalPages > 1">
      <button class="glass-btn" :disabled="page <= 1" @click="page--">上一页</button>
      <span class="page-info">{{ page }} / {{ totalPages }}</span>
      <button class="glass-btn" :disabled="page >= totalPages" @click="page++">下一页</button>
    </div>
  </div>
</template>

<style scoped>
.ga-admin { max-width: 960px; }

.ga-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.page-title { font-size: 22px; margin-bottom: 0; }
.page-title::after { display: none; }
.ga-add-btn { font-size: 13px; padding: 8px 20px; }

/* 表单 */
.ga-form { padding: 24px; margin-bottom: 20px; }
.ga-form-title { font-size: 16px; font-weight: 600; margin-bottom: 20px; }
.ga-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 16px; }
.ga-field { display: flex; flex-direction: column; gap: 4px; }
.ga-field-full { grid-column: 1 / -1; }
.ga-label { font-size: 13px; font-weight: 500; color: var(--color-text-secondary); }
.required { color: var(--color-accent-anime); }

.ga-upload-area { display: flex; align-items: flex-start; gap: 12px; }
.ga-preview { width: 120px; height: 90px; object-fit: cover; border-radius: 8px; border: 1px solid var(--glass-border); }
.ga-upload-btn { font-size: 13px; padding: 8px 18px; cursor: pointer; }
.ga-upload-btn--loading { opacity: 0.5; pointer-events: none; }

.upload-progress { display: flex; align-items: center; gap: 10px; margin-top: 8px; }
.progress-bar { flex: 1; height: 6px; background: var(--glass-border); border-radius: 999px; overflow: hidden; }
.progress-fill { height: 100%; background: var(--color-accent-galgame); border-radius: 999px; transition: width 0.3s ease; }
.progress-text { font-size: 12px; color: var(--color-text-muted); min-width: 36px; text-align: right; }

.ga-form-actions { display: flex; gap: 10px; margin-top: 20px; }
.ga-submit { background: rgba(139,69,19,0.1); border-color: rgba(139,69,19,0.25); color: var(--color-primary); font-weight: 600; }
.ga-submit:hover { background: rgba(139,69,19,0.18); }
.ga-cancel { color: var(--color-text-muted); }

/* 网格 */
.ga-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.ga-card { overflow: hidden; }
.ga-card-img { width: 100%; aspect-ratio: 4/3; overflow: hidden; }
.ga-card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform var(--transition-base); }
.ga-card:hover .ga-card-img img { transform: scale(1.05); }
.ga-card-body { padding: 10px 14px 6px; }
.ga-card-title { font-size: 13px; font-weight: 600; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ga-card-album { font-size: 11px; color: var(--color-text-muted); margin-top: 2px; display: inline-block; }
.ga-card-actions { display: flex; gap: 4px; padding: 0 14px 12px; }
.action-btn { font-size: 11px; padding: 3px 12px; }
.action-edit:hover { color: var(--color-primary); border-color: rgba(139,69,19,0.3); }
.action-delete:hover { color: var(--color-accent-anime); border-color: rgba(232,91,91,0.3); }

/* 空 */
.ga-empty { padding: 48px; text-align: center; color: var(--color-text-muted); }

/* 分页 */
.ga-pagination { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 20px; }
.page-info { font-size: 14px; color: var(--color-text-secondary); }

.dropdown-fade-enter-active, .dropdown-fade-leave-active { transition: all 0.25s ease; }
.dropdown-fade-enter-from, .dropdown-fade-leave-to { opacity: 0; transform: translateY(-8px); }

@media (max-width: 1024px) { .ga-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 768px) {
  .ga-grid { grid-template-columns: repeat(2, 1fr); }
  .ga-form-grid { grid-template-columns: 1fr; }
}
</style>
