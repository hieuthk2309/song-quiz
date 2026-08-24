import { NextRequest, NextResponse } from 'next/server';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'https://localhost:3000/api/auth/spotify/callback';

const SCOPES = [
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-library-read',
  'user-top-read',
].join(' ');

export async function GET(request: NextRequest) {
  const state = Math.random().toString(36).substring(2, 15);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    state,
    show_dialog: 'false',
  });

  const response = NextResponse.redirect(
    `https://accounts.spotify.com/authorize?${params.toString()}`
  );

  // Store state in cookie for verification
  response.cookies.set('spotify_oauth_state', state, {
    httpOnly: true,
    secure: false, // Allow on HTTP localhost
    maxAge: 600, // 10 minutes
    path: '/',
    sameSite: 'lax',
  });

  return response;
}
