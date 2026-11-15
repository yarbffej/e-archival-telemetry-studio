import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
  Dices,
  Copy,
  Check,
  Upload,
  FolderSync,
  Archive,
  Volume2,
  VolumeX,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Download,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Edit3,
  RotateCw,
  KeyRound,
  Wand2,
  Palette,
  BookOpen,
  Smartphone,
  Monitor,
  Send,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react'
import {
  ArchivalTelemetrySlate,
  NODE_PILLS,
  NodeFilterId,
  CATEGORY_MASTER_50_PHASES,
  MASTER_SEEDS,
  ARCHIVE_94_SCENARIOS,
  INITIAL_VAULT_SLATES,
  CategoryMasterPhase,
} from './data/loreArchiveData'
import { getZinePalette } from './data/zinePalettes'
import {
  STUDIO_UI_THEMES,
  getUiTheme,
  UiThemeId,
} from './data/uiThemes'
import { LoreWebpageView } from './components/LoreWebpageView'
import {
  compileAllFourPrompts,
  parsePastedStoryToActs,
} from './utils/promptCompiler'
import { generateInAppStory } from './utils/storyForge'
import { exportStandaloneWebpageHtml } from './utils/htmlExporter'
import { soundEngine } from './utils/soundEngine'

type ActiveTab = 'STUDIO' | 'VAULT' | 'TIMELINE'
type WizardStep = 1 | 2 | 3

const BUNDLED_MEDIA_POOL = [
  {
    stillUrl: './media/s01_walter.jpg',
    galleryUrls: [
      './media/s01_walter.jpg',
      './media/s01_walter_2.jpg',
      './media/s01_walter_3.jpg',
      './media/s01_walter_4.jpg',
    ],
    gifUrl: './media/sample_916.gif',
    videoUrl: './media/s01_walter.mp4',
    audioUrl: './media/s01_walter.mp3',
    audioTitle: 'Solvent and Steel (Take 2).mp3',
  },
  {
    stillUrl: './media/s02_iron_chapel.jpg',
    galleryUrls: [
      './media/s02_iron_chapel.jpg',
      './media/s02_iron_chapel_2.jpg',
      './media/s02_iron_chapel_3.jpg',
      './media/s02_iron_chapel_4.jpg',
    ],
    gifUrl: './media/sample_916.gif',
    videoUrl: './media/s02_iron_chapel.mp4',
    audioUrl: './media/s02_iron_chapel.mp3',
    audioTitle: 'The Iron Chapel Report.mp3',
  },
  {
    stillUrl: './media/s03_aris.jpg',
    galleryUrls: [
      './media/s03_aris.jpg',
      './media/s04_tuning_blade.jpg',
      './media/s06_log044.jpg',
      './media/s08_phase46.jpg',
    ],
    gifUrl: './media/sample_916.gif',
    videoUrl: './media/s03_aris.mp4',
    audioUrl: './media/s03_aris.mp3',
    audioTitle: 'Silent Lines.mp3',
  },
  {
    stillUrl: './media/s04_tuning_blade.jpg',
    galleryUrls: [
      './media/s04_tuning_blade.jpg',
      './media/s01_walter_2.jpg',
      './media/s05_golden_tether.jpg',
      './media/s09_basalt.jpg',
    ],
    gifUrl: './media/sample_916.gif',
    videoUrl: './media/s04_tuning_blade.mp4',
    audioUrl: './media/s04_tuning_blade.mp3',
    audioTitle: 'Industrial Resonance Archive.mp3',
  },
  {
    stillUrl: './media/s05_golden_tether.jpg',
    galleryUrls: [
      './media/s05_golden_tether.jpg',
      './media/s02_iron_chapel_2.jpg',
      './media/s07_chartreuse.jpg',
      './media/s09_basalt.jpg',
    ],
    gifUrl: './media/sample_916.gif',
    videoUrl: './media/s05_golden_tether.mp4',
    audioUrl: './media/s05_golden_tether.mp3',
    audioTitle: 'Substation Telemetry.mp3',
  },
  {
    stillUrl: './media/s06_log044.jpg',
    galleryUrls: [
      './media/s06_log044.jpg',
      './media/s01_walter_3.jpg',
      './media/s02_iron_chapel_3.jpg',
      './media/s08_phase46.jpg',
    ],
    gifUrl: './media/sample_916.gif',
    videoUrl: './media/s06_log044.mp4',
    audioUrl: './media/s06_log044.mp3',
    audioTitle: 'Field Chronicle 044.mp3',
  },
  {
    stillUrl: './media/s07_chartreuse.jpg',
    galleryUrls: [
      './media/s07_chartreuse.jpg',
      './media/s02_iron_chapel_4.jpg',
      './media/s03_aris.jpg',
      './media/s09_basalt.jpg',
    ],
    gifUrl: './media/sample_916.gif',
    videoUrl: './media/s07_chartreuse.mp4',
    audioUrl: './media/s07_chartreuse.mp3',
    audioTitle: 'Sub-Sector 4 Incident (1).mp3',
  },
  {
    stillUrl: './media/s08_phase46.jpg',
    galleryUrls: [
      './media/s08_phase46.jpg',
      './media/s01_walter_4.jpg',
      './media/s06_log044.jpg',
      './media/s04_tuning_blade.jpg',
    ],
    gifUrl: './media/sample_916.gif',
    videoUrl: './media/s08_phase46.mp4',
    audioUrl: './media/s08_phase46.mp3',
    audioTitle: 'Event_ Absolute Filtration.mp3',
  },
  {
    stillUrl: './media/s09_basalt.jpg',
    galleryUrls: [
      './media/s09_basalt.jpg',
      './media/s02_iron_chapel_2.jpg',
      './media/s05_golden_tether.jpg',
      './media/s01_walter_3.jpg',
    ],
    gifUrl: './media/sample_916.gif',
    videoUrl: './media/s09_basalt.mp4',
    audioUrl: './media/s09_basalt.mp3',
    audioTitle: 'Basalt Conduit Lockout.mp3',
  },
]

const STORYBOARD_CARD_STYLES = [
  { headerBg: '#00E5FF', textCol: '#121212', emoji: '🌍' },
  { headerBg: '#FF2A85', textCol: '#FFFFFF', emoji: '⚡' },
  { headerBg: '#FFE600', textCol: '#121212', emoji: '🔍' },
  { headerBg: '#B8FF00', textCol: '#121212', emoji: '🌅' },
]

