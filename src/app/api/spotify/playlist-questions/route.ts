import { NextRequest, NextResponse } from 'next/server';
import { generateQuizOptions, cleanTrackName, shuffleArray } from '@/src/lib/spotify';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;

async function getValidAccessToken(request: NextRequest): Promise<string | null> {
  const accessToken = request.cookies.get('spotify_access_token')?.value;
  const refreshToken = request.cookies.get('spotify_refresh_token')?.value;
  const expiresAt = parseInt(request.cookies.get('spotify_token_expires_at')?.value || '0');

  if (!refreshToken) return null;
  if (accessToken && Date.now() < expiresAt - 30000) return accessToken;

  // Refresh
  const authHeader = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
  const refreshRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Authorization': `Basic ${authHeader}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
  });
  if (!refreshRes.ok) return null;
  const data = await refreshRes.json();
  return data.access_token;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const playlistId = searchParams.get('playlistId');
  if (!playlistId) {
    return NextResponse.json({ success: false, error: 'Missing playlistId' }, { status: 400 });
  }

  const token = await getValidAccessToken(request);
  if (!token) {
    return NextResponse.json({ success: false, error: 'not_authenticated' }, { status: 401 });
  }

  try {
    // Fetch tracks from the playlist
    const randomOffset = Math.floor(Math.random() * 3) * 20;
    const [res1, res2] = await Promise.all([
      fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?market=VN&limit=20&offset=${randomOffset}&fields=items(track(id,name,artists,album)),total`, {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store',
      }),
      fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?market=VN&limit=20&offset=0&fields=items(track(id,name,artists,album)),total`, {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store',
      }),
    ]);

    let rawTracks: any[] = [];
    if (res1.ok) {
      const d1 = await res1.json();
      rawTracks = rawTracks.concat((d1.items || []).map((i: any) => i.track).filter(Boolean));
    }
    if (res2.ok) {
      const d2 = await res2.json();
      rawTracks = rawTracks.concat((d2.items || []).map((i: any) => i.track).filter(Boolean));
    }

    // Deduplicate
    const seen = new Set<string>();
    rawTracks = rawTracks.filter((t: any) => {
      if (!t?.name || !t?.artists?.length) return false;
      const key = t.id || `${t.name}-${t.artists[0].name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    rawTracks = shuffleArray(rawTracks);

    if (rawTracks.length < 4) {
      return NextResponse.json({ success: false, error: 'not_enough_tracks', count: rawTracks.length }, { status: 422 });
    }

    const tracksPool = rawTracks;
    const questions: any[] = [];

    tracksPool.slice(0, 30).forEach((track: any, index: number) => {
      const correctArtist = track.artists[0].name;
      const cleanName = cleanTrackName(track.name) || track.name;
      const releaseYear = track.album?.release_date ? parseInt(track.album.release_date.substring(0, 4)) : 2023;

      if (index % 2 === 0) {
        // Question Type 1: "Who is the artist?"
        const optionsObjects = generateQuizOptions(track, 'ARTIST_NAME', tracksPool);
        const options = optionsObjects.map(o => o.label);
        const correctIndex = optionsObjects.findIndex(o => o.isCorrect);

        questions.push({
          id: `pl-${playlistId}-${track.id || index}-${Date.now()}`,
          category: `playlist-${playlistId}`,
          question: `Ca khúc "${cleanName}" do nghệ sĩ nào thể hiện?`,
          promptType: 'artist',
          songTitle: cleanName,
          artist: track.artists.map((a: any) => a.name).join(', '),
          releaseYear,
          options,
          correctIndex,
          spotifyId: track.id,
          spotifyUri: track.uri || (track.id ? `spotify:track:${track.id}` : undefined),
          explanation: `"${cleanName}" được thể hiện bởi ${track.artists.map((a: any) => a.name).join(', ')} (${releaseYear}).`,
          melodyNotes: [
            { freq: 523.25 + (index * 40) % 300, duration: 0.3 },
            { freq: 659.25 + (index * 30) % 200, duration: 0.3 },
            { freq: 783.99, duration: 0.35 },
            { freq: 880.00, duration: 0.45 },
          ],
        });
      } else {
        // Question Type 2: "What is the song name?"
        const optionsObjects = generateQuizOptions(track, 'SONG_NAME', tracksPool);
        const options = optionsObjects.map(o => o.label);
        const correctIndex = optionsObjects.findIndex(o => o.isCorrect);

        questions.push({
          id: `pl-${playlistId}-${track.id || index}-${Date.now()}`,
          category: `playlist-${playlistId}`,
          question: `Đâu là bài hát của nghệ sĩ ${correctArtist} trong playlist này?`,
          promptType: 'melody',
          songTitle: cleanName,
          artist: correctArtist,
          releaseYear,
          options,
          correctIndex,
          spotifyId: track.id,
          spotifyUri: track.uri || (track.id ? `spotify:track:${track.id}` : undefined),
          explanation: `"${cleanName}" là bài hát của ${correctArtist} trong playlist (${releaseYear}).`,
          melodyNotes: [
            { freq: 440.0 + (index * 35) % 200, duration: 0.3 },
            { freq: 523.25, duration: 0.3 },
            { freq: 587.33, duration: 0.3 },
            { freq: 659.25, duration: 0.45 },
          ],
        });
      }
    });

    return NextResponse.json({ success: true, questions, trackCount: rawTracks.length });
  } catch (err) {
    console.error('Error generating playlist questions:', err);
    return NextResponse.json({ success: false, error: 'server_error' }, { status: 500 });
  }
}
