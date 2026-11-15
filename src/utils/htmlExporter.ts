import { ArchivalTelemetrySlate } from '../data/loreArchiveData'
import { getZinePalette } from '../data/zinePalettes'
import { StudioUiTheme } from '../data/uiThemes'

async function urlToDataUri(url?: string): Promise<string | null> {
  if (!url) return null
  if (url.startsWith('data:')) return url
  try {
    const cleanUrl = url.split('#')[0]
    const res = await fetch(cleanUrl)
    if (!res.ok) return null
    const blob = await res.blob()
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') resolve(reader.result)
        else reject(new Error('Failed to encode media'))
      }
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function exportStandaloneWebpageHtml(
  slate: ArchivalTelemetrySlate,
  onProgress?: (status: string) => void,
  uiTheme?: StudioUiTheme
): Promise<void> {
  const pal = getZinePalette(slate.finish)
  const isDark = Boolean(uiTheme?.isDark)
  const expTheme = {
    paperBg: isDark ? uiTheme!.middleBg : pal.paperBg,
    bgImage:
      isDark && uiTheme!.middleBgImage
        ? uiTheme!.middleBgImage
        : 'radial-gradient(rgba(18, 18, 18, 0.14) 1.4px, transparent 1.4px)',
    bgSize:
      isDark && uiTheme!.middleBgSize ? uiTheme!.middleBgSize : '16px 16px',
    surfaceBg: isDark ? uiTheme!.surfaceBg : '#FFFFFF',
    surfaceElevated: isDark ? uiTheme!.surfaceElevated : '#FFFFFF',
    inputBg: isDark ? uiTheme!.inputBg : '#FFFFFF',
    mastheadBg: isDark ? uiTheme!.mastheadBg : pal.heroYellow,
    tile1: isDark ? uiTheme!.tile1 : pal.act1Tint,
    tile2: isDark ? uiTheme!.tile2 : pal.act2Tint,
    tile3: isDark ? uiTheme!.tile3 : pal.act3Tint,
    tile4: isDark ? uiTheme!.tile4 : '#FFFDF4',
    heroYellow: isDark ? uiTheme!.accent1 : pal.heroYellow,
    heroYellowInk: isDark ? uiTheme!.accent1Ink : '#121212',
    popPink: isDark ? uiTheme!.accent2 : pal.popPink,
    popPinkInk: isDark ? uiTheme!.accent2Ink : '#FFFFFF',
    popCyan: isDark ? uiTheme!.accent3 : pal.popCyan,
    popCyanInk: isDark ? uiTheme!.accent3Ink : '#121212',
    popLime: isDark ? uiTheme!.accent4 : pal.popLime,
    popLimeInk: isDark ? uiTheme!.accent4Ink : '#121212',
    ink: isDark ? uiTheme!.ink : pal.ink,
    mutedInk: isDark ? uiTheme!.mutedInk : '#737373',
    borderColor: isDark ? uiTheme!.borderColor : '#121212',
    tickerBg: isDark ? uiTheme!.marqueeBg : pal.ink,
    titleShadow: isDark
      ? `3px 3px 0px ${uiTheme!.borderColor}`
      : '3px 3px 0px #FFFFFF',
  }

  const rawGallery =
    slate.galleryUrls && slate.galleryUrls.length > 0
      ? slate.galleryUrls
      : slate.stillUrl
      ? [slate.stillUrl]
      : []

  onProgress?.('Packing 4x 2K Prints...')
  const encodedGallery: string[] = []
  for (let i = 0; i < rawGallery.length; i++) {
    const dataUri = await urlToDataUri(rawGallery[i])
    if (dataUri) encodedGallery.push(dataUri)
  }

  onProgress?.('Packing 2x Story GIFs...')
  const encodedGif1 = await urlToDataUri(slate.gifUrl)
  const encodedGif2 =
    slate.gifUrl2 && slate.gifUrl2 !== slate.gifUrl
      ? await urlToDataUri(slate.gifUrl2)
      : encodedGif1

  onProgress?.('Packing 1080p Cinema...')
  const encodedVideo = await urlToDataUri(slate.videoUrl)

  onProgress?.('Packing Synth Song...')
  const encodedAudio = await urlToDataUri(slate.audioUrl)

  onProgress?.('Printing Standalone Zine...')

  const renderGifBlockHtml = (
    gifData: string | null,
    fallbackImg: string,
    badge: string,
    badgeBg: string,
    badgeInk: string,
    caption: string,
    rot: string
  ) => {
    const mediaInner = gifData
      ? gifData.startsWith('data:video/')
        ? `<video src="${gifData}" autoplay loop muted playsinline class="w-full h-auto max-h-[520px] object-contain block"></video>`
        : `<img src="${gifData}" alt="${escapeHtml(badge)}" class="w-full h-auto max-h-[520px] object-contain block" />`
      : fallbackImg
      ? `<img src="${fallbackImg}" alt="${escapeHtml(badge)}" class="w-full h-auto max-h-[420px] object-cover block" />`
      : ''
    return `
      <div style="transform: rotate(${rot});" class="relative pop-card th-surface p-4 flex flex-col justify-between hover:!rotate-0 transition-transform">
        <div class="washi-tape absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-6 rounded-sm -rotate-2"></div>
        <div class="flex items-center justify-between pb-2.5">
          <span class="px-3 py-1 rounded-full border-2 th-border font-mono text-xs font-bold uppercase" style="background:${badgeBg}; color:${badgeInk}">${escapeHtml(badge)}</span>
          <span class="font-mono text-[11px] font-bold">★ LIVE GIF LOOP</span>
        </div>
        <div class="relative w-full rounded-2xl border-[3px] th-border bg-[#121212] overflow-hidden flex items-center justify-center">
          ${mediaInner}
          <div class="absolute bottom-3 right-3 px-3 py-1 rounded-full border-2 th-border font-mono text-[10px] font-bold uppercase -rotate-2" style="background:${expTheme.popLime}; color:${expTheme.popLimeInk}">${escapeHtml(caption)}</div>
        </div>
      </div>`
  }

  const shotLabels = [
    { badge: '🌍 SHOT 01 // WIDE WORLD', note: 'Establishing Scale' },
    { badge: '⚡ SHOT 02 // BIG ACTION', note: 'Kinetic Intervention' },
    { badge: '🔍 SHOT 03 // MACRO DETAIL', note: 'Hands & Hardware' },
    { badge: '🌅 SHOT 04 // AFTERMATH', note: 'Quiet Departure' },
  ]

  const polaroidsHtml = encodedGallery
    .map((src, idx) => {
      const meta = shotLabels[idx] || {
        badge: `🎞️ BONUS SHOT 0${idx + 1}`,
        note: 'Extra Plate',
      }
      const rot =
        idx % 4 === 0
          ? '-1.2deg'
          : idx % 4 === 1
          ? '1.2deg'
          : idx % 4 === 2
          ? '-1.6deg'
          : '1.5deg'
      return `
      <div onclick="openLightbox(${idx})" style="transform: rotate(${rot}); background:${expTheme.surfaceElevated};" class="pop-card p-3 pb-4 cursor-pointer hover:!rotate-0 hover:-translate-y-1 transition-all">
        <div class="aspect-[4/3] rounded-xl border-2 th-border overflow-hidden bg-[#121212]">
          <img src="${src}" alt="${escapeHtml(meta.badge)}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        </div>
        <div class="pt-3 px-1">
          <div class="font-mono text-[11px] font-bold uppercase">${escapeHtml(meta.badge)}</div>
          <div style="color:${expTheme.mutedInk};" class="text-xs font-semibold mt-0.5">${escapeHtml(meta.note)}</div>
        </div>
      </div>`
    })
    .join('\n')

  const heroImg = encodedGallery[0] || ''

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ME! ZINE // ${escapeHtml(slate.title)}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: ${expTheme.paperBg};
      color: ${expTheme.ink};
      background-image: ${expTheme.bgImage};
      background-size: ${expTheme.bgSize};
    }
    .font-display { font-family: 'Bricolage Grotesque', sans-serif; }
    .font-mono { font-family: 'Space Mono', monospace; }
    .th-border { border-color: ${expTheme.borderColor} !important; }
    .th-surface { background-color: ${expTheme.surfaceBg}; color: ${expTheme.ink}; }
    .th-elevated { background-color: ${expTheme.surfaceElevated}; color: ${expTheme.ink}; }
    .pop-card {
      border: 3px solid ${expTheme.borderColor};
      box-shadow: 6px 6px 0px ${expTheme.borderColor};
      border-radius: 20px;
    }
    .pop-btn {
      border: 2.5px solid ${expTheme.borderColor};
      box-shadow: 4px 4px 0px ${expTheme.borderColor};
      border-radius: 14px;
      transition: all 0.12s ease;
    }
    .pop-btn:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0px ${expTheme.borderColor}; }
    .pop-btn:active { transform: translate(3px, 3px); box-shadow: 0px 0px 0px ${expTheme.borderColor}; }
    .washi-tape {
      background: repeating-linear-gradient(-45deg, rgba(255,230,0,0.9), rgba(255,230,0,0.9) 8px, rgba(255,255,255,0.85) 8px, rgba(255,255,255,0.85) 16px);
      border: 2px solid ${expTheme.borderColor};
    }
    @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
    .marquee-track { display: flex; width: max-content; animation: marquee 24s linear infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .spinning { animation: spin 4s linear infinite; }
  </style>
</head>
<body class="min-h-screen p-4 sm:p-8 lg:p-10">
  ${encodedAudio ? `<audio id="zineAudio" src="${encodedAudio}"></audio>` : ''}

  <main class="max-w-7xl mx-auto space-y-10">
    <!-- 1. HERO LEAD: FULL-WIDTH 1080P WIDESCREEN CINEMA + VINYL SOUNDTRACK -->
    <section class="space-y-5">
      <div class="pop-card th-surface overflow-hidden">
        <div class="px-4 py-2.5 border-b-[3px] th-border flex items-center justify-between" style="background:${expTheme.popCyan}; color:${expTheme.popCyanInk}">
          <div class="flex items-center gap-2">
            <span class="w-3.5 h-3.5 rounded-full bg-[#FF2A85] border-2 border-[#121212]"></span>
            <span class="w-3.5 h-3.5 rounded-full bg-[#FFE600] border-2 border-[#121212]"></span>
            <span class="w-3.5 h-3.5 rounded-full bg-[#B8FF00] border-2 border-[#121212]"></span>
            <span class="font-mono text-xs font-bold uppercase ml-1">🎬 FEATURE PRESENTATION // 1080P HERO CINEMA</span>
          </div>
          <button onclick="const v=document.getElementById('heroVid'); if(v&&v.requestFullscreen) v.requestFullscreen();" class="px-2.5 py-1 rounded-lg border-2 th-border th-elevated font-mono text-[11px] font-bold uppercase cursor-pointer">
            FULLSCREEN ⤢
          </button>
        </div>
        <div class="relative aspect-video w-full bg-[#121212] overflow-hidden">
          ${
            encodedVideo
              ? `<video id="heroVid" src="${encodedVideo}" ${heroImg ? `poster="${heroImg}"` : ''} autoplay loop muted playsinline controls class="w-full h-full object-cover"></video>`
              : heroImg
              ? `<img id="heroVid" src="${heroImg}" class="w-full h-full object-cover" />`
              : `<div class="w-full h-full flex items-center justify-center text-white font-mono">NO VIDEO STREAM</div>`
          }
        </div>
      </div>

      <!-- VINYL BOOMBOX SOUNDTRACK -->
      <div class="pop-card p-5 flex flex-col sm:flex-row items-center gap-4" style="background:${expTheme.tile2}; color:${expTheme.ink}">
        <div class="flex items-center gap-3 shrink-0">
          <button id="playBtn" onclick="toggleSong()" class="pop-btn px-5 py-3 font-display font-extrabold text-sm uppercase cursor-pointer" style="background:${expTheme.popPink}; color:${expTheme.popPinkInk}">
            ▶ PLAY SONG
          </button>
          <div id="vinylDisc" class="w-11 h-11 rounded-full border-[3px] th-border bg-[#121212] flex items-center justify-center">
            <div class="w-4 h-4 rounded-full border-2 border-[#121212]" style="background:${expTheme.heroYellow}"></div>
          </div>
        </div>
        <div class="flex-1 w-full min-w-0 space-y-1.5">
          <div class="flex justify-between text-xs font-bold">
            <span class="truncate">🎵 ${escapeHtml(slate.audioTitle || 'Cyber-Noir Synthwave Track')}</span>
            <span id="songClock" class="font-mono text-[11px]">0:00</span>
          </div>
          <input id="songSeek" type="range" min="0" max="100" value="0" step="0.1" style="accent-color:${expTheme.popPink}" class="w-full cursor-pointer" />
        </div>
        <canvas id="specCanvas" width="150" height="42" style="background:${expTheme.inputBg}" class="w-[150px] h-[42px] rounded-xl border-2 th-border p-1 shrink-0"></canvas>
      </div>
    </section>

    <!-- 2. MAGAZINE COVER MASTHEAD -->
    <header class="relative pop-card p-6 sm:p-9 overflow-hidden" style="background:${expTheme.mastheadBg}; color:${expTheme.ink}">
      <div class="pointer-events-none absolute -right-12 -top-12 w-52 h-52 rounded-full border-[3px] th-border" style="background:${expTheme.popPink}"></div>
      <div class="pointer-events-none absolute right-24 -bottom-10 w-28 h-28 rounded-full border-[3px] th-border" style="background:${expTheme.popCyan}"></div>

      <div class="relative z-10 space-y-4">
        <div class="flex flex-wrap items-center gap-2.5">
          <span class="px-3.5 py-1 rounded-full border-2 th-border font-mono text-xs font-bold uppercase -rotate-2" style="background:${expTheme.popPink}; color:${expTheme.popPinkInk}; box-shadow:3px 3px 0 ${expTheme.borderColor}">
            ★ ISSUE #${String(slate.phaseIndex).padStart(2, '0')} // ${escapeHtml(slate.classification)}
          </span>
          <span class="px-3 py-1 rounded-full border-2 th-border th-elevated font-mono text-xs font-bold uppercase rotate-1">
            📍 ${escapeHtml(slate.nodeTag.replace('NODE: ', ''))}
          </span>
          <span class="px-3 py-1 rounded-full border-2 th-border font-mono text-xs font-bold uppercase" style="background:${expTheme.popCyan}; color:${expTheme.popCyanInk}">
            SEED: ${escapeHtml(slate.hexSeed)}
          </span>
        </div>

        <h1 style="text-shadow:${expTheme.titleShadow}" class="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-tight leading-[0.94] max-w-4xl">
          ${escapeHtml(slate.title)}
        </h1>

        <div class="flex flex-wrap items-center gap-2 pt-1 text-xs font-bold">
          <span style="box-shadow:2px 2px 0 ${expTheme.borderColor}" class="px-3 py-1.5 rounded-xl border-2 th-border th-elevated">
            🏙️ World: ${escapeHtml(slate.environmentBiome)}
          </span>
          <span class="px-3 py-1.5 rounded-xl border-2 th-border" style="background:${expTheme.popLime}; color:${expTheme.popLimeInk}; box-shadow:2px 2px 0 ${expTheme.borderColor}">
            ⚡ Move: ${escapeHtml(slate.action)}
          </span>
          <span style="box-shadow:2px 2px 0 ${expTheme.borderColor}" class="px-3 py-1.5 rounded-xl border-2 th-border th-elevated">
            🎯 Encounter: ${escapeHtml(slate.encounterTarget.split('(')[0].trim())}
          </span>
        </div>
      </div>
    </header>

    <!-- KINETIC MARQUEE -->
    <div class="pop-card py-2.5 overflow-hidden" style="background:${expTheme.tickerBg}; color:${expTheme.heroYellow}">
      <div class="marquee-track font-mono text-xs sm:text-sm font-bold uppercase tracking-widest">
        <span class="mx-6">★ LONG-FORM 3-ACT CHRONICLE ★ 2 LIVE STORY GIF LOOPS ★ 4 DISTINCT CAMERA SHOTS ★ ${escapeHtml(slate.actPhase)} ★</span>
        <span class="mx-6">★ LONG-FORM 3-ACT CHRONICLE ★ 2 LIVE STORY GIF LOOPS ★ 4 DISTINCT CAMERA SHOTS ★ ${escapeHtml(slate.actPhase)} ★</span>
      </div>
    </div>

    <!-- SPREAD 01: ACT I + STORY GIF #1 + SHOT 01 -->
    <section class="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
      <article class="lg:col-span-6 pop-card p-6 sm:p-8" style="background:${expTheme.tile1}; color:${expTheme.ink}">
        <span class="inline-block px-3 py-1 rounded-full border-2 th-border font-mono text-xs font-bold uppercase mb-3" style="background:${expTheme.heroYellow}; color:${expTheme.heroYellowInk}">ACT 01 // THE SETUP</span>
        <h2 class="font-display text-2xl sm:text-3xl font-extrabold uppercase mb-4">Entering ${escapeHtml(slate.environmentBiome)}</h2>
        <p class="text-base sm:text-[17px] leading-[1.75] font-medium whitespace-pre-line">${escapeHtml(slate.acts.sceneSetup)}</p>
      </article>
      <div class="lg:col-span-6 space-y-6">
        ${renderGifBlockHtml(encodedGif1, heroImg, '🎞️ STORY GIF 01 // ACT I TENSION LOOP', expTheme.popPink, expTheme.popPinkInk, 'ACT I MOTION ∞', '0.8deg')}
        ${
          encodedGallery[0]
            ? `<div onclick="openLightbox(0)" class="pop-card th-surface p-4 cursor-pointer hover:rotate-0 transition-transform">
                <div class="aspect-[16/10] rounded-xl border-2 th-border overflow-hidden bg-[#121212]">
                  <img src="${encodedGallery[0]}" class="w-full h-full object-cover" />
                </div>
                <div class="pt-3 flex justify-between items-center">
                  <span class="px-3 py-1 rounded-full border-2 th-border font-mono text-xs font-bold uppercase" style="background:${expTheme.popCyan}; color:${expTheme.popCyanInk}">🌍 SHOT 01 // WIDE ESTABLISHING</span>
                  <span class="font-mono text-xs font-bold underline">Pop Open 2K ⤢</span>
                </div>
              </div>`
            : ''
        }
      </div>
    </section>

    <!-- SPREAD 02: SHOT 02 + SHOT 03 + ACT II -->
    <section class="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
      <div class="lg:col-span-6 space-y-5 order-2 lg:order-1">
        ${
          encodedGallery[1]
            ? `<div onclick="openLightbox(1)" class="pop-card th-surface p-4 cursor-pointer lg:-rotate-[1deg] hover:rotate-0 transition-transform">
                <div class="aspect-[16/10] rounded-xl border-2 th-border overflow-hidden bg-[#121212]">
                  <img src="${encodedGallery[1]}" class="w-full h-full object-cover" />
                </div>
                <div class="pt-3 flex justify-between items-center">
                  <span class="px-3 py-1 rounded-full border-2 th-border font-mono text-xs font-bold uppercase" style="background:${expTheme.popPink}; color:${expTheme.popPinkInk}">⚡ SHOT 02 // DYNAMIC ACTION</span>
                  <span class="font-mono text-xs font-bold underline">Pop Open 2K ⤢</span>
                </div>
              </div>`
            : ''
        }
        ${
          encodedGallery[2]
            ? `<div onclick="openLightbox(2)" class="sm:w-11/12 sm:ml-auto pop-card th-surface p-3 cursor-pointer lg:rotate-[1.2deg] hover:rotate-0 transition-transform">
                <div class="aspect-[16/9] rounded-xl border-2 th-border overflow-hidden bg-[#121212]">
                  <img src="${encodedGallery[2]}" class="w-full h-full object-cover" />
                </div>
                <div class="pt-2.5 flex justify-between items-center">
                  <span class="px-2.5 py-0.5 rounded-full border-2 th-border font-mono text-[11px] font-bold uppercase" style="background:${expTheme.heroYellow}; color:${expTheme.heroYellowInk}">🔍 SHOT 03 // TACTILE MACRO INSERT</span>
                  <span class="font-mono text-[11px] font-bold">2K ⤢</span>
                </div>
              </div>`
            : ''
        }
      </div>
      <div class="lg:col-span-6 space-y-6 order-1 lg:order-2">
        <article class="pop-card p-6 sm:p-8" style="background:${expTheme.tile2}; color:${expTheme.ink}">
          <span class="inline-block px-3 py-1 rounded-full border-2 th-border font-mono text-xs font-bold uppercase mb-3" style="background:${expTheme.popPink}; color:${expTheme.popPinkInk}">ACT 02 // THE INTERVENTION</span>
          <h2 class="font-display text-2xl sm:text-3xl font-extrabold uppercase mb-4">${escapeHtml(slate.action)}</h2>
          <p class="text-base sm:text-[17px] leading-[1.75] font-medium whitespace-pre-line">${escapeHtml(slate.acts.intervention)}</p>
        </article>
        <div class="pop-card th-surface p-5 space-y-2.5 text-xs">
          <div class="font-display text-lg font-extrabold uppercase">🏷️ Zine Field Notes</div>
          <div class="p-3 rounded-xl border-2 th-border" style="background:${expTheme.tile1}"><strong>Look:</strong> ${escapeHtml(slate.attire)}</div>
          <div class="p-3 rounded-xl border-2 th-border" style="background:${expTheme.tile3}"><strong>Lighting:</strong> ${escapeHtml(slate.lightingStyle)}</div>
          <div class="p-3 rounded-xl border-2 th-border" style="background:${expTheme.tile4}"><strong>Angle:</strong> ${escapeHtml(slate.perspective)}</div>
        </div>
      </div>
    </section>

    <!-- SPREAD 03: ACT III + STORY GIF #2 + SHOT 04 -->
    <section class="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
      <article class="lg:col-span-6 pop-card p-6 sm:p-8" style="background:${expTheme.tile3}; color:${expTheme.ink}">
        <span class="inline-block px-3 py-1 rounded-full border-2 th-border font-mono text-xs font-bold uppercase mb-3" style="background:${expTheme.popLime}; color:${expTheme.popLimeInk}">ACT 03 // EQUILIBRIUM</span>
        <h2 class="font-display text-2xl sm:text-3xl font-extrabold uppercase mb-4">The Quiet Aftermath</h2>
        <p class="text-base sm:text-[17px] leading-[1.75] font-medium whitespace-pre-line">${escapeHtml(slate.acts.aftermath)}</p>
      </article>
      <div class="lg:col-span-6 space-y-6">
        ${renderGifBlockHtml(encodedGif2, encodedGallery[3] || heroImg, '🎞️ STORY GIF 02 // ACT III AFTERMATH LOOP', expTheme.popCyan, expTheme.popCyanInk, 'ACT III MOTION ∞', '-0.8deg')}
        ${
          encodedGallery[3]
            ? `<div onclick="openLightbox(3)" class="pop-card th-surface p-4 cursor-pointer hover:rotate-0 transition-transform">
                <div class="aspect-[16/10] rounded-xl border-2 th-border overflow-hidden bg-[#121212]">
                  <img src="${encodedGallery[3]}" class="w-full h-full object-cover" />
                </div>
                <div class="pt-3 flex justify-between items-center">
                  <span class="px-3 py-1 rounded-full border-2 th-border font-mono text-xs font-bold uppercase" style="background:${expTheme.popLime}; color:${expTheme.popLimeInk}">🌅 SHOT 04 // QUIET AFTERMATH</span>
                  <span class="font-mono text-xs font-bold underline">Pop Open 2K ⤢</span>
                </div>
              </div>`
            : ''
        }
      </div>
    </section>

    <!-- POLAROID CONTACT SHEET -->
    ${
      encodedGallery.length > 0
        ? `<section class="pop-card th-surface p-6 sm:p-8 space-y-6">
            <h3 class="font-display text-2xl sm:text-3xl font-extrabold uppercase">📸 Complete Polaroid Contact Sheet (${encodedGallery.length} Shots)</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">${polaroidsHtml}</div>
          </section>`
        : ''
    }
  </main>

  <!-- LIGHTBOX -->
  <div id="lightbox" onclick="closeLb()" class="fixed inset-0 z-50 hidden bg-[#121212]/90 items-center justify-center p-4 sm:p-8">
    <div onclick="event.stopPropagation()" class="max-w-6xl w-full pop-card th-surface p-4 space-y-3">
      <div class="flex justify-between items-center">
        <span id="lbTitle" class="px-3.5 py-1 rounded-full border-2 th-border font-mono text-xs font-bold uppercase" style="background:${expTheme.heroYellow}; color:${expTheme.heroYellowInk}">SHOT</span>
        <div class="flex gap-2">
          <button onclick="stepLb(-1)" class="pop-btn px-3 py-1 th-elevated font-mono text-xs font-bold cursor-pointer">◀ PREV</button>
          <button onclick="stepLb(1)" class="pop-btn px-3 py-1 th-elevated font-mono text-xs font-bold cursor-pointer">NEXT ▶</button>
          <button onclick="closeLb()" class="pop-btn px-3 py-1 font-mono text-xs font-bold cursor-pointer" style="background:${expTheme.popPink}; color:${expTheme.popPinkInk}">✕ CLOSE</button>
        </div>
      </div>
      <div class="rounded-xl border-[3px] th-border bg-[#121212] flex justify-center overflow-hidden">
        <img id="lbImg" src="" class="max-h-[78vh] w-auto object-contain" />
      </div>
    </div>
  </div>

  <script>
    const imgs = ${JSON.stringify(encodedGallery)};
    let cur = 0;
    function openLightbox(i) {
      if (!imgs.length) return;
      cur = i;
      document.getElementById('lbImg').src = imgs[cur];
      document.getElementById('lbTitle').textContent = 'SHOT 0' + (cur + 1) + ' / 0' + imgs.length;
      const lb = document.getElementById('lightbox');
      lb.classList.remove('hidden'); lb.classList.add('flex');
    }
    function closeLb() {
      const lb = document.getElementById('lightbox');
      lb.classList.add('hidden'); lb.classList.remove('flex');
    }
    function stepLb(d) {
      if (!imgs.length) return;
      cur = (cur + d + imgs.length) % imgs.length;
      openLightbox(cur);
    }
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowRight') stepLb(1);
      if (e.key === 'ArrowLeft') stepLb(-1);
    });

    const audio = document.getElementById('zineAudio');
    const playBtn = document.getElementById('playBtn');
    const vinyl = document.getElementById('vinylDisc');
    const seek = document.getElementById('songSeek');
    const clock = document.getElementById('songClock');
    let audioCtx, analyser, playing = false;

    function fmt(s) {
      if (!isFinite(s) || s < 0) return '0:00';
      return Math.floor(s/60) + ':' + String(Math.floor(s%60)).padStart(2,'0');
    }

    function toggleSong() {
      if (!audio) return;
      if (audio.paused) {
        if (!audioCtx) {
          try {
            const AC = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AC();
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 128;
            const src = audioCtx.createMediaElementSource(audio);
            src.connect(analyser);
            analyser.connect(audioCtx.destination);
          } catch(e) {}
        }
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
        audio.play();
        playing = true;
        playBtn.textContent = '⏸ PAUSE';
        vinyl.classList.add('spinning');
      } else {
        audio.pause();
        playing = false;
        playBtn.textContent = '▶ PLAY SONG';
        vinyl.classList.remove('spinning');
      }
    }

    if (audio) {
      audio.addEventListener('timeupdate', () => {
        if (audio.duration) seek.value = (audio.currentTime / audio.duration) * 100;
        clock.textContent = fmt(audio.currentTime) + ' / ' + fmt(audio.duration);
      });
      audio.addEventListener('ended', () => {
        playing = false;
        playBtn.textContent = '▶ PLAY SONG';
        vinyl.classList.remove('spinning');
      });
      seek.addEventListener('input', (e) => {
        if (audio.duration) audio.currentTime = (Number(e.target.value) / 100) * audio.duration;
      });
    }

    const sc = document.getElementById('specCanvas');
    if (sc) {
      const ctx = sc.getContext('2d');
      const cols = [${JSON.stringify(expTheme.popPink)}, ${JSON.stringify(expTheme.heroYellow)}, ${JSON.stringify(expTheme.popCyan)}, ${JSON.stringify(expTheme.popLime)}];
      const fdata = new Uint8Array(64);
      let tick = 0;
      function draw() {
        tick += 0.08;
        ctx.clearRect(0, 0, sc.width, sc.height);
        if (analyser && playing) analyser.getByteFrequencyData(fdata);
        const bars = 24, gap = 3, bw = (sc.width - gap*(bars-1))/bars;
        for (let i=0; i<bars; i++) {
          let r = 0.16 + 0.06*Math.sin(tick + i*0.4);
          if (analyser && playing) r = Math.max(0.14, fdata[i]/255);
          else if (playing) r = 0.25 + 0.6*Math.abs(Math.sin(tick*2 + i*0.4));
          const h = Math.max(5, r*(sc.height-4));
          ctx.fillStyle = cols[i % cols.length];
          ctx.fillRect(i*(bw+gap), sc.height-h, bw, h);
          ctx.strokeStyle = ${JSON.stringify(expTheme.borderColor)};
          ctx.lineWidth = 1.2;
          ctx.strokeRect(i*(bw+gap), sc.height-h, bw, h);
        }
        requestAnimationFrame(draw);
      }
      draw();
    }
  </script>
</body>
</html>`

  const safeSlug = slate.title
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const dlUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = dlUrl
  link.download = `ME_ZINE_${safeSlug || 'CHRONICLE'}.html`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.setTimeout(() => URL.revokeObjectURL(dlUrl), 5000)
}
