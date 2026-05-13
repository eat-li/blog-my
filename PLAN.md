# 个人博客网站搭建计划

## 一、技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Vue 3 (Composition API) |
| 包管理器 | pnpm |
| 构建工具 | Vite |
| 路由 | Vue Router 4 |
| 状态管理 | Pinia |
| HTTP 客户端 | Axios |
| 后端框架 | Express.js |
| ORM | Sequelize |
| 数据库 | MySQL |
| 认证 | JWT (jsonwebtoken) |
| 编辑器 | Tiptap (基于 ProseMirror 的富文本编辑器) |
| 图片存储 | 阿里云 OSS |
| 看板娘 | OhMyLive2D / live2d-widget |
| 样式 | CSS3 自定义 + 响应式设计（移动端优先）|

## 二、项目目录结构

```
blog_my/
├── client/                         # 前端项目
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── api/                    # API 接口封装
│   │   │   └── index.js
│   │   ├── assets/                 # 静态资源（图片、图标等）
│   │   ├── components/             # 公共组件
│   │   │   ├── AppHeader.vue       # 顶部导航
│   │   │   ├── AppFooter.vue       # 页脚
│   │   │   ├── PostCard.vue        # 内容卡片（统一展示文章/动漫/Galgame）
│   │   │   ├── PostList.vue        # 内容列表（分页）
│   │   │   ├── TagCloud.vue        # 标签云
│   │   │   ├── Sidebar.vue         # 侧边栏
│   │   │   ├── SocialLinks.vue     # 社交平台链接组件
│   │   │   ├── GitHubProjects.vue  # GitHub 项目展示
│   │   │   ├── GitHubCard.vue      # 单个 GitHub 项目卡片
│   │   │   ├── ProfileCard.vue     # 个人 Profile 卡
│   │   │   ├── Live2DWidget.vue    # Live2D 看板娘组件
│   │   │   ├── MusicPlayer.vue     # 背景音乐播放器
│   │   │   ├── TypeWriter.vue      # 打字机效果组件
│   │   │   ├── GuestMessage.vue    # 留言卡片组件
│   │   │   └── ImageUploader.vue   # 图片上传组件（OSS）
│   │   ├── views/                  # 页面视图
│   │   │   ├── Home.vue                # 首页（聚合内容 + 热力图 + GitHub）
│   │   │   ├── articles/
│   │   │   │   ├── ArticleList.vue     # 文章列表页
│   │   │   │   └── ArticleDetail.vue   # 文章详情
│   │   │   ├── anime/
│   │   │   │   ├── AnimeList.vue       # 动漫感想列表
│   │   │   │   └── AnimeDetail.vue     # 动漫感想详情
│   │   │   ├── galgame/
│   │   │   │   ├── GalgameList.vue     # Galgame 感想列表
│   │   │   │   └── GalgameDetail.vue   # Galgame 感想详情
│   │   │   ├── TagPosts.vue            # 按标签筛选内容
│   │   │   ├── Projects.vue            # GitHub 项目集合页
│   │   │   ├── YearlyReport.vue        # 年度报告 / 个人数据看板
│   │   │   ├── Guestbook.vue           # 留言板
│   │   │   └── About.vue               # 关于页（个人介绍+社交链接+热力图）
│   │   │   └── admin/
│   │   │       ├── Login.vue           # 管理员登录
│   │   │       ├── Dashboard.vue       # 管理后台首页
│   │   │       ├── PostManager.vue     # 内容管理列表
│   │   │       ├── PostEditor.vue      # Tiptap 编辑器（创建/编辑内容）
│   │   │       ├── MessagesAdmin.vue   # 留言管理（审核/删除）
│   │   │       └── Settings.vue        # 博客设置
│   │   ├── router/
│   │   │   └── index.js            # 路由配置
│   │   ├── stores/                 # Pinia 状态管理
│   │   │   ├── auth.js             # 认证状态
│   │   │   └── blog.js             # 博客数据状态
│   │   ├── utils/
│   │   │   ├── request.js          # Axios 封装
│   │   │   └── oss.js              # OSS 上传工具
│   │   ├── styles/
│   │   │   ├── main.css            # 全局样式
│   │   │   ├── variables.css       # CSS 变量（主题色等）
│   │   │   └── admin.css           # 管理后台样式
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                         # 后端项目
│   ├── config/
│   │   ├── db.config.js            # Sequelize 数据库配置
│   │   └── oss.config.js           # 阿里云 OSS 配置
│   ├── middleware/
│   │   ├── auth.js                 # JWT 认证中间件
│   │   └── errorHandler.js         # 全局错误处理
│   ├── models/                     # Sequelize 模型
│   │   ├── index.js                # Sequelize 实例化 & 模型关联
│   │   ├── post.model.js           # 统一内容模型（文章/动漫/Galgame）
│   │   ├── category.model.js       # 分类（仅文章使用）
│   │   ├── tag.model.js
│   │   ├── user.model.js
│   │   ├── message.model.js        # 留言模型
│   │   └── config.model.js         # 站点配置（社交链接、GitHub等）
│   ├── routes/                     # 路由模块
│   │   ├── posts.js                # 统一内容路由
│   │   ├── categories.js
│   │   ├── tags.js
│   │   ├── messages.js             # 留言板路由
│   │   ├── auth.js
│   │   ├── github.js               # GitHub API 代理路由
│   │   ├── config.js               # 站点配置路由
│   │   └── upload.js               # OSS 上传路由
│   ├── services/                   # 业务逻辑层
│   │   ├── authService.js
│   │   ├── postService.js
│   │   ├── categoryService.js
│   │   ├── tagService.js
│   │   ├── messageService.js
│   │   ├── githubService.js
│   │   ├── configService.js
│   │   ├── uploadService.js
│   │   └── statsService.js
│   ├── controllers/               # 请求处理层
│   │   ├── postController.js
│   │   ├── categoryController.js
│   │   ├── tagController.js
│   │   ├── messageController.js
│   │   ├── authController.js
│   │   ├── githubController.js
│   │   ├── configController.js
│   │   ├── uploadController.js
│   │   └── statsController.js
│   ├── app.js                      # Express 入口
│   ├── package.json
│   └── .env                        # 环境变量（数据库/OSS/JWT密钥）
│
├── package.json                    # 根目录脚本
└── PLAN.md                         # 本计划文件
```

## 三、数据库设计（Sequelize ORM）

### 模型关系

```
User 1 ──── * Post
Category 1 ──── * Post（仅 type=article 时使用）
Post * ──── * Tag（通过 PostTag 关联表）
```

### 模型字段

**User 模型** — `users` 表

| 字段 | Sequelize 类型 | 说明 |
|------|---------------|------|
| id | INTEGER PK AUTO | 用户ID |
| username | STRING(50) UNIQUE | 用户名 |
| password | STRING(255) | 密码（bcrypt 加密）|
| nickname | STRING(50) | 昵称 |
| avatar | STRING(255) | 头像 URL（OSS）|
| timestamps | createdAt/updatedAt | 自动管理 |

