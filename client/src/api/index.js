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
  delete: (id) => request.delete(`/messages/${id}`)
}

export const configApi = {
  getPublic: () => request.get('/config/public'),
  get: (key) => request.get(`/config/${key}`),
  update: (key, value) => request.put(`/config/${key}`, { value })
}

export const githubApi = {
  repos: () => request.get('/github/repos'),
  user: () => request.get('/github/user')
}

export const statsApi = {
  profile: () => request.get('/stats/profile'),
  yearly: (year) => request.get('/stats/yearly', { params: { year } })
}

export const friendlinkApi = {
  list: () => request.get('/friendlinks'),
  adminList: (params) => request.get('/friendlinks/admin', { params }),
  create: (data) => request.post('/friendlinks', data),
  update: (id, data) => request.put(`/friendlinks/${id}`, data),
  delete: (id) => request.delete(`/friendlinks/${id}`)
}

export const uploadApi = {
  file: (formData, onProgress) => request.post('/upload/file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
  }),
  presigned: (dir, filename) => request.post('/upload/presigned', { dir, filename }),
  signature: (dir) => request.post('/upload/signature', { dir }),
  image: (data) => request.post('/upload/image', data),
  delete: (key) => request.delete('/upload/image', { data: { key } }),
  audio: (data) => request.post('/upload/audio', data),
  deleteAudio: (key) => request.delete('/upload/audio', { data: { key } })
}
