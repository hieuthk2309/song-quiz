import { NextRequest, NextResponse } from 'next/server';
import { fetchDeezerCategoryQuestions, CATEGORY_SEARCH_CONFIGS } from '@/src/lib/deezer';
import { QUIZ_QUESTIONS as DEFAULT_QUESTIONS } from '@/src/data/quizData';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const categoryId = searchParams.get('categoryId') || 'hot-pop';
  const categoryName = searchParams.get('categoryName') || undefined;

  try {
    // ─── RANDOM MODE: pick 3 distinct random categories, combine questions ───
    if (categoryId === 'random') {
      const allIds = CATEGORY_SEARCH_CONFIGS.map((c) => c.id);
      const shuffled = [...allIds].sort(() => 0.5 - Math.random());
      const picked = shuffled.slice(0, 3);

      const results = await Promise.all(
        picked.map((id) => fetchDeezerCategoryQuestions(id)),
      );

      let combined: any[] = [];
      for (const qs of results) {
        const shuffledQs = [...qs].sort(() => 0.5 - Math.random());
        combined = combined.concat(shuffledQs.slice(0, 10));
      }
      combined = combined.sort(() => 0.5 - Math.random());

      if (combined.length >= 4) {
        return NextResponse.json({
          success: true,
          source: 'deezer-random',
          randomCategories: picked,
          questions: combined,
        });
      }
    }

    // ─── NORMAL CATEGORY MODE ───
    const dynamicQuestions = await fetchDeezerCategoryQuestions(categoryId, categoryName);

    if (dynamicQuestions && dynamicQuestions.length >= 4) {
      return NextResponse.json({
        success: true,
        source: 'deezer',
        questions: dynamicQuestions,
      });
    }

    // Fallback: Filter matching category from default questions, or return all
    let filtered = DEFAULT_QUESTIONS.filter((q) => q.category === categoryId);
    if (filtered.length === 0) {
      filtered = [...DEFAULT_QUESTIONS];
    }

    return NextResponse.json({
      success: true,
      source: 'fallback',
      questions: filtered,
    });
  } catch (error) {
    console.error('API Error /api/deezer/questions:', error);
    return NextResponse.json(
      {
        success: false,
        source: 'fallback',
        questions: DEFAULT_QUESTIONS,
      },
      { status: 200 },
    );
  }
}
