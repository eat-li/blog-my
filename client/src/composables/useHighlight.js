import { watch, nextTick } from 'vue'
import hljs from 'highlight.js/lib/core'

// 按需注册常用语言，减小打包体积
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import css from 'highlight.js/lib/languages/css'
import xml from 'highlight.js/lib/languages/xml'
import json from 'highlight.js/lib/languages/json'
import bash from 'highlight.js/lib/languages/bash'
import sql from 'highlight.js/lib/languages/sql'
import go from 'highlight.js/lib/languages/go'
import rust from 'highlight.js/lib/languages/rust'
import cpp from 'highlight.js/lib/languages/cpp'
import csharp from 'highlight.js/lib/languages/csharp'
import php from 'highlight.js/lib/languages/php'
import ruby from 'highlight.js/lib/languages/ruby'
import shell from 'highlight.js/lib/languages/shell'
import yaml from 'highlight.js/lib/languages/yaml'
import markdown from 'highlight.js/lib/languages/markdown'
import dockerfile from 'highlight.js/lib/languages/dockerfile'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('py', python)
hljs.registerLanguage('java', java)
hljs.registerLanguage('css', css)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('json', json)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('sh', bash)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('go', go)
hljs.registerLanguage('rust', rust)
hljs.registerLanguage('rs', rust)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('c', cpp)
hljs.registerLanguage('csharp', csharp)
hljs.registerLanguage('cs', csharp)
hljs.registerLanguage('php', php)
hljs.registerLanguage('ruby', ruby)
hljs.registerLanguage('rb', ruby)
hljs.registerLanguage('shell', shell)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('yml', yaml)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('md', markdown)
hljs.registerLanguage('dockerfile', dockerfile)

/**
 * 为代码块添加一键复制按钮
 */
function addCopyButton(pre) {
  if (pre.querySelector('.copy-btn')) return
  const btn = document.createElement('button')
  btn.className = 'copy-btn'
  btn.textContent = '复制'
  btn.addEventListener('click', () => {
    const code = pre.querySelector('code')
    if (!code) return
    navigator.clipboard.writeText(code.innerText).then(() => {
      btn.textContent = '已复制'
      btn.classList.add('copied')
      setTimeout(() => {
        btn.textContent = '复制'
        btn.classList.remove('copied')
      }, 2000)
    })
  })
  pre.style.position = 'relative'
  pre.appendChild(btn)
}

/**
 * 对容器内的 pre code 代码块做语法高亮 + 添加复制按钮
 * @param {import('vue').Ref<HTMLElement|null>} containerRef - 内容容器的模板 ref
 * @param {import('vue').Ref<string|undefined>} [contentRef] - 可选，内容 HTML 的 ref，用于 watch 触发
 */
export function useHighlight(containerRef, contentRef) {
  function highlight() {
    nextTick(() => {
      const el = containerRef.value
      if (!el) return
      el.querySelectorAll('pre code').forEach(block => {
        if (!block.dataset.highlighted) {
          hljs.highlightElement(block)
          block.dataset.highlighted = 'true'
        }
        addCopyButton(block.parentElement)
      })
    })
  }

  if (contentRef) {
    watch(contentRef, highlight, { flush: 'post' })
  }

  return { highlight }
}
