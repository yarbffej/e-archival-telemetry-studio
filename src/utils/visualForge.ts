import { ArchivalTelemetrySlate, SLATE_FINISHES } from '../data/loreArchiveData'

export interface GeneratedVisualResult {
  url: string
  source: 'gemini' | 'veo' | 'builtin'
  sourceLabel: string
  note?: string
}

function drawFilmGrain(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  seed: number,
  intensity = 18
) {
  const imgData = ctx.getImageData(0, 0, w, h)
  const d = imgData.data
  let s = (seed * 9301 + 49297) % 233280
  for (let i = 0; i < d.length; i += 4) {
    s = (s * 9301 + 49297) % 233280
    const n = ((s / 233280) - 0.5) * intensity
    d[i] = Math.max(0, Math.min(255, d[i] + n))
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n))
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n))
  }
  ctx.putImageData(imgData, 0, 0)
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16) || 0
  const g = parseInt(clean.slice(2, 4), 16) || 242
  const b = parseInt(clean.slice(4, 6), 16) || 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function paintCelNoirFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  slate: ArchivalTelemetrySlate,
  shotNumber: number,
  t = 0
) {
  const finish =
    SLATE_FINISHES.find((f) => f.id === slate.finish) || SLATE_FINISHES[0]
  const accent = finish.accentHex
  const secondary = finish.secondaryHex
  const seed = slate.phaseIndex * 31 + shotNumber * 17

  // Deep atmospheric sky / bay backdrop
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h)
  bgGrad.addColorStop(0, '#07090f')
  bgGrad.addColorStop(0.55, '#121826')
  bgGrad.addColorStop(1, '#090b10')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, w, h)

  // Glowing volumetric wash in canonical accent/secondary tones
  const rad1 = ctx.createRadialGradient(
    w * (shotNumber === 2 ? 0.68 : 0.5),
    h * (shotNumber === 4 ? 0.52 : 0.28),
    10,
    w * 0.5,
    h * 0.45,
    Math.max(w, h) * 0.65
  )
  rad1.addColorStop(0, hexToRgba(accent, 0.34))
  rad1.addColorStop(0.5, hexToRgba(secondary, 0.14))
  rad1.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = rad1
  ctx.fillRect(0, 0, w, h)

  if (shotNumber === 1) {
    // SHOT 01: Extreme Wide Architectural Establishing Cavern + Tiny Figure on Catwalk
    ctx.strokeStyle = hexToRgba(accent, 0.25)
    ctx.lineWidth = 2
    // Towering vertical pillars / conduits receding into mist
    for (let i = 0; i < 9; i++) {
      const x = w * (0.06 + i * 0.115)
      const pw = w * (0.045 - Math.abs(4 - i) * 0.004)
      ctx.fillStyle = i % 2 === 0 ? '#0b0e15' : '#101520'
      ctx.fillRect(x, 0, pw, h)
      ctx.strokeRect(x, 0, pw, h)
      // Lit sodium bay slit on pillar
      ctx.fillStyle = hexToRgba(secondary, 0.45)
      ctx.fillRect(x + pw * 0.35, h * 0.12, 3, h * 0.68)
    }

    // Diagonal light shafts cutting through bay
    for (let b = 0; b < 3; b++) {
      ctx.fillStyle = hexToRgba(accent, 0.09)
      ctx.beginPath()
      ctx.moveTo(w * (0.2 + b * 0.24) + Math.sin(t) * 18, 0)
      ctx.lineTo(w * (0.34 + b * 0.24), 0)
      ctx.lineTo(w * (0.58 + b * 0.2), h)
      ctx.lineTo(w * (0.35 + b * 0.2), h)
      ctx.closePath()
      ctx.fill()
    }

    // Distant catwalk span
    ctx.fillStyle = '#06080d'
    ctx.fillRect(0, h * 0.66, w, h * 0.045)
    ctx.strokeStyle = hexToRgba(accent, 0.6)
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, h * 0.635)
    ctx.lineTo(w, h * 0.635)
    ctx.stroke()

    // Tiny solitary operative figure on catwalk for vast scale
    const fx = w * 0.49
    const fy = h * 0.66
    ctx.fillStyle = '#050608'
    ctx.fillRect(fx - 7, fy - 34, 14, 34)
    ctx.beginPath()
    ctx.arc(fx, fy - 41, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = accent
    ctx.lineWidth = 1.5
    ctx.stroke()
  } else if (shotNumber === 2) {
    // SHOT 02: Dynamic Dutch-Tilt Mid-Action Visor Operative + Venting Steam
    ctx.save()
    ctx.translate(w * 0.5, h * 0.5)
    ctx.rotate(-0.12)
    ctx.strokeStyle = hexToRgba(secondary, 0.22)
    ctx.lineWidth = 3
    for (let k = -4; k <= 4; k++) {
      ctx.beginPath()
      ctx.moveTo(-w, k * 85)
      ctx.lineTo(w, k * 85)
      ctx.stroke()
    }
    ctx.restore()

    // Dramatic foreground heavy iron conduit
    ctx.fillStyle = '#07090d'
    ctx.fillRect(w * 0.05, 0, w * 0.14, h)
    ctx.fillRect(w * 0.84, 0, w * 0.12, h)

    // Pressurized steam burst behind operative
    for (let s = 0; s < 14; s++) {
      const ang = (s / 14) * Math.PI * 2 + t * 0.4
      const rad = 60 + ((seed + s * 37) % 140)
      const cx = w * 0.5 + Math.cos(ang) * rad * 1.4
      const cy = h * 0.52 + Math.sin(ang) * rad * 0.7
      ctx.fillStyle = hexToRgba('#e2e8f0', 0.07)
      ctx.beginPath()
      ctx.arc(cx, cy, 48 + (s % 4) * 18, 0, Math.PI * 2)
      ctx.fill()
    }

    // Faceless Obsidian Dome Visor Operative Silhouette (Dynamic Mid-Action Stance)
    const ox = w * 0.48
    const oy = h * 0.24
    // Coat & shoulders
    ctx.fillStyle = '#080b10'
    ctx.strokeStyle = accent
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(ox - h * 0.22, h)
    ctx.lineTo(ox - h * 0.13, oy + h * 0.19)
    ctx.lineTo(ox + h * 0.15, oy + h * 0.16)
    ctx.lineTo(ox + h * 0.26, h)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Smooth Obsidian Full-Face Dome Helmet Visor
    ctx.fillStyle = '#040507'
    ctx.beginPath()
    ctx.ellipse(ox, oy + h * 0.07, h * 0.11, h * 0.135, -0.08, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = secondary
    ctx.lineWidth = 3
    ctx.stroke()

    // Curved specular visor crescent highlight
    ctx.strokeStyle = hexToRgba(accent, 0.85)
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(ox + h * 0.018, oy + h * 0.06, h * 0.075, -0.9, 0.65)
    ctx.stroke()
  } else if (shotNumber === 3) {
    // SHOT 03: Extreme Macro Detail Insert (Interlocking Gears, Valves, Hose Couplings, Droplets — Zero People)
    // Dark brushed metal backing plate
    ctx.fillStyle = '#11161f'
    ctx.fillRect(w * 0.08, h * 0.08, w * 0.84, h * 0.84)
    ctx.strokeStyle = hexToRgba(accent, 0.45)
    ctx.lineWidth = 3
    ctx.strokeRect(w * 0.08, h * 0.08, w * 0.84, h * 0.84)

    // Giant interlocking industrial gearwheel
    const gx = w * 0.42
    const gy = h * 0.52
    const gr = Math.min(w, h) * 0.3
    ctx.save()
    ctx.translate(gx, gy)
    ctx.rotate(t * 0.25)
    ctx.fillStyle = '#090c12'
    ctx.strokeStyle = accent
    ctx.lineWidth = 4
    ctx.beginPath()
    const teeth = 16
    for (let i = 0; i < teeth * 2; i++) {
      const a = (i / (teeth * 2)) * Math.PI * 2
      const r = i % 2 === 0 ? gr : gr * 0.84
      if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r)
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r)
    }
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(0, 0, gr * 0.45, 0, Math.PI * 2)
    ctx.fillStyle = '#161d29'
    ctx.fill()
    ctx.strokeStyle = secondary
    ctx.stroke()
    ctx.restore()

    // Heavy Diagonal Pipe Collar & Pressure Tube
    ctx.strokeStyle = secondary
    ctx.lineWidth = 18
    ctx.beginPath()
    ctx.moveTo(w * 0.58, 0)
    ctx.lineTo(w * 0.82, h)
    ctx.stroke()
    ctx.strokeStyle = '#080b10'
    ctx.lineWidth = 10
    ctx.stroke()

    // Glowing calibration fluid glass cylinder
    ctx.fillStyle = hexToRgba(accent, 0.28)
    ctx.fillRect(w * 0.68, h * 0.2, w * 0.09, h * 0.6)
    ctx.strokeStyle = accent
    ctx.lineWidth = 3
    ctx.strokeRect(w * 0.68, h * 0.2, w * 0.09, h * 0.6)
    // Specular condensation droplets
    for (let d = 0; d < 18; d++) {
      const dx = w * (0.14 + ((d * 43 + seed) % 72) / 100)
      const dy = h * (0.15 + ((d * 67 + seed) % 70) / 100)
      ctx.fillStyle = hexToRgba('#ffffff', 0.45)
      ctx.beginPath()
      ctx.arc(dx, dy, 2 + (d % 3), 0, Math.PI * 2)
      ctx.fill()
    }
  } else {
    // SHOT 04: Quiet Symmetrical Horizon Aftermath & Wet Reflections
    const horizon = h * 0.56
    const sky = ctx.createLinearGradient(0, 0, 0, horizon)
    sky.addColorStop(0, '#0a0f1c')
    sky.addColorStop(1, hexToRgba(secondary, 0.35))
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, w, horizon)

    // Distant gothic arches framing the mist
    ctx.strokeStyle = hexToRgba(accent, 0.32)
    ctx.lineWidth = 3
    for (let a = 1; a <= 3; a++) {
      const aw = w * (0.28 * a)
      ctx.beginPath()
      ctx.arc(w * 0.5, horizon, aw * 0.5, Math.PI, 0)
      ctx.stroke()
    }

    // Wet mirror-slick stone floor
    const floor = ctx.createLinearGradient(0, horizon, 0, h)
    floor.addColorStop(0, hexToRgba(accent, 0.25))
    floor.addColorStop(0.25, '#0c111a')
    floor.addColorStop(1, '#05070b')
    ctx.fillStyle = floor
    ctx.fillRect(0, horizon, w, h - horizon)

    // Distant retreating rear silhouette walking into mist
    const sx = w * 0.5
    ctx.fillStyle = '#05070a'
    ctx.fillRect(sx - 11, horizon - 54, 22, 54)
    ctx.beginPath()
    ctx.arc(sx, horizon - 62, 10, 0, Math.PI * 2)
    ctx.fill()
    // Floor reflection
    ctx.fillStyle = 'rgba(5,7,10,0.45)'
    ctx.fillRect(sx - 10, horizon + 4, 20, 48)
  }

  // Drifting mist particles
  for (let p = 0; p < 34; p++) {
    const px = ((seed * 19 + p * 73 + t * 28) % w + w) % w
    const py = ((seed * 11 + p * 47 + Math.sin(t + p) * 14) % h + h) % h
    ctx.fillStyle =
      p % 3 === 0 ? hexToRgba(accent, 0.55) : 'rgba(255,255,255,0.22)'
    ctx.beginPath()
    ctx.arc(px, py, (p % 3) + 1.2, 0, Math.PI * 2)
    ctx.fill()
  }

  // Subtle CRT scanlines + vignette
  ctx.fillStyle = 'rgba(0,0,0,0.16)'
  for (let y = 0; y < h; y += 4) {
    ctx.fillRect(0, y, w, 1)
  }
}

