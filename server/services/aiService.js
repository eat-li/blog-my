const AI_API_URL = process.env.AI_API_URL || 'https://api.deepseek.com/v1'
const AI_API_KEY = process.env.AI_API_KEY
const AI_MODEL = process.env.AI_MODEL || 'deepseek-chat'

const INSTRUCTIONS = {
  polish: {
    label: '润色',
    system: '你是一个专业的中文写作助手。请润色以下文字，保持原意不变，但让表达更优美、流畅、有文采。只返回润色后的文字，不要添加任何解释或额外内容。',
  },
  expand: {
    label: '扩写',
    system: '你是一个专业的中文写作助手。请对以下文字进行扩写，丰富细节和论述，让内容更充实、更有深度。保持原文的风格和主题方向。只返回扩写后的文字，不要添加任何解释。',
  },
  shorten: {
    label: '缩写',
    system: '你是一个专业的中文写作助手。请将以下文字精简压缩，去掉冗余表达，保留核心观点。只返回缩写后的文字，不要添加任何解释。',
  },
  translate: {
    label: '翻译',
    system: '你是一个专业的翻译助手。请判断以下文字的语言，如果是中文则翻译为英文，如果是英文则翻译为中文。保持原文的语气和风格。只返回翻译结果，不要添加任何解释。',
  },
}

class AiService {
  getInstructionTypes() {
    return Object.entries(INSTRUCTIONS).map(([key, val]) => ({
      value: key,
      label: val.label,
    }))
  }

  async *stream(text, instruction) {
    if (!AI_API_KEY) {
      throw Object.assign(new Error('未配置 AI_API_KEY'), { status: 500 })
    }

    const inst = INSTRUCTIONS[instruction]
    if (!inst) {
      throw Object.assign(new Error('无效的指令类型'), { status: 400 })
    }

    if (!text?.trim()) {
      throw Object.assign(new Error('文本不能为空'), { status: 400 })
    }

    if (text.length > 5000) {
      throw Object.assign(new Error('文本长度不能超过 5000 字'), { status: 400 })
    }

    const response = await fetch(`${AI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        stream: true,
        messages: [
          { role: 'system', content: inst.system },
          { role: 'user', content: text },
        ],
      }),
    })

    if (!response.ok) {
      const errBody = await response.text().catch(() => '')
      throw Object.assign(new Error(`AI API 请求失败: ${response.status} ${errBody}`), {
        status: 502,
      })
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue
        const data = trimmed.slice(6)
        if (data === '[DONE]') return

        try {
          const parsed = JSON.parse(data)
          const content = parsed.choices?.[0]?.delta?.content
          if (content) yield content
        } catch {
          // 跳过解析失败的行
        }
      }
    }
  }
}

module.exports = new AiService()
