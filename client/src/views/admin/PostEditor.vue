<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBlogStore } from '../../stores/blog'
import { postApi, uploadApi } from '../../api'
import { useConfirm } from '../../composables/useConfirm'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import ImageExtension from '@tiptap/extension-image'
import LinkExtension from '@tiptap/extension-link'
import PlaceholderExtension from '@tiptap/extension-placeholder'
import UnderlineExtension from '@tiptap/extension-underline'
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table'
import { marked } from 'marked'

marked.setOptions({ breaks: true, gfm: true })

// 检测文本是否包含 Markdown 语法
function looksLikeMarkdown(text) {
  const mdPatterns = [
    /^#{1,6}\s/m,
    /\*\*[^*]+\*\*/,
    /__[^_]+__/,
    /\[.*\]\(.*\)/,
    /^\s*[-*+]\s/m,
    /^\s*\d+\.\s/m,
    /^>\s/m,
    /```/,
    /`[^`]+`/,
    /!\[.*\]\(.*\)/,
    /~~[^~]+~~/,
    /^\|.*\|/m,
  ]
  return mdPatterns.some(p => p.test(text))
}

const router = useRouter()
const route = useRoute()
const blog = useBlogStore()
const { alert: showAlert, confirm, prompt } = useConfirm()
const isEdit = !!route.params.id

const form = ref({
  type: 'article',
  title: '',
  summary: '',
  content: '',
  cover_image: '',
  category_id: null,
  rating: null,
  status: 'draft',
  tags: [],
  metadata: { writing_note: { mood: '', bgm: '', weather: '', note: '' } },
})

const saving = ref(false)
const showWritingNote = ref(false)
const error = ref('')

// Load categories and tags
onMounted(async () => {
  await Promise.all([blog.fetchCategories(), blog.fetchTags()])
  if (isEdit) {
    try {
      const res = await postApi.detail(route.params.id)
      const post = res.post || res
      form.value = {
        type: post.type,
        title: post.title,
        summary: post.summary || '',
        content: post.content,
        cover_image: post.cover_image || '',
        category_id: post.category_id,
        rating: post.rating,
        status: post.status,
        tags: post.tags?.map(t => t.id) || [],
        metadata: {
          ...(post.metadata || {}),
          writing_note: {
            mood: '', bgm: '', weather: '', note: '',
            ...(post.metadata?.writing_note || {})
          }
        },
      }
      editor.value?.commands.setContent(post.content)
    } catch (e) {
      if (e.response?.status === 401) router.push('/admin/login')
      else error.value = '加载失败'
    }
  }
})

const uploadingImage = ref(false)

// 粘贴图片时自动上传
async function handlePasteImage(file) {
  if (!file || !file.type?.startsWith('image/')) return

  uploadingImage.value = true
  try {
    // 转 base64
    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
    const base64 = btoa(binary)

    const res = await uploadApi.image({ base64, filename: file.name || 'paste.png' })
    const url = res.url

    // 插入编辑器
    editor.value?.chain().focus().setImage({ src: url }).run()
  } catch (e) {
    console.error('图片上传失败:', e)
    showAlert('图片上传失败，请重试')
  } finally {
    uploadingImage.value = false
  }
}

// Tiptap editor
const editor = useEditor({
  content: form.value.content,
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    ImageExtension.configure({ inline: true }),
    LinkExtension.configure({ openOnClick: false }),
    PlaceholderExtension.configure({ placeholder: '开始写吧…' }),
    UnderlineExtension,
    Table.configure({ resizable: true }),
    TableRow,
    TableCell,
    TableHeader,
  ],
  onUpdate: ({ editor }) => { form.value.content = editor.getHTML() },
  onCreate: ({ editor }) => {
    const dom = editor.view.dom
    // 粘贴图片 + Markdown 识别
    dom.addEventListener('paste', (event) => {
      const clipboard = event.clipboardData
      if (!clipboard) return

      // 优先处理图片粘贴
      for (const item of clipboard.items) {
        if (item.type?.startsWith('image/')) {
          event.preventDefault()
          handlePasteImage(item.getAsFile())
          return
        }
      }

      // 如果没有 HTML 内容，且纯文本包含 Markdown 语法，转换为 HTML 再插入
      const html = clipboard.getData('text/html')
      const plain = clipboard.getData('text/plain')
      if (!html && plain && looksLikeMarkdown(plain)) {
        event.preventDefault()
        editor.commands.insertContent(marked.parse(plain))
      }
    })
    // 拖拽图片
    dom.addEventListener('dragover', (e) => { e.preventDefault() })
    dom.addEventListener('drop', (e) => {
      const file = e.dataTransfer?.files?.[0]
      if (file?.type?.startsWith('image/')) {
        e.preventDefault()
        handlePasteImage(file)
      }
    })
  },
})

