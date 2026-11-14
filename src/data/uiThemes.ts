export type UiThemeId =
  | 'pop-zine'
  | 'slime'
  | 'mechanical'
  | 'gothic'
  | 'horror'
  | 'futuristic'
  | 'forest-crystal'
  | 'cyber-sakura'
  | 'cosmic-void'

export interface StudioUiTheme {
  id: UiThemeId
  name: string
  shortLabel: string
  emoji: string
  tagline: string
  isDark: boolean
  marqueeBg: string
  marqueeText: string
  headerBg: string
  headerInk: string
  headerSub: string
  headerBorder: string
  logoBg: string
  logoText: string
  stripBg: string
  // Middle & Tile Surfaces
  middleBg: string
  middleBgImage: string
  middleBgSize: string
  surfaceBg: string
  surfaceElevated: string
  tile1: string
  tile2: string
  tile3: string
  tile4: string
  mastheadBg: string
  inputBg: string
  // Ink, Borders & Shadows
  ink: string
  mutedInk: string
  borderColor: string
  cardShadowColor: string
  subShadowColor: string
  cardGlowColor: string
  canvasText: string
  canvasMuted: string
  // 4 Cohesive Theme Accents + Guaranteed-Contrast Foreground Inks
  accent1: string
  accent1Ink: string
  accent2: string
  accent2Ink: string
  accent3: string
  accent3Ink: string
  accent4: string
  accent4Ink: string
  // Scrollbar & Swatches
  scrollTrack: string
  scrollThumb: string
  swatchColors: [string, string, string]
  bgColor: string
  bgImage: string
  bgSize: string
}

function svgTile(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" ${svg}</svg>`
  )}")`
}

// Crisp seamless vector textures per mood (lightweight inline data URIs)
const SLIME_BUBBLES_SVG = svgTile(
  `width="120" height="120" viewBox="0 0 120 120"><circle cx="22" cy="24" r="10" fill="none" stroke="rgba(184,255,0,0.22)" stroke-width="2"/><circle cx="22" cy="24" r="3" fill="rgba(184,255,0,0.18)"/><circle cx="88" cy="36" r="15" fill="rgba(74,222,128,0.10)" stroke="rgba(163,255,0,0.24)" stroke-width="2"/><circle cx="52" cy="88" r="19" fill="rgba(163,255,0,0.08)" stroke="rgba(184,255,0,0.20)" stroke-width="2"/><circle cx="102" cy="96" r="7" fill="rgba(0,255,163,0.18)"/><path d="M0 0 Q15 18 30 0 Q45 24 60 0 Q75 14 90 0 Q105 22 120 0" fill="none" stroke="rgba(184,255,0,0.16)" stroke-width="2.5"/></svg>`
)

const MECHANICAL_GEARS_SVG = svgTile(
  `width="140" height="140" viewBox="0 0 140 140"><path d="M0 70 H140 M70 0 V140" stroke="rgba(245,158,11,0.11)" stroke-width="1"/><circle cx="35" cy="35" r="18" fill="none" stroke="rgba(245,158,11,0.20)" stroke-width="3" stroke-dasharray="6 4"/><circle cx="35" cy="35" r="7" fill="none" stroke="rgba(251,191,36,0.25)" stroke-width="2"/><circle cx="105" cy="105" r="24" fill="none" stroke="rgba(148,163,184,0.18)" stroke-width="4" stroke-dasharray="8 5"/><circle cx="105" cy="105" r="10" fill="none" stroke="rgba(245,158,11,0.20)" stroke-width="2"/><circle cx="14" cy="126" r="2.5" fill="rgba(255,255,255,0.16)"/><circle cx="126" cy="14" r="2.5" fill="rgba(255,255,255,0.16)"/></svg>`
)

