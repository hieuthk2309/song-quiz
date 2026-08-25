import { NextRequest, NextResponse } from 'next/server';
import { fetchDeezerCategoryQuestions, CATEGORY_SEARCH_CONFIGS } from '@/src/lib/deezer';
import { QUIZ_QUESTIONS as DEFAULT_QUESTIONS } from '@/src/data/quizData';
import { enrichQuestionsWithGemini } from '@/src/lib/geminiQuizGenerator';
import type { QuizQuestion } from '@/src/types';

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const categoryId = searchParams.get('categoryId') || 'hot-pop';
  const categoryName = searchParams.get('categoryName') || undefined;

  try {
    if (categoryId === 'random') {
      const allIds = CATEGORY_SEARCH_CONFIGS.map((c) => c.id);
      const shuffled = [...allIds].sort(() => 0.5 - Math.random());
      const picked = shuffled.slice(0, 3);

      const results = await Promise.all(picked.map((id) => fetchDeezerCategoryQuestions(id)));

      let combined: QuizQuestion[] = [];
      for (const qs of results) {
        const shuffledQs = [...qs].sort(() => 0.5 - Math.random());
        combined = combined.concat(shuffledQs.slice(0, 17));
      }
      combined = combined.sort(() => 0.5 - Math.random()).slice(0, 50);

      if (combined.length >= 4) {
        const questions = await enrichQuestionsWithGemini(combined);
        return NextResponse.json({
          success: true,
          source: 'deezer-random',
          randomCategories: picked,
          questions,
        });
      }
    }

    const dynamicQuestions = await fetchDeezerCategoryQuestions(categoryId, categoryName);

    if (dynamicQuestions && dynamicQuestions.length >= 4) {
      const questions = await enrichQuestionsWithGemini(dynamicQuestions.slice(0, 50));
      return NextResponse.json({
        success: true,
        source: 'deezer',
        questions,
      });
    }

    let filtered = DEFAULT_QUESTIONS.filter((q) => q.category === categoryId);
    if (filtered.length === 0) {
      filtered = [...DEFAULT_QUESTIONS];
    }

    const questions = await enrichQuestionsWithGemini(filtered.slice(0, 50));
    return NextResponse.json({
      success: true,
      source: 'fallback',
      questions,
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
