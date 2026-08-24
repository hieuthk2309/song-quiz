import { NextRequest, NextResponse } from 'next/server';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;

async function getValidAccessToken(request: NextRequest): Promise<{ token: string; response?: NextResponse } | null> {
  const accessToken = request.cookies.get('spotify_access_token')?.value;
  const refreshToken = request.cookies.get('spotify_refresh_token')?.value;
  const expiresAt = parseInt(request.cookies.get('spotify_token_expires_at')?.value || '0');

  if (!refreshToken) return null;

  // Token still valid
  if (accessToken && Date.now() < expiresAt - 30000) {
    return { token: accessToken };
  }

  // Refresh the token
  const authHeader = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
  const refreshRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authHeader}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!refreshRes.ok) return null;

  const data = await refreshRes.json();
  const newToken = data.access_token;
  const newExpiry = Date.now() + data.expires_in * 1000;

  // Return token with updated cookies to set
  const res = NextResponse.json({});
  res.cookies.set('spotify_access_token', newToken, {
    httpOnly: true, secure: false, maxAge: data.expires_in, path: '/', sameSite: 'lax',
  });
  res.cookies.set('spotify_token_expires_at', newExpiry.toString(), {
    httpOnly: false, secure: false, maxAge: 60 * 60 * 24 * 30, path: '/', sameSite: 'lax',
  });
  if (data.refresh_token) {
    res.cookies.set('spotify_refresh_token', data.refresh_token, {
      httpOnly: true, secure: false, maxAge: 60 * 60 * 24 * 30, path: '/', sameSite: 'lax',
    });
  }

  return { token: newToken, response: res };
}

export async function GET(request: NextRequest) {
  const tokenResult = await getValidAccessToken(request);

  if (!tokenResult) {
    return NextResponse.json({ success: false, error: 'not_authenticated' }, { status: 401 });
  }

  const { token } = tokenResult;

  try {
    // Fetch all user playlists (up to 50)
    const res = await fetch('https://api.spotify.com/v1/me/playlists?limit=50&offset=0', {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Spotify playlists fetch failed:', res.status, errText);
      return NextResponse.json({ success: false, error: 'fetch_failed', status: res.status }, { status: 502 });
    }

    const data = await res.json();
    const playlists = (data.items || []).map((pl: any) => ({
      id: pl.id,
      name: pl.name,
      description: pl.description || '',
      totalTracks: pl.tracks?.total || 0,
      cover: pl.images?.[0]?.url || null,
      isPublic: pl.public,
      isCollaborative: pl.collaborative,
      owner: pl.owner?.display_name || pl.owner?.id,
    }));

    const jsonResponse = NextResponse.json({ success: true, playlists, total: data.total });

    // Forward refreshed cookie if needed
    if (tokenResult.response) {
      for (const [name, value] of tokenResult.response.cookies.getAll().map(c => [c.name, c] as const)) {
        jsonResponse.cookies.set(name, value.value, { httpOnly: value.httpOnly, maxAge: value.maxAge, path: value.path });
      }
    }

    return jsonResponse;
  } catch (err) {
    console.error('Error fetching user playlists:', err);
    return NextResponse.json({ success: false, error: 'server_error' }, { status: 500 });
  }
}
