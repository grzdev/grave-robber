/**
 * Advanced Game Audio Engine inspired by Earshot sound design recipes
 * (modal synthesis, filtered noise sweeps, sub-impacts, harmonic bell chimes).
 * Zero external audio dependencies - 100% synthesized in Web Audio API.
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    const saved = localStorage.getItem('graverobber_muted');
    if (saved !== null) {
      this.isMuted = saved === 'true';
    }
  }

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('graverobber_muted', String(this.isMuted));
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Jump Whoosh (inspired by Earshot whoosh_fast/tight)
   * Airy high-passed motion sweep + low-end liftoff thump
   */
  public playJump() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 1. Air whoosh noise
    const bufferSize = this.ctx.sampleRate * 0.18;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(350, t);
    filter.frequency.exponentialRampToValueAtTime(1400, t + 0.08);
    filter.frequency.exponentialRampToValueAtTime(600, t + 0.18);
    filter.Q.value = 3.0;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.01, t);
    noiseGain.gain.linearRampToValueAtTime(0.12, t + 0.04);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    whiteNoise.start(t);

    // 2. Tonal liftoff body (soft sub pulse)
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.12);

    oscGain.gain.setValueAtTime(0.14, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  /**
   * Stone Footstep (soft gravel / dungeon stone tap)
   */
  public playStep() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.04;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.04, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
  }

  /**
   * Inspect Tomb (resonant gothic bell chime + ambient hollow tone)
   */
  public playInspect() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Harmonic modal frequencies for a heavy bronze church bell (C3, Eb3, G3, B3)
    const bellPartials = [130.8, 155.6, 196.0, 246.9, 392.0];

    bellPartials.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      const amp = 0.08 / (idx + 1);
      gain.gain.setValueAtTime(amp, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.9 - idx * 0.1);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t);
      osc.stop(t + 0.95);
    });
  }

  /**
   * Plunder Crypt Victory (inspired by Earshot pro_impact + pro_shimmer)
   * Heavy stone sarcophagus rumble -> sub impact boom -> crystalline shimmer
   */
  public playPlunder() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 1. Deep Sub Impact Boom
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(95, t);
    subOsc.frequency.exponentialRampToValueAtTime(32, t + 0.45);

    subGain.gain.setValueAtTime(0.35, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(t);
    subOsc.stop(t + 0.65);

    // 2. Stone scraping noise
    const scrapeDur = 0.22;
    const bufSize = this.ctx.sampleRate * scrapeDur;
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) d[i] = (Math.random() * 2 - 1) * 0.4;
    const noiseSrc = this.ctx.createBufferSource();
    noiseSrc.buffer = buf;
    const scrapeFilter = this.ctx.createBiquadFilter();
    scrapeFilter.type = 'bandpass';
    scrapeFilter.frequency.setValueAtTime(400, t);
    scrapeFilter.Q.value = 2.0;

    const scrapeGain = this.ctx.createGain();
    scrapeGain.gain.setValueAtTime(0.15, t);
    scrapeGain.gain.exponentialRampToValueAtTime(0.001, t + scrapeDur);

    noiseSrc.connect(scrapeFilter);
    scrapeFilter.connect(scrapeGain);
    scrapeGain.connect(this.ctx.destination);
    noiseSrc.start(t);

    // 3. Golden shimmer cascade (delightful melodic chimes)
    const chimeNotes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98]; // C5, E5, G5, C6, E6, G6
    chimeNotes.forEach((freq, idx) => {
      const delay = 0.08 + idx * 0.065;
      const chimeOsc = this.ctx!.createOscillator();
      const chimeGain = this.ctx!.createGain();

      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(freq, t + delay);

      chimeGain.gain.setValueAtTime(0.12, t + delay);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.4);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(this.ctx!.destination);

      chimeOsc.start(t + delay);
      chimeOsc.stop(t + delay + 0.42);
    });
  }

  /**
   * Cursed Error Trap (downlifter + dissonance)
   */
  public playError() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Discordant twin saw frequencies sliding down
    const freqs = [185, 195];
    freqs.forEach(f => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.3);

      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t);
      osc.stop(t + 0.32);
    });
  }
}

export const sounds = new SoundEngine();
