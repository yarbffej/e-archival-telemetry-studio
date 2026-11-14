import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import fs from 'node:fs'
import path from 'node:path'

const execFileAsync = promisify(execFile)

function gdriveArchiveSyncPlugin() {
  return {
    name: 'gdrive-archive-sync',
    configureServer(server: any) {
      server.middlewares.use('/api/gdrive-sync', async (req: any, res: any) => {
        try {
          const url = new URL(req.url || '', 'http://localhost')
          const rawInput = (url.searchParams.get('folderId') || '').trim()
          const match = rawInput.match(/[-\w]{25,}/)
          const folderId = match ? match[0] : rawInput

          if (!folderId || !/^[-\w]{15,}$/.test(folderId)) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Invalid Google Drive Folder ID or URL' }))
            return
          }

          const syncDir = path.resolve(process.cwd(), 'public', 'media', 'synced')
          fs.mkdirSync(syncDir, { recursive: true })

          const { stdout: lsOut } = await execFileAsync('gdrive', [
            'readonly',
            'ls',
            folderId,
            '--max',
            '40',
            '--json',
          ])

          const items = JSON.parse(lsOut || '[]')
          const list = Array.isArray(items) ? items : items.files || items.items || []

          let docItem: any = null
          const imageItems: any[] = []
          let gifItem: any = null
          let videoItem: any = null
          let audioItem: any = null

          for (const item of list) {
            const mime = (item.mimeType || item.type || '').toLowerCase()
            const name = (item.name || '').toLowerCase()
            if (
              !docItem &&
              (mime.includes('document') || name.endsWith('.txt') || name.endsWith('.md'))
            ) {
              docItem = item
            } else if (mime.includes('gif') || name.endsWith('.gif')) {
              if (!gifItem) gifItem = item
            } else if (
              mime.includes('image/') ||
              name.endsWith('.jpg') ||
              name.endsWith('.jpeg') ||
              name.endsWith('.png') ||
              name.endsWith('.webp')
            ) {
              imageItems.push(item)
            } else if (
              !videoItem &&
              (mime.includes('video/') || name.endsWith('.mp4') || name.endsWith('.webm'))
            ) {
              videoItem = item
            } else if (
              !audioItem &&
              (mime.includes('audio/') ||
                name.endsWith('.mp3') ||
                name.endsWith('.m4a') ||
                name.endsWith('.wav'))
            ) {
              audioItem = item
            }
          }

          const result: Record<string, any> = {
            folderId,
            syncedAt: new Date().toISOString(),
            filesFound: list.length,
          }

          if (docItem?.id) {
            const docOutPath = path.join(syncDir, `${folderId}_doc.txt`)
            const mime = (docItem.mimeType || docItem.type || '').toLowerCase()
            if (mime.includes('document')) {
              await execFileAsync('gdrive', [
                'readonly',
                'export',
                docItem.id,
                docOutPath,
                '--format',
                'txt',
              ])
            } else {
              await execFileAsync('gdrive', [
                'readonly',
                'download',
                docItem.id,
                '--out',
                docOutPath,
              ])
            }
            if (fs.existsSync(docOutPath)) {
              result.storyText = fs.readFileSync(docOutPath, 'utf-8')
              result.docName = docItem.name
            }
          }

          if (imageItems.length > 0) {
            const galleryUrls: string[] = []
            const slice = imageItems.slice(0, 6)
            for (let i = 0; i < slice.length; i++) {
              const img = slice[i]
              const ext = (img.name || '').toLowerCase().endsWith('.png') ? 'png' : 'jpg'
              const imgOutPath = path.join(syncDir, `${folderId}_img${i + 1}.${ext}`)
              if (!fs.existsSync(imgOutPath)) {
                await execFileAsync('gdrive', [
                  'readonly',
                  'download',
                  img.id,
                  '--out',
                  imgOutPath,
                ])
              }
              galleryUrls.push(`/media/synced/${folderId}_img${i + 1}.${ext}`)
            }
            result.galleryUrls = galleryUrls
            result.stillUrl = galleryUrls[0]
            result.stillCount = galleryUrls.length
          }

          if (gifItem?.id) {
            const gifOutPath = path.join(syncDir, `${folderId}.gif`)
            if (!fs.existsSync(gifOutPath)) {
              await execFileAsync('gdrive', [
                'readonly',
                'download',
                gifItem.id,
                '--out',
                gifOutPath,
              ])
            }
            result.gifUrl = `/media/synced/${folderId}.gif`
            result.gifName = gifItem.name
          }

          if (videoItem?.id) {
            const vidOutPath = path.join(syncDir, `${folderId}.mp4`)
            if (!fs.existsSync(vidOutPath)) {
              await execFileAsync('gdrive', [
                'readonly',
                'download',
                videoItem.id,
                '--out',
                vidOutPath,
              ])
            }
            result.videoUrl = `/media/synced/${folderId}.mp4`
            result.videoName = videoItem.name
          }

          if (audioItem?.id) {
            const audExt = (audioItem.name || '').toLowerCase().endsWith('.m4a') ? 'm4a' : 'mp3'
            const audOutPath = path.join(syncDir, `${folderId}.${audExt}`)
            if (!fs.existsSync(audOutPath)) {
              await execFileAsync('gdrive', [
                'readonly',
                'download',
                audioItem.id,
                '--out',
                audOutPath,
              ])
            }
            result.audioUrl = `/media/synced/${folderId}.${audExt}`
            result.audioName = audioItem.name
          }

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(result))
        } catch (err: any) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error: err?.message || 'Failed to sync Drive folder via gdrive CLI',
            })
          )
        }
      })

      server.middlewares.use('/api/generate-story', async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }
        try {
          let bodyStr = ''
          for await (const chunk of req) {
            bodyStr += chunk
          }
          const body = JSON.parse(bodyStr || '{}')
          const storyPrompt = String(body.storyPrompt || '').trim()
          const userKey = String(body.apiKey || '').trim()
          const effectiveKey = userKey || process.env.GEMINI_API_KEY || ''

          if (!storyPrompt) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Missing storyPrompt' }))
            return
          }

          // 1. Try Official Gemini API if key is configured
          if (effectiveKey) {
            const gemRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
                effectiveKey
              )}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: storyPrompt }] }],
                  generationConfig: {
                    temperature: 0.9,
                    maxOutputTokens: 1400,
                  },
                }),
              }
            )
            const gemJson: any = await gemRes.json()
            if (!gemRes.ok) {
              res.statusCode = gemRes.status
              res.setHeader('Content-Type', 'application/json')
              res.end(
                JSON.stringify({
                  error:
                    gemJson?.error?.message ||
                    `Gemini API error (${gemRes.status})`,
                })
              )
              return
            }
            const text =
              gemJson?.candidates?.[0]?.content?.parts
                ?.map((p: any) => p.text || '')
                .join('\n') || ''
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ source: 'gemini', text }))
            return
          }

          // 2. Try Local Ollama if running on user's Mac
          try {
            const ctrl = new AbortController()
            const timer = setTimeout(() => ctrl.abort(), 1200)
            const tagsRes = await fetch('http://127.0.0.1:11434/api/tags', {
              signal: ctrl.signal,
            })
            clearTimeout(timer)
            if (tagsRes.ok) {
              const tagsJson: any = await tagsRes.json()
              const firstModel = tagsJson?.models?.[0]?.name
              if (firstModel) {
                const olRes = await fetch(
                  'http://127.0.0.1:11434/api/generate',
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      model: firstModel,
                      prompt: storyPrompt,
                      stream: false,
                    }),
                  }
                )
                if (olRes.ok) {
                  const olJson: any = await olRes.json()
                  if (olJson?.response) {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'application/json')
                    res.end(
                      JSON.stringify({
                        source: `ollama (${firstModel})`,
                        text: olJson.response,
                      })
                    )
                    return
                  }
                }
              }
            }
          } catch {
            // Ollama not running; fall through cleanly
          }

          // 3. Signal client to use built-in Mutable Echo Story Forge
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ fallback: true }))
        } catch (err: any) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error: err?.message || 'Story generation failed',
            })
          )
        }
      })

      // In-App Gemini Image Generation (auto-discovers active Nano Banana / Gemini Image model)
      server.middlewares.use('/api/generate-image', async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }
        try {
          let bodyStr = ''
          for await (const chunk of req) {
            bodyStr += chunk
          }
          const body = JSON.parse(bodyStr || '{}')
          const prompt = String(body.prompt || '').trim()
          const aspectRatio = String(body.aspectRatio || '16:9')
          const safeSlate = String(body.slateId || 'issue').replace(/[^a-zA-Z0-9_-]/g, '_')
          const plateIdx = Number(body.plateIdx || 1)
          const effectiveKey =
            String(body.apiKey || '').trim() || process.env.GEMINI_API_KEY || ''

          if (!prompt) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Missing image prompt' }))
            return
          }

          if (!effectiveKey) {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ fallback: true }))
            return
          }

          // Discover active image-capable Gemini models for this API key
          const candidateModels = [
            'gemini-2.5-flash-image',
            'gemini-3.1-flash-image-preview',
            'gemini-3-pro-image-preview',
            'gemini-2.0-flash-exp-image-generation',
          ]
          try {
            const listRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(
                effectiveKey
              )}`
            )
            if (listRes.ok) {
              const listJson: any = await listRes.json()
              const discovered = (listJson?.models || [])
                .filter((m: any) => {
                  const n = String(m.name || '').toLowerCase()
                  const methods = m.supportedGenerationMethods || []
                  return (
                    n.includes('image') &&
                    Array.isArray(methods) &&
                    methods.includes('generateContent')
                  )
                })
                .map((m: any) => String(m.name).replace(/^models\//, ''))
              if (discovered.length > 0) {
                for (const d of discovered.reverse()) {
                  if (!candidateModels.includes(d)) candidateModels.unshift(d)
                }
              }
            }
          } catch {
            // proceed with candidate list
          }

          let lastErr = 'No Gemini image model succeeded for this API key'
          for (const modelId of candidateModels) {
            const imgRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${encodeURIComponent(
                effectiveKey
              )}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ role: 'user', parts: [{ text: prompt }] }],
                  generationConfig: {
                    responseModalities: ['TEXT', 'IMAGE'],
                    imageConfig: { aspectRatio },
                  },
                }),
              }
            )

            const imgJson: any = await imgRes.json()
            if (!imgRes.ok) {
              lastErr = imgJson?.error?.message || `HTTP ${imgRes.status}`
              continue
            }

            const parts = imgJson?.candidates?.[0]?.content?.parts || []
            const inline = parts.find((p: any) => p.inlineData?.data)
            if (inline?.inlineData?.data) {
              const mime = String(inline.inlineData.mimeType || 'image/png')
              const ext = mime.includes('jpeg') || mime.includes('jpg') ? 'jpg' : 'png'
              const genDir = path.resolve(process.cwd(), 'public', 'media', 'generated')
              fs.mkdirSync(genDir, { recursive: true })
              const fileName = `${safeSlate}_shot${plateIdx}_${Date.now().toString(36)}.${ext}`
              fs.writeFileSync(
                path.join(genDir, fileName),
                Buffer.from(inline.inlineData.data, 'base64')
              )
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(
                JSON.stringify({
                  source: 'gemini-image',
                  modelUsed: modelId,
                  url: `/media/generated/${fileName}`,
                })
              )
              return
            }
          }

          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: lastErr }))
        } catch (err: any) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: err?.message || 'Image generation failed' }))
        }
      })

      // In-App Veo Video Start (predictLongRunning)
      server.middlewares.use('/api/generate-video', async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }
        try {
          let bodyStr = ''
          for await (const chunk of req) {
            bodyStr += chunk
          }
          const body = JSON.parse(bodyStr || '{}')
          const prompt = String(body.prompt || '').trim()
          const aspectRatio = body.aspectRatio === '9:16' ? '9:16' : '16:9'
          const effectiveKey =
            String(body.apiKey || '').trim() || process.env.GEMINI_API_KEY || ''

          if (!effectiveKey) {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ fallback: true }))
            return
          }

          const veoCandidates = [
            'veo-3.0-generate-preview',
            'veo-3.1-generate-preview',
            'veo-2.0-generate-001',
          ]
          try {
            const listRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(
                effectiveKey
              )}`
            )
            if (listRes.ok) {
              const listJson: any = await listRes.json()
              const discovered = (listJson?.models || [])
                .filter((m: any) =>
                  String(m.name || '').toLowerCase().includes('veo')
                )
                .map((m: any) => String(m.name).replace(/^models\//, ''))
              if (discovered.length > 0) {
                for (const d of discovered.reverse()) {
                  if (!veoCandidates.includes(d)) veoCandidates.unshift(d)
                }
              }
            }
          } catch {
            // proceed with defaults
          }

          let lastErr = 'Veo unavailable on this API key (requires paid Gemini billing tier)'
          for (const modelId of veoCandidates) {
            const vRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:predictLongRunning`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-goog-api-key': effectiveKey,
                },
                body: JSON.stringify({
                  instances: [{ prompt }],
                  parameters: {
                    aspectRatio,
                    sampleCount: 1,
                  },
                }),
              }
            )
            const vJson: any = await vRes.json()
            if (vRes.ok && vJson?.name) {
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(
                JSON.stringify({
                  operationName: vJson.name,
                  modelUsed: modelId,
                })
              )
              return
            }
            lastErr = vJson?.error?.message || `Veo HTTP ${vRes.status}`
          }

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ fallback: true, note: lastErr }))
        } catch (err: any) {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ fallback: true, note: err?.message }))
        }
      })

      // In-App Veo Video Poll
      server.middlewares.use('/api/generate-video-status', async (req: any, res: any) => {
        try {
          const u = new URL(req.url || '', 'http://localhost')
          const opName = String(u.searchParams.get('op') || '').trim()
          const safeSlate = String(u.searchParams.get('slateId') || 'issue').replace(
            /[^a-zA-Z0-9_-]/g,
            '_'
          )
          const safeSlot = String(u.searchParams.get('slot') || 'hero').replace(
            /[^a-zA-Z0-9_-]/g,
            '_'
          )
          const effectiveKey =
            String(u.searchParams.get('key') || '').trim() ||
            process.env.GEMINI_API_KEY ||
            ''

          if (!opName || !effectiveKey) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Missing operation or key' }))
            return
          }

          const opRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/${opName}`,
            { headers: { 'x-goog-api-key': effectiveKey } }
          )
          const opJson: any = await opRes.json()
          if (!opRes.ok) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: opJson?.error?.message || 'Poll error' }))
            return
          }

          if (!opJson.done) {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ done: false }))
            return
          }

          const uri =
            opJson?.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri ||
            opJson?.response?.generatedSamples?.[0]?.video?.uri
          if (!uri) {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ fallback: true, note: 'No video URI returned' }))
            return
          }

          const dlRes = await fetch(uri, {
            headers: { 'x-goog-api-key': effectiveKey },
          })
          if (!dlRes.ok) {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ fallback: true, note: 'Failed to download Veo MP4' }))
            return
          }

          const buf = Buffer.from(await dlRes.arrayBuffer())
          const genDir = path.resolve(process.cwd(), 'public', 'media', 'generated')
          fs.mkdirSync(genDir, { recursive: true })
          const fileName = `${safeSlate}_${safeSlot}_${Date.now().toString(36)}.mp4`
          fs.writeFileSync(path.join(genDir, fileName), buf)

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ done: true, url: `/media/generated/${fileName}` }))
        } catch (err: any) {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ fallback: true, note: err?.message }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), gdriveArchiveSyncPlugin()],
})