export function generateProceduralStoryboardPlate(
  slate: ArchivalTelemetrySlate,
  plateIndex: number
): string {
  const cvs = document.createElement('canvas')
  cvs.width = 1280
  cvs.height = 720
  const ctx = cvs.getContext('2d')!
  paintCelNoirFrame(ctx, cvs.width, cvs.height, slate, plateIndex, 0.4)
  drawFilmGrain(ctx, cvs.width, cvs.height, slate.phaseIndex + plateIndex, 16)
  return cvs.toDataURL('image/png')
}

export async function generateImageInsideApp(
  slate: ArchivalTelemetrySlate,
  plateIdx: number,
  prompt: string,
  apiKey?: string
): Promise<GeneratedVisualResult> {
  if (apiKey?.trim()) {
    const res = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        aspectRatio: '16:9',
        slateId: slate.id,
        plateIdx,
        apiKey: apiKey.trim(),
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data?.error || 'Gemini image request failed')
    }
    if (data?.url && !data?.fallback) {
      return {
        url: data.url,
        source: 'gemini',
        sourceLabel: `Gemini Image (${data.modelUsed || 'AI'})`,
      }
    }
  }

  const url = generateProceduralStoryboardPlate(slate, plateIdx)
  return {
    url,
    source: 'builtin',
    sourceLabel: 'Built-In Storyboard Renderer',
  }
}

