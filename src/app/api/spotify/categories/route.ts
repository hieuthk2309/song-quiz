import { NextResponse } from 'next/server';
import { fetchSpotifyCategories } from '@/src/lib/spotify';
import { CATEGORIES as DEFAULT_CATEGORIES } from '@/src/data/quizData';

export async function GET() {
  try {
    const spotifyCategories = await fetchSpotifyCategories();
    
    if (spotifyCategories && spotifyCategories.length > 0) {
      return NextResponse.json({
        success: true,
        source: 'spotify',
        categories: spotifyCategories,
      });
    }

    // Fallback to default categories if Spotify returns empty
    return NextResponse.json({
      success: true,
      source: 'fallback',
      categories: DEFAULT_CATEGORIES,
    });
  } catch (error) {
    console.error('API Error /api/spotify/categories:', error);
    return NextResponse.json(
      {
        success: false,
        source: 'fallback',
        categories: DEFAULT_CATEGORIES,
      },
      { status: 200 }
    );
  }
}
