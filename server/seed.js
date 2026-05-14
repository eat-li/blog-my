require('dotenv').config()
const bcrypt = require('bcryptjs')
const { sequelize, User, Config, syncDatabase } = require('./models')

async function seed() {
  await syncDatabase()

  // 创建/更新管理员
  const adminUser = process.env.ADMIN_USER || 'admin'
  const adminPass = process.env.ADMIN_PASS || 'admin123'
  const adminNick = process.env.ADMIN_NICK || '博主'
  const hashedPwd = await bcrypt.hash(adminPass, 10)

  const existing = await User.findOne({ where: { username: adminUser } })
  if (existing) {
    await existing.update({ password: hashedPwd, nickname: adminNick })
    console.log(`管理员账号已更新 (${adminUser})`)
  } else {
    await User.create({ username: adminUser, password: hashedPwd, nickname: adminNick })
    console.log(`管理员账号已创建 (${adminUser})`)
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
      key: 'about_page',
      value: {
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
