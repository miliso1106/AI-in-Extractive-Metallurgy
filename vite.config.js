import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { OPENROUTER_BASE_URL, buildPrompt, extractFirstJsonObject } from './api/openrouter.shared.js'

const openRouterDev = () => ({
  name: 'openrouter-dev',
  configureServer(server) {
    server.middlewares.use('/api/openrouter', async (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'Method not allowed' }))
        return
      }

      const apiKey = process.env.OPENROUTER_API_KEY
      if (!apiKey) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'OPENROUTER_API_KEY is not set on the server.' }))
        return
      }

      let body = ''
      req.on('data', (chunk) => { body += chunk })
      req.on('end', async () => {
        try {
          const parsedBody = JSON.parse(body || '{}')
          const { task, payload } = parsedBody
          const prompt = buildPrompt(task, payload || {})
          if (!prompt) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Invalid task' }))
            return
          }

          const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'openrouter/auto',
              messages: [
                { role: 'system', content: prompt.system },
                { role: 'user', content: prompt.user },
              ],
            }),
          })

          const data = await response.json()
          const content = data?.choices?.[0]?.message?.content || ''

          if (task === 'dataset_insights') {
            const structured = extractFirstJsonObject(content)
            if (!structured || !structured.columns || !structured.rows) {
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: false, raw: content }))
              return
            }
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true, data: structured }))
            return
          }

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ ok: true, data: content }))
        } catch (error) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Failed to call AI/ML service.' }))
        }
      })
    })
  },
})

export default defineConfig({
  plugins: [react(), openRouterDev()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          charts: ['recharts'],
          icons: ['lucide-react'],
        },
      },
    },
  },
})

