import React, { useState, useRef, useEffect } from 'react'
import {
  Play,
  Pause,
  RotateCw,
  Download,
  Film,
  Image as ImageIcon,
  Volume2,
} from 'lucide-react'
import {
  ArchivalTelemetrySlate,
  SLATE_FINISHES,
  SlateFinishId,
} from '../data/loreArchiveData'
import { soundEngine } from '../utils/soundEngine'
import { exportSlateToPng } from '../utils/pngExporter'

interface ArchivalSlateCardProps {
  slate: ArchivalTelemetrySlate
  compact?: boolean
  externalFlipped?: boolean
  onToggleFlip?: () => void
  onUpdateSlate?: (patch: Partial<ArchivalTelemetrySlate>) => void
  onSelectForStudio?: (slate: ArchivalTelemetrySlate) => void
}

export const ArchivalSlateCard: React.FC<ArchivalSlateCardProps> = ({
  slate,
  compact = false,
  externalFlipped,
  onToggleFlip,
  onUpdateSlate,
  onSelectForStudio,
}) => {
  const [internalFlipped, setInternalFlipped] = useState(false)
  const isFlipped =
    externalFlipped !== undefined ? externalFlipped : internalFlipped

  const [mediaMode, setMediaMode] = useState<'video' | 'still'>(
    slate.videoUrl ? 'video' : 'still'
  )
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [isExporting, setIsExporting] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const synthTimerRef = useRef<number | null>(null)

  const finishMeta =
    SLATE_FINISHES.find((f) => f.id === slate.finish) || SLATE_FINISHES[0]

  useEffect(() => {
    setMediaMode(slate.videoUrl ? 'video' : 'still')
  }, [slate.id, slate.videoUrl])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    if (synthTimerRef.current) {
      window.clearInterval(synthTimerRef.current)
      synthTimerRef.current = null
    }
    setIsAudioPlaying(false)
    setAudioProgress(0)
  }, [slate.id, slate.audioUrl])

  const handleFlip = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    soundEngine.triggerGlitchStutter()
    if (onToggleFlip) {
      onToggleFlip()
    } else {
      setInternalFlipped((prev) => !prev)
    }
  }

  const handleToggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (slate.audioUrl && audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause()
        setIsAudioPlaying(false)
      } else {
        audioRef.current
          .play()
          .then(() => {
            setIsAudioPlaying(true)
          })
          .catch(() => {
            soundEngine.triggerTuningBladeChime('severance')
            soundEngine.toggleAmbientDrone(true)
            setIsAudioPlaying(true)
          })
      }
    } else {
      if (isAudioPlaying) {
        soundEngine.toggleAmbientDrone(false)
        setIsAudioPlaying(false)
        if (synthTimerRef.current) {
          window.clearInterval(synthTimerRef.current)
          synthTimerRef.current = null
        }
      } else {
        soundEngine.triggerTuningBladeChime('severance')
        soundEngine.toggleAmbientDrone(true)
        setIsAudioPlaying(true)
        setAudioDuration(24)
        synthTimerRef.current = window.setInterval(() => {
          setAudioProgress((prev) => (prev >= 24 ? 0 : prev + 0.25))
        }, 250)
      }
    }
  }

  const handleExportPng = async (e: React.MouseEvent) => {
    e.stopPropagation()
    soundEngine.triggerTactileBlip(960)
    setIsExporting(true)
    try {
      await exportSlateToPng(slate, isFlipped ? 'back' : 'front')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* 5:7 Card Container */}
      <div
        className={`slate-perspective w-full aspect-[5/7] select-none ${
          compact ? 'max-w-[360px] mx-auto' : 'max-w-[420px] mx-auto'
        }`}
      >
        <div className={`slate-flip-inner ${isFlipped ? 'is-flipped' : ''}`}>
          {/* ==================== FRONT OF CARD ==================== */}
          <div
            className={`slate-face ${finishMeta.cssClass} reticle-corners p-3.5 flex flex-col justify-between overflow-hidden rounded-xs`}
          >
            {/* Minimal Top Bar */}
            <div className="relative z-20 flex items-center justify-between gap-2 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: finishMeta.accentHex }}
                />
                <span className="text-xs font-bold tracking-wider text-[#00f2ff] truncate uppercase">
                  {slate.nodeTag.replace('NODE: ', '')}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 shrink-0">
                PHASE {String(slate.phaseIndex).padStart(2, '0')}
              </span>
            </div>

            {/* Clean Visual Viewport (Video Loop or 2K Still) */}
            <div className="relative z-20 my-2.5 flex-1 min-h-0 bg-[#06080c] border border-white/15 overflow-hidden group">
              {mediaMode === 'video' && slate.videoUrl ? (
                <video
                  key={slate.videoUrl}
                  src={slate.videoUrl}
                  poster={slate.stillUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={slate.stillUrl}
                  alt={slate.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
              )}

              {/* Simple Top-Right Controls on Image */}
              <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5">
                {slate.videoUrl && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      soundEngine.triggerTactileBlip(680)
                      setMediaMode((m) => (m === 'video' ? 'still' : 'video'))
                    }}
                    className="flex items-center gap-1 bg-black/80 hover:bg-[#00f2ff] text-white hover:text-black border border-white/25 px-2.5 py-1 text-[10px] font-bold uppercase transition-colors cursor-pointer"
                  >
                    {mediaMode === 'video' ? (
                      <>
                        <Film className="w-3 h-3" /> Video
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-3 h-3" /> Image
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Clean Title Overlay at Bottom of Image */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/85 to-transparent pt-10 pb-3 px-3.5">
                <h3 className="font-tactical text-xl font-bold tracking-wide text-white uppercase leading-tight truncate">
                  {slate.title}
                </h3>
                <p className="text-xs text-slate-300 truncate mt-0.5 font-sans">
                  {slate.encounterTarget.split('(')[0].trim()}
                </p>
              </div>
            </div>

            {/* Simple Audio Bar */}
            <div className="relative z-20 bg-[#0d1117]/90 border border-white/15 px-3 py-2 flex items-center gap-3">
              {slate.audioUrl && (
                <audio
                  ref={audioRef}
                  src={slate.audioUrl}
                  onTimeUpdate={() => {
                    if (audioRef.current) {
                      setAudioProgress(audioRef.current.currentTime)
                    }
                  }}
                  onLoadedMetadata={() => {
                    if (audioRef.current) {
                      setAudioDuration(audioRef.current.duration || 0)
                    }
                  }}
                  onEnded={() => setIsAudioPlaying(false)}
                />
              )}

              <button
                type="button"
                onClick={handleToggleAudio}
                className={`w-8 h-8 flex items-center justify-center border transition-all shrink-0 cursor-pointer ${
                  isAudioPlaying
                    ? 'bg-[#00f2ff] text-[#0d1117] border-[#00f2ff]'
                    : 'bg-[#00f2ff]/15 text-[#00f2ff] border-[#00f2ff]/50 hover:bg-[#00f2ff] hover:text-[#0d1117]'
                }`}
              >
                {isAudioPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" />
                )}
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between text-[10px] text-slate-300 mb-1">
                  <span className="truncate flex items-center gap-1 font-medium">
                    <Volume2 className="w-3 h-3 text-[#00f2ff] shrink-0" />
                    {slate.audioTitle || 'Ambient Track'}
                  </span>
                  <span className="text-slate-500 text-[9px] shrink-0">
                    {isAudioPlaying ? 'PLAYING' : 'AUDIO'}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-[#00f2ff] transition-all duration-200"
                    style={{
                      width: `${
                        audioDuration > 0
                          ? Math.min(100, (audioProgress / audioDuration) * 100)
                          : isAudioPlaying
                          ? 45
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Clean Bottom Action Buttons */}
            <div className="relative z-20 mt-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={handleFlip}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#00f2ff]/15 hover:bg-[#00f2ff] text-[#00f2ff] hover:text-[#0d1117] border border-[#00f2ff]/50 text-xs font-bold uppercase transition-colors cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" /> Flip to Story (Back)
              </button>
              <button
                type="button"
                onClick={handleExportPng}
                disabled={isExporting}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#161b22] hover:bg-[#00cc88] text-slate-200 hover:text-[#0d1117] border border-slate-700 text-xs font-bold uppercase transition-colors cursor-pointer"
                title="Download Card as PNG"
              >
                <Download className="w-3.5 h-3.5" /> PNG
              </button>
            </div>
          </div>

          {/* ==================== BACK OF CARD (CLEAN 3-ACT STORY) ==================== */}
          <div
            className={`slate-face slate-face-back ${finishMeta.cssClass} reticle-corners p-4 flex flex-col justify-between overflow-hidden rounded-xs`}
          >
            {/* Back Header */}
            <div className="relative z-20 flex items-center justify-between gap-2 pb-2.5 border-b border-white/15">
              <div className="min-w-0">
                <h4 className="font-tactical text-base font-bold text-white uppercase truncate">
                  {slate.title}
                </h4>
                <div className="text-[11px] text-[#00f2ff] truncate">
                  {slate.actPhase}
                </div>
              </div>
              <button
                type="button"
                onClick={handleFlip}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-[#00f2ff]/20 hover:bg-[#00f2ff] text-[#00f2ff] hover:text-[#0d1117] border border-[#00f2ff]/60 text-xs font-bold uppercase transition-colors shrink-0 cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" /> Front
              </button>
            </div>

            {/* Clean 3-Act Story Log (Readable & Uncluttered) */}
            <div className="relative z-20 my-2.5 flex-1 min-h-0 overflow-y-auto space-y-3 pr-1 font-sans">
              <div className="bg-[#0d1117]/90 border-l-2 border-[#ffaa00] p-2.5">
                <div className="text-[10px] font-mono font-bold uppercase text-[#ffaa00] mb-1">
                  Act I // The Setup
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {slate.acts.sceneSetup}
                </p>
              </div>

              <div className="bg-[#0d1117]/90 border-l-2 border-[#00f2ff] p-2.5">
                <div className="text-[10px] font-mono font-bold uppercase text-[#00f2ff] mb-1">
                  Act II // The Action
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {slate.acts.intervention}
                </p>
              </div>

              <div className="bg-[#0d1117]/90 border-l-2 border-[#00cc88] p-2.5">
                <div className="text-[10px] font-mono font-bold uppercase text-[#00cc88] mb-1">
                  Act III // The Aftermath
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {slate.acts.aftermath}
                </p>
              </div>
            </div>

            {/* Simple Bottom Bar on Back */}
            <div className="relative z-20 pt-2 border-t border-white/15 flex items-center justify-between gap-2">
              <div className="text-[11px] font-mono text-slate-400 truncate">
                {slate.biome}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {onSelectForStudio && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      soundEngine.triggerTactileBlip(880)
                      onSelectForStudio(slate)
                    }}
                    className="px-3 py-1.5 bg-[#00f2ff] text-[#0d1117] text-xs font-bold uppercase cursor-pointer"
                  >
                    Edit Card
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleExportPng}
                  disabled={isExporting}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#161b22] hover:bg-[#00cc88] text-slate-200 hover:text-[#0d1117] border border-slate-700 text-xs font-bold uppercase cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> PNG
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simple 8 Frame Color Swatches (Only in Studio) */}
      {!compact && onUpdateSlate && (
        <div className="max-w-[420px] mx-auto w-full flex items-center justify-between bg-[#161b22]/90 border border-white/10 px-3 py-2">
          <span className="text-xs text-slate-400 font-medium">
            Card Style:
          </span>
          <div className="flex items-center gap-2">
            {SLATE_FINISHES.map((f) => {
              const active = slate.finish === f.id
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    soundEngine.triggerTactileBlip(780)
                    onUpdateSlate({ finish: f.id as SlateFinishId })
                  }}
                  title={`${f.label} (${f.origin})`}
                  className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                    active
                      ? 'scale-125 ring-2 ring-white'
                      : 'opacity-65 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: f.accentHex }}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
