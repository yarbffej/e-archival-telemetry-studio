import { SlateFinishId } from './loreArchiveData'

export interface ZinePalette {
  finishId: SlateFinishId
  name: string
  emoji: string
  paperBg: string
  cardBg: string
  heroYellow: string
  popPink: string
  popCyan: string
  popLime: string
  popOrange: string
  ink: string
  act1Tint: string
  act2Tint: string
  act3Tint: string
}

export const ZINE_PALETTES: ZinePalette[] = [
  {
    finishId: 'obsidian-monolith',
    name: 'Sunburst Riso',
    emoji: '🌞',
    paperBg: '#FFFDF2',
    cardBg: '#FFFFFF',
    heroYellow: '#FFE600',
    popPink: '#FF2A85',
    popCyan: '#00E5FF',
    popLime: '#B8FF00',
    popOrange: '#FF6B00',
    ink: '#121212',
    act1Tint: '#FFF9C4',
    act2Tint: '#FFE4F0',
    act3Tint: '#E0F7FA',
  },
  {
    finishId: 'plum-telemetry',
    name: 'Bubblegum Shibuya',
    emoji: '🍬',
    paperBg: '#FFF2FA',
    cardBg: '#FFFFFF',
    heroYellow: '#FFE800',
    popPink: '#FF1E8A',
    popCyan: '#00F0B5',
    popLime: '#C4FF00',
    popOrange: '#8B5CF6',
    ink: '#180B24',
    act1Tint: '#FCE7F3',
    act2Tint: '#EDE9FE',
    act3Tint: '#CCFBF1',
  },
  {
    finishId: 'weeping-copper',
    name: 'Tangerine Arcade',
    emoji: '🍊',
    paperBg: '#FFF7ED',
    cardBg: '#FFFFFF',
    heroYellow: '#FFD600',
    popPink: '#FF5500',
    popCyan: '#0099FF',
    popLime: '#00E699',
    popOrange: '#FF2E63',
    ink: '#17110D',
    act1Tint: '#FFEDD5',
    act2Tint: '#FEF08A',
    act3Tint: '#D1FAE5',
  },
  {
    finishId: 'chitin-carapace',
    name: 'Acid Mint Lab',
    emoji: '🧪',
    paperBg: '#F2FFF9',
    cardBg: '#FFFFFF',
    heroYellow: '#BDFF00',
    popPink: '#FF3366',
    popCyan: '#38BDF8',
    popLime: '#34D399',
    popOrange: '#FFB800',
    ink: '#0D1915',
    act1Tint: '#ECFCCB',
    act2Tint: '#FFE4E6',
    act3Tint: '#E0F2FE',
  },
  {
    finishId: 'blueprint-vector',
    name: 'Skyline Pop',
    emoji: '🌊',
    paperBg: '#F0F8FF',
    cardBg: '#FFFFFF',
    heroYellow: '#00E5FF',
    popPink: '#FF477E',
    popCyan: '#FFE600',
    popLime: '#A3FF00',
    popOrange: '#7C3AED',
    ink: '#0B1528',
    act1Tint: '#E0F2FE',
    act2Tint: '#FCE7F3',
    act3Tint: '#FEF9C3',
  },
  {
    finishId: 'saffron-vitrified',
    name: 'Solar Cobalt',
    emoji: '🌻',
    paperBg: '#FFFBEB',
    cardBg: '#FFFFFF',
    heroYellow: '#FACC15',
    popPink: '#FB7185',
    popCyan: '#60A5FA',
    popLime: '#4ADE80',
    popOrange: '#F97316',
    ink: '#111827',
    act1Tint: '#FEF3C7',
    act2Tint: '#DBEAFE',
    act3Tint: '#DCFCE7',
  },
  {
    finishId: 'sodium-vapor-noir',
    name: 'Mango Laser',
    emoji: '🥭',
    paperBg: '#FFF9F0',
    cardBg: '#FFFFFF',
    heroYellow: '#FFAA00',
    popPink: '#FF007A',
    popCyan: '#00E5FF',
    popLime: '#B8FF00',
    popOrange: '#FF4D00',
    ink: '#16110C',
    act1Tint: '#FFEDD5',
    act2Tint: '#FCE7F3',
    act3Tint: '#CFFAFE',
  },
  {
    finishId: 'dry-floor-purified',
    name: 'Confetti Studio',
    emoji: '🎉',
    paperBg: '#FAF8FF',
    cardBg: '#FFFFFF',
    heroYellow: '#FFE600',
    popPink: '#EC4899',
    popCyan: '#06B6D4',
    popLime: '#84CC16',
    popOrange: '#F59E0B',
    ink: '#14141F',
    act1Tint: '#F3E8FF',
    act2Tint: '#FCE7F3',
    act3Tint: '#ECFCCB',
  },
]

export function getZinePalette(finishId?: SlateFinishId): ZinePalette {
  return (
    ZINE_PALETTES.find((p) => p.finishId === finishId) || ZINE_PALETTES[0]
  )
}
