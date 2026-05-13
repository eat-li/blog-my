const { Diary } = require('../models')

class DiaryService {
  // 公开日记列表
  async getPublicList(query) {
    const page = parseInt(query.page) || 1
    const limit = parseInt(query.limit) || 10
    const offset = (page - 1) * limit
    const where = { is_public: true }

    if (query.mood) where.mood = query.mood

    const { count, rows } = await Diary.findAndCountAll({
      where,
      attributes: { exclude: ['user_id'] },
      order: [['createdAt', 'DESC']],
      limit,
      offset
    })

    return { list: rows, total: count, page, limit, totalPages: Math.ceil(count / limit) }
  }

  // 日记详情
  async getPublicById(id) {
    const diary = await Diary.findOne({
      where: { id, is_public: true },
      attributes: { exclude: ['user_id'] }
    })
    if (!diary) throw Object.assign(new Error('日记不存在'), { status: 404 })
    return diary
  }

  // 后台列表
  async getAdminList(query) {
    const page = parseInt(query.page) || 1
    const limit = parseInt(query.limit) || 15
    const offset = (page - 1) * limit

    const { count, rows } = await Diary.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit,
      offset
    })

    return { list: rows, total: count, page, limit, totalPages: Math.ceil(count / limit) }
  }

  // 创建日记
  async create(data) {
    if (!data.title || !data.title.trim()) {
      throw Object.assign(new Error('日记标题不能为空'), { status: 400 })
    }
    if (!data.content || !data.content.trim()) {
      throw Object.assign(new Error('日记内容不能为空'), { status: 400 })
    }

    return Diary.create({
      title: data.title.trim(),
      content: data.content.trim(),
      mood: data.mood || null,
      weather: data.weather || null,
      images: Array.isArray(data.images) ? data.images : [],
      is_public: data.is_public !== undefined ? data.is_public : true
    })
  }

  // 更新日记
  async update(id, data) {
    const diary = await Diary.findByPk(id)
    if (!diary) throw Object.assign(new Error('日记不存在'), { status: 404 })

    if (data.title !== undefined && !data.title.trim()) {
      throw Object.assign(new Error('日记标题不能为空'), { status: 400 })
    }

    await diary.update({
      title: data.title?.trim(),
      content: data.content?.trim(),
      mood: data.mood,
      weather: data.weather,
      images: data.images,
      is_public: data.is_public
    })
    return diary
  }

  // 删除日记
  async delete(id) {
    const diary = await Diary.findByPk(id)
    if (!diary) throw Object.assign(new Error('日记不存在'), { status: 404 })
    await diary.destroy()
  }
}

module.exports = new DiaryService()
