import { NextRequest, NextResponse } from 'next/server';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('spotify_access_token')?.value;
  const refreshToken = request.cookies.get('spotify_refresh_token')?.value;
  const expiresAt = parseInt(request.cookies.get('spotify_token_expires_at')?.value || '0');

  // If token is still valid for at least 30 seconds
  if (accessToken && Date.now() < expiresAt - 30000) {
    return NextResponse.json({ success: true, accessToken });
  }

  if (!refreshToken) {
    return NextResponse.json({ success: false, error: 'not_authenticated' }, { status: 401 });
  }

  // Refresh token
  try {
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

    if (!refreshRes.ok) {
      return NextResponse.json({ success: false, error: 'refresh_failed' }, { status: 401 });
    }

    const data = await refreshRes.json();
    const newAccessToken = data.access_token;
    const newExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;

    const response = NextResponse.json({ success: true, accessToken: newAccessToken });

    response.cookies.set('spotify_access_token', newAccessToken, {
      httpOnly: true,
      secure: false,
      maxAge: data.expires_in || 3600,
      path: '/',
      sameSite: 'lax',
    });

    response.cookies.set('spotify_token_expires_at', newExpiresAt.toString(), {
      httpOnly: false,
      secure: false,
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax',
    });

    return response;
  } catch (err) {
    console.error('Error refreshing token:', err);
    return NextResponse.json({ success: false, error: 'server_error' }, { status: 500 });
  }
}