export async function recordProceduralMotionWebm(
  slate: ArchivalTelemetrySlate,
  aspectRatio: '16:9' | '9:16'
): Promise<string> {
  const cvs = document.createElement('canvas')
  cvs.width = aspectRatio === '9:16' ? 450 : 960
  cvs.height = aspectRatio === '9:16' ? 800 : 540
  const ctx = cvs.getContext('2d')!

  const stream = cvs.captureStream(24)
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm'
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 2_500_000,
  })

  const chunks: BlobPart[] = []
  recorder.ondataavailable = (ev) => {
    if (ev.data && ev.data.size > 0) chunks.push(ev.data)
  }

  const finished = new Promise<string>((resolve) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType })
      const url = URL.createObjectURL(blob)
      resolve(aspectRatio === '9:16' ? `${url}#video` : url)
    }
  })

  recorder.start()
  const totalFrames = 60 // 2.5 seconds @ 24fps seamless motion loop
  const shotMode = aspectRatio === '9:16' ? 2 : 1

  for (let f = 0; f < totalFrames; f++) {
    const t = (f / totalFrames) * Math.PI * 2
    paintCelNoirFrame(ctx, cvs.width, cvs.height, slate, shotMode, t)
    await new Promise((r) => window.setTimeout(r, 40))
  }

  recorder.stop()
  return finished
}

