const { Config } = require('../models')

class ConfigService {
  async getPublic() {
    const configs = await Config.findAll()
    const result = {}
    configs.forEach(c => { result[c.key] = c.value })
    return result
  }

  async getByKey(key) {
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
