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

    // 定时清理过期条目，防止内存无限增长
    // 取最小窗口的 1/5 作为清理间隔，但最少 30 秒
    const minWindow = Math.min(...rules.map(r => r.windowMs))
    const cleanupInterval = Math.max(minWindow / 5, 30 * 1000)
    this._cleanupTimer = setInterval(() => this._cleanup(), cleanupInterval)
    this._cleanupTimer.unref() // 不阻止进程退出
  }

  /**
   * 内部清理：移除所有已过期的 timestamp 条目
   */
  _cleanup() {
    const now = Date.now()
    for (const [storeKey, timestamps] of this.store) {
      // 从 storeKey 中提取 rule name，找到对应窗口
      const ruleName = storeKey.split(':')[0]
      const rule = this.rules.find(r => r.name === ruleName)
      if (!rule) {
        this.store.delete(storeKey)
        continue
      }
      const alive = timestamps.filter(t => t > now - rule.windowMs)
      if (alive.length === 0) {
        this.store.delete(storeKey)
      } else {
        this.store.set(storeKey, alive)
      }
    }
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
