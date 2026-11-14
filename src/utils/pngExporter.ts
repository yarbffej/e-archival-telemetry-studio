import { ArchivalTelemetrySlate, SLATE_FINISHES } from '../data/loreArchiveData'

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 8
): number {
  const words = text.split(/\s+/)
  let line = ''
  let currentY = y
  let lineCount = 0

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' '
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && n > 0) {
      lineCount++
      if (lineCount >= maxLines) {
        ctx.fillText(line.trim() + '…', x, currentY)
        return currentY + lineHeight
      }
      ctx.fillText(line.trim(), x, currentY)
      line = words[n] + ' '
      currentY += lineHeight
    } else {
      line = testLine
    }
  }
  if (line.trim()) {
    ctx.fillText(line.trim(), x, currentY)
    currentY += lineHeight
  }
  return currentY
}

function drawReticleCorners(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  size = 18,
  lineWidth = 3
) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth

  // Top-left
  ctx.beginPath()
  ctx.moveTo(x, y + size)
  ctx.lineTo(x, y)
  ctx.lineTo(x + size, y)
  ctx.stroke()

  // Top-right
  ctx.beginPath()
  ctx.moveTo(x + w - size, y)
  ctx.lineTo(x + w, y)
  ctx.lineTo(x + w, y + size)
  ctx.stroke()

  // Bottom-left
  ctx.beginPath()
  ctx.moveTo(x, y + h - size)
  ctx.lineTo(x, y + h)
  ctx.lineTo(x + size, y + h)
  ctx.stroke()

  // Bottom-right
  ctx.beginPath()
  ctx.moveTo(x + w - size, y + h)
  ctx.lineTo(x + w, y + h)
  ctx.lineTo(x + w, y + h - size)
  ctx.stroke()

  ctx.restore()
}

async function loadImageSafe(url: string): Promise<HTMLImageElement | null> {
  if (!url) return null
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = url
  })
}