**Post 模型** — `posts` 表（统一内容模型）

| 字段 | Sequelize 类型 | 说明 |
|------|---------------|------|
| id | INTEGER PK AUTO | 内容ID |
| type | ENUM('article','anime','galgame') | 内容类型 |
| title | STRING(200) | 标题 |
| content | TEXT | 内容（Tiptap 输出的 HTML）|
| summary | STRING(500) | 摘要 |
| cover_image | STRING(255) | 封面图 URL（OSS）|
| category_id | INTEGER FK | 分类ID（仅 type=article 时使用）|
| rating | INTEGER | 评分（1-10，仅 anime/galgame）|
| metadata | JSON | 类型专属元数据（见下方说明）|
| status | ENUM('draft','published') | 发布状态 |
| views | INTEGER DEFAULT 0 | 浏览次数 |
| user_id | INTEGER FK | 作者ID |
| timestamps | createdAt/updatedAt | 自动管理 |

**metadata JSON 字段设计：**

- type=anime: `{ "anime_name": "作品名", "episodes": 12, "studio": "制作公司", "watch_date": "2025-01-01", "platform": "B站/Netflix" }`
- type=galgame: `{ "game_name": "游戏名", "developer": "开发商", "play_hours": 30, "play_date": "2025-01-01", "platform": "PC/Switch", "characters": ["角色名1", "角色名2"] }`
- type=article: `{}`（无需额外元数据）

**所有类型共用可选字段 — writing_note（创作手记）：**
每篇内容都可以附加一段创作手记，记录写作时的状态，存放在 metadata.writing_note 中：

```json
{
  "mood": "惬意",
  "bgm": "ヨルシカ - 春泥棒",
  "weather": "晴 · 22°C",
  "note": "写这篇的时候刚看完最后一集，片尾曲响起的时候差点哭了"
}
```

**Category 模型** — `categories` 表

| 字段 | Sequelize 类型 | 说明 |
|------|---------------|------|
| id | INTEGER PK AUTO | 分类ID |
| name | STRING(50) UNIQUE | 分类名称（如"技术","生活","随笔"）|
| description | TEXT | 分类描述 |
| icon | STRING(50) | 分类图标（可选）|
| timestamps | createdAt/updatedAt | 自动管理 |

**Tag 模型** — `tags` 表

| 字段 | Sequelize 类型 | 说明 |
|------|---------------|------|
| id | INTEGER PK AUTO | 标签ID |
| name | STRING(50) UNIQUE | 标签名称 |
| timestamps | createdAt/updatedAt | 自动管理 |

**PostTag 模型** — `post_tags` 表（多对多关联）

| 字段 | Sequelize 类型 | 说明 |
|------|---------------|------|
| post_id | INTEGER FK | 内容ID |
| tag_id | INTEGER FK | 标签ID |

### Sequelize 关联定义

```javascript
// models/index.js 中的关联
User.hasMany(Post, { foreignKey: 'user_id' });
Post.belongsTo(User, { foreignKey: 'user_id' });

Category.hasMany(Post, { foreignKey: 'category_id' });
Post.belongsTo(Category, { foreignKey: 'category_id' });

Post.belongsToMany(Tag, { through: 'post_tags', foreignKey: 'post_id' });
Tag.belongsToMany(Post, { through: 'post_tags', foreignKey: 'tag_id' });
```

**Message 模型** — `messages` 表（留言板）

| 字段 | Sequelize 类型 | 说明 |
|------|---------------|------|
| id | INTEGER PK AUTO | 留言ID |
| nickname | STRING(50) | 游客昵称 |
| email | STRING(100) | 邮箱（用于 Gravatar 头像，可选）|
| content | TEXT | 留言内容 |
| status | ENUM('pending','approved','rejected') | 审核状态 |
| ip | STRING(45) | 留言者 IP（防刷）|
| parent_id | INTEGER FK NULL | 回复目标留言ID（支持嵌套回复）|
| timestamps | createdAt/updatedAt | 自动管理 |

**模型关联：**

```
Message.belongsTo(Message, { as: 'parent', foreignKey: 'parent_id' });
Message.hasMany(Message, { as: 'replies', foreignKey: 'parent_id' });
```

**审核机制：** 留言默认状态为 `pending`，管理员可在后台审核通过后才公开显示，防止垃圾留言。

**Config 模型** — `configs` 表（站点配置）

| 字段 | Sequelize 类型 | 说明 |
|------|---------------|------|
| id | INTEGER PK AUTO | 配置ID |
| key | STRING(100) UNIQUE | 配置键名 |
| value | JSON | 配置值（灵活存储各类配置）|
| timestamps | createdAt/updatedAt | 自动管理 |

**Config 配置项设计：**

```json
// social_links — 社交平台链接
{
  "github": "https://github.com/eat-li",
  "bilibili": "https://space.bilibili.com/169483195?spm_id_from=333.1007.0.0",
  "email": "eatli625@163.com",
  "douyin":"https://www.douyin.com/user/MS4wLjABAAAAmEEu5TTCW6p5aKED7F_4ggj5fFjR37wQi5oLLAXUupM?from_tab_name=main"
}

// github_config — GitHub 配置
{
  "username": "eatli",
  "show_pinned": true,
  "repo_count": 6
}

// site_info — 站点信息
{
  "title": "我的博客",
  "subtitle": "记录生活与技术",
  "description": "个人博客，分享技术、动漫、游戏感想",
  "avatar": "https://oss-url/avatar.jpg",
  "signature": "普通宅男 / 前端开发 / Galgame 玩家",
  "launch_date": "2025-03-15T00:00:00+08:00"
}
```

## 四、API 接口设计

### 公开接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/posts | 获取内容列表（支持 ?type=article/anime/galgame 筛选 + 分页）|
| GET | /api/posts/:id | 获取内容详情 |
| GET | /api/posts/latest | 获取各类型最新内容（首页聚合用）|
| GET | /api/posts/:id | 获取内容详情（同时返回浏览量）|
| POST | /api/posts/:id/view | 增加内容浏览量（防刷机制）|
| GET | /api/posts/heatmap | 获取年度热力图数据（按日统计发布量）|
| GET | /api/stats/profile | 获取个人数据统计（文章/动漫/Galgame 数量、总字数、总浏览量）|
| GET | /api/stats/yearly | 获取年度报告数据（月度分布、最受欢迎内容、关键词等）|
| GET | /api/github/repos | 获取 GitHub 公开仓库列表（后端代理缓存）|
| GET | /api/github/user | 获取 GitHub 用户信息 |
| GET | /api/config/:key | 获取站点配置（如 social_links、live2d、site_info）|
| GET | /api/config/public | 获取所有公开配置 |
| GET | /api/categories | 获取分类列表 |
| GET | /api/tags | 获取标签列表 |
| GET | /api/posts?category_id=:id | 按分类获取文章 |
| GET | /api/posts?tag_id=:id | 按标签获取内容 |
| GET | /api/messages | 获取留言列表（已审核，分页）|
| POST | /api/messages | 提交留言（需填写昵称+内容）|

