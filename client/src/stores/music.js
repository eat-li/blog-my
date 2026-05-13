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
      isPlaying: false,           // 始终默认不播放
      currentTime: 0,
      duration: 0,
      volume: saved?.volume ?? 0.5,
      shuffle: saved?.shuffle ?? false,
      expanded: false,
      configLoaded: false,
      shuffledIndexes: []
    }
  },

  getters: {
    currentSong: (state) => state.songs[state.currentIndex] || null,
    progressPercent: (state) =>
      state.duration ? (state.currentTime / state.duration) * 100 : 0,
    hasSongs: (state) => state.songs.length > 0
  },

  actions: {
    initFromConfig(config) {
      if (!config.music?.songs?.length) return false
      this.songs = config.music.songs
      this.volume = config.music.volume ?? this.volume
      this.shuffle = config.music.shuffle ?? this.shuffle
      if (this.shuffle) this._generateShuffled()
      this.configLoaded = true
      return true
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

    persist() {
      saveState({
        currentIndex: this.currentIndex,
        volume: this.volume,
        shuffle: this.shuffle
      })
    },

    // 播放控制
    setPlaying(val) { this.isPlaying = val },
    setTime(t) { this.currentTime = t },
    setDuration(d) { this.duration = d },

    toggleShuffle() {
      this.shuffle = !this.shuffle
      if (this.shuffle) this._generateShuffled()
      else this.shuffledIndexes = []
      this.persist()
    },

    setVolume(v) {
      this.volume = Math.max(0, Math.min(1, v))
      this.persist()
    },

    selectSong(index) {
      this.currentIndex = index
      this.persist()
    }
  }
})