// Watch type change
const typeOptions = [
  { value: 'article', label: '文章', icon: '✎', color: 'var(--color-accent-article)' },
  { value: 'anime', label: '动漫', icon: '◉', color: 'var(--color-accent-anime)' },
  { value: 'galgame', label: 'Galgame', icon: '◈', color: 'var(--color-accent-galgame)' },
]

function setType(type) {
  form.value.type = type
  if (type !== 'article') form.value.category_id = null
  if (type === 'article') form.value.rating = null
}

// Save
async function handleSave(publish = false) {
  if (!form.value.title) { error.value = '请填写标题'; return }
  if (!form.value.content?.trim() && !editor.value?.getHTML()?.trim()) { error.value = '请填写内容'; return }

  error.value = ''
  saving.value = true
  try {
    const data = { ...form.value, content: editor.value?.getHTML() || form.value.content }
    if (publish) data.status = 'published'
    else if (!form.value.status) data.status = 'draft'

    if (isEdit) {
      await postApi.update(route.params.id, data)
    } else {
      await postApi.create(data)
    }
    router.push('/admin/posts')
  } catch (e) {
    error.value = e.response?.data?.message || '保存失败'
  } finally {
    saving.value = false
  }
}

const fileInput = ref(null)
const coverInput = ref(null)
const uploadingCover = ref(false)

async function onCoverSelected(e) {
  const file = e.target.files?.[0]
  if (!file) return
  uploadingCover.value = true
  try {
    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
    const base64 = btoa(binary)
    const res = await uploadApi.image({ base64, filename: file.name })
    form.value.cover_image = res.url
  } catch {
    showAlert('封面上传失败，请重试')
  } finally {
    uploadingCover.value = false
    e.target.value = ''
  }
}

function removeCover() {
  form.value.cover_image = ''
}

// Toolbar actions
async function addImage() {
  const choice = await confirm('点「确定」输入图片 URL，点「取消」选择文件上传')
  if (choice) {
    const url = await prompt('输入图片 URL:')
    if (url && editor.value) {
      editor.value.chain().focus().setImage({ src: url }).run()
    }
  } else {
    fileInput.value?.click()
  }
}

function onFileSelected(e) {
  const file = e.target.files?.[0]
  if (file) handlePasteImage(file)
  e.target.value = ''
}

async function addLink() {
  const url = await prompt('输入链接 URL:')
  if (url && editor.value) {
    editor.value.chain().focus().setLink({ href: url }).run()
  }
}

// 表格尺寸选择
const showTablePicker = ref(false)
const tablePickerCols = ref(4)
const tablePickerRows = ref(3)

function openTablePicker() {
  showTablePicker.value = true
}

function insertTable() {
  if (!editor.value) return
  editor.value.chain().focus()
    .insertTable({ rows: tablePickerRows.value, cols: tablePickerCols.value, withHeaderRow: true })
    .run()
  showTablePicker.value = false
}

// AI 辅助
const aiPanelOpen = ref(false)
const aiLoading = ref(false)
const aiAbortController = ref(null)
const savedSelection = ref(null) // mousedown 时捕获的选区

const aiInstructions = [
  { value: 'polish', label: '润色', icon: '✦' },
  { value: 'expand', label: '扩写', icon: '⊕' },
  { value: 'shorten', label: '缩写', icon: '⊖' },
  { value: 'translate', label: '翻译', icon: '⇄' },
]

