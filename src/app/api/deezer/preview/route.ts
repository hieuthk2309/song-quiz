import { NextRequest, NextResponse } from 'next/server';
import { searchDeezerTracks } from '@/src/lib/deezerClient';

/**
 * GET /api/deezer/preview?title=<song>&artist=<artist>
 *
 * Fetches a 30-second MP3 preview URL directly from Deezer API (free, no auth).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || '';
  const artist = searchParams.get('artist') || '';

  if (!title) {
    return NextResponse.json({ success: false, error: 'missing_title' }, { status: 400 });
  }

  const cleanTitle = title.replace(/\s*[-–([].*/, '').trim();
  const query = [cleanTitle, artist].filter(Boolean).join(' ');

  try {
    const results = await searchDeezerTracks(query, 10);

    if (results && results.length > 0) {
      // Find the best match: prefer results where the artist name matches and preview is present
      const artistQuery = artist.toLowerCase().trim();
      let best = results.find((r) =>
        r.preview &&
        artistQuery &&
        r.artist?.name?.toLowerCase().includes(artistQuery.split(',')[0].trim().substring(0, 4))
      ) || results.find((r) => r.preview);

      if (best?.preview) {
        return NextResponse.json({
          success: true,
          source: 'deezer',
          previewUrl: best.preview,
          trackName: best.title,
          artistName: best.artist?.name,
          artworkUrl: best.album?.cover_medium,
          durationMs: (best.duration || 30) * 1000,
          deezerId: best.id,
          deezerLink: best.link,
        });
      }
    }
  } catch (err) {
    console.warn('[Deezer Preview] Search failed:', err);
  }

  return NextResponse.json({ success: false, error: 'no_preview_found' }, { status: 404 });
}
