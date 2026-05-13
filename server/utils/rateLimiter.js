/**
 * 基于内存的滑动窗口频率限制器
 * 用于留言、友链申请等公开接口的防刷
 */
class RateLimiter {
  /**
   * @param {Array<{name: string, windowMs: number, max: number}>} rules 限制规则
   */
  constructor(rules) {
    this.rules = rules
    this.store = new Map() // key: "ruleName:ip" → timestamps[]
  }

  /**
   * 检查是否允许请求，返回 { allowed, retryAfter?, message? }
   */
  check(key) {
    const now = Date.now()

    for (const rule of this.rules) {
      const storeKey = `${rule.name}:${key}`
      let timestamps = (this.store.get(storeKey) || [])
        .filter(t => t > now - rule.windowMs)
      this.store.set(storeKey, timestamps)

      if (timestamps.length >= rule.max) {
        const retryAfter = Math.ceil((timestamps[0] + rule.windowMs - now) / 1000)
        return {
          allowed: false,
          retryAfter,
          message: `操作太频繁，请 ${retryAfter} 秒后再试`
        }
      }
    }

    // 所有规则通过，记录时间戳
    for (const rule of this.rules) {
      const storeKey = `${rule.name}:${key}`
      const timestamps = this.store.get(storeKey) || []
      timestamps.push(now)
      this.store.set(storeKey, timestamps)
    }

    return { allowed: true }
  }

  /**
   * 清空指定 key 的限制记录（仅测试用）
   */
  clear(key) {
    for (const rule of this.rules) {
      this.store.delete(`${rule.name}:${key}`)
    }
  }

  /**
   * 清空全部记录
   */
  clearAll() {
    this.store.clear()
  }
}

module.exports = RateLimiter
