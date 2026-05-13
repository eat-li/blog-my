/**
 * Mock 数据脚本 —— 生成 6 篇技术博客文章
 * 运行：cd server && node mock/mock-posts.js
 */
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const { Post, Category, Tag, User, syncDatabase } = require('../models')

// 分类数据
const categoryData = [
  { name: '前端开发', description: 'Vue / React / CSS / 工程化', icon: 'edit' },
  { name: '后端开发', description: 'Node.js / Express / 数据库', icon: 'server' },
  { name: '工具推荐', description: '开发工具和效率提升', icon: 'wrench' },
  { name: '开发随笔', description: '技术思考和心得体会', icon: 'lightbulb' },
]

// 标签数据
const tagData = [
  'Vue 3', 'JavaScript', 'Node.js', 'CSS', 'TypeScript',
  '性能优化', '工程化', 'React', 'Docker', 'Git',
  '设计模式', 'Vite', '前端架构', 'MySQL',
]

// 技术博客文章 Mock 模板
const articles = [
  {
    title: 'Vue 3 Composition API 实战指南：从入门到进阶',
    summary: '深入探讨 Vue 3 Composition API 的设计思想、核心用法和最佳实践，包含大量实战示例。',
    category: '前端开发',
    tags: ['Vue 3', 'TypeScript', '前端架构'],
    content: `<h2>引言</h2>
<p>Vue 3 的 Composition API 是一次彻底的思维转变。与 Options API 不同，它不再按选项类型组织代码，而是按<strong>逻辑关注点</strong>来组合。本文将带你从基础到进阶，全面掌握这一新模式。</p>
<h2>为什么需要 Composition API</h2>
<p>在 Options API 中，同一个功能的代码分散在 data、methods、computed 等不同选项中。当组件变复杂时，理解和维护会变得困难。Composition API 解决了这个问题。</p>
<p>来看一个对比：Options API 中实现搜索功能，数据在 <code>data</code>、逻辑在 <code>methods</code>、计算在 <code>computed</code>，三部分散落在不同位置。而 Composition API 允许你将它们聚合在一个 <code>setup</code> 函数中。</p>
<h3>核心优势</h3>
<ul>
<li>更灵活的逻辑复用，告别 Mixin 的命名冲突</li>
<li>更好的类型推导支持，TypeScript 体验极佳</li>
<li>按逻辑关注点组织代码，而非选项类型</li>
<li>Tree-shaking 友好，打包体积更小</li>
</ul>
<h2>setup 函数详解</h2>
<p><code>setup</code> 是 Composition API 的入口，在组件实例创建之前执行。它接收两个参数：<code>props</code> 和 <code>context</code>。</p>
<pre><code>const { ref, onMounted } = Vue

export default {
  setup(props, { emit }) {
    const count = ref(0)
    const increment = () => count.value++

    onMounted(() => {
      console.log('组件已挂载')
    })

    return { count, increment }
  }
}</code></pre>
<h2>ref 与 reactive 的选择</h2>
<p>这是初学者最常困惑的地方。简单来说：</p>
<ul>
<li><code>ref</code> — 适合基本类型和需要替换整个值的场景</li>
<li><code>reactive</code> — 适合对象/数组，但不能解构（会丢失响应性）</li>
</ul>
<p>个人建议：<strong>统一使用 ref</strong>，配合 <code>.value</code> 访问。虽然多打了几个字，但心智负担更小，也避免了 reactive 的代理陷阱。</p>
<h2>组合函数（Composables）</h2>
<p>这是 Composition API 最强大的特性。将可复用的有状态逻辑封装成函数，可以跨组件共享。</p>
<pre><code>// useMouse.js
export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function update(e) {
    x.value = e.pageX
    y.value = e.pageY
  }

  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  return { x, y }
}</code></pre>
<h2>总结</h2>
<p>Composition API 不是 Option API 的替代品，而是一种更灵活的选择。在简单组件中，Option API 依然够用；但在复杂业务中，Composition API 能显著提升代码的可维护性和可读性。</p>`,
    views: 1853,
  },
  {
    title: 'Node.js 性能优化：从 200ms 到 20ms 的调优之路',
    summary: '记录一次接口性能优化的完整过程，涉及数据库查询、缓存策略、异步流程和内存管理。',
    category: '后端开发',
    tags: ['Node.js', '性能优化', 'MySQL'],
    content: `<h2>背景</h2>
<p>最近接手了一个老项目的维护工作。有个热门接口 P99 延迟高达 200ms，严重影响了用户体验。本文记录完整的排查和优化过程。</p>
<h2>第一步：定位瓶颈</h2>
<p>优化之前必须量化。先用 <code>console.time</code> 打点，定位到数据库查询耗时 180ms——很明显问题在查询层。</p>
<pre><code>console.time('query')
const result = await db.query(sql)
console.timeEnd('query')  // → query: 182.34ms</code></pre>
<h3>分析 SQL</h3>
<p>使用 <code>EXPLAIN</code> 分析执行计划，发现几个问题：</p>
<ul>
<li>缺少索引导致全表扫描，扫描 50w+ 行</li>
<li>子查询被重复执行了 N+1 次</li>
<li>JOIN 了不必要的表</li>
</ul>
<h2>第二步：优化数据库查询</h2>
<h3>添加索引</h3>
<pre><code>ALTER TABLE posts ADD INDEX idx_user_status (user_id, status);
ALTER TABLE posts ADD INDEX idx_created (created_at);</code></pre>
<p>单这一项就把查询从 180ms 降到了 12ms。</p>
<h3>消除 N+1 查询</h3>
<p>使用 <code>LEFT JOIN</code> 替代循环中的子查询，将 50+ 次查询合并为 1 次。</p>
<h2>第三步：引入 Redis 缓存</h2>
<p>对于读多写少的热门数据，引入 Redis 作为缓存层：</p>
<pre><code>const cached = await redis.get(key)
if (cached) return JSON.parse(cached)

const data = await db.query(sql)
await redis.set(key, JSON.stringify(data), 'EX', 300)
return data</code></pre>
<h2>总结</h2>
<p>经过三轮优化，P99 延迟从 200ms 降到了 20ms，性能提升了 10 倍。关键经验：<strong>先量化再优化、索引是第一武器、缓存要合理使用</strong>。</p>`,
    views: 1290,
  },
  {
    title: 'CSS Container Queries：响应式布局的新时代',
    summary: 'CSS Container Queries 让组件能根据自身容器大小而非视口尺寸来调整样式，彻底改变了响应式设计的范式。',
    category: '前端开发',
    tags: ['CSS', '前端架构', '性能优化'],
    content: `<h2>从 Media Queries 到 Container Queries</h2>
<p>传统的 Media Queries 基于视口（viewport）尺寸来控制样式。但现代 Web 应用大量使用组件化架构——同一个组件可能出现在宽窄不同的容器中。Container Queries 正是为了解决这个痛点而生。</p>
<h2>基本语法</h2>
<pre><code>.card-container {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 200px 1fr;
  }
}

@container card (max-width: 399px) {
  .card {
    display: flex;
    flex-direction: column;
  }
}</code></pre>
<h3>浏览器支持</h3>
<p>截至 2025 年初，所有现代浏览器均已支持 Container Queries。在不支持的老浏览器中，可以使用 <code>@supports</code> 做降级处理。</p>
<h2>实际应用场景</h2>
<h3>场景一：自适应卡片组件</h3>
<p>同一个卡片组件，在侧边栏中显示为垂直布局，在主内容区显示为水平布局。使用 Container Queries 可以完美解决。</p>
<h3>场景二：动态网格布局</h3>
<p>配合 <code>auto-fill</code> 和 <code>minmax</code>，根据容器宽度自动调整列数，无需任何 JavaScript。</p>
<h2>Container Queries vs Media Queries</h2>
<table>
<tr><th>特性</th><th>Media Queries</th><th>Container Queries</th></tr>
<tr><td>参照物</td><td>视口尺寸</td><td>父容器尺寸</td></tr>
<tr><td>组件级复用</td><td>依赖上下文</td><td>独立自适应</td></tr>
<tr><td>设计系统适用</td><td>一般</td><td>优秀</td></tr>
</table>
<h2>总结</h2>
<p>Container Queries 是 CSS 近年来最重要的特性之一。配合 CSS Nesting、:has() 选择器和 Layer，现代 CSS 的能力已经远超很多开发者的认知。现在正是学习这些新特性的最佳时机。</p>`,
    views: 968,
  },
  {
    title: 'TypeScript 高级类型体操：从入门到放弃再到精通',
    summary: '分享 TypeScript 高级类型的使用方法和调试技巧，帮助你征服类型体操。',
    category: '前端开发',
    tags: ['TypeScript', 'JavaScript', '设计模式'],
    content: `<h2>为什么要学类型体操</h2>
<p>日常工作并不需要写复杂的类型。但理解类型系统的工作原理，能帮你更自信地使用泛型、读懂开源库的类型定义，以及在遇到诡异类型错误时快速定位问题。</p>
<h2>条件类型</h2>
<p>条件类型是类型体操的基石，语法类似于 JavaScript 的三元表达式：</p>
<pre><code>type IsString&lt;T&gt; = T extends string ? true : false

type A = IsString&lt;'hello'&gt;  // true
type B = IsString&lt;42&gt;        // false</code></pre>
<h3>分布式条件类型</h3>
<p>当条件类型的输入是联合类型时，TypeScript 会<strong>自动分发</strong>：</p>
<pre><code>type ToArray&lt;T&gt; = T extends any ? T[] : never
type Result = ToArray&lt;string | number&gt;
// → string[] | number[]（不是 (string | number)[]）</code></pre>
<h2>infer 关键字</h2>
<p><code>infer</code> 让你在条件类型中声明一个类型变量来捕获类型：</p>
<pre><code>type GetReturn&lt;T&gt; = T extends (...args: any[]) => infer R ? R : never

type Fn = (x: number) => string
type Ret = GetReturn&lt;Fn&gt;  // string</code></pre>
<h2>模板字面量类型</h2>
<p>TypeScript 4.1 引入的模板字面量类型让字符串处理变得强大：</p>
<pre><code>type EventName&lt;T extends string&gt; = \`on\${Capitalize&lt;T&gt;}\`
type ClickEvent = EventName&lt;'click'&gt;  // 'onClick'</code></pre>
<h2>实用技巧</h2>
<ul>
<li>使用 <code>unknown</code> 替代 <code>any</code>，它更安全</li>
<li>善用 <code>const</code> 断言和 <code>as const</code></li>
<li>善用 VSCode 的类型提示来反推复杂类型</li>
<li>遇到难题时，分步骤拆解，不要试图一步到位</li>
</ul>
<h2>总结</h2>
<p>类型体操的真正价值不在于写出多么复杂的类型，而在于理解类型系统如何运作。当你习惯了 TypeScript 的思维方式，你会发现它不是在「增加负担」，而是在帮你提前发现潜在的 Bug。</p>`,
    views: 1562,
  },
  {
    title: '搭建个人全栈博客全记录：Vue 3 + Express + MySQL',
    summary: '从零开始搭建一个完整的个人博客，涵盖前端设计、后端架构、数据库设计和部署上线全流程。',
    category: '开发随笔',
    tags: ['Vue 3', 'Node.js', 'MySQL', 'Vite'],
    content: `<h2>动机</h2>
<p>作为一个开发者，一直想拥有一个完全属于自己的博客空间。GitHub Pages 太简单，WordPress 太重，不如自己动手写一个。既能练手，又能完全掌控每一个像素和每一个 API。</p>
<h2>技术选型</h2>
<h3>前端：Vue 3 + Vite</h3>
<p>选择 Vue 3 是因为它的 Composition API 和响应式系统非常优雅。Vite 的开发体验极佳，热更新几乎零延迟。组件库没有用第三方，而是自己写了磨砂玻璃（Glassmorphism）风格的组件系统。</p>
<h3>后端：Express 5 + Sequelize</h3>
<p>Express 仍然是 Node.js 生态中最灵活的后端框架。Sequelize 作为 ORM，让数据库操作变得简洁。整个后端采用三层架构：Routes → Controllers → Services → Models。</p>
<h3>存储：阿里云 OSS</h3>
<p>图片和音频文件存储在阿里云 OSS 上，通过服务端签名 + 客户端直传的方式上传，避免了文件经过服务器的中转。</p>
<h2>核心设计</h2>
<h3>统一内容模型</h3>
<p>整个博客的核心是 Post 表，通过 <code>type</code> 字段区分文章、动漫感想、Galgame 感想三种内容类型。这种设计减少了表的数量，也让数据管理更加统一。</p>
<h3>磨砂玻璃 UI</h3>
<p>整体视觉采用温暖低饱和度的复古配色，背景使用毛玻璃效果，配合落樱飘落动画、翻页加载等细节，营造出一种「秋天的图书馆」般的氛围。</p>
<h2>遇到的坑</h2>
<ul>
<li>Express 5 的路由匹配顺序需要特别注意，<code>/:id</code> 会拦截 <code>/admin</code> 等具体路径</li>
<li>Sequelize 的 <code>alter: true</code> 在开发阶段很方便，但生产环境要慎用</li>
<li>OSS 直传时要注意 CORS 配置和上传策略的正确性</li>
</ul>
<h2>总结</h2>
<p>整个项目从设计到完成大约花了两周时间。虽然还有很多功能和细节可以打磨，但核心功能已经完备。最重要的是，这个博客是完全属于自己的空间。</p>`,
    views: 2341,
  },
  {
    title: 'Git 工作流最佳实践：从单人开发到团队协作',
    summary: '总结 Git 在个人项目和团队协作中的最佳实践，包括分支策略、Commit 规范和 Code Review 流程。',
    category: '工具推荐',
    tags: ['Git', '工程化', 'Docker'],
    content: `<h2>为什么需要规范的工作流</h2>
<p>Git 是一个强大的工具，但如果不约定好使用规范，很快就会陷入混乱的合并冲突和无法追溯的提交历史中。一个好的工作流能让团队协作更高效。</p>
<h2>分支策略</h2>
<h3>GitHub Flow（推荐用于小团队和持续部署）</h3>
<p>最简单的分支模型：<code>main</code> 分支始终可部署，功能开发在 <code>feature/xxx</code> 分支上进行，完成后通过 PR 合并回 main。</p>
<h3>Git Flow（适合有发布周期的项目）</h3>
<p>引入 <code>develop</code> 和 <code>release</code> 分支，适合需要维护多个版本的较大项目。</p>
<h2>Commit 规范</h2>
<p>使用 Conventional Commits 规范来写提交信息：</p>
<pre><code>feat: 新增文章目录组件
fix: 修复搜索框无法输入中文的问题
refactor: 重构用户认证中间件
docs: 更新 API 文档
style: 格式化代码，统一缩进
perf: 优化首页加载速度</code></pre>
<h3>一个 Commit 只做一件事</h3>
<p>这是最重要的原则。不要把功能开发、Bug 修复和代码重构混在一个 Commit 里。这不仅让审查者难以理解，也让未来的你难以回滚。</p>
<h2>Code Review 清单</h2>
<ol>
<li>代码逻辑是否正确？边界情况是否处理？</li>
<li>命名是否清晰？新来的人能看懂吗？</li>
<li>是否有潜在的性能问题或安全漏洞？</li>
<li>是否有重复代码可以抽取？</li>
<li>测试是否覆盖了新功能？</li>
</ol>
<h2>实用技巧</h2>
<h3>交互式 rebase</h3>
<pre><code>git rebase -i HEAD~3</code></pre>
<p>可以压缩（squash）、修改（reword）和重新排序最近的 Commit。在推送前整理历史，让别人更容易 Review。</p>
<h3>Git Hooks</h3>
<p>使用 <code>husky</code> + <code>lint-staged</code> 在提交前自动运行 ESLint 和 Prettier，确保代码风格一致。</p>
<h2>总结</h2>
<p>Git 工作流的本质是<strong>沟通规范</strong>。好的 Commit 信息是写给三个月后的自己看的；好的分支策略是让整个团队同步工作而不互相踩脚。花一点时间建立规范，省下的是未来无数次的沟通成本。</p>`,
    views: 783,
  },
]