### 管理接口（需 JWT 认证）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/login | 管理员登录 |
| GET | /api/auth/me | 获取当前用户信息 |
| POST | /api/posts | 创建内容（含 type 指定类型）|
| PUT | /api/posts/:id | 更新内容 |
| DELETE | /api/posts/:id | 删除内容 |
| POST | /api/upload/image | 上传图片到 OSS |
| DELETE | /api/upload/image | 删除 OSS 图片 |
| POST | /api/categories | 创建分类 |
| PUT | /api/categories/:id | 更新分类 |
| DELETE | /api/categories/:id | 删除分类 |
| POST | /api/tags | 创建标签 |
| DELETE | /api/tags/:id | 删除标签 |
| GET | /api/admin/messages | 获取全部留言（含待审核，分页）|
| PUT | /api/admin/messages/:id | 审核留言（approve/reject）|
| DELETE | /api/admin/messages/:id | 删除留言 |
| PUT | /api/config/:key | 更新站点配置（social_links/github_config/site_info）|

## 五、前端路由设计

| 路径 | 组件 | 说明 |
|------|------|------|
| / | Home.vue | 首页（聚合展示最新文章/动漫/Galgame）|
| /articles | ArticleList.vue | 文章列表 |
| /articles/:id | ArticleDetail.vue | 文章详情 |
| /anime | AnimeList.vue | 动漫感想列表 |
| /anime/:id | AnimeDetail.vue | 动漫感想详情 |
| /galgame | GalgameList.vue | Galgame 感想列表 |
| /galgame/:id | GalgameDetail.vue | Galgame 感想详情 |
| /tags/:id | TagPosts.vue | 按标签筛选内容 |
| /guestbook | Guestbook.vue | 留言板 |
| /projects | Projects.vue | GitHub 项目集合页 |
| /yearly | YearlyReport.vue | 年度报告 / 个人数据看板 |
| /about | About.vue | 关于页（个人介绍+社交链接+热力图）|
| /admin/login | Login.vue | 管理员登录 |
| /admin | Dashboard.vue | 管理后台（需登录）|
| /admin/posts | PostManager.vue | 内容管理列表（可筛选类型）|
| /admin/posts/create | PostEditor.vue | 写新内容（选择类型后进入 Tiptap）|
| /admin/posts/edit/:id | PostEditor.vue | 编辑内容 |
| /admin/settings | Settings.vue | 博客设置（社交链接 / GitHub / 站点信息 / 主题色）|

## 六、阿里云 OSS 集成方案

### 上传流程

```
前端选择图片 → Axios 发送至后端 /api/upload/image
  → 后端使用 ali-oss SDK 生成签名 → 前端直传 OSS（客户端上传）
  → 或：后端接收文件流 → 上传 OSS → 返回 OSS URL
```

### 推荐方案：后端签名 + 前端直传

1. 前端请求后端获取 OSS 上传临时凭证（签名 URL）
2. 前端直接上传文件到阿里云 OSS
3. 上传成功后 OSS 返回文件 URL，前端保存该 URL
4. 创建/更新内容时将 OSS URL 存入数据库

### OSS 文件路径规划

```
blog-images/
  ├── covers/          # 封面图
  ├── content/         # 文章内容图片
  └── avatar/          # 用户头像
```

### 环境变量（.env）

```
OSS_REGION=oss-cn-cehngdu
OSS_ACCESS_KEY_ID=你的AccessKey
OSS_ACCESS_KEY_SECRET=你的Secret
OSS_BUCKET=你的Bucket名称
OSS_BASE_URL=https://你的Bucket.oss-cn-地域.aliyuncs.com
```

## 七、Tiptap 编辑器方案

### 功能特性

- 富文本编辑（标题、加粗、斜体、列表、引用等）
- 图片插入（调用 OSS 上传组件）
- 输出 HTML 格式存储
- 前端详情页直接渲染 HTML

### Tiptap 扩展计划

```
Tiptap 核心包:
  @tiptap/vue-3
  @tiptap/starter-kit       (基础功能：段落、标题、加粗、斜体、列表等)
  @tiptap/extension-image   (图片嵌入)
  @tiptap/extension-link    (超链接)
  @tiptap/extension-code-block-lowlight (代码高亮)
  @tiptap/extension-table   (表格，可选)
  @tiptap/extension-placeholder (占位提示)
```

### 自定义扩展

- **OSS 图片上传按钮**：点击后弹出上传对话框，上传成功后嵌入图片到编辑器
- **内容类型模板**：创建 anime/galgame 类型时，编辑器上方显示评分选择器和额外字段输入
- **创作手记面板**：编辑器下方可折叠的"高级选项"面板，提供心情、BGM、天气、备注等字段输入。这些字段存入 `metadata.writing_note` 中，在详情页渲染为创作手记块

## 八、UI/UX 特色设计

### 首页布局

**桌面端 (>1024px)** — 三栏布局（左侧主内容 + 右侧侧边栏）

```
┌──────────────────────────────────────────────────┐
│   [文章] [动漫] [Galgame] [项目] [关于]  导航栏    │
├──────────────────────────────────────────────────┤
│  英雄区：精选内容大图展示 + 最新发布高亮标注           │
├───────────────────────────────┬──────────────────┤
│  [文章图标] 最新文章           │ [热力图]          │
│  ┌──────────────────────┐    │  年度贡献热力图     │
│  │ 卡片1                │    │  ██ ████ ██ ██    │
│  │ 卡片2                │    │  ████████ ████    │
│  └──────────────────────┘    │  ██ ██ ████████   │
│                               │                   │
│  [动漫图标] 最新动漫           │ [GitHub 项目]      │
│  ┌──────────────────────┐    │  ┌─────────────┐   │
│  │ 卡片1                │    │  │ repo1 ★ 42 │   │
│  │ 卡片2                │    │  │ repo2 ★ 25 │   │
│  └──────────────────────┘    │  └─────────────┘   │
│                               │                   │
│  [游戏图标] 最新 Galgame      │ [标签云]           │
│  ┌──────────────────────┐    │  #Vue #Python      │
│  │ 卡片1   卡片2   卡片3  │    │  #动漫 #Galgame    │
│  └──────────────────────┘    │                   │
├───────────────────────────────┴──────────────────┤
│  [GitHub图标] [Bili图标] [微博图标] [掘金图标] 页脚 │
└──────────────────────────────────────────────────┘
```

**移动端 (<768px)** — 单列流式布局

