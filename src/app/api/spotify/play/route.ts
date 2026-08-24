import { NextRequest, NextResponse } from 'next/server';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;

async function getValidAccessToken(request: NextRequest): Promise<string | null> {
  const accessToken = request.cookies.get('spotify_access_token')?.value;
  const refreshToken = request.cookies.get('spotify_refresh_token')?.value;
  const expiresAt = parseInt(request.cookies.get('spotify_token_expires_at')?.value || '0');

  if (accessToken && Date.now() < expiresAt - 30000) return accessToken;
  if (!refreshToken) return null;

  try {
    const authHeader = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
    const refreshRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Authorization': `Basic ${authHeader}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
    });
    if (!refreshRes.ok) return null;
    const data = await refreshRes.json();
    return data.access_token;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const token = await getValidAccessToken(request);
  if (!token) {
    return NextResponse.json({ success: false, error: 'not_authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { deviceId, trackUri, trackId, positionMs = 25000 } = body;

    const uri = trackUri || (trackId ? `spotify:track:${trackId}` : null);
    if (!uri || !deviceId) {
      return NextResponse.json({ success: false, error: 'missing_params' }, { status: 400 });
    }

    // Call Spotify Web API to play track on device
    const playRes = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${encodeURIComponent(deviceId)}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uris: [uri],
        position_ms: positionMs,
      }),
    });

    if (playRes.status === 204 || playRes.ok) {
      return NextResponse.json({ success: true, isPlaying: true });
    }

    const errData = await playRes.json().catch(() => ({}));
    return NextResponse.json({ success: false, error: errData }, { status: playRes.status });
  } catch (err) {
    console.error('Error starting Spotify playback:', err);
    return NextResponse.json({ success: false, error: 'server_error' }, { status: 500 });
  }
}
