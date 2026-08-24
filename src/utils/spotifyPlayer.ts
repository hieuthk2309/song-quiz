// Spotify Web Playback SDK Manager

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void;
    Spotify?: {
      Player: new (options: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume?: number;
      }) => SpotifyPlayerInstance;
    };
  }
}

export interface SpotifyPlayerInstance {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  addListener: (event: string, cb: (...args: any[]) => void) => void;
  removeListener: (event: string, cb?: (...args: any[]) => void) => void;
  getCurrentState: () => Promise<any>;
  setVolume: (volume: number) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  togglePlay: () => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
}

type StateListener = (isReady: boolean, deviceId: string | null) => void;

class SpotifyPlayerManager {
  private player: SpotifyPlayerInstance | null = null;
  private deviceId: string | null = null;
  private isReady: boolean = false;
  private isInitializing: boolean = false;
  private listeners: StateListener[] = [];
  private currentPlayingUri: string | null = null;

  public subscribe(cb: StateListener) {
    this.listeners.push(cb);
    cb(this.isReady, this.deviceId);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.isReady, this.deviceId));
  }

  public getDeviceId(): string | null {
    return this.deviceId;
  }

  public getIsReady(): boolean {
    return this.isReady;
  }

  public async init(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    if (this.player && this.isReady) return true;
    if (this.isInitializing) return false;

    this.isInitializing = true;

    // Load Spotify Web Playback SDK script if not already present
    if (!document.getElementById('spotify-player-sdk')) {
      const script = document.createElement('script');
      script.id = 'spotify-player-sdk';
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);
    }

    return new Promise((resolve) => {
      const setupPlayer = () => {
        if (!window.Spotify) {
          this.isInitializing = false;
          resolve(false);
          return;
        }

        const player = new window.Spotify.Player({
          name: 'V-Pop Quiz Master Player',
          getOAuthToken: async (cb) => {
            try {
              const res = await fetch('/api/auth/spotify/token');
              if (res.ok) {
                const data = await res.json();
                if (data.success && data.accessToken) {
                  cb(data.accessToken);
                  return;
                }
              }
            } catch (err) {
              console.warn('Error retrieving Spotify token for Web Player:', err);
            }
          },
          volume: 0.85,
        });

        player.addListener('ready', ({ device_id }: { device_id: string }) => {
          this.deviceId = device_id;
          this.isReady = true;
          this.isInitializing = false;
          this.notify();
          resolve(true);
        });

        player.addListener('not_ready', () => {
          this.isReady = false;
          this.deviceId = null;
          this.notify();
        });

        player.addListener('initialization_error', ({ message }: { message: string }) => {
          console.warn('Spotify Player initialization error:', message);
          this.isInitializing = false;
          resolve(false);
        });

        player.addListener('authentication_error', ({ message }: { message: string }) => {
          console.warn('Spotify Player authentication error (Requires Spotify Premium):', message);
          this.isInitializing = false;
          resolve(false);
        });

        player.addListener('account_error', ({ message }: { message: string }) => {
          console.warn('Spotify Player account error (Spotify Premium required):', message);
          this.isInitializing = false;
          resolve(false);
        });

        player.connect().then((success) => {
          if (!success) {
            this.isInitializing = false;
            resolve(false);
          }
        });

        this.player = player;
      };

      if (window.Spotify) {
        setupPlayer();
      } else {
        window.onSpotifyWebPlaybackSDKReady = () => {
          setupPlayer();
        };
      }
    });
  }

  /**
   * Play a track directly through the Spotify Web Playback SDK
   */
  public async playTrack(trackUriOrId: string, positionMs: number = 30000): Promise<boolean> {
    if (!this.isReady || !this.deviceId) {
      // Try to re-init
      const ready = await this.init();
      if (!ready || !this.deviceId) return false;
    }

    const uri = trackUriOrId.startsWith('spotify:track:') ? trackUriOrId : `spotify:track:${trackUriOrId}`;
    this.currentPlayingUri = uri;

    try {
      const res = await fetch('/api/spotify/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: this.deviceId,
          trackUri: uri,
          positionMs,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.success === true;
      }
      return false;
    } catch (err) {
      console.warn('Failed to trigger Spotify playback:', err);
      return false;
    }
  }

  /**
   * Pause playback
   */
  public async pause(): Promise<void> {
    if (this.player) {
      try {
        await this.player.pause();
      } catch {
        // safe
      }
    }
  }

  /**
   * Resume playback
   */
  public async resume(): Promise<void> {
    if (this.player) {
      try {
        await this.player.resume();
      } catch {
        // safe
      }
    }
  }

  /**
   * Disconnect player on unmount
   */
  public disconnect() {
    if (this.player) {
      try {
        this.player.disconnect();
      } catch {
        // safe
      }
      this.player = null;
      this.deviceId = null;
      this.isReady = false;
      this.notify();
    }
  }
}

export const spotifyPlayer = new SpotifyPlayerManager();
