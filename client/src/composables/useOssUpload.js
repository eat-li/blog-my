import { ref } from 'vue'
import { uploadApi } from '../api'

export function useOssUpload() {
  const uploading = ref(false)
  const progress = ref(0)
  const error = ref('')

  const AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/wav', 'audio/wave', 'audio/x-wav', 'audio/flac', 'audio/x-m4a', 'audio/mp4']
  const AUDIO_EXTS = /\.(mp3|ogg|wav|flac|m4a|wma|aac)$/i
  const MAX_AUDIO_SIZE = 20 * 1024 * 1024

  function validateAudio(file) {
    if (!AUDIO_TYPES.includes(file.type) && !AUDIO_EXTS.test(file.name)) {
      return '仅支持 MP3 / OGG / WAV / FLAC / M4A 格式'
    }
    if (file.size > MAX_AUDIO_SIZE) {
      return '音频文件不能超过 20MB'
    }
    return null
  }

  function validateImage(file) {
    if (!file.type.startsWith('image/')) {
      return '请选择图片文件'
    }
    return null
  }

  async function upload(file, dir = 'content/') {
    const isAudio = AUDIO_TYPES.includes(file.type) || AUDIO_EXTS.test(file.name)
    const isImage = file.type.startsWith('image/')
    if (!isAudio && !isImage) {
      error.value = '不支持的文件类型'
      return null
    }

    uploading.value = true
    progress.value = 0
    error.value = ''

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('dir', isAudio ? 'music/' : dir)

      const { url } = await uploadApi.file(formData, (e) => {
        if (e.total) {
          progress.value = Math.round((e.loaded / e.total) * 100)
        }
      })

      return { url }
    } catch (e) {
      error.value = '上传失败: ' + (e.response?.data?.message || e.message)
      return null
    } finally {
      uploading.value = false
    }
  }

  function reset() {
    uploading.value = false
    progress.value = 0
    error.value = ''
  }

  return { uploading, progress, error, upload, validateAudio, validateImage, reset }
}