export async function generateVideoInsideApp(
  slate: ArchivalTelemetrySlate,
  slot: 'hero' | 'portrait',
  prompt: string,
  apiKey?: string,
  onProgress?: (msg: string) => void
): Promise<GeneratedVisualResult> {
  const aspectRatio = slot === 'portrait' ? '9:16' : '16:9'

  if (apiKey?.trim()) {
    onProgress?.('Starting Veo render...')
    try {
      const startRes = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          aspectRatio,
          slateId: slate.id,
          slot,
          apiKey: apiKey.trim(),
        }),
      })
      const startJson = await startRes.json()
      if (startJson?.operationName) {
        for (let attempt = 0; attempt < 30; attempt++) {
          onProgress?.(`Veo rendering (${attempt * 3}s)...`)
          await new Promise((r) => window.setTimeout(r, 3000))
          const pollRes = await fetch(
            `/api/generate-video-status?op=${encodeURIComponent(
              startJson.operationName
            )}&key=${encodeURIComponent(apiKey.trim())}&slateId=${encodeURIComponent(
              slate.id
            )}&slot=${slot}`
          )
          const pollJson = await pollRes.json()
          if (pollJson?.done && pollJson?.url) {
            return {
              url: slot === 'portrait' ? `${pollJson.url}#video` : pollJson.url,
              source: 'veo',
              sourceLabel: `Veo (${startJson.modelUsed || 'MP4'})`,
            }
          }
          if (pollJson?.fallback) break
        }
      } else if (startJson?.note) {
        onProgress?.('Veo needs paid tier — using Built-In Motion Studio...')
      }
    } catch {
      // fall through cleanly to built-in motion renderer
    }
  }

  onProgress?.(`Recording ${aspectRatio} animated loop...`)
  const url = await recordProceduralMotionWebm(slate, aspectRatio)
  return {
    url,
    source: 'builtin',
    sourceLabel: `Built-In Motion Studio (${aspectRatio})`,
  }
}

