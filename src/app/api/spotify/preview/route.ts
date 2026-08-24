import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/spotify/preview?title=<song>&artist=<artist>
 *
 * Fetches a 30-second MP3 preview URL from iTunes Search API (free, no auth).
 * Falls back to Deezer if iTunes returns no result.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || '';
  const artist = searchParams.get('artist') || '';

  if (!title) {
    return NextResponse.json({ success: false, error: 'missing_title' }, { status: 400 });
  }

  const cleanTitle = title.replace(/\s*[-–([].*/, '').trim(); // strip "(feat. ...)" suffixes
  const query = [cleanTitle, artist].filter(Boolean).join(' ');

  // ── 1. Try iTunes Search API ──────────────────────────────────────────────
  try {
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=5&country=us`;
    const itunesRes = await fetch(itunesUrl, { next: { revalidate: 86400 } }); // cache 24h

    if (itunesRes.ok) {
      const data = await itunesRes.json();
      const results: any[] = data.results || [];

      // Find the best match: prefer results where the artist name roughly matches
      let best = results.find((r) =>
        r.previewUrl &&
        artist &&
        r.artistName?.toLowerCase().includes(artist.split(',')[0].toLowerCase().trim().substring(0, 4))
      ) || results.find((r) => r.previewUrl);

      if (best?.previewUrl) {
        return NextResponse.json({
          success: true,
          source: 'itunes',
          previewUrl: best.previewUrl,
          trackName: best.trackName,
          artistName: best.artistName,
          artworkUrl: best.artworkUrl100,
          durationMs: best.trackTimeMillis,
        });
      }
    }
  } catch (err) {
    console.warn('[Preview] iTunes fetch failed:', err);
  }

  // ── 2. Fallback: Deezer API ───────────────────────────────────────────────
  try {
    const deezerUrl = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=5`;
    const deezerRes = await fetch(deezerUrl, { next: { revalidate: 86400 } });

    if (deezerRes.ok) {
      const data = await deezerRes.json();
      const results: any[] = data.data || [];

      const best = results.find((r) => r.preview) || null;

      if (best?.preview) {
        return NextResponse.json({
          success: true,
          source: 'deezer',
          previewUrl: best.preview,
          trackName: best.title,
          artistName: best.artist?.name,
          artworkUrl: best.album?.cover_medium,
          durationMs: (best.duration || 30) * 1000,
        });
      }
    }
  } catch (err) {
    console.warn('[Preview] Deezer fetch failed:', err);
  }

  return NextResponse.json({ success: false, error: 'no_preview_found' }, { status: 404 });
}
