import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fetchFantasyPlayers } from './src/lib/sleeper.js'

// Mirrors the Worker's /api/players route so `npm run dev` behaves like production.
function playersApi() {
  let cached = null
  return {
    name: 'players-api',
    configureServer(server) {
      server.middlewares.use('/api/players', async (_req, res) => {
        try {
          cached ??= await fetchFantasyPlayers()
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify(cached))
        } catch (err) {
          res.statusCode = 502
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify({ error: String(err.message ?? err) }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), playersApi()],
})