```
┌────────────────────┐
│ ☰ 导航汉堡菜单       │
├────────────────────┤
│  精选内容轮播        │
├────────────────────┤
│ [文章图标] 最新      │
│ ┌────────────────┐  │
│ │ 卡片1          │  │
│ │ 卡片2          │  │
│ └────────────────┘  │
├────────────────────┤
│ [动漫图标] 最新      │
│ ┌────────────────┐  │
│ │ 卡片1          │  │
│ │ 卡片2          │  │
│ └────────────────┘  │
├────────────────────┤
│ [游戏图标] 最新      │
│ ┌────────────────┐  │
│ │ 卡片1          │  │
│ │ 卡片2          │  │
│ └────────────────┘  │
├────────────────────┤
│ [热力图] 年度贡献    │
│ ██ ████ ██ ██████   │
├────────────────────┤
│ [GitHub] 项目       │
│ ┌────────────────┐  │
│ │ repo1 ★ 42     │  │
│ │ repo2 ★ 25     │  │
│ └────────────────┘  │
├────────────────────┤
│ [标签图标] 标签      │
├────────────────────┤
│ 社交图标              │
│ [Git][Bili][微博]   │
└────────────────────┘
```

### 内容卡片设计

**卡片元素（通用）：** 封面图 + SVG 类型角标 + 标题 + 摘要 + 浏览量 + 发布时间

**各类型专属信息：**

- **文章卡片**：分类标签 + 浏览量 👁️
- **动漫卡片**：动漫名 + 评分(星级) + 制作公司 + 浏览量 👁️
- **Galgame 卡片**：游戏名 + 评分(星级) + 游玩时长 + 浏览量 👁️

**浏览量显示示例：**

```
┌──────────────────────────────┐
│                              │
│  [封面图]                     │
│                              │
│  标题文字                     │
│  这是一段摘要内容...           │
│                              │
│  🏷️ Vue.js    👁️ 1,234 次阅读 │  ← 浏览量显示在卡片底部
│               📅 2025-03-15 │
└──────────────────────────────┘
```

**浏览量统计机制：**

- 每次访问详情页时调用 `POST /api/posts/:id/view` 增加 1
- 同一 IP / Session 在 10 分钟内多次访问不重复计数（防刷）

每种卡片通过不同的边框色和 SVG 图标角标来区分类型：

**文章 SVG 图标**（暖橙色系）

```svg
<svg viewBox="0 0 24 24" fill="none" stroke="#E8895B" stroke-width="2">
  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
  <polyline points="14 2 14 8 20 8"/>
  <line x1="16" y1="13" x2="8" y2="13"/>
  <line x1="16" y1="17" x2="8" y2="17"/>
  <polyline points="10 9 9 9 8 9"/>
</svg>
```

**动漫 SVG 图标**（珊瑚红系）

```svg
<svg viewBox="0 0 24 24" fill="none" stroke="#E85B5B" stroke-width="2">
  <rect x="2" y="4" width="20" height="16" rx="2"/>
  <polygon points="10 8 16 12 10 16" fill="#E85B5B"/>
</svg>
```

**Galgame SVG 图标**（抹茶绿系）

```svg
<svg viewBox="0 0 24 24" fill="none" stroke="#7BA872" stroke-width="2">
  <rect x="2" y="6" width="20" height="12" rx="2"/>
  <circle cx="12" cy="12" r="2" fill="#7BA872"/>
  <circle cx="8" cy="12" r="1.5" fill="#7BA872"/>
  <circle cx="16" cy="12" r="1.5" fill="#7BA872"/>
</svg>
```

> **配色原则：** 整体采用温暖、复古、有质感的低饱和度配色，不使用蓝/紫色系的 AI 风格色调。主色调二选一：复古红棕 `#8B4513` 或 抹茶绿 `#7BA872`，背景为米白 `#F5F0E8`，文字为深炭 `#2C2C2C`。三种内容类型各自拥有专属点缀色：文章=暖橙 `#E8895B`、动漫=珊瑚红 `#E85B5B`、Galgame=抹茶绿 `#7BA872`。整体气质像一本有年头的旧书，温暖而克制。

### 磨砂玻璃设计系统（Frosted Glass Design System）

本博客采用 **editorial + soft organic** 设计方向，以磨砂玻璃（Glassmorphism）为视觉核心语言。

#### 设计理念

整体像一本有年头的旧书，但每页覆上了一层温润的磨砂玻璃——既保留了纸质年代的温暖触感，又拥有现代 UI 的精致通透。主要特征：

- **材质感**：`backdrop-filter: blur(16px)` 的半透明背景模拟毛玻璃物理质感
- **层次感**：通过多层半透明叠加 + 动态光晕背景创造视觉深度
- **呼吸感**：柔和阴影 + 微妙动画让界面如同活物般有呼吸韵律
- **质感 hover**：卡片悬浮时 `translateY(-6px)` + 阴影放大 + 边缘发光 + 顶栏强调色动画展开

#### CSS 变量体系

```css
/* 玻璃态核心变量 */
--glass-bg: rgba(255, 250, 240, 0.45);          /* 玻璃基底 */
--glass-bg-hover: rgba(255, 250, 240, 0.70);     /* 悬浮态 */
--glass-border: rgba(255, 255, 255, 0.55);        /* 玻璃边框 */
--glass-border-hover: rgba(255, 255, 255, 0.80);  /* 悬浮边框 */
--glass-shadow: 0 8px 32px rgba(139, 69, 19, 0.08);   /* 玻璃投影 */
--glass-shadow-hover: 0 16px 48px rgba(139, 69, 19, 0.14); /* 悬浮投影 */
--glass-blur: blur(16px);                         /* 毛玻璃模糊度 */
--glass-blur-strong: blur(24px);                  /* 强模糊（导航栏用） */
```

#### 设计系统规范

| 维度 | 规范 |
|------|------|
| **字体** | 标题：Noto Serif SC（有衬线，旧书感）；正文：Noto Sans SC（无衬线，阅读舒适）；代码：JetBrains Mono |
| **排版缩放** | 1.25 比例缩放递进（14px → 17px → 20px → 24px → 32px） |
| **圆角体系** | 按钮：9999px（胶囊）；卡片：12-20px；输入框：12px |
| **间距体系** | 基准 8px → 三级间距：24px → 40px → 64px |
| **颜色体系** | 主色 #8B4513（复古红棕），辅以暖橙 #E8895B、珊瑚红 #E85B5B、抹茶绿 #7BA872 三色区分内容类型 |
| **背景设计** | 动态渐变（三色径向光晕 20s 循环偏移）+ SVG 噪点纹理叠加（opacity 0.35）|
| **阴影体系** | sm: 0 2px 8px / md: 0 4px 20px / lg: 0 8px 40px（色相偏暖）|
| **过渡曲线** | 基础：0.35s cubic-bezier(0.4, 0, 0.2, 1)；弹出：0.5s cubic-bezier(0.34, 1.56, 0.64, 1) |
| **页面过渡** | fade-slide 动效（opacity + translateY 12px），300ms duration，out-in 模式 |

