type WebAudioNode = {
  connect(destination: unknown): void;
};

type WebAudioOscillator = WebAudioNode & {
  type: string;
  frequency: {
    setValueAtTime(value: number, time: number): void;
    exponentialRampToValueAtTime(value: number, time: number): void;
  };
  start(): void;
  stop(time?: number): void;
};

type WebAudioGain = WebAudioNode & {
  gain: {
    setValueAtTime(value: number, time: number): void;
    exponentialRampToValueAtTime(value: number, time: number): void;
    linearRampToValueAtTime(value: number, time: number): void;
  };
};

type WebAudioContext = {
  state: string;
  currentTime: number;
  destination: unknown;
  resume(): Promise<void>;
  createOscillator(): WebAudioOscillator;
  createGain(): WebAudioGain;
};

export class SoundManager {
  private static audioCtx: WebAudioContext | null = null;
  private static isMuted: boolean = false;

  private static getContext(): WebAudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.audioCtx) {
      try {
        const AudioContextClass = globalThis.AudioContext ?? (globalThis as typeof globalThis & {
          webkitAudioContext?: new () => WebAudioContext;
        }).webkitAudioContext;

        if (!AudioContextClass) {
          console.warn('Web Audio API not supported');
          return null;
        }

        this.audioCtx = new AudioContextClass();
      } catch {
        console.warn('Web Audio API not supported');
        return null;
      }
    }

    // Resume context if it was suspended (autoplay policy)
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public static setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public static playRollSound() {
    if (this.isMuted) return;

    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      // Random pitch between 400 and 600 Hz for variety
      osc.frequency.setValueAtTime(400 + Math.random() * 200, ctx.currentTime);

      // Short click/beep envelope
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {
        // Ignore audio playback errors
    }
  }

  public static playLevelUpSound() {
      if (this.isMuted) return;

      const ctx = this.getContext();
      if (!ctx) return;

      try {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.2);

        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.3);
        } catch {
          // Ignore
      }
  }
}
