import request from '../utils/request'

export const postApi = {
  list: (params) => request.get('/posts', { params }),
  detail: (id) => request.get(`/posts/${id}`),
  create: (data) => request.post('/posts', data),
  update: (id, data) => request.put(`/posts/${id}`, data),
  delete: (id) => request.delete(`/posts/${id}`),
  view: (id) => request.post(`/posts/${id}/view`),
  latest: () => request.get('/posts/latest'),
  heatmap: () => request.get('/posts/heatmap')
}

export const authApi = {
  login: (data) => request.post('/auth/login', data),
  logout: () => request.post('/auth/logout'),
  me: () => request.get('/auth/me')
}

export const categoryApi = {
  list: () => request.get('/categories'),
  create: (data) => request.post('/categories', data),
  update: (id, data) => request.put(`/categories/${id}`, data),
  delete: (id) => request.delete(`/categories/${id}`)
}

export const tagApi = {
  list: () => request.get('/tags'),
  create: (data) => request.post('/tags', data),
  delete: (id) => request.delete(`/tags/${id}`)
}

export const messageApi = {
  list: (params) => request.get('/messages', { params }),
  create: (data) => request.post('/messages', data),
  adminList: (params) => request.get('/messages/admin', { params }),
  review: (id, status) => request.put(`/messages/${id}/review`, { status }),
  reply: (id, content) => request.post(`/messages/${id}/reply`, { content }),
  delete: (id) => request.delete(`/messages/${id}`)
}

export const configApi = {
  getPublic: () => request.get('/config/public'),
  get: (key) => request.get(`/config/${key}`),
  update: (key, value) => request.put(`/config/${key}`, { value })
}

export const statsApi = {
  profile: () => request.get('/stats/profile'),
  yearly: (year) => request.get('/stats/yearly', { params: { year } })
}

export const friendlinkApi = {
  list: () => request.get('/friendlinks'),
  apply: (data) => request.post('/friendlinks/apply', data),
  adminList: (params) => request.get('/friendlinks/admin', { params }),
  create: (data) => request.post('/friendlinks', data),
  update: (id, data) => request.put(`/friendlinks/${id}`, data),
  delete: (id) => request.delete(`/friendlinks/${id}`)
}

export const quoteApi = {
  list: () => request.get('/quotes'),
  adminList: (params) => request.get('/quotes/admin', { params }),
  create: (data) => request.post('/quotes', data),
  update: (id, data) => request.put(`/quotes/${id}`, data),
  delete: (id) => request.delete(`/quotes/${id}`)
}

export const announcementApi = {
  active: () => request.get('/announcements'),
  adminList: (params) => request.get('/announcements/admin', { params }),
  create: (data) => request.post('/announcements', data),
  update: (id, data) => request.put(`/announcements/${id}`, data),
  delete: (id) => request.delete(`/announcements/${id}`)
}

export const diaryApi = {
  list: (params) => request.get('/diaries', { params }),
  detail: (id) => request.get(`/diaries/${id}`),
  adminList: (params) => request.get('/diaries/admin/list', { params }),
  create: (data) => request.post('/diaries', data),
  update: (id, data) => request.put(`/diaries/${id}`, data),
  delete: (id) => request.delete(`/diaries/${id}`)
}

export const galleryApi = {
  list: () => request.get('/gallery'),
  adminList: (params) => request.get('/gallery/admin', { params }),
  create: (data) => request.post('/gallery', data),
  update: (id, data) => request.put(`/gallery/${id}`, data),
  delete: (id) => request.delete(`/gallery/${id}`)
}

export const uploadApi = {
  file: (formData, onProgress) => request.post('/upload/file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000,
    onUploadProgress: onProgress
  }),
  presigned: (dir, filename) => request.post('/upload/presigned', { dir, filename }),
  image: (data) => request.post('/upload/image', data, { timeout: 120000 }),
  delete: (key) => request.delete('/upload/image', { data: { key } }),
  audio: (data) => request.post('/upload/audio', data, { timeout: 300000 }),
  deleteAudio: (key) => request.delete('/upload/audio', { data: { key } })
}