#### 磨砂玻璃组件库

| 组件 | 类名 | 描述 |
|------|------|------|
| 玻璃卡片 | `.glass-card` | 半透明背景 + blur + 悬浮上浮动效 |
| 玻璃按钮 | `.glass-btn` | 胶囊形毛玻璃按钮，hover 放大 + 上浮 |
| 玻璃输入框 | `.glass-input` | 带聚焦光晕的毛玻璃输入框 |
| 类型角标 | `.type-badge.article/anime/galgame` | 各类型专属色半透明标签 |
| 标签标记 | `.tag-badge` | 圆形角标，hover 时边界高亮 |

#### 动画关键帧

```css
/* 背景渐变缓慢漂移 */
@keyframes bgShift {
  0% { background-position: 0% 0%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 50% 100%; }
}

/* 骨架屏闪烁 */
@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

#### 动态光晕背景层（App.vue）

页面背景由三层构成：

1. **最底层**：三色径向渐变（暖橙 12% / 抹茶绿 8% / 珊瑚红 6%），沿不同方向散射
2. **中间层**：JS 驱动的三个浮动光晕（`requestAnimationFrame`），缓慢漂移模拟呼吸感
3. **最上层**：SVG `feTurbulence` 噪点纹理（opacity 0.35），增加纸张物理质感

#### 反模式（避免）

- 千篇一律的 SaaS 风格英雄区
- 无层次感的均匀卡片堆叠
- 无系统的随机强调色
- 只为了动效而动效的微交互

### 年度贡献热力图

类似 GitHub 贡献日历的热力图组件，展示博客写作活跃度。

**数据来源：**

- 后台按日期统计已发布文章数量（`posts` 表 `created_at` 按日 GROUP BY）
- 一年内的数据，从当天往前推 365 天

**热力图设计：**

```
  周一  ┌──────────────────────────┐
  周二  │  ██  ████  ██    ██████  │  ← 每个小方格 = 1 天
  周三  │  ████████  ██████  ██    │    颜色越深 = 发布越多
  周四  │  ██  ██    ████████  ██  │
  周五  │  ████  ██  ██    ████████│
  周六  │  ██  ████████  ██    ██  │
  周日  │    ██  ██    ██████      │
        └──────────────────────────┘
          1月  2月  3月  4月  5月 ...
```

**配色：** 使用暖色阶（米白 → 浅橙 → 暖橙 → 深橙），与博客主题色一致。

**位置：** 首页侧边栏 / 关于页面底部

### GitHub 项目展示

通过 GitHub API 获取公开仓库数据，在前端展示。

**实现方式：**

1. 后端代理请求 `GET https://api.github.com/users/{username}/repos`（解决跨域 + 可缓存）
2. 后端可配置缓存策略（如 1 小时过期），避免触发 GitHub API 限流
3. 前端 GitHubProjects.vue 请求后端获取数据并渲染

**GitHub 项目卡片设计：**

```
┌──────────────────────────────────┐
│  ⭐ repo-name             🌟 42  │  ← 仓库名 + star 数
│  这是一个项目的简短描述文字          │
│  ─────────────────────────────── │
│  🟢 JavaScript    🔄 2025-01-01  │  ← 语言 + 最后更新
└──────────────────────────────────┘
```

**筛选逻辑：**

- 默认展示 pinned 仓库（如 GitHub API 支持），或 fork= false 的仓库
- 按 star 数降序排列，取前 N 个（N 可在后台配置）
- 可在 /projects 页面展示全部，首页只展示精选

### 社交平台链接展示

在页脚和关于页面展示个人社交平台链接。

**支持平台：**

- GitHub — 使用 GitHub SVG 图标
- Bilibili — 使用 Bilibili SVG 图标
- 微博 — 使用微博 SVG 图标
- 掘金 — 使用掘金 SVG 图标
- Twitter/X — 使用 X SVG 图标
- Email — 使用邮件 SVG 图标

**设计：**

```
页脚区域：
  [GitHub图标] [Bilibili图标] [微博图标] [掘金图标] [Twitter图标] [邮箱图标]

关于页面社交区：
  ┌──────────────────────────────┐
  │  通过以下平台找到我：           │
  │                               │
  │  [GitHub]  [Bilibili]  [微博]  │  ← 带平台名称的按钮式链接
  │  [掘金]    [Twitter]   [邮箱]   │
  └──────────────────────────────┘
```

**配置方式：**

- 社交链接存储在 `configs` 表的 `social_links` 配置项中
- 在管理后台 Settings.vue 中可增删改
- 未配置的平台不显示对应的图标

### 个人 Profile 卡

首页顶部设计一个带有个人风格的展示区，替代普通的博客标题横幅。

**签名打字机效果：** 个人签名使用 TypeWriter.vue 组件，通过逐字打印的方式展现，带闪烁光标，营造 Galgame 标题画面的氛围。

```
 > 「 普通宅男 / 前端开发 / Galgame 玩家 」█
   ↑ 逐字打出，█ 为闪烁光标
```

**桌面端设计：**

```
┌──────────────────────────────────────────────────┐
│                                                    │
│   [像素风/Galgame 风虚拟头像]                       │
│                                                    │
│   用户名                                           │
│   ─────────────────────                            │
│   > 普通宅男 / 前端开发 / Galgame 玩家 █            │  ← 打字机效果
│                                                    │
│    📝 24 篇文章      📺 18 部番                    │
│    🎮 12 部 Galgame   ⭐ 58,000 字                │
│    👁️ 内容被阅读 4,521 次                          │  ← 总浏览量
│                                                    │
│   [GitHub] [Bilibili] [微博] [掘金]                │
└──────────────────────────────────────────────────┘
```

**移动端精简版：**

```
┌────────────────────────┐
│  [头像]  用户名         │
│          > 普通宅男… █  │
│  📝24  📺18  🎮12      │
└────────────────────────┘
```

**数据来源：** 后端 `/api/stats/profile` 接口聚合计算，动态展示。

**TypeWriter.vue 组件设计：**

| 功能 | 说明 |
|------|------|
| Props | text（显示文本）、speed（打字速度）、loop（是否循环）|
| 光标 | 闪烁块状光标 `█`，支持 CSS 动画 |
| 触发时机 | 页面加载完成后自动开始打字 |
| 循环模式 | 全部打完后停留 3 秒，逐字删除，重新开始 |
| 音效 | 可选打字机音效（轻量 click 声，用户交互后触发）|

### 详情页设计

- 每种类型有自己的详情页布局模板
- 文章详情：标准博客样式，右侧目录
- 动漫详情：作品信息卡（作品名、话数、制作公司、评分）+ 感想正文
- Galgame 详情：游戏信息卡（游戏名、开发商、时长、评分）+ 角色介绍 + 感想正文

#### 创作手记块（所有类型详情页通用）

