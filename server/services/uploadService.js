const path = require('path')
const fs = require('fs')

class UploadService {
  // 懒初始化单例：首次调用时创建，后续复用同一个实例
  getOSSClient() {
    if (!this._ossClient) {
      const OSS = require('ali-oss')
      const { OSS_REGION, OSS_ACCESS_KEY_ID, OSS_ACCESS_KEY_SECRET, OSS_BUCKET } = process.env
      this._ossClient = new OSS({
        region: OSS_REGION,
        accessKeyId: OSS_ACCESS_KEY_ID,
        accessKeySecret: OSS_ACCESS_KEY_SECRET,
        bucket: OSS_BUCKET
      })
    }
    return this._ossClient
  }

  async getPresignedUrl(dir, filename) {
    const client = this.getOSSClient()
    const ext = path.extname(filename) || '.mp3'
    const key = `${dir}${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`

    const url = client.signatureUrl(key, {
      method: 'PUT',
      expires: 300
    })

    const baseUrl = process.env.OSS_BASE_URL
    return { putUrl: url, key, fileUrl: baseUrl ? `${baseUrl}/${key}` : '' }
  }

  async uploadImage(base64, filename) {
    const buffer = Buffer.from(base64, 'base64')
    const ext = path.extname(filename) || '.png'
    const key = `content/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`

    const client = this.getOSSClient()

    // 上传到 OSS，设置公共读
    const result = await client.put(key, buffer, {
      headers: { 'x-oss-object-acl': 'public-read' }
    })

    // 使用 OSS_BASE_URL 拼接完整 URL
    const baseUrl = process.env.OSS_BASE_URL
    const url = baseUrl ? `${baseUrl}/${key}` : result.url

    return { url, key }
  }

  async deleteImage(key) {
    const client = this.getOSSClient()
    await client.delete(key)
    return { deleted: true }
  }

  async uploadAudio(base64, filename) {
    const buffer = Buffer.from(base64, 'base64')
    const ext = path.extname(filename) || '.mp3'
    const key = `music/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`

    const client = this.getOSSClient()
    const result = await client.put(key, buffer, {
      headers: { 'x-oss-object-acl': 'public-read' }
    })

    const baseUrl = process.env.OSS_BASE_URL
    return { url: baseUrl ? `${baseUrl}/${key}` : result.url, key }
  }

  async uploadFile(buffer, filename, dir = 'content/') {
    const ext = path.extname(filename) || '.bin'
    const key = `${dir}${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`

    const client = this.getOSSClient()
    await client.put(key, buffer, {
      headers: { 'x-oss-object-acl': 'public-read' }
    })

    const baseUrl = process.env.OSS_BASE_URL
    return { url: baseUrl ? `${baseUrl}/${key}` : '', key }
  }

  async deleteAudio(key) {
    const client = this.getOSSClient()
    await client.delete(key)
    return { deleted: true }
  }
}

module.exports = new UploadService()
