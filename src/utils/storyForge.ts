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
    `Heavy condensation beads along every riveted bulkhead inside the ${env}, where the surrounding ${biome} presses relentlessly against groaning structural ribs. Years of deferred maintenance have left a fine patina of iron oxide and mineral salt crusted over every manifold seam, turning the walkway grates slick underfoot.`,
    `A stubborn sub-audible rattle travels up through the floor plates of the ${env}, carrying the metallic taste of overheated grease and damp concrete from the wider ${biome}. Every structural column hums like a plucked cable under sustained barometric strain, vibrating softly against rusted pipe hangers.`,
    `Moisture collects in slow, measured drops across corroded conduit housings inside the ${env}, trapping the stale warmth of overworked machinery beneath the ${biome}. Overhead cable trays sag beneath layers of vulcanized tape and grey dust that tremble whenever the sub-floor pumps cycle.`,
    `Air moves in sluggish, pressurized gusts through the ${env}, stirring loose grit across cracked gauge dials and wet decking carved deep into the ${biome}. Down in the lower sumps, trapped coolant gurgles through half-choked intake screens with a heavy, rhythmic pulse.`,
  ]

  const act1Architecture = [
    `Across the catwalk span, auxiliary indicator lamps blink out of phase, casting long theatrical shadows down the service trench. Old chalk calibration marks from three prior shifts sit half-smeared along the valve housings—proof that others tried to bleed the excess pressure and backed away before the seals blew.`,
    `Every twelve seconds, a sympathetic harmonic rolls down the main intake trunk, rattling loose washers across the steel grating like cast dice. The temperature gradient between the upper vents and the flooded floor hangs visible in midair as a pale ribbon of suspended mist.`,
    `Along the far retaining wall, braided hydraulic lines flex and stiffen against their iron clamps, fighting a feedback loop nobody on the surface bothered to log. Even the emergency stairwell echoes with the low metallic groan of beams settling under uneven load.`,
  ]

  const act1Witness = [
    `Under ${light}, ${targetShort}—${targetDesc}—monitors the erratic gauge drift from the viewpoint of ${perspective}. Exhaustion shows in the deliberate economy of every movement: braced boots, knuckles tight around worn tools, eyes tracking the creeping red needle that refuses to drop back into safe tolerance.`,
    `Illuminated solely by ${light}, ${targetShort} (${targetDesc}) holds steady against the rising barometric pressure, watching through the lens of ${perspective} as relief valves chatter out of sync across the room. One more surge down the primary line will shear the coupling bolts clean off their collars.`,
    `Caught within ${light}, ${targetShort} works cautiously around the jittering framework, every micro-tremor registered through ${perspective}. The air smells sharply of ozone and wet iron, and the backup relays click in rapid, anxious bursts with nowhere left to vent.`,
  ]

  const act2Arrival = [
    `Then the stairwell shadow deepens without warning. Seen in ${camera}, the faceless operative arrives without announcing a single footstep—clad in ${attire}, head sealed behind a smooth obsidian dome visor that catches only a razor-thin ribbon of ${light}.`,
    `From the far threshold steps the unblinking silhouette of the operative, captured in ${camera}. Wearing ${attire}, the figure's featureless black visor mirrors the trembling gauge needles and drifting steam without a word, nod, or wasted motion.`,
    `Framed in ${camera}, the operative emerges out of the particulate mist in complete silence. Dressed in ${attire} with a seamless dark glass dome concealing every expression, they cross the slick grating past ${targetShort} and move straight toward the overburdened hardware.`,
  ]

  const act2Mechanics = [
    `Up close, the scale of the mechanical lockup is unmistakable: seized iron threads fused by heat cycles, trembling housings hot enough to hiss when condensation touches them, and vibrating conduits fighting every turn. ${targetShort} steps back half a pace to clear the working arc, watching the stranger study the stress lines in silence.`,
    `Instead of reaching for automated overrides that died cycles ago, the operative reads the physical geometry of the fault—testing the tension on the primary bracket with one gloved palm before planting both boots squarely across the wet deck seam for leverage.`,
    `Steam curls thicker around their shoulders as the operative positions their hands directly over the fault point. Through ${perspective}, every micro-adjustment looks rehearsed a thousand times in stranger ruins than this: calm breathing, locked wrists, zero hesitation.`,
  ]

  const act2Action = [
    `With practiced, unhurried precision, the operative commits fully to the intervention: ${action}. Oxidized metal screeches once against metal, pressurized vapor vents in a sharp white plume across the visor glass, and the stubborn mechanical bottleneck finally yields with a deep hydraulic sigh.`,
    `Zero theatrical flourishes—only dead weight, clean leverage, and exact timing. Focusing every ounce of torque, the operative executes the critical move, ${action}. For three tense heartbeats the entire superstructure shudders, then a heavy mechanical detent snaps cleanly home.`,
    `Gloved fingers test the seam once more before committing: ${action}. Dark oil sheen parts under steady physical force, trapped pressure hisses free between bolted flanges, and the violent sympathetic vibration beneath ${targetShort}'s boots drops straight out of the floor.`,
  ]

  const act3Resolutions = [
    `For a full breath afterward, nobody moves. Only the gentle tick of cooling iron fills the ${env} as the harsh stutter of ${light} settles into a warm, steady wash across mirror-flat puddles.`,
    `Stillness settles like fine ash over the gaskets, catwalks, and silent manifolds. The oppressive low-frequency hum drops two octaves into effortless equilibrium, leaving crisp, breathable air where suffocating pressure sat moments before.`,
    `One by one, the analog gauges needle smoothly back toward zero. Across the wet steel grating, reflections stretch calm and unbroken for the first time all shift.`,
  ]

  const act3WitnessShift = [
    `${targetShort} lets out a slow, uneven breath that fogs briefly in the cooler air, resting tired hands against the now-quiet railing. Through ${perspective}, the entire chamber feels ten degrees lighter—no chattering relays, no phantom rattle in the teeth, just honest machinery running at rest.`,
    `Checking the stabilized housing up close, ${targetShort} finds no scorch marks, no forced fractures, and no stray hardware left out of place—only clean alignment where the fault had threatened to tear the bay apart.`,
    `Down the length of the corridor, secondary vents open in unhurried sequence, clearing the last pockets of acrid vapor until even the distant structural ribs stop groaning.`,
  ]

  const act3Departures = [
    `Before ${targetShort} can raise a hand or hazard a question, the operative tilts their dark visor down once—acknowledgment without language—and steps backward into the drifting mist of the ${biome}, leaving nothing behind except dry hinges and quiet air.`,
    `The masked figure says nothing, asks nothing, and leaves no signature on the ledger. Stepping past the perimeter lamp, they dissolve silently into the fog of the ${biome}, letting the stabilized machine breathe on its own.`,
    `Without looking back toward the gallery, the operative slips down the far service ladder and fades into the salt-heavy haze of the ${biome}, leaving ${targetShort} alone in a room that finally works the way it was built to.`,
  ]

  const sceneSetup = `${sensoryOpeners[seed % sensoryOpeners.length]}\n\n${
    act1Architecture[(seed + 2) % act1Architecture.length]
  }\n\n${act1Witness[(seed + 1) % act1Witness.length]}`
  const intervention = `${act2Arrival[(seed + 2) % act2Arrival.length].trim()}\n\n${
    act2Mechanics[seed % act2Mechanics.length]
  }\n\n${act2Action[(seed + 1) % act2Action.length]}`
  const aftermath = `${act3Resolutions[seed % act3Resolutions.length]}\n\n${
    act3WitnessShift[(seed + 1) % act3WitnessShift.length]
  }\n\n${act3Departures[(seed + 2) % act3Departures.length]}`

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