function buildSlateFromPhase(
  phase: CategoryMasterPhase,
  overrideNode?: NodeFilterId
): ArchivalTelemetrySlate {
  const effectiveNode =
    overrideNode && overrideNode !== 'ALL' ? overrideNode : phase.nodeFilter
  const pillMeta =
    NODE_PILLS.find((n) => n.id === effectiveNode) || NODE_PILLS[0]

  const matchingSeeds = MASTER_SEEDS.filter(
    (s) => effectiveNode === 'ALL' || s.nodeFilter === effectiveNode
  )
  const chosenSeed =
    matchingSeeds[phase.index % matchingSeeds.length] || MASTER_SEEDS[0]

  const media =
    BUNDLED_MEDIA_POOL[(phase.index - 1) % BUNDLED_MEDIA_POOL.length]

  const hexPrefix = Math.floor(256 + ((phase.index * 137) % 3800))
    .toString(16)
    .toUpperCase()
  const codeSlug = phase.actPhase
    .replace(/^Phase \d+:\s*/i, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .toUpperCase()
    .slice(0, 10)

  const densityVal = (88 + ((phase.index * 7.3) % 11.8)).toFixed(1)

  return {
    id: `SLATE_P${String(phase.index).padStart(2, '0')}_${Date.now().toString(36)}`,
    title: phase.actPhase.replace(/^Phase \d+:\s*/i, '').toUpperCase(),
    nodeTag:
      overrideNode && overrideNode !== 'ALL'
        ? pillMeta.nodeHeaderTag
        : phase.nodeTag,
    nodeFilter: effectiveNode,
    classification: phase.index % 3 === 0 ? 'SEVERANCE TARGET' : 'OPERATIVE',
    hexSeed: `0x${hexPrefix}_${codeSlug}`,
    finish:
      overrideNode && overrideNode !== 'ALL'
        ? pillMeta.defaultFinish
        : phase.finish,
    fpsOverlay: pillMeta.freqLabel,
    phaseIndex: phase.index,
    actPhase: phase.actPhase,
    action: phase.action,
    attire: phase.attire,
    biome: phase.biome,
    cameraAngle: phase.cameraAngle,
    encounterTarget: phase.encounterTarget,
    environmentBiome: phase.environmentBiome,
    lightingStyle: phase.lightingStyle,
    perspective: phase.perspective,
    masterSeedTitle: chosenSeed.title,
    stillUrl: media.stillUrl,
    galleryUrls: media.galleryUrls,
    gifUrl: media.gifUrl,
    videoUrl: media.videoUrl,
    audioUrl: media.audioUrl,
    audioTitle: media.audioTitle,
    driveFolderId: phase.archiveFolderId,
    acts: {
      sceneSetup: `Within ${phase.environmentBiome} (${phase.biome}), ${phase.encounterTarget} operates under heavy atmospheric and mechanical pressure. Observed via ${phase.perspective} under ${phase.lightingStyle.toLowerCase()}, the surrounding infrastructure hums with unresolved system load.`,
      intervention: `Framed in ${phase.cameraAngle.toLowerCase()}, the masked operative (${phase.attire}) moves into position and executes a deliberate physical intervention: ${phase.action.toLowerCase()}.`,
      aftermath: `The mechanical and environmental strain subsides into quiet stillness. The operative departs into the shadows without looking back, leaving ${phase.environmentBiome.toLowerCase()} in stabilized equilibrium.`,
    },
    diagnostics: {
      obligationDensity: `CRITICAL // ${densityVal}%`,
      severanceDepth: 'ABSOLUTE // 432Hz',
      absenceRadius: `EXPANDING // ${(14 + (phase.index % 35)).toFixed(1)}m`,
      cleanseEfficiency: '100.00% (ANOMALOUS)',
    },
  }
}

function probeVideoOrientation(url: string): Promise<'portrait' | 'landscape'> {
  return new Promise((resolve) => {
    const v = document.createElement('video')
    v.preload = 'metadata'
    const done = (result: 'portrait' | 'landscape') => {
      v.onloadedmetadata = null
      v.onerror = null
      resolve(result)
    }
    const timer = window.setTimeout(() => done('landscape'), 1500)
    v.onloadedmetadata = () => {
      window.clearTimeout(timer)
      if (v.videoWidth > 0 && v.videoHeight > v.videoWidth) {
        done('portrait')
      } else {
        done('landscape')
      }
    }
    v.onerror = () => {
      window.clearTimeout(timer)
      done('landscape')
    }
    v.src = url
  })
}

const IS_LOCAL_STUDIO = Boolean(
  (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV
)

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('STUDIO')
  const [wizardStep, setWizardStep] = useState<WizardStep>(1)
  const [builderCollapsed, setBuilderCollapsed] = useState(false)
  const [selectedNodeFilter, setSelectedNodeFilter] =
    useState<NodeFilterId>('ALL')

  // Mobile / Hosted Zine Reader Mode Detection
  const forceStudioParam = useMemo(() => {
    try {
      return new URLSearchParams(window.location.search).get('studio') === '1'
    } catch {
      return false
    }
  }, [])
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  )
  const [previewReaderMode, setPreviewReaderMode] = useState(false)
  const [readerScreen, setReaderScreen] = useState<'SHELF' | 'ISSUE'>('SHELF')
  const [isSavingShelf, setIsSavingShelf] = useState(false)
  const [isPublishingPhone, setIsPublishingPhone] = useState(false)
  const [isRefreshingShelf, setIsRefreshingShelf] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const onChange = (e: MediaQueryListEvent) => setIsMobileViewport(e.matches)
    setIsMobileViewport(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const isReaderMode =
    (!IS_LOCAL_STUDIO && !forceStudioParam) ||
    isMobileViewport ||
    previewReaderMode

  // Studio UI Background Theme Engine (Pop-Zine, Slime, Mechanical, Gothic, Horror, Futuristic, Forest Crystal, etc.)
  const [uiThemeId, setUiThemeId] = useState<UiThemeId>(() => {
    try {
      return (
        (window.localStorage.getItem('me_studio_ui_theme') as UiThemeId) ||
        'pop-zine'
      )
    } catch {
      return 'pop-zine'
    }
  })
  const activeUiTheme = useMemo(() => getUiTheme(uiThemeId), [uiThemeId])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--ui-middle-bg', activeUiTheme.middleBg)
    root.style.setProperty('--ui-middle-image', activeUiTheme.middleBgImage)
    root.style.setProperty('--ui-middle-size', activeUiTheme.middleBgSize)
    root.style.setProperty('--ui-surface', activeUiTheme.surfaceBg)
    root.style.setProperty('--ui-elevated', activeUiTheme.surfaceElevated)
    root.style.setProperty('--ui-tile-1', activeUiTheme.tile1)
    root.style.setProperty('--ui-tile-2', activeUiTheme.tile2)
    root.style.setProperty('--ui-tile-3', activeUiTheme.tile3)
    root.style.setProperty('--ui-tile-4', activeUiTheme.tile4)
    root.style.setProperty('--ui-input-bg', activeUiTheme.inputBg)
    root.style.setProperty('--ui-ink', activeUiTheme.ink)
    root.style.setProperty('--ui-muted', activeUiTheme.mutedInk)
    root.style.setProperty('--ui-border', activeUiTheme.borderColor)
    root.style.setProperty('--ui-shadow', activeUiTheme.cardShadowColor)
    root.style.setProperty('--ui-subshadow', activeUiTheme.subShadowColor)
    root.style.setProperty('--ui-glow', activeUiTheme.cardGlowColor)
    root.style.setProperty('--ui-scroll-track', activeUiTheme.scrollTrack)
    root.style.setProperty('--ui-scroll-thumb', activeUiTheme.scrollThumb)
    document.body.style.backgroundColor = activeUiTheme.bgColor
    document.body.style.backgroundImage = activeUiTheme.bgImage
    document.body.style.backgroundSize = activeUiTheme.bgSize
    document.body.style.backgroundAttachment = 'fixed'
  }, [activeUiTheme])

  const handleSelectUiTheme = (id: UiThemeId) => {
    setUiThemeId(id)
    const idx = STUDIO_UI_THEMES.findIndex((t) => t.id === id)
    soundEngine.triggerTactileBlip(660 + Math.max(0, idx) * 35)
    try {
      window.localStorage.setItem('me_studio_ui_theme', id)
    } catch {
      // ignore storage errors
    }
  }

  const handleRandomUiTheme = () => {
    const pool = STUDIO_UI_THEMES.filter((t) => t.id !== uiThemeId)
    const pick =
      pool[Math.floor(Math.random() * pool.length)] || STUDIO_UI_THEMES[0]
    handleSelectUiTheme(pick.id)
    showToast(`${pick.emoji} Backdrop Theme: ${pick.name}!`)
  }

  // Active Zine Issue
  const [activeSlate, setActiveSlate] = useState<ArchivalTelemetrySlate>(
    INITIAL_VAULT_SLATES[0]
  )

  // Visual 3-Reel Gacha Spin Animation State
  const [isSpinning, setIsSpinning] = useState(false)
  const [reelStage, setReelStage] = useState<0 | 1 | 2 | 3>(3)
  const [jackpotBurst, setJackpotBurst] = useState(false)
  const [spinDisplay, setSpinDisplay] = useState({
    world: INITIAL_VAULT_SLATES[0].environmentBiome,
    action: INITIAL_VAULT_SLATES[0].action,
    target: INITIAL_VAULT_SLATES[0].encounterTarget.split('(')[0].trim(),
    phaseIndex: INITIAL_VAULT_SLATES[0].phaseIndex,
  })
  const spinCleanupRef = useRef<{
    interval?: number
    timeouts: number[]
  }>({ timeouts: [] })

  const clearSpinTimers = () => {
    if (spinCleanupRef.current.interval !== undefined) {
      window.clearInterval(spinCleanupRef.current.interval)
      spinCleanupRef.current.interval = undefined
    }
    spinCleanupRef.current.timeouts.forEach((id) => window.clearTimeout(id))
    spinCleanupRef.current.timeouts = []
  }

  useEffect(() => {
    return () => clearSpinTimers()
  }, [])

  // Keep Gacha Reel display synced when user picks a phase manually or syncs Drive
  useEffect(() => {
    if (isSpinning) return
    setSpinDisplay({
      world: activeSlate.environmentBiome,
      action: activeSlate.action,
      target: activeSlate.encounterTarget.split('(')[0].trim(),
      phaseIndex: activeSlate.phaseIndex,
    })
  }, [
    activeSlate.id,
    activeSlate.environmentBiome,
    activeSlate.action,
    activeSlate.encounterTarget,
    activeSlate.phaseIndex,
    isSpinning,
  ])

  // Zine Shelf (Vault) — Hydrated from published ./shelf-issues.json on Desktop & Mobile Reader
  const [vaultSlates, setVaultSlates] = useState<ArchivalTelemetrySlate[]>(
    INITIAL_VAULT_SLATES
  )
  const [selectedVaultId, setSelectedVaultId] = useState<string>(
    INITIAL_VAULT_SLATES[0].id
  )

  const loadPublishedShelf = async (announce = false) => {
    setIsRefreshingShelf(true)
    try {
      const res = await fetch(`./shelf-issues.json?t=${Date.now()}`, {
        cache: 'no-store',
      })
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data?.slates) && data.slates.length > 0) {
        const loaded: ArchivalTelemetrySlate[] = data.slates
        setVaultSlates(loaded)
        setSelectedVaultId((prevId) =>
          loaded.some((s) => s.id === prevId) ? prevId : loaded[0].id
        )
        if (announce) {
          soundEngine.triggerTuningBladeChime('normal')
          showToast(`📚 Synced ${loaded.length} Zine Issues!`)
        }
      }
    } catch {
      if (announce) {
        showToast('📚 Shelf is using bundled issues')
      }
    } finally {
      setIsRefreshingShelf(false)
    }
  }

  useEffect(() => {
    void loadPublishedShelf(false)
  }, [])

  // Step 1 & 2 State (In-App Story Generator + Prompts)
  const [pastedStoryInput, setPastedStoryInput] = useState('')
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    try {
      return window.localStorage.getItem('me_gemini_api_key') || ''
    } catch {
      return ''
    }
  })
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [autoWriteOnSpin, setAutoWriteOnSpin] = useState(true)
  const [isGeneratingStory, setIsGeneratingStory] = useState(false)
  const [storyEngineBadge, setStoryEngineBadge] = useState<string | null>(null)
  const [storyVariation, setStoryVariation] = useState(0)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [copiedHistory, setCopiedHistory] = useState<string[]>([])
  const [showPromptPreview, setShowPromptPreview] = useState(false)

  const handleSaveGeminiKey = (val: string) => {
    setGeminiApiKey(val)
    try {
      if (val.trim()) {
        window.localStorage.setItem('me_gemini_api_key', val.trim())
      } else {
        window.localStorage.removeItem('me_gemini_api_key')
      }
    } catch {
      // ignore storage errors
    }
  }

  const handleGenerateStoryForSlate = async (
    targetSlate: ArchivalTelemetrySlate,
    variationOverride?: number
  ) => {
    if (isGeneratingStory) return
    const nextVar = variationOverride ?? storyVariation + 1
    setStoryVariation(nextVar)
    setIsGeneratingStory(true)
    setStoryEngineBadge(
      geminiApiKey.trim()
        ? 'Calling Gemini 2.5 Flash...'
        : 'Forging 3-Act Chronicle...'
    )

    try {
      const promptForSlate = compileAllFourPrompts(targetSlate).storyPrompt
      const result = await generateInAppStory(
        targetSlate,
        promptForSlate,
        geminiApiKey,
        nextVar
      )
      setPastedStoryInput(result.rawText)
      setStoryEngineBadge(result.sourceLabel)
      setActiveSlate((prev) =>
        prev.id === targetSlate.id
          ? {
              ...prev,
              title: result.title,
              acts: {
                sceneSetup: result.sceneSetup,
                intervention: result.intervention,
                aftermath: result.aftermath,
              },
            }
          : prev
      )
      soundEngine.triggerTuningBladeChime('normal')
      showToast(`✍️ Wrote 3-Act Story via ${result.sourceLabel}!`)
    } catch (err: any) {
      soundEngine.triggerGlitchStutter()
      setStoryEngineBadge('Gemini Error — check key')
      showToast(`⚠️ ${err?.message || 'Gemini request failed'}`)
    } finally {
      setIsGeneratingStory(false)
    }
  }

  // Step 3 Drive Sync & Export State
  const [driveInputUrl, setDriveInputUrl] = useState('')
  const [syncStatus, setSyncStatus] = useState<string | null>(null)
  const [isSyncingDrive, setIsSyncingDrive] = useState(false)
  const [isExportingStep3, setIsExportingStep3] = useState(false)

  // Audio Drone & Toast
  const [droneActive, setDroneActive] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const compiledPrompts = useMemo(
    () => compileAllFourPrompts(activeSlate),
    [activeSlate]
  )

  const activeGallery = useMemo(() => {
    if (activeSlate.galleryUrls && activeSlate.galleryUrls.length > 0) {
      return activeSlate.galleryUrls
    }
    return activeSlate.stillUrl ? [activeSlate.stillUrl] : []
  }, [activeSlate.galleryUrls, activeSlate.stillUrl])

  const selectedVaultSlate = useMemo(
    () =>
      vaultSlates.find((s) => s.id === selectedVaultId) || vaultSlates[0],
    [vaultSlates, selectedVaultId]
  )

  const showToast = (msg: string) => {
    setToastMsg(msg)
    window.setTimeout(() => setToastMsg(null), 3200)
  }

  const handleUpdateActiveSlate = (patch: Partial<ArchivalTelemetrySlate>) => {
    setActiveSlate((prev) => ({ ...prev, ...patch }))
  }

  // Visual 3-Reel Gacha Spin -> Lock World -> Lock Action -> Lock Encounter
  const handleRollSingleSlate = (nodeOverride?: NodeFilterId) => {
    clearSpinTimers()

    const targetNode = nodeOverride ?? selectedNodeFilter
    const pool =
      targetNode === 'ALL'
        ? CATEGORY_MASTER_50_PHASES
        : CATEGORY_MASTER_50_PHASES.filter((p) => p.nodeFilter === targetNode)
    const candidates = pool.filter((p) => p.index !== activeSlate.phaseIndex)
    const pickPool = candidates.length > 0 ? candidates : pool
    const randomPhase =
      pickPool[Math.floor(Math.random() * pickPool.length)] ||
      CATEGORY_MASTER_50_PHASES[0]
    const nextSlate = buildSlateFromPhase(randomPhase, targetNode)

    const winnerWorld = nextSlate.environmentBiome
    const winnerAction = nextSlate.action
    const winnerTarget = nextSlate.encounterTarget.split('(')[0].trim()

    setIsSpinning(true)
    setReelStage(0)
    setJackpotBurst(false)
    soundEngine.triggerTactileBlip(660)

    let stageLocal: 0 | 1 | 2 | 3 = 0
    let tickCount = 0

    spinCleanupRef.current.interval = window.setInterval(() => {
      tickCount += 1
      const wPick =
        CATEGORY_MASTER_50_PHASES[
          Math.floor(Math.random() * CATEGORY_MASTER_50_PHASES.length)
        ]
      const aPick =
        CATEGORY_MASTER_50_PHASES[
          Math.floor(Math.random() * CATEGORY_MASTER_50_PHASES.length)
        ]
      const tPick =
        CATEGORY_MASTER_50_PHASES[
          Math.floor(Math.random() * CATEGORY_MASTER_50_PHASES.length)
        ]

      setSpinDisplay({
        world: stageLocal >= 1 ? winnerWorld : wPick.environmentBiome,
        action: stageLocal >= 2 ? winnerAction : aPick.action,
        target:
          stageLocal >= 3
            ? winnerTarget
            : tPick.encounterTarget.split('(')[0].trim(),
        phaseIndex:
          stageLocal >= 3 ? nextSlate.phaseIndex : wPick.index,
      })

      if (tickCount % 2 === 0 && stageLocal < 3) {
        soundEngine.triggerTactileBlip(540 + (tickCount % 4) * 65)
      }
    }, 55)

    const t1 = window.setTimeout(() => {
      stageLocal = 1
      setReelStage(1)
      soundEngine.triggerTactileBlip(780)
    }, 380)

    const t2 = window.setTimeout(() => {
      stageLocal = 2
      setReelStage(2)
      soundEngine.triggerTactileBlip(920)
    }, 680)

    const t3 = window.setTimeout(() => {
      clearSpinTimers()
      stageLocal = 3
      setReelStage(3)
      setIsSpinning(false)
      setJackpotBurst(true)
      setSpinDisplay({
        world: winnerWorld,
        action: winnerAction,
        target: winnerTarget,
        phaseIndex: nextSlate.phaseIndex,
      })
      setCopiedHistory([])
      setActiveSlate(nextSlate)
      soundEngine.triggerTuningBladeChime('normal')
      if (autoWriteOnSpin) {
        void handleGenerateStoryForSlate(nextSlate)
      }
    }, 980)

    const t4 = window.setTimeout(() => {
      setJackpotBurst(false)
    }, 1850)

    spinCleanupRef.current.timeouts.push(t1, t2, t3, t4)
  }

  // Spin 9 Random Issues
  const handleBatchRoll9Slates = () => {
    soundEngine.triggerTuningBladeChime('severance')
    const shuffled = [...CATEGORY_MASTER_50_PHASES].sort(
      () => Math.random() - 0.5
    )
    const batch = shuffled
      .slice(0, 9)
      .map((phase) => buildSlateFromPhase(phase))
    setVaultSlates(batch)
    setSelectedVaultId(batch[0].id)
    setCopiedHistory([])
    setActiveSlate(batch[0])
    showToast('🎰 Spun 9 Fresh Zine Issues onto Your Shelf!')
  }

  // Copy Prompt
  const handleCopyPrompt = async (key: string, text: string) => {
    soundEngine.triggerTactileBlip(980)
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    setCopiedKey(key)
    setCopiedHistory((prev) => (prev.includes(key) ? prev : [...prev, key]))
    window.setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev))
    }, 2000)
  }

  // Paste Story in Step 1
  const handleStoryPasteChange = (raw: string) => {
    setPastedStoryInput(raw)
    if (!raw.trim()) return
    soundEngine.triggerTactileBlip(740)
    const parsed = parsePastedStoryToActs(raw, activeSlate.acts)
    setActiveSlate((prev) => ({
      ...prev,
      title: parsed.title ? parsed.title.toUpperCase() : prev.title,
      acts: {
        sceneSetup: parsed.sceneSetup,
        intervention: parsed.intervention,
        aftermath: parsed.aftermath,
      },
    }))
  }

  // Drop All 7 Files at Once in Step 3
  const handleFilesSelected = async (
    files: FileList | null,
    forcedSlot?: 'gallery' | 'gif' | 'video' | 'audio'
  ) => {
    if (!files || files.length === 0) return
    soundEngine.triggerTuningBladeChime('normal')

    const droppedStaticImages: string[] = []
    let nextGifUrl: string | undefined
    let nextVideoUrl: string | undefined
    let nextAudioUrl: string | undefined
    let nextAudioTitle: string | undefined
    const summaryParts: string[] = []

    const fileArray = Array.from(files)

    for (const file of fileArray) {
      const url = URL.createObjectURL(file)
      const lower = file.name.toLowerCase()

      if (forcedSlot === 'gif') {
        const isVid =
          file.type.startsWith('video/') ||
          lower.endsWith('.mp4') ||
          lower.endsWith('.webm')
        nextGifUrl = isVid ? `${url}#video` : url
        summaryParts.push('9:16 Loop')
        continue
      }

      if (forcedSlot === 'video') {
        nextVideoUrl = url
        summaryParts.push('1080p Cinema')
        continue
      }

      if (forcedSlot === 'audio') {
        nextAudioUrl = url
        nextAudioTitle = file.name
        summaryParts.push('Song')
        continue
      }

      if (forcedSlot === 'gallery') {
        droppedStaticImages.push(url)
        continue
      }

      if (file.type === 'image/gif' || lower.endsWith('.gif')) {
        nextGifUrl = url
        summaryParts.push('9:16 GIF')
      } else if (
        file.type.startsWith('image/') ||
        lower.endsWith('.jpg') ||
        lower.endsWith('.jpeg') ||
        lower.endsWith('.png') ||
        lower.endsWith('.webp')
      ) {
        droppedStaticImages.push(url)
      } else if (
        file.type.startsWith('video/') ||
        lower.endsWith('.mp4') ||
        lower.endsWith('.webm')
      ) {
        const orientation = await probeVideoOrientation(url)
        if (orientation === 'portrait') {
          nextGifUrl = `${url}#video`
          summaryParts.push('9:16 Vertical Loop')
        } else {
          nextVideoUrl = url
          summaryParts.push('1080p Cinema')
        }
      } else if (
        file.type.startsWith('audio/') ||
        lower.endsWith('.mp3') ||
        lower.endsWith('.m4a') ||
        lower.endsWith('.wav')
      ) {
        nextAudioUrl = url
        nextAudioTitle = file.name
        summaryParts.push('Song')
      } else if (lower.endsWith('.txt') || lower.endsWith('.md')) {
        const reader = new FileReader()
        reader.onload = (ev) => {
          const text = String(ev.target?.result || '')
          if (text) handleStoryPasteChange(text)
        }
        reader.readAsText(file)
        summaryParts.push('Story')
      }
    }

    setActiveSlate((prev) => {
      const patch: Partial<ArchivalTelemetrySlate> = {}

      if (droppedStaticImages.length > 0) {
        const existingCustom = (prev.galleryUrls || []).filter((u) =>
          u.startsWith('blob:')
        )
        const mergedGallery =
          droppedStaticImages.length >= 2
            ? droppedStaticImages.slice(0, 8)
            : [...existingCustom, ...droppedStaticImages].slice(0, 8)

        patch.galleryUrls = mergedGallery
        patch.stillUrl = mergedGallery[0]
      }

      if (nextGifUrl) patch.gifUrl = nextGifUrl
      if (nextVideoUrl) patch.videoUrl = nextVideoUrl
      if (nextAudioUrl) {
        patch.audioUrl = nextAudioUrl
        patch.audioTitle = nextAudioTitle
      }

      return { ...prev, ...patch }
    })

    if (droppedStaticImages.length > 0) {
      summaryParts.unshift(
        `${droppedStaticImages.length} Shot${
          droppedStaticImages.length > 1 ? 's' : ''
        }`
      )
    }

    setSyncStatus(`🎉 Dropped into Zine: ${summaryParts.join(' + ')}!`)
  }

  // Click any specific Polaroid (01-04) in Step 3 to swap just that shot
  const handleReplaceSinglePlate = (
    plateIdx: number,
    files: FileList | null
  ) => {
    if (!files || !files[0]) return
    soundEngine.triggerTuningBladeChime('normal')
    const newUrl = URL.createObjectURL(files[0])
    setActiveSlate((prev) => {
      const current =
        prev.galleryUrls && prev.galleryUrls.length > 0
          ? [...prev.galleryUrls]
          : prev.stillUrl
          ? [prev.stillUrl]
          : []
      while (current.length <= plateIdx) {
        current.push(prev.stillUrl || newUrl)
      }
      current[plateIdx] = newUrl
      return {
        ...prev,
        galleryUrls: current,
        stillUrl: current[0] || newUrl,
      }
    })
    setSyncStatus(`📸 Swapped Shot 0${plateIdx + 1}!`)
  }

  // Sync Google Drive Folder
  const handleSyncDriveFolder = async (overrideFolderId?: string) => {
    const rawTarget = (overrideFolderId || driveInputUrl).trim()
    if (!rawTarget) return

    soundEngine.triggerTactileBlip(880)
    setIsSyncingDrive(true)
    setSyncStatus('Pulling files from Google Drive...')

    const idMatch = rawTarget.match(/[-\w]{25,}/)
    const folderId = idMatch ? idMatch[0] : rawTarget

    const bundledVaultMatch = INITIAL_VAULT_SLATES.find(
      (s) => s.driveFolderId === folderId
    )
    const archiveMeta = ARCHIVE_94_SCENARIOS.find(
      (a) =>
        a.id === folderId ||
        a.name.toLowerCase() === rawTarget.toLowerCase()
    )

    try {
      const res = await fetch(
        `/api/gdrive-sync?folderId=${encodeURIComponent(
          archiveMeta?.id || folderId
        )}`
      )
      if (res.ok) {
        const data = await res.json()
        const phaseObj =
          CATEGORY_MASTER_50_PHASES.find(
            (p) => p.index === (archiveMeta?.phaseIndex || activeSlate.phaseIndex)
          ) || CATEGORY_MASTER_50_PHASES[0]

        const baseSlate =
          bundledVaultMatch ||
          buildSlateFromPhase(phaseObj, archiveMeta?.nodeFilter)

        const parsedActs: {
          title?: string
          sceneSetup: string
          intervention: string
          aftermath: string
        } = data.storyText
          ? parsePastedStoryToActs(data.storyText, baseSlate.acts)
          : baseSlate.acts

        if (data.storyText) {
          setPastedStoryInput(data.storyText)
        }

        const syncedGallery: string[] =
          Array.isArray(data.galleryUrls) && data.galleryUrls.length > 0
            ? data.galleryUrls
            : data.stillUrl
            ? [data.stillUrl]
            : baseSlate.galleryUrls || [baseSlate.stillUrl]

        setActiveSlate({
          ...baseSlate,
          title: (
            archiveMeta?.name ||
            parsedActs.title ||
            data.docName ||
            baseSlate.title
          ).toUpperCase(),
          nodeTag: archiveMeta?.nodeTag || baseSlate.nodeTag,
          nodeFilter: archiveMeta?.nodeFilter || baseSlate.nodeFilter,
          finish: archiveMeta?.finish || baseSlate.finish,
          driveFolderId: archiveMeta?.id || folderId,
          stillUrl: syncedGallery[0] || baseSlate.stillUrl,
          galleryUrls: syncedGallery,
          gifUrl: data.gifUrl || baseSlate.gifUrl,
          videoUrl: data.videoUrl || baseSlate.videoUrl,
          audioUrl: data.audioUrl || baseSlate.audioUrl,
          audioTitle: data.audioName || baseSlate.audioTitle,
          acts: {
            sceneSetup: parsedActs.sceneSetup,
            intervention: parsedActs.intervention,
            aftermath: parsedActs.aftermath,
          },
        })
        soundEngine.triggerTuningBladeChime('normal')
        setSyncStatus(
          `✨ Synced "${archiveMeta?.name || 'Drive Folder'}" (${syncedGallery.length} images + media)!`
        )
        setIsSyncingDrive(false)
        return
      }
    } catch {
      // Fallback below
    }

    if (bundledVaultMatch) {
      setActiveSlate(bundledVaultMatch)
      soundEngine.triggerTuningBladeChime('normal')
      setSyncStatus(`Loaded "${bundledVaultMatch.title}"!`)
    } else if (archiveMeta) {
      const phaseObj =
        CATEGORY_MASTER_50_PHASES.find(
          (p) => p.index === archiveMeta.phaseIndex
        ) || CATEGORY_MASTER_50_PHASES[0]
      const next = buildSlateFromPhase(phaseObj, archiveMeta.nodeFilter)
      setActiveSlate({
        ...next,
        title: archiveMeta.name.toUpperCase(),
        nodeTag: archiveMeta.nodeTag,
        finish: archiveMeta.finish,
        driveFolderId: archiveMeta.id,
      })
      soundEngine.triggerTuningBladeChime('normal')
      setSyncStatus(`Loaded "${archiveMeta.name}"!`)
    } else {
      setSyncStatus(`Linked folder: ${folderId}`)
    }
    setIsSyncingDrive(false)
  }

  const resolveMediaExtFromMime = (mime: string, fallback = 'bin') => {
    const m = mime.toLowerCase()
    if (m.includes('png')) return 'png'
    if (m.includes('webp')) return 'webp'
    if (m.includes('gif')) return 'gif'
    if (m.includes('jpeg') || m.includes('jpg')) return 'jpg'
    if (m.includes('webm')) return 'webm'
    if (m.includes('mp4') && m.includes('video')) return 'mp4'
    if (m.includes('mp4') || m.includes('m4a')) return 'm4a'
    if (m.includes('wav')) return 'wav'
    if (m.includes('mpeg') || m.includes('mp3') || m.includes('audio')) return 'mp3'
    if (m.includes('video')) return 'mp4'
    return fallback
  }

  const uploadBlobMediaIfNeeded = async (
    rawUrl: string | undefined,
    slateId: string,
    slot: string
  ): Promise<string | undefined> => {
    if (!rawUrl || !rawUrl.startsWith('blob:') || !IS_LOCAL_STUDIO) {
      return rawUrl
    }
    try {
      const hashIdx = rawUrl.indexOf('#')
      const hash = hashIdx >= 0 ? rawUrl.slice(hashIdx) : ''
      const blobHref = hashIdx >= 0 ? rawUrl.slice(0, hashIdx) : rawUrl
      const blobRes = await fetch(blobHref)
      const blob = await blobRes.blob()
      const ext = resolveMediaExtFromMime(
        blob.type || '',
        hash === '#video' ? 'mp4' : 'jpg'
      )
      const upRes = await fetch(
        `/api/upload-zine-media?slateId=${encodeURIComponent(
          slateId
        )}&slot=${encodeURIComponent(slot)}&ext=${encodeURIComponent(ext)}`,
        {
          method: 'POST',
          body: blob,
        }
      )
      if (!upRes.ok) return rawUrl
      const upData = await upRes.json()
      return upData?.url ? `${upData.url}${hash}` : rawUrl
    } catch {
      return rawUrl
    }
  }

  const persistSlatesToDisk = async (
    slatesToPersist: ArchivalTelemetrySlate[]
  ): Promise<ArchivalTelemetrySlate[]> => {
    if (!IS_LOCAL_STUDIO) return slatesToPersist
    setIsSavingShelf(true)
    try {
      const uploadedSlates = await Promise.all(
        slatesToPersist.map(async (slate) => {
          const gallery = slate.galleryUrls
            ? ((await Promise.all(
                slate.galleryUrls.map((u, idx) =>
                  uploadBlobMediaIfNeeded(u, slate.id, `shot${idx + 1}`)
                )
              )) as string[])
            : undefined
          const still =
            gallery && gallery.length > 0
              ? gallery[0]
              : (await uploadBlobMediaIfNeeded(slate.stillUrl, slate.id, 'cover')) ||
                slate.stillUrl
          const gifUrl = await uploadBlobMediaIfNeeded(
            slate.gifUrl,
            slate.id,
            'loop'
          )
          const videoUrl = await uploadBlobMediaIfNeeded(
            slate.videoUrl,
            slate.id,
            'cinema'
          )
          const audioUrl = await uploadBlobMediaIfNeeded(
            slate.audioUrl,
            slate.id,
            'song'
          )
          return {
            ...slate,
            stillUrl: still,
            galleryUrls: gallery,
            gifUrl,
            videoUrl,
            audioUrl,
          }
        })
      )

      const res = await fetch('/api/shelf-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slates: uploadedSlates }),
      })
      if (!res.ok) return uploadedSlates
      const data = await res.json()
      if (Array.isArray(data?.slates)) {
        const saved: ArchivalTelemetrySlate[] = data.slates
        setVaultSlates(saved)
        const matchingActive = saved.find((s) => s.id === activeSlate.id)
        if (matchingActive) {
          setActiveSlate(matchingActive)
        }
        return saved
      }
      return uploadedSlates
    } catch {
      return slatesToPersist
    } finally {
      setIsSavingShelf(false)
    }
  }

  // Save Issue to Zine Shelf (and persist locally for Mobile Reader)
  const handleCommitToVault = async () => {
    soundEngine.triggerTuningBladeChime('severance')
    const existsIdx = vaultSlates.findIndex((s) => s.id === activeSlate.id)
    const nextSlates =
      existsIdx >= 0
        ? vaultSlates.map((s, idx) => (idx === existsIdx ? activeSlate : s))
        : [activeSlate, ...vaultSlates]
    setVaultSlates(nextSlates)
    setSelectedVaultId(activeSlate.id)
    showToast(`🎉 Saved "${activeSlate.title}" to Your Zine Shelf!`)
    await persistSlatesToDisk(nextSlates)
  }

  // Save Shelf + Push to GitHub Pages so Mobile Reader gets the zines
  const handlePublishToPhone = async (includeActiveDraft = false) => {
    if (isPublishingPhone || !IS_LOCAL_STUDIO) return
    soundEngine.triggerTuningBladeChime('severance')
    setIsPublishingPhone(true)
    try {
      let targetSlates = vaultSlates
      if (includeActiveDraft) {
        const existsIdx = vaultSlates.findIndex((s) => s.id === activeSlate.id)
        targetSlates =
          existsIdx >= 0
            ? vaultSlates.map((s, idx) => (idx === existsIdx ? activeSlate : s))
            : [activeSlate, ...vaultSlates]
        setVaultSlates(targetSlates)
        setSelectedVaultId(activeSlate.id)
      }
      showToast('📲 Saving media & pushing Zine Shelf to your phone...')
      await persistSlatesToDisk(targetSlates)
      const pubRes = await fetch('/api/shelf-publish', { method: 'POST' })
      const pubData = await pubRes.json()
      if (!pubRes.ok) {
        throw new Error(pubData?.error || 'Failed to push to GitHub')
      }
      soundEngine.triggerTuningBladeChime('severance')
      showToast(
        pubData?.message || '📲 Published! Live on your phone in ~45s!'
      )
    } catch (err: any) {
      soundEngine.triggerGlitchStutter()
      showToast(`⚠️ Publish failed: ${err?.message || 'Check Git connection'}`)
    } finally {
      setIsPublishingPhone(false)
    }
  }

  const activeReaderIndex = useMemo(() => {
    const idx = vaultSlates.findIndex((s) => s.id === selectedVaultSlate?.id)
    return idx >= 0 ? idx : 0
  }, [vaultSlates, selectedVaultSlate?.id])

  const handleStepReaderIssue = (delta: -1 | 1) => {
    if (vaultSlates.length === 0) return
    soundEngine.triggerTactileBlip(delta > 0 ? 860 : 740)
    const nextIdx =
      (activeReaderIndex + delta + vaultSlates.length) % vaultSlates.length
    setSelectedVaultId(vaultSlates[nextIdx].id)
    setReaderScreen('ISSUE')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Export Standalone Self-Contained .HTML Zine
  const handleExportHtmlFromStudio = async () => {
    if (isExportingStep3) return
    soundEngine.triggerTuningBladeChime('severance')
    setIsExportingStep3(true)
    try {
      await exportStandaloneWebpageHtml(
        activeSlate,
        (msg) => setSyncStatus(msg),
        activeUiTheme
      )
      showToast(`🚀 Downloaded ME_ZINE_${activeSlate.title}.html!`)
    } finally {
      setIsExportingStep3(false)
    }
  }

  return (
    <div
      data-ui-theme={activeUiTheme.id}
      style={{ color: activeUiTheme.ink }}
      className="min-h-screen flex flex-col"
    >
      {/* ==================== KINETIC TOP MARQUEE RIBBON ==================== */}
      <div
        style={{
          backgroundColor: activeUiTheme.marqueeBg,
          color: activeUiTheme.marqueeText,
          borderColor: activeUiTheme.borderColor,
        }}
        className="border-b-[3px] py-1.5 overflow-hidden select-none transition-colors duration-300"
      >
        <div className="animate-zine-marquee font-mono-zine text-[11px] font-bold uppercase tracking-widest">
          <span className="mx-6">
            {isReaderMode
              ? '★ MUTABLE ECHO POCKET ZINE READER ★ TAP ANY ISSUE COVER TO READ ★ 1080P CINEMA • VINYL SONG • 2K POLAROIDS ★'
              : '★ MUTABLE ECHO POP-ZINE PLAYGROUND ★ SPIN AN IDEA ★ GRAB 4 DISTINCT SHOT PROMPTS ★ DROP ALL 7 FILES ★ PUBLISH TO PHONE ★'}
          </span>
          <span className="mx-6">
            {isReaderMode
              ? '★ MUTABLE ECHO POCKET ZINE READER ★ TAP ANY ISSUE COVER TO READ ★ 1080P CINEMA • VINYL SONG • 2K POLAROIDS ★'
              : '★ MUTABLE ECHO POP-ZINE PLAYGROUND ★ SPIN AN IDEA ★ GRAB 4 DISTINCT SHOT PROMPTS ★ DROP ALL 7 FILES ★ PUBLISH TO PHONE ★'}
          </span>
        </div>
      </div>

      {/* ==================== CHUNKY FLOATING TOY BAR ==================== */}
      <header
        style={{
          backgroundColor: activeUiTheme.headerBg,
          color: activeUiTheme.headerInk,
          borderColor: activeUiTheme.headerBorder,
        }}
        className="sticky top-0 z-40 backdrop-blur-md border-b-[3px] px-3.5 sm:px-6 py-2.5 sm:py-3 transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
          {/* Comic Sticker Logo */}
          <div
            onClick={() => {
              if (isReaderMode) {
                soundEngine.triggerTactileBlip(780)
                setReaderScreen('SHELF')
              }
            }}
            className={`flex items-center gap-2.5 sm:gap-3 ${
              isReaderMode ? 'cursor-pointer' : ''
            }`}
          >
            <div
              style={{
                backgroundColor: activeUiTheme.logoBg,
                color: activeUiTheme.logoText,
                borderColor: activeUiTheme.borderColor,
                boxShadow: `4px 4px 0 ${activeUiTheme.cardShadowColor}`,
              }}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border-[3px] -rotate-3 flex items-center justify-center font-display font-extrabold text-lg sm:text-xl transition-colors duration-300 shrink-0"
            >
              ME!
            </div>
            <div>
              <span className="font-display text-lg sm:text-2xl font-extrabold tracking-tight uppercase block leading-none">
                {isReaderMode ? 'MUTABLE ECHO ZINES' : 'MUTABLE ECHO ZINE LAB'}
              </span>
              <span
                style={{ color: activeUiTheme.headerSub }}
                className="font-mono-zine text-[10px] sm:text-[11px] font-bold"
              >
                {isReaderMode
                  ? `POCKET ZINE READER • ${vaultSlates.length} ISSUES`
                  : 'DESKTOP ZINE BUILDER & TELEMETRY STUDIO'}
              </span>
            </div>
          </div>

          {/* Navigation Controls: Dedicated Reader Pills vs Full Desktop Builder Tabs */}
          {isReaderMode ? (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  soundEngine.triggerTactileBlip(800)
                  setReaderScreen('SHELF')
                }}
                style={{
                  backgroundColor:
                    readerScreen === 'SHELF'
                      ? activeUiTheme.accent1
                      : activeUiTheme.surfaceBg,
                  color:
                    readerScreen === 'SHELF'
                      ? activeUiTheme.accent1Ink
                      : activeUiTheme.ink,
                }}
                className="pop-btn px-3 py-1.5 text-xs font-display font-extrabold uppercase cursor-pointer flex items-center gap-1.5"
              >
                📚 Shelf ({vaultSlates.length})
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.triggerTactileBlip(880)
                  setReaderScreen('ISSUE')
                }}
                style={{
                  backgroundColor:
                    readerScreen === 'ISSUE'
                      ? activeUiTheme.accent2
                      : activeUiTheme.surfaceBg,
                  color:
                    readerScreen === 'ISSUE'
                      ? activeUiTheme.accent2Ink
                      : activeUiTheme.ink,
                }}
                className="pop-btn px-3 py-1.5 text-xs font-display font-extrabold uppercase cursor-pointer flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" /> Read Issue
              </button>

              <button
                type="button"
                onClick={() => {
                  const next = soundEngine.toggleAmbientDrone()
                  setDroneActive(next)
                }}
                style={{
                  backgroundColor: droneActive
                    ? activeUiTheme.accent4
                    : activeUiTheme.surfaceBg,
                  color: droneActive
                    ? activeUiTheme.accent4Ink
                    : activeUiTheme.ink,
                }}
                className="pop-btn flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono-zine font-bold uppercase cursor-pointer"
                title="Ambient Synth Toy"
              >
                {droneActive ? (
                  <Volume2 className="w-3.5 h-3.5" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">
                  {droneActive ? 'Synth On' : 'Synth'}
                </span>
              </button>

              {previewReaderMode && IS_LOCAL_STUDIO && !isMobileViewport && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.triggerTactileBlip(740)
                    setPreviewReaderMode(false)
                  }}
                  style={{
                    backgroundColor: activeUiTheme.accent3,
                    color: activeUiTheme.accent3Ink,
                  }}
                  className="pop-btn flex items-center gap-1.5 px-3 py-1.5 text-xs font-display font-extrabold uppercase cursor-pointer"
                >
                  <Monitor className="w-3.5 h-3.5" /> Back to Zine Maker
                </button>
              )}
            </div>
          ) : (
            <>
              {/* 3 Bouncy Candy Pill Tabs (Desktop Builder Only) */}
              <nav className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.triggerTactileBlip(760)
                    setActiveTab('STUDIO')
                  }}
                  style={{
                    backgroundColor:
                      activeTab === 'STUDIO'
                        ? activeUiTheme.accent1
                        : activeUiTheme.surfaceBg,
                    color:
                      activeTab === 'STUDIO'
                        ? activeUiTheme.accent1Ink
                        : activeUiTheme.ink,
                  }}
                  className="pop-btn px-4 py-2 text-xs sm:text-sm font-display font-extrabold uppercase cursor-pointer"
                >
                  🎨 1. Zine Maker
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.triggerTactileBlip(840)
                    setActiveTab('VAULT')
                  }}
                  style={{
                    backgroundColor:
                      activeTab === 'VAULT'
                        ? activeUiTheme.accent2
                        : activeUiTheme.surfaceBg,
                    color:
                      activeTab === 'VAULT'
                        ? activeUiTheme.accent2Ink
                        : activeUiTheme.ink,
                  }}
                  className="pop-btn px-4 py-2 text-xs sm:text-sm font-display font-extrabold uppercase cursor-pointer"
                >
                  📚 2. Zine Shelf ({vaultSlates.length})
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.triggerTactileBlip(920)
                    setActiveTab('TIMELINE')
                  }}
                  style={{
                    backgroundColor:
                      activeTab === 'TIMELINE'
                        ? activeUiTheme.accent3
                        : activeUiTheme.surfaceBg,
                    color:
                      activeTab === 'TIMELINE'
                        ? activeUiTheme.accent3Ink
                        : activeUiTheme.ink,
                  }}
                  className="pop-btn px-4 py-2 text-xs sm:text-sm font-display font-extrabold uppercase cursor-pointer"
                >
                  🎰 3. 50 Story Seeds
                </button>
              </nav>

              {/* Desktop Right Controls: Mobile Reader Preview + Toy Synth Drone */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.triggerTactileBlip(880)
                    setReaderScreen('SHELF')
                    setPreviewReaderMode(true)
                  }}
                  title="Preview how the mobile Zine Reader looks on your phone"
                  style={{
                    backgroundColor: activeUiTheme.surfaceBg,
                    color: activeUiTheme.ink,
                  }}
                  className="pop-btn flex items-center gap-1.5 px-3 py-2 text-xs font-mono-zine font-bold uppercase cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5" /> Reader View
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const next = soundEngine.toggleAmbientDrone()
                    setDroneActive(next)
                  }}
                  style={{
                    backgroundColor: droneActive
                      ? activeUiTheme.accent4
                      : activeUiTheme.surfaceBg,
                    color: droneActive
                      ? activeUiTheme.accent4Ink
                      : activeUiTheme.ink,
                  }}
                  className="pop-btn flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono-zine font-bold uppercase cursor-pointer"
                >
                  {droneActive ? (
                    <>
                      <Volume2 className="w-4 h-4" /> Synth On ♪
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-4 h-4" /> Synth Toy
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Joyful Pop Toast Banner */}
      {toastMsg && (
        <div
          style={{
            backgroundColor: activeUiTheme.accent4,
            color: activeUiTheme.accent4Ink,
            borderColor: activeUiTheme.borderColor,
          }}
          className="border-b-[3px] px-4 py-2.5 text-center font-display text-sm font-extrabold uppercase tracking-wide"
        >
          {toastMsg}
        </div>
      )}

      {/* ==================== MAIN PLAYGROUND ==================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6">
        {/* STUDIO / READER UI BACKGROUND THEME DECK */}
        <div
          className={`pop-card theme-middle px-3.5 py-2.5 sm:py-3 flex items-center justify-between gap-2.5 ${
            isReaderMode ? 'overflow-x-auto' : 'flex-wrap'
          }`}
        >
          <div className="flex items-center gap-2 shrink-0">
            <span
              style={{
                backgroundColor: activeUiTheme.logoBg,
                color: activeUiTheme.logoText,
                borderColor: activeUiTheme.borderColor,
              }}
              className="px-2.5 py-1 rounded-full border-2 font-mono-zine text-[10px] sm:text-[11px] font-bold uppercase flex items-center gap-1.5"
            >
              <Palette className="w-3.5 h-3.5" />{' '}
              {isReaderMode ? 'Theme' : 'Studio Backdrop'}
            </span>
            {!isReaderMode && (
              <span className="hidden xl:inline font-mono-zine text-[11px] font-bold theme-muted">
                {activeUiTheme.tagline}
              </span>
            )}
          </div>

          <div
            className={`flex items-center gap-1.5 ${
              isReaderMode ? 'flex-nowrap shrink-0 pr-1' : 'flex-wrap'
            }`}
          >
            {STUDIO_UI_THEMES.map((t) => {
              const selected = t.id === activeUiTheme.id
              return (
                <button
                  key={t.id}
                  type="button"
                  title={t.tagline}
                  onClick={() => handleSelectUiTheme(t.id)}
                  style={{
                    backgroundColor: selected
                      ? activeUiTheme.accent1
                      : t.tile1,
                    color: selected ? activeUiTheme.accent1Ink : t.ink,
                    borderColor: selected
                      ? activeUiTheme.borderColor
                      : t.borderColor,
                    boxShadow: selected
                      ? `2px 2px 0 ${activeUiTheme.subShadowColor}`
                      : undefined,
                  }}
                  className={`px-2.5 py-1 rounded-xl border-2 font-mono-zine text-[11px] font-bold uppercase flex items-center gap-1.5 shrink-0 cursor-pointer transition-transform ${
                    selected ? '-translate-y-0.5' : 'hover:-translate-y-0.5'
                  }`}
                >
                  <span>{t.emoji}</span>
                  <span>{t.shortLabel}</span>
                  <span className="flex items-center -space-x-1">
                    {t.swatchColors.slice(0, 2).map((c, ci) => (
                      <span
                        key={ci}
                        style={{
                          backgroundColor: c,
                          borderColor: t.borderColor,
                        }}
                        className="w-2.5 h-2.5 rounded-full border"
                      />
                    ))}
                  </span>
                </button>
              )
            })}

            <button
              type="button"
              onClick={handleRandomUiTheme}
              title="Roll a random backdrop theme"
              style={{
                backgroundColor: activeUiTheme.accent2,
                color: activeUiTheme.accent2Ink,
                borderColor: activeUiTheme.borderColor,
              }}
              className="px-2.5 py-1 rounded-xl border-2 font-mono-zine text-[11px] font-bold uppercase flex items-center gap-1 shrink-0 cursor-pointer transition-transform hover:-translate-y-0.5"
            >
              <Dices className="w-3.5 h-3.5" /> Mix
            </button>
          </div>
        </div>

        {/* ===================================================================
            MOBILE / HOSTED ZINE READER MODE (Read-Only Magazine Rack + Reader)
           =================================================================== */}
        {isReaderMode && (
          <div className="space-y-5">
            {readerScreen === 'SHELF' ? (
              <div className="space-y-5">
                {/* Pocket Zine Rack Banner */}
                <div className="pop-card theme-tile-1 p-4 sm:p-6 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase leading-tight">
                      📚 Pocket Zine Shelf ({vaultSlates.length}{' '}
                      {vaultSlates.length === 1 ? 'Issue' : 'Issues'})
                    </h2>
                    <p className="text-xs sm:text-sm font-semibold theme-muted mt-0.5">
                      Tap any zine cover to read the 3-act story, watch the cinema cut &amp; play the soundtrack!
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => void loadPublishedShelf(true)}
                    disabled={isRefreshingShelf}
                    style={{
                      backgroundColor: activeUiTheme.accent3,
                      color: activeUiTheme.accent3Ink,
                    }}
                    className="pop-btn px-3.5 py-2 font-display font-extrabold text-xs uppercase flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${
                        isRefreshingShelf ? 'animate-spin' : ''
                      }`}
                    />
                    {isRefreshingShelf ? 'Syncing...' : 'Refresh Shelf'}
                  </button>
                </div>

                {/* Magazine Cover Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {vaultSlates.map((slate) => {
                    const isSelected = slate.id === selectedVaultSlate?.id
                    const pal = getZinePalette(slate.finish)
                    const plateCount =
                      slate.galleryUrls && slate.galleryUrls.length > 0
                        ? slate.galleryUrls.length
                        : 1
                    return (
                      <article
                        key={slate.id}
                        onClick={() => {
                          soundEngine.triggerTuningBladeChime('normal')
                          setSelectedVaultId(slate.id)
                          setReaderScreen('ISSUE')
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                        style={{
                          backgroundColor: isSelected
                            ? activeUiTheme.tile1
                            : activeUiTheme.surfaceBg,
                          color: activeUiTheme.ink,
                        }}
                        className="pop-card pop-card-lift overflow-hidden cursor-pointer flex flex-col justify-between"
                      >
                        {/* Cover Artwork */}
                        <div
                          style={{ backgroundColor: activeUiTheme.marqueeBg }}
                          className="relative h-48 sm:h-52 w-full border-b-[3px] theme-border overflow-hidden"
                        >
                          <img
                            src={slate.stillUrl}
                            alt={slate.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                            <span
                              style={{
                                backgroundColor: activeUiTheme.accent2,
                                color: activeUiTheme.accent2Ink,
                              }}
                              className="px-2.5 py-0.5 rounded-full border-2 theme-border font-mono-zine text-[10px] font-bold uppercase"
                            >
                              {pal.emoji} ISSUE #{String(slate.phaseIndex).padStart(2, '0')}
                            </span>
                            {slate.videoUrl && (
                              <span
                                style={{
                                  backgroundColor: activeUiTheme.accent3,
                                  color: activeUiTheme.accent3Ink,
                                }}
                                className="px-2 py-0.5 rounded-full border-2 theme-border font-mono-zine text-[10px] font-bold uppercase"
                              >
                                🎬 1080P
                              </span>
                            )}
                            {slate.audioUrl && (
                              <span
                                style={{
                                  backgroundColor: activeUiTheme.accent4,
                                  color: activeUiTheme.accent4Ink,
                                }}
                                className="px-2 py-0.5 rounded-full border-2 theme-border font-mono-zine text-[10px] font-bold uppercase"
                              >
                                🎵 SONG
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Issue Cover Copy */}
                        <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                          <div>
                            <div className="font-mono-zine text-[10px] font-bold uppercase theme-muted">
                              📍 {slate.nodeTag.replace('NODE: ', '')} • {plateCount} SHOTS
                            </div>
                            <h3 className="font-display text-2xl font-extrabold uppercase leading-tight mt-1">
                              {slate.title}
                            </h3>
                            <p className="text-xs font-semibold theme-muted line-clamp-2 mt-1.5">
                              {slate.acts.sceneSetup}
                            </p>
                          </div>

                          <div
                            style={{
                              backgroundColor: activeUiTheme.accent1,
                              color: activeUiTheme.accent1Ink,
                            }}
                            className="pop-btn w-full py-2.5 px-4 font-display font-extrabold text-xs uppercase flex items-center justify-center gap-2"
                          >
                            <BookOpen className="w-4 h-4" /> Read Zine Issue →
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </div>
            ) : (
              selectedVaultSlate && (
                <div className="space-y-4">
                  {/* Thumb-Friendly Issue Flipper Bar */}
                  <div className="pop-card theme-middle px-3.5 py-2.5 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.triggerTactileBlip(760)
                        setReaderScreen('SHELF')
                      }}
                      className="pop-btn px-3 py-1.5 theme-surface font-display font-extrabold text-xs uppercase flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> All Issues
                    </button>

                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <button
                        type="button"
                        onClick={() => handleStepReaderIssue(-1)}
                        className="pop-btn px-2.5 py-1.5 theme-surface font-mono-zine text-xs font-bold uppercase flex items-center gap-0.5 cursor-pointer"
                        title="Previous Zine Issue"
                      >
                        <ChevronLeft className="w-4 h-4" /> Prev
                      </button>

                      <span
                        style={{
                          backgroundColor: activeUiTheme.accent2,
                          color: activeUiTheme.accent2Ink,
                        }}
                        className="px-2.5 py-1 rounded-full border-2 theme-border font-mono-zine text-[10px] sm:text-xs font-bold uppercase"
                      >
                        {activeReaderIndex + 1} / {vaultSlates.length}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleStepReaderIssue(1)}
                        className="pop-btn px-2.5 py-1.5 theme-surface font-mono-zine text-xs font-bold uppercase flex items-center gap-0.5 cursor-pointer"
                        title="Next Zine Issue"
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Full Interactive Zine Spread (Read-Only Mode) */}
                  <LoreWebpageView
                    slate={selectedVaultSlate}
                    uiTheme={activeUiTheme}
                    readerMode
                    onUpdateSlate={(patch) => {
                      setVaultSlates((prev) =>
                        prev.map((item) =>
                          item.id === selectedVaultSlate.id
                            ? { ...item, ...patch }
                            : item
                        )
                      )
                    }}
                  />

                  {/* Bottom Comic Issue Flipper Footer */}
                  <div className="pop-card theme-tile-1 p-3.5 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleStepReaderIssue(-1)}
                      className="pop-btn px-3.5 py-2.5 theme-surface font-display font-extrabold text-xs uppercase flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" /> Prev Zine
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.triggerTactileBlip(780)
                        setReaderScreen('SHELF')
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      style={{
                        backgroundColor: activeUiTheme.accent1,
                        color: activeUiTheme.accent1Ink,
                      }}
                      className="pop-btn px-4 py-2.5 font-display font-extrabold text-xs uppercase cursor-pointer"
                    >
                      📚 All {vaultSlates.length} Issues
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStepReaderIssue(1)}
                      style={{
                        backgroundColor: activeUiTheme.accent2,
                        color: activeUiTheme.accent2Ink,
                      }}
                      className="pop-btn px-3.5 py-2.5 font-display font-extrabold text-xs uppercase flex items-center gap-1 cursor-pointer"
                    >
                      Next Zine <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* ===================================================================
            TAB 1: ZINE MAKER (3-Step Toy Workbench + Live Experimental Zine)
           =================================================================== */}
        {!isReaderMode && activeTab === 'STUDIO' && (
          <div className="space-y-9">
            {/* COLLAPSIBLE 3-STEP TOY WORKBENCH */}
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* 3 Giant Colored Sticker Step Tabs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                  {[
                    {
                      num: 1 as WizardStep,
                      label: '① Spin & Story',
                      bg: activeUiTheme.accent1,
                      text: activeUiTheme.accent1Ink,
                    },
                    {
                      num: 2 as WizardStep,
                      label: '② 4-Shot Storyboard + Media',
                      bg: activeUiTheme.accent2,
                      text: activeUiTheme.accent2Ink,
                    },
                    {
                      num: 3 as WizardStep,
                      label: '③ Drop 7 Files & Launch',
                      bg: activeUiTheme.accent4,
                      text: activeUiTheme.accent4Ink,
                    },
                  ].map((s) => {
                    const active = !builderCollapsed && wizardStep === s.num
                    const done = wizardStep > s.num
                    return (
                      <button
                        key={s.num}
                        type="button"
                        onClick={() => {
                          soundEngine.triggerTactileBlip(750)
                          setBuilderCollapsed(false)
                          setWizardStep(s.num)
                        }}
                        style={{
                          backgroundColor: active
                            ? s.bg
                            : activeUiTheme.surfaceBg,
                          color: active ? s.text : activeUiTheme.ink,
                        }}
                        className={`pop-btn py-3 px-4 text-left cursor-pointer ${
                          active ? '-translate-y-0.5' : ''
                        }`}
                      >
                        <div className="font-display text-sm sm:text-base font-extrabold uppercase truncate">
                          {done && !active ? '✓ ' : ''}
                          {s.label}
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* 1-Click Full-Screen Zine Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.triggerTactileBlip(820)
                    setBuilderCollapsed((c) => !c)
                  }}
                  style={{
                    backgroundColor: activeUiTheme.accent3,
                    color: activeUiTheme.accent3Ink,
                  }}
                  className="pop-btn px-4 py-3 font-display text-xs sm:text-sm font-extrabold uppercase flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {builderCollapsed ? (
                    <>
                      <ChevronDown className="w-4 h-4 stroke-[3]" /> Open Workbench
                    </>
                  ) : (
                    <>
                      <ChevronUp className="w-4 h-4 stroke-[3]" /> ✨ Full-Screen Zine
                    </>
                  )}
                </button>
              </div>

              {!builderCollapsed && (
                <>
                  {/* ---------------- STEP 1: SPIN & STORY ---------------- */}
                  {wizardStep === 1 && (
                    <div className="pop-card theme-middle p-6 sm:p-7 space-y-6">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase">
                            ① Spin the Scenario Gacha &amp; Write Your Story
                          </h2>
                          <p className="text-sm font-medium theme-muted mt-0.5">
                            Spin a wild scenario, copy the story prompt into Gemini, then paste your finished 3-Act story onto the story pad!
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                        {/* 1A: Scenario Gacha Spinner (Visual 3-Reel Slot + Candy Pinwheel) */}
                        <div
                          className={`lg:col-span-7 pop-card theme-tile-1 p-5 space-y-4 ${
                            jackpotBurst ? 'animate-gacha-jackpot' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              {/* Spinning Candy Roulette Pinwheel */}
                              <div
                                className={`w-9 h-9 rounded-full border-[2.5px] theme-border flex items-center justify-center shrink-0 transition-transform ${
                                  isSpinning ? 'animate-gacha-wheel' : ''
                                }`}
                                style={{
                                  boxShadow: '2px 2px 0 var(--ui-border)',
                                  background:
                                    'conic-gradient(#FF2A85 0deg 90deg, #00E5FF 90deg 180deg, #B8FF00 180deg 270deg, #FFE600 270deg 360deg)',
                                }}
                              >
                                <div className="w-3.5 h-3.5 rounded-full theme-surface border-2 theme-border" />
                              </div>

                              <span
                                style={{
                                  backgroundColor: activeUiTheme.marqueeBg,
                                  color: activeUiTheme.accent1,
                                }}
                                className="px-3 py-1 rounded-full font-mono-zine text-xs font-bold uppercase"
                              >
                                🎰 1. Scenario Gacha Machine
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {jackpotBurst && (
                                <span
                                  style={{
                                    backgroundColor: activeUiTheme.accent2,
                                    color: activeUiTheme.accent2Ink,
                                    boxShadow: '2px 2px 0 var(--ui-border)',
                                  }}
                                  className="px-2.5 py-1 rounded-full border-2 theme-border font-mono-zine text-[10px] font-bold uppercase -rotate-3"
                                >
                                  ★ LOCKED IN!
                                </span>
                              )}
                              <span
                                style={{
                                  backgroundColor: isSpinning
                                    ? activeUiTheme.accent2
                                    : activeUiTheme.surfaceElevated,
                                  color: isSpinning
                                    ? activeUiTheme.accent2Ink
                                    : activeUiTheme.ink,
                                }}
                                className="px-2.5 py-1 rounded-full border-2 theme-border font-mono-zine text-xs font-bold"
                              >
                                PHASE #{String(spinDisplay.phaseIndex).padStart(2, '0')}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3">
                            <select
                              value={selectedNodeFilter}
                              onChange={(e) => {
                                const nextNode = e.target.value as NodeFilterId
                                setSelectedNodeFilter(nextNode)
                                handleRollSingleSlate(nextNode)
                              }}
                              className="flex-1 theme-input border-[2.5px] theme-border rounded-xl px-3.5 py-2.5 text-sm font-bold focus:outline-none"
                            >
                              {NODE_PILLS.map((pill) => (
                                <option key={pill.id} value={pill.id}>
                                  {pill.label}
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              onClick={() => handleRollSingleSlate()}
                              style={{
                                backgroundColor: isSpinning
                                  ? activeUiTheme.accent1
                                  : activeUiTheme.accent2,
                                color: isSpinning
                                  ? activeUiTheme.accent1Ink
                                  : activeUiTheme.accent2Ink,
                              }}
                              className="pop-btn px-6 py-3 font-display font-extrabold text-sm uppercase flex items-center justify-center gap-2 cursor-pointer shrink-0"
                            >
                              {isSpinning ? (
                                <>
                                  <RotateCw className="w-5 h-5 animate-spin stroke-[2.5]" />{' '}
                                  Spinning...
                                </>
                              ) : (
                                <>
                                  <Dices className="w-5 h-5" /> Spin New Idea!
                                </>
                              )}
                            </button>
                          </div>

                          {/* 3 Physical Staggered-Lock Slot Reels */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                            {[
                              {
                                label: 'REEL 01 // WORLD',
                                icon: '📍',
                                value: spinDisplay.world,
                                locked: !isSpinning || reelStage >= 1,
                                bg: activeUiTheme.surfaceElevated,
                                textInk: activeUiTheme.ink,
                              },
                              {
                                label: 'REEL 02 // ACTION',
                                icon: '⚡',
                                value: spinDisplay.action,
                                locked: !isSpinning || reelStage >= 2,
                                bg: activeUiTheme.accent4,
                                textInk: activeUiTheme.accent4Ink,
                              },
                              {
                                label: 'REEL 03 // ENCOUNTER',
                                icon: '🎯',
                                value: spinDisplay.target,
                                locked: !isSpinning || reelStage >= 3,
                                bg: activeUiTheme.accent3,
                                textInk: activeUiTheme.accent3Ink,
                              },
                            ].map((reel) => {
                              const spinningNow = isSpinning && !reel.locked
                              return (
                                <div
                                  key={reel.label}
                                  style={{
                                    backgroundColor: spinningNow
                                      ? activeUiTheme.inputBg
                                      : reel.bg,
                                    color: spinningNow
                                      ? activeUiTheme.ink
                                      : reel.textInk,
                                    boxShadow:
                                      'inset 0 4px 0 rgba(18,18,18,0.08), 2px 2px 0 var(--ui-border)',
                                  }}
                                  className={`rounded-xl border-[2.5px] theme-border p-2.5 overflow-hidden ${
                                    isSpinning && reel.locked
                                      ? 'animate-reel-lock'
                                      : ''
                                  }`}
                                >
                                  <div className="flex items-center justify-between font-mono-zine text-[9px] font-bold uppercase opacity-75 mb-1">
                                    <span>
                                      {reel.icon} {reel.label}
                                    </span>
                                    <span>
                                      {spinningNow ? '🌀' : '🔒'}
                                    </span>
                                  </div>
                                  <div
                                    className={`font-display text-xs font-extrabold uppercase leading-tight line-clamp-2 min-h-[2rem] flex items-center ${
                                      spinningNow
                                        ? 'animate-reel-churn opacity-80 blur-[0.4px]'
                                        : ''
                                    }`}
                                  >
                                    {reel.value}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* 1B: In-App 3-Act Story Engine (Built-In + Optional Live Gemini AI) */}
                        <div className="lg:col-span-5 pop-card theme-tile-2 p-5 flex flex-col justify-between gap-3.5">
                          <div className="space-y-2.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span
                                style={{
                                  backgroundColor: activeUiTheme.accent2,
                                  color: activeUiTheme.accent2Ink,
                                }}
                                className="inline-block px-3 py-1 rounded-full border-2 theme-border font-mono-zine text-xs font-bold uppercase"
                              >
                                🪄 2. In-App Story Writer
                              </span>

                              <button
                                type="button"
                                onClick={() => setShowKeyInput((s) => !s)}
                                style={{
                                  backgroundColor: geminiApiKey.trim()
                                    ? activeUiTheme.accent4
                                    : activeUiTheme.surfaceElevated,
                                  color: geminiApiKey.trim()
                                    ? activeUiTheme.accent4Ink
                                    : activeUiTheme.ink,
                                }}
                                className="px-2.5 py-1 rounded-full border-2 theme-border font-mono-zine text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer"
                              >
                                <KeyRound className="w-3 h-3" />
                                {geminiApiKey.trim()
                                  ? 'Gemini AI On'
                                  : 'Add Gemini Key'}
                              </button>
                            </div>

                            {showKeyInput && (
                              <div className="theme-surface rounded-xl border-2 theme-border p-2.5 space-y-1.5">
                                <div className="text-[10px] font-mono-zine font-bold uppercase theme-muted">
                                  Optional: Paste Gemini API Key (Saved locally in browser)
                                </div>
                                <div className="flex gap-1.5">
                                  <input
                                    type="password"
                                    value={geminiApiKey}
                                    onChange={(e) =>
                                      handleSaveGeminiKey(e.target.value)
                                    }
                                    placeholder="AIza..."
                                    className="flex-1 theme-input border theme-border rounded-lg px-2.5 py-1 text-xs font-mono-zine focus:outline-none"
                                  />
                                  {geminiApiKey && (
                                    <button
                                      type="button"
                                      onClick={() => handleSaveGeminiKey('')}
                                      className="px-2 py-1 rounded-lg border theme-border theme-tile-2 text-[10px] font-bold uppercase cursor-pointer"
                                    >
                                      Clear
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}

                            <p className="text-xs sm:text-sm font-semibold theme-muted">
                              {geminiApiKey.trim()
                                ? 'Live Gemini 2.5 Flash AI is armed! Generate bespoke 3-Act chronicles right here without leaving the page.'
                                : 'Writes a complete 3-Act Chronicle right inside the app! (Or connect a Gemini API key above for live AI prose.)'}
                            </p>

                            <label className="inline-flex items-center gap-2 text-xs font-bold cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={autoWriteOnSpin}
                                onChange={(e) =>
                                  setAutoWriteOnSpin(e.target.checked)
                                }
                                style={{ accentColor: activeUiTheme.accent2 }}
                                className="w-4 h-4 cursor-pointer"
                              />
                              ⚡ Auto-write fresh story every time I Spin!
                            </label>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              type="button"
                              disabled={isGeneratingStory}
                              onClick={() =>
                                handleGenerateStoryForSlate(activeSlate)
                              }
                              style={{
                                backgroundColor: isGeneratingStory
                                  ? activeUiTheme.accent1
                                  : activeUiTheme.marqueeBg,
                                color: isGeneratingStory
                                  ? activeUiTheme.accent1Ink
                                  : activeUiTheme.accent1,
                              }}
                              className="pop-btn flex-1 py-3 px-4 font-display font-extrabold text-sm uppercase flex items-center justify-center gap-2 cursor-pointer"
                            >
                              {isGeneratingStory ? (
                                <>
                                  <RotateCw className="w-4 h-4 animate-spin" />{' '}
                                  Writing Story...
                                </>
                              ) : (
                                <>
                                  <Wand2 className="w-4 h-4" /> Write 3-Act Story Here!
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleCopyPrompt(
                                  'story',
                                  compiledPrompts.storyPrompt
                                )
                              }
                              title="Or copy prompt to paste in Gemini web"
                              style={{
                                backgroundColor:
                                  copiedKey === 'story'
                                    ? activeUiTheme.accent4
                                    : activeUiTheme.surfaceElevated,
                                color:
                                  copiedKey === 'story'
                                    ? activeUiTheme.accent4Ink
                                    : activeUiTheme.ink,
                              }}
                              className="pop-btn px-3.5 py-3 font-mono-zine text-xs font-bold uppercase flex items-center justify-center gap-1 cursor-pointer shrink-0"
                            >
                              {copiedKey === 'story' ? (
                                <>
                                  <Check className="w-4 h-4 stroke-[3]" /> Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" /> Prompt
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 1C: Lined Notebook Story Pad + Editable Headline */}
                      <div className="pop-card theme-tile-4 p-5 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-display text-base font-extrabold uppercase">
                              📓 3. Your Live 3-Act Story &amp; Headline
                            </span>
                            {storyEngineBadge && (
                              <span
                                style={{
                                  backgroundColor: activeUiTheme.accent4,
                                  color: activeUiTheme.accent4Ink,
                                }}
                                className="px-2.5 py-0.5 rounded-full border-2 theme-border font-mono-zine text-[10px] font-bold uppercase"
                              >
                                ✓ {storyEngineBadge}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-mono-zine text-xs font-bold uppercase">
                              Zine Headline:
                            </span>
                            <input
                              type="text"
                              value={activeSlate.title}
                              onChange={(e) =>
                                handleUpdateActiveSlate({
                                  title: e.target.value.toUpperCase(),
                                })
                              }
                              className="theme-input border-2 theme-border rounded-xl px-3 py-1.5 font-display text-sm font-extrabold uppercase w-60 focus:outline-none"
                            />
                          </div>
                        </div>

                        <textarea
                          rows={4}
                          value={pastedStoryInput}
                          onChange={(e) =>
                            handleStoryPasteChange(e.target.value)
                          }
                          placeholder="Paste your 3-Act story from Gemini right here! It instantly updates Act 01, Act 02, and Act 03 in your live Zine below — AND tailors your 4 Storyboard Image Prompts..."
                          className="w-full theme-input border-[2.5px] theme-border rounded-2xl p-4 text-sm font-medium focus:outline-none"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.triggerTactileBlip(860)
                            setWizardStep(2)
                          }}
                          style={{
                            backgroundColor: activeUiTheme.accent1,
                            color: activeUiTheme.accent1Ink,
                          }}
                          className="pop-btn px-7 py-3.5 font-display font-extrabold text-sm sm:text-base uppercase flex items-center gap-2 cursor-pointer"
                        >
                          Next: Grab Your 4-Shot Storyboard Prompts{' '}
                          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ---------------- STEP 2: 4 DISTINCT STORYBOARD IMAGE PROMPTS + VIDEO + LOOP + SONG ---------------- */}
                  {wizardStep === 2 && (
                    <div className="pop-card theme-middle p-6 sm:p-7 space-y-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase">
                            ② 4-Shot Director’s Storyboard + Media Prompts
                          </h2>
                          <p className="text-sm font-medium theme-muted mt-0.5">
                            Every image prompt uses a completely different camera distance &amp; story moment (Wide World → Big Action → Macro Hands/Gear → Quiet Aftermath) so none of your 4 shots ever look alike!
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowPromptPreview((p) => !p)}
                          className="pop-btn px-3.5 py-2 theme-tile-1 font-mono-zine text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          {showPromptPreview ? (
                            <>
                              <EyeOff className="w-4 h-4" /> Hide Prompt Text
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4" /> Peek Prompt Text
                            </>
                          )}
                        </button>
                      </div>

                      {/* 4-PANEL COMIC STORYBOARD STRIP */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span
                            style={{
                              backgroundColor: activeUiTheme.marqueeBg,
                              color: activeUiTheme.accent3,
                            }}
                            className="px-3 py-1 rounded-full font-mono-zine text-xs font-bold uppercase"
                          >
                            🎞️ 4 Distinct 2K Storyboard Shots (Generate 1 Image Per Prompt in Flow)
                          </span>
                          <span className="font-mono-zine text-xs font-bold">
                            {
                              compiledPrompts.stillPrompts.filter((p) =>
                                copiedHistory.includes(p.id)
                              ).length
                            }{' '}
                            / 4 COPIED
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {compiledPrompts.stillPrompts.map((plate, idx) => {
                            const themeCardStyles = [
                              {
                                headerBg: activeUiTheme.accent3,
                                textCol: activeUiTheme.accent3Ink,
                                emoji: '🌍',
                              },
                              {
                                headerBg: activeUiTheme.accent2,
                                textCol: activeUiTheme.accent2Ink,
                                emoji: '⚡',
                              },
                              {
                                headerBg: activeUiTheme.accent1,
                                textCol: activeUiTheme.accent1Ink,
                                emoji: '🔍',
                              },
                              {
                                headerBg: activeUiTheme.accent4,
                                textCol: activeUiTheme.accent4Ink,
                                emoji: '🌅',
                              },
                            ]
                            const style =
                              themeCardStyles[idx] || themeCardStyles[0]
                            const justCopied = copiedKey === plate.id
                            const alreadyCopied = copiedHistory.includes(
                              plate.id
                            )
                            return (
                              <div
                                key={plate.id}
                                className="relative pop-card theme-surface overflow-hidden flex flex-col justify-between"
                              >
                                {/* Theme Header Strip */}
                                <div
                                  className="px-4 py-2.5 border-b-[2.5px] theme-border flex items-center justify-between"
                                  style={{
                                    backgroundColor: style.headerBg,
                                    color: style.textCol,
                                  }}
                                >
                                  <span className="font-mono-zine text-xs font-bold uppercase">
                                    {style.emoji} {plate.shotBadge}
                                  </span>
                                  {alreadyCopied && (
                                    <span
                                      style={{
                                        backgroundColor: activeUiTheme.marqueeBg,
                                        color: activeUiTheme.accent4,
                                      }}
                                      className="px-2 py-0.5 rounded-full font-mono-zine text-[10px] font-bold -rotate-3"
                                    >
                                      ★ DONE
                                    </span>
                                  )}
                                </div>

                                <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                                  <div>
                                    <div className="font-display text-lg font-extrabold uppercase leading-snug">
                                      {plate.title}
                                    </div>
                                    <p className="text-xs font-semibold theme-muted mt-1">
                                      {plate.subtitle}
                                    </p>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCopyPrompt(plate.id, plate.prompt)
                                    }
                                    className="pop-btn w-full py-2.5 px-3 font-display font-extrabold text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                                    style={{
                                      backgroundColor: justCopied
                                        ? activeUiTheme.accent4
                                        : style.headerBg,
                                      color: justCopied
                                        ? activeUiTheme.accent4Ink
                                        : style.textCol,
                                    }}
                                  >
                                    {justCopied ? (
                                      <>
                                        <Check className="w-4 h-4 stroke-[3]" />{' '}
                                        Copied Shot 0{plate.plateNumber}!
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3.5 h-3.5" /> Copy
                                        Shot 0{plate.plateNumber}
                                      </>
                                    )}
                                  </button>

                                  {showPromptPreview && (
                                    <div className="text-[11px] font-mono-zine theme-input p-2.5 rounded-xl border-2 theme-border max-h-36 overflow-y-auto">
                                      {plate.prompt}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* 3 ARCADE MEDIA CARTRIDGES (VIDEO + 9:16 LOOP + SONG) */}
                      <div className="space-y-3 pt-1">
                        <span
                          style={{
                            backgroundColor: activeUiTheme.marqueeBg,
                            color: activeUiTheme.accent3,
                          }}
                          className="inline-block px-3 py-1 rounded-full font-mono-zine text-xs font-bold uppercase"
                        >
                          🕹️ Motion &amp; Music Cartridges
                        </span>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          {/* 16:9 Cinema Video */}
                          <div className="pop-card theme-tile-3 p-4 flex flex-col justify-between gap-3">
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="font-display text-lg font-extrabold uppercase">
                                  🎬 16:9 Cinema Video
                                </span>
                                {copiedHistory.includes('video') && (
                                  <span
                                    style={{
                                      backgroundColor: activeUiTheme.marqueeBg,
                                      color: activeUiTheme.accent4,
                                    }}
                                    className="px-2 py-0.5 rounded-full font-mono-zine text-[10px] font-bold"
                                  >
                                    ★ DONE
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-semibold theme-muted mt-1">
                                1080p Hero Stream • Use <strong>Quality Mode</strong> in Google Flow
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleCopyPrompt(
                                  'video',
                                  compiledPrompts.videoPrompt
                                )
                              }
                              style={{
                                backgroundColor:
                                  copiedKey === 'video'
                                    ? activeUiTheme.accent4
                                    : activeUiTheme.accent3,
                                color:
                                  copiedKey === 'video'
                                    ? activeUiTheme.accent4Ink
                                    : activeUiTheme.accent3Ink,
                              }}
                              className="pop-btn w-full py-2.5 px-4 font-display font-extrabold text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              {copiedKey === 'video' ? (
                                <>
                                  <Check className="w-4 h-4 stroke-[3]" />{' '}
                                  Copied Video Prompt!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" /> Copy 1080p
                                  Video Prompt
                                </>
                              )}
                            </button>

                            {showPromptPreview && (
                              <div className="text-[11px] font-mono-zine theme-input p-2.5 rounded-xl border-2 theme-border max-h-32 overflow-y-auto">
                                {compiledPrompts.videoPrompt}
                              </div>
                            )}
                          </div>

                          {/* 9:16 Vertical Loop */}
                          <div className="pop-card theme-tile-2 p-4 flex flex-col justify-between gap-3">
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="font-display text-lg font-extrabold uppercase">
                                  📱 9:16 Vertical Loop
                                </span>
                                {copiedHistory.includes('gif') && (
                                  <span
                                    style={{
                                      backgroundColor: activeUiTheme.marqueeBg,
                                      color: activeUiTheme.accent4,
                                    }}
                                    className="px-2 py-0.5 rounded-full font-mono-zine text-[10px] font-bold"
                                  >
                                    ★ DONE
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-semibold theme-muted mt-1">
                                Tilted collector loop (.GIF or vertical 9:16 .MP4 both work!)
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleCopyPrompt(
                                  'gif',
                                  compiledPrompts.gifPrompt
                                )
                              }
                              style={{
                                backgroundColor:
                                  copiedKey === 'gif'
                                    ? activeUiTheme.accent4
                                    : activeUiTheme.accent2,
                                color:
                                  copiedKey === 'gif'
                                    ? activeUiTheme.accent4Ink
                                    : activeUiTheme.accent2Ink,
                              }}
                              className="pop-btn w-full py-2.5 px-4 font-display font-extrabold text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              {copiedKey === 'gif' ? (
                                <>
                                  <Check className="w-4 h-4 stroke-[3]" />{' '}
                                  Copied 9:16 Prompt!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" /> Copy 9:16
                                  Loop Prompt
                                </>
                              )}
                            </button>

                            {showPromptPreview && (
                              <div className="text-[11px] font-mono-zine theme-input p-2.5 rounded-xl border-2 theme-border max-h-32 overflow-y-auto">
                                {compiledPrompts.gifPrompt}
                              </div>
                            )}
                          </div>

                          {/* 30s-60s Synth Song */}
                          <div className="pop-card theme-tile-4 p-4 flex flex-col justify-between gap-3">
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="font-display text-lg font-extrabold uppercase">
                                  🎵 30–60s Synth Song
                                </span>
                                {copiedHistory.includes('audio') && (
                                  <span
                                    style={{
                                      backgroundColor: activeUiTheme.marqueeBg,
                                      color: activeUiTheme.accent4,
                                    }}
                                    className="px-2 py-0.5 rounded-full font-mono-zine text-[10px] font-bold"
                                  >
                                    ★ DONE
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-semibold theme-muted mt-1">
                                Powers the Spinning Vinyl Boombox &amp; candy visualizer
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleCopyPrompt(
                                  'audio',
                                  compiledPrompts.audioPrompt
                                )
                              }
                              style={{
                                backgroundColor: activeUiTheme.accent4,
                                color: activeUiTheme.accent4Ink,
                              }}
                              className="pop-btn w-full py-2.5 px-4 font-display font-extrabold text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              {copiedKey === 'audio' ? (
                                <>
                                  <Check className="w-4 h-4 stroke-[3]" />{' '}
                                  Copied Song Prompt!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" /> Copy Song
                                  Prompt
                                </>
                              )}
                            </button>

                            {showPromptPreview && (
                              <div className="text-[11px] font-mono-zine theme-input p-2.5 rounded-xl border-2 theme-border max-h-32 overflow-y-auto">
                                {compiledPrompts.audioPrompt}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => setWizardStep(1)}
                          className="pop-btn px-4 py-2.5 theme-surface font-display font-extrabold text-xs uppercase flex items-center gap-1.5 cursor-pointer"
                        >
                          <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.triggerTactileBlip(860)
                            setWizardStep(3)
                          }}
                          style={{
                            backgroundColor: activeUiTheme.accent4,
                            color: activeUiTheme.accent4Ink,
                          }}
                          className="pop-btn px-7 py-3.5 font-display font-extrabold text-sm sm:text-base uppercase flex items-center gap-2 cursor-pointer"
                        >
                          Next: Drop All 7 Files &amp; Launch{' '}
                          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ---------------- STEP 3: DROP ALL 7 FILES & LAUNCH STANDALONE ZINE ---------------- */}
                  {wizardStep === 3 && (
                    <div className="pop-card theme-middle p-6 sm:p-7 space-y-6">
                      <div>
                        <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase">
                          ③ Drop All 7 Files &amp; Launch Your Zine!
                        </h2>
                        <p className="text-sm font-medium theme-muted mt-0.5">
                          Drag all 7 files in one swipe — OR click any individual Polaroid frame below to swap a single shot!
                        </p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* LEFT 7 COLS: Giant Playground Dropzone + 4 Clickable Polaroid Slots */}
                        <div className="lg:col-span-7 space-y-4">
                          <label
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault()
                              handleFilesSelected(e.dataTransfer.files)
                            }}
                            style={{ boxShadow: '4px 4px 0 var(--ui-border)' }}
                            className="block rounded-2xl border-[3px] border-dashed theme-border theme-tile-1 hover:brightness-105 p-6 text-center transition-all cursor-pointer"
                          >
                            <input
                              type="file"
                              multiple
                              accept="image/*,video/*,audio/*,.gif,.txt,.md"
                              onChange={(e) =>
                                handleFilesSelected(e.target.files)
                              }
                              className="hidden"
                            />
                            <Upload className="w-8 h-8 mx-auto mb-2 stroke-[2.5]" />
                            <div className="font-display text-lg font-extrabold uppercase">
                              🎪 Drop All 7 Files Here at Once!
                            </div>
                            <div className="text-xs font-bold theme-muted mt-1">
                              4x 2K Shots (.jpg/.png) + 9:16 Loop (.gif/.mp4) + 16:9 Cinema (.mp4) + Song (.mp3)
                            </div>
                          </label>

                          {/* 4 Individual Storyboard Polaroid Swap Slots */}
                          <div className="pop-card theme-tile-4 p-4 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-mono-zine text-xs font-bold uppercase">
                                📸 Click Any Shot to Swap Individually:
                              </span>
                              <div className="flex gap-2">
                                <label className="px-2.5 py-1 rounded-lg border-2 theme-border theme-tile-2 font-mono-zine text-[10px] font-bold uppercase cursor-pointer">
                                  <input
                                    type="file"
                                    accept="image/gif,video/mp4,video/webm"
                                    onChange={(e) =>
                                      handleFilesSelected(e.target.files, 'gif')
                                    }
                                    className="hidden"
                                  />
                                  📱 Swap 9:16
                                </label>
                                <label className="px-2.5 py-1 rounded-lg border-2 theme-border theme-tile-3 font-mono-zine text-[10px] font-bold uppercase cursor-pointer">
                                  <input
                                    type="file"
                                    accept="video/mp4,video/webm"
                                    onChange={(e) =>
                                      handleFilesSelected(
                                        e.target.files,
                                        'video'
                                      )
                                    }
                                    className="hidden"
                                  />
                                  🎬 Swap 16:9
                                </label>
                                <label className="px-2.5 py-1 rounded-lg border-2 theme-border theme-tile-1 font-mono-zine text-[10px] font-bold uppercase cursor-pointer">
                                  <input
                                    type="file"
                                    accept="audio/*,.mp3,.m4a,.wav"
                                    onChange={(e) =>
                                      handleFilesSelected(
                                        e.target.files,
                                        'audio'
                                      )
                                    }
                                    className="hidden"
                                  />
                                  🎵 Swap Song
                                </label>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {[
                                '01 Wide',
                                '02 Action',
                                '03 Macro',
                                '04 After',
                              ].map((slotLabel, idx) => (
                                <label
                                  key={slotLabel}
                                  style={{
                                    boxShadow: '2px 2px 0 var(--ui-border)',
                                  }}
                                  className="group rounded-xl border-2 theme-border theme-surface p-2 hover:-translate-y-0.5 transition-transform cursor-pointer"
                                >
                                  <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={(e) =>
                                      handleReplaceSinglePlate(
                                        idx,
                                        e.target.files
                                      )
                                    }
                                    className="hidden"
                                  />
                                  <div className="aspect-[16/10] rounded-lg border theme-border overflow-hidden theme-input">
                                    {activeGallery[idx] ? (
                                      <img
                                        src={activeGallery[idx]}
                                        alt={slotLabel}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">
                                        + Upload
                                      </div>
                                    )}
                                  </div>
                                  <div className="font-mono-zine text-[10px] font-bold uppercase text-center pt-1.5">
                                    {slotLabel}
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* RIGHT 5 COLS: Drive Sync + Big Launch Buttons */}
                        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
                          <div className="pop-card theme-tile-3 p-4 space-y-3">
                            <div className="flex items-center gap-2 font-display text-sm font-extrabold uppercase">
                              <FolderSync className="w-4 h-4" /> Or Pull From Your Google Drive Archive
                            </div>

                            <select
                              value={activeSlate.driveFolderId || ''}
                              onChange={(e) => {
                                const fid = e.target.value
                                if (fid) {
                                  setDriveInputUrl(
                                    `https://drive.google.com/drive/folders/${fid}`
                                  )
                                  handleSyncDriveFolder(fid)
                                }
                              }}
                              className="w-full theme-input border-2 theme-border rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                            >
                              <option value="">
                                -- Pick any of your 94 Drive Scenario Folders --
                              </option>
                              {ARCHIVE_94_SCENARIOS.map((sc) => (
                                <option key={sc.id} value={sc.id}>
                                  {sc.bundledKey ? '★ ' : ''}
                                  {sc.name}
                                </option>
                              ))}
                            </select>

                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={driveInputUrl}
                                onChange={(e) =>
                                  setDriveInputUrl(e.target.value)
                                }
                                placeholder="Or paste Drive folder link..."
                                className="flex-1 theme-input border-2 theme-border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleSyncDriveFolder()}
                                disabled={isSyncingDrive}
                                style={{
                                  backgroundColor: activeUiTheme.accent1,
                                  color: activeUiTheme.accent1Ink,
                                }}
                                className="pop-btn px-3.5 py-2 font-display text-xs font-extrabold uppercase cursor-pointer shrink-0"
                              >
                                {isSyncingDrive ? '...' : 'Sync'}
                              </button>
                            </div>

                            {syncStatus && (
                              <div className="px-3 py-1.5 rounded-xl theme-surface border-2 theme-border text-xs font-bold">
                                {syncStatus}
                              </div>
                            )}
                          </div>

                          <div className="space-y-3">
                            <button
                              type="button"
                              onClick={handleExportHtmlFromStudio}
                              disabled={isExportingStep3}
                              style={{
                                backgroundColor: activeUiTheme.accent2,
                                color: activeUiTheme.accent2Ink,
                              }}
                              className="pop-btn w-full py-4 px-5 font-display font-extrabold text-sm sm:text-base uppercase flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Download className="w-5 h-5 stroke-[2.5]" />
                              {isExportingStep3
                                ? 'Packing Standalone .HTML Zine...'
                                : '🚀 Download Standalone .HTML Zine'}
                            </button>

                            <div className="flex items-center gap-2.5">
                              <button
                                type="button"
                                onClick={() => setWizardStep(2)}
                                className="pop-btn px-4 py-3 theme-surface font-display font-extrabold text-xs uppercase cursor-pointer"
                              >
                                <ArrowLeft className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => void handleCommitToVault()}
                                disabled={isSavingShelf}
                                style={{
                                  backgroundColor: activeUiTheme.accent4,
                                  color: activeUiTheme.accent4Ink,
                                }}
                                className="pop-btn flex-1 py-3 px-4 font-display font-extrabold text-xs sm:text-sm uppercase flex items-center justify-center gap-2 cursor-pointer"
                              >
                                <Archive className="w-4 h-4 stroke-[2.5]" />{' '}
                                {isSavingShelf
                                  ? 'Saving Shelf...'
                                  : '💾 Save to Shelf'}
                              </button>
                            </div>

                            {IS_LOCAL_STUDIO && (
                              <button
                                type="button"
                                onClick={() => void handlePublishToPhone(true)}
                                disabled={isPublishingPhone || isSavingShelf}
                                style={{
                                  backgroundColor: activeUiTheme.accent3,
                                  color: activeUiTheme.accent3Ink,
                                }}
                                className="pop-btn w-full py-3 px-5 font-display font-extrabold text-xs sm:text-sm uppercase flex items-center justify-center gap-2 cursor-pointer"
                              >
                                <Send className="w-4 h-4 stroke-[2.5]" />
                                {isPublishingPhone
                                  ? 'Pushing Zine to Your Phone...'
                                  : '📲 Save & Publish to Phone Reader'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>

            {/* ==================== LIVE INTERACTIVE ZINE CANVAS ==================== */}
            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <div
                  style={{ color: activeUiTheme.canvasText }}
                  className="flex items-center gap-2 font-display text-lg font-extrabold uppercase"
                >
                  <Sparkles
                    style={{
                      color:
                        activeUiTheme.cardShadowColor === '#121212'
                          ? '#FF2A85'
                          : activeUiTheme.cardShadowColor,
                    }}
                    className="w-5 h-5"
                  />{' '}
                  Live Interactive Zine Issue Preview
                </div>
                <span
                  style={{ color: activeUiTheme.canvasMuted }}
                  className="font-mono-zine text-xs font-bold"
                >
                  Remix candy palettes or export a standalone .HTML zine right below!
                </span>
              </div>

              <LoreWebpageView
                slate={activeSlate}
                onUpdateSlate={handleUpdateActiveSlate}
                uiTheme={activeUiTheme}
              />
            </section>
          </div>
        )}

        {/* ===================================================================
            TAB 2: ZINE SHELF (Vibrant Magazine Issue Rack + Full Issue Viewer)
           =================================================================== */}
        {!isReaderMode && activeTab === 'VAULT' && (
          <div className="space-y-9">
            <div className="pop-card theme-tile-1 p-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl font-extrabold uppercase">
                  📚 Your Pop-Zine Issue Shelf ({vaultSlates.length} Issues)
                </h2>
                <p className="text-sm font-semibold theme-muted">
                  Click any magazine cover below to read &amp; play, or publish your shelf straight to the Mobile Zine Reader!
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {IS_LOCAL_STUDIO && (
                  <button
                    type="button"
                    onClick={() => void handlePublishToPhone(false)}
                    disabled={isPublishingPhone || isSavingShelf}
                    style={{
                      backgroundColor: activeUiTheme.accent3,
                      color: activeUiTheme.accent3Ink,
                    }}
                    className="pop-btn px-5 py-3 font-display font-extrabold text-sm uppercase flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    {isPublishingPhone
                      ? 'Publishing to Phone...'
                      : '📲 Publish Shelf to Phone'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleBatchRoll9Slates}
                  style={{
                    backgroundColor: activeUiTheme.accent2,
                    color: activeUiTheme.accent2Ink,
                  }}
                  className="pop-btn px-5 py-3 font-display font-extrabold text-sm uppercase flex items-center gap-2 cursor-pointer"
                >
                  <Dices className="w-4 h-4" /> Spin 9 Random Issues!
                </button>
              </div>
            </div>

            {/* Colorful Magazine Rack */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {vaultSlates.map((slate, idx) => {
                const isSelected = slate.id === selectedVaultSlate?.id
                const pal = getZinePalette(slate.finish)
                const plateCount =
                  slate.galleryUrls && slate.galleryUrls.length > 0
                    ? slate.galleryUrls.length
                    : 1
                const tilt = idx % 2 === 0 ? 'sm:-rotate-[0.7deg]' : 'sm:rotate-[0.7deg]'
                return (
                  <div
                    key={slate.id}
                    onClick={() => {
                      soundEngine.triggerTactileBlip(820)
                      setSelectedVaultId(slate.id)
                    }}
                    style={{
                      backgroundColor: isSelected
                        ? activeUiTheme.tile1
                        : activeUiTheme.surfaceBg,
                      color: activeUiTheme.ink,
                    }}
                    className={`pop-card pop-card-lift p-4 cursor-pointer flex flex-col justify-between gap-3 ${tilt} hover:rotate-0`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        style={{ backgroundColor: activeUiTheme.marqueeBg }}
                        className="w-24 h-20 rounded-xl border-2 theme-border overflow-hidden shrink-0"
                      >
                        <img
                          src={slate.stillUrl}
                          alt={slate.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span
                          className="inline-block px-2 py-0.5 rounded-full border theme-border font-mono-zine text-[10px] font-bold uppercase"
                          style={{
                            backgroundColor: activeUiTheme.accent2,
                            color: activeUiTheme.accent2Ink,
                          }}
                        >
                          {pal.emoji} ISSUE #{String(slate.phaseIndex).padStart(2, '0')}
                        </span>
                        <div className="font-display text-xl font-extrabold uppercase truncate leading-tight mt-1">
                          {slate.title}
                        </div>
                        <div className="font-mono-zine text-[10px] font-bold theme-muted mt-1">
                          {plateCount} SHOTS • 9:16 • 1080P • SONG
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t-2 theme-border flex items-center justify-between text-xs font-bold">
                      <span>
                        {isSelected ? '★ OPEN BELOW' : 'Click to Read Issue'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          soundEngine.triggerTuningBladeChime('normal')
                          setActiveSlate(slate)
                          setActiveTab('STUDIO')
                        }}
                        className="px-2.5 py-1 rounded-lg border-2 theme-border theme-elevated hover:brightness-110 font-mono-zine text-[10px] uppercase flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" /> Remix
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {selectedVaultSlate && (
              <LoreWebpageView
                slate={selectedVaultSlate}
                uiTheme={activeUiTheme}
                onUpdateSlate={(patch) => {
                  setVaultSlates((prev) =>
                    prev.map((item) =>
                      item.id === selectedVaultSlate.id
                        ? { ...item, ...patch }
                        : item
                    )
                  )
                }}
              />
            )}
          </div>
        )}

        {/* ===================================================================
            TAB 3: 50 STORY SEEDS (Playful Colorful Seed Stickers)
           =================================================================== */}
        {!isReaderMode && activeTab === 'TIMELINE' && (
          <div className="space-y-6">
            <div className="pop-card theme-tile-3 p-6">
              <h2 className="font-display text-3xl font-extrabold uppercase">
                🎰 All 50 Canonical Story Seeds
              </h2>
              <p className="text-sm font-semibold theme-muted mt-0.5">
                Pick any wild scenario below to load it straight into the Zine Maker!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CATEGORY_MASTER_50_PHASES.map((phase, idx) => {
                const cardTints = [
                  activeUiTheme.tile1,
                  activeUiTheme.tile2,
                  activeUiTheme.tile3,
                  activeUiTheme.tile4,
                ]
                return (
                  <div
                    key={phase.index}
                    style={{
                      backgroundColor: cardTints[idx % cardTints.length],
                      color: activeUiTheme.ink,
                    }}
                    className="pop-card pop-card-lift p-4 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <span className="inline-block px-2.5 py-0.5 rounded-full theme-elevated border-2 theme-border font-mono-zine text-[10px] font-bold uppercase">
                        {phase.actPhase}
                      </span>
                      <div className="font-display text-lg font-extrabold uppercase truncate mt-1.5">
                        {phase.encounterTarget.split('(')[0].trim()} —{' '}
                        {phase.action}
                      </div>
                      <div className="text-xs font-semibold theme-muted truncate mt-0.5">
                        📍 {phase.environmentBiome}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.triggerTuningBladeChime('normal')
                        setCopiedHistory([])
                        setActiveSlate(buildSlateFromPhase(phase))
                        setWizardStep(1)
                        setBuilderCollapsed(false)
                        setActiveTab('STUDIO')
                      }}
                      style={{
                        backgroundColor: activeUiTheme.accent1,
                        color: activeUiTheme.accent1Ink,
                      }}
                      className="pop-btn px-4 py-2.5 font-display text-xs font-extrabold uppercase shrink-0 cursor-pointer"
                    >
                      Make Zine →
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
