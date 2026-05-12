const { Op, fn, col } = require('sequelize')
const { Post } = require('../models')

class StatsService {
  async getProfile() {
    const [articles, anime, galgame] = await Promise.all([
      Post.count({ where: { type: 'article', status: 'published' } }),
      Post.count({ where: { type: 'anime', status: 'published' } }),
      Post.count({ where: { type: 'galgame', status: 'published' } })
    ])

    const posts = await Post.findAll({
      where: { status: 'published' },
      attributes: ['content']
    })
    const totalChars = posts.reduce((sum, p) => sum + (p.content?.length || 0), 0)

    const viewsResult = await Post.findOne({
      where: { status: 'published' },
      attributes: [[fn('SUM', col('views')), 'totalViews']]
    })
    const totalViews = viewsResult?.get('totalViews') || 0

    return { articles, anime, galgame, totalChars, totalViews, totalPosts: articles + anime + galgame }
  }

  async getYearly(year) {
    year = year || new Date().getFullYear()
    const startDate = `${year}-01-01`
    const endDate = `${year}-12-31`

    const posts = await Post.findAll({
      where: {
        status: 'published',
        createdAt: { [Op.between]: [startDate, endDate] }
      },
      order: [['views', 'DESC']]
    })

    const monthly = {}
    for (let i = 1; i <= 12; i++) monthly[i] = 0
    posts.forEach(p => {
      const m = new Date(p.createdAt).getMonth() + 1
      monthly[m]++
    })

    const typeCount = { article: 0, anime: 0, galgame: 0 }
    posts.forEach(p => { typeCount[p.type]++ })

    const topPost = posts.length > 0 ? {
      title: posts[0].title,
      views: posts[0].views,
      type: posts[0].type
    } : null

    return { year: parseInt(year), totalPosts: posts.length, typeCount, monthly, topPost }
  }
}

module.exports = new StatsService()