// mousedown 时捕获选区（点击按钮会导致选区丢失）
function captureSelection() {
  if (!editor.value) return
  const { from, to } = editor.value.state.selection
  const text = editor.value.state.doc.textBetween(from, to, ' ').trim()
  savedSelection.value = text ? { from, to, text } : null
}

function openAiPanel() {
  if (!savedSelection.value) {
    showAlert('请先选中要处理的文字')
    return
  }
  aiPanelOpen.value = !aiPanelOpen.value
}

async function runAiAssist(instruction) {
  if (!editor.value || aiLoading.value || !savedSelection.value) return

  const { from, to, text: selectedText } = savedSelection.value

  aiLoading.value = true
  aiPanelOpen.value = false

  // 先用 placeholder 替换选中文本
  editor.value.chain().focus().insertContentAt({ from, to }, ' ').run()

  const abortController = new AbortController()
  aiAbortController.value = abortController

  try {
    const response = await fetch('/api/ai/assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ text: selectedText, instruction }),
      signal: abortController.signal,
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || `请求失败 (${response.status})`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let accumulated = ''

    // 删除 placeholder，从原位置开始插入
    editor.value.chain().focus().insertContentAt({ from, to: from + 1 }, '').run()
    let insertPos = from

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue
        const data = trimmed.slice(6)
        if (data === '[DONE]') break

        try {
          const parsed = JSON.parse(data)
          if (parsed.content) {
            accumulated += parsed.content
            // 流式插入：每次追加新内容
            editor.value.chain().focus().insertContentAt(insertPos, parsed.content).run()
            insertPos += parsed.content.length
          }
        } catch {
          // 跳过解析失败的行
        }
      }
    }
  } catch (e) {
    if (e.name !== 'AbortError') {
      showAlert(e.message || 'AI 请求失败')
    }
    // 恢复原文
    editor.value.chain().focus().insertContentAt({ from, to: from }, selectedText).run()
  } finally {
    aiLoading.value = false
    aiAbortController.value = null
  }
}

function cancelAi() {
  aiAbortController.value?.abort()
}

// 点击外部关闭 AI 面板
function handleEditorClick(e) {
  if (aiPanelOpen.value && !e.target.closest('.ai-panel') && !e.target.closest('.tb-btn-ai')) {
    aiPanelOpen.value = false
  }
}
</script>

