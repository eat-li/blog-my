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
  const githubConfig = ref({ username: '', repo_count: 6 })
  const live2d = ref({
    model: 'shizuku', scale: 1.0, position: 'right',
    welcome: [], click: [], idle: [], night: [], pageSwitch: []
  })
  const music = ref({ songs: [], autoplay: true, volume: 0.5, shuffle: false })

  const tabs = [
    { id: 'site', label: '站点信息', icon: '◎' },
    { id: 'social', label: '社交链接', icon: '⬡' },
    { id: 'github', label: 'GitHub', icon: '⬡' },
    { id: 'live2d', label: '看板娘', icon: '◉' },
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
      if (config.github_config) githubConfig.value = config.github_config
      if (config.live2d) live2d.value = config.live2d
      if (config.music) music.value = config.music
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
  async function saveGithub() {
    saving.value = true
    try {
      await configApi.update('github_config', githubConfig.value)
      showSuccess('GitHub 配置已保存')
    } catch (e) {
      loadError.value = e.response?.data?.message || '保存失败'
    } finally { saving.value = false }
  }

  // Live2D
  async function saveLive2d() {
    saving.value = true
    try {
      await configApi.update('live2d', live2d.value)
      showSuccess('看板娘配置已保存')
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

  return {
    activeTab, saving, loadError, successMsg, tabs,
    siteInfo, socialLinks, newSocial, githubConfig, live2d, music,
    loadAll,
    saveSite, addSocial, removeSocial, saveSocial,
    saveGithub, saveLive2d,
    addSong, removeSong, saveMusic,
  }
}
