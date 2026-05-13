require('dotenv').config()
const bcrypt = require('bcryptjs')
const { sequelize, User, Config, syncDatabase } = require('./models')

async function seed() {
  await syncDatabase()

  // 创建管理员
  const adminPass = process.env.ADMIN_PASS || 'admin123'
  const [user, created] = await User.findOrCreate({
    where: { username: 'admin' },
    defaults: {
      username: 'admin',
      password: await bcrypt.hash(adminPass, 10),
      nickname: '博主'
    }
  })
  if (created) {
    console.log('管理员账号已创建')
  } else {
    console.log('管理员账号已存在')
  }

  // 默认配置
  const defaults = [
    {
      key: 'site_info',
      value: {
        title: 'MyBlog',
        subtitle: '记录生活与技术',
        description: '个人博客，分享技术、动漫、游戏感想',
        avatar: '',
        signature: '普通宅男 / 前端开发 / Galgame 玩家',
        launch_date: new Date().toISOString()
      }
    },
    {
      key: 'social_links',
      value: {
        github: 'https://github.com/your-username',
        bilibili: 'https://space.bilibili.com/your-uid',
        email: 'your-email@example.com'
      }
    },
    {
      key: 'github_config',
      value: {
        username: '',
        repo_count: 6
      }
    },
    {
      key: 'live2d',
      value: {
        model: 'shizuku',
        scale: 1.0,
        position: 'right',
        welcome: ['欢迎回来，主人~', '今天也要元气满满哦！'],
        click: ['嘿嘿，别摸我啦~', '痒~！'],
        idle: ['好无聊啊… 写点新文章吧', 'Zzz… 啊！我没有睡着！'],
        night: ['这么晚还不睡… 注意身体呀', '深夜写代码容易掉头发哦~'],
        pageSwitch: ['新的一页呢~', '对这篇感兴趣吗？']
      }
    },
    {
      key: 'music',
      value: {
        songs: [],
        autoplay: true,
        volume: 0.5,
        shuffle: false
      }
    }
  ]

  for (const config of defaults) {
    await Config.upsert(config)
  }
  console.log('默认配置已初始化')

  await sequelize.close()
  console.log('Seed 完成')
}

seed().catch(err => {
  console.error('Seed 失败:', err)
  process.exit(1)
})