在每篇内容正文的下方或侧边，显示创作手记，像 Galgame 的存档界面一样记录写作时的状态：

```
┌─ 创作手记 ─────────────────────────────────┐
│                                              │
│  心情：😌 惬意                               │
│  听歌：ヨルシカ - 春泥棒                      │
│  天气：☀️ 晴 · 22°C                         │
│  耗时：约 2 小时                             │
│                                              │
│  「写这篇的时候刚看完最后一集，                │
│   片尾曲响起的时候差点哭了」                  │
│                                              │
│                 发表于 2025-03-15 21:34      │
└──────────────────────────────────────────────┘
```

**实现方式：** 创作手记数据存放在 `posts.metadata.writing_note` 中。编辑器的"高级选项"里提供填写入口，Tiptap 下方可展开折叠面板填写这些字段。未填写时不显示该区块。

### 年度报告 / 个人数据看板

独立页面 `/yearly`，展示博客的年度数据回顾，像游戏通关后的统计画面：

```
┌──────────────────────────────────────────────┐
│  📊 2025 博客年度报告                         │
├──────────────────────────────────────────────┤
│                                              │
│   今年写了 12 篇文章 · 共 3 万字             │
│   看了 15 部番   · 打了 8 部 Galgame        │
│                                              │
│   📈 月度发布趋势                              │
│   ██                                          │
│   ██████    ██                                │
│   ████████████████  ████    ██               │
│   1月 2月 3月 4月 5月 6月 7月 8月 9月...      │
│                                              │
│   🏆 年度之最                                  │
│   最受欢迎文章：《XXX》— 1,234 次阅读         │
│   评分最高动漫：CLANNAD ~ 9.5/10              │
│   评分最高 Galgame：Muv-Luv ~ 9.8/10         │
│   最长单篇：5,200 字                           │
│                                              │
│   [年度热力图全貌]                             │
│                                              │
│   🏷️ 年度关键词                               │
│   #Vue #Key #泣きゲー #日常系 #OST            │
│                                              │
└──────────────────────────────────────────────┘
```

**数据来源：** 后端 `/api/stats/yearly` 接口，聚合 posts 表全年数据，按类型、月份、阅读量等维度统计。

### 全局动漫风格特效

#### 落樱动画（SakuraPetals）

页面全局背景持续飘落樱花花瓣，纯 CSS 实现无性能负担：

- 25 个花瓣随机分布在屏幕宽度上
- 每个花瓣：随机大小（14-28px）、随机飘落速度（8-18s）、随机摇摆幅度、部分模糊增加景深
- 使用 5 种不同的花瓣字符（🌸 ✿ ❀ ✾ ❁）
- 两套不同的摇摆动画交错搭配（奇数/偶数各不同）
- `z-index: 9998` 在页面内容之上加载动画之下

#### 翻页加载动画（PageFlipLoader）

路由切换时显示仿书籍翻页效果：

- **折叠阶段**：右下角纸角卷起动画（border 三角模拟），同时中心显示旋转星芒 ✦ + 日文加载文字（"ページをめくる…"）+ 进度条
- **展开阶段**：纸角展开 + 加载元素上滑淡出
- 触发方式：通过 composable `usePageTransition` 监听路由变化自动触发
- 背景使用纸张纹理噪点 + 米白底色

#### 像素吉祥物（PixelMascot）

右下角常驻一只 CSS 像素猫：

- 主体使用纯 CSS 绘制（三角形耳朵 + 圆形脸 + 眨眼睛动画 + 摇晃尾巴）
- 点击 / 定时触发对话气泡（日语问候随机出现，如"にゃん～""見てくれてありがとう"）
- 爪子 `ฅ` 左右交替摆动
- 身体持续轻微弹跳 + 周围漂浮粒子（✦ ♥ .）
- 移动端自动隐藏

#### 动漫名言滚动条（NewsTicker）

首页顶部展示动漫经典台词自动轮播：

- 每 5 秒切换一条名言
- 显示格式：日文原文 + 中文翻译 + 出处
- 上下滑入切换动画
- 背景放射状三色渐变光晕
- 收录 CLANNAD、Steins;Gate、天気の子、エヴァ 等经典台词

#### Sparkle 星芒鼠标光标

全局自定义光标替换为星芒 ✦ 形状：

- 普通状态：棕色半透明星芒
- 可点击元素（a、button、卡片等）：暖橙色发光星芒 + 外圈光晕
- 使用 SVG data URI 实现，无额外网络请求
- 参考点设置于光标中心

### 全局小彩蛋

在博客各处藏入个人风格的小细节：

| 彩蛋 | 说明 |
|------|------|
| **加载动画** | 像素风小人/猫咪奔跑动画，或 Galgame 风格的"Loading..."文字带闪烁光标 |
| **404 页面** | "这条路线没有剧情分支… 回标题画面吧" + 复古 RPG 风格按钮，点击返回首页 |
| **文章分隔线** | 普通 `<hr>` 替换为 `━─━─━─ セーブ ─━─━─━`（Galgame 存档点风格），或随机显示不同的分隔符号 |
| **页脚签名** | 每页底部手写风格签名，附带"本站第 X 篇内容已加载完成"的计数显示 |
| **卡片悬浮态** | 文章列表卡片 hover 时像游戏选择框一样发光高亮，带有轻微的边框脉冲动画 |
| **空状态趣味提示** | 暂无内容时不显示冷冰冰的"暂无数据"，而显示"这个区域还没有剧情触发… 等待主人公到来 ✨" |

### Live2D 看板娘

在博客右下角常驻一个 Live2D 看板娘，能与访客进行简单互动，增强个人特色和趣味性。

**技术选型：OhMyLive2D**

- 支持 Live2D Cubism 2/3/4 模型
- 内置多种互动行为（触摸响应、闲置动画、自动说话）
- TypeScript 支持，Vue 3 友好
- 轻量，按需加载

**看板娘互动设计：**

```
                ┌─────────────────────┐
                │  欢迎回来，主人~      │
                │  今天要看点什么？     │
                └─────────────────────┘
                        ↑ 对话框
                        
                   ◢◣   ← Live2D 角色
                  ( ・ω・)
                  ／│＼
                   │
                  ╱ ╲
                       ← 固定在右下角
```

**互动行为：**

| 操作 | 反馈 |
|------|------|
| 鼠标点击角色 | 随机触发表情/动作切换，同时显示对话气泡 |
| 点击身体不同部位 | 不同反应（摸头→开心、摸脸→害羞等）|
| 鼠标悬浮 | 视线跟随鼠标移动 |
| 闲置超过 10 秒 | 随机触发闲置动作（伸懒腰、打哈欠等）|
| 切换页面 | 问候语变化（"新的一页呢~"）|
| 深夜访问 (0:00-6:00) | "这么晚还不睡吗…" 特殊对话 |

**对话内容配置：**
对话文本存放在 `configs` 表的 `live2d` 配置项中，可在管理后台编辑：

