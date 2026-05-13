<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { announcementApi } from '../../api'

const router = useRouter()
const announcements = ref([])
const total = ref(0)
const loading = ref(false)
const page = ref(1)
const pageSize = 15

// 表单状态
const editingId = ref(null)
const formVisible = ref(false)
const formLoading = ref(false)
const form = ref({
  content: '',
  is_active: true,
  sort_order: 0
})

watch(page, fetchAnnouncements)
onMounted(fetchAnnouncements)

async function fetchAnnouncements() {
  loading.value = true
  try {
    const params = { page: page.value, limit: pageSize }
    const res = await announcementApi.adminList(params)
    announcements.value = res.data?.list || []
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
  form.value = { content: '', is_active: true, sort_order: 0 }
  formVisible.value = true
}

function openEdit(item) {
  editingId.value = item.id
  form.value = {
    content: item.content,
    is_active: item.is_active,
    sort_order: item.sort_order ?? 0
  }
  formVisible.value = true
}

function cancelForm() {
  formVisible.value = false
  editingId.value = null
}

async function submitForm() {
  if (!form.value.content.trim()) return alert('公告内容不能为空')

  formLoading.value = true
  try {
    if (editingId.value) {
      await announcementApi.update(editingId.value, form.value)
    } else {
      await announcementApi.create(form.value)
    }
    formVisible.value = false
    editingId.value = null
    fetchAnnouncements()
  } catch (e) {
    alert(e.response?.data?.message || '操作失败')
  } finally {
    formLoading.value = false
  }
}

async function handleDelete(id) {
  if (!confirm('确定删除这条公告？')) return
  try {
    await announcementApi.delete(id)
    fetchAnnouncements()
  } catch (e) {
    alert(e.response?.data?.message || '删除失败')
  }
}

function toggleActive(item) {
  announcementApi.update(item.id, { is_active: !item.is_active })
    .then(() => fetchAnnouncements())
    .catch(e => alert(e.response?.data?.message || '操作失败'))
}
</script>

<template>
  <div class="ann-admin">
    <div class="ann-header">
      <h2 class="page-title">公告管理</h2>
      <button class="glass-btn ann-add-btn" @click="openAdd" v-if="!formVisible">
        + 添加公告
      </button>
    </div>

    <!-- 编辑/新增面板 -->
    <transition name="dropdown-fade">
      <div v-if="formVisible" class="ann-form glass-card">
        <h3 class="ann-form-title">{{ editingId ? '编辑公告' : '添加公告' }}</h3>
        <div class="ann-form-grid">
          <div class="ann-field">
            <label class="ann-label">公告内容 <span class="required">*</span></label>
            <textarea
              v-model="form.content"
              class="glass-input ann-textarea"
              placeholder="输入公告内容…"
              maxlength="500"
              rows="2"
            />
          </div>
          <div class="ann-field ann-field-row">
            <label class="ann-label">排序权重</label>
            <input
              v-model.number="form.sort_order"
              type="number"
              class="glass-input"
              placeholder="数字越小越靠前"
            />
          </div>
          <div class="ann-field ann-field-row">
            <label class="ann-checkbox-label">
              <input v-model="form.is_active" type="checkbox" class="ann-checkbox" />
              <span>启用公告</span>
            </label>
          </div>
        </div>
        <div class="ann-form-actions">
          <button class="glass-btn ann-submit" :disabled="formLoading" @click="submitForm">
            {{ formLoading ? '保存中...' : '保存' }}
          </button>
          <button class="glass-btn ann-cancel" @click="cancelForm">取消</button>
        </div>
      </div>
    </transition>

    <!-- 骨架屏 -->
    <div v-if="loading && !announcements.length" class="ann-skeleton">
      <div v-for="i in 5" :key="i" class="skeleton" style="height:64px;margin-bottom:8px;border-radius:8px" />
    </div>

    <!-- 列表 -->
    <div v-if="!loading || announcements.length" class="ann-list">
      <div v-for="item in announcements" :key="item.id" class="ann-card glass-card">
        <div class="ann-info">
          <p class="ann-content">{{ item.content }}</p>
          <span class="ann-meta">
            <span :class="item.is_active ? 'status-active' : 'status-inactive'">
              {{ item.is_active ? '● 启用' : '○ 禁用' }}
            </span>
            <span>排序: {{ item.sort_order }}</span>
          </span>
        </div>
        <div class="ann-actions">
          <button class="action-btn glass-btn action-toggle" @click="toggleActive(item)">
            {{ item.is_active ? '禁用' : '启用' }}
          </button>
          <button class="action-btn glass-btn action-edit" @click="openEdit(item)">编辑</button>
          <button class="action-btn glass-btn action-delete" @click="handleDelete(item.id)">删除</button>
        </div>
      </div>

      <div v-if="!announcements.length" class="ann-empty glass-card">
        <p>暂无公告，点击上方按钮添加</p>
      </div>
    </div>

    <!-- 分页 -->
    <div class="ann-pagination" v-if="totalPages > 1">
      <button class="glass-btn" :disabled="page <= 1" @click="page--">上一页</button>
      <span class="page-info">{{ page }} / {{ totalPages }}</span>
      <button class="glass-btn" :disabled="page >= totalPages" @click="page++">下一页</button>
    </div>
  </div>
</template>

<style scoped>
.ann-admin {
  max-width: 860px;
}

.ann-header {
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

.ann-add-btn {
  font-size: 13px;
  padding: 8px 20px;
}

/* 表单面板 */
.ann-form {
  padding: 24px;
  margin-bottom: 16px;
}

.ann-form-title {
  font-family: var(--font-sans);
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
}

.ann-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;
}

.ann-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ann-field:first-child {
  grid-column: 1 / -1;
}

.ann-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.required {
  color: var(--color-accent-anime);
}

.ann-textarea {
  resize: vertical;
  font-family: inherit;
}

.ann-field-row {
  justify-content: center;
}

.ann-checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.ann-checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--color-primary);
  cursor: pointer;
}

.ann-form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.ann-submit {
  background: rgba(139, 69, 19, 0.1);
  border-color: rgba(139, 69, 19, 0.25);
  color: var(--color-primary);
  font-weight: 600;
}

.ann-submit:hover {
  background: rgba(139, 69, 19, 0.18);
}

.ann-cancel {
  color: var(--color-text-muted);
}

/* 列表 */
.ann-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ann-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 20px;
}

.ann-info {
  flex: 1;
  min-width: 0;
}

.ann-content {
  font-size: 14px;
  color: var(--color-text);
  margin-bottom: 6px;
  line-height: 1.6;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ann-meta {
  display: flex;
  gap: 14px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.status-active {
  color: #7BA872;
}

.status-inactive {
  color: var(--color-text-muted);
}

.ann-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.action-btn {
  font-size: 12px;
  padding: 4px 14px;
}

.action-edit:hover { color: var(--color-primary); border-color: rgba(139, 69, 19, 0.3); }
.action-delete:hover { color: var(--color-accent-anime); border-color: rgba(232, 91, 91, 0.3); }
.action-toggle:hover { color: var(--color-accent-galgame); border-color: rgba(123, 168, 114, 0.3); }

/* 空状态 */
.ann-empty {
  padding: 48px;
  text-align: center;
  color: var(--color-text-muted);
}

/* 分页 */
.ann-pagination {
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

.ann-skeleton {
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .ann-form-grid {
    grid-template-columns: 1fr;
  }

  .ann-card {
    flex-wrap: wrap;
  }

  .ann-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