<template>
  <div class="post-editor">
    <!-- 类型选择 -->
    <div class="pe-type-select">
      <button
        v-for="opt in typeOptions"
        :key="opt.value"
        class="type-btn glass-btn"
        :class="{ 'type-btn--active': form.type === opt.value }"
        :style="{ '--accent': opt.color }"
        @click="setType(opt.value)"
      >
        {{ opt.icon }} {{ opt.label }}
      </button>
    </div>

    <!-- 标题 -->
    <input
      v-model="form.title"
      class="glass-input pe-title"
      placeholder="标题"
    />

    <!-- 摘要 -->
    <textarea
      v-model="form.summary"
      class="glass-input pe-summary"
      placeholder="摘要（可选）"
      rows="2"
    ></textarea>

    <!-- 封面上传 -->
    <div class="pe-cover glass-card">
      <label class="cover-label">封面图片</label>
      <div class="cover-body">
        <div v-if="form.cover_image" class="cover-preview">
          <img :src="form.cover_image" alt="封面预览" />
          <button class="cover-remove" @click="removeCover" title="移除封面">×</button>
        </div>
        <button v-else class="cover-upload-btn" @click="coverInput?.click()" :disabled="uploadingCover">
          <span v-if="uploadingCover">上传中…</span>
          <template v-else>
            <span class="cover-upload-icon">＋</span>
            <span>点击上传封面</span>
          </template>
        </button>
      </div>
      <input ref="coverInput" type="file" accept="image/*" style="display:none" @change="onCoverSelected" />
    </div>

    <!-- Tiptap 工具栏 -->
    <div class="pe-toolbar glass-card" v-if="editor">
      <button class="tb-btn" @click="editor.chain().focus().toggleBold().run()" :class="{ 'tb-btn--active': editor.isActive('bold') }" title="加粗"><strong>B</strong></button>
      <button class="tb-btn" @click="editor.chain().focus().toggleItalic().run()" :class="{ 'tb-btn--active': editor.isActive('italic') }" title="斜体"><em>I</em></button>
      <button class="tb-btn" @click="editor.chain().focus().toggleUnderline().run()" :class="{ 'tb-btn--active': editor.isActive('underline') }" title="下划线"><u>U</u></button>
      <span class="tb-sep" />
      <button class="tb-btn" @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" :class="{ 'tb-btn--active': editor.isActive('heading', { level: 1 }) }" title="标题1">H1</button>
      <button class="tb-btn" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ 'tb-btn--active': editor.isActive('heading', { level: 2 }) }" title="标题2">H2</button>
      <button class="tb-btn" @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" :class="{ 'tb-btn--active': editor.isActive('heading', { level: 3 }) }" title="标题3">H3</button>
      <span class="tb-sep" />
      <button class="tb-btn" @click="editor.chain().focus().toggleBulletList().run()" :class="{ 'tb-btn--active': editor.isActive('bulletList') }" title="无序列表">•</button>
      <button class="tb-btn" @click="editor.chain().focus().toggleOrderedList().run()" :class="{ 'tb-btn--active': editor.isActive('orderedList') }" title="有序列表">1.</button>
      <button class="tb-btn" @click="editor.chain().focus().toggleBlockquote().run()" :class="{ 'tb-btn--active': editor.isActive('blockquote') }" title="引用">"</button>
      <button class="tb-btn" @click="editor.chain().focus().toggleCodeBlock().run()" :class="{ 'tb-btn--active': editor.isActive('codeBlock') }" title="代码">&lt;/&gt;</button>
      <span class="tb-sep" />
      <button class="tb-btn" @click="addImage" title="插入图片">🖼</button>
      <button class="tb-btn" @click="addLink" title="插入链接">🔗</button>
      <button class="tb-btn" @click="openTablePicker" title="插入表格">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
      </button>
      <span class="tb-sep" />
      <!-- AI 辅助按钮 -->
      <button class="tb-btn tb-btn-ai" @mousedown="captureSelection" @click="openAiPanel" :class="{ 'tb-btn--active': aiPanelOpen }" title="AI 辅助" :disabled="aiLoading">
        <span v-if="aiLoading" class="ai-spinner">✦</span>
        <span v-else>AI</span>
      </button>
      <!-- 表格尺寸选择器 -->
      <div v-if="showTablePicker" class="tb-table-picker glass-card">
        <div class="tp-row">
          <label>列: <input v-model.number="tablePickerCols" type="number" min="1" max="10" class="tp-input" /></label>
          <label>行: <input v-model.number="tablePickerRows" type="number" min="1" max="20" class="tp-input" /></label>
        </div>
        <button class="glass-btn tp-insert-btn" @click="insertTable">插入表格</button>
        <button class="glass-btn tp-cancel-btn" @click="showTablePicker = false">取消</button>
      </div>
      <!-- 隐藏的文件选择器 -->
      <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFileSelected" />
      <!-- AI 浮动面板 -->
      <div v-if="aiPanelOpen" class="ai-panel glass-card">
        <div class="ai-panel-title">AI 写作辅助</div>
        <div class="ai-panel-btns">
          <button
            v-for="inst in aiInstructions"
            :key="inst.value"
            class="ai-inst-btn"
            @click="runAiAssist(inst.value)"
          >
            <span class="ai-inst-icon">{{ inst.icon }}</span>
            <span>{{ inst.label }}</span>
          </button>
        </div>
      </div>
      <!-- AI 生成中提示 -->
      <div v-if="aiLoading" class="ai-loading-bar">
        <span class="ai-loading-spinner">✦</span>
        <span>AI 正在生成…</span>
        <button class="ai-cancel-btn" @click="cancelAi">取消</button>
      </div>
    </div>

    <!-- 上传中提示 -->
    <div v-if="uploadingImage" class="pe-uploading glass-card">
      <span class="uploading-spinner">✦</span>
      <span>图片上传中…</span>
    </div>

    <!-- 编辑器 -->
    <div class="pe-editor glass-card" :class="{ 'pe-editor--uploading': uploadingImage }">
      <EditorContent :editor="editor" class="editor-content" />
    </div>

    <!-- 元数据面板 -->
    <div class="pe-meta">
      <div class="pe-meta-row" v-if="form.type !== 'article'">
        <label class="meta-label">评分 (1-10)</label>
        <input v-model.number="form.rating" class="glass-input meta-input-short" type="number" min="1" max="10" placeholder="评分" />
      </div>


      <div class="pe-meta-row">
        <label class="meta-label">标签</label>
        <div class="tag-select">
          <button
            v-for="tag in blog.tags"
            :key="tag.id"
            class="tag-badge"
            :class="{ 'tag-badge--active': form.tags.includes(tag.id) }"
            @click="form.tags = form.tags.includes(tag.id) ? form.tags.filter(t => t !== tag.id) : [...form.tags, tag.id]"
          >{{ tag.name }}</button>
        </div>
      </div>

      <!-- 创作手记 -->
      <div class="pe-writing-note">
        <button class="writing-note-toggle glass-btn" @click="showWritingNote = !showWritingNote">
          {{ showWritingNote ? '▼' : '▶' }} 创作手记
        </button>
        <div v-if="showWritingNote" class="writing-note-body">
          <div class="note-row">
            <input v-model="form.metadata.writing_note.mood" class="glass-input" placeholder="心情（如：惬意）" />
            <input v-model="form.metadata.writing_note.bgm" class="glass-input" placeholder="BGM（如：ヨルシカ - 春泥棒）" />
          </div>
          <div class="note-row">
            <input v-model="form.metadata.writing_note.weather" class="glass-input" placeholder="天气（如：晴 · 22°C）" />
          </div>
          <textarea v-model="form.metadata.writing_note.note" class="glass-input" placeholder="备注（可选）" rows="2"></textarea>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <p v-if="error" class="pe-error">{{ error }}</p>

    <!-- 操作按钮 -->
    <div class="pe-actions">
      <router-link to="/admin/posts" class="glass-btn">← 返回</router-link>
      <div class="pe-actions-right">
        <button class="glass-btn" :disabled="saving" @click="handleSave(false)">{{ saving ? '保存中…' : '存为草稿' }}</button>
        <button class="glass-btn pe-btn-publish" :disabled="saving" @click="handleSave(true)">{{ saving ? '发布中…' : '发布' }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.post-editor {
  max-width: 860px;
}

/* 类型选择 */
.pe-type-select {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.type-btn {
  font-size: 14px;
  padding: 8px 20px;
  transition: all var(--transition-base);
}

.type-btn--active {
  color: var(--accent);
  border-color: var(--accent);
  background: var(--accent);
  color: white;
}

/* 输入 */
.pe-title {
  font-size: 22px;
  font-weight: 600;
  padding: 14px 18px;
  margin-bottom: 12px;
  border-radius: var(--radius-md);
}

.pe-summary {
  font-size: 14px;
  padding: 10px 16px;
  margin-bottom: 16px;
  resize: vertical;
  font-family: var(--font-sans);
}

/* 封面上传 */
.pe-cover {
  padding: 14px 18px;
  margin-bottom: 16px;
}

.cover-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: 10px;
}

.cover-body {
  display: flex;
  align-items: center;
}

.cover-preview {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  max-width: 320px;
}

.cover-preview img {
  display: block;
  width: 100%;
  max-height: 180px;
  object-fit: cover;
  border-radius: var(--radius-md);
}

.cover-remove {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.cover-preview:hover .cover-remove {
  opacity: 1;
}

.cover-upload-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 2px dashed var(--glass-border);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-muted);
  font-size: 13px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.cover-upload-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: rgba(139, 69, 19, 0.04);
}

