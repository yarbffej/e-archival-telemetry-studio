# Mutable Echo Zine Lab (`me-archival-telemetry-studio`)

Interactive 3-step Pop-Zine & multi-theme creative telemetry studio for turning spun archival scenarios, 3-Act chronicles, AI-generated or uploaded stills/video loops, and synth tracks into interactive live web zines and self-contained `.html` downloads.

## Live Mobile & Web Access

- **GitHub Pages (24/7 Cloud + Mobile PWA)**: https://yarbffej.github.io/e-archival-telemetry-studio/
- **Add to Home Screen**: Open the link on iPhone (Safari → Share → **Add to Home Screen**) or Android (Chrome → Menu → **Add to Home Screen**) to launch **ME! Zine Lab** as a standalone app.
- **One-Click Netlify Deploy**:

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yarbffej/e-archival-telemetry-studio)

## Features

- **9 Full-Surface Studio UI Themes**: Switch seamlessly across `Pop-Zine`, `Slime`, `Mechanical`, `Gothic`, `Horror`, `Futuristic`, `Forest Crystal`, `Tokyo Rain`, and `Cosmic` — reskinning every workbench tile, input, slot reel, Zine Shelf card, 50 Story Seed card, live Zine spread, and standalone `.html` export.
- **Scenario Gacha (Step 1)**: 3-reel staggered slot spinner (`World`, `Action`, `Encounter`) plus built-in & optional Gemini 2.5 Flash 3-Act story writer (API keys are saved strictly in browser `localStorage`).
- **4-Shot Director's Storyboard & Media Prompts (Step 2)**: Copyable prompts for Wide World, Dynamic Action, Macro Detail, Aftermath, 16:9 cinema video, 9:16 vertical loop, and synth soundtrack.
- **Drag-and-Drop Media Deck & Standalone Export (Step 3)**: Batch or per-slot media replacement (`public/media/` starter assets included), Zine Shelf (`VAULT`), 50 Story Seeds (`TIMELINE`), Web Audio API synth toy, and single-file `.html` zine export.

## Local Development

```bash
npm install
npm run dev
```

Other scripts:

```bash
npm run build
npm run preview
```
