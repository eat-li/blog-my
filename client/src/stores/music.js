import { defineStore } from 'pinia'

const STORAGE_KEY = 'music_state'

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return null
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      currentIndex: state.currentIndex,
      volume: state.volume,
      shuffle: state.shuffle
    }))
  } catch { /* quota exceeded */ }
}

export const useMusicStore = defineStore('music', {
  state: () => {
    const saved = loadState()
    return {
      songs: [],
      currentIndex: saved?.currentIndex ?? 0,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: saved?.volume ?? 0.5,
      shuffle: saved?.shuffle ?? false,
      expanded: false,
      configLoaded: false,
      shuffledIndexes: [],
      // Audio 单例引用（不存 state，但放这里方便访问）
      _audio: null,
      _eventsBound: false
    }
  },

  getters: {
    currentSong: (state) => state.songs[state.currentIndex] || null,
    progressPercent: (state) =>
      state.duration ? (state.currentTime / state.duration) * 100 : 0,
    hasSongs: (state) => state.songs.length > 0
  },

  actions: {
    // ---- 初始化 ----
    initFromConfig(config) {
      if (!config.music?.songs?.length) return false
      this.songs = config.music.songs
      this.volume = config.music.volume ?? this.volume
      this.shuffle = config.music.shuffle ?? this.shuffle
      if (this.shuffle) this._generateShuffled()
      this.configLoaded = true
      return true
    },

    // ---- Audio 单例 ----
    _getAudio() {
      if (!this._audio) {
        this._audio = new Audio()
        this._audio.volume = this.volume
      }
      return this._audio
    },

    _bindAudioEvents() {
      if (this._eventsBound) return
      const audio = this._getAudio()
      audio.addEventListener('timeupdate', this._onTimeUpdate)
      audio.addEventListener('ended', this._onEnded)
      audio.addEventListener('error', this._onError)
      audio.addEventListener('play', this._onPlay)
      audio.addEventListener('pause', this._onPause)
      this._eventsBound = true
    },

    _unbindAudioEvents() {
      if (!this._audio || !this._eventsBound) return
      this._audio.removeEventListener('timeupdate', this._onTimeUpdate)
      this._audio.removeEventListener('ended', this._onEnded)
      this._audio.removeEventListener('error', this._onError)
      this._audio.removeEventListener('play', this._onPlay)
      this._audio.removeEventListener('pause', this._onPause)
      this._eventsBound = false
    },

    _onTimeUpdate() {
      const store = useMusicStore()
      store.currentTime = store._audio.currentTime
    },
    _onEnded() {
      useMusicStore().next()
    },
    _onError() {
      const store = useMusicStore()
      setTimeout(() => { if (store.songs.length) store.next() }, 1000)
    },
    _onPlay() {
      useMusicStore().isPlaying = true
    },
    _onPause() {
      useMusicStore().isPlaying = false
    },

    // ---- 播放控制 ----
    _loadSong(index) {
      if (!this.songs[index]) return
      this.currentIndex = index
      const audio = this._getAudio()
      audio.src = this.songs[index].url
      audio.load()
      this.persist()
    },

    playSong(index) {
      this._bindAudioEvents()
      this._loadSong(index)
      this._getAudio().play().catch(() => {})
    },

    togglePlay() {
      if (!this.currentSong) return
      const audio = this._getAudio()
      if (this.isPlaying) {
        audio.pause()
      } else {
        audio.play().catch(() => {})
      }
    },

    next() {
      if (!this.songs.length) return
      if (this.shuffle && this.shuffledIndexes.length) {
        const pos = this.shuffledIndexes.indexOf(this.currentIndex)
        const nextPos = (pos + 1) % this.shuffledIndexes.length
        this.playSong(this.shuffledIndexes[nextPos])
      } else {
        this.playSong((this.currentIndex + 1) % this.songs.length)
      }
    },

    prev() {
      if (!this.songs.length) return
      if (this.shuffle && this.shuffledIndexes.length) {
        const pos = this.shuffledIndexes.indexOf(this.currentIndex)
        const prevPos = (pos - 1 + this.shuffledIndexes.length) % this.shuffledIndexes.length
        this.playSong(this.shuffledIndexes[prevPos])
      } else {
        this.playSong((this.currentIndex - 1 + this.songs.length) % this.songs.length)
      }
    },

    seekTo(percent) {
      const audio = this._getAudio()
      audio.currentTime = percent * this.duration
    },

    setVolume(v) {
      this.volume = Math.max(0, Math.min(1, v))
      if (this._audio) this._audio.volume = this.volume
      this.persist()
    },

    toggleShuffle() {
      this.shuffle = !this.shuffle
      if (this.shuffle) this._generateShuffled()
      else this.shuffledIndexes = []
      this.persist()
    },

    _generateShuffled() {
      const n = this.songs.length
      const arr = Array.from({ length: n }, (_, i) => i)
      for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
      }
      this.shuffledIndexes = arr
    },

    // 供组件在 onMounted 时调用，确保 Audio 准备好
    initAudio() {
      this._bindAudioEvents()
      if (this.songs.length && !this._getAudio().src) {
        this._loadSong(this.currentIndex)
      }
    },

    destroyAudio() {
      this._unbindAudioEvents()
      if (this._audio) {
        this._audio.pause()
        this._audio = null
      }
    },

    persist() {
      saveState({
        currentIndex: this.currentIndex,
        volume: this.volume,
        shuffle: this.shuffle
      })
    },

    // 兼容旧接口
    selectSong(index) {
      this.currentIndex = index
      this.persist()
    },
    setPlaying(val) { this.isPlaying = val },
    setTime(t) { this.currentTime = t },
    setDuration(d) { this.duration = d },
  }
})
