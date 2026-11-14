import React, { useState, useRef, useEffect } from 'react'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Film,
  Disc3,
} from 'lucide-react'
import { ArchivalTelemetrySlate, SlateFinishId } from '../data/loreArchiveData'
import { ZINE_PALETTES, getZinePalette } from '../data/zinePalettes'
import { StudioUiTheme } from '../data/uiThemes'
import { soundEngine } from '../utils/soundEngine'
import { exportStandaloneWebpageHtml } from '../utils/htmlExporter'

interface LoreWebpageViewProps {
  slate: ArchivalTelemetrySlate
  onUpdateSlate?: (patch: Partial<ArchivalTelemetrySlate>) => void
  uiTheme?: StudioUiTheme
}

function formatSeconds(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

const SHOT_STICKERS = [
  { badge: '🌍 SHOT 01 // WIDE WORLD', note: 'Establishing Scale' },
  { badge: '⚡ SHOT 02 // BIG ACTION', note: 'Kinetic Intervention' },
  { badge: '🔍 SHOT 03 // MACRO DETAIL', note: 'Hands & Hardware' },
  { badge: '🌅 SHOT 04 // AFTERMATH', note: 'Quiet Departure' },
]

export const LoreWebpageView: React.FC<LoreWebpageViewProps> = ({
  slate,
  onUpdateSlate,
  uiTheme,
}) => {
  const pal = getZinePalette(slate.finish)
  const [vibeCustomized, setVibeCustomized] = useState(false)

  useEffect(() => {
    setVibeCustomized(false)
  }, [uiTheme?.id])

  const isDarkStudio = Boolean(uiTheme?.isDark)
  const useThemeAccents = isDarkStudio && !vibeCustomized

  const zTheme = {
    paperBg: isDarkStudio ? uiTheme!.middleBg : pal.paperBg,
    paperBgImage: isDarkStudio ? uiTheme!.middleBgImage : undefined,
    paperBgSize: isDarkStudio ? uiTheme!.middleBgSize : undefined,
    cardBg: isDarkStudio ? uiTheme!.surfaceBg : pal.cardBg,
    surfaceBg: isDarkStudio ? uiTheme!.surfaceBg : '#FFFFFF',
    surfaceElevated: isDarkStudio ? uiTheme!.surfaceElevated : '#FFFFFF',
    inputBg: isDarkStudio ? uiTheme!.inputBg : '#FFFFFF',
    mastheadBg: isDarkStudio ? uiTheme!.mastheadBg : pal.heroYellow,
    mastheadInk: isDarkStudio ? uiTheme!.ink : pal.ink,
    tile1: isDarkStudio ? uiTheme!.tile1 : pal.act1Tint,
    tile2: isDarkStudio ? uiTheme!.tile2 : pal.act2Tint,
    tile3: isDarkStudio ? uiTheme!.tile3 : pal.act3Tint,
    tile4: isDarkStudio ? uiTheme!.tile4 : '#FFFDF4',
    heroYellow: useThemeAccents ? uiTheme!.accent1 : pal.heroYellow,
    heroYellowInk: useThemeAccents ? uiTheme!.accent1Ink : '#121212',
    popPink: useThemeAccents ? uiTheme!.accent2 : pal.popPink,
    popPinkInk: useThemeAccents ? uiTheme!.accent2Ink : '#FFFFFF',
    popCyan: useThemeAccents ? uiTheme!.accent3 : pal.popCyan,
    popCyanInk: useThemeAccents ? uiTheme!.accent3Ink : '#121212',
    popLime: useThemeAccents ? uiTheme!.accent4 : pal.popLime,
    popLimeInk: useThemeAccents ? uiTheme!.accent4Ink : '#121212',
    ink: isDarkStudio ? uiTheme!.ink : pal.ink,
    mutedInk: isDarkStudio ? uiTheme!.mutedInk : '#525252',
    border: isDarkStudio ? uiTheme!.borderColor : '#121212',
    tickerBg: isDarkStudio ? uiTheme!.marqueeBg : pal.ink,
    tickerText: useThemeAccents ? uiTheme!.accent1 : pal.heroYellow,
    dotGridColor: isDarkStudio
      ? 'rgba(255,255,255,0.08)'
      : 'rgba(18,18,18,0.09)',
  }

  const gallery =
    slate.galleryUrls && slate.galleryUrls.length > 0
      ? slate.galleryUrls
      : slate.stillUrl
      ? [slate.stillUrl]
      : []

  // Hero Video & Kaleidoscope Pop Canvas State
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [videoMuted, setVideoMuted] = useState(true)
  const [cinemaMode, setCinemaMode] = useState<'video' | 'popfx'>(
    slate.videoUrl ? 'video' : 'popfx'
  )

  useEffect(() => {
    setCinemaMode(slate.videoUrl ? 'video' : 'popfx')
  }, [slate.id, slate.videoUrl])

  // Experimental Pop-Art Synth Canvas (when toggled or when no video yet)
  const popCanvasRef = useRef<HTMLCanvasElement | null>(null)
  useEffect(() => {
    if (cinemaMode !== 'popfx' && slate.videoUrl) return
    const cvs = popCanvasRef.current
    if (!cvs) return
    const ctx = cvs.getContext('2d')
    if (!ctx) return

    let animId = 0
    let t = 0
    const shapes = Array.from({ length: 22 }, (_, idx) => ({
      x: (idx * 97) % 960,
      y: (idx * 73) % 540,
      vx: ((idx % 5) - 2) * 0.65 || 0.8,
      vy: ((idx % 3) - 1) * 0.55 || -0.6,
      size: 16 + (idx % 5) * 12,
      kind: idx % 3,
      colorIdx: idx % 4,
    }))

    const colors = [
      zTheme.heroYellow,
      zTheme.popPink,
      zTheme.popCyan,
      zTheme.popLime,
    ]

    const render = () => {
      t += 0.03
      ctx.fillStyle = zTheme.paperBg
      ctx.fillRect(0, 0, cvs.width, cvs.height)

      // Pop grid lines
      ctx.strokeStyle = zTheme.dotGridColor
      ctx.lineWidth = 1.5
      for (let x = 0; x < cvs.width; x += 48) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, cvs.height)
        ctx.stroke()
      }
      for (let y = 0; y < cvs.height; y += 48) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(cvs.width, y)
        ctx.stroke()
      }

      // Floating geometric pop stickers
      shapes.forEach((s) => {
        s.x = (s.x + s.vx + cvs.width) % cvs.width
        s.y = (s.y + s.vy + cvs.height) % cvs.height
        ctx.save()
        ctx.translate(s.x, s.y)
        ctx.rotate(t * 0.6 + s.size)
        // Hard ink shadow
        ctx.fillStyle = zTheme.border
        if (s.kind === 0) {
          ctx.beginPath()
          ctx.arc(4, 4, s.size / 2, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.fillRect(-s.size / 2 + 4, -s.size / 2 + 4, s.size, s.size)
        }
        // Bright candy fill
        ctx.fillStyle = colors[s.colorIdx]
        ctx.strokeStyle = zTheme.border
        ctx.lineWidth = 3
        if (s.kind === 0) {
          ctx.beginPath()
          ctx.arc(0, 0, s.size / 2, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
        } else {
          ctx.fillRect(-s.size / 2, -s.size / 2, s.size, s.size)
          ctx.strokeRect(-s.size / 2, -s.size / 2, s.size, s.size)
        }
        ctx.restore()
      })

      // Bold layered pop ribbon waves
      colors.forEach((col, cIdx) => {
        ctx.beginPath()
        for (let x = 0; x <= cvs.width; x += 8) {
          const y =
            cvs.height / 2 +
            Math.sin(x * 0.012 + t * (1.4 + cIdx * 0.35) + cIdx) *
              (42 + cIdx * 14)
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.strokeStyle = zTheme.border
        ctx.lineWidth = 10
        ctx.stroke()
        ctx.strokeStyle = col
        ctx.lineWidth = 5
        ctx.stroke()
      })

      animId = window.requestAnimationFrame(render)
    }
    render()
    return () => window.cancelAnimationFrame(animId)
  }, [
    cinemaMode,
    slate.videoUrl,
    zTheme.paperBg,
    zTheme.dotGridColor,
    zTheme.border,
    zTheme.heroYellow,
    zTheme.popPink,
    zTheme.popCyan,
    zTheme.popLime,
  ])

  // Master Soundtrack Audio & Multi-Color Spectrum Visualizer
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceConnectedRef = useRef(false)
  const spectrumCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const [audioPlaying, setAudioPlaying] = useState(false)
  const [audioTime, setAudioTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [audioVolume, setAudioVolume] = useState(0.85)
  const [synthFallbackPlaying, setSynthFallbackPlaying] = useState(false)

  useEffect(() => {
    setAudioPlaying(false)
    setAudioTime(0)
    setAudioDuration(0)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [slate.id, slate.audioUrl])

  useEffect(() => {
    const cvs = spectrumCanvasRef.current
    if (!cvs) return
    const ctx = cvs.getContext('2d')
    if (!ctx) return

    let animId = 0
    let idleTick = 0
    const freqData = new Uint8Array(64)
    const barColors = [
      zTheme.popPink,
      zTheme.heroYellow,
      zTheme.popCyan,
      zTheme.popLime,
    ]

    const drawSpectrum = () => {
      idleTick += 0.08
      ctx.clearRect(0, 0, cvs.width, cvs.height)

      const bars = 28
      const gap = 4
      const barW = (cvs.width - gap * (bars - 1)) / bars

      if (analyserRef.current && audioPlaying) {
        analyserRef.current.getByteFrequencyData(freqData)
      }

      for (let i = 0; i < bars; i++) {
        let ratio = 0.18
        if (analyserRef.current && audioPlaying) {
          ratio = Math.max(0.14, freqData[i] / 255)
        } else if (audioPlaying || synthFallbackPlaying) {
          ratio =
            0.25 +
            0.65 *
              Math.abs(
                Math.sin(idleTick * 1.9 + i * 0.42) *
                  Math.cos(idleTick * 0.8 + i * 0.2)
              )
        } else {
          ratio = 0.14 + 0.07 * Math.sin(idleTick + i * 0.35)
        }

        const h = Math.max(6, ratio * (cvs.height - 4))
        const x = i * (barW + gap)
        const y = cvs.height - h

        ctx.fillStyle = barColors[i % barColors.length]
        ctx.fillRect(x, y, barW, h)
        ctx.strokeStyle = zTheme.border
        ctx.lineWidth = 1.5
        ctx.strokeRect(x, y, barW, h)
      }

      animId = window.requestAnimationFrame(drawSpectrum)
    }

    drawSpectrum()
    return () => window.cancelAnimationFrame(animId)
  }, [
    audioPlaying,
    synthFallbackPlaying,
    zTheme.border,
    zTheme.heroYellow,
    zTheme.popPink,
    zTheme.popCyan,
    zTheme.popLime,
  ])

  const handleToggleAudio = async () => {
    soundEngine.triggerTactileBlip(860)
    if (slate.audioUrl && audioRef.current) {
      if (audioPlaying) {
        audioRef.current.pause()
        setAudioPlaying(false)
      } else {
        try {
          if (!audioCtxRef.current) {
            const AudioCtx =
              window.AudioContext ||
              (window as unknown as { webkitAudioContext: typeof AudioContext })
                .webkitAudioContext
            audioCtxRef.current = new AudioCtx()
          }
          if (audioCtxRef.current.state === 'suspended') {
            await audioCtxRef.current.resume()
          }
          if (!sourceConnectedRef.current && audioCtxRef.current) {
            const analyser = audioCtxRef.current.createAnalyser()
            analyser.fftSize = 128
            const src = audioCtxRef.current.createMediaElementSource(
              audioRef.current
            )
            src.connect(analyser)
            analyser.connect(audioCtxRef.current.destination)
            analyserRef.current = analyser
            sourceConnectedRef.current = true
          }
        } catch {
          // Fallback to direct playback
        }

        audioRef.current.volume = audioVolume
        audioRef.current
          .play()
          .then(() => setAudioPlaying(true))
          .catch(() => {
            soundEngine.playProceduralCardTrack(slate.phaseIndex)
            setSynthFallbackPlaying(true)
            window.setTimeout(() => setSynthFallbackPlaying(false), 4500)
          })
      }
    } else {
      soundEngine.playProceduralCardTrack(slate.phaseIndex)
      setSynthFallbackPlaying(true)
      window.setTimeout(() => setSynthFallbackPlaying(false), 4500)
    }
  }

  // Interactive Pluckable Rainbow Wave Toy in Spread 03
  const waveToyRef = useRef<HTMLCanvasElement | null>(null)
  const [waveAmpBoost, setWaveAmpBoost] = useState(0)
  useEffect(() => {
    const cvs = waveToyRef.current
    if (!cvs) return
    const ctx = cvs.getContext('2d')
    if (!ctx) return

    let animId = 0
    let ph = 0
    const drawWave = () => {
      ph += 0.09
      ctx.fillStyle = zTheme.inputBg
      ctx.fillRect(0, 0, cvs.width, cvs.height)

      const amp = 14 + waveAmpBoost * 20
      const layers = [
        { color: zTheme.popCyan, offset: 0 },
        { color: zTheme.popPink, offset: 1.4 },
        { color: zTheme.heroYellow, offset: 2.8 },
      ]

      layers.forEach((l) => {
        ctx.beginPath()
        for (let x = 0; x <= cvs.width; x += 4) {
          const y =
            cvs.height / 2 +
            Math.sin(x * 0.035 + ph + l.offset) * amp * Math.sin(x * 0.01 + ph * 0.4)
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.strokeStyle = zTheme.border
        ctx.lineWidth = 5
        ctx.stroke()
        ctx.strokeStyle = l.color
        ctx.lineWidth = 2.5
        ctx.stroke()
      })

      animId = window.requestAnimationFrame(drawWave)
    }
    drawWave()
    return () => window.cancelAnimationFrame(animId)
  }, [
    waveAmpBoost,
    zTheme.inputBg,
    zTheme.border,
    zTheme.popCyan,
    zTheme.popPink,
    zTheme.heroYellow,
  ])

  const handlePluckWave = () => {
    soundEngine.triggerTuningBladeChime('normal')
    setWaveAmpBoost(1)
    window.setTimeout(() => setWaveAmpBoost(0.45), 350)
    window.setTimeout(() => setWaveAmpBoost(0), 900)
  }

  // Lightbox Modal State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  useEffect(() => {
    if (lightboxIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight' && gallery.length > 0) {
        setLightboxIndex((prev) =>
          prev === null ? 0 : (prev + 1) % gallery.length
        )
      }
      if (e.key === 'ArrowLeft' && gallery.length > 0) {
        setLightboxIndex((prev) =>
          prev === null
            ? 0
            : (prev - 1 + gallery.length) % gallery.length
        )
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIndex, gallery.length])

  // Export Standalone HTML Zine State
  const [isExportingHtml, setIsExportingHtml] = useState(false)
  const [exportMsg, setExportMsg] = useState<string | null>(null)

  const handleDownloadStandaloneHtml = async () => {
    if (isExportingHtml) return
    soundEngine.triggerTuningBladeChime('severance')
    setIsExportingHtml(true)
    setExportMsg('Packing Zine...')
    try {
      await exportStandaloneWebpageHtml(
        slate,
        (status) => setExportMsg(status),
        uiTheme
      )
      setExportMsg('Downloaded .HTML Zine!')
      window.setTimeout(() => setExportMsg(null), 3000)
    } finally {
      setIsExportingHtml(false)
    }
  }

  const isPortraitVideo =
    !!slate.gifUrl &&
    (slate.gifUrl.includes('#video') ||
      slate.gifUrl.startsWith('data:video/') ||
      slate.gifUrl.toLowerCase().endsWith('.mp4') ||
      slate.gifUrl.toLowerCase().endsWith('.webm'))

  return (
    <div
      className="relative pop-card overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: zTheme.paperBg,
        backgroundImage: zTheme.paperBgImage,
        backgroundSize: zTheme.paperBgSize,
        color: zTheme.ink,
      }}
    >
      {/* Hidden Audio Element */}
      {slate.audioUrl && (
        <audio
          ref={audioRef}
          src={slate.audioUrl}
          crossOrigin="anonymous"
          onLoadedMetadata={(e) =>
            setAudioDuration(e.currentTarget.duration || 0)
          }
          onTimeUpdate={(e) => setAudioTime(e.currentTarget.currentTime || 0)}
          onEnded={() => setAudioPlaying(false)}
        />
      )}

      {/* ==================== 1. CANDY PALETTE REMIXER & HTML EXPORT BAR ==================== */}
      <div
        className="px-4 sm:px-7 py-3.5 border-b-[3px] theme-border flex flex-wrap items-center justify-between gap-3"
        style={{ backgroundColor: zTheme.cardBg }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span
            style={{
              backgroundColor: zTheme.tickerBg,
              color: zTheme.heroYellow,
            }}
            className="font-mono-zine text-xs font-bold uppercase px-2.5 py-1 rounded-full"
          >
            🎨 Zine Vibe:
          </span>
          {ZINE_PALETTES.map((zp) => {
            const active = zp.finishId === slate.finish
            return (
              <button
                key={zp.finishId}
                type="button"
                onClick={() => {
                  soundEngine.triggerTactileBlip(820)
                  setVibeCustomized(true)
                  onUpdateSlate?.({ finish: zp.finishId as SlateFinishId })
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold border-2 theme-border transition-all cursor-pointer flex items-center gap-1.5 ${
                  active
                    ? '-translate-y-0.5 scale-105'
                    : 'opacity-85 hover:opacity-100 hover:-translate-y-0.5'
                }`}
                style={{
                  backgroundColor: active ? zp.heroYellow : zp.paperBg,
                  color: zp.ink,
                  boxShadow: active ? '3px 3px 0 var(--ui-border)' : undefined,
                }}
              >
                <span>{zp.emoji}</span>
                <span className="hidden sm:inline">{zp.name}</span>
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={handleDownloadStandaloneHtml}
          disabled={isExportingHtml}
          className="pop-btn px-4 py-2 font-display font-extrabold text-xs sm:text-sm uppercase tracking-wide flex items-center gap-2 cursor-pointer"
          style={{
            backgroundColor: zTheme.popLime,
            color: zTheme.popLimeInk,
          }}
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          {exportMsg || 'Download Standalone .HTML Zine'}
        </button>
      </div>

      {/* ==================== MAIN ZINE PLAYGROUND CANVAS ==================== */}
      <div className="p-5 sm:p-8 lg:p-10 space-y-10 halftone-dots">
        {/* ==================== 2. MAGAZINE COVER MASTHEAD COLLAGE ==================== */}
        <header
          className="relative pop-card p-6 sm:p-8 overflow-hidden"
          style={{ backgroundColor: zTheme.mastheadBg }}
        >
          {/* Floating decorative halftone circles */}
          <div
            className="pointer-events-none absolute -right-12 -top-12 w-52 h-52 rounded-full border-[3px] theme-border opacity-85"
            style={{ backgroundColor: zTheme.popPink }}
          />
          <div
            className="pointer-events-none absolute right-24 -bottom-10 w-28 h-28 rounded-full border-[3px] theme-border opacity-90"
            style={{ backgroundColor: zTheme.popCyan }}
          />

          <div className="relative z-10 flex flex-col gap-4">
            {/* Top Sticker Badges Row */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className="px-3.5 py-1 rounded-full border-2 theme-border font-mono-zine text-xs font-bold uppercase -rotate-2"
                style={{
                  backgroundColor: zTheme.popPink,
                  color: zTheme.popPinkInk,
                  boxShadow: '3px 3px 0 var(--ui-border)',
                }}
              >
                ★ ISSUE #{String(slate.phaseIndex).padStart(2, '0')} //{' '}
                {slate.classification}
              </span>

              <span
                style={{
                  backgroundColor: zTheme.surfaceElevated,
                  color: zTheme.ink,
                }}
                className="px-3 py-1 rounded-full border-2 theme-border font-mono-zine text-xs font-bold uppercase rotate-1"
              >
                📍 {slate.nodeTag.replace('NODE: ', '')}
              </span>

              <span
                className="px-3 py-1 rounded-full border-2 theme-border font-mono-zine text-xs font-bold uppercase -rotate-1"
                style={{
                  backgroundColor: zTheme.popCyan,
                  color: zTheme.popCyanInk,
                }}
              >
                SEED: {slate.hexSeed}
              </span>
            </div>

            {/* Giant Expressive Zine Title */}
            <h1
              style={{
                color: zTheme.mastheadInk,
                textShadow: isDarkStudio
                  ? `3px 3px 0px ${zTheme.border}`
                  : '3px 3px 0px #FFFFFF',
              }}
              className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-tight leading-[0.94] max-w-4xl"
            >
              {slate.title}
            </h1>

            {/* Fun Story Pill Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span
                style={{
                  backgroundColor: zTheme.surfaceElevated,
                  color: zTheme.ink,
                  boxShadow: '2px 2px 0 var(--ui-border)',
                }}
                className="px-3 py-1.5 rounded-xl border-2 theme-border text-xs font-bold"
              >
                🏙️ <strong>World:</strong> {slate.environmentBiome}
              </span>
              <span
                className="px-3 py-1.5 rounded-xl border-2 theme-border text-xs font-bold"
                style={{
                  backgroundColor: zTheme.popLime,
                  color: zTheme.popLimeInk,
                  boxShadow: '2px 2px 0 var(--ui-border)',
                }}
              >
                ⚡ <strong>Move:</strong> {slate.action}
              </span>
              <span
                style={{
                  backgroundColor: zTheme.surfaceElevated,
                  color: zTheme.ink,
                  boxShadow: '2px 2px 0 var(--ui-border)',
                }}
                className="px-3 py-1.5 rounded-xl border-2 theme-border text-xs font-bold"
              >
                🎯 <strong>Encounter:</strong>{' '}
                {slate.encounterTarget.split('(')[0].trim()}
              </span>
            </div>
          </div>
        </header>

        {/* ==================== 3. LOCKED ASYMMETRIC MEDIA WALL (16:9 TV + BOOMBOX + 9:16 COLLECTOR LOOP) ==================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-stretch">
          {/* LEFT 8 COLS: 16:9 Cinema Monitor + Tactile Vinyl Boombox */}
          <div className="lg:col-span-8 flex flex-col justify-between gap-6">
            {/* 16:9 Retro-Pop Cinema TV */}
            <div
              style={{ backgroundColor: zTheme.surfaceBg }}
              className="pop-card overflow-hidden"
            >
              {/* Retro Toy Window Header */}
              <div
                className="px-4 py-2.5 border-b-[3px] theme-border flex flex-wrap items-center justify-between gap-2"
                style={{
                  backgroundColor: zTheme.popCyan,
                  color: zTheme.popCyanInk,
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#FF2A85] border-2 border-[#121212]" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#FFE600] border-2 border-[#121212]" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#B8FF00] border-2 border-[#121212]" />
                  <span className="font-mono-zine text-xs font-bold uppercase ml-1">
                    🎬 1080P WIDESCREEN CINEMA DECK
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {slate.videoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.triggerTactileBlip(790)
                        setCinemaMode((m) =>
                          m === 'video' ? 'popfx' : 'video'
                        )
                      }}
                      style={{
                        backgroundColor: zTheme.surfaceElevated,
                        color: zTheme.ink,
                      }}
                      className="px-2.5 py-1 rounded-lg border-2 theme-border hover:brightness-110 font-mono-zine text-[11px] font-bold uppercase flex items-center gap-1 cursor-pointer"
                    >
                      {cinemaMode === 'video' ? (
                        <>
                          <Sparkles className="w-3.5 h-3.5" /> Pop FX Canvas
                        </>
                      ) : (
                        <>
                          <Film className="w-3.5 h-3.5" /> 1080p Video
                        </>
                      )}
                    </button>
                  )}

                  {slate.videoUrl && cinemaMode === 'video' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.muted = !videoMuted
                          setVideoMuted(!videoMuted)
                        }
                      }}
                      style={{
                        backgroundColor: zTheme.surfaceElevated,
                        color: zTheme.ink,
                      }}
                      className="px-2.5 py-1 rounded-lg border-2 theme-border hover:brightness-110 font-mono-zine text-[11px] font-bold uppercase cursor-pointer"
                    >
                      {videoMuted ? '🔇 Unmute' : '🔊 Live'}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      const el = videoRef.current || popCanvasRef.current
                      if (el?.requestFullscreen) el.requestFullscreen()
                    }}
                    style={{
                      backgroundColor: zTheme.surfaceElevated,
                      color: zTheme.ink,
                    }}
                    className="p-1 rounded-lg border-2 theme-border hover:brightness-110 cursor-pointer"
                    title="Fullscreen"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 16:9 Viewport */}
              <div className="relative aspect-video w-full bg-[#121212] overflow-hidden">
                {slate.videoUrl && cinemaMode === 'video' ? (
                  <video
                    ref={videoRef}
                    src={slate.videoUrl}
                    poster={gallery[0]}
                    autoPlay
                    loop
                    muted={videoMuted}
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <canvas
                    ref={popCanvasRef}
                    width={960}
                    height={540}
                    className="w-full h-full object-cover"
                  />
                )}

                <div
                  className="pointer-events-none absolute bottom-3 left-3 px-3 py-1 rounded-full border-2 theme-border font-mono-zine text-[11px] font-bold uppercase"
                  style={{
                    backgroundColor: zTheme.heroYellow,
                    color: zTheme.heroYellowInk,
                    boxShadow: '2px 2px 0 var(--ui-border)',
                  }}
                >
                  {slate.cameraAngle}
                </div>
              </div>
            </div>

            {/* Tactile Boombox / Spinning Vinyl Soundtrack Deck */}
            <div
              className="pop-card p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4"
              style={{ backgroundColor: zTheme.tile2, color: zTheme.ink }}
            >
              {/* Spinning Vinyl + Play Button */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleToggleAudio}
                  className="pop-btn px-5 py-3 font-display font-extrabold text-sm uppercase flex items-center gap-2 cursor-pointer"
                  style={{
                    backgroundColor: audioPlaying
                      ? zTheme.popLime
                      : zTheme.popPink,
                    color: audioPlaying
                      ? zTheme.popLimeInk
                      : zTheme.popPinkInk,
                  }}
                >
                  {audioPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" /> Pause Song
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" /> Play Song
                    </>
                  )}
                </button>

                <div
                  className={`w-11 h-11 rounded-full border-[3px] theme-border bg-[#121212] flex items-center justify-center shrink-0 ${
                    audioPlaying || synthFallbackPlaying
                      ? 'animate-vinyl-spin'
                      : ''
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full border-2 border-[#121212] flex items-center justify-center"
                    style={{
                      backgroundColor: zTheme.heroYellow,
                      color: zTheme.heroYellowInk,
                    }}
                  >
                    <Disc3 className="w-3 h-3" />
                  </div>
                </div>
              </div>

              {/* Scrubber & Track Name */}
              <div className="flex-1 w-full min-w-0 space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-xs font-bold">
                  <span className="truncate">
                    🎵 {slate.audioTitle || 'Cyber-Noir Synthwave Track'}
                  </span>
                  <span className="font-mono-zine text-[11px] shrink-0">
                    {slate.audioUrl
                      ? `${formatSeconds(audioTime)} / ${formatSeconds(
                          audioDuration
                        )}`
                      : 'SYNTH READY'}
                  </span>
                </div>

                <input
                  type="range"
                  min={0}
                  max={audioDuration || 100}
                  step={0.1}
                  value={audioTime}
                  disabled={!slate.audioUrl}
                  onChange={(e) => {
                    const next = Number(e.target.value)
                    setAudioTime(next)
                    if (audioRef.current) audioRef.current.currentTime = next
                  }}
                  style={{
                    accentColor: zTheme.popPink,
                    backgroundColor: zTheme.inputBg,
                  }}
                  className="w-full h-2.5 rounded-full border-2 theme-border cursor-pointer"
                />
              </div>

              {/* Candy Spectrum Visualizer + Volume */}
              <div className="flex items-center gap-3 shrink-0">
                <canvas
                  ref={spectrumCanvasRef}
                  width={156}
                  height={42}
                  style={{ backgroundColor: zTheme.inputBg }}
                  className="w-[140px] sm:w-[156px] h-[42px] rounded-xl border-2 theme-border p-1"
                />
                <button
                  type="button"
                  onClick={() => {
                    const nextVol = audioVolume > 0 ? 0 : 0.85
                    setAudioVolume(nextVol)
                    if (audioRef.current) audioRef.current.volume = nextVol
                  }}
                  style={{
                    backgroundColor: zTheme.surfaceElevated,
                    color: zTheme.ink,
                  }}
                  className="p-2 rounded-xl border-2 theme-border hover:brightness-110 cursor-pointer"
                  title="Mute / Unmute Music"
                >
                  {audioVolume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT 4 COLS: Tilted 9:16 Vertical Arcade / Collector Loop */}
          <div className="lg:col-span-4 flex flex-col">
            <div
              className="relative flex-1 pop-card p-4 flex flex-col justify-between lg:rotate-[1.2deg] hover:rotate-0 transition-transform duration-300"
              style={{ backgroundColor: zTheme.surfaceBg }}
            >
              {/* Decorative Washi Tape Strip on Top */}
              <div className="washi-tape absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-6 rounded-sm -rotate-2 z-20 pointer-events-none" />

              <div className="flex items-center justify-between pb-3">
                <span
                  className="px-3 py-1 rounded-full border-2 theme-border font-mono-zine text-xs font-bold uppercase"
                  style={{
                    backgroundColor: zTheme.popPink,
                    color: zTheme.popPinkInk,
                  }}
                >
                  📱 9:16 KINETIC LOOP
                </span>
                <span className="font-mono-zine text-[11px] font-bold">
                  {slate.gifUrl ? '★ LIVE' : 'PORTRAIT'}
                </span>
              </div>

              <div className="relative aspect-[9/16] w-full rounded-2xl border-[3px] theme-border bg-[#121212] overflow-hidden">
                {slate.gifUrl ? (
                  isPortraitVideo ? (
                    <video
                      src={slate.gifUrl.split('#')[0]}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={slate.gifUrl}
                      alt="9:16 Kinetic Loop"
                      className="w-full h-full object-cover"
                    />
                  )
                ) : gallery[0] ? (
                  <img
                    src={gallery[0]}
                    alt="9:16 Portrait Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-mono-zine text-xs text-white p-4 text-center">
                    Drop your 9:16 GIF or vertical MP4 in Step 3!
                  </div>
                )}

                <div
                  className="pointer-events-none absolute bottom-3 right-3 px-3 py-1 rounded-full border-2 theme-border font-mono-zine text-[10px] font-bold uppercase -rotate-2"
                  style={{
                    backgroundColor: zTheme.popLime,
                    color: zTheme.popLimeInk,
                    boxShadow: '2px 2px 0 var(--ui-border)',
                  }}
                >
                  LOOPING FOREVER ∞
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 4. KINETIC SCROLLING ZINE TICKER RIBBON ==================== */}
        <div
          className="pop-card py-2.5 overflow-hidden border-[3px] theme-border"
          style={{
            backgroundColor: zTheme.tickerBg,
            color: zTheme.tickerText,
          }}
        >
          <div className="animate-zine-marquee font-mono-zine text-xs sm:text-sm font-bold uppercase tracking-widest">
            <span className="mx-6">
              ★ 3-ACT GRAPHIC CHRONICLE ★ 4 DISTINCT CAMERA SHOTS ★{' '}
              {slate.actPhase} ★ {slate.lightingStyle} ★ CLICK ANY PRINT FOR 2K
              LIGHTBOX ★
            </span>
            <span className="mx-6">
              ★ 3-ACT GRAPHIC CHRONICLE ★ 4 DISTINCT CAMERA SHOTS ★{' '}
              {slate.actPhase} ★ {slate.lightingStyle} ★ CLICK ANY PRINT FOR 2K
              LIGHTBOX ★
            </span>
          </div>
        </div>

        {/* ==================== 5. EXPERIMENTAL ZIG-ZAG ZINE SPREADS (3 ACTS × 4 DISTINCT SHOTS) ==================== */}
        <div className="space-y-12">
          {/* ---------- SPREAD 01: ACT I (LEFT) + SHOT 01 WIDE WORLD (RIGHT) ---------- */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-center">
            <article
              className="lg:col-span-5 pop-card p-6 sm:p-8 relative overflow-hidden"
              style={{ backgroundColor: zTheme.tile1, color: zTheme.ink }}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="px-3 py-1 rounded-full border-2 theme-border font-mono-zine text-xs font-bold uppercase"
                  style={{
                    backgroundColor: zTheme.heroYellow,
                    color: zTheme.heroYellowInk,
                    boxShadow: '2px 2px 0 var(--ui-border)',
                  }}
                >
                  ACT 01 // THE SETUP
                </span>
                <span className="font-display text-5xl font-extrabold opacity-20 select-none">
                  01
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase leading-tight mb-3">
                Entering {slate.environmentBiome}
              </h2>
              <p className="text-base sm:text-[17px] leading-relaxed font-medium opacity-95 whitespace-pre-line">
                {slate.acts.sceneSetup}
              </p>
            </article>

            {gallery[0] && (
              <div
                onClick={() => setLightboxIndex(0)}
                style={{ backgroundColor: zTheme.surfaceBg }}
                className="lg:col-span-7 relative pop-card pop-card-lift p-3 sm:p-4 cursor-pointer lg:rotate-[1deg] hover:rotate-0"
              >
                <div className="washi-tape absolute -top-3 right-10 w-28 h-6 rounded-sm rotate-2 z-20 pointer-events-none" />
                <div className="aspect-[16/10] rounded-xl border-[2.5px] theme-border overflow-hidden bg-[#121212]">
                  <img
                    src={gallery[0]}
                    alt="Shot 01 Wide World"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="pt-3 px-1 flex flex-wrap items-center justify-between gap-2">
                  <span
                    className="px-3 py-1 rounded-full border-2 theme-border font-mono-zine text-xs font-bold uppercase"
                    style={{
                      backgroundColor: zTheme.popCyan,
                      color: zTheme.popCyanInk,
                    }}
                  >
                    🌍 SHOT 01 // WIDE ESTABLISHING
                  </span>
                  <span className="font-mono-zine text-xs font-bold underline">
                    Pop Open 2K ⤢
                  </span>
                </div>
              </div>
            )}
          </section>

          {/* ---------- SPREAD 02 (REVERSED COLLAGE): SHOT 02 ACTION + INSET SHOT 03 MACRO (LEFT) × ACT II + DOSSIER STICKERS (RIGHT) ---------- */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-center">
            {/* Left 7 Cols: Shot 02 + Overlapping Comic Inset Shot 03 */}
            <div className="lg:col-span-7 space-y-5 order-2 lg:order-1">
              {gallery[1] && (
                <div
                  onClick={() => setLightboxIndex(1)}
                  style={{ backgroundColor: zTheme.surfaceBg }}
                  className="relative pop-card pop-card-lift p-3 sm:p-4 cursor-pointer lg:-rotate-[1deg] hover:rotate-0"
                >
                  <div className="aspect-[16/10] rounded-xl border-[2.5px] theme-border overflow-hidden bg-[#121212]">
                    <img
                      src={gallery[1]}
                      alt="Shot 02 Big Action"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="pt-3 px-1 flex flex-wrap items-center justify-between gap-2">
                    <span
                      className="px-3 py-1 rounded-full border-2 theme-border font-mono-zine text-xs font-bold uppercase"
                      style={{
                        backgroundColor: zTheme.popPink,
                        color: zTheme.popPinkInk,
                      }}
                    >
                      ⚡ SHOT 02 // DYNAMIC ACTION
                    </span>
                    <span className="font-mono-zine text-xs font-bold underline">
                      Pop Open 2K ⤢
                    </span>
                  </div>
                </div>
              )}

              {/* Comic Inset Panel for Shot 03 (Macro Hardware Detail) */}
              {gallery[2] && (
                <div
                  onClick={() => setLightboxIndex(2)}
                  style={{ backgroundColor: zTheme.surfaceBg }}
                  className="sm:w-4/5 sm:ml-auto relative pop-card pop-card-lift p-3 cursor-pointer lg:rotate-[1.5deg] hover:rotate-0"
                >
                  <div className="washi-tape absolute -top-3 left-8 w-24 h-5 rounded-sm -rotate-2 z-20 pointer-events-none" />
                  <div className="aspect-[16/9] rounded-xl border-[2.5px] theme-border overflow-hidden bg-[#121212]">
                    <img
                      src={gallery[2]}
                      alt="Shot 03 Macro Hardware Detail"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="pt-2.5 px-1 flex items-center justify-between">
                    <span
                      className="px-2.5 py-0.5 rounded-full border-2 theme-border font-mono-zine text-[11px] font-bold uppercase"
                      style={{
                        backgroundColor: zTheme.heroYellow,
                        color: zTheme.heroYellowInk,
                      }}
                    >
                      🔍 SHOT 03 // TACTILE MACRO INSERT
                    </span>
                    <span className="font-mono-zine text-[11px] font-bold">
                      2K ⤢
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right 5 Cols: Act II Prose + Trading-Sticker Specs */}
            <div className="lg:col-span-5 space-y-6 order-1 lg:order-2">
              <article
                className="pop-card p-6 sm:p-8"
                style={{ backgroundColor: zTheme.tile2, color: zTheme.ink }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="px-3 py-1 rounded-full border-2 theme-border font-mono-zine text-xs font-bold uppercase"
                    style={{
                      backgroundColor: zTheme.popPink,
                      color: zTheme.popPinkInk,
                      boxShadow: '2px 2px 0 var(--ui-border)',
                    }}
                  >
                    ACT 02 // THE INTERVENTION
                  </span>
                  <span className="font-display text-5xl font-extrabold opacity-20 select-none">
                    02
                  </span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase leading-tight mb-3">
                  {slate.action}
                </h2>
                <p className="text-base sm:text-[17px] leading-relaxed font-medium opacity-95 whitespace-pre-line">
                  {slate.acts.intervention}
                </p>
              </article>

              {/* Playful Collector Sticker Specs */}
              <div
                style={{ backgroundColor: zTheme.surfaceBg }}
                className="pop-card p-5 space-y-3"
              >
                <div className="font-display text-lg font-extrabold uppercase flex items-center gap-2">
                  <span>🏷️</span> Zine Field Notes &amp; Gear
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div
                    className="p-3 rounded-xl border-2 theme-border"
                    style={{ backgroundColor: zTheme.tile1 }}
                  >
                    <div className="font-mono-zine text-[10px] font-bold uppercase opacity-70">
                      OPERATIVE LOOK
                    </div>
                    <div className="font-bold mt-0.5">{slate.attire}</div>
                  </div>
                  <div
                    className="p-3 rounded-xl border-2 theme-border"
                    style={{ backgroundColor: zTheme.tile3 }}
                  >
                    <div className="font-mono-zine text-[10px] font-bold uppercase opacity-70">
                      LIGHTING MOOD
                    </div>
                    <div className="font-bold mt-0.5">
                      {slate.lightingStyle}
                    </div>
                  </div>
                  <div
                    style={{ backgroundColor: zTheme.tile4 }}
                    className="p-3 rounded-xl border-2 theme-border sm:col-span-2"
                  >
                    <div className="font-mono-zine text-[10px] font-bold uppercase opacity-70">
                      WITNESS ANGLE
                    </div>
                    <div className="font-bold mt-0.5">{slate.perspective}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ---------- SPREAD 03: ACT III + PLUCKABLE RAINBOW WAVE TOY (LEFT) × SHOT 04 AFTERMATH (RIGHT) ---------- */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-center">
            <div className="lg:col-span-5 space-y-6">
              <article
                className="pop-card p-6 sm:p-8"
                style={{ backgroundColor: zTheme.tile3, color: zTheme.ink }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="px-3 py-1 rounded-full border-2 theme-border font-mono-zine text-xs font-bold uppercase"
                    style={{
                      backgroundColor: zTheme.popLime,
                      color: zTheme.popLimeInk,
                      boxShadow: '2px 2px 0 var(--ui-border)',
                    }}
                  >
                    ACT 03 // EQUILIBRIUM
                  </span>
                  <span className="font-display text-5xl font-extrabold opacity-20 select-none">
                    03
                  </span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase leading-tight mb-3">
                  The Quiet Aftermath
                </h2>
                <p className="text-base sm:text-[17px] leading-relaxed font-medium opacity-95 whitespace-pre-line">
                  {slate.acts.aftermath}
                </p>
              </article>

              {/* Interactive Pluckable Synth Wave Toy */}
              <div
                onClick={handlePluckWave}
                style={{ backgroundColor: zTheme.surfaceBg }}
                className="pop-card p-4 cursor-pointer hover:-translate-y-0.5 transition-transform"
                title="Click to pluck the synth wave!"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono-zine text-xs font-bold uppercase">
                    🎹 Interactive Resonance Toy
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full border theme-border font-mono-zine text-[10px] font-bold"
                    style={{
                      backgroundColor: zTheme.heroYellow,
                      color: zTheme.heroYellowInk,
                    }}
                  >
                    CLICK TO PLUCK ♪
                  </span>
                </div>
                <canvas
                  ref={waveToyRef}
                  width={380}
                  height={68}
                  className="w-full h-[68px] rounded-xl border-2 theme-border"
                />
              </div>
            </div>

            {gallery[3] && (
              <div
                onClick={() => setLightboxIndex(3)}
                style={{ backgroundColor: zTheme.surfaceBg }}
                className="lg:col-span-7 relative pop-card pop-card-lift p-3 sm:p-4 cursor-pointer lg:rotate-[0.9deg] hover:rotate-0"
              >
                <div className="washi-tape absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-6 rounded-sm -rotate-1 z-20 pointer-events-none" />
                <div className="aspect-[16/10] rounded-xl border-[2.5px] theme-border overflow-hidden bg-[#121212]">
                  <img
                    src={gallery[3]}
                    alt="Shot 04 Quiet Aftermath"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="pt-3 px-1 flex flex-wrap items-center justify-between gap-2">
                  <span
                    className="px-3 py-1 rounded-full border-2 theme-border font-mono-zine text-xs font-bold uppercase"
                    style={{
                      backgroundColor: zTheme.popLime,
                      color: zTheme.popLimeInk,
                    }}
                  >
                    🌅 SHOT 04 // QUIET AFTERMATH
                  </span>
                  <span className="font-mono-zine text-xs font-bold underline">
                    Pop Open 2K ⤢
                  </span>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* ==================== 6. POLAROID CONTACT-SHEET STRIP (ALL LOADED PRINTS) ==================== */}
        {gallery.length > 0 && (
          <section
            className="pop-card p-6 sm:p-8 space-y-6"
            style={{ backgroundColor: zTheme.cardBg }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold uppercase">
                  📸 Complete Polaroid Contact Sheet ({gallery.length} Shots)
                </h3>
                <p
                  style={{ color: zTheme.mutedInk }}
                  className="text-xs sm:text-sm font-medium"
                >
                  Click any instant print below to view full-resolution 2K artwork with keyboard arrow navigation.
                </p>
              </div>
              <span
                className="px-3.5 py-1.5 rounded-full border-2 theme-border font-mono-zine text-xs font-bold uppercase -rotate-1"
                style={{
                  backgroundColor: zTheme.heroYellow,
                  color: zTheme.heroYellowInk,
                }}
              >
                ★ 2K GALLERY ARCHIVE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-2">
              {gallery.map((imgSrc, idx) => {
                const tiltClass =
                  idx % 4 === 0
                    ? 'sm:-rotate-1'
                    : idx % 4 === 1
                    ? 'sm:rotate-1'
                    : idx % 4 === 2
                    ? 'sm:-rotate-[1.5deg]'
                    : 'sm:rotate-[1.5deg]'
                const meta = SHOT_STICKERS[idx] || {
                  badge: `🎞️ BONUS SHOT 0${idx + 1}`,
                  note: 'Extra Plate',
                }
                return (
                  <div
                    key={`${imgSrc}_${idx}`}
                    onClick={() => setLightboxIndex(idx)}
                    style={{ backgroundColor: zTheme.surfaceElevated }}
                    className={`pop-card pop-card-lift p-3 pb-4 cursor-pointer ${tiltClass} hover:rotate-0`}
                  >
                    <div className="aspect-[4/3] rounded-xl border-2 theme-border overflow-hidden bg-[#121212]">
                      <img
                        src={imgSrc}
                        alt={meta.badge}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="pt-3 px-1">
                      <div className="font-mono-zine text-[11px] font-bold uppercase">
                        {meta.badge}
                      </div>
                      <div
                        style={{ color: zTheme.mutedInk }}
                        className="text-xs font-semibold mt-0.5"
                      >
                        {meta.note}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </div>

      {/* ==================== FULLSCREEN POP-ZINE LIGHTBOX ==================== */}
      {lightboxIndex !== null && gallery[lightboxIndex] && (
        <div
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 z-50 bg-[#121212]/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: zTheme.surfaceBg, color: zTheme.ink }}
            className="relative max-w-6xl w-full pop-card p-3 sm:p-5 space-y-3"
          >
            <div className="flex items-center justify-between gap-3">
              <span
                className="px-3.5 py-1 rounded-full border-2 theme-border font-mono-zine text-xs font-bold uppercase"
                style={{
                  backgroundColor: zTheme.heroYellow,
                  color: zTheme.heroYellowInk,
                }}
              >
                {SHOT_STICKERS[lightboxIndex]?.badge ||
                  `SHOT 0${lightboxIndex + 1}`}{' '}
                ({lightboxIndex + 1} / {gallery.length})
              </span>

              <div className="flex items-center gap-2">
                {gallery.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setLightboxIndex(
                          (lightboxIndex - 1 + gallery.length) % gallery.length
                        )
                      }
                      style={{
                        backgroundColor: zTheme.surfaceElevated,
                        color: zTheme.ink,
                      }}
                      className="pop-btn px-3 py-1.5 font-mono-zine text-xs font-bold uppercase flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" /> Prev
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setLightboxIndex((lightboxIndex + 1) % gallery.length)
                      }
                      style={{
                        backgroundColor: zTheme.surfaceElevated,
                        color: zTheme.ink,
                      }}
                      className="pop-btn px-3 py-1.5 font-mono-zine text-xs font-bold uppercase flex items-center gap-1 cursor-pointer"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setLightboxIndex(null)}
                  className="pop-btn px-3 py-1.5 font-mono-zine text-xs font-bold uppercase flex items-center gap-1 cursor-pointer"
                  style={{
                    backgroundColor: zTheme.popPink,
                    color: zTheme.popPinkInk,
                  }}
                >
                  <X className="w-4 h-4" /> Close
                </button>
              </div>
            </div>

            <div className="rounded-xl border-[3px] theme-border bg-[#121212] overflow-hidden flex items-center justify-center">
              <img
                src={gallery[lightboxIndex]}
                alt="2K Lightbox Plate"
                className="max-h-[78vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
