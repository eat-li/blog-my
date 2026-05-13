module.exports = {
  apps: [{
    name: 'blog-server',
    script: 'app.js',
    cwd: __dirname,
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production'
    },
    // 日志配置
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: '../logs/error.log',
    out_file: '../logs/out.log',
    merge_logs: true,
    // 自动重启（内存超过 300M 时）
    max_memory_restart: '300M',
    // 监听文件变更自动重启（生产环境可关闭）
    watch: false,
    // 崩溃自动重启
    autorestart: true,
    // 启动失败重试
    max_restarts: 10,
    restart_delay: 4000
  }]
}
