<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { friendlinkApi, uploadApi } from '../../api'
import { useConfirm } from '../../composables/useConfirm'

const router = useRouter()
const { alert: showAlert, confirm } = useConfirm()
const links = ref([])
const total = ref(0)
const loading = ref(false)
const filterStatus = ref('')
const page = ref(1)
const pageSize = 15

// 头像上传
const uploadingAvatar = ref(false)
const avatarInput = ref(null)

// 表单状态
const editingId = ref(null)
const formVisible = ref(false)
const formLoading = ref(false)
const form = ref({
  nickname: '',
  avatar: '',
  signature: '',
  url: '',
  sort_order: 0,
  status: 'approved'
})

watch(filterStatus, () => { page.value = 1; fetchLinks() })
watch(page, fetchLinks)
onMounted(fetchLinks)

async function fetchLinks() {
  loading.value = true
  try {
    const params = { page: page.value, pageSize }
    if (filterStatus.value) params.status = filterStatus.value
    const res = await friendlinkApi.adminList(params)
    links.value = res.data?.list || []
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
  form.value = { nickname: '', avatar: '', signature: '', url: '', sort_order: 0, status: 'approved' }
  formVisible.value = true
}

function openEdit(link) {
  editingId.value = link.id
  form.value = {
    nickname: link.nickname,
    avatar: link.avatar || '',
    signature: link.signature || '',
    url: link.url,
    sort_order: link.sort_order ?? 0,
    status: link.status
  }
  formVisible.value = true
}

function cancelForm() {
  formVisible.value = false
  editingId.value = null
}

async function submitForm() {
  if (!form.value.nickname.trim()) return await showAlert('昵称不能为空')
  if (!form.value.url.trim()) return await showAlert('网站链接不能为空')

  formLoading.value = true
  try {
    if (editingId.value) {
      await friendlinkApi.update(editingId.value, form.value)
    } else {
      await friendlinkApi.create(form.value)
    }
    formVisible.value = false
    editingId.value = null
    fetchLinks()
  } catch (e) {
    await showAlert(e.response?.data?.message || '操作失败')
  } finally {
    formLoading.value = false
  }
}

async function handleDelete(id) {
  if (!await confirm('确定删除这条友链？')) return
  try {
    await friendlinkApi.delete(id)
    fetchLinks()
  } catch (e) {
    await showAlert(e.response?.data?.message || '删除失败')
  }
}

async function handleAvatarUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    await showAlert('请选择图片文件')
    return
  }

  uploadingAvatar.value = true
  try {
    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
    const base64 = btoa(binary)

    const res = await uploadApi.image({ base64, filename: file.name })
    form.value.avatar = res.url
  } catch (e) {
    await showAlert('头像上传失败，请重试')
  } finally {
    uploadingAvatar.value = false
    // 重置 input 以便重复选择同一文件
    e.target.value = ''
  }
}

function triggerAvatarInput() {
  avatarInput.value?.click()
}

function onAvatarError(e) {
  e.target.src = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">' +
    '<rect width="44" height="44" fill="%23F5F0E8"/>' +
    '<text x="22" y="30" text-anchor="middle" font-size="20" fill="%238B4513">⚭</text></svg>'
  )
}
</script>

