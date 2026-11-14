import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// Porta fixa: o CORS da API (apps/api/main.py) libera só http://localhost:5173 e :3000.
export default defineConfig({
  plugins: [react()],
  server: { host: 'localhost', port: 5173, strictPort: true },
})
