import { defineStore } from 'pinia'
import request from '../utils/request'

export const useBlogStore = defineStore('blog', {
  state: () => ({
    posts: [],
    total: 0,
    currentPost: null,
    categories: [],
    tags: [],
    loading: false
  }),
  actions: {
    async fetchPosts(params = {}) {
      this.loading = true
      try {
        const res = await request.get('/posts', { params })
        this.posts = res.posts || res.rows || []
        this.total = res.total || res.count || 0
      } finally {
        this.loading = false
      }
    },
    async fetchPost(id) {
      this.loading = true
      try {
        const res = await request.get(`/posts/${id}`)
        this.currentPost = res.post || res
      } finally {
        this.loading = false
      }
    },
    async fetchCategories() {
      const res = await request.get('/categories')
      this.categories = res.categories || res
    },
    async fetchTags() {
      const res = await request.get('/tags')
      this.tags = res.tags || res
    }
  }
})