<template>
  <div class="fl-admin">
    <div class="fla-header">
      <h2 class="page-title">友链管理</h2>
      <button class="glass-btn fla-add-btn" @click="openAdd" v-if="!formVisible">
        + 添加友链
      </button>
    </div>

    <!-- 编辑/新增面板 -->
    <transition name="dropdown-fade">
      <div v-if="formVisible" class="fla-form glass-card">
        <h3 class="fla-form-title">{{ editingId ? '编辑友链' : '添加友链' }}</h3>
        <div class="fla-form-grid">
          <div class="fla-field">
            <label class="fla-label">昵称 <span class="required">*</span></label>
            <input v-model="form.nickname" class="glass-input" placeholder="友站名称" maxlength="50" />
          </div>
          <div class="fla-field">
            <label class="fla-label">网站链接 <span class="required">*</span></label>
            <input v-model="form.url" class="glass-input" placeholder="https://..." />
          </div>
          <div class="fla-field">
            <label class="fla-label">头像</label>
            <div class="fla-avatar-row">
              <img
                :src="form.avatar || ''"
                class="fla-avatar-preview"
                :class="{ 'fla-avatar-preview--empty': !form.avatar }"
                @error="onAvatarError"
              />
              <div class="fla-avatar-inputs">
                <button class="glass-btn fla-upload-btn" :disabled="uploadingAvatar" @click="triggerAvatarInput">
                  {{ uploadingAvatar ? '上传中…' : '本地上传' }}
                </button>
                <span class="fla-or">或</span>
                <input v-model="form.avatar" class="glass-input fla-url-input" placeholder="粘贴图片链接" />
              </div>
            </div>
            <input
              ref="avatarInput"
              type="file"
              accept="image/*"
              style="display:none"
              @change="handleAvatarUpload"
            />
          </div>
          <div class="fla-field">
            <label class="fla-label">签名</label>
            <input v-model="form.signature" class="glass-input" placeholder="一句话介绍" maxlength="200" />
          </div>
          <div class="fla-field">
            <label class="fla-label">排序权重</label>
            <input v-model.number="form.sort_order" type="number" class="glass-input" placeholder="数字越小越靠前" />
          </div>
          <div class="fla-field">
            <label class="fla-label">状态</label>
            <select v-model="form.status" class="glass-input">
              <option value="approved">已通过</option>
              <option value="pending">待审核</option>
              <option value="rejected">已拒绝</option>
            </select>
          </div>
        </div>
        <div class="fla-form-actions">
          <button class="glass-btn fla-submit" :disabled="formLoading" @click="submitForm">
            {{ formLoading ? '保存中...' : '保存' }}
          </button>
          <button class="glass-btn fla-cancel" @click="cancelForm">取消</button>
        </div>
      </div>
    </transition>

    <!-- 筛选 -->
    <div class="fla-filters">
      <button class="filter-btn glass-btn" :class="{ 'filter-btn--active': !filterStatus }" @click="filterStatus = ''">全部</button>
      <button v-for="s in ['approved', 'pending', 'rejected']" :key="s"
        class="filter-btn glass-btn" :class="{ 'filter-btn--active': filterStatus === s }"
        @click="filterStatus = s"
      >{{ { approved: '已通过', pending: '待审核', rejected: '已拒绝' }[s] }}</button>
    </div>

    <!-- 骨架屏 -->
    <div v-if="loading && !links.length" class="fla-skeleton">
      <div v-for="i in 5" :key="i" class="skeleton" style="height:72px;margin-bottom:8px;border-radius:8px" />
    </div>

    <!-- 列表 -->
    <div v-if="!loading || links.length" class="fla-list">
      <div v-for="link in links" :key="link.id" class="fla-card glass-card">
        <img :src="link.avatar || ''" class="fla-avatar" @error="onAvatarError" />
        <div class="fla-info">
          <div class="fla-info-top">
            <span class="fla-nickname">{{ link.nickname }}</span>
            <span class="fla-status-badge" :class="'fla-status--' + link.status">
              {{ { approved: '已通过', pending: '待审核', rejected: '已拒绝' }[link.status] }}
            </span>
            <span class="fla-order">排序: {{ link.sort_order }}</span>
          </div>
          <div class="fla-info-bottom">
            <span class="fla-url" :title="link.url">{{ link.url }}</span>
            <span class="fla-signature" v-if="link.signature">{{ link.signature }}</span>
          </div>
        </div>
        <div class="fla-actions">
          <button class="action-btn glass-btn action-edit" @click="openEdit(link)">编辑</button>
          <button class="action-btn glass-btn action-delete" @click="handleDelete(link.id)">删除</button>
        </div>
      </div>

      <div v-if="!links.length" class="fla-empty glass-card">
        <p>暂无友链，点击上方按钮添加</p>
      </div>
    </div>

    <!-- 分页 -->
    <div class="fla-pagination" v-if="totalPages > 1">
      <button class="glass-btn" :disabled="page <= 1" @click="page--">← 上一页</button>
      <span class="page-info">{{ page }} / {{ totalPages }}</span>
      <button class="glass-btn" :disabled="page >= totalPages" @click="page++">下一页 →</button>
    </div>
  </div>
