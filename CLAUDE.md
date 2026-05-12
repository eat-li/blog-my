# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用命令

### 前端 (client/)

```bash
cd client && pnpm dev        # 启动开发服务器 (localhost:5173)
cd client && pnpm build      # 生产构建
cd client && pnpm preview    # 预览构建结果
```

### 后端 (server/)

```bash
cd server && node --watch app.js    # 开发模式（文件变更自动重启）
cd server && node app.js            # 生产启动
cd server && node seed.js           # 初始化数据库（创建管理员 admin/admin123 + 默认配置）
cd server && npx vitest run                     # 运行全部测试
cd server && npx vitest run test/posts.test.mjs # 运行单个测试文件
```

### 环境变量 (server/.env)

```
DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASSWORD  # MySQL 连接
JWT_SECRET                                            # JWT 签名密钥
OSS_REGION / OSS_ACCESS_KEY_ID / OSS_ACCESS_KEY_SECRET / OSS_BUCKET / OSS_BASE_URL  # 阿里云 OSS
PORT                                                  # 服务端口，默认 3000
```

## 项目架构

一个个人博客网站，前端 Vue 3 + Vite，后端 Express 5 + Sequelize + MySQL，前后端完全分离。

### 目录结构

```
blog_my/
├── client/                  # Vue 3 前端 (Vite, pnpm)
│   └── src/
│       ├── api/index.js     # 所有后端 API 封装（按模块导出）
│       ├── components/      # 公共组件（AppHeader, AdminLayout, SakuraPetals 等）
│       ├── views/           # 页面（前台 + admin/ 后台）
│       ├── router/index.js  # 路由（含 beforeEach 鉴权守卫）
│       ├── stores/          # Pinia 状态（auth, blog）
│       ├── composables/     # 可组合函数
│       └── utils/request.js # Axios 封装（baseURL=/api, 自动附加 Bearer token, 401 跳转）
├── server/                  # Express 5 后端
│   ├── app.js               # 入口（中间件 + 路由挂载 + 数据库同步 + 启动）
│   ├── .env                 # 环境变量（数据库/OSS/JWT）
│   ├── config/db.config.js  # Sequelize MySQL 连接
│   ├── models/              # Sequelize 模型（index.js 定义关联 + sync）
│   ├── routes/              # Express 路由（薄层，只做路由映射）
│   ├── controllers/         # 请求处理（解析参数 → 调 service → 格式化响应）
│   ├── services/            # 业务逻辑（数据库操作，不碰 req/res）
│   ├── middleware/           # JWT 认证 + 错误处理
│   ├── seed.js              # 数据库初始化种子
│   ├── test/                # Vitest + Supertest 测试（.mjs 后缀）
│   └── uploads/             # 本地上传文件
└── PLAN.md                  # 完整项目方案文档
```

### 后端分层架构

**routes → controllers → services → models**

- **routes**: 纯路由映射，无逻辑
- **controllers**: 解析请求参数，调用 service，格式化 JSON 响应
- **services**: 所有业务逻辑和数据库操作，不接触 req/res
- **models**: Sequelize 模型定义 + 关联（index.js 中 `sequelize.sync({ alter: true })` 自动同步表结构）

### 核心数据模型 — 统一内容模型

**Post** 是整个系统的核心，通过 `type` 字段区分三种内容类型：
- `article` — 文章（使用 category_id 分类）
- `anime` — 动漫感想（使用 rating 评分 + metadata 存作品名/话数/制作公司等）
- `galgame` — Galgame 感想（使用 rating 评分 + metadata 存游戏名/开发商/游玩时长等）

关联：`User 1→* Post`, `Category 1→* Post`, `Post *↔* Tag` (post_tags 关联表)

其他模型：
- **Message** — 留言，自关联 parent_id 支持嵌套回复，status 审核机制（pending/approved/rejected）
- **Config** — key-value 站点配置，value 为 JSON 存 site_info/social_links/live2d/music 等
- **FriendLink** — 友情链接，status 审核机制，支持分类和排序

### API 路由一览

| 路由前缀 | 文件 | 说明 |
|----------|------|------|
| /api/auth | routes/auth.js | 登录、获取当前用户 |
| /api/posts | routes/posts.js | 内容 CRUD + 浏览量 + 热力图 |
| /api/categories | routes/categories.js | 分类管理 |
| /api/tags | routes/tags.js | 标签管理 |
| /api/messages | routes/messages.js | 留言板（公开+管理） |
| /api/github | routes/github.js | GitHub API 代理 |
| /api/config | routes/config.js | 站点配置 |
| /api/upload | routes/upload.js | OSS 上传（图片+音频） |
| /api/friendlinks | routes/friendlinks.js | 友情链接 |
| /api/stats | routes/stats.js | 个人统计 + 年度报告 |

### 认证

JWT 认证，登录后 token 存 localStorage，Axios 拦截器自动附加 `Bearer` header。路由守卫 `beforeEach` 检查 `meta.requiresAuth`，未登录跳转 `/admin/login`。

### 图片/音频上传

阿里云 OSS。后端 `/api/upload/signature` 生成上传签名，前端用 axios 直传 OSS（服务端签名 + 客户端直传模式）。同时支持图片和音频文件上传。

### 开发代理

Vite 开发服务器 (5173) 代理 `/api` 和 `/uploads` 到后端 (3000)，开发时无需配置 CORS。

### 测试

后端使用 Vitest + Supertest，测试文件在 `server/test/`，`.mjs` 后缀。`setup.mjs` 提供登录辅助函数，`helpers.mjs` 提供通用测试辅助。`vitest.config.js` 关闭并行执行（`fileParallelism: false`）。

运行单个测试：`cd server && npx vitest run test/<文件名>.mjs`

### 前端路由一览

| 路径 | 页面 | 说明 |
|------|------|------|
| / | Home | 首页（聚合展示） |
| /articles, /articles/:id | ArticleList/Detail | 文章 |
| /anime, /anime/:id | AnimeList/Detail | 动漫感想 |
| /galgame, /galgame/:id | GalgameList/Detail | Galgame 感想 |
| /tags/:id | TagPosts | 按标签筛选 |
| /guestbook | Guestbook | 留言板 |
| /projects | Projects | GitHub 项目 |
| /yearly | YearlyReport | 年度报告 |
| /about | About | 关于页 |
| /links | FriendLinks | 友情链接 |
| /admin/* | AdminLayout + 子路由 | 管理后台（登录/控制台/内容/留言/友链/设置） |

### UI 设计

采用「磨砂玻璃」设计系统 (`backdrop-filter: blur`)，温暖低饱和度配色。主色复古红棕 `#8B4513`，背景米白 `#F5F0E8`。三种内容类型各有专属色：文章暖橙 `#E8895B`、动漫珊瑚红 `#E85B5B`、Galgame 抹茶绿 `#7BA872`。全局特效包括：落樱动画、翻页加载、像素吉祥物、动漫名言滚动条等。详见 PLAN.md 第八节。
