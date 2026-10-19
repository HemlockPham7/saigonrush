import { useGameStore } from '../store/useGameStore.js';

/**
 * Saigon Rush - Web Audio Procedural Synthesizer & Music Engine
 * Zero-latency synthetic retro arcade SFX and upbeat procedural background music.
 * Complies with browser autoplay policies via lazy gesture unlocking.
 */

class SoundSystem {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.isUnlocked = false;

    // Music scheduler state
    this.isPlayingMusic = false;
    this.musicTimer = null;
    this.tempo = 124; // BPM upbeat electronic tempo
    this.currentStep = 0;
    this.nextNoteTime = 0;
    this.lookahead = 25.0; // milliseconds
    this.scheduleAheadTime = 0.1; // seconds

    // Noise buffer cache
    this.noiseBuffer = null;
  }

  /**
   * Lazily initialize AudioContext on user interaction
   */
  init() {
    if (this.audioCtx) return;
    if (typeof window === 'undefined') return;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      this.audioCtx = new AudioContextClass();

      // Master Gain
      this.masterGain = this.audioCtx.createGain();
      const isMuted = useGameStore.getState().isMuted;
      this.masterGain.gain.setValueAtTime(isMuted ? 0 : 0.8, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);

      // SFX Sub-bus
      this.sfxGain = this.audioCtx.createGain();
      this.sfxGain.gain.setValueAtTime(0.7, this.audioCtx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // Music Sub-bus
      this.musicGain = this.audioCtx.createGain();
      this.musicGain.gain.setValueAtTime(0.35, this.audioCtx.currentTime);
      this.musicGain.connect(this.masterGain);

      // Generate reusable 1-second white noise buffer
      this.createNoiseBuffer();
    } catch (err) {
      console.warn('Web Audio API not supported or blocked:', err);
    }
  }

  /**
   * Unlock AudioContext on first user gesture (click, keydown)
   */
  unlock() {
    this.init();
    if (!this.audioCtx) return;

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().then(() => {
        this.isUnlocked = true;
      }).catch(() => {});
    } else {
      this.isUnlocked = true;
    }
  }

  /**
   * Generate cached noise buffer for percussion & slide rustle
   */
  createNoiseBuffer() {
    if (!this.audioCtx) return;
    const bufferSize = this.audioCtx.sampleRate;
    this.noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
  }

  /**
   * Update master mute status
   */
  setMuted(isMuted) {
    if (!this.audioCtx || !this.masterGain) return;
    const now = this.audioCtx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(isMuted ? 0 : 0.8, now + 0.05);
  }

  // =========================================================================
  // SOUND EFFECTS (PROCEDURAL SYNTHESIS)
  // =========================================================================

  /**
   * 1. Coin Pickup: Crisp 2-tone golden sine chime (987Hz -> 1318Hz, B5 to E6)
   */
  playCoinSound() {
    this.unlock();
    if (!this.audioCtx || !this.sfxGain) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    // Arpeggiated chime
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.06); // E6

    // Envelope
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.24);
  }

  /**
   * 2. Player Jump: Upward frequency glide (220Hz -> 540Hz)
   */
  playJumpSound() {
    this.unlock();
    if (!this.audioCtx || !this.sfxGain) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.16);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  /**
   * 3. Player Slide: Bandpass filtered white noise burst simulating asphalt skid
   */
  playSlideSound() {
    this.unlock();
    if (!this.audioCtx || !this.sfxGain || !this.noiseBuffer) return;

    const now = this.audioCtx.currentTime;
    const noise = this.audioCtx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1600, now);
    filter.frequency.exponentialRampToValueAtTime(600, now + 0.28);
    filter.Q.setValueAtTime(2.5, now);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + 0.32);
  }

  /**
   * 4. Power-Up Pickup: Bright ascending 4-note chord (C5, E5, G5, C6)
   */
  playPowerUpSound() {
    this.unlock();
    if (!this.audioCtx || !this.sfxGain) return;

    const now = this.audioCtx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const stepDuration = 0.055;

    notes.forEach((freq, i) => {
      const noteTime = now + i * stepDuration;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.25, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.2);
    });
  }

  /**
   * 5. Nón Lá Shield Break: Crystalline impact with high-pass burst
   */
  playShieldBreakSound() {
    this.unlock();
    if (!this.audioCtx || !this.sfxGain || !this.noiseBuffer) return;

    const now = this.audioCtx.currentTime;

    // Resonant ring
    const osc = this.audioCtx.createOscillator();
    const oscGain = this.audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1480, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.35);

    oscGain.gain.setValueAtTime(0.4, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.38);

    // Glass shatter noise
    const noise = this.audioCtx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2400, now);

    const noiseGain = this.audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + 0.28);
  }

  /**
   * 6. Cà Phê Obstacle Smash: Heavy punchy explosion impact
   */
  playSmashSound() {
    this.unlock();
    if (!this.audioCtx || !this.sfxGain) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.2);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  /**
   * 7. Fatal Crash: Low distorted impact thud
   */
  playCrashSound() {
    this.unlock();
    if (!this.audioCtx || !this.sfxGain) return;

    const now = this.audioCtx.currentTime;

    // Heavy bass drop
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(24, now + 0.55);

    gain.gain.setValueAtTime(0.65, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.65);
  }

  // =========================================================================
  // BACKGROUND MUSIC (PROCEDURAL SAIGON STREET GROOVE)
  // =========================================================================

  /**
   * Start or resume background music scheduler
   */
  startMusic() {
    this.unlock();
    if (!this.audioCtx || this.isPlayingMusic) return;

    this.isPlayingMusic = true;
    this.currentStep = 0;
    this.nextNoteTime = this.audioCtx.currentTime + 0.05;

    this.scheduleMusicLoop();
  }

  /**
   * Pause music playback
   */
  pauseMusic() {
    this.isPlayingMusic = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  /**
   * Stop music and reset playhead
   */
  stopMusic() {
    this.pauseMusic();
    this.currentStep = 0;
  }

  /**
   * Lookahead loop scheduler for zero-jitter rhythm
   */
  scheduleMusicLoop() {
    if (!this.isPlayingMusic || !this.audioCtx) return;

    while (this.nextNoteTime < this.audioCtx.currentTime + this.scheduleAheadTime) {
      this.scheduleStep(this.currentStep, this.nextNoteTime);
      this.advanceStep();
    }

    this.musicTimer = setTimeout(() => {
      this.scheduleMusicLoop();
    }, this.lookahead);
  }

  /**
   * Advance 16th-note step (16 steps per bar)
   */
  advanceStep() {
    const secondsPerBeat = 60.0 / this.tempo;
    this.nextNoteTime += 0.25 * secondsPerBeat; // 16th note
    this.currentStep = (this.currentStep + 1) % 16;
  }

  /**
   * Schedule audio nodes for a specific 16th-note step
   */
  scheduleStep(step, time) {
    if (!this.audioCtx || !this.musicGain) return;

    // 1. Kick Drum (On beats 0, 4, 8, 12)
    if (step === 0 || step === 4 || step === 8 || step === 12) {
      this.triggerKick(time);
    }

    // 2. Offbeat Hi-Hat (On 2, 6, 10, 14)
    if (step === 2 || step === 6 || step === 10 || step === 14) {
      this.triggerHiHat(time);
    }

    // 3. Synth Bassline (Pentatonic Saigon groove: A1, C2, D2, E2)
    const bassNotes = [55, 55, 65.41, 55, 73.42, 55, 82.41, 73.42]; // A1, C2, D2, E2
    const bassFreq = bassNotes[(step % 8)];
    if (step % 2 === 0) {
      this.triggerBass(bassFreq, time);
    }

    // 4. Synth Melodic Lead / Chime Arpeggio (Steps 0, 3, 6, 9, 12, 14)
    const arpeggioNotes = [440, 523.25, 587.33, 659.25, 783.99, 880]; // A4, C5, D5, E5, G5, A5
    if (step % 3 === 0 || step === 14) {
      const melodyFreq = arpeggioNotes[(step * 2) % arpeggioNotes.length];
      this.triggerArp(melodyFreq, time);
    }
  }

  /**
   * Procedural Kick Drum
   */
  triggerKick(time) {
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.12);

    gain.gain.setValueAtTime(0.45, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + 0.15);
  }

  /**
   * Procedural Crisp Hi-Hat
   */
  triggerHiHat(time) {
    if (!this.noiseBuffer) return;
    const noise = this.audioCtx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(6500, time);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.045);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    noise.start(time);
    noise.stop(time + 0.05);
  }

  /**
   * Procedural Synth Bass
   */
  triggerBass(freq, time) {
    const osc = this.audioCtx.createOscillator();
    const filter = this.audioCtx.createBiquadFilter();
    const gain = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, time);
    filter.frequency.exponentialRampToValueAtTime(120, time + 0.12);

    gain.gain.setValueAtTime(0.28, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + 0.15);
  }

  /**
   * Procedural Chiptune / Arpeggio Chime
   */
  triggerArp(freq, time) {
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + 0.12);
  }
}

// Global Singleton Instance
export const soundSystem = new SoundSystem();
