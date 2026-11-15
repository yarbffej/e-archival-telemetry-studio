import { ArchivalTelemetrySlate } from '../data/loreArchiveData'

export interface StillPlatePrompt {
  id: string
  plateNumber: number
  title: string
  shotBadge: string
  subtitle: string
  prompt: string
}

export interface AutoCompiledPrompts {
  storyPrompt: string
  stillPrompt: string
  stillPrompts: StillPlatePrompt[]
  videoPrompt: string
  gifPrompt: string
  gifPrompt2: string
  audioPrompt: string
}

// Scrubs "ME!", all-caps words, parenthetical labels, and numbers/frequencies
// so Google Flow / Veo / Imagen NEVER stamps "ME!" or text labels onto the character or scene.
function cleanForVisualGenerator(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/@?ME!/gi, 'the faceless operative')
    .replace(/\([^)]*\)/g, '') // remove parenthetical descriptions like (Pack AA) or (Walter)
    .replace(/\b0x[a-fA-F0-9_]+\b/g, '') // remove hex seeds
    .replace(/\b\d+(\.\d+)?\s*(Hz|FPS|s|°|m|kPa|%)\b/gi, '') // remove numbers/units that trigger HUD text
    .replace(/\b\d+\b/g, '') // remove standalone numbers so gauges/walls never render digits
    .replace(/\b[A-Z0-9_-]{3,}\b/g, (word) => word.toLowerCase()) // lowercase ALL-CAPS words like WETLINE or CRT
    .replace(/["“”]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// Extracts a short, visual-safe 1-sentence atmosphere snippet from a story Act
function extractActVisualSnippet(actText: string, maxLen = 165): string {
  if (!actText) return ''
  const cleaned = cleanForVisualGenerator(actText)
  if (!cleaned) return ''
  const firstSentence = cleaned.split(/(?<=[.!?])\s+/)[0] || cleaned
  if (firstSentence.length <= maxLen) return firstSentence
  return firstSentence.slice(0, maxLen).replace(/\s+\S*$/, '') + '.'
}

// Extracts only the visual description of the target character (without their proper name)
// so the image/video model doesn't try to print their name on screen.
function cleanTargetDescription(rawTarget: string): string {
  const match = rawTarget.match(/\(([^)]+)\)/)
  if (match && match[1]) {
    return cleanForVisualGenerator(match[1].toLowerCase())
  }
  return cleanForVisualGenerator(rawTarget.toLowerCase())
}

export function compileAllFourPrompts(
  slate: ArchivalTelemetrySlate
): AutoCompiledPrompts {
  const seedClause = slate.masterSeedTitle
    ? `MASTER SEED ANCHOR: "${slate.masterSeedTitle}"\n`
    : ''

  // 1. 3-Act Story Prompt (for Gemini text generation — grounded tactile industrial sci-fi, NO sword-slicing trope)
  const storyPrompt = `[MUTABLE ECHO // 3-ACT FIELD LOG DIRECTIVE]
${seedClause}NODE COORDINATE: ${slate.nodeTag} // HEX_SEED: ${slate.hexSeed}
ACT PHASE: ${slate.actPhase} (Phase #${String(slate.phaseIndex).padStart(2, '0')})
PRIMARY PHYSICAL ACTION: ${slate.action}
OPERATIVE / SUBJECT ATTIRE: ${slate.attire}
REGIONAL BIOME: ${slate.biome}
MICRO-ENVIRONMENT: ${slate.environmentBiome}
ENCOUNTER / TARGET: ${slate.encounterTarget}
CAMERA / FRAMING: ${slate.cameraAngle}
LIGHTING PACK: ${slate.lightingStyle}
WITNESS PERSPECTIVE: ${slate.perspective}

STYLE & TONE RULES:
1. GROUNDED INDUSTRIAL ATMOSPHERE: Write with dense, tactile, physical detail—oxidized iron, condensation, hydraulic pressure, mechanical fatigue, and decaying infrastructure.
2. SPECIFIC PHYSICAL ACTION (NO SWORD SLICING): Center Act II strictly on the specific rolled action ("${slate.action}"). Do NOT use glowing swords, blades, or golden ropes/tethers. Keep the intervention grounded in physical tools, machinery, environmental mechanics, or quiet unyielding presence.
3. SILENT DEPARTURE: The masked, faceless operative never speaks and never removes the visor, departing quietly once the mechanical or atmospheric state shifts into stillness.

Write an expanded, magazine-length 3-Act narrative (target 750–1,100 words total) using these exact XML tags:
<title>Short Evocative 3-to-6 Word Episode Headline</title>
<scene_setup>
Act I (The Setup — 3 Rich Paragraphs): Establish the vast physical architecture and sensory atmosphere of ${slate.environmentBiome} within ${slate.biome} under ${slate.lightingStyle}. Observe ${slate.encounterTarget} closely from the perspective of ${slate.perspective}, detailing the failing machinery, environmental pressure, acoustic rattle, and lived-in exhaustion of the space before anyone arrives. Write 3 full, immersive paragraphs separated by blank lines.
</scene_setup>
<intervention>
Act II (The Intervention — 3 Rich Paragraphs): The faceless operative (${slate.attire}) emerges silently in ${slate.cameraAngle} and executes the physical action: "${slate.action}". Dwell on the step-by-step mechanical leverage, tool contact, resistant iron, venting steam, and unspoken tension between the operative and ${slate.encounterTarget} until the bottleneck yields. Write 3 full, vivid paragraphs separated by blank lines.
</intervention>
<aftermath>
Act III (The Aftermath — 2 to 3 Rich Paragraphs): Detail the immediate physical and acoustic release as the system settles into quiet, altered equilibrium. Capture ${slate.encounterTarget}'s reaction to the sudden stillness as the masked operative departs into the shadows or mist without speaking a word. Write 2–3 atmospheric paragraphs separated by blank lines.
</aftermath>`

  // Clean visual variables with ZERO "ME!", ZERO numbers, ZERO all-caps tokens
  const cleanEnv = cleanForVisualGenerator(slate.environmentBiome)
  const cleanBiome = cleanForVisualGenerator(slate.biome)
  const cleanAction = cleanForVisualGenerator(slate.action).toLowerCase()
  const cleanAttire = cleanForVisualGenerator(slate.attire).toLowerCase()
  const cleanTarget = cleanTargetDescription(slate.encounterTarget)
  const cleanCamera = cleanForVisualGenerator(slate.cameraAngle)
  const cleanLighting = cleanForVisualGenerator(slate.lightingStyle)

  // Story-driven visual context from the pasted or rolled 3 Acts
  const act1Snippet = extractActVisualSnippet(slate.acts.sceneSetup)
  const act2Snippet = extractActVisualSnippet(slate.acts.intervention)
  const act3Snippet = extractActVisualSnippet(slate.acts.aftermath)

  const styleSignature = `dark cyber-noir anime and gothic industrial sci-fi cel-shaded theatrical style inspired by Ghost in the Shell and Memories Magnetic Rose, rich hand-painted background detail, authentic analog film grain`
  const zeroTextRule = `Strictly zero text, no words, no letters, no numbers, no character labels, no signage, and no watermarks anywhere in the image.`

  // 2A–2D: 4 Distinct Cinematographic 2K Storyboard Prompts (completely different shot scales, focal lengths, and subjects)
  const plate1Prompt = `Generate a single high-resolution 2K widescreen 16:9 image in ${styleSignature}. SHOT TYPE: Extreme wide-angle high-vantage architectural establishing shot emphasizing vast cavernous scale and environmental depth, with no close-up characters in the foreground. Vast ${cleanEnv} inside a ${cleanBiome} under ${cleanLighting}. Towering weathered gothic-industrial conduits, catwalks, wet metal surfaces, heavy atmospheric mist, and distant ${cleanTarget} dwarfed by the oppressive surrounding architecture. ${act1Snippet ? `Scene mood: ${act1Snippet}` : ''} Deep ink-wash chiaroscuro shadows and volumetric light beams. ${zeroTextRule}`

  const plate2Prompt = `Generate a single high-resolution 2K widescreen 16:9 image in ${styleSignature}. SHOT TYPE: Dynamic medium-full low-angle kinetic action shot (${cleanCamera}) with dramatic diagonal framing. Inside a ${cleanEnv}, a mysterious, completely faceless operative wearing a smooth, featureless black obsidian full-face dome helmet visor with zero facial features and ${cleanAttire} is captured mid-motion actively ${cleanAction} near ${cleanTarget}. ${act2Snippet ? `Action detail: ${act2Snippet}` : ''} Crisp cel-shaded rim lighting under ${cleanLighting}, drifting steam, kinetic tension, and deep shadows. ${zeroTextRule}`

  const plate3Prompt = `Generate a single high-resolution 2K widescreen 16:9 image in ${styleSignature}. SHOT TYPE: Extreme macro close-up detail insert shot with shallow depth of field and soft anamorphic background bokeh—strictly framing gloved hands and intricate industrial hardware only, with no heads, no helmets, and no full-body figures in frame. Tight tactile close-up of dark weathered tactical gloves interacting with heavy oxidized iron valves, braided steel cables, corroded mechanical couplings, oil sheen, and glistening condensation droplets during the process of ${cleanAction} inside a ${cleanEnv} under ${cleanLighting}. Intricate mechanical craftsmanship, dramatic specular highlights. ${zeroTextRule}`

  const plate4Prompt = `Generate a single high-resolution 2K widescreen 16:9 image in ${styleSignature}. SHOT TYPE: Contemplative symmetrical wide pull-back long shot down a quiet mist-filled expanse with low horizon and spacious atmospheric stillness. Aftermath inside the ${cleanEnv} within a ${cleanBiome}, where mechanical strain has subsided into calm equilibrium, settling steam, and mirror-wet floor reflections under soft ${cleanLighting} mixed with warm amber dusk glow. ${act3Snippet ? `Aftermath atmosphere: ${act3Snippet}` : ''} Far away in the distant background, walking away with back turned to the camera, is the small solitary rear silhouette of the figure in ${cleanAttire} disappearing into the mist. ${zeroTextRule}`

  const stillPrompts: StillPlatePrompt[] = [
    {
      id: 'plate1',
      plateNumber: 1,
      title: 'Plate 01: Wide World Shot (Act I)',
      shotBadge: 'WIDE ESTABLISHING',
      subtitle:
        'Cavernous architectural scale & atmosphere — zero foreground pose',
      prompt: plate1Prompt,
    },
    {
      id: 'plate2',
      plateNumber: 2,
      title: 'Plate 02: Dynamic Action Shot (Act II)',
      shotBadge: 'ACT II ACTION',
      subtitle:
        'Low-angle kinetic shot of the visor operative performing the intervention',
      prompt: plate2Prompt,
    },
    {
      id: 'plate3',
      plateNumber: 3,
      title: 'Plate 03: Macro Hardware Detail',
      shotBadge: 'MACRO DETAIL',
      subtitle:
        'Tight close-up of gloved hands, valves, cables & wet metal (no full body)',
      prompt: plate3Prompt,
    },
    {
      id: 'plate4',
      plateNumber: 4,
      title: 'Plate 04: Quiet Aftermath (Act III)',
      shotBadge: 'AFTERMATH SILHOUETTE',
      subtitle:
        'Calm pull-back shot with distant departing silhouette walking into mist',
      prompt: plate4Prompt,
    },
  ]

  // 3. High-Quality Cinematic 1080p Video Prompt (Driven by the rolled action & camera movement — zero blades/tethers)
  const videoPrompt = `Generate a high-quality 1080p cinematic video using the highest quality video model (do not use fast low-credit mode; render in full high-quality cinema mode, 16:9 widescreen). High-budget theatrical cyber-noir anime cinematography in the style of Ghost in the Shell with rich volumetric atmosphere and fluid physical motion. Smooth cinematic camera movement (${cleanCamera}) through a ${cleanEnv} set inside a ${cleanBiome} under ${cleanLighting}. Thick atmospheric mist, drifting dust and condensation, and weathered industrial surfaces. A mysterious, completely faceless operative wearing a smooth, featureless black obsidian full-face dome visor and ${cleanAttire} is ${cleanAction} while ${cleanTarget} is visible in the surrounding space. Realistic mechanical interaction, subtle environmental motion, heavy chiaroscuro shadows, authentic film grain, completely clean cinematic frame with no text, no words, no letters, no badges, and no overlays.`

  // 4A. Story GIF #1 Prompt (Act I–II Atmosphere & Arrival Loop — placed down inside the story)
  const gifPrompt = `Generate a seamless looping animated GIF in 16:9 widescreen cinematic framing. Dark cyber-noir cel-shaded anime style inside a ${cleanEnv} within a ${cleanBiome} under ${cleanLighting}. Act I–II story loop: ${cleanTarget} working amid trembling industrial machinery, flickering gauges, and heavy condensation while the mysterious, completely faceless operative in a smooth featureless black obsidian dome visor and ${cleanAttire} steps quietly through drifting steam to begin ${cleanAction}. Seamless looping environmental motion with dripping oil, rising vapor, and deep ink shadows. Zero text, no words, no letters, and no labels.`

  // 4B. Story GIF #2 Prompt (Act II–III Mechanical Release & Aftermath Loop — placed down inside the story)
  const gifPrompt2 = `Generate a seamless looping animated GIF in 16:9 widescreen cinematic framing. Dark cyber-noir cel-shaded anime style inside a ${cleanEnv} under soft stabilized ${cleanLighting}. Contemplative Act III aftermath loop following ${cleanAction}: warm steam gently venting from newly stabilized iron valves, mirror-still water reflections rippling softly across the floor, and the solitary rear silhouette of the faceless operative in ${cleanAttire} drifting slowly away into glowing atmospheric shadows. Seamless cinemagraph-style looping motion, deep chiaroscuro ink shadows, zero text, no words, no letters, and no labels.`

  // 5. 30-Second to 1-Minute Cyber-Noir Song Prompt (for Google Flow Music)
  const bpm = 82 + ((slate.phaseIndex * 7) % 28)
  const audioPrompt = `Generate a complete 30-second to 1-minute song (target duration 45 seconds, strictly between 30 and 60 seconds total length with a clear intro, main groove, and clean ending). Dark 1990s cyber-noir synthwave and industrial electronic soundtrack at ${bpm} BPM, inspired by Ghost in the Shell and classic sci-fi anime scores. Opens with atmospheric industrial textures evoking a ${cleanEnv} inside a ${cleanBiome}, drops into a driving analog bassline, crisp downtempo electronic drums, and haunting vintage synthesizer arpeggios reflecting the mood of ${cleanAction} under ${cleanLighting}, then resolves cleanly into a warm, melancholic synth pad outro before the 1-minute mark. Instrumental song, rich studio production, no vocals.`

  return {
    storyPrompt,
    stillPrompt: plate2Prompt,
    stillPrompts,
    videoPrompt,
    gifPrompt,
    gifPrompt2,
    audioPrompt,
  }
}

export function parsePastedStoryToActs(
  rawText: string,
  fallbackActs: { sceneSetup: string; intervention: string; aftermath: string }
): {
  title?: string
  sceneSetup: string
  intervention: string
  aftermath: string
} {
  const cleaned = rawText.replace(/\r\n/g, '\n').trim()
  if (!cleaned) {
    return fallbackActs
  }

  const titleMatch = cleaned.match(/<title>([\s\S]*?)<\/title>/i)
  const setupMatch = cleaned.match(/<scene_setup>([\s\S]*?)<\/scene_setup>/i)
  const intervMatch = cleaned.match(/<intervention>([\s\S]*?)<\/intervention>/i)
  const afterMatch = cleaned.match(/<aftermath>([\s\S]*?)<\/aftermath>/i)

  if (setupMatch || intervMatch || afterMatch) {
    return {
      title: titleMatch ? titleMatch[1].trim() : undefined,
      sceneSetup: setupMatch ? setupMatch[1].trim() : fallbackActs.sceneSetup,
      intervention: intervMatch
        ? intervMatch[1].trim()
        : fallbackActs.intervention,
      aftermath: afterMatch ? afterMatch[1].trim() : fallbackActs.aftermath,
    }
  }

  const rawParagraphs = cleaned
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)

  let detectedTitle: string | undefined
  const proseParagraphs: string[] = []

  for (const block of rawParagraphs) {
    const lines = block
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    const longLines = lines.filter(
      (l) =>
        l.length > 85 &&
        !l.startsWith('Primary Operative:') &&
        !l.startsWith('Target / Encounter') &&
        !l.startsWith('Biome:') &&
        !l.startsWith('Perspective:')
    )
    if (
      !detectedTitle &&
      lines[0] &&
      lines[0].length < 80 &&
      !lines[0].includes('Variable')
    ) {
      detectedTitle = lines[0].replace(/^#+\s*/, '')
    }
    if (longLines.length > 0) {
      proseParagraphs.push(...longLines)
    } else if (block.length > 90) {
      proseParagraphs.push(block)
    }
  }

  if (proseParagraphs.length >= 3) {
    const n = proseParagraphs.length
    const cut1 = Math.max(1, Math.ceil(n / 3))
    const cut2 = Math.max(cut1 + 1, Math.ceil((n * 2) / 3))
    return {
      title: detectedTitle,
      sceneSetup: proseParagraphs.slice(0, cut1).join('\n\n'),
      intervention: proseParagraphs.slice(cut1, cut2).join('\n\n'),
      aftermath: proseParagraphs.slice(cut2).join('\n\n'),
    }
  } else if (proseParagraphs.length === 2) {
    return {
      title: detectedTitle,
      sceneSetup: proseParagraphs[0],
      intervention: proseParagraphs[1],
      aftermath:
        'The mechanical tension subsides into quiet stillness as the operative departs into the shadows without looking back.',
    }
  } else if (proseParagraphs.length === 1) {
    const sentences = proseParagraphs[0].split(/(?<=[.!?])\s+/)
    const third = Math.max(1, Math.ceil(sentences.length / 3))
    return {
      title: detectedTitle,
      sceneSetup: sentences.slice(0, third).join(' '),
      intervention:
        sentences.slice(third, third * 2).join(' ') ||
        fallbackActs.intervention,
      aftermath: sentences.slice(third * 2).join(' ') || fallbackActs.aftermath,
    }
  }

  return fallbackActs
}
