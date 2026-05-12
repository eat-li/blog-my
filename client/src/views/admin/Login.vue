<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const form = ref({ username: '', password: '' })
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  if (!form.value.username || !form.value.password) {
    error.value = '请填写用户名和密码'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await auth.login(form.value.username, form.value.password)
    router.push('/admin')
  } catch (e) {
    error.value = e.response?.data?.message || '登录失败'
  } finally {
    loading.value = false
  }
}

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="login-page">
    <div class="login-card glass-card">
      <div class="login-header">
        <div class="login-icon">✦</div>
        <h1 class="login-title">EatLi</h1>
        <p class="login-subtitle">管理后台</p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-field">
          <label class="form-label">用户名</label>
          <input
            v-model="form.username"
            class="glass-input"
            type="text"
            placeholder="请输入用户名"
            autocomplete="username"
          />
        </div>

        <div class="form-field">
          <label class="form-label">密码</label>
          <input
            v-model="form.password"
            class="glass-input"
            type="password"
            placeholder="请输入密码"
            autocomplete="current-password"
          />
        </div>

        <p v-if="error" class="form-error">{{ error }}</p>

        <button type="submit" class="glass-btn login-btn" :disabled="loading">
          {{ loading ? '登录中…' : '登录' }}
        </button>
      </form>

      <button class="back-link glass-btn" @click="goHome">
        ← 返回首页
      </button>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 40px 32px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-icon {
  font-size: 36px;
  color: var(--color-primary);
  margin-bottom: 12px;
  animation: loginIconFloat 3s ease-in-out infinite;
}

@keyframes loginIconFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.login-title {
  font-family: var(--font-serif);
  font-size: 28px;
  font-weight: 900;
  margin-bottom: 4px;
  color: var(--color-text);
}

.login-subtitle {
  font-size: 14px;
  color: var(--color-text-muted);
}

/* 表单 */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.form-error {
  font-size: 13px;
  color: var(--color-accent-anime);
  text-align: center;
}

.login-btn {
  width: 100%;
  padding: 12px;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-white);
  background: var(--color-primary);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
}

.login-btn:hover {
  background: var(--color-primary-light);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(139, 69, 19, 0.3);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.back-link {
  width: 100%;
  margin-top: 16px;
  padding: 10px;
  font-size: 13px;
  justify-content: center;
}
</style>
