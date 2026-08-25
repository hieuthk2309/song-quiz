import { NextResponse } from 'next/server';
import { fetchDeezerCategories } from '@/src/lib/deezer';
import { CATEGORIES as DEFAULT_CATEGORIES } from '@/src/data/quizData';

export async function GET() {
  try {
    const deezerCategories = await fetchDeezerCategories();

    if (deezerCategories && deezerCategories.length > 0) {
      return NextResponse.json({
        success: true,
        source: 'deezer',
        categories: deezerCategories,
      });
    }

    // Fallback to default catalog if Deezer returns empty
    return NextResponse.json({
      success: true,
      source: 'fallback',
      categories: DEFAULT_CATEGORIES,
    });
  } catch (error) {
    console.error('API Error /api/deezer/categories:', error);
    return NextResponse.json(
      {
        success: false,
        source: 'fallback',
        categories: DEFAULT_CATEGORIES,
      },
      { status: 200 },
    );
  }
}
