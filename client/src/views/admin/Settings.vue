<script setup>
import { onMounted } from 'vue'
import { useSettings } from '../../composables/useSettings'
import { useOssUpload } from '../../composables/useOssUpload'

const {
  activeTab, saving, loadError, successMsg, tabs,
  siteInfo, socialLinks, newSocial, githubConfig, aboutPage, music,
  loadAll,
  saveSite, addSocial, removeSocial, saveSocial,
  saveGithub, addGithubRepo, removeGithubRepo,
  addSong, removeSong, saveMusic,
  saveAbout,
} = useSettings()

onMounted(loadAll)

// 为每首歌曲维护独立的上传状态
const audioUploaders = new Map()
const coverUploaders = new Map()

function getAudioUploader(index) {
  if (!audioUploaders.has(index)) {
    audioUploaders.set(index, useOssUpload())
  }
  return audioUploaders.get(index)
}

function getCoverUploader(index) {
  if (!coverUploaders.has(index)) {
    coverUploaders.set(index, useOssUpload())
  }
  return coverUploaders.get(index)
}

async function handleAudioUpload(event, index) {
  const file = event.target.files?.[0]
  if (!file) return

  const uploader = getAudioUploader(index)
  const err = uploader.validateAudio(file)
  if (err) { loadError.value = err; return }

  const result = await uploader.upload(file, 'music/')
  if (result) {
    music.value.songs[index].url = result.url
    successMsg.value = '音频上传成功'
    setTimeout(() => successMsg.value = '', 2500)
  } else {
    loadError.value = uploader.error.value
  }
  event.target.value = ''
}

async function handleCoverUpload(event, index) {
  const file = event.target.files?.[0]
  if (!file) return

  const uploader = getCoverUploader(index)
  const err = uploader.validateImage(file)
  if (err) { loadError.value = err; return }

  const result = await uploader.upload(file, 'covers/')
  if (result) {
    music.value.songs[index].cover = result.url
    successMsg.value = '封面上传成功'
    setTimeout(() => successMsg.value = '', 2500)
  } else {
    loadError.value = uploader.error.value
  }
  event.target.value = ''
}
</script>

