<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { quoteApi } from '../../api'

const router = useRouter()
const quotes = ref([])
const total = ref(0)
const loading = ref(false)
const page = ref(1)
const pageSize = 15

// 表单状态
const editingId = ref(null)
const formVisible = ref(false)
const formLoading = ref(false)
const form = ref({
  ja: '',
  zh: '',
  source: '',
  sort_order: 0
})

watch(page, fetchQuotes)
onMounted(fetchQuotes)

async function fetchQuotes() {
  loading.value = true
  try {
    const params = { page: page.value, limit: pageSize }
    const res = await quoteApi.adminList(params)
    quotes.value = res.data?.list || []
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
  form.value = { ja: '', zh: '', source: '', sort_order: 0 }
  formVisible.value = true
}

function openEdit(quote) {
  editingId.value = quote.id
  form.value = {
    ja: quote.ja,
    zh: quote.zh,
    source: quote.source || '',
    sort_order: quote.sort_order ?? 0
  }
  formVisible.value = true
}

function cancelForm() {
  formVisible.value = false
  editingId.value = null
}

async function submitForm() {
  if (!form.value.ja.trim()) return alert('日文原文不能为空')
  if (!form.value.zh.trim()) return alert('中文翻译不能为空')

  formLoading.value = true
  try {
    if (editingId.value) {
      await quoteApi.update(editingId.value, form.value)
    } else {
      await quoteApi.create(form.value)
    }
    formVisible.value = false
    editingId.value = null
    fetchQuotes()
  } catch (e) {
    alert(e.response?.data?.message || '操作失败')
  } finally {
    formLoading.value = false
  }
}

async function handleDelete(id) {
  if (!confirm('确定删除这条名言？')) return
  try {
    await quoteApi.delete(id)
    fetchQuotes()
  } catch (e) {
    alert(e.response?.data?.message || '删除失败')
  }
}
</script>

<template>
  <div class="qt-admin">
    <div class="qt-header">
      <h2 class="page-title">名言管理</h2>
      <button class="glass-btn qt-add-btn" @click="openAdd" v-if="!formVisible">
        + 添加名言
      </button>
    </div>

    <!-- 编辑/新增面板 -->
    <transition name="dropdown-fade">
      <div v-if="formVisible" class="qt-form glass-card">
        <h3 class="qt-form-title">{{ editingId ? '编辑名言' : '添加名言' }}</h3>
        <div class="qt-form-grid">
          <div class="qt-field">
            <label class="qt-label">日文原文 <span class="required">*</span></label>
            <textarea v-model="form.ja" class="glass-input qt-textarea" placeholder="日文动漫名言原文" maxlength="500" rows="2" />
          </div>
          <div class="qt-field">
            <label class="qt-label">中文翻译 <span class="required">*</span></label>
            <textarea v-model="form.zh" class="glass-input qt-textarea" placeholder="中文翻译" maxlength="500" rows="2" />
          </div>
          <div class="qt-field">
            <label class="qt-label">出处</label>
            <input v-model="form.source" class="glass-input" placeholder="例如：CLANNAD ~After Story~" maxlength="200" />
          </div>
          <div class="qt-field">
            <label class="qt-label">排序权重</label>
            <input v-model.number="form.sort_order" type="number" class="glass-input" placeholder="数字越小越靠前" />
          </div>
        </div>
        <div class="qt-form-actions">
          <button class="glass-btn qt-submit" :disabled="formLoading" @click="submitForm">
            {{ formLoading ? '保存中...' : '保存' }}
          </button>
          <button class="glass-btn qt-cancel" @click="cancelForm">取消</button>
        </div>
      </div>
    </transition>

    <!-- 骨架屏 -->
    <div v-if="loading && !quotes.length" class="qt-skeleton">
      <div v-for="i in 5" :key="i" class="skeleton" style="height:72px;margin-bottom:8px;border-radius:8px" />
    </div>

    <!-- 列表 -->
    <div v-if="!loading || quotes.length" class="qt-list">
      <div v-for="quote in quotes" :key="quote.id" class="qt-card glass-card">
        <div class="qt-info">
          <p class="qt-ja">{{ quote.ja }}</p>
          <p class="qt-zh">{{ quote.zh }}</p>
          <p class="qt-source" v-if="quote.source">— {{ quote.source }}</p>
        </div>
        <div class="qt-actions">
          <span class="qt-order">排序: {{ quote.sort_order }}</span>
          <button class="action-btn glass-btn action-edit" @click="openEdit(quote)">编辑</button>
          <button class="action-btn glass-btn action-delete" @click="handleDelete(quote.id)">删除</button>
        </div>
      </div>

      <div v-if="!quotes.length" class="qt-empty glass-card">
        <p>暂无名言，点击上方按钮添加</p>
      </div>
    </div>

    <!-- 分页 -->
    <div class="qt-pagination" v-if="totalPages > 1">
      <button class="glass-btn" :disabled="page <= 1" @click="page--">上一页</button>
      <span class="page-info">{{ page }} / {{ totalPages }}</span>
      <button class="glass-btn" :disabled="page >= totalPages" @click="page++">下一页</button>
    </div>
  </div>
</template>

<style scoped>
.qt-admin {
  max-width: 860px;
}

.qt-header {
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

.qt-add-btn {
  font-size: 13px;
  padding: 8px 20px;
}

/* 表单面板 */
.qt-form {
  padding: 24px;
  margin-bottom: 16px;
}

.qt-form-title {
  font-family: var(--font-sans);
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
}

.qt-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;
}

.qt-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.qt-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.required {
  color: var(--color-accent-anime);
}

.qt-textarea {
  resize: vertical;
  font-family: inherit;
}

.qt-form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.qt-submit {
  background: rgba(139, 69, 19, 0.1);
  border-color: rgba(139, 69, 19, 0.25);
  color: var(--color-primary);
  font-weight: 600;
}

.qt-submit:hover {
  background: rgba(139, 69, 19, 0.18);
}

.qt-cancel {
  color: var(--color-text-muted);
}

/* 列表 */
.qt-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.qt-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 20px;
}

.qt-info {
  flex: 1;
  min-width: 0;
}

.qt-ja {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 4px;
  line-height: 1.6;
}

.qt-zh {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
  line-height: 1.5;
}

.qt-source {
  font-size: 12px;
  color: var(--color-text-muted);
  font-style: italic;
}

.qt-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.qt-order {
  font-size: 12px;
  color: var(--color-text-muted);
}

.action-btn {
  font-size: 12px;
  padding: 4px 14px;
}

.action-edit:hover { color: var(--color-primary); border-color: rgba(139, 69, 19, 0.3); }
.action-delete:hover { color: var(--color-accent-anime); border-color: rgba(232, 91, 91, 0.3); }

/* 空状态 */
.qt-empty {
  padding: 48px;
  text-align: center;
  color: var(--color-text-muted);
}

/* 分页 */
.qt-pagination {
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

.qt-skeleton {
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .qt-form-grid {
    grid-template-columns: 1fr;
  }

  .qt-card {
    flex-wrap: wrap;
  }

  .qt-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
