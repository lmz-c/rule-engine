import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router', 'pinia']
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    })
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://192.168.152.125:8080',
        changeOrigin: true,
        configure: (proxy, options) => {
          console.log('✅ Vite 代理已配置:', options.target)
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})