<template>
  <div class="settings-page">
    <h2 class="page-title">站点设置</h2>

    <!-- Tabs -->
    <div class="set-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-btn glass-btn"
        :class="{ 'tab-btn--active': activeTab === tab.id }"
        @click="activeTab = tab.id"
      >{{ tab.icon }} {{ tab.label }}</button>
    </div>

    <!-- 成功提示 -->
    <div v-if="successMsg" class="set-success">{{ successMsg }}</div>
    <!-- 错误提示 -->
    <div v-if="loadError" class="set-error">{{ loadError }} <button @click="loadError = ''">✕</button></div>

    <!-- ===== 站点信息 ===== -->
    <div v-if="activeTab === 'site'" class="tab-content">
      <div class="set-field">
        <label>站点标题</label>
        <input v-model="siteInfo.title" class="glass-input" />
      </div>
      <div class="set-field">
        <label>副标题</label>
        <input v-model="siteInfo.subtitle" class="glass-input" />
      </div>
      <div class="set-field">
        <label>描述</label>
        <textarea v-model="siteInfo.description" class="glass-input" rows="2"></textarea>
      </div>
      <div class="set-field">
        <label>签名</label>
        <input v-model="siteInfo.signature" class="glass-input" />
      </div>
      <div class="set-field">
        <label>头像 URL</label>
        <input v-model="siteInfo.avatar" class="glass-input" placeholder="https://..." />
      </div>
      <div class="set-field">
        <label>技术栈</label>
        <div class="tech-tags-editor">
          <span v-for="(tech, i) in siteInfo.tech_stack" :key="i" class="tech-tag glass-card">
            {{ tech }}
            <button class="tech-tag-remove" @click="siteInfo.tech_stack.splice(i, 1)">✕</button>
          </span>
          <input
            class="glass-input tech-tag-input"
            placeholder="输入技术名后回车添加"
            @keydown.enter.prevent="(e) => { const v = e.target.value.trim(); if (v) { siteInfo.tech_stack.push(v); e.target.value = '' } }"
          />
        </div>
      </div>
      <div class="set-field">
        <label>上线日期</label>
        <input v-model="siteInfo.launch_date" class="glass-input" type="datetime-local" />
      </div>
      <button class="glass-btn set-save-btn" @click="saveSite" :disabled="saving">
        {{ saving ? '保存中…' : '保存设置' }}
      </button>
    </div>

    <!-- ===== 社交链接 ===== -->
    <div v-if="activeTab === 'social'" class="tab-content">
      <div class="set-field-row">
        <input v-model="newSocial.key" class="glass-input" placeholder="平台名 (github/bilibili/email)" />
        <input v-model="newSocial.url" class="glass-input" placeholder="URL" />
        <button class="glass-btn" @click="addSocial">添加</button>
      </div>
      <div class="social-list">
        <div v-for="(item, i) in socialLinks" :key="i" class="social-item glass-card">
          <span class="social-item-key">{{ item.key }}</span>
          <input v-model="item.url" class="glass-input" />
          <button class="glass-btn social-remove" @click="removeSocial(i)">✕</button>
        </div>
      </div>
      <p v-if="!socialLinks.length" class="set-empty">还没有社交链接</p>
      <button class="glass-btn set-save-btn" @click="saveSocial" :disabled="saving">
        {{ saving ? '保存中…' : '保存设置' }}
      </button>
    </div>

    <!-- ===== GitHub ===== -->
    <div v-if="activeTab === 'github'" class="tab-content">
      <div class="set-field">
        <label>仓库列表</label>
        <div v-for="(repo, i) in githubConfig.repos" :key="i" class="repo-edit-item glass-card">
          <div class="song-item-row">
            <input v-model="repo.name" class="glass-input" placeholder="仓库名" style="flex:2" />
            <input v-model="repo.html_url" class="glass-input" placeholder="仓库链接" style="flex:3" />
            <button class="glass-btn social-remove" @click="removeGithubRepo(i)" title="删除">✕</button>
          </div>
          <div class="song-item-row">
            <input v-model="repo.description" class="glass-input" placeholder="描述" style="flex:3" />
            <input v-model.number="repo.stargazers_count" class="glass-input" type="number" min="0" placeholder="Stars" style="flex:1" />
          </div>
          <div class="song-item-row">
            <input v-model="repo.language" class="glass-input" placeholder="语言 (JavaScript/Vue/Python…)" style="flex:2" />
            <input v-model="repo.updated_at" class="glass-input" type="date" style="flex:2" />
          </div>
        </div>
        <button class="glass-btn add-text-btn" @click="addGithubRepo">+ 添加仓库</button>
      </div>
      <p v-if="!githubConfig.repos.length" class="set-empty">还没有添加任何仓库</p>
      <button class="glass-btn set-save-btn" @click="saveGithub" :disabled="saving">
        {{ saving ? '保存中…' : '保存设置' }}
      </button>
    </div>

    <!-- ===== 关于页面 ===== -->
    <div v-if="activeTab === 'about'" class="tab-content">
      <!-- 欢迎区 -->
      <div class="about-section-edit">
        <h4 class="about-section-title">01 · 欢迎区</h4>
        <div class="set-field">
          <label>标题</label>
          <input v-model="aboutPage.welcome.heading" class="glass-input" />
        </div>
        <div class="set-field">
          <label>段落内容</label>
          <div v-for="(p, i) in aboutPage.welcome.paragraphs" :key="i" class="set-field-row-small">
            <textarea v-model="aboutPage.welcome.paragraphs[i]" class="glass-input" rows="2" />
            <button class="glass-btn social-remove" @click="aboutPage.welcome.paragraphs.splice(i, 1)">✕</button>
          </div>
          <button class="glass-btn add-text-btn" @click="aboutPage.welcome.paragraphs.push('')">+ 添加段落</button>
        </div>
      </div>

      <!-- 网站技术 -->
      <div class="about-section-edit">
        <h4 class="about-section-title">02 · 网站技术搭建</h4>
        <div class="set-field">
          <label>标题</label>
          <input v-model="aboutPage.siteTech.heading" class="glass-input" />
        </div>
        <div class="set-field">
          <label>介绍文字</label>
          <textarea v-model="aboutPage.siteTech.intro" class="glass-input" rows="2" />
        </div>
        <div class="set-field">
          <label>技术规格</label>
          <div v-for="(spec, i) in aboutPage.siteTech.specs" :key="i" class="set-field-row-small">
            <input v-model="spec.label" class="glass-input" placeholder="标签" style="flex:1" />
            <input v-model="spec.value" class="glass-input" placeholder="值" style="flex:2" />
            <button class="glass-btn social-remove" @click="aboutPage.siteTech.specs.splice(i, 1)">✕</button>
          </div>
          <button class="glass-btn add-text-btn" @click="aboutPage.siteTech.specs.push({ label: '', value: '' })">+ 添加规格</button>
        </div>
        <div class="set-field">
          <label>备注文字</label>
          <textarea v-model="aboutPage.siteTech.note" class="glass-input" rows="2" />
        </div>
      </div>

      <!-- 关于我 -->
      <div class="about-section-edit">
        <h4 class="about-section-title">03 · 关于我自己</h4>
        <div class="set-field">
          <label>标题</label>
          <input v-model="aboutPage.aboutMe.heading" class="glass-input" />
        </div>
        <div class="set-field">
          <label>段落内容（第一段会拼接站点描述）</label>
          <div v-for="(p, i) in aboutPage.aboutMe.paragraphs" :key="i" class="set-field-row-small">
            <textarea v-model="aboutPage.aboutMe.paragraphs[i]" class="glass-input" rows="2" />
            <button class="glass-btn social-remove" @click="aboutPage.aboutMe.paragraphs.splice(i, 1)">✕</button>
          </div>
          <button class="glass-btn add-text-btn" @click="aboutPage.aboutMe.paragraphs.push('')">+ 添加段落</button>
        </div>
      </div>

      <!-- 个人感悟 -->
      <div class="about-section-edit">
        <h4 class="about-section-title">04 · 个人感悟</h4>
        <div class="set-field">
          <label>标题</label>
          <input v-model="aboutPage.reflections.heading" class="glass-input" />
        </div>
        <div class="set-field">
          <label>段落内容</label>
          <div v-for="(p, i) in aboutPage.reflections.paragraphs" :key="i" class="set-field-row-small">
            <textarea v-model="aboutPage.reflections.paragraphs[i]" class="glass-input" rows="2" />
            <button class="glass-btn social-remove" @click="aboutPage.reflections.paragraphs.splice(i, 1)">✕</button>
          </div>
          <button class="glass-btn add-text-btn" @click="aboutPage.reflections.paragraphs.push('')">+ 添加段落</button>
        </div>
      </div>

      <!-- 技术栈 -->
      <div class="about-section-edit">
        <h4 class="about-section-title">05 · 个人技术栈</h4>
        <div class="set-field">
          <label>标题</label>
          <input v-model="aboutPage.techStack.heading" class="glass-input" />
        </div>
        <div class="set-field">
          <label>介绍文字</label>
          <input v-model="aboutPage.techStack.intro" class="glass-input" />
        </div>
        <div class="set-field">
          <label>技术项</label>
          <div v-for="(item, i) in aboutPage.techStack.items" :key="i" class="set-field-row-small">
            <input v-model="item.name" class="glass-input" placeholder="名称" style="flex:2" />
            <input v-model="item.desc" class="glass-input" placeholder="描述" style="flex:3" />
            <input v-model="item.color" class="glass-input" placeholder="颜色" style="flex:1; min-width:80px" type="color" />
            <button class="glass-btn social-remove" @click="aboutPage.techStack.items.splice(i, 1)">✕</button>
          </div>
          <button class="glass-btn add-text-btn" @click="aboutPage.techStack.items.push({ name: '', desc: '', color: '#888888' })">+ 添加技术</button>
        </div>
      </div>

      <button class="glass-btn set-save-btn" @click="saveAbout" :disabled="saving">
        {{ saving ? '保存中…' : '保存关于页面' }}
      </button>
    </div>

    <!-- ===== 背景音乐 ===== -->
    <div v-if="activeTab === 'music'" class="tab-content">
      <div class="set-field-row">
        <div class="set-field" style="flex:1">
          <label>自动播放</label>
          <select v-model="music.autoplay" class="glass-input">
            <option :value="true">是</option>
            <option :value="false">否</option>
          </select>
        </div>
        <div class="set-field" style="flex:1">
          <label>音量 (0-1)</label>
          <input v-model.number="music.volume" class="glass-input" type="number" step="0.1" min="0" max="1" />
        </div>
        <div class="set-field" style="flex:1">
          <label>随机播放</label>
          <select v-model="music.shuffle" class="glass-input">
            <option :value="true">是</option>
            <option :value="false">否</option>
          </select>
        </div>
      </div>
      <div class="set-field">
        <label>歌曲列表</label>
        <div v-for="(song, i) in music.songs" :key="i" class="song-item glass-card">
          <div class="song-item-row">
            <input v-model="song.title" class="glass-input" placeholder="标题" style="flex:2" />
            <input v-model="song.artist" class="glass-input" placeholder="艺术家" style="flex:2" />
            <input v-model="song.cover" class="glass-input" placeholder="封面URL(选填)" style="flex:1" />
            <label
              class="glass-btn upload-btn"
              :class="{ disabled: getCoverUploader(i).uploading.value }"
              title="上传封面"
            >
              {{ getCoverUploader(i).uploading.value ? '⏳' : '🖼' }}
              <input
                type="file"
                accept="image/*"
                style="display:none"
                :disabled="getCoverUploader(i).uploading.value"
                @change="handleCoverUpload($event, i)"
              />
            </label>
          </div>
          <!-- 封面上传进度 -->
          <div v-if="getCoverUploader(i).uploading.value" class="upload-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: getCoverUploader(i).progress.value + '%' }"></div>
            </div>
            <span class="progress-text">{{ getCoverUploader(i).progress.value }}%</span>
          </div>
          <div class="song-item-row">
            <input v-model="song.url" class="glass-input" placeholder="音频 URL 或点击上传" />
            <label
              class="glass-btn upload-btn"
              :class="{ disabled: getAudioUploader(i).uploading.value }"
              title="上传音频"
            >
              {{ getAudioUploader(i).uploading.value ? '⏳' : '🎵' }}
              <input
                type="file"
                accept="audio/wav,audio/mp3,audio/mpeg,audio/ogg,audio/flac"
                style="display:none"
                :disabled="getAudioUploader(i).uploading.value"
                @change="handleAudioUpload($event, i)"
              />
            </label>
            <button class="glass-btn social-remove" @click="removeSong(i)" title="删除歌曲">✕</button>
          </div>
          <!-- 音频上传进度 -->
          <div v-if="getAudioUploader(i).uploading.value" class="upload-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: getAudioUploader(i).progress.value + '%' }"></div>
            </div>
            <span class="progress-text">{{ getAudioUploader(i).progress.value }}%</span>
          </div>
        </div>
        <button class="glass-btn add-text-btn" @click="addSong">
          + 添加歌曲
        </button>
      </div>
      <button class="glass-btn set-save-btn" @click="saveMusic" :disabled="saving">
        {{ saving ? '保存中…' : '保存设置' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  max-width: 720px;
}

.page-title {
  font-size: 22px;
  margin-bottom: 20px;
}
.page-title::after { display: none; }

/* Tabs */
.set-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.tab-btn {
  font-size: 13px;
  padding: 8px 16px;
}

.tab-btn--active {
  color: var(--color-primary);
  border-color: var(--color-primary);
  background: rgba(139, 69, 19, 0.08);
}

/* 成功提示 */
.set-success {
  padding: 10px 16px;
  background: rgba(123, 168, 114, 0.1);
  border: 1px solid rgba(123, 168, 114, 0.3);
  color: var(--color-accent-galgame);
  border-radius: var(--radius-md);
  font-size: 14px;
  margin-bottom: 16px;
}

/* 错误提示 */
.set-error {
  padding: 10px 16px;
  background: rgba(232, 91, 91, 0.1);
  border: 1px solid rgba(232, 91, 91, 0.3);
  color: var(--color-accent-anime);
  border-radius: var(--radius-md);
  font-size: 14px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.set-error button {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 16px;
  padding: 0 4px;
}

/* Tab 内容 */
.tab-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.set-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.set-field label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.set-field textarea {
  resize: vertical;
  font-family: var(--font-sans);
}

.set-field-row {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.set-field-row .glass-btn {
  white-space: nowrap;
  flex-shrink: 0;
}

.set-field-row-small {
  display: flex;
  gap: 6px;
  margin-bottom: 6px;
}

.set-field-row-small .glass-btn {
  flex-shrink: 0;
}

/* 社交列表 */
.social-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.social-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
}

.social-item-key {
  font-weight: 600;
  font-size: 14px;
  min-width: 80px;
}

.social-item .glass-input {
  flex: 1;
}

.social-remove {
  width: 44px;
  height: 44px;
  padding: 0;
  flex-shrink: 0;
  font-size: 16px;
  color: var(--color-accent-anime);
}

.set-empty {
  font-size: 14px;
  color: var(--color-text-muted);
  text-align: center;
  padding: 24px;
}

/* 仓库编辑 */
.repo-edit-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  margin-bottom: 8px;
}

/* 歌曲 */
.song-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  margin-bottom: 8px;
}

