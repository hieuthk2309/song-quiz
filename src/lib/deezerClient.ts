// src/lib/deezerClient.ts
/**
 * Deezer API Client with In-Memory TTL Caching, Rate-Limit Resiliency,
 * and Type-Safe Endpoint Wrappers for public Deezer REST API.
 */

import {
  DeezerTrack,
  DeezerGenre,
  DeezerArtist,
  DeezerGenreResponse,
  DeezerSearchResponse,
  DeezerChartTracksResponse,
} from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// 1. In-Memory Cache Store
// ─────────────────────────────────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class InMemoryCache {
  private store = new Map<string, CacheEntry<any>>();

  public get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.data as T;
  }

  public set<T>(key: string, data: T, ttlMs: number = 60 * 60 * 1000): void {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  public has(key: string): boolean {
    return this.get(key) !== null;
  }

  public clear(): void {
    this.store.clear();
  }
}

// Global singleton cache (1 hour default TTL)
export const deezerCache = new InMemoryCache();

// ─────────────────────────────────────────────────────────────────────────────
// 2. Fetch Wrapper with Exponential Backoff & Retry Logic
// ─────────────────────────────────────────────────────────────────────────────

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export interface DeezerFetchOptions extends RequestInit {
  ttlMs?: number; // Cache duration in ms (default: 1 hour)
  skipCache?: boolean;
  maxRetries?: number; // default: 3
}

const DEEZER_BASE_URL = 'https://api.deezer.com';

/**
 * Robust fetch wrapper for Deezer Public Web API.
 * - Handles rate limiting and server timeouts.
 * - Auto-caches successful GET responses in memory.
 */
export async function deezerFetch<T = any>(
  endpointOrUrl: string,
  options: DeezerFetchOptions = {},
): Promise<T> {
  const {
    ttlMs = 60 * 60 * 1000,
    skipCache = false,
    maxRetries = 3,
    headers = {},
    ...fetchInit
  } = options;

  const url = endpointOrUrl.startsWith('http')
    ? endpointOrUrl
    : `${DEEZER_BASE_URL}${endpointOrUrl.startsWith('/') ? '' : '/'}${endpointOrUrl}`;

  const isGet = !fetchInit.method || fetchInit.method.toUpperCase() === 'GET';

  // 1. Check in-memory cache
  if (isGet && !skipCache) {
    const cachedData = deezerCache.get<T>(url);
    if (cachedData !== null) {
      return cachedData;
    }
  }

  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      const response = await fetch(url, {
        ...fetchInit,
        headers: {
          'Accept': 'application/json',
          ...headers,
        },
      });

      // Handle 429 Too Many Requests
      if (response.status === 429) {
        attempt++;
        if (attempt > maxRetries) {
          throw new Error(`[DeezerClient] Rate limit 429 exceeded max retries (${maxRetries}).`);
        }
        const waitMs = Math.pow(2, attempt) * 1000 + Math.random() * 300;
        console.warn(`[DeezerClient] Rate limited. Backing off for ${(waitMs / 1000).toFixed(1)}s...`);
        await sleep(waitMs);
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`[DeezerClient] HTTP ${response.status} ${response.statusText}: ${errorText}`);
      }

      const data = (await response.json()) as any;

      // Deezer returns errors inside 200 responses with an "error" property
      if (data && data.error) {
        if (data.error.code === 4 || data.error.type === 'Exception') {
          // Quota limit hit inside body
          attempt++;
          if (attempt <= maxRetries) {
            const waitMs = Math.pow(2, attempt) * 1000;
            console.warn(`[DeezerClient] Quota error in body. Waiting ${waitMs / 1000}s...`);
            await sleep(waitMs);
            continue;
          }
        }
        throw new Error(`[DeezerClient] API Error: ${data.error.message || JSON.stringify(data.error)}`);
      }

      // Cache successful response
      if (isGet && !skipCache) {
        deezerCache.set(url, data as T, ttlMs);
      }

      return data as T;
    } catch (err: any) {
      if (attempt < maxRetries && err.name !== 'AbortError' && !err.message?.includes('API Error:')) {
        attempt++;
        const backoffMs = Math.pow(2, attempt - 1) * 1000;
        console.warn(`[DeezerClient] Network error: ${err.message}. Retrying in ${backoffMs / 1000}s...`);
        await sleep(backoffMs);
        continue;
      }
      throw err;
    }
  }

  throw new Error('[DeezerClient] Request failed after maximum retries.');
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Typed Deezer Endpoint Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch a single track by its Deezer ID.
 * GET https://api.deezer.com/track/{id}
 */
export async function getDeezerTrack(trackId: number | string): Promise<DeezerTrack | null> {
  try {
    const data = await deezerFetch<DeezerTrack>(`/track/${trackId}`);
    return data;
  } catch (error) {
    console.error(`[DeezerClient] Failed to fetch track ${trackId}:`, error);
    return null;
  }
}

/**
 * Fetch all music genres from Deezer.
 * GET https://api.deezer.com/genre
 */
export async function getDeezerGenres(): Promise<DeezerGenre[]> {
  try {
    const data = await deezerFetch<DeezerGenreResponse>('/genre');
    return data?.data || [];
  } catch (error) {
    console.error('[DeezerClient] Failed to fetch genres:', error);
    return [];
  }
}

/**
 * Search tracks by query string.
 * GET https://api.deezer.com/search?q={query}&limit={limit}
 */
export async function searchDeezerTracks(query: string, limit: number = 25): Promise<DeezerTrack[]> {
  try {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    const data = await deezerFetch<DeezerSearchResponse>(
      `/search?q=${encodeURIComponent(cleanQuery)}&limit=${limit}`,
    );
    return data?.data || [];
  } catch (error) {
    console.error(`[DeezerClient] Search failed for query "${query}":`, error);
    return [];
  }
}

/**
 * Fetch chart tracks for a genre (0 for global / all genres).
 * GET https://api.deezer.com/chart/{genreId}/tracks
 */
export async function getDeezerChartTracks(genreId: number = 0, limit: number = 25): Promise<DeezerTrack[]> {
  try {
    const data = await deezerFetch<DeezerChartTracksResponse>(
      `/chart/${genreId}/tracks?limit=${limit}`,
    );
    return data?.data || [];
  } catch (error) {
    console.error(`[DeezerClient] Failed to fetch chart tracks for genre ${genreId}:`, error);
    return [];
  }
}

/**
 * Fetch artists for a specific genre.
 * GET https://api.deezer.com/genre/{genreId}/artists
 */
export async function getDeezerGenreArtists(genreId: number, limit: number = 20): Promise<DeezerArtist[]> {
  try {
    const data = await deezerFetch<{ data: DeezerArtist[] }>(
      `/genre/${genreId}/artists?limit=${limit}`,
    );
    return data?.data || [];
  } catch (error) {
    console.error(`[DeezerClient] Failed to fetch genre artists for genre ${genreId}:`, error);
    return [];
  }
}
