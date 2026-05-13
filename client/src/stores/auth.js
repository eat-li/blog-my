import { defineStore } from 'pinia'
import request from '../utils/request'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    checked: false
  }),
  getters: {
    isLoggedIn: (state) => !!state.user
  },
  actions: {
    async login(username, password) {
      const res = await request.post('/auth/login', { username, password })
      this.user = res.user
      return res
    },
    async checkAuth() {
      try {
        const res = await request.get('/auth/me')
        this.user = res.user
      } catch {
        this.user = null
      } finally {
        this.checked = true
      }
    },
    async logout() {
      try {
        await request.post('/auth/logout')
      } catch {
        // 即使请求失败也要清除本地状态
      }
      this.user = null
      this.checked = false
    }
  }
})