const GOTHIC_ARCH_SVG = svgTile(
  `width="100" height="140" viewBox="0 0 100 140"><path d="M10 140 V62 Q50 8 90 62 V140" fill="none" stroke="rgba(192,132,252,0.18)" stroke-width="2"/><path d="M24 140 V68 Q50 28 76 68 V140" fill="none" stroke="rgba(244,63,94,0.15)" stroke-width="1.5"/><circle cx="50" cy="48" r="10" fill="none" stroke="rgba(216,180,254,0.18)" stroke-width="1.5"/><path d="M50 34 V62 M36 48 H64" stroke="rgba(244,63,94,0.16)" stroke-width="1.2"/></svg>`
)

const HORROR_SCRATCH_SVG = svgTile(
  `width="120" height="120" viewBox="0 0 120 120"><path d="M0 12 H120 M0 36 H120 M0 60 H120 M0 84 H120 M0 108 H120" stroke="rgba(255,255,255,0.035)" stroke-width="1"/><path d="M18 14 L24 44 L19 72 M28 18 L34 52 L29 76 M38 22 L43 48" stroke="rgba(239,68,68,0.20)" stroke-width="1.8" stroke-linecap="round"/><path d="M78 68 L94 102 M86 64 L103 98" stroke="rgba(220,38,38,0.16)" stroke-width="1.5"/></svg>`
)

const FUTURISTIC_GRID_SVG = svgTile(
  `width="80" height="80" viewBox="0 0 80 80"><path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(0,229,255,0.18)" stroke-width="1"/><circle cx="0" cy="0" r="2.5" fill="rgba(255,0,200,0.45)"/><path d="M20 40 H36 L44 32 H62" fill="none" stroke="rgba(0,229,255,0.16)" stroke-width="1.2"/></svg>`
)

const FOREST_CRYSTAL_SVG = svgTile(
  `width="130" height="130" viewBox="0 0 130 130"><polygon points="32,12 46,34 40,68 24,68 18,34" fill="rgba(45,212,191,0.09)" stroke="rgba(94,234,212,0.28)" stroke-width="1.5"/><line x1="32" y1="12" x2="32" y2="68" stroke="rgba(167,243,208,0.20)" stroke-width="1"/><polygon points="96,48 112,72 104,112 86,112 80,72" fill="rgba(168,85,247,0.09)" stroke="rgba(192,132,252,0.26)" stroke-width="1.5"/><circle cx="68" cy="24" r="2.2" fill="rgba(167,243,208,0.45)"/><circle cx="16" cy="102" r="2" fill="rgba(56,189,248,0.40)"/><circle cx="114" cy="22" r="1.8" fill="rgba(216,180,254,0.45)"/></svg>`
)

const SAKURA_RAIN_SVG = svgTile(
  `width="100" height="100" viewBox="0 0 100 100"><line x1="16" y1="0" x2="8" y2="34" stroke="rgba(56,189,248,0.20)" stroke-width="1.5"/><line x1="68" y1="12" x2="60" y2="48" stroke="rgba(255,77,148,0.22)" stroke-width="1.5"/><line x1="44" y1="54" x2="36" y2="92" stroke="rgba(56,189,248,0.16)" stroke-width="1.2"/><circle cx="82" cy="74" r="4" fill="rgba(255,133,179,0.24)"/><circle cx="24" cy="78" r="3" fill="rgba(251,191,36,0.20)"/></svg>`
)

const COSMIC_STARS_SVG = svgTile(
  `width="120" height="120" viewBox="0 0 120 120"><circle cx="20" cy="24" r="1.6" fill="rgba(255,255,255,0.45)"/><circle cx="78" cy="18" r="1.2" fill="rgba(250,204,21,0.55)"/><circle cx="102" cy="68" r="2" fill="rgba(56,189,248,0.45)"/><circle cx="44" cy="86" r="1.4" fill="rgba(232,121,249,0.50)"/><ellipse cx="64" cy="60" rx="28" ry="9" transform="rotate(-22 64 60)" fill="none" stroke="rgba(250,204,21,0.16)" stroke-width="1.3"/></svg>`
)