.cover-upload-btn:disabled {
  opacity: 0.6;
  cursor: wait;
}

.cover-upload-icon {
  font-size: 18px;
}

/* 工具栏 */
.pe-toolbar {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
  padding: 6px 8px;
  margin-bottom: 1px;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.tb-btn {
  width: 32px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 4px;
  font-size: 13px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-width: 32px;
  min-height: 30px;
}

.tb-btn:hover { background: rgba(139, 69, 19, 0.08); color: var(--color-text); }
.tb-btn--active { background: rgba(139, 69, 19, 0.12); color: var(--color-primary); }

.tb-sep {
  width: 1px;
  height: 20px;
  background: var(--glass-border);
  margin: 0 4px;
}

/* AI 按钮 */
.tb-btn-ai {
  font-weight: 700;
  font-size: 12px;
  color: var(--color-accent-galgame);
  letter-spacing: 0.5px;
}

.tb-btn-ai:hover {
  background: rgba(123, 168, 114, 0.12);
  color: var(--color-accent-galgame);
}

.tb-btn-ai.tb-btn--active {
  background: rgba(123, 168, 114, 0.15);
  color: var(--color-accent-galgame);
}

.ai-spinner {
  display: inline-block;
  animation: uploadSpin 0.8s linear infinite;
  font-size: 14px;
}

/* AI 浮动面板 */
.ai-panel {
  position: absolute;
  top: 100%;
  right: 8px;
  margin-top: 6px;
  padding: 12px 16px;
  z-index: 50;
  min-width: 200px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.ai-panel-title {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-bottom: 8px;
}

.ai-panel-btns {
  display: flex;
  gap: 6px;
}

.ai-inst-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 8px;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.ai-inst-btn:hover {
  border-color: var(--color-accent-galgame);
  color: var(--color-accent-galgame);
  background: rgba(123, 168, 114, 0.06);
}

.ai-inst-icon {
  font-size: 16px;
}

/* AI 加载条 */
.ai-loading-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--color-accent-galgame);
}

