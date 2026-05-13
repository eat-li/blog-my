const xss = require('xss')

const xssOptions = {
  whiteList: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    p: [], div: [], span: [], br: [],
    h1: [], h2: [], h3: [], h4: [], h5: [], h6: [],
    ul: [], ol: [], li: [],
    blockquote: [], pre: [], code: [],
    strong: [], em: [], u: [], s: [], del: [],
    table: [], thead: [], tbody: [], tr: [], th: [], td: [],
    hr: [],
    // 前端编辑器可能产生的标签
    section: [], article: [], header: [], footer: [],
    font: ['color', 'size'], b: [], i: [],
    // 代码块相关
    'hljs-comment': [], 'hljs-keyword': [], 'hljs-string': []
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style']
}

function sanitize(input) {
  if (!input || typeof input !== 'string') return input || ''
  return xss(input, xssOptions)
}

module.exports = { sanitize }