export const STUDIO_UI_THEMES: StudioUiTheme[] = [
  {
    id: 'pop-zine',
    name: 'Pop-Zine Halftone',
    shortLabel: 'Pop-Zine',
    emoji: '🍭',
    tagline: 'Sunburst cream risograph paper with neon candy splatters',
    isDark: false,
    marqueeBg: '#121212',
    marqueeText: '#FFE600',
    headerBg: 'rgba(255, 251, 240, 0.94)',
    headerInk: '#121212',
    headerSub: '#FF2A85',
    headerBorder: '#121212',
    logoBg: '#FF2A85',
    logoText: '#FFFFFF',
    stripBg: 'rgba(255, 249, 196, 0.92)',
    middleBg: '#FFFFFF',
    middleBgImage: 'radial-gradient(rgba(18,18,18,0.06) 1.2px, transparent 1.2px)',
    middleBgSize: '18px 18px',
    surfaceBg: '#FFFDF7',
    surfaceElevated: '#FFFFFF',
    tile1: '#FFF9C4',
    tile2: '#FFE4F0',
    tile3: '#E0F7FA',
    tile4: '#ECFCCB',
    mastheadBg: '#FFE600',
    inputBg: '#FFFFFF',
    ink: '#121212',
    mutedInk: '#525252',
    borderColor: '#121212',
    cardShadowColor: '#121212',
    subShadowColor: '#121212',
    cardGlowColor: 'rgba(18, 18, 18, 0.12)',
    canvasText: '#121212',
    canvasMuted: '#525252',
    accent1: '#FFE600',
    accent1Ink: '#121212',
    accent2: '#FF2A85',
    accent2Ink: '#FFFFFF',
    accent3: '#00E5FF',
    accent3Ink: '#121212',
    accent4: '#B8FF00',
    accent4Ink: '#121212',
    scrollTrack: '#FFFBF0',
    scrollThumb: '#FF2A85',
    swatchColors: ['#FFE600', '#FF2A85', '#00E5FF'],
    bgColor: '#FFFBF0',
    bgImage: [
      'radial-gradient(circle at 12% 18%, rgba(255, 230, 0, 0.28) 0%, transparent 34%)',
      'radial-gradient(circle at 88% 12%, rgba(255, 42, 133, 0.18) 0%, transparent 32%)',
      'radial-gradient(circle at 82% 78%, rgba(0, 229, 255, 0.22) 0%, transparent 36%)',
      'radial-gradient(circle at 18% 85%, rgba(184, 255, 0, 0.24) 0%, transparent 34%)',
      'radial-gradient(rgba(18, 18, 18, 0.14) 1.25px, transparent 1.25px)',
    ].join(', '),
    bgSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%, 22px 22px',
  },
  {
    id: 'slime',
    name: 'Toxic Slime Lab',
    shortLabel: 'Slime',
    emoji: '🧪',
    tagline: 'Radioactive mutagen vat with bubbling acid-lime cells',
    isDark: true,
    marqueeBg: '#07140A',
    marqueeText: '#B8FF00',
    headerBg: 'rgba(10, 31, 16, 0.94)',
    headerInk: '#ECFCCB',
    headerSub: '#B8FF00',
    headerBorder: '#B8FF00',
    logoBg: '#B8FF00',
    logoText: '#0A1F10',
    stripBg: 'rgba(16, 42, 22, 0.94)',
    middleBg: '#0E2615',
    middleBgImage: [
      'radial-gradient(circle at 85% 15%, rgba(184,255,0,0.12), transparent 45%)',
      SLIME_BUBBLES_SVG,
    ].join(', '),
    middleBgSize: '100% 100%, 120px 120px',
    surfaceBg: '#13301B',
    surfaceElevated: '#193D23',
    tile1: '#173B20',
    tile2: '#1F4016',
    tile3: '#103B31',
    tile4: '#244214',
    mastheadBg: '#1C4A24',
    inputBg: '#08170C',
    ink: '#ECFCCB',
    mutedInk: '#BEF264',
    borderColor: '#84CC16',
    cardShadowColor: '#A3FF00',
    subShadowColor: '#040D06',
    cardGlowColor: 'rgba(163, 255, 0, 0.28)',
    canvasText: '#ECFCCB',
    canvasMuted: '#BEF264',
    accent1: '#B8FF00',
    accent1Ink: '#07170C',
    accent2: '#10B981',
    accent2Ink: '#04130D',
    accent3: '#00FFA3',
    accent3Ink: '#041710',
    accent4: '#D9F99D',
    accent4Ink: '#07170C',
    scrollTrack: '#07140A',
    scrollThumb: '#B8FF00',
    swatchColors: ['#B8FF00', '#22C55E', '#092412'],
    bgColor: '#07170C',
    bgImage: [
      'radial-gradient(circle at 14% 20%, rgba(184, 255, 0, 0.28) 0%, transparent 36%)',
      'radial-gradient(circle at 86% 24%, rgba(16, 185, 129, 0.26) 0%, transparent 40%)',
      'radial-gradient(circle at 75% 84%, rgba(132, 204, 22, 0.24) 0%, transparent 38%)',
      'radial-gradient(circle at 20% 82%, rgba(0, 255, 163, 0.16) 0%, transparent 36%)',
      SLIME_BUBBLES_SVG,
    ].join(', '),
    bgSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%, 120px 120px',
  },
  {
    id: 'mechanical',
    name: 'Heavy Mechanical',
    shortLabel: 'Mechanical',
    emoji: '⚙️',
    tagline: 'Riveted iron foundry with brass gears & amber furnace glow',
    isDark: true,
    marqueeBg: '#18181B',
    marqueeText: '#FACC15',
    headerBg: 'rgba(28, 29, 34, 0.95)',
    headerInk: '#FEF3C7',
    headerSub: '#F59E0B',
    headerBorder: '#F59E0B',
    logoBg: '#F59E0B',
    logoText: '#121212',
    stripBg: 'rgba(34, 36, 42, 0.95)',
    middleBg: '#1E222B',
    middleBgImage: [
      'radial-gradient(circle at 85% 15%, rgba(245,158,11,0.12), transparent 45%)',
      MECHANICAL_GEARS_SVG,
    ].join(', '),
    middleBgSize: '100% 100%, 140px 140px',
    surfaceBg: '#252A34',
    surfaceElevated: '#2E3440',
    tile1: '#2D271E',
    tile2: '#30221C',
    tile3: '#1F2B36',
    tile4: '#292B22',
    mastheadBg: '#33281A',
    inputBg: '#12151B',
    ink: '#FEF3C7',
    mutedInk: '#FDE68A',
    borderColor: '#F59E0B',
    cardShadowColor: '#F59E0B',
    subShadowColor: '#090B0E',
    cardGlowColor: 'rgba(245, 158, 11, 0.24)',
    canvasText: '#FEF3C7',
    canvasMuted: '#FCD34D',
    accent1: '#F59E0B',
    accent1Ink: '#121212',
    accent2: '#EA580C',
    accent2Ink: '#FFFFFF',
    accent3: '#38BDF8',
    accent3Ink: '#0B1528',
    accent4: '#FACC15',
    accent4Ink: '#121212',
    scrollTrack: '#18181B',
    scrollThumb: '#F59E0B',
    swatchColors: ['#F59E0B', '#EA580C', '#3F3F46'],
    bgColor: '#16181E',
    bgImage: [
      'radial-gradient(circle at 15% 15%, rgba(245, 158, 11, 0.24) 0%, transparent 38%)',
      'radial-gradient(circle at 85% 25%, rgba(234, 88, 12, 0.20) 0%, transparent 36%)',
      'radial-gradient(circle at 50% 85%, rgba(148, 163, 184, 0.18) 0%, transparent 45%)',
      'repeating-linear-gradient(-45deg, rgba(245,158,11,0.03) 0px, rgba(245,158,11,0.03) 8px, transparent 8px, transparent 16px)',
      MECHANICAL_GEARS_SVG,
    ].join(', '),
    bgSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%, 140px 140px',
  },
  {
    id: 'gothic',
    name: 'Gothic Cathedral',
    shortLabel: 'Gothic',
    emoji: '🦇',
    tagline: 'Velvet obsidian crypt with stained-glass rose arches',
    isDark: true,
    marqueeBg: '#160922',
    marqueeText: '#F0ABFC',
    headerBg: 'rgba(23, 12, 36, 0.95)',
    headerInk: '#FAF5FF',
    headerSub: '#F43F5E',
    headerBorder: '#C084FC',
    logoBg: '#9D174D',
    logoText: '#FFFFFF',
    stripBg: 'rgba(30, 15, 48, 0.94)',
    middleBg: '#180E29',
    middleBgImage: [
      'radial-gradient(circle at 80% 15%, rgba(190,18,60,0.16), transparent 45%)',
      GOTHIC_ARCH_SVG,
    ].join(', '),
    middleBgSize: '100% 100%, 100px 140px',
    surfaceBg: '#221338',
    surfaceElevated: '#2C1947',
    tile1: '#281440',
    tile2: '#34112A',
    tile3: '#1D193D',
    tile4: '#2D1636',
    mastheadBg: '#311245',
    inputBg: '#0E071A',
    ink: '#FAF5FF',
    mutedInk: '#E9D5FF',
    borderColor: '#C084FC',
    cardShadowColor: '#A855F7',
    subShadowColor: '#07030D',
    cardGlowColor: 'rgba(168, 85, 247, 0.28)',
    canvasText: '#FAF5FF',
    canvasMuted: '#E9D5FF',
    accent1: '#C084FC',
    accent1Ink: '#140724',
    accent2: '#E11D48',
    accent2Ink: '#FFFFFF',
    accent3: '#818CF8',
    accent3Ink: '#0E1029',
    accent4: '#F472B6',
    accent4Ink: '#1F0814',
    scrollTrack: '#12081C',
    scrollThumb: '#C084FC',
    swatchColors: ['#A855F7', '#BE123C', '#1F1133'],
    bgColor: '#10081B',
    bgImage: [
      'radial-gradient(circle at 22% 18%, rgba(190, 18, 60, 0.28) 0%, transparent 38%)',
      'radial-gradient(circle at 78% 22%, rgba(147, 51, 234, 0.28) 0%, transparent 40%)',
      'radial-gradient(circle at 50% 88%, rgba(126, 34, 206, 0.22) 0%, transparent 44%)',
      GOTHIC_ARCH_SVG,
    ].join(', '),
    bgSize: '100% 100%, 100% 100%, 100% 100%, 100px 140px',
  },
  {
    id: 'horror',
    name: 'VHS Analog Horror',
    shortLabel: 'Horror',
    emoji: '🩸',
    tagline: 'Pitch-black CRT scanlines, blood crimson fog & claw marks',
    isDark: true,
    marqueeBg: '#1A0408',
    marqueeText: '#FF3B5C',
    headerBg: 'rgba(22, 6, 9, 0.95)',
    headerInk: '#FFE4E6',
    headerSub: '#EF4444',
    headerBorder: '#EF4444',
    logoBg: '#DC2626',
    logoText: '#FFFFFF',
    stripBg: 'rgba(34, 9, 13, 0.95)',
    middleBg: '#16070A',
    middleBgImage: [
      'radial-gradient(circle at 80% 20%, rgba(220,38,38,0.18), transparent 45%)',
      HORROR_SCRATCH_SVG,
    ].join(', '),
    middleBgSize: '100% 100%, 120px 120px',
    surfaceBg: '#200A0F',
    surfaceElevated: '#2B0E15',
    tile1: '#2B0C13',
    tile2: '#230E1A',
    tile3: '#26120E',
    tile4: '#210B0C',
    mastheadBg: '#3A0A12',
    inputBg: '#0B0305',
    ink: '#FFE4E6',
    mutedInk: '#FDA4AF',
    borderColor: '#EF4444',
    cardShadowColor: '#EF4444',
    subShadowColor: '#050102',
    cardGlowColor: 'rgba(239, 68, 68, 0.30)',
    canvasText: '#FFE4E6',
    canvasMuted: '#FDA4AF',
    accent1: '#EF4444',
    accent1Ink: '#FFFFFF',
    accent2: '#B91C1C',
    accent2Ink: '#FFFFFF',
    accent3: '#F97316',
    accent3Ink: '#121212',
    accent4: '#FCA5A5',
    accent4Ink: '#1A0408',
    scrollTrack: '#0C0305',
    scrollThumb: '#EF4444',
    swatchColors: ['#EF4444', '#991B1B', '#170406'],
    bgColor: '#080305',
    bgImage: [
      'radial-gradient(circle at 18% 22%, rgba(220, 38, 38, 0.30) 0%, transparent 40%)',
      'radial-gradient(circle at 82% 76%, rgba(153, 27, 27, 0.34) 0%, transparent 42%)',
      'radial-gradient(circle at 50% 50%, rgba(127, 29, 29, 0.14) 0%, transparent 55%)',
      HORROR_SCRATCH_SVG,
    ].join(', '),
    bgSize: '100% 100%, 100% 100%, 100% 100%, 120px 120px',
  },
  {
    id: 'futuristic',
    name: 'Holo-Grid Futuristic',
    shortLabel: 'Futuristic',
    emoji: '⚡',
    tagline: 'Hyperspace laser blueprint grid with electric cyan & magenta',
    isDark: true,
    marqueeBg: '#030B1A',
    marqueeText: '#00E5FF',
    headerBg: 'rgba(6, 16, 38, 0.94)',
    headerInk: '#E0F7FF',
    headerSub: '#00E5FF',
    headerBorder: '#00E5FF',
    logoBg: '#00E5FF',
    logoText: '#040B1A',
    stripBg: 'rgba(9, 22, 50, 0.94)',
    middleBg: '#07152E',
    middleBgImage: [
      'radial-gradient(circle at 85% 15%, rgba(0,229,255,0.14), transparent 45%)',
      FUTURISTIC_GRID_SVG,
    ].join(', '),
    middleBgSize: '100% 100%, 80px 80px',
    surfaceBg: '#0B1E3D',
    surfaceElevated: '#102852',
    tile1: '#0D254C',
    tile2: '#231240',
    tile3: '#0A2E40',
    tile4: '#12224D',
    mastheadBg: '#0B2954',
    inputBg: '#030A18',
    ink: '#E0F7FF',
    mutedInk: '#67E8F9',
    borderColor: '#00E5FF',
    cardShadowColor: '#00E5FF',
    subShadowColor: '#02060F',
    cardGlowColor: 'rgba(0, 229, 255, 0.28)',
    canvasText: '#E0F7FF',
    canvasMuted: '#67E8F9',
    accent1: '#00E5FF',
    accent1Ink: '#030B1A',
    accent2: '#FF00C8',
    accent2Ink: '#FFFFFF',
    accent3: '#38BDF8',
    accent3Ink: '#030B1A',
    accent4: '#A3FF00',
    accent4Ink: '#041204',
    scrollTrack: '#030816',
    scrollThumb: '#00E5FF',
    swatchColors: ['#00E5FF', '#FF00C8', '#061539'],
    bgColor: '#030A18',
    bgImage: [
      'radial-gradient(circle at 15% 18%, rgba(0, 229, 255, 0.26) 0%, transparent 36%)',
      'radial-gradient(circle at 85% 18%, rgba(255, 0, 200, 0.22) 0%, transparent 36%)',
      'radial-gradient(circle at 55% 86%, rgba(59, 130, 246, 0.22) 0%, transparent 42%)',
      FUTURISTIC_GRID_SVG,
    ].join(', '),
    bgSize: '100% 100%, 100% 100%, 100% 100%, 80px 80px',
  },
  {
    id: 'forest-crystal',
    name: 'Forest Crystal Cave',
    shortLabel: 'Forest Crystal',
    emoji: '💎',
    tagline: 'Bioluminescent emerald grove with prism amethyst shards',
    isDark: true,
    marqueeBg: '#041917',
    marqueeText: '#5EEAD4',
    headerBg: 'rgba(7, 36, 33, 0.94)',
    headerInk: '#CCFBF1',
    headerSub: '#5EEAD4',
    headerBorder: '#2DD4BF',
    logoBg: '#14B8A6',
    logoText: '#FFFFFF',
    stripBg: 'rgba(10, 44, 40, 0.94)',
    middleBg: '#082421',
    middleBgImage: [
      'radial-gradient(circle at 82% 18%, rgba(45,212,191,0.15), transparent 45%)',
      FOREST_CRYSTAL_SVG,
    ].join(', '),
    middleBgSize: '100% 100%, 130px 130px',
    surfaceBg: '#0C2F2B',
    surfaceElevated: '#113D38',
    tile1: '#0F3B34',
    tile2: '#231A42',
    tile3: '#0E3542',
    tile4: '#123E2D',
    mastheadBg: '#0F423B',
    inputBg: '#041513',
    ink: '#CCFBF1',
    mutedInk: '#5EEAD4',
    borderColor: '#2DD4BF',
    cardShadowColor: '#2DD4BF',
    subShadowColor: '#020D0C',
    cardGlowColor: 'rgba(45, 212, 191, 0.28)',
    canvasText: '#CCFBF1',
    canvasMuted: '#99F6E4',
    accent1: '#2DD4BF',
    accent1Ink: '#041917',
    accent2: '#A855F7',
    accent2Ink: '#FFFFFF',
    accent3: '#38BDF8',
    accent3Ink: '#041624',
    accent4: '#34D399',
    accent4Ink: '#041912',
    scrollTrack: '#041614',
    scrollThumb: '#2DD4BF',
    swatchColors: ['#2DD4BF', '#A855F7', '#062B27'],
    bgColor: '#041816',
    bgImage: [
      'radial-gradient(circle at 18% 20%, rgba(45, 212, 191, 0.28) 0%, transparent 38%)',
      'radial-gradient(circle at 84% 25%, rgba(168, 85, 247, 0.24) 0%, transparent 38%)',
      'radial-gradient(circle at 52% 85%, rgba(16, 185, 129, 0.24) 0%, transparent 42%)',
      FOREST_CRYSTAL_SVG,
    ].join(', '),
    bgSize: '100% 100%, 100% 100%, 100% 100%, 130px 130px',
  },
  {
    id: 'cyber-sakura',
    name: 'Neon Tokyo Rain',
    shortLabel: 'Tokyo Rain',
    emoji: '🌸',
    tagline: 'Midnight arcade rain reflecting hot sakura & sky-blue neon',
    isDark: true,
    marqueeBg: '#1B0D2E',
    marqueeText: '#FF7EB6',
    headerBg: 'rgba(28, 14, 48, 0.94)',
    headerInk: '#FCE7F3',
    headerSub: '#FF4D94',
    headerBorder: '#FF4D94',
    logoBg: '#FF2A85',
    logoText: '#FFFFFF',
    stripBg: 'rgba(38, 18, 64, 0.94)',
    middleBg: '#1B0F30',
    middleBgImage: [
      'radial-gradient(circle at 85% 18%, rgba(255,77,148,0.16), transparent 45%)',
      SAKURA_RAIN_SVG,
    ].join(', '),
    middleBgSize: '100% 100%, 100px 100px',
    surfaceBg: '#24143E',
    surfaceElevated: '#2F1B52',
    tile1: '#301545',
    tile2: '#16264A',
    tile3: '#2F1C3B',
    tile4: '#201945',
    mastheadBg: '#38144D',
    inputBg: '#0F071C',
    ink: '#FCE7F3',
    mutedInk: '#F9A8D4',
    borderColor: '#FF4D94',
    cardShadowColor: '#FF4D94',
    subShadowColor: '#090412',
    cardGlowColor: 'rgba(255, 77, 148, 0.28)',
    canvasText: '#FCE7F3',
    canvasMuted: '#F9A8D4',
    accent1: '#FF4D94',
    accent1Ink: '#FFFFFF',
    accent2: '#38BDF8',
    accent2Ink: '#081726',
    accent3: '#FBBF24',
    accent3Ink: '#1A1004',
    accent4: '#C084FC',
    accent4Ink: '#160824',
    scrollTrack: '#140924',
    scrollThumb: '#FF4D94',
    swatchColors: ['#FF4D94', '#38BDF8', '#23103D'],
    bgColor: '#120921',
    bgImage: [
      'radial-gradient(circle at 16% 18%, rgba(255, 42, 133, 0.28) 0%, transparent 36%)',
      'radial-gradient(circle at 84% 22%, rgba(56, 189, 248, 0.24) 0%, transparent 38%)',
      'radial-gradient(circle at 60% 85%, rgba(251, 191, 36, 0.16) 0%, transparent 40%)',
      SAKURA_RAIN_SVG,
    ].join(', '),
    bgSize: '100% 100%, 100% 100%, 100% 100%, 100px 100px',
  },
  {
    id: 'cosmic-void',
    name: 'Retro Acid Cosmic',
    shortLabel: 'Cosmic',
    emoji: '🪐',
    tagline: 'Deep ultraviolet orbit with starburst gold rings & nebulae',
    isDark: true,
    marqueeBg: '#090624',
    marqueeText: '#FDE047',
    headerBg: 'rgba(15, 10, 42, 0.94)',
    headerInk: '#FEF9C3',
    headerSub: '#FACC15',
    headerBorder: '#FACC15',
    logoBg: '#8B5CF6',
    logoText: '#FFFFFF',
    stripBg: 'rgba(22, 14, 58, 0.94)',
    middleBg: '#110B30',
    middleBgImage: [
      'radial-gradient(circle at 80% 18%, rgba(192,38,211,0.18), transparent 45%)',
      COSMIC_STARS_SVG,
    ].join(', '),
    middleBgSize: '100% 100%, 120px 120px',
    surfaceBg: '#191140',
    surfaceElevated: '#231854',
    tile1: '#221452',
    tile2: '#331342',
    tile3: '#122752',
    tile4: '#251B48',
    mastheadBg: '#271459',
    inputBg: '#070417',
    ink: '#FEF9C3',
    mutedInk: '#FDE047',
    borderColor: '#FACC15',
    cardShadowColor: '#FACC15',
    subShadowColor: '#04020F',
    cardGlowColor: 'rgba(250, 204, 21, 0.24)',
    canvasText: '#FEF9C3',
    canvasMuted: '#FDE68A',
    accent1: '#FACC15',
    accent1Ink: '#120C04',
    accent2: '#D946EF',
    accent2Ink: '#FFFFFF',
    accent3: '#38BDF8',
    accent3Ink: '#051424',
    accent4: '#A855F7',
    accent4Ink: '#FFFFFF',
    scrollTrack: '#08051E',
    scrollThumb: '#FACC15',
    swatchColors: ['#FACC15', '#C026D3', '#150D40'],
    bgColor: '#08051A',
    bgImage: [
      'radial-gradient(circle at 20% 22%, rgba(192, 38, 211, 0.30) 0%, transparent 38%)',
      'radial-gradient(circle at 80% 18%, rgba(56, 189, 248, 0.22) 0%, transparent 36%)',
      'radial-gradient(circle at 50% 82%, rgba(250, 204, 21, 0.20) 0%, transparent 42%)',
      COSMIC_STARS_SVG,
    ].join(', '),
    bgSize: '100% 100%, 100% 100%, 100% 100%, 120px 120px',
  },
]

export function getUiTheme(id?: string): StudioUiTheme {
  return STUDIO_UI_THEMES.find((t) => t.id === id) || STUDIO_UI_THEMES[0]
}
