// Web Audio API Synthesizer for ME! // MUTABLE ECHO
// Implements the canonical 432Hz tuning-blade chime, 35Hz/80Hz subterranean ambient drone,
// 10-12 FPS spacetime stutter burst, and MAGI tactical interface micro-SFX.

class MutableEchoAudioEngine {
  private ctx: AudioContext | null = null
  private droneOscLow: OscillatorNode | null = null
  private droneOscHigh: OscillatorNode | null = null
  private droneGain: GainNode | null = null
  private droneFilter: BiquadFilterNode | null = null
  private isDronePlaying = false
  private isMuted = false

  private ensureContext(): AudioContext | null {
    if (this.isMuted) return null
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted
    if (muted && this.isDronePlaying) {
      this.stopAmbientDrone()
    }
  }

  public getMuted(): boolean {
    return this.isMuted
  }

  public getDroneActive(): boolean {
    return this.isDronePlaying
  }

  // Canonical 35Hz sawtooth + 80Hz triangle subterranean drone from me-game-dev-bible.md
  public toggleAmbientDrone(forceState?: boolean): boolean {
    const target = forceState !== undefined ? forceState : !this.isDronePlaying
    if (!target) {
      this.stopAmbientDrone()
      return false
    }

    const ctx = this.ensureContext()
    if (!ctx) return false

    if (this.isDronePlaying) return true

    try {
      const now = ctx.currentTime
      this.droneOscLow = ctx.createOscillator()
      this.droneOscLow.type = 'sawtooth'
      this.droneOscLow.frequency.setValueAtTime(35, now)

      this.droneOscHigh = ctx.createOscillator()
      this.droneOscHigh.type = 'triangle'
      this.droneOscHigh.frequency.setValueAtTime(80, now)

      this.droneFilter = ctx.createBiquadFilter()
      this.droneFilter.type = 'lowpass'
      this.droneFilter.frequency.setValueAtTime(95, now)

      this.droneGain = ctx.createGain()
      this.droneGain.gain.setValueAtTime(0.001, now)
      this.droneGain.gain.exponentialRampToValueAtTime(0.075, now + 0.6)

      this.droneOscLow.connect(this.droneFilter)
      this.droneOscHigh.connect(this.droneFilter)
      this.droneFilter.connect(this.droneGain)
      this.droneGain.connect(ctx.destination)

      this.droneOscLow.start(now)
      this.droneOscHigh.start(now)
      this.isDronePlaying = true
      return true
    } catch {
      return false
    }
  }

  public stopAmbientDrone() {
    if (!this.isDronePlaying || !this.ctx) {
      this.isDronePlaying = false
      return
    }
    try {
      const now = this.ctx.currentTime
      if (this.droneGain) {
        this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, now)
        this.droneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25)
      }
      setTimeout(() => {
        try {
          this.droneOscLow?.stop()
          this.droneOscHigh?.stop()
          this.droneOscLow?.disconnect()
          this.droneOscHigh?.disconnect()
        } catch {
          // ignore
        }
        this.droneOscLow = null
        this.droneOscHigh = null
      }, 260)
    } catch {
      // ignore
    }
    this.isDronePlaying = false
  }

  // Canonical 432Hz tuning-blade severance chime (me-game-dev-bible.md)
  public triggerTuningBladeChime(intensity: 'normal' | 'severance' = 'normal') {
    const ctx = this.ensureContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const duration = intensity === 'severance' ? 2.8 : 1.6

      // Primary 432Hz carrier sine
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(432, now)
      gain1.gain.setValueAtTime(intensity === 'severance' ? 0.16 : 0.1, now)
      gain1.gain.exponentialRampToValueAtTime(0.0008, now + duration)

      // Harmonic 864Hz crystalline overtone
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = 'triangle'
      osc2.frequency.setValueAtTime(864, now)
      gain2.gain.setValueAtTime(intensity === 'severance' ? 0.05 : 0.025, now)
      gain2.gain.exponentialRampToValueAtTime(0.0005, now + duration * 0.65)

      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)

      osc1.start(now)
      osc2.start(now)
      osc1.stop(now + duration)
      osc2.stop(now + duration * 0.65)
    } catch {
      // ignore
    }
  }

  // 10-12 FPS render failure / glitch stutter sound
  public triggerGlitchStutter() {
    const ctx = this.ensureContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const bufferSize = Math.floor(ctx.sampleRate * 0.11)
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (i % 64 < 32 ? 1 : 0.15)
      }

      const noise = ctx.createBufferSource()
      noise.buffer = buffer

      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(1150, now)
      filter.Q.setValueAtTime(2.5, now)

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.045, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11)

      noise.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)
      noise.start(now)
    } catch {
      // ignore
    }
  }

  // Crisp MAGI terminal micro-blip for buttons, copy actions, and node pills
  public triggerTactileBlip(freq = 864) {
    const ctx = this.ensureContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now)
      osc.frequency.exponentialRampToValueAtTime(freq * 1.25, now + 0.055)

      gain.gain.setValueAtTime(0.05, now)
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.065)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.07)
    } catch {
      // ignore
    }
  }

  // Playful 8-note synth arpeggio preview when no MP3 file is loaded yet
  public playProceduralCardTrack(seed = 1) {
    const ctx = this.ensureContext()
    if (!ctx) return
    try {
      const notes = [216, 256.87, 323.63, 432, 323.63, 484.9, 432, 647.27]
      const now = ctx.currentTime
      notes.forEach((baseFreq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = i % 2 === 0 ? 'triangle' : 'sine'
        const shift = 1 + ((seed % 5) * 0.04)
        osc.frequency.setValueAtTime(baseFreq * shift, now + i * 0.22)
        gain.gain.setValueAtTime(0.08, now + i * 0.22)
        gain.gain.exponentialRampToValueAtTime(0.0008, now + i * 0.22 + 0.35)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + i * 0.22)
        osc.stop(now + i * 0.22 + 0.36)
      })
    } catch {
      // ignore
    }
  }
}

export const soundEngine = new MutableEchoAudioEngine()