function encodeWavFromAudioBuffer(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  const length = buffer.length
  const bytesPerSample = 2
  const blockAlign = numChannels * bytesPerSample
  const dataSize = length * blockAlign
  const arrayBuffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(arrayBuffer)

  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i))
  }

  writeStr(0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeStr(8, 'WAVE')
  writeStr(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * blockAlign, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, 16, true)
  writeStr(36, 'data')
  view.setUint32(40, dataSize, true)

  const channels = Array.from({ length: numChannels }, (_, c) =>
    buffer.getChannelData(c)
  )
  let offset = 44
  for (let i = 0; i < length; i++) {
    for (let c = 0; c < numChannels; c++) {
      const sample = Math.max(-1, Math.min(1, channels[c][i]))
      view.setInt16(
        offset,
        sample < 0 ? sample * 0x8000 : sample * 0x7fff,
        true
      )
      offset += 2
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' })
}

export async function synthesizeCyberNoirSongWav(
  slate: ArchivalTelemetrySlate
): Promise<{ url: string; title: string }> {
  const bpm = 82 + ((slate.phaseIndex * 7) % 28)
  const durationSec = 32
  const sampleRate = 22050
  const OfflineCtx =
    window.OfflineAudioContext ||
    (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext })
      .webkitOfflineAudioContext
  const ctx = new OfflineCtx(2, sampleRate * durationSec, sampleRate)

  const master = ctx.createGain()
  master.gain.setValueAtTime(0.01, 0)
  master.gain.linearRampToValueAtTime(0.75, 1.2)
  master.gain.setValueAtTime(0.75, durationSec - 3.5)
  master.gain.exponentialRampToValueAtTime(0.001, durationSec - 0.1)
  master.connect(ctx.destination)

  const stepDur = 60 / bpm / 2 // 8th notes
  const totalSteps = Math.floor((durationSec - 1.5) / stepDur)
  // 432Hz-referenced natural minor frequencies
  const rootShift = 1 + ((slate.phaseIndex % 5) * 0.059)
  const scale = [108, 121.3, 128.4, 144.2, 161.8, 171.4, 192.4, 216]

  // Sub-Bass + Kick + Snare + Lead Synth Arpeggio
  for (let step = 0; step < totalSteps; step++) {
    const t = step * stepDur

    // Kick on beats 0, 2, 4, 6...
    if (step % 2 === 0 && step >= 4 && step < totalSteps - 6) {
      const kOsc = ctx.createOscillator()
      const kGain = ctx.createGain()
      kOsc.type = 'sine'
      kOsc.frequency.setValueAtTime(115, t)
      kOsc.frequency.exponentialRampToValueAtTime(36, t + 0.14)
      kGain.gain.setValueAtTime(0.45, t)
      kGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18)
      kOsc.connect(kGain)
      kGain.connect(master)
      kOsc.start(t)
      kOsc.stop(t + 0.2)
    }

    // Soft analog bass pulse
    const bassFreq = scale[(Math.floor(step / 8) + slate.phaseIndex) % 4] * 0.5 * rootShift
    const bOsc = ctx.createOscillator()
    const bFilter = ctx.createBiquadFilter()
    const bGain = ctx.createGain()
    bOsc.type = 'sawtooth'
    bOsc.frequency.setValueAtTime(bassFreq, t)
    bFilter.type = 'lowpass'
    bFilter.frequency.setValueAtTime(320, t)
    bGain.gain.setValueAtTime(0.18, t)
    bGain.gain.exponentialRampToValueAtTime(0.002, t + stepDur * 0.92)
    bOsc.connect(bFilter)
    bFilter.connect(bGain)
    bGain.connect(master)
    bOsc.start(t)
    bOsc.stop(t + stepDur * 0.95)

    // Cyber-noir synth arp in main groove
    if (step >= 8 && step < totalSteps - 8) {
      const note =
        scale[(step * 3 + slate.phaseIndex) % scale.length] * 2 * rootShift
      const aOsc = ctx.createOscillator()
      const aGain = ctx.createGain()
      aOsc.type = step % 3 === 0 ? 'triangle' : 'sine'
      aOsc.frequency.setValueAtTime(note, t)
      aGain.gain.setValueAtTime(0.09, t)
      aGain.gain.exponentialRampToValueAtTime(0.001, t + stepDur * 1.4)
      aOsc.connect(aGain)
      aGain.connect(master)
      aOsc.start(t)
      aOsc.stop(t + stepDur * 1.45)
    }
  }

  // Lush sustained ambient pad chords
  for (let p = 0; p < 4; p++) {
    const start = p * 7.5
    ;[0, 2, 4].forEach((deg) => {
      const pOsc = ctx.createOscillator()
      const pFilter = ctx.createBiquadFilter()
      const pGain = ctx.createGain()
      pOsc.type = 'sawtooth'
      pOsc.frequency.setValueAtTime(
        scale[(deg + p) % scale.length] * rootShift,
        start
      )
      pFilter.type = 'lowpass'
      pFilter.frequency.setValueAtTime(520, start)
      pGain.gain.setValueAtTime(0.001, start)
      pGain.gain.linearRampToValueAtTime(0.045, start + 1.5)
      pGain.gain.linearRampToValueAtTime(0.001, start + 7.4)
      pOsc.connect(pFilter)
      pFilter.connect(pGain)
      pGain.connect(master)
      pOsc.start(start)
      pOsc.stop(start + 7.5)
    })
  }

  const rendered = await ctx.startRendering()
  const wavBlob = encodeWavFromAudioBuffer(rendered)
  const url = URL.createObjectURL(wavBlob)
  const safeName = slate.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')
  return {
    url,
    title: `${safeName || 'mutable_echo'}_${bpm}bpm_synth.wav`,
  }
}