.ai-loading-spinner {
  display: inline-block;
  animation: uploadSpin 0.8s linear infinite;
  font-size: 16px;
}

.ai-cancel-btn {
  margin-left: auto;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-muted);
  font-size: 12px;
  padding: 2px 10px;
  cursor: pointer;
}

.ai-cancel-btn:hover {
  border-color: var(--color-accent-anime);
  color: var(--color-accent-anime);
}

/* 编辑器 */
.pe-editor {
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  margin-bottom: 20px;
}

.editor-content {
  padding: 20px 24px;
  min-height: 320px;
}

.editor-content :deep(.ProseMirror) {
  outline: none;
  min-height: 320px;
  font-size: 15px;
  line-height: 1.8;
}

.editor-content :deep(.ProseMirror p) { margin-bottom: 0.8em; }
.editor-content :deep(.ProseMirror h1) { font-size: 24px; margin: 1em 0 0.5em; }
.editor-content :deep(.ProseMirror h2) { font-size: 20px; margin: 0.8em 0 0.4em; }
.editor-content :deep(.ProseMirror h3) { font-size: 17px; margin: 0.6em 0 0.3em; }
.editor-content :deep(.ProseMirror ul), .editor-content :deep(.ProseMirror ol) { padding-left: 24px; margin-bottom: 0.8em; }
.editor-content :deep(.ProseMirror blockquote) { border-left: 3px solid var(--color-primary); padding-left: 16px; color: var(--color-text-secondary); margin: 0.8em 0; }
.editor-content :deep(.ProseMirror pre) { background: rgba(44,44,44,0.92); color: #e8e4df; padding: 16px; border-radius: 8px; font-size: 13px; }
.editor-content :deep(.ProseMirror code) { font-family: var(--font-mono); font-size: 13px; background: rgba(139,69,19,0.08); padding: 2px 6px; border-radius: 4px; }
.editor-content :deep(.ProseMirror pre code) { background: none; }
.editor-content :deep(.ProseMirror img) { max-width: 100%; border-radius: 8px; margin: 0.5em 0; }
.editor-content :deep(.ProseMirror p.is-editor-empty:first-child::before) { color: var(--color-text-muted); content: attr(data-placeholder); float: left; height: 0; pointer-events: none; }

/* 上传中提示 */
.pe-uploading {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--color-primary);
  border-radius: var(--radius-md);
}

