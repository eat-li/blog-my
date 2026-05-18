const { Config } = require('../models')

const SENSITIVE_KEYS = ['ai_config']

class ConfigService {
  async getPublic() {
    const configs = await Config.findAll()
    const result = {}
    configs.forEach(c => {
      if (!SENSITIVE_KEYS.includes(c.key)) {
        result[c.key] = c.value
      }
    })
    return result
  }

  async getByKey(key) {
    // 敏感配置不允许通过无鉴权接口读取，防止 API 密钥泄露
    if (SENSITIVE_KEYS.includes(key)) {
      throw Object.assign(new Error('该配置需要管理员权限'), { status: 403 })
    }
    const config = await Config.findOne({ where: { key } })
    if (!config) throw Object.assign(new Error('配置不存在'), { status: 404 })
    return { [config.key]: config.value }
  }

  async update(key, value) {
    const [config] = await Config.upsert({ key, value })
    return { [config.key]: config.value }
  }
}

module.exports = new ConfigService()
