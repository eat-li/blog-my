/**
 * Mock 数据脚本 —— 生成 6 篇 Galgame 玩后感
 * 运行：cd server && node mock/mock-galgame.js
 */
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const { Post, Tag, User, syncDatabase } = require('../models')

const tagData = ['催泪', '治愈', '悬疑', '科幻', '恋爱', '全年龄', '同人', 'RPG', '纯爱', '泣きゲー', '哲学', '长篇']

const galgameReviews = [
  {
    title: '《CLANNAD》—— 在坡道下等待的，是名为「人生」的小镇',
    summary: 'Key 社最高杰作，一部让人笑着流泪、哭着微笑的家族物语。',
    tags: ['催泪', '治愈', '泣きゲー', '长篇'],
    rating: 10,
    cover: 'https://picsum.photos/seed/clannad/800/400',
    metadata: {
      gameTitle: 'CLANNAD',
      developer: 'Key',
      playTime: '约 80 小时',
      platform: 'PC',
      year: '2004',
      highlight: 'After Story 篇是整个 Galgame 史上最伟大的叙事之一'
    },
    content: `<h2>坡道的意义</h2>
<p>故事从一个坡道开始。冈崎朋也站在坡道下，看着名为古河渚的女孩站在坡道顶。她重复着一句自言自语：「你喜欢这个学校吗？」就是这样一个简单的开场，却开启了一段跨越十年的旅程。</p>
<p>这条坡道是一个<strong>双重隐喻</strong>：表面上它是通往学校的路，实际上它是通往成长、通往人生的道路。整个《CLANNAD》就是一个不断攀登的过程。</p>
<h2>学园篇：每一个人的故事</h2>
<p>《CLANNAD》有超过 10 条路线，每条路线都讲述了一个完整而感人的故事。风子的消失、琴美的离别、智代的责任、杏的坚强……每条线都触及了不同的人生侧面。</p>
<h3>风子线的惊艳</h3>
<p>作为一个推进主线不多的支线，风子的故事却让无数玩家第一次流下眼泪。当所有人逐渐忘记风子的存在，只有最后一个人拼命想要记住——这种无力感写得淋漓尽致。</p>
<h2>After Story：从青春到人生</h2>
<p>如果说学园篇是青春的终章，那 After Story 就是人生的序曲。</p>
<p>朋也从学生变成社会人，和渚组建家庭，面对工作的压力、生活的困难，以及后来的悲剧——《CLANNAD》在这里完成了一个巨大的飞跃：<strong>它不再是美少女游戏，而是一部关于「何为人生」「何为家人」的文学</strong>。</p>
<h3>「能哭的地方，只有厕所和爸爸的怀里」</h3>
<p>当汐说出这句台词时，我整个人都崩溃了。这不仅仅是催泪，而是对亲子关系最深层的叩问——在痛苦面前，我们能依靠的人是谁？</p>
<h2>音乐</h2>
<p>麻枝准 + 折户伸治的组合写出了 Galgame 史上最经典的曲目——《小さなてのひら》《渚》《Ana》，每一首都可以单曲循环一整天。音乐不仅仅是背景，而是叙事不可或缺的一部分。</p>
<h2>总结</h2>
<p>10 分。它改变了我对「家庭」的理解。一部让你哭完之后，更想好好对待身边的人的作品。</p>`,
    views: 2890,
  },
  {
    title: '《Ever17》—— 当游戏打破第四面墙的极限',
    summary: '「你」不仅仅是玩家，「你」就是这个故事中最关键的一个人物。一场关于时间、记忆和存在的震撼叙事。',
    tags: ['悬疑', '科幻', '全年龄'],
    rating: 10,
    cover: 'https://picsum.photos/seed/ever17/800/400',
    metadata: {
      gameTitle: 'Ever17 -the out of infinity-',
      developer: 'KID',
      playTime: '约 35 小时',
      platform: 'PC / PSP',
      year: '2002',
      highlight: '最终路线揭开的真相让人头皮发麻，彻底颠覆所有之前的认知'
    },
    content: `<h2>水下乐园的七日</h2>
<p>2027 年，水下主题公园 LeMU 发生事故，七名男女被困在深海 51 米之下。在等待救援的七日限时中，他们必须寻找生路。而在这七人中，有一个名为「仓成武」的大学生……</p>
<p>等等，你是仓成武？还是……</p>
<p>不，你是<strong>你自己</strong>。</p>
<h2>视角的欺骗</h2>
<p>《Ever17》最天才的设计在于「视觉陷阱」。游戏巧妙地将故事分为两条视角线——仓成武视角和少年视角——让玩家一直以为自己在玩一个普通的双主角故事。然后在最后的可可线中，它告诉了你一个完全颠覆性的真相：</p>
<p><strong>你看世界的那个「视角」，不是仓成武的，不是少年的，而是——你自己的。</strong></p>
<p>玩家从来不是一个旁观者，而是故事中的一个重要存在。</p>
<h2>叙事的精妙</h2>
<p>《Ever17》用视觉小说的媒介特性做到了任何其他媒介都无法做到的事。它不是简单地在讲故事——它在<strong>利用玩家的位置</strong>来讲故事。</p>
<p>这个概念在 2002 年提出时是极其超前的。二十年过去了，能做到这个级别的第四面墙突破的游戏依然屈指可数。</p>
<h2>不足之处</h2>
<p>日常部分略显冗长，武视角的前四条路线节奏偏慢。很多玩家在到达可可线之前就放弃了，而这恰恰是最大的遗憾——因为前面所有的「无聊」，都是在为最后的爆发做铺垫。</p>
<h2>总结</h2>
<p>10 分。一部改变了我对「电子游戏叙事」认知的作品。它证明了：好的叙事不是「写得好」，而是<strong>只有在这个媒介里才能成立</strong>。</p>
<p>如果你打算玩，不要看任何剧透。通关后再回来，你会感谢我的。</p>`,
    views: 1967,
  },
  {
    title: '《Steins;Gate》—— 跨越无数世界线只为救你',
    summary: '时间旅行题材的巅峰之作，将中二病、微波炉和香蕉变成了一部令人窒息的悬疑剧。',
    tags: ['悬疑', '科幻', '全年龄'],
    rating: 10,
    cover: 'https://picsum.photos/seed/steinsgate/800/400',
    metadata: {
      gameTitle: 'Steins;Gate',
      developer: '5pb. / Nitroplus',
      playTime: '约 30 小时',
      platform: 'PC / PS3 / PS Vita',
      year: '2009',
      highlight: '从第6章开始节奏骤然加速，之后每一章都在推高情感张力'
    },
    content: `<h2>「El Psy Kongroo」</h2>
<p>冈部伦太郎是一个重度中二病患者，整天自称「疯狂科学家凤凰院凶真」，和同伴们在秋叶原的小实验室「未来道具研究所」里鼓捣些奇怪的发明。直到有一天，他们真的发明出了一台<strong>可以向过去发送邮件的时间机器</strong>。</p>
<p>这就是一切的开端。</p>
<h2>前半段的「日常」</h2>
<p>《Steins;Gate》的前 5 章节奏很慢，大量的日常对话、宅文化梗、以及看似无关紧要的科学讨论。很多人在这个阶段放弃了。但玩过的人都知道：<strong>前 5 章的每一句对话几乎都是伏笔</strong>。</p>
<p>每一个角色不经意间说的话，每一个看似无关的细节，都会在剧情爆发时以一种令人震撼的方式重新出现。</p>
<h2>世界线的跳跃</h2>
<p>当冈部第一次意识到时间跳跃的后果时，故事进入了一个全新的维度。为了拯救真由理，他一次次地跳跃世界线，一次次地目睹她的死亡，一次次地在失败中寻找出路。</p>
<p>那种<strong>绝望和偏执交织的感觉</strong>，被剧本文本和宫野真守的配音表现得淋漓尽致。</p>
<p>然后助手红莉栖说出了那句经典的台词：「不管是在哪条世界线上的你，我都会找到你。」</p>
<h2>中二病的救赎</h2>
<p>很多人讨论《Steins;Gate》时关注的是它的时间旅行设定，但这部作品真正的内核是：<strong>正是冈部的中二病——那种不切实际的「妄想」——给了他跨越无数世界线的勇气</strong>。</p>
<p>那个被人嘲笑的「凤凰院凶真」，最终成为了真正的英雄。</p>
<h2>总结</h2>
<p>10 分。它是那种「玩完之后很长一段时间都在回味」的作品。每次听到《Hacking to the Gate》的前奏，都会起鸡皮疙瘩。</p>`,
    views: 2541,
  },
  {
    title: '《白昼夢の青写真》—— 三篇轮回中追寻的「你」',
    summary: 'Laplacian 的科幻恋爱三部曲，横跨三个时代的故事在同一主题下汇聚，完成了一次漂亮的叙事实验。',
    tags: ['科幻', '恋爱', '哲学'],
    rating: 8,
    cover: 'https://picsum.photos/seed/hakuchumu/800/400',
    metadata: {
      gameTitle: '白昼夢の青写真',
      developer: 'Laplacian',
      playTime: '约 25 小时',
      platform: 'PC',
      year: '2020',
      highlight: 'Case 1 的文学少女与教师的禁忌之恋是最动人的一篇'
    },
    content: `<h2>三段故事，一个主题</h2>
<p>《白昼夢の青写真》由三个独立的故事（Case 0~3）组成，每个故事的主人公都长着同一张脸、有着同样的声音，却生活在不同的时代和身份中。贯穿三篇的核心命题是：<strong>灵魂是否会在轮回中追寻同一个对象？</strong></p>
<h2>Case 1：无声的笔谈</h2>
<p>最打动我的篇章。故事设定在大正至昭和年代，一位失声的文学少女和她的家庭教师之间的故事。少女只能通过写作来表达自己，而教师是她唯一的读众。</p>
<p>这种「只有两个人能理解的世界」的设定，配合古雅的文风和细腻的心理描写，营造出了一种<strong>甜美而哀伤</strong>的氛围。跨越了身份和家庭的重重阻碍后，两人最终……</p>
<p>不剧透了，但这个篇章值得单独出一个游戏。</p>
<h2>Case 2 & 3：转向现代</h2>
<p>后两个篇章转入现代和近未来，手法更加大胆。Case 2 的女演员和替身的身份互换，Case 3 直接进入了科幻设定——剧情开始汇集前两篇的所有线索，为最终的真相铺垫。</p>
<h2>制作水平</h2>
<p>Laplacian 在画面和演出上投入了巨大心血。尤其是人物立绘和 CG 的处理，光影的表现力在同类作品中属于顶级。但 Case 0（核心真相篇）的节奏有些过快，解释了一大堆设定后就直接收尾了。</p>
<h2>不足之处</h2>
<p>主线设定过于复杂，Case 0 试图在一章内解释所有伏笔，结果有些地方显得仓促。另外，比起 Case 1 的沉稳，后两篇的节奏控制稍弱。</p>
<h2>总结</h2>
<p>8 分。一部有野心的实验性作品，Case 1 是神回，其他篇章质量有起伏。适合喜欢「文学感」和「轮回设定」的玩家。</p>`,
    views: 1243,
  },
  {
    title: '《Muv-Luv Alternative》—— 在绝望中绽放的希望之花',
    summary: '十年间 Galgame 评分榜霸榜之作，一部让「燃」这个词有了全新定义的作品。',
    tags: ['科幻', '长篇', '泣きゲー'],
    rating: 10,
    cover: 'https://picsum.photos/seed/muvluv/800/400',
    metadata: {
      gameTitle: 'マブラヴ オルタネイティヴ',
      developer: 'âge',
      playTime: '约 50 小时',
      platform: 'PC',
      year: '2006',
      highlight: '最终战的热血程度超越了几乎所有「热血」题材作品的总和'
    },
    content: `<h2>从日常到地狱</h2>
<p>如果你只玩了《Muv-Luv Extra》——那个轻松搞笑的校园恋爱喜剧——你绝对不会想到同一个系列会走向这样的方向。《Unlimited》开始露出冰山一角，《Alternative》则把所有伪装都撕碎了。</p>
<p>世界被 BETA 入侵，人类濒临灭绝。白银武——一个平凡的日本高中生——穿越到了这个<strong>每天都有人在身边死去</strong>的平行世界。</p>
<h2>战争的「真实」</h2>
<p>《Alternative》对战争的描绘是极其残酷的。没有英雄主义，没有无双割草，只有不断的伤亡和令人窒息的绝望。战术机驾驶员是消耗品，被 BETA 吞噬的人类变成了可怕的尸骸。</p>
<p>在这种绝望中，白银武的每一次振作、每一次站起来的决心，都显得无比珍贵。<strong>不是没有恐惧，而是带着恐惧继续前进</strong>——这才是真正的勇气。</p>
<h2>政治与军事</h2>
<p>很多游戏会回避政治描写，但《Alternative》正面面对了它。各国势力在灭亡危机面前依然勾心斗角，日本政府的秘密计划、美国的战略算计——这些政治层面的描写让世界观变得更加立体和真实。</p>
<h2>「人类爱」</h2>
<p>如果用一个词来概括《Alternative》的主题，那就是「人类爱」。这不是什么英雄主义——一个普通少年对伙伴的挂念、不忍心看到更多人死去的那份心情，逐渐扩展成了「无论如何要让人类延续下去」的决意。</p>
<h2>总结</h2>
<p>10 分。它占据 Galgame 评分榜第一的位置长达十年以上是有原因的。《Alternative》重新定义了视觉小说能做到什么高度。玩过它之后，你会发现很多作品的「燃」都显得轻飘飘的。</p>
<p>但需要提醒的是：<strong>请一定按照 Extra → Unlimited → Alternative 的顺序玩</strong>。跳过前两部直接玩 Alternative 等于浪费了整套作品最大的叙事设计。</p>`,
    views: 2156,
  },
  {
    title: '《魔法使之夜》—— 视觉小说「演出」的终极形态',
    summary: '不需要选项、不需要分支，纯粹的「阅读」体验被 Type-Moon 做成了一场华丽的视听盛宴。',
    tags: ['全年龄', '治愈', '同人'],
    rating: 9,
    cover: 'https://picsum.photos/seed/mahoyo/800/400',
    metadata: {
      gameTitle: '魔法使之夜',
      developer: 'Type-Moon',
      playTime: '约 20 小时',
      platform: 'PC / PS4 / Switch',
      year: '2012',
      highlight: '游乐园之战是视觉小说史上最强的「战斗演出」，没有之一'
    },
    content: `<h2>「读」的重新定义</h2>
<p>传统 Galgame 用立绘 + 背景 + 文字来叙事。《魔法使之夜》把这种形式推到了极限——它不是「加了演出效果的视觉小说」，而是<strong>「用视觉小说媒介做的电影」</strong>。</p>
<h2>演出的力量</h2>
<p>《魔法使之夜》没有分支选项，是一条单线故事。但这并不影响它的表现力，因为奈须蘑菇和つくりものじ用演出撑起了一切：</p>
<ul>
<li>文字出现的位置和速度随情绪变化</li>
<li>画面通过上下左右移动来表达场景的动态感</li>
<li>音效和音乐的精妙配合让每一场战斗都充满张力</li>
<li>CG 的切换时机精准到了毫秒级</li>
</ul>
<p>第三场——在游乐园与苍崎青子并肩作战的那个夜晚——是<strong>整个视觉小说史上最好的战斗场面</strong>。文字、画面、音乐三者达到了完美融合。</p>
<h2>三个人的故事</h2>
<p>青子、有珠、草十郎——同居在洋馆中的三个人，每个人都有自己的秘密。故事围绕着魔法的攻防展开，但核心其实很简单：<strong>三个孤独的人如何在这座洋馆中找到彼此的羁绊</strong>。</p>
<p>青子的那句「这并不是为了正义，而是为了夜晚的宁静」完美概括了她的性格——飒爽、果断、不拖泥带水。</p>
<h2>期待与遗憾</h2>
<p>作为「三部曲」的第一部，《魔法使之夜》留下了太多的伏笔。而型月至今没有宣布续作的任何消息。玩家们只能一遍遍重温这部杰作，一边等待那个可能永远不会到来的第二部。</p>
<h2>总结</h2>
<p>9 分。它不是剧情最复杂的 Galgame，也不是最催泪的，但它一定会是<strong>演出最美的</strong>。适合任何对「视觉小说能做成什么样」感兴趣的人。</p>`,
    views: 1698,
  },
]