```json
{
  "model": "shizuku",           // 使用的模型名称
  "scale": 1.0,                 // 显示缩放
  "position": "right",          // 显示位置
  "welcome": [                  // 欢迎语列表
    "欢迎回来，主人~",
    "今天也要元气满满哦！",
    "有新内容更新了吗？"
  ],
  "click": [                    // 点击时对话
    "嘿嘿，别摸我啦~",
    "痒~！",
    "有什么需要帮忙的吗？"
  ],
  "idle": [                     // 闲置时对话
    "好无聊啊… 写点新文章吧",
    "最近在推什么 Galgame 呢？",
    "Zzz… 啊！我没有睡着！"
  ],
  "night": [                    // 深夜对话
    "这么晚还不睡… 注意身体呀",
    "深夜写代码容易掉头发哦~",
    "晚安… 再玩一会儿就去睡吧"
  ],
  "pageSwitch": [               // 切换页面时
    "新的一页呢~",
    "对这篇感兴趣吗？"
  ]
}
```

**模型选择：**

- 使用免费可商用的 Live2D 模型（如 Shizuku、Hiyori、Mao 等社区开源模型）
- 默认内置 1-2 个模型，可在后台切换
- 支持自定义上传模型文件（< 5MB）

**显示控制：**

- 桌面端：正常显示，固定在右下角，可拖拽移动
- 平板端：缩小比例显示
- 移动端：默认隐藏，底部提供浮动按钮点击后展开（避免遮挡内容）
- 所有页面均显示，管理后台页面自动隐藏

### 背景音乐播放器

进入网站时自动播放背景音乐，在页面角落提供迷你音乐播放控件，增强浏览氛围。

**实现方式：**

- 使用原生 HTML5 `<audio>` 封装为 Vue 组件 MusicPlayer.vue
- 音乐文件存放在阿里云 OSS 或外链
- 管理后台可配置音乐列表（添加/删除/排序）
- 自动记录用户播放状态（localStorage 记住暂停/播放）

**播放器设计：**

```
┌─────────────────────┐
│  ♪ 今 日の音楽 ─────── │  ← 点击展开详情
│  ──●─────── 03:21   │  ← 进度条
│  ◀◁ ■ ▷▶  🔄        │  ← 控制按钮
│                      │
│  1. ヨルシカ - 春泥棒  │  ← 播放列表
│  2. 紫罗兰永恒花园 OST  │
│  3. CLANNAD - 渚      │
│  4. ...              │
└─────────────────────┘
```

**位置：** 页面左下角，固定定位。

**状态记忆：**

```
localStorage:
  music_playing: true/false    ← 播放状态
  music_current: 2             ← 当前歌曲索引
  music_current_time: 124      ← 播放进度
```

**默认交互行为：**

| 操作 | 反馈 |
|------|------|
| 首次进入页面 | 自动播放第一首（需处理浏览器自动播放策略）|
| 浏览器阻止自动播放 | 显示"点击播放音乐"浮动提示按钮，用户点击后再播放 |
| 切换页面 | 音乐不中断（在 App.vue 层级挂载）|
| 点击播放器音符图标 | 展开/收起播放器详情面板 |
| 歌曲结束 | 自动切到下一首（循环）|

**浏览器自动播放策略处理：**

1. 页面加载后尝试自动播放 `<audio>`
2. 若被浏览器阻止（` promise.catch `），显示小型浮动提示按钮：

   ```
   ┌──────────────────────┐
   │  ♪ 点击播放背景音乐    │
   └──────────────────────┘
   ```

3. 用户任意点击页面后自动尝试恢复播放

**管理后台配置：**
在 Settings.vue 中提供音乐管理面板：

```json
// configs 表 key="music"
{
  "songs": [
    {
      "title": "春泥棒",
      "artist": "ヨルシカ",
      "url": "https://oss-url/music/spring.mp3",
      "cover": "https://oss-url/music/spring-cover.jpg"
    },
    {
      "title": "Sincerely",
      "artist": "TRUE (紫罗兰永恒花园 OP)",
      "url": "https://oss-url/music/sincerely.mp3",
      "cover": "https://oss-url/music/sincerely-cover.jpg"
    }
  ],
  "autoplay": true,
  "volume": 0.5,
  "shuffle": false
}
```

### 网站存活时间

在页脚区域显示博客已运行的时间，像个人网站的"已活XX天"计数器。

**实现方式：**

- 在 `configs` 表中存储 `site_info.launch_date`（网站上线日期）
- 前端 AppFooter.vue 获取该日期，用 JavaScript 计算当前差值
- 每秒更新一次，显示 `天 / 时 / 分 / 秒`

**显示格式：**

```
┌──────────────────────────────────────────┐
│                                          │
│  [GitHub] [Bilibili] [微博] [掘金]  [邮箱] │
│                                          │
│  © 2025 EatLi · 本站已运行               │
│  365 天 12 时 34 分 56 秒                │  ← 实时更新
│                                          │
│  TypeWriter 效果 | Live2D看板娘 | ♪ BGM  │
│                                          │
└──────────────────────────────────────────┘
```

**页脚移动端适配：**

```
┌───────────────────┐
│  [社交图标一行]     │
│                    │
│  © 2025 EatLi     │
│  已运行 365 天     │  ← 移动端只显示天
└───────────────────┘
```

### 留言板

支持游客留言和 GitHub 登录留言两种模式，访客无需登录即可留言，也可通过 GitHub 账号关联展示身份。

**留言板设计：**

```
┌── 留言板 ─────────────────────────────┐
│                                         │
│  填写留言：                              │
│  ┌──────────────────────────────────┐   │
│  │ 昵称 *                      [头像]│   │
│  ├──────────────────────────────────┤   │
│  │                                   │   │
│  │  说点什么吧...                     │   │
│  │                                   │   │
│  ├──────────────────────────────────┤   │
│  │                   [提交留言]       │   │
│  └──────────────────────────────────┘   │
│                                         │
│  ── 共 24 条留言 ──                      │
│                                         │
│  ┌─ 普通宅男 ─────────── 2025-03-15 ─┐  │
│  │ [Gravatar]                         │  │
│  │  大佬博客好棒！求推荐 Galgame！      │  │
│  │                        [回复]      │  │
│  │  ┌─ 博主回复 ────────────────┐     │  │
│  │  │  推荐 CLANNAD，心头好！    │     │  │
│  │  └──────────────────────────┘     │  │
│  └────────────────────────────────────┘  │
│                                         │
│  ┌─ EatLi ──────────── 2025-03-14 ───┐  │
│  │ [GitHub头像]                      │  │
│  │  欢迎来玩~ 有问题随时留言！         │  │
│  │                        [回复]      │  │
│  └────────────────────────────────────┘  │
│                                         │
│  [上一页]  1 2 3 ...  [下一页]          │
└─────────────────────────────────────────┘
```