</template>

<style scoped>
.fl-admin {
  max-width: 860px;
}

.fla-header {
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

.fla-add-btn {
  font-size: 13px;
  padding: 8px 20px;
}

/* 表单面板 */
.fla-form {
  padding: 24px;
  margin-bottom: 16px;
}

.fla-form-title {
  font-family: var(--font-sans);
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
}

.fla-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;
}

.fla-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.fla-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.required {
  color: var(--color-accent-anime);
}

.fla-form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.fla-submit {
  background: rgba(139, 69, 19, 0.1);
  border-color: rgba(139, 69, 19, 0.25);
  color: var(--color-primary);
  font-weight: 600;
}

.fla-submit:hover {
  background: rgba(139, 69, 19, 0.18);
}

.fla-cancel {
  color: var(--color-text-muted);
}

/* 头像上传 */
.fla-avatar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.fla-avatar-preview {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid var(--glass-border);
  background: var(--color-bg-start);
}

.fla-avatar-preview--empty {
  border-style: dashed;
  opacity: 0.5;
}

.fla-avatar-inputs {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.fla-upload-btn {
  font-size: 14px;
  padding: 10px 18px;
  white-space: nowrap;
  min-height: 44px;
}

.fla-upload-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.fla-or {
  font-size: 12px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.fla-url-input {
  flex: 1;
  font-size: 13px;
  padding: 8px 12px;
}

/* 筛选 */
.fla-filters {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-btn {
  font-size: 13px;
  padding: 6px 16px;
}
.filter-btn--active {
  color: var(--color-primary);
  border-color: var(--color-primary);
  background: rgba(139, 69, 19, 0.08);
}

/* 列表 */
.fla-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fla-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
}

.fla-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background: var(--color-bg-start);
  border: 2px solid var(--glass-border);
}

.fla-info {
  flex: 1;
  min-width: 0;
}

.fla-info-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.fla-nickname {
  font-weight: 600;
  font-size: 14px;
}

.fla-status-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.fla-status--approved {
  color: var(--color-accent-galgame);
  background: rgba(123, 168, 114, 0.12);
}

.fla-status--pending {
  color: var(--color-accent-article);
  background: rgba(232, 137, 91, 0.12);
}

.fla-status--rejected {
  color: var(--color-accent-anime);
  background: rgba(232, 91, 91, 0.12);
}

.fla-order {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-left: auto;
}

.fla-info-bottom {
  display: flex;
  align-items: center;
  gap: 12px;
}

.fla-url {
  font-size: 12px;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
}

.fla-signature {
  font-size: 12px;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

/* 操作按钮 */
.fla-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.action-btn {
  font-size: 13px;
  padding: 8px 18px;
  min-height: 40px;
}

.action-edit:hover { color: var(--color-primary); border-color: rgba(139, 69, 19, 0.3); }
.action-delete:hover { color: var(--color-accent-anime); border-color: rgba(232, 91, 91, 0.3); }

/* 空状态 */
.fla-empty {
  padding: 48px;
  text-align: center;
  color: var(--color-text-muted);
}

/* 分页 */
.fla-pagination {
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

/* 下拉过渡 */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.25s ease;
}
.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 骨架屏 */
.fla-skeleton {
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .fla-form-grid {
    grid-template-columns: 1fr;
  }

  .fla-card {
    flex-wrap: wrap;
  }

  .fla-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .fla-url, .fla-signature {
    display: none;
  }
}
</style>