async function seed() {
  await syncDatabase()
  console.log('数据库已同步，开始生成 Mock 数据...\n')

  // 1. 创建分类
  const categories = {}
  for (const c of categoryData) {
    const [instance] = await Category.findOrCreate({
      where: { name: c.name },
      defaults: c
    })
    categories[c.name] = instance
    console.log('分类:', instance.name, instance.id)
  }

  // 2. 创建标签
  const tags = {}
  for (const name of tagData) {
    const [instance] = await Tag.findOrCreate({
      where: { name },
      defaults: { name }
    })
    tags[name] = instance
  }
  console.log(`创建了 ${tagData.length} 个标签\n`)

  // 3. 获取管理员用户
  const admin = await User.findOne({ where: { username: 'admin' } })
  if (!admin) {
    console.error('未找到管理员用户，请先运行 node seed.js 初始化数据库')
    process.exit(1)
  }

  // 4. 创建文章
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i]
    const post = await Post.create({
      type: 'article',
      title: article.title,
      content: article.content,
      summary: article.summary,
      category_id: categories[article.category]?.id || null,
      status: 'published',
      views: article.views + Math.floor(Math.random() * 100),
      user_id: admin.id,
      metadata: null,
    })

    // 关联标签
    if (article.tags?.length) {
      const tagInstances = article.tags
        .map(name => tags[name])
        .filter(Boolean)
      await post.setTags(tagInstances)
    }

    console.log(`[${i + 1}/${articles.length}] 文章: ${article.title}`)
  }

  console.log('\nMock 数据生成完成！')
  console.log(`共创建 ${articles.length} 篇技术博客文章`)
  process.exit(0)
}

seed().catch(err => {
  console.error('生成失败:', err.message)
  process.exit(1)
})