**两种留言模式：**

| 模式 | 说明 |
|------|------|
| **游客留言** | 填写昵称 + 内容即可提交，可选填邮箱（用于 Gravatar 头像）|
| **GitHub 登录留言** | 点击"使用 GitHub 留言"，通过 OAuth 授权后自动获取 GitHub 用户名和头像 |

**GitHub OAuth 集成（可选）：**

```
游客未登录时：
  ┌──────────────────────┐
  │  昵称  [__________]  │
  │  邮箱  [__________]  │  ← 可选，用于头像
  │                      │
  │  [提交留言]           │
  │  ──── 或 ────        │
  │  [使用 GitHub 留言]   │  ← OAuth 登录
  └──────────────────────┘

GitHub 登录后：
  ┌──────────────────────┐
  │  [GitHub头像] EatLi   │  ← 自动填充，不可修改
  │                      │
  │  说点什么吧...        │
  │                      │
  │  [提交留言]           │
  └──────────────────────┘
```

**审核机制：**

- 游客留言：默认 `pending` 状态，管理员审核通过后公开
- GitHub 登录留言：默认直接 `approved`（有 GitHub 账号背书）
- 管理员可在后台 MessagesAdmin.vue 中审核/删除留言

**回复机制：**

- 留言支持嵌套回复（`parent_id` 字段）
- 管理员回复会显示"博主"标签
- 回复不限制层级，但展示时最多缩进 2 层避免视觉混乱

**API 防刷：**

- 同 IP 30 秒内只能提交 1 条留言
- 留言内容限制 2-500 字
- 昵称限制 2-20 字

**管理后台：**
在 MessagesAdmin.vue 中提供留言管理功能：

- 列表展示全部留言（待审核 / 已审核 / 已拒绝）
- 批量审核通过 / 拒绝
- 删除留言
- 按状态筛选

## 九、实现步骤

### 第一阶段：项目初始化 — ✅ 已完成

1. 创建前端 Vite + Vue 3 项目：`pnpm create vite client -- --template vue`
2. 创建后端 Express 项目，使用 pnpm 安装依赖
3. 安装 Sequelize 及相关依赖（mysql2、sequelize）
4. 配置 Vite 代理转发解决跨域
5. 配置 Sequelize 连接数据库
6. 使用 Sequelize sync 自动建表

### 第二阶段：后端核心开发 — ✅ 已完成

1. 实现 Sequelize 模型（User、Post、Category、Tag、PostTag、Config）
2. 实现模型关联（index.js）
3. 实现 JWT 认证中间件
4. 实现内容 CRUD 控制器（支持 type 筛选 + writing_note 元数据 + 浏览量递增 API）
5. 实现分类、标签控制器
6. 实现留言板模型（Message）和控制器（游客留言 + IP 防刷 + 回复机制）
7. 实现阿里云 OSS 上传接口
8. 实现 GitHub API 代理控制器（获取仓库列表 + 用户信息）
9. 实现站点配置控制器（社交链接、GitHub 配置 CRUD）
10. 实现热力图数据 API（按日统计文章发布量）
11. 实现个人数据统计 API（/api/stats/profile — 各类型数量、总字数）
12. 实现年度报告数据 API（/api/stats/yearly — 月度分布、排行、关键词）
13. Config 模型添加 live2d、music、site_info 等配置项支持

### 第三阶段：管理后台开发 — ✅ 已完成

1. ✅ 管理员登录页面（Login.vue — 磨砂玻璃登录表单）
2. ✅ 后台 Dashboard 布局（AdminLayout.vue — 玻璃侧边栏 + 顶部栏 + 嵌套路由）
3. ✅ Tiptap 编辑器集成（工具栏：加粗/斜体/下划线/标题/列表/引用/代码/图片/链接 + Placeholder）
4. ✅ 内容管理列表（PostManager.vue — 按类型筛选 + 分页 + 编辑/删除）
5. ✅ 各内容类型创建/编辑表单（PostEditor.vue — 类型选择 + 评分 + 分类 + 标签 + 创作手记面板）
6. ✅ 留言管理页面（MessagesAdmin.vue — 按状态筛选 + 审核通过/拒绝 + 删除）
7. ✅ 站点设置页面：社交平台链接管理（增删改）
8. ✅ 站点设置页面：GitHub 配置（用户名、展示数量）
9. ✅ 站点设置页面：Live2D 看板娘配置（对话文本编辑、模型切换）
10. ✅ 站点设置页面：背景音乐管理（歌曲增删改、播放列表排序）
11. ✅ 站点设置页面：站点信息配置（上线日期、签名文本等）

### 第四阶段：前台展示开发（移动端优先）— ⏳ 待开发

1. 首页（个人 Profile 卡 + 各类型最新内容 + 热力图 + GitHub 项目侧边栏）— 移动端单列布局
2. 文章列表 + 文章详情页（含创作手记块）
3. 动漫感想列表 + 动漫详情页（含创作手记块）
4. Galgame 感想列表 + Galgame 详情页（含创作手记块）
5. 标签筛选页面
6. GitHub 项目展示页面 /projects
7. 留言板页面 /guestbook（游客留言 + 分页 + 嵌套回复）
8. 年度报告页面 /yearly（数据看板，图表展示）
9. 关于页面（个人介绍 + 社交链接 + 完整热力图）
10. 公共组件开发：HeatMap.vue、GitHubProjects.vue、SocialLinks.vue、ProfileCard.vue、Live2DWidget.vue、MusicPlayer.vue、TypeWriter.vue、GuestMessage.vue
11. 页脚实现：社交平台链接 + 网站存活时间（每秒实时更新）
12. 内容卡片列表添加浏览量显示
13. 详情页实现浏览量递增 API 调用（防刷机制）
14. 首页 Profile 卡签名打字机效果
15. 背景音乐播放器（处理浏览器自动播放策略 + localStorage 记忆）
16. 留言板页面：留言表单 + 嵌套回复 + 分页
17. 404 页面（RPG 风格彩蛋）
18. 全局彩蛋实现：加载动画、文章分隔线、页脚签名、空状态提示
19. 看板娘添加配置

### 第五阶段：样式与优化 — ✅ 已完成

1. CSS 变量定义主题色（温暖低饱和度配色）
2. 响应式断点规划：手机 (<768px) / 平板 (768-1024px) / 桌面 (>1024px)
3. 移动端导航适配（汉堡菜单）
4. 图片懒加载
5. 加载状态（骨架屏）
6. 空状态提示
7. 错误处理
8. 页面过渡动画

### 第六阶段：部署上线准备

1. 前端构建配置
2. 后端生产环境配置
3. 代码优化

## 十、扩展计划（后续可选）

- 评论系统（Waline / Giscus）
- 全文搜索
- RSS 订阅
- 深色模式
- 阅读量统计图表
- 社交媒体分享
- SEO 优化
- PWA 支持
