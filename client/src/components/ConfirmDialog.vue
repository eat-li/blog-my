<script setup>
import { watch } from 'vue'
import { useConfirm } from '../composables/useConfirm'

const { dialogState: state } = useConfirm()

function handleConfirm() {
  state.visible = false
  if (state.type === 'prompt') {
    state.resolve?.(state.inputValue)
  } else {
    state.resolve?.(true)
  }
}

function handleCancel() {
  state.visible = false
  if (state.type === 'prompt') {
    state.resolve?.(null)
  } else {
    state.resolve?.(false)
  }
}

function onOverlayClick(e) {
  // alert 模式不允许点遮罩关闭
  if (state.type !== 'alert') {
    handleCancel()
  }
}

// Esc 关闭（非 alert 模式）
function onKeydown(e) {
  if (!state.visible) return
  if (e.key === 'Escape' && state.type !== 'alert') {
    handleCancel()
  }
  if (e.key === 'Enter' && state.visible) {
    handleConfirm()
  }
}

watch(() => state.visible, (v) => {
  if (v) {
    document.addEventListener('keydown', onKeydown)
    // 自动聚焦输入框
    setTimeout(() => {
      const input = document.querySelector('.confirm-input')
      input?.focus()
    }, 100)
  } else {
    document.removeEventListener('keydown', onKeydown)
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="confirm">
      <div v-if="state.visible" class="confirm-overlay" @click.self="onOverlayClick">
        <div class="confirm-dialog glass-card">
          <!-- 图标 -->
          <div class="confirm-icon" :class="`confirm-icon--${state.type}`">
            <template v-if="state.type === 'alert'">✦</template>
            <template v-else-if="state.type === 'prompt'">✎</template>
            <template v-else>？</template>
          </div>

          <!-- 标题 -->
          <h3 v-if="state.title" class="confirm-title">{{ state.title }}</h3>

          <!-- 消息 -->
          <p class="confirm-message">{{ state.message }}</p>

          <!-- 输入框（prompt 模式） -->
          <input
            v-if="state.type === 'prompt'"
            v-model="state.inputValue"
            class="glass-input confirm-input"
            type="text"
            @keyup.enter="handleConfirm"
          />

          <!-- 按钮 -->
          <div class="confirm-actions">
            <button
              v-if="state.type !== 'alert'"
              class="glass-btn confirm-cancel"
              @click="handleCancel"
            >取消</button>
            <button class="glass-btn confirm-ok" @click="handleConfirm">确定</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);
}

.confirm-dialog {
  width: 400px;
  max-width: 90vw;
  padding: 36px 32px 28px;
  text-align: center;
  border-radius: var(--radius-lg);
}

.confirm-icon {
  width: 52px;
  height: 52px;
  margin: 0 auto 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-family: var(--font-serif);
}

.confirm-icon--alert {
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.12), rgba(139, 69, 19, 0.04));
  color: var(--color-primary);
}

.confirm-icon--confirm {
  background: linear-gradient(135deg, rgba(232, 91, 91, 0.12), rgba(232, 91, 91, 0.04));
  color: var(--color-accent-anime);
}

.confirm-icon--prompt {
  background: linear-gradient(135deg, rgba(123, 168, 114, 0.12), rgba(123, 168, 114, 0.04));
  color: var(--color-accent-galgame);
}

.confirm-title {
  font-family: var(--font-serif);
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--color-text);
}

.confirm-message {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: 24px;
  white-space: pre-wrap;
}

.confirm-input {
  width: 100%;
  margin-bottom: 20px;
  font-size: 14px;
  padding: 10px 14px;
  text-align: left;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.confirm-actions .glass-btn {
  padding: 10px 28px;
  font-size: 14px;
  min-width: 100px;
}

.confirm-cancel {
  opacity: 0.6;
}

.confirm-cancel:hover {
  opacity: 1;
}

.confirm-ok {
  color: var(--color-white);
  background: var(--color-primary);
  border: none;
}

.confirm-ok:hover {
  background: var(--color-primary-light);
}

/* 过渡动画 */
.confirm-enter-active,
.confirm-leave-active {
  transition: all 0.25s ease;
}

.confirm-enter-active .confirm-dialog,
.confirm-leave-active .confirm-dialog {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.confirm-enter-from {
  opacity: 0;
}

.confirm-enter-from .confirm-dialog {
  opacity: 0;
  transform: scale(0.9) translateY(16px);
}

.confirm-leave-to {
  opacity: 0;
}

.confirm-leave-to .confirm-dialog {
  opacity: 0;
  transform: scale(0.9) translateY(16px);
}
</style>
