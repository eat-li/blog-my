<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { diaryApi, uploadApi } from '../../api'
import { useConfirm } from '../../composables/useConfirm'

const router = useRouter()
const { alert: showAlert, confirm } = useConfirm()
const diaries = ref([])
const total = ref(0)
const loading = ref(false)
const page = ref(1)
const pageSize = 12

const moodOptions = ['开心', '平静', '难过', '兴奋', '怀旧', '思考', '感恩']
const weatherOptions = ['晴', '多云', '阴', '雨', '雪', '风']

// 表单状态
const editingId = ref(null)
const formVisible = ref(false)
const formLoading = ref(false)
const uploadingImages = ref(false)
const form = ref({
  title: '',
  content: '',
  mood: '',
  weather: '',
  images: [],
  is_public: true
})

watch(page, fetchDiaries)
onMounted(fetchDiaries)

async function fetchDiaries() {
  loading.value = true
  try {
    const params = { page: page.value, limit: pageSize }
    const res = await diaryApi.adminList(params)
    diaries.value = res.data?.list || []
    total.value = res.data?.total || 0
  } catch (e) {
    if (e.response?.status === 401) router.push('/admin/login')
  } finally {
    loading.value = false
  }
}

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

function openAdd() {
  editingId.value = null
  form.value = { title: '', content: '', mood: '', weather: '', images: [], is_public: true }
  formVisible.value = true
}

function openEdit(item) {
  editingId.value = item.id
  form.value = {
    title: item.title,
    content: item.content,
    mood: item.mood || '',
    weather: item.weather || '',
    images: Array.isArray(item.images) ? [...item.images] : [],
    is_public: item.is_public
  }
  formVisible.value = true
}

function cancelForm() {
  formVisible.value = false
  editingId.value = null
}

// 图片上传
async function handleImageUpload(e) {
  const files = e.target.files
  if (!files?.length) return

  uploadingImages.value = true
  try {
    for (const file of files) {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const pureBase64 = base64.split(',')[1]  // 去掉 data:image/...;base64, 前缀
      const res = await uploadApi.image({ base64: pureBase64, filename: file.name })
      if (res?.url) {
        form.value.images.push(res.url)
      }
    }
  } catch (err) {
    await showAlert('图片上传失败：' + (err.response?.data?.message || err.message))
  } finally {
    uploadingImages.value = false
    // 清空 input
    e.target.value = ''
  }
}

function removeImage(index) {
  form.value.images.splice(index, 1)
}

async function submitForm() {
  if (!form.value.title.trim()) return await showAlert('日记标题不能为空')
  if (!form.value.content.trim()) return await showAlert('日记内容不能为空')

  formLoading.value = true
  try {
    const payload = { ...form.value }
    if (editingId.value) {
      await diaryApi.update(editingId.value, payload)
    } else {
      await diaryApi.create(payload)
    }
    formVisible.value = false
    editingId.value = null
    fetchDiaries()
  } catch (e) {
    await showAlert(e.response?.data?.message || '操作失败')
  } finally {
    formLoading.value = false
  }
}

async function handleDelete(id) {
  if (!await confirm('确定删除这篇日记？')) return
  try {
    await diaryApi.delete(id)
    fetchDiaries()
  } catch (e) {
    await showAlert(e.response?.data?.message || '删除失败')
  }
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="da-admin">
    <div class="da-header">
      <h2 class="page-title">日记管理</h2>
      <button class="glass-btn da-add-btn" @click="openAdd" v-if="!formVisible">+ 写日记</button>
    </div>

    <!-- 编辑面板 -->
    <transition name="dropdown-fade">
      <div v-if="formVisible" class="da-form glass-card">
        <h3 class="da-form-title">{{ editingId ? '编辑日记' : '写日记' }}</h3>

        <div class="da-form-grid">
          <div class="da-field da-field-title">
            <label class="da-label">标题 <span class="required">*</span></label>
            <input v-model="form.title" class="glass-input" placeholder="日记标题" maxlength="200" />
          </div>

          <div class="da-field">
            <label class="da-label">心情</label>
            <select v-model="form.mood" class="glass-input da-select">
              <option value="">不选择</option>
              <option v-for="m in moodOptions" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>

          <div class="da-field">
            <label class="da-label">天气</label>
            <select v-model="form.weather" class="glass-input da-select">
              <option value="">不选择</option>
              <option v-for="w in weatherOptions" :key="w" :value="w">{{ w }}</option>
            </select>
          </div>

          <div class="da-field da-field-content">
            <label class="da-label">内容 <span class="required">*</span></label>
            <textarea
              v-model="form.content"
              class="glass-input da-textarea"
              placeholder="记录今天的心情..."
              rows="8"
            />
          </div>

          <!-- 图片上传 -->
          <div class="da-field da-field-images">
            <label class="da-label">图片</label>
            <div class="da-images">
              <div v-for="(img, i) in form.images" :key="i" class="da-image-item">
                <img :src="img" alt="" />
                <button class="da-image-remove" @click="removeImage(i)">x</button>
              </div>
              <label class="da-image-add glass-btn" :class="{ 'da-image-add--loading': uploadingImages }">
                <input type="file" accept="image/*" multiple hidden @change="handleImageUpload" />
                <span>{{ uploadingImages ? '上传中...' : '+ 添加图片' }}</span>
              </label>
            </div>
          </div>

          <div class="da-field da-field-check">
            <label class="da-check-label">
              <input v-model="form.is_public" type="checkbox" class="da-checkbox" />
              <span>公开显示</span>
            </label>
          </div>
        </div>

        <div class="da-form-actions">
          <button class="glass-btn da-submit" :disabled="formLoading" @click="submitForm">
            {{ formLoading ? '保存中...' : '保存' }}
          </button>
          <button class="glass-btn da-cancel" @click="cancelForm">取消</button>
        </div>
      </div>
    </transition>

    <!-- 骨架屏 -->
    <div v-if="loading && !diaries.length" class="da-skeleton">
      <div v-for="i in 4" :key="i" class="skeleton" style="height:80px;margin-bottom:8px;border-radius:8px" />
    </div>

    <!-- 列表 -->
    <div v-if="!loading || diaries.length" class="da-list">
      <div v-for="item in diaries" :key="item.id" class="da-card glass-card">
        <!-- 缩略图 -->
        <div class="da-card-thumb" v-if="item.images?.length">
          <img :src="item.images[0]" alt="" />
        </div>

        <div class="da-card-body">
          <div class="da-card-head">
            <h4 class="da-card-title">{{ item.title }}</h4>
            <span class="da-card-mood" v-if="item.mood">{{ item.mood }}</span>
            <span class="da-card-weather" v-if="item.weather">{{ item.weather }}</span>
            <span class="da-card-status" :class="item.is_public ? 'status-public' : 'status-private'">
              {{ item.is_public ? '公开' : '私密' }}
            </span>
          </div>
          <p class="da-card-excerpt">{{ item.content.slice(0, 100) }}{{ item.content.length > 100 ? '...' : '' }}</p>
          <span class="da-card-date">{{ formatDate(item.createdAt) }}</span>
        </div>

        <div class="da-card-actions">
          <button class="action-btn glass-btn action-edit" @click="openEdit(item)">编辑</button>
          <button class="action-btn glass-btn action-delete" @click="handleDelete(item.id)">删除</button>
        </div>
      </div>

      <div v-if="!diaries.length" class="da-empty glass-card">
        <p>还没有日记，点击上方按钮开始记录</p>
      </div>
    </div>

    <!-- 分页 -->
    <div class="da-pagination" v-if="totalPages > 1">
      <button class="glass-btn" :disabled="page <= 1" @click="page--">上一页</button>
      <span class="page-info">{{ page }} / {{ totalPages }}</span>
      <button class="glass-btn" :disabled="page >= totalPages" @click="page++">下一页</button>
    </div>
  </div>
</template>

<style scoped>
.da-admin {
  max-width: 900px;
}

.da-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.page-title {
  font-size: 22px;
  margin-bottom: 0;
}
.page-title::after { display: none; }

.da-add-btn {
  font-size: 13px;
  padding: 8px 20px;
}

/* 表单面板 */
.da-form {
  padding: 24px;
  margin-bottom: 20px;
}

.da-form-title {
  font-family: var(--font-sans);
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
}

.da-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;
}