export async function exportSlateToPng(
  slate: ArchivalTelemetrySlate,
  side: 'front' | 'back' = 'front'
): Promise<void> {
  // 5:7 Archival Telemetry Data-Slate (1000 x 1400 px high-DPI)
  const W = 1000
  const H = 1400
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const finishMeta =
    SLATE_FINISHES.find((f) => f.id === slate.finish) || SLATE_FINISHES[0]
  const accent = finishMeta.accentHex

  // Background Obsidian & Finish Gradient
  const grad = ctx.createLinearGradient(0, 0, W, H)
  grad.addColorStop(0, '#0d1117')
  grad.addColorStop(0.55, '#161b22')
  grad.addColorStop(1, '#090c10')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // 30px Coordinate Grid
  ctx.strokeStyle = 'rgba(0, 242, 255, 0.06)'
  ctx.lineWidth = 1
  for (let gx = 0; gx < W; gx += 30) {
    ctx.beginPath()
    ctx.moveTo(gx, 0)
    ctx.lineTo(gx, H)
    ctx.stroke()
  }
  for (let gy = 0; gy < H; gy += 30) {
    ctx.beginPath()
    ctx.moveTo(0, gy)
    ctx.lineTo(W, gy)
    ctx.stroke()
  }

  // Outer Machined Border + Reticle Brackets
  ctx.strokeStyle = accent
  ctx.lineWidth = 3
  ctx.strokeRect(24, 24, W - 48, H - 48)
  drawReticleCorners(ctx, 18, 18, W - 36, H - 36, '#00f2ff', 28, 4)

  // Header Bar
  ctx.fillStyle = 'rgba(13, 17, 23, 0.92)'
  ctx.fillRect(42, 42, W - 84, 96)
  ctx.strokeStyle = 'rgba(0, 242, 255, 0.35)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(42, 42, W - 84, 96)

  ctx.font = '700 22px "JetBrains Mono", monospace'
  ctx.fillStyle = '#00f2ff'
  ctx.fillText(slate.nodeTag, 64, 80)

  ctx.font = '600 17px "JetBrains Mono", monospace'
  ctx.fillStyle = '#94a3b8'
  ctx.fillText(`HEX_SEED: ${slate.hexSeed} // FINISH: ${slate.finish.toUpperCase()}`, 64, 114)

  // Classification Pill
  const classText = `[ ${slate.classification} ]`
  ctx.font = '700 18px "JetBrains Mono", monospace'
  const pillW = ctx.measureText(classText).width + 36
  ctx.fillStyle =
    slate.classification === 'OPERATIVE'
      ? 'rgba(0, 242, 255, 0.16)'
      : 'rgba(255, 0, 122, 0.18)'
  ctx.fillRect(W - 64 - pillW, 60, pillW, 44)
  ctx.strokeStyle = slate.classification === 'OPERATIVE' ? '#00f2ff' : '#ff007a'
  ctx.strokeRect(W - 64 - pillW, 60, pillW, 44)
  ctx.fillStyle = slate.classification === 'OPERATIVE' ? '#00f2ff' : '#ff007a'
  ctx.fillText(classText, W - 46 - pillW, 89)

  const img = await loadImageSafe(slate.stillUrl)

  if (side === 'front') {
    // Visual Viewport
    const vx = 42
    const vy = 158
    const vw = W - 84
    const vh = 760

    ctx.fillStyle = '#070a0e'
    ctx.fillRect(vx, vy, vw, vh)

    if (img) {
      const imgRatio = img.width / img.height
      const boxRatio = vw / vh
      let sx = 0,
        sy = 0,
        sw = img.width,
        sh = img.height
      if (imgRatio > boxRatio) {
        sw = img.height * boxRatio
        sx = (img.width - sw) / 2
      } else {
        sh = img.width / boxRatio
        sy = (img.height - sh) / 2
      }
      ctx.drawImage(img, sx, sy, sw, sh, vx, vy, vw, vh)
    }

    // Viewport Overlays & Reticles
    drawReticleCorners(ctx, vx + 14, vy + 14, vw - 28, vh - 28, '#00f2ff', 24, 3)

    ctx.fillStyle = 'rgba(13, 17, 23, 0.85)'
    ctx.fillRect(vx + 24, vy + 24, 290, 42)
    ctx.strokeStyle = '#00f2ff'
    ctx.lineWidth = 1.5
    ctx.strokeRect(vx + 24, vy + 24, 290, 42)
    ctx.font = '700 18px "JetBrains Mono", monospace'
    ctx.fillStyle = '#00f2ff'
    ctx.fillText(slate.fpsOverlay, vx + 40, vy + 51)

    // Bottom Gradient inside viewport for Title
    const vGrad = ctx.createLinearGradient(0, vy + vh - 190, 0, vy + vh)
    vGrad.addColorStop(0, 'rgba(13, 17, 23, 0)')
    vGrad.addColorStop(1, 'rgba(13, 17, 23, 0.95)')
    ctx.fillStyle = vGrad
    ctx.fillRect(vx, vy + vh - 190, vw, 190)

    ctx.font = '700 32px "Rajdhani", sans-serif'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(slate.title.toUpperCase(), vx + 28, vy + vh - 72)

    ctx.font = '500 18px "JetBrains Mono", monospace'
    ctx.fillStyle = accent
    ctx.fillText(`${slate.actPhase} // ${slate.encounterTarget.slice(0, 54)}`, vx + 28, vy + vh - 34)

    // Embedded Ambient Sonar Bar
    const ax = 42
    const ay = 940
    const aw = W - 84
    const ah = 110
    ctx.fillStyle = 'rgba(22, 27, 34, 0.95)'
    ctx.fillRect(ax, ay, aw, ah)
    ctx.strokeStyle = accent
    ctx.lineWidth = 1.5
    ctx.strokeRect(ax, ay, aw, ah)

    ctx.font = '700 16px "JetBrains Mono", monospace'
    ctx.fillStyle = '#00f2ff'
    ctx.fillText(`AMBIENT SONAR FEED // ${slate.audioTitle}`, ax + 24, ay + 36)

    // Waveform bars
    for (let i = 0; i < 38; i++) {
      const barH = 14 + ((i * 19 + slate.phaseIndex * 7) % 36)
      ctx.fillStyle = i % 3 === 0 ? '#00f2ff' : i % 5 === 0 ? '#ff007a' : 'rgba(0, 242, 255, 0.45)'
      ctx.fillRect(ax + 24 + i * 23, ay + 88 - barH, 14, barH)
    }

    // Telemetry Matrix Summary Strip
    const tx = 42
    const ty = 1072
    const tw = W - 84
    const th = 264
    ctx.fillStyle = 'rgba(13, 17, 23, 0.92)'
    ctx.fillRect(tx, ty, tw, th)
    ctx.strokeStyle = 'rgba(0, 242, 255, 0.28)'
    ctx.strokeRect(tx, ty, tw, th)

    ctx.font = '700 17px "JetBrains Mono", monospace'
    ctx.fillStyle = '#94a3b8'
    ctx.fillText('ACTION VECTOR:', tx + 24, ty + 40)
    ctx.fillStyle = '#e6edf3'
    wrapText(ctx, slate.action, tx + 200, ty + 40, tw - 224, 26, 2)

    ctx.fillStyle = '#94a3b8'
    ctx.fillText('BIOME / LOCUS:', tx + 24, ty + 96)
    ctx.fillStyle = '#e6edf3'
    wrapText(ctx, `${slate.biome} — ${slate.environmentBiome}`, tx + 200, ty + 96, tw - 224, 26, 2)

    ctx.fillStyle = '#94a3b8'
    ctx.fillText('LIGHTING PACK:', tx + 24, ty + 152)
    ctx.fillStyle = accent
    ctx.fillText(slate.lightingStyle.slice(0, 62), tx + 200, ty + 152)

    // 4 Diagnostic Readout Pills at bottom
    const diagItems = [
      { k: 'OBLIGATION DENSITY', v: slate.diagnostics.obligationDensity, c: '#ff007a' },
      { k: 'SEVERANCE DEPTH', v: slate.diagnostics.severanceDepth, c: '#00f2ff' },
      { k: 'ABSENCE RADIUS', v: slate.diagnostics.absenceRadius, c: '#00cc88' },
      { k: 'CLEANSE EFFICIENCY', v: slate.diagnostics.cleanseEfficiency, c: '#ffaa00' },
    ]
    diagItems.forEach((d, idx) => {
      const dx = tx + 20 + idx * 222
      const dy = ty + 182
      ctx.fillStyle = 'rgba(22, 27, 34, 0.95)'
      ctx.fillRect(dx, dy, 210, 64)
      ctx.strokeStyle = d.c
      ctx.strokeRect(dx, dy, 210, 64)
      ctx.font = '600 12px "JetBrains Mono", monospace'
      ctx.fillStyle = '#94a3b8'
      ctx.fillText(d.k, dx + 12, dy + 24)
      ctx.font = '700 14px "JetBrains Mono", monospace'
      ctx.fillStyle = d.c
      ctx.fillText(d.v.slice(0, 22), dx + 12, dy + 48)
    })
  } else {
    // BACK: 3-Act Severance Log & Telemetry Matrix
    const bx = 42
    const by = 158
    const bw = W - 84

    // Mini Top Still + Metadata
    ctx.fillStyle = 'rgba(22, 27, 34, 0.92)'
    ctx.fillRect(bx, by, bw, 180)
    ctx.strokeStyle = accent
    ctx.strokeRect(bx, by, bw, 180)

    if (img) {
      ctx.drawImage(img, bx + 12, by + 12, 240, 156)
    }
    ctx.font = '700 26px "Rajdhani", sans-serif'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(`${slate.title} // 3-ACT FIELD LOG`, bx + 272, by + 48)

    ctx.font = '500 16px "JetBrains Mono", monospace'
    ctx.fillStyle = '#00f2ff'
    ctx.fillText(`ACT PHASE: ${slate.actPhase}`, bx + 272, by + 84)
    ctx.fillStyle = '#cbd5e1'
    ctx.fillText(`TARGET: ${slate.encounterTarget.slice(0, 50)}`, bx + 272, by + 114)
    ctx.fillText(`POV: ${slate.perspective.slice(0, 54)}`, bx + 272, by + 144)

    // 3 Acts
    const acts = [
      { tag: 'ACT I // THE SETUP', text: slate.acts.sceneSetup, color: '#ffaa00' },
      { tag: 'ACT II // THE ACTION', text: slate.acts.intervention, color: '#00f2ff' },
      { tag: 'ACT III // THE AFTERMATH', text: slate.acts.aftermath, color: '#00cc88' },
    ]

    let ay = 362
    for (const act of acts) {
      ctx.fillStyle = 'rgba(13, 17, 23, 0.94)'
      ctx.fillRect(bx, ay, bw, 225)
      ctx.strokeStyle = act.color
      ctx.lineWidth = 1.5
      ctx.strokeRect(bx, ay, bw, 225)

      ctx.font = '700 16px "JetBrains Mono", monospace'
      ctx.fillStyle = act.color
      ctx.fillText(act.tag, bx + 22, ay + 34)

      ctx.font = '400 17px "Inter", sans-serif'
      ctx.fillStyle = '#e2e8f0'
      wrapText(ctx, act.text, bx + 22, ay + 68, bw - 44, 27, 5)
      ay += 242
    }

    // 4 Diagnostic Readouts Matrix at bottom
    const diagItems = [
      { k: 'OBLIGATION DENSITY', v: slate.diagnostics.obligationDensity, c: '#ff007a' },
      { k: 'SEVERANCE DEPTH', v: slate.diagnostics.severanceDepth, c: '#00f2ff' },
      { k: 'ABSENCE RADIUS', v: slate.diagnostics.absenceRadius, c: '#00cc88' },
      { k: 'CLEANSE EFFICIENCY', v: slate.diagnostics.cleanseEfficiency, c: '#ffaa00' },
    ]
    diagItems.forEach((d, idx) => {
      const dx = bx + idx * 232
      const dy = 1105
      ctx.fillStyle = 'rgba(22, 27, 34, 0.95)'
      ctx.fillRect(dx, dy, 220, 110)
      ctx.strokeStyle = d.c
      ctx.lineWidth = 2
      ctx.strokeRect(dx, dy, 220, 110)

      ctx.font = '700 14px "JetBrains Mono", monospace'
      ctx.fillStyle = '#94a3b8'
      ctx.fillText(d.k, dx + 16, dy + 38)
      ctx.font = '700 19px "JetBrains Mono", monospace'
      ctx.fillStyle = d.c
      ctx.fillText(d.v.slice(0, 20), dx + 16, dy + 78)
    })

    // Footer codeblock
    ctx.font = '600 14px "JetBrains Mono", monospace'
    ctx.fillStyle = 'rgba(0, 242, 255, 0.65)'
    ctx.fillText(
      `CODEBLOCK_INFRASTRUCTURE: ${slate.hexSeed}_INIT // 432Hz_SEVERANCE: VERIFIED // SECURED_BY_ME!`,
      bx,
      1342
    )
  }

  // Trigger Download
  const dataUrl = canvas.toDataURL('image/png')
  const a = document.createElement('a')
  const safeName = slate.hexSeed.replace(/[^a-zA-Z0-9_-]/g, '_')
  a.href = dataUrl
  a.download = `ME_SLATE_${safeName}_${side.toUpperCase()}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
