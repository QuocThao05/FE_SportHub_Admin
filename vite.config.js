import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server : {
      port: 5175, // 🔥 Đổi port ở đây (ví dụ: 5175)
  }
})
