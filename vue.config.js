// vue.config.js
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  
  devServer: {
    // 設置代理
    proxy: {
      // 僅代理以 '/api' 開頭的請求到後端 5000 端口
      '/api': {
        target: 'http://localhost:5000', // <-- 後端 API 端口
        changeOrigin: true
      }
    }
  }
})