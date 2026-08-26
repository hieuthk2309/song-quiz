import { NextResponse } from 'next/server';
import { fetchDeezerCategories } from '@/src/lib/deezer';
import { CATEGORIES as DEFAULT_CATEGORIES } from '@/src/data/quizData';

const ZINGMP3_2022_CATEGORY = {
  id: 'zingmp3-2022',
  name: 'Nhạc zing random hot',
  tag: 'Classic' as const,
  questionCount: 50,
  icon: 'music_note',
  coverImage: 'https://photo-resize-zmp3.zmdcdn.me/w600_r1x1_jpeg/covers/6/4/64c6c2a5f1c7ef5c31429dd2c2a1f5a3_1669880150.jpg',
  description: 'Các ca khúc Việt Nam nổi bật năm 2022 từ thư viện Zing MP3.',
  gradient: 'from-[#006b61]/90 to-[#f5c518]/90',
  tagBg: 'bg-[#006b61]',
};

export async function GET() {
  try {
    const deezerCategories = await fetchDeezerCategories();

    if (deezerCategories && deezerCategories.length > 0) {
      return NextResponse.json({
        success: true,
        source: 'deezer',
        categories: [...deezerCategories, ZINGMP3_2022_CATEGORY],
      });
    }

    // Fallback to default catalog if Deezer returns empty
    return NextResponse.json({
      success: true,
      source: 'fallback',
      categories: [...DEFAULT_CATEGORIES, ZINGMP3_2022_CATEGORY],
    });
  } catch (error) {
    console.error('API Error /api/deezer/categories:', error);
    return NextResponse.json(
      {
        success: false,
        source: 'fallback',
        categories: [...DEFAULT_CATEGORIES, ZINGMP3_2022_CATEGORY],
      },
      { status: 200 },
    );
  }
}
