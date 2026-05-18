/**
 * 全局错误处理中间件
 * - 5xx：记录完整堆栈（服务器内部问题）
 * - 4xx：仅记录消息（客户端请求问题）
 */
function errorHandler(err, req, res, next) {
  const status = err.status || 500
  if (status >= 500) {
    console.error(`[${status}] ${err.message}\n${err.stack}`)
  } else {
    console.warn(`[${status}] ${err.message}`)
  }
  res.status(status).json({
    message: err.message || '服务器内部错误'
  })
}

module.exports = errorHandler
