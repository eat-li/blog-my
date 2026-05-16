const aiService = require('../services/aiService')

exports.assist = async (req, res) => {
  const { text, instruction } = req.body

  if (!text || !instruction) {
    return res.status(400).json({ message: '缺少 text 或 instruction 参数' })
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  try {
    for await (const chunk of aiService.stream(text, instruction)) {
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`)
    }
    res.write('data: [DONE]\n\n')
    res.end()
  } catch (err) {
    if (!res.headersSent) {
      res.status(err.status || 500).json({ message: err.message })
    } else {
      res.write(`event: error\ndata: ${JSON.stringify({ message: err.message })}\n\n`)
      res.end()
    }
  }
}

exports.types = (req, res) => {
  res.json(aiService.getInstructionTypes())
}
