import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const isFliping = ref(false)
const phase = ref('fold') // 'fold' | 'unfold'
const currentText = ref('ページをめくる…')

const loadingTexts = [
  'ページをめくる…', 'Loading…', 'しばらくお待ちください…',
  'Now Loading…', '次のシーンへ…', 'ロード中…',
]

let flipTimer = null

export function usePageTransition() {
  const router = useRouter()

  function startFlip() {
    if (isFliping.value) return

    currentText.value = loadingTexts[Math.floor(Math.random() * loadingTexts.length)]
    isFliping.value = true
    phase.value = 'fold'

    clearTimeout(flipTimer)

    // After fold, auto-proceed to unfold
    flipTimer = setTimeout(() => {
      phase.value = 'unfold'
      // After unfold, hide loader
      flipTimer = setTimeout(() => {
        isFliping.value = false
      }, 500)
    }, 600)
  }

  // Watch for route changes
  watch(
    () => router.currentRoute.value.path,
    (newPath, oldPath) => {
      if (oldPath && newPath && oldPath !== newPath) {
        startFlip()
      }
    }
  )

  return {
    isFliping,
    phase,
    currentText,
  }
}
