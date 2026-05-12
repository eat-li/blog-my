const { Config } = require('../models')

let reposCache = null
let userCache = null
let cacheTime = 0
const CACHE_TTL = 60 * 60 * 1000

class GithubService {
  async _fetch(url) {
    const headers = { 'User-Agent': 'blog-saki/1.0', Accept: 'application/vnd.github.v3+json' }
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
    }
    return fetch(url, { headers, signal: AbortSignal.timeout(8000) })
  }

  async getRepos() {
    if (reposCache && Date.now() - cacheTime < CACHE_TTL) {
      return reposCache
    }

    try {
      const config = await Config.findOne({ where: { key: 'github_config' } })
      if (!config || !config.value?.username) {
        return []
      }

      const { username, repo_count = 6 } = config.value
      const response = await this._fetch(
        `https://api.github.com/users/${username}/repos?sort=stars&per_page=${repo_count}`
      )

      if (!response.ok) {
        throw new Error(`GitHub API ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const repos = (Array.isArray(data) ? data : [])
        .filter(repo => !repo.fork)
        .slice(0, repo_count)
        .map(repo => ({
          id: repo.id,
          name: repo.name,
          description: repo.description,
          html_url: repo.html_url,
          stars: repo.stargazers_count,
          language: repo.language,
          updated_at: repo.updated_at
        }))

      reposCache = repos
      cacheTime = Date.now()
      return repos
    } catch (err) {
      console.error('GitHub repos 获取失败:', err.message)
      // 有缓存就返回旧缓存
      if (reposCache) return reposCache
      return []
    }
  }

  async getUser() {
    if (userCache && Date.now() - cacheTime < CACHE_TTL) {
      return userCache
    }

    try {
      const config = await Config.findOne({ where: { key: 'github_config' } })
      if (!config || !config.value?.username) {
        return null
      }

      const response = await this._fetch(
        `https://api.github.com/users/${config.value.username}`
      )

      if (!response.ok) {
        throw new Error(`GitHub API ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const user = {
        login: data.login,
        avatar_url: data.avatar_url,
        html_url: data.html_url,
        bio: data.bio,
        public_repos: data.public_repos,
        followers: data.followers
      }

      userCache = user
      cacheTime = Date.now()
      return user
    } catch (err) {
      console.error('GitHub user 获取失败:', err.message)
      if (userCache) return userCache
      return null
    }
  }
}

module.exports = new GithubService()