.uploading-spinner {
  display: inline-block;
  animation: uploadSpin 0.8s linear infinite;
  font-size: 18px;
}

@keyframes uploadSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.pe-editor--uploading {
  opacity: 0.6;
  pointer-events: none;
}

/* 元数据 */
.pe-meta {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.pe-meta-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.meta-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  min-width: 60px;
  flex-shrink: 0;
}

.meta-input {
  flex: 1;
}

.meta-input-short {
  width: 100px;
}

.tag-select {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-badge--active {
  color: var(--color-primary);
  border-color: var(--color-primary);
  background: rgba(139, 69, 19, 0.08);
}

/* 创作手记 */
.pe-writing-note {
  margin-top: 4px;
}

.writing-note-toggle {
  font-size: 13px;
  padding: 6px 14px;
  margin-bottom: 10px;
}

.writing-note-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
}

.note-row {
  display: flex;
  gap: 10px;
}

.note-row .glass-input {
  flex: 1;
}

/* 错误 */
.pe-error {
  font-size: 14px;
  color: var(--color-accent-anime);
  margin-bottom: 16px;
  text-align: center;
}

/* 操作 */
.pe-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pe-actions-right {
  display: flex;
  gap: 8px;
}

.pe-btn-publish {
  color: var(--color-white);
  background: var(--color-primary);
  border: none;
}

.pe-btn-publish:hover {
  background: var(--color-primary-light);
}

/* 表格选择器 */
.tb-table-picker {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 6px;
  padding: 12px 16px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 180px;
}

.tp-row {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.tp-input {
  width: 48px;
  padding: 4px 6px;
  border: 1px solid var(--glass-border);
  border-radius: 4px;
  background: var(--glass-bg);
  color: var(--color-text);
  font-size: 13px;
  text-align: center;
}

.tp-insert-btn {
  font-size: 13px;
  padding: 6px 0;
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.tp-cancel-btn {
  font-size: 12px;
  padding: 4px 0;
}

/* 编辑器内表格 */
.editor-content :deep(.ProseMirror table) {
  border-collapse: collapse;
  margin: 1em 0;
  width: 100%;
  font-size: 14px;
}

.editor-content :deep(.ProseMirror th) {
  background: rgba(139, 69, 19, 0.1);
  font-weight: 600;
  text-align: left;
  padding: 10px 14px;
  border: 1px solid var(--glass-border);
}

.editor-content :deep(.ProseMirror td) {
  padding: 8px 14px;
  border: 1px solid var(--glass-border);
  vertical-align: top;
}

.editor-content :deep(.ProseMirror th p),
.editor-content :deep(.ProseMirror td p) {
  margin: 0;
}

.editor-content :deep(.ProseMirror .selectedCell) {
  background: rgba(139, 69, 19, 0.06);
}

.editor-content :deep(.ProseMirror .column-resize-handle) {
  position: absolute;
  top: 0;
  bottom: 0;
  right: -2px;
  width: 4px;
  background: var(--color-primary);
  opacity: 0;
  pointer-events: auto;
  cursor: col-resize;
}

.editor-content :deep(.ProseMirror table:hover .column-resize-handle) {
  opacity: 0.3;
}

@media (max-width: 768px) {
  .pe-type-select {
    flex-direction: column;
  }

  .type-btn {
    padding: 12px 20px;
    font-size: 15px;
  }

  .note-row {
    flex-direction: column;
  }
  .pe-meta-row {
    flex-direction: column;
    align-items: flex-start;
  }
  .pe-actions {
    flex-direction: column;
    gap: 12px;
  }
  .pe-actions-right {
    width: 100%;
  }
  .pe-actions-right .glass-btn {
    flex: 1;
  }

  /* 工具栏移动端优化 */
  .pe-toolbar {
    gap: 6px;
    padding: 8px 10px;
  }

  .tb-btn {
    width: 40px;
    height: 40px;
    font-size: 15px;
  }

  .tb-sep {
    margin: 0 2px;
  }

  /* 编辑器内容区减少内边距 */
  .editor-content {
    padding: 14px 16px;
  }
}
</style>
