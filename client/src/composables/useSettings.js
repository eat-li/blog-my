import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { configApi } from '../api'

export function useSettings() {
  const router = useRouter()
  const activeTab = ref('site')
  const saving = ref(false)
  const loadError = ref('')
  const successMsg = ref('')

  const siteInfo = ref({
    title: '', subtitle: '', description: '', avatar: '', signature: '', launch_date: '',
    tech_stack: []
  })
  const socialLinks = ref([])
  const newSocial = ref({ key: '', url: '' })
  const githubConfig = ref({ repos: [] })
  const music = ref({ songs: [], autoplay: true, volume: 0.5, shuffle: false })

  // 关于页面默认内容
  const aboutPage = ref({
    welcome: {
      heading: '欢迎来到我的小站',
      paragraphs: [
        '欢迎来到 EatLi 的博客，一个记录技术成长与二次元生活的小角落。',
        '这里有前端开发的技术沉淀，也有动漫和 Galgame 的观后感，每一篇文章都是我用心写下的笔记。',
        '如果有什么想说的，欢迎去留言板留下足迹。',
      ]
    },
    siteTech: {
      heading: '网站技术搭建',
      intro: '本站采用前后端分离架构，前端基于 Vue 3 + Vite 构建，后端基于 Express 5 + Sequelize + MySQL，文件存储使用阿里云 OSS。',
      specs: [
        { label: '设计风格', value: '磨砂玻璃 Glassmorphism' },
        { label: '动画特效', value: '落樱飘落、翻页加载、像素吉祥物' },
        { label: '部署方式', value: '前后端分离，Vite 代理开发' },
        { label: '认证方案', value: 'JWT Bearer Token + 路由守卫' },
      ],
      note: '整体 UI 采用磨砂玻璃（Glassmorphism）设计系统，温暖复古配色，配合落樱飘落、翻页加载等交互细节，营造一个舒适复古的个人空间。'
    },
    aboutMe: {
      heading: '关于我自己',
      paragraphs: [
        '工作之余最大的爱好就是推 Galgame 和追番，尤其偏爱 Key 社的催泪作品和芳文社的日常番。',
        '技术方面，目前专注于 Vue 生态和 Node.js 后端开发，对 UI 设计和交互体验有较高的追求。',
      ]
    },
    reflections: {
      heading: '个人感悟',
      paragraphs: [
        '写博客是一件需要坚持的事情。每写完一篇文章，都感觉自己又沉淀了一些东西。',
        '一个好的故事能改变一个人看待世界的方式。Key 社的作品教会我「过程值得珍惜」；日常番则提醒我「平凡的日子也可以闪闪发光」。',
        '写代码也是如此 — 好的代码不只是功能的堆砌，更是对细节的尊重。',
      ]
    },
    techStack: {
      heading: '个人技术栈',
      intro: '以下是我目前主要使用的技术和工具，持续学习中。',
      items: [
        { name: 'Vue 3', desc: '前端框架，组合式 API + Vite 构建', color: '#41b883' },
        { name: 'Express 5', desc: '后端框架，三层分层架构', color: '#888888' },
        { name: 'MySQL', desc: '关系型数据库，Sequelize ORM', color: '#4479A1' },
        { name: '阿里云 OSS', desc: '对象存储，图片音频上传', color: '#FF6A00' },
        { name: 'Pinia', desc: '状态管理，Token 鉴权', color: '#f0b400' },
        { name: 'Axios', desc: 'HTTP 请求，拦截器封装', color: '#5A29E4' },
      ]
    }
  })

  const tabs = [
    { id: 'site', label: '站点信息', icon: '◎' },
    { id: 'social', label: '社交链接', icon: '⬡' },
    { id: 'github', label: 'GitHub', icon: '⬡' },
    { id: 'about', label: '关于页面', icon: '◎' },
    { id: 'music', label: '背景音乐', icon: '♬' },
  ]

  function showSuccess(msg) {
    successMsg.value = msg
    setTimeout(() => successMsg.value = '', 2500)
  }

  async function loadAll() {
    try {
      const config = await configApi.getPublic()
      if (config.site_info) {
        siteInfo.value = { ...siteInfo.value, ...config.site_info }
      }
      if (config.social_links) {
        socialLinks.value = Object.entries(config.social_links).map(([key, url]) => ({ key, url }))
      }
      if (config.github_config) {
        // 兼容旧格式 { username, repo_count } 和新格式 { repos: [...] }
        if (config.github_config.repos) {
          githubConfig.value = config.github_config
        } else {
          githubConfig.value = { repos: [] }
        }
      }
      if (config.music) music.value = config.music
      if (config.about_page) aboutPage.value = { ...aboutPage.value, ...config.about_page }
    } catch (e) {
      if (e.response?.status === 401) router.push('/admin/login')
      else loadError.value = '加载配置失败'
    }
  }

  // 站点信息
  async function saveSite() {
    saving.value = true
    try {
      await configApi.update('site_info', siteInfo.value)
      showSuccess('站点信息已保存')
    } catch (e) {
      loadError.value = e.response?.data?.message || '保存失败'
    } finally { saving.value = false }
  }

  // 社交链接
  function addSocial() {
    if (!newSocial.value.key || !newSocial.value.url) return
    socialLinks.value.push({ key: newSocial.value.key, url: newSocial.value.url })
    newSocial.value = { key: '', url: '' }
  }
  function removeSocial(index) { socialLinks.value.splice(index, 1) }
  async function saveSocial() {
    saving.value = true
    try {
      const obj = {}
      socialLinks.value.forEach(s => { if (s.key) obj[s.key] = s.url })
      await configApi.update('social_links', obj)
      showSuccess('社交链接已保存')
    } catch (e) {
      loadError.value = e.response?.data?.message || '保存失败'
    } finally { saving.value = false }
  }

  // GitHub
  function addGithubRepo() {
    githubConfig.value.repos.push({ name: '', description: '', html_url: '', stargazers_count: 0, language: '', updated_at: '' })
  }
  function removeGithubRepo(index) {
    githubConfig.value.repos.splice(index, 1)
  }
  async function saveGithub() {
    saving.value = true
    try {
      await configApi.update('github_config', githubConfig.value)
      showSuccess('GitHub 配置已保存')
    } catch (e) {
      loadError.value = e.response?.data?.message || '保存失败'
    } finally { saving.value = false }
  }

  // 音乐
  function addSong() {
    music.value.songs.push({ title: '', artist: '', url: '', cover: '' })
  }
  function removeSong(index) { music.value.songs.splice(index, 1) }
  async function saveMusic() {
    saving.value = true
    try {
      await configApi.update('music', music.value)
      showSuccess('音乐配置已保存')
    } catch (e) {
      loadError.value = e.response?.data?.message || '保存失败'
    } finally { saving.value = false }
  }

  // 关于页面
  async function saveAbout() {
    saving.value = true
    try {
      await configApi.update('about_page', aboutPage.value)
      showSuccess('关于页面已保存')
    } catch (e) {
      loadError.value = e.response?.data?.message || '保存失败'
    } finally { saving.value = false }
  }

  return {
    activeTab, saving, loadError, successMsg, tabs,
    siteInfo, socialLinks, newSocial, githubConfig, aboutPage, music,
    loadAll,
    saveSite, addSocial, removeSocial, saveSocial,
    saveGithub, addGithubRepo, removeGithubRepo,
    addSong, removeSong, saveMusic,
    saveAbout,
  }
}
