<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  text: { type: String, required: true },
  speed: { type: Number, default: 80 },
  loop: { type: Boolean, default: false },
})

const displayText = ref('')
const showCursor = ref(true)
let timer = null
let cursorTimer = null

function type() {
  displayText.value = ''
  let i = 0

  function step() {
    if (i < props.text.length) {
      displayText.value += props.text.charAt(i)
      i++
      timer = setTimeout(step, props.speed + Math.random() * 40)
    } else if (props.loop) {
      timer = setTimeout(erase, 3000)
    }
  }

  step()
}

function erase() {
  let i = displayText.value.length
  function step() {
    if (i > 0) {
      displayText.value = displayText.value.slice(0, -1)
      i--
      timer = setTimeout(step, props.speed * 0.4)
    } else {
      timer = setTimeout(type, 800)
    }
  }
  step()
}

onMounted(() => {
  type()
  cursorTimer = setInterval(() => { showCursor.value = !showCursor.value }, 530)
})

onUnmounted(() => {
  clearTimeout(timer)
  clearInterval(cursorTimer)
})

watch(() => props.text, () => {
  clearTimeout(timer)
  type()
})
</script>

<template>
  <span class="typewriter">
    <span class="typewriter-text">{{ displayText }}</span>
    <span class="typewriter-cursor" :class="{ 'typewriter-cursor--hidden': !showCursor }">█</span>
  </span>
</template>

<style scoped>
.typewriter {
  display: inline;
}

.typewriter-text {
  color: var(--color-text-secondary);
}

.typewriter-cursor {
  display: inline-block;
  color: var(--color-primary);
  margin-left: 1px;
  font-weight: 400;
}

.typewriter-cursor--hidden {
  visibility: hidden;
}
</style>
