import { NextRequest, NextResponse } from 'next/server';
import { getDeezerTrack } from '@/src/lib/deezerClient';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Missing track id' },
      { status: 400 }
    );
  }

  try {
    const track = await getDeezerTrack(id);

    if (!track) {
      return NextResponse.json(
        { success: false, error: 'Track not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      track: {
        id: track.id,
        title: track.title,
        title_short: track.title_short,
        title_version: track.title_version,
        link: track.link,
        duration: track.duration,
        rank: track.rank,
        release_date: track.release_date,
        preview: track.preview,
        artist: {
          id: track.artist?.id,
          name: track.artist?.name,
          link: track.artist?.link,
          picture: track.artist?.picture,
          picture_medium: track.artist?.picture_medium,
          picture_big: track.artist?.picture_big,
        },
        album: {
          id: track.album?.id,
          title: track.album?.title,
          link: track.album?.link,
          cover: track.album?.cover,
          cover_medium: track.album?.cover_medium,
          cover_big: track.album?.cover_big,
          release_date: track.album?.release_date,
        },
      },
    });
  } catch (error) {
    console.error(`API Error /api/deezer/track/${id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
