import { NextRequest, NextResponse } from 'next/server';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'https://localhost:3000/api/auth/spotify/callback';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const storedState = request.cookies.get('spotify_oauth_state')?.value;

  const baseUrl = new URL(request.url).origin;

  if (error) {
    return NextResponse.redirect(`${baseUrl}/?spotify_error=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/?spotify_error=missing_params`);
  }

  // Exchange authorization code for access token
  const authHeader = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');

  try {
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('Spotify token exchange failed:', errText);
      return NextResponse.redirect(`${baseUrl}/?spotify_error=token_failed`);
    }

    const tokenData = await tokenRes.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Get user profile to display name
    const profileRes = await fetch('https://api.spotify.com/v1/me', {
      headers: { 'Authorization': `Bearer ${access_token}` },
    });
    const profile = profileRes.ok ? await profileRes.json() : null;

    const response = NextResponse.redirect(`${baseUrl}/?spotify_connected=1`);

    // Store tokens in HTTP-only cookies
    const expiresAt = Date.now() + expires_in * 1000;

    response.cookies.set('spotify_access_token', access_token, {
      httpOnly: true,
      secure: false,
      maxAge: expires_in,
      path: '/',
      sameSite: 'lax',
    });

    response.cookies.set('spotify_refresh_token', refresh_token, {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      sameSite: 'lax',
    });

    response.cookies.set('spotify_token_expires_at', expiresAt.toString(), {
      httpOnly: false, // Client-readable to check expiry
      secure: false,
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax',
    });

    if (profile) {
      response.cookies.set('spotify_user', JSON.stringify({
        id: profile.id,
        displayName: profile.display_name || profile.id,
        avatar: profile.images?.[0]?.url || null,
        country: profile.country,
        product: profile.product,
      }), {
        httpOnly: false, // Client-readable
        secure: false,
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
        sameSite: 'lax',
      });
    }

    // Clear state cookie
    response.cookies.delete('spotify_oauth_state');

    return response;
  } catch (err) {
    console.error('Spotify OAuth callback error:', err);
    return NextResponse.redirect(`${baseUrl}/?spotify_error=server_error`);
  }
}