.da-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.da-field-title { grid-column: 1 / -1; }
.da-field-content { grid-column: 1 / -1; }
.da-field-images { grid-column: 1 / -1; }
.da-field-check { grid-column: 1 / -1; }

.da-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.required {
  color: var(--color-accent-anime);
}

.da-select {
  font-family: inherit;
  cursor: pointer;
}

.da-textarea {
  resize: vertical;
  min-height: 160px;
  font-family: var(--font-sans);
}

/* 图片上传 */
.da-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.da-image-item {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  border: 1px solid var(--glass-border);
}

.da-image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.da-image-remove {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  backdrop-filter: blur(2px);
}

.da-image-add {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  border-style: dashed;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--color-text-muted);
  cursor: pointer;
  text-align: center;
}

.da-image-add--loading {
  opacity: 0.5;
  pointer-events: none;
}

.da-check-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.da-checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--color-primary);
  cursor: pointer;
}

.da-form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.da-submit {
  background: rgba(139, 69, 19, 0.1);
  border-color: rgba(139, 69, 19, 0.25);
  color: var(--color-primary);
  font-weight: 600;
}

.da-submit:hover {
  background: rgba(139, 69, 19, 0.18);
}

.da-cancel {
  color: var(--color-text-muted);
}

/* 列表 */
.da-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.da-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 18px;
}

.da-card-thumb {
  width: 72px;
  height: 72px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.da-card-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.da-card-body {
  flex: 1;
  min-width: 0;
}

.da-card-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.da-card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

.da-card-mood,
.da-card-weather {
  font-size: 11px;
  padding: 1px 8px;
  border-radius: 999px;
}

.da-card-mood {
  background: rgba(139, 69, 19, 0.06);
  color: var(--color-primary);
}

.da-card-weather {
  background: rgba(123, 168, 114, 0.06);
  color: var(--color-accent-galgame);
}

.da-card-status {
  font-size: 11px;
  padding: 1px 8px;
  border-radius: 999px;
  margin-left: auto;
}

.status-public {
  background: rgba(123, 168, 114, 0.08);
  color: var(--color-accent-galgame);
}

.status-private {
  background: rgba(139, 69, 19, 0.06);
  color: var(--color-text-muted);
}

.da-card-excerpt {
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.5;
  margin: 0 0 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.da-card-date {
  font-size: 11px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
}

.da-card-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.action-btn {
  font-size: 12px;
  padding: 4px 14px;
}

.action-edit:hover { color: var(--color-primary); border-color: rgba(139, 69, 19, 0.3); }
.action-delete:hover { color: var(--color-accent-anime); border-color: rgba(232, 91, 91, 0.3); }

/* 空状态 */
.da-empty {
  padding: 48px;
  text-align: center;
  color: var(--color-text-muted);
}

/* 分页 */
.da-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
}

.page-info {
  font-size: 14px;
  color: var(--color-text-secondary);
}

/* 过渡 */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.25s ease;
}
.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.da-skeleton {
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .da-form-grid {
    grid-template-columns: 1fr;
  }

  .da-card {
    flex-wrap: wrap;
  }

  .da-card-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
