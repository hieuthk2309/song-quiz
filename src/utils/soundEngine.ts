// Web Audio API Synthesizer & Sound Effects for Vpop Quiz

export interface MelodyNote {
  freq: number;
  duration: number;
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private currentMelodyTimer: number | null = null;
  private currentOscillators: OscillatorNode[] = [];

  public init() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public resumeAudioContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      return this.ctx.resume().catch(() => {});
    }
    return Promise.resolve();
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.7, this.ctx.currentTime);
    }
  }

  public stopCurrentAudio() {
    if (this.currentMelodyTimer) {
      clearTimeout(this.currentMelodyTimer);
      this.currentMelodyTimer = null;
    }
    this.currentOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // already stopped
      }
    });
    this.currentOscillators = [];
  }

  // Play button click sound
  public playClick() {
    this.init();
    if (this.isMuted) return;
    try {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  // Play correct answer chime
  public playCorrect() {
    this.init();
    if (this.isMuted) return;
    try {
      if (!this.ctx || !this.masterGain) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const startTime = this.ctx!.currentTime + idx * 0.08;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(startTime);
        osc.stop(startTime + 0.25);
      });
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  // Play wrong answer buzzer
  public playWrong() {
    this.init();
    if (this.isMuted) return;
    try {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.setValueAtTime(190, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  // Play timer warning tick
  public playTick() {
    this.init();
    if (this.isMuted) return;
    try {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  // Play urgent high-frequency tick for last 5 seconds (louder + higher pitch)
  public playUrgentTick() {
    this.init();
    if (this.isMuted) return;
    try {
      if (!this.ctx || !this.masterGain) return;

      // Tick
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(1200, this.ctx.currentTime);
      gain1.gain.setValueAtTime(0.22, this.ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.035);
      osc1.connect(gain1);
      gain1.connect(this.masterGain);
      osc1.start();
      osc1.stop(this.ctx.currentTime + 0.035);

      // Subtle tock echo
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(600, this.ctx.currentTime + 0.04);
      gain2.gain.setValueAtTime(0.10, this.ctx.currentTime + 0.04);
      gain2.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.09);
      osc2.connect(gain2);
      gain2.connect(this.masterGain);
      osc2.start(this.ctx.currentTime + 0.04);
      osc2.stop(this.ctx.currentTime + 0.09);
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  // Play ascending chime when Blind Audio phase lifts (3s reveal)
  public playBlindReveal() {
    this.init();
    if (this.isMuted) return;
    try {
      if (!this.ctx || !this.masterGain) return;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const startTime = this.ctx!.currentTime + idx * 0.06;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.22, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(startTime);
        osc.stop(startTime + 0.18);
      });
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  /**
   * Generates a unique, harmonious pentatonic melody sequence for any song based on its title and artist.
   */
  public generateMelodyForTrack(songTitle: string = '', artist: string = ''): MelodyNote[] {
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00]; // C Major Pentatonic (2 Octaves)
    const seedStr = `${songTitle}-${artist}`;
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
      hash |= 0;
    }

    const noteCount = 6;
    const notes: MelodyNote[] = [];
    let cur = Math.abs(hash);

    for (let i = 0; i < noteCount; i++) {
      const noteIdx = (cur + i * 3) % scale.length;
      const freq = scale[noteIdx];
      const duration = i === noteCount - 1 ? 0.6 : (i % 2 === 0 ? 0.35 : 0.28);
      notes.push({ freq, duration });
      cur = Math.floor(cur / 3) + 7;
    }

    return notes;
  }

  /**
   * Play rich harmonic melody sequence for song preview (Lead Synth + Warm Octave Resonance)
   */
  public playMelody(notes: MelodyNote[], onComplete?: () => void) {
    this.stopCurrentAudio();
    this.init();
    if (this.isMuted || !notes || notes.length === 0) return;

    try {
      if (!this.ctx || !this.masterGain) return;

      let accumulatedTime = 0;
      const now = this.ctx.currentTime + 0.05;

      notes.forEach((note) => {
        const noteStart = now + accumulatedTime;
        const noteDur = note.duration;

        // 1. Lead Melody Oscillator (Warm Triangle)
        const leadOsc = this.ctx!.createOscillator();
        const leadGain = this.ctx!.createGain();

        leadOsc.type = 'triangle';
        leadOsc.frequency.setValueAtTime(note.freq, noteStart);

        leadGain.gain.setValueAtTime(0.001, noteStart);
        leadGain.gain.linearRampToValueAtTime(0.35, noteStart + 0.03);
        leadGain.gain.exponentialRampToValueAtTime(0.001, noteStart + noteDur);

        leadOsc.connect(leadGain);
        leadGain.connect(this.masterGain!);

        leadOsc.start(noteStart);
        leadOsc.stop(noteStart + noteDur);
        this.currentOscillators.push(leadOsc);

        // 2. Harmonic Sub/Over Oscillator (Sine Wave for musical depth)
        const harmOsc = this.ctx!.createOscillator();
        const harmGain = this.ctx!.createGain();

        harmOsc.type = 'sine';
        harmOsc.frequency.setValueAtTime(note.freq * 0.5, noteStart); // Octave below for body

        harmGain.gain.setValueAtTime(0.001, noteStart);
        harmGain.gain.linearRampToValueAtTime(0.18, noteStart + 0.04);
        harmGain.gain.exponentialRampToValueAtTime(0.001, noteStart + noteDur);

        harmOsc.connect(harmGain);
        harmGain.connect(this.masterGain!);

        harmOsc.start(noteStart);
        harmOsc.stop(noteStart + noteDur);
        this.currentOscillators.push(harmOsc);

        accumulatedTime += noteDur;
      });

      if (onComplete) {
        this.currentMelodyTimer = window.setTimeout(() => {
          onComplete();
        }, accumulatedTime * 1000 + 100);
      }
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  // Fanfare victory jingle
  public playVictory() {
    this.init();
    if (this.isMuted) return;
    const fanfare = [
      { freq: 523.25, duration: 0.15 }, // C5
      { freq: 659.25, duration: 0.15 }, // E5
      { freq: 783.99, duration: 0.15 }, // G5
      { freq: 1046.5, duration: 0.4 },  // C6
      { freq: 880.0, duration: 0.2 },   // A5
      { freq: 1046.5, duration: 0.6 },  // C6
    ];
    this.playMelody(fanfare);
  }
}

export const soundEngine = new SoundEngine();
