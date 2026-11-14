import { ArchivalTelemetrySlate } from '../data/loreArchiveData'
import { parsePastedStoryToActs } from './promptCompiler'

export interface GeneratedStoryResult {
  source: 'gemini' | 'ollama' | 'builtin'
  sourceLabel: string
  title: string
  sceneSetup: string
  intervention: string
  aftermath: string
  rawText: string
}

function lowerFirst(str: string): string {
  if (!str) return str
  return str.charAt(0).toLowerCase() + str.slice(1)
}

function stripParenthetical(str: string): string {
  return str.replace(/\s*\([^)]*\)/g, '').trim()
}

function extractParenthetical(str: string): string {
  const m = str.match(/\(([^)]+)\)/)
  return m?.[1] ? m[1] : str
}

export function generateBuiltInStory(
  slate: ArchivalTelemetrySlate,
  variationOffset = 0
): GeneratedStoryResult {
  const seed = Math.abs(slate.phaseIndex + variationOffset * 7)
  const targetShort = stripParenthetical(slate.encounterTarget)
  const targetDesc = lowerFirst(extractParenthetical(slate.encounterTarget))
  const env = lowerFirst(slate.environmentBiome)
  const biome = lowerFirst(slate.biome)
  const light = lowerFirst(slate.lightingStyle.replace(/\s*\(Pack [^)]+\)/i, ''))
  const action = lowerFirst(slate.action)
  const attire = lowerFirst(slate.attire)
  const camera = lowerFirst(slate.cameraAngle)
  const perspective = lowerFirst(stripParenthetical(slate.perspective))

  const titleTemplates = [
    `SIGNAL AT ${slate.environmentBiome.split(' ').slice(-2).join(' ')}`,
    `${targetShort}: ${slate.actPhase.replace(/^Phase \d+:\s*/i, '')}`,
    `PROTOCOL // ${slate.action.split(' ').slice(0, 3).join(' ')}`,
    `THE ${slate.biome.split(' ').slice(-2).join(' ')} LOG`,
    `ECHOES BELOW ${slate.nodeTag.replace(/^NODE:\s*[^/]+\/\//i, '').trim()}`,
  ]
  const title = titleTemplates[seed % titleTemplates.length]
    .replace(/[^a-zA-Z0-9\s://-]/g, '')
    .toUpperCase()
    .slice(0, 48)

  const sensoryOpeners = [
    `Heavy condensation beads along every riveted bulkhead inside the ${env}, where the surrounding ${biome} presses against groaning structural ribs.`,
    `A stubborn sub-audible rattle travels up through the floor plates of the ${env}, carrying the metallic taste of overheated grease and damp concrete from the wider ${biome}.`,
    `Moisture collects in slow, measured drops across corroded conduit housings inside the ${env}, trapping the stale warmth of overworked machinery beneath the ${biome}.`,
    `Air moves in sluggish, pressurized gusts through the ${env}, stirring loose dust across gauge dials and wet decking carved deep into the ${biome}.`,
  ]

  const act1Witness = [
    `Under ${light}, ${targetShort}—${targetDesc}—monitors the erratic gauge drift from the viewpoint of ${perspective}. Something inside the grid refuses to settle; every twelve seconds, the bulkhead shudders hard enough to skate loose bolts across the grating.`,
    `Illuminated solely by ${light}, ${targetShort} (${targetDesc}) holds steady against the rising barometric pressure, watching through the lens of ${perspective} as pressure valves chatter out of sync across the room.`,
    `Caught within ${light}, ${targetShort} works cautiously around the jittering framework, every detail registered through ${perspective}. The air smells sharply of ozone and wet iron, and the backup relays click in rapid, anxious bursts.`,
  ]

  const act2Arrival = [
    `Then the stairwell shadow deepens. Seen in ${camera}, the faceless operative arrives without announcing a footstep—clad in ${attire}, face sealed behind a smooth obsidian dome visor that catches only a thin ribbon of ${light}.`,
    `From the far threshold steps the unblinking silhouette of the operative, captured in ${camera}. Wearing ${attire}, the figure's featureless black visor mirrors the trembling gauge needles without a single word or hesitation.`,
    ` framed in ${camera}, the operative moves out of the mist in complete silence. Dressed in ${attire} with a seamless dark glass dome concealing every expression, they step past ${targetShort} straight toward the overburdened hardware.`,
  ]

  const act2Action = [
    `With practiced, unhurried precision, the operative commits to the intervention: ${action}. Metal screeches briefly against metal, steam vents in a sharp white plume across their shoulders, and the stubborn mechanical bottleneck finally yields with a deep hydraulic sigh.`,
    `Zero theatrical flourishes—only weight, leverage, and timing. Focusing every ounce of torque, the operative begins ${action}. For three tense heartbeats the superstructure trembles, then a dull mechanical detent snaps cleanly into alignment.`,
    `Gloved fingers test the seam once before committing: ${action}. Oil sheen parts under steady physical pressure, trapped vapor hisses free between bolted flanges, and the violent sympathetic vibration beneath ${targetShort}'s boots drops straight into calm.`,
  ]

  const act3Resolutions = [
    `For 0.43 seconds, nobody moves. Only the gentle tick of cooling iron fills the ${env} as the harsh flicker of ${light} softens into a warm, steady glow across wet floor tiles.`,
    `Stillness settles like fine dust over the gaskets and catwalks. The ambient hum drops an octave into warm equilibrium, leaving clear air where suffocating pressure sat moments before.`,
    `The gauges needle smoothly back toward zero. Across the slick metal grating, reflections stretch calm and unbroken for the first time all shift.`,
  ]

  const act3Departures = [
    `Before ${targetShort} can raise a hand or hazard a question, the operative tilts their dark visor down once—acknowledgment without language—and steps backward into the drifting mist of the ${biome}, leaving nothing behind except dry hinges and quiet air.`,
    `The masked figure says nothing, asks nothing, and leaves no signature. Stepping past the boundary marker, they dissolve silently into the fog of the ${biome}, letting the stabilized machine breathe on its own.`,
    `Without turning back toward the gallery, the operative slips down the service ladder and fades into the salt-heavy haze, leaving ${targetShort} alone in a room that finally works the way it was built to.`,
  ]

  const sceneSetup = `${sensoryOpeners[seed % sensoryOpeners.length]}\n\n${
    act1Witness[(seed + 1) % act1Witness.length]
  }`
  const intervention = `${act2Arrival[(seed + 2) % act2Arrival.length].trim()}\n\n${
    act2Action[(seed + 1) % act2Action.length]
  }`
  const aftermath = `${act3Resolutions[seed % act3Resolutions.length]}\n\n${
    act3Departures[(seed + 2) % act3Departures.length]
  }`

  const rawText = `<title>${title}</title>\n\n<scene_setup>\n${sceneSetup}\n</scene_setup>\n\n<intervention>\n${intervention}\n</intervention>\n\n<aftermath>\n${aftermath}\n</aftermath>`

  return {
    source: 'builtin',
    sourceLabel: 'Built-In Story Engine',
    title,
    sceneSetup,
    intervention,
    aftermath,
    rawText,
  }
}

export async function generateInAppStory(
  slate: ArchivalTelemetrySlate,
  storyPrompt: string,
  apiKey?: string,
  variationOffset = 0
): Promise<GeneratedStoryResult> {
  try {
    const res = await fetch('/api/generate-story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storyPrompt,
        apiKey: apiKey?.trim() || '',
      }),
    })

    if (res.ok) {
      const data = await res.json()
      if (data?.text && !data?.fallback) {
        const parsed = parsePastedStoryToActs(data.text, slate.acts)
        const sourceStr = String(data.source || '')
        const sourceKind: 'gemini' | 'ollama' = sourceStr.includes('ollama')
          ? 'ollama'
          : 'gemini'
        return {
          source: sourceKind,
          sourceLabel:
            sourceKind === 'gemini'
              ? 'Gemini 2.5 Flash AI'
              : `Local ${data.source}`,
          title: (parsed.title || slate.title).toUpperCase(),
          sceneSetup: parsed.sceneSetup,
          intervention: parsed.intervention,
          aftermath: parsed.aftermath,
          rawText: data.text,
        }
      }
    } else {
      const errData = await res.json().catch(() => null)
      if (errData?.error && apiKey?.trim()) {
        throw new Error(errData.error)
      }
    }
  } catch (err) {
    if (apiKey?.trim()) {
      throw err
    }
  }

  return generateBuiltInStory(slate, variationOffset)
}