.song-item-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.song-item-row .glass-input {
  flex: 1;
  min-width: 0;
}

.upload-btn {
  width: 44px;
  height: 44px;
  padding: 0;
  flex-shrink: 0;
  font-size: 16px;
}

.upload-btn.disabled,
.upload-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

/* 上传进度 */
.upload-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 4px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--glass-border);
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-accent-galgame);
  border-radius: 999px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: var(--color-text-muted);
  min-width: 36px;
  text-align: right;
}

.add-text-btn {
  font-size: 13px;
  padding: 6px 16px;
  margin-top: 4px;
}

.set-save-btn {
  margin-top: 8px;
  padding: 10px 24px;
  align-self: flex-start;
  font-size: 14px;
}

/* 技术栈编辑器 */
.tech-tags-editor {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.tech-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  font-size: 13px;
  font-family: var(--font-mono);
}

.tech-tag-remove {
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  background: none;
  color: var(--color-accent-anime);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  min-height: 28px;
}

.tech-tag-input {
  flex: 1;
  min-width: 180px;
  padding: 6px 12px;
  font-size: 13px;
}

.capitalize { text-transform: capitalize; }

/* 关于页面编辑 */
.about-section-edit {
  padding: 16px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
}
.about-section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--glass-border);
}

@media (max-width: 768px) {
  .set-field-row {
    flex-direction: column;
    align-items: stretch;
  }
  .social-item {
    flex-direction: column;
    align-items: stretch;
  }
  .song-item-row {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
