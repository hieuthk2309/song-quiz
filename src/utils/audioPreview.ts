/**
 * audioPreview.ts
 * Manages 30-second MP3 audio previews fetched from iTunes/Deezer.
 * Uses HTML5 Audio API — no extra dependencies needed.
 */

type PreviewState = 'idle' | 'loading' | 'playing' | 'paused' | 'error' | 'fallback';

type PreviewResult = {
  success: boolean;
  source?: 'itunes' | 'deezer';
  previewUrl?: string;
  trackName?: string;
  artistName?: string;
  artworkUrl?: string;
};

type StateChangeListener = (state: PreviewState, source?: string) => void;

class AudioPreviewManager {
  private audio: HTMLAudioElement | null = null;
  private state: PreviewState = 'idle';
  private source: 'itunes' | 'deezer' | null = null;
  private listeners: StateChangeListener[] = [];
  // Simple in-memory cache: key = "title|artist" → {url, source} or null
  private cache: Map<string, { url: string; source: 'itunes' | 'deezer' } | null> = new Map();

  subscribe(cb: StateChangeListener) {
    this.listeners.push(cb);
    cb(this.state, this.source ?? undefined);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private setState(s: PreviewState, src?: 'itunes' | 'deezer' | null) {
    this.state = s;
    if (src !== undefined) this.source = src ?? null;
    this.listeners.forEach((l) => l(s, this.source ?? undefined));
  }

  getState() { return this.state; }
  getSource(): 'itunes' | 'deezer' | null { return this.source; }

  /** Stop current preview immediately */
  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
    this.setState('idle', null);
  }

  /** Pause without destroying */
  pause() {
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
      this.setState('paused');
    }
  }

  setVolume(vol: number) {
    if (this.audio) this.audio.volume = Math.max(0, Math.min(1, vol));
  }

  /**
   * Fetch preview URL from /api/spotify/preview and play it.
   * Returns 'playing' if a preview was found, 'fallback' if not.
   */
  async playPreview(
    title: string,
    artist: string,
    startAtMs: number = 0,
    onEnd?: () => void
  ): Promise<'playing' | 'fallback'> {
    // Stop any existing audio first
    this.stop();
    this.setState('loading', null);

    const cacheKey = `${title}|${artist}`;
    let cached = this.cache.get(cacheKey);

    if (cached === undefined) {
      // Not cached — fetch
      try {
        const res = await fetch(
          `/api/spotify/preview?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`
        );
        if (res.ok) {
          const data: PreviewResult = await res.json();
          if (data.success && data.previewUrl && data.source) {
            cached = { url: data.previewUrl, source: data.source };
            this.cache.set(cacheKey, cached);
            console.log(`[Preview] Found via ${data.source}: ${data.trackName} – ${data.artistName}`);
          } else {
            cached = null;
            this.cache.set(cacheKey, null);
          }
        } else {
          cached = null;
          this.cache.set(cacheKey, null);
        }
      } catch (err) {
        console.warn('[Preview] Fetch error:', err);
        cached = null;
        this.cache.set(cacheKey, null);
      }
    }

    if (!cached) {
      this.setState('fallback', null);
      return 'fallback';
    }

    const { url: previewUrl, source: previewSource } = cached;
    this.source = previewSource;

    // Create and play HTML5 Audio
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.volume = 0.85;
      audio.preload = 'auto';

      audio.addEventListener('canplay', () => {
        if (startAtMs > 0 && isFinite(audio.duration)) {
          audio.currentTime = startAtMs / 1000;
        }
        audio.play().then(() => {
          this.setState('playing', previewSource);
          resolve('playing');
        }).catch((err) => {
          console.warn('[Preview] Autoplay blocked:', err);
          this.setState('fallback', null);
          resolve('fallback');
        });
      }, { once: true });

      audio.addEventListener('ended', () => {
        this.setState('idle');
        onEnd?.();
      });

      audio.addEventListener('error', (e) => {
        console.warn('[Preview] Audio error:', e);
        this.setState('fallback');
        resolve('fallback');
      });

      audio.src = previewUrl!;
      audio.load();
      this.audio = audio;
    });
  }
}

export const audioPreview = new AudioPreviewManager();