async function seed() {
  await syncDatabase()
  console.log('数据库已同步，开始生成 Galgame 玩后感 Mock 数据...\n')

  // 创建标签
  const tags = {}
  for (const name of tagData) {
    const [instance] = await Tag.findOrCreate({
      where: { name },
      defaults: { name }
    })
    tags[name] = instance
  }
  console.log(`创建了 ${tagData.length} 个标签\n`)

  // 获取管理员用户
  const admin = await User.findOne({ where: { username: 'admin' } })
  if (!admin) {
    console.error('未找到管理员用户，请先运行 node seed.js 初始化数据库')
    process.exit(1)
  }

  // 创建 Galgame 感想
  for (let i = 0; i < galgameReviews.length; i++) {
    const review = galgameReviews[i]
    const post = await Post.create({
      type: 'galgame',
      title: review.title,
      content: review.content,
      summary: review.summary,
      cover_image: review.cover || null,
      rating: review.rating,
      metadata: review.metadata || null,
      status: 'published',
      views: review.views + Math.floor(Math.random() * 50),
      user_id: admin.id,
    })

    if (review.tags?.length) {
      const tagInstances = review.tags
        .map(name => tags[name])
        .filter(Boolean)
      await post.setTags(tagInstances)
    }

    console.log(`[${i + 1}/${galgameReviews.length}] Galgame 感想: ${review.title}`)
  }

  console.log('\nMock 数据生成完成！')
  console.log(`共创建 ${galgameReviews.length} 篇 Galgame 玩后感`)
  process.exit(0)
}

seed().catch(err => {
  console.error('生成失败:', err.message)
  process.exit(1)
})
