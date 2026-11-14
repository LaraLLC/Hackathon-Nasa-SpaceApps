import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/**
 * Caminho do site no GitHub Pages: https://larallc.github.io/Hackathon-Nasa-SpaceApps/
 * ÚNICO lugar onde ele é definido (maiúsculas importam: o Pages diferencia).
 * O app lê o valor em runtime via import.meta.env.BASE_URL (rotas e demo-pack).
 */
export const PAGES_BASE = '/Hackathon-Nasa-SpaceApps/'

// https://vite.dev/config/
// Dev: base "/" e porta fixa (o CORS da API em apps/api/main.py libera só http://localhost:5173 e :3000).
export default defineConfig(({ command }) => ({
  base: command === 'build' ? PAGES_BASE : '/',
  plugins: [react()],
  server: { host: 'localhost', port: 5173, strictPort: true },
}))
