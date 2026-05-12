<script setup>
</script>

<template>
  <div class="page notfound-page">
    <div class="notfound-card glass-card">
      <div class="notfound-code">404</div>
      <h1 class="notfound-title">这条路线没有剧情分支…</h1>
      <p class="notfound-desc">你似乎走到了一个尚未开放的区域，这里空无一人。</p>
      <router-link to="/" class="glass-btn notfound-btn">
        ← 回标题画面
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.notfound-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding-top: 20px;
}

.notfound-card {
  max-width: 480px;
  width: 100%;
  text-align: center;
  padding: 56px 40px;
}

.notfound-code {
  font-family: var(--font-serif);
  font-size: 80px;
  font-weight: 900;
  line-height: 1;
  color: var(--color-primary);
  opacity: 0.3;
  margin-bottom: 16px;
}

.notfound-title {
  font-size: 22px;
  margin-bottom: 12px;
}

.notfound-desc {
  font-size: 15px;
  color: var(--color-text-secondary);
  margin-bottom: 32px;
}

.notfound-btn {
  font-size: 14px;
  padding: 12px 28px;
}
</style>
