import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

const DATA_DIR = path.resolve(__dirname, 'data')
const CANVAS_FILE = path.join(DATA_DIR, 'canvas.json')

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', chunk => { raw += chunk })
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : null) }
      catch (e) { reject(e) }
    })
    req.on('error', reject)
  })
}

function canvasApiPlugin() {
  return {
    name: 'canvas-api',
    configureServer(server) {
      server.middlewares.use('/api/canvas/load', (req, res, next) => {
        if (req.method !== 'GET') return next()
        res.setHeader('Content-Type', 'application/json')
        try {
          if (!fs.existsSync(CANVAS_FILE)) {
            res.end(JSON.stringify({ data: null }))
            return
          }
          const raw = fs.readFileSync(CANVAS_FILE, 'utf-8')
          const data = raw ? JSON.parse(raw) : null
          res.end(JSON.stringify({ data }))
        } catch (e) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: String(e) }))
        }
      })

      server.middlewares.use('/api/canvas/save', async (req, res, next) => {
        if (req.method !== 'POST') return next()
        res.setHeader('Content-Type', 'application/json')
        try {
          const body = await readJsonBody(req)
          if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
          fs.writeFileSync(CANVAS_FILE, JSON.stringify(body, null, 2), 'utf-8')
          res.end(JSON.stringify({ success: true }))
        } catch (e) {
          res.statusCode = 500
          res.end(JSON.stringify({ success: false, error: String(e) }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), canvasApiPlugin()],
  server: {
    allowedHosts: true
  }
})
