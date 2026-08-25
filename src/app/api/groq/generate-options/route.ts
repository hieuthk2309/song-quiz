import { NextRequest, NextResponse } from 'next/server';
import { fetchQuizOptionsFromAI, type AiQuestionType } from '@/src/lib/groqQuizGenerator';

const recentCalls = new Map<string, number>();
const RATE_LIMIT_MS = 30_000;

function getCacheKey(songTitle: string, artist: string, questionType: string): string {
  return `${songTitle.toLowerCase()}-${artist.toLowerCase()}-${questionType}`;
}

function parseQuestionType(raw: unknown): AiQuestionType | null {
  const t = String(raw || '').toUpperCase().replace(/-/g, '_');
  if (t.includes('ARTIST')) return 'ARTIST_NAME';
  if (t.includes('SONG')) return 'SONG_NAME';
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const correctTrack = body.correctTrack as { title?: string; artist?: string } | undefined;
    const songTitle = (correctTrack?.title || body.songTitle || '').trim();
    const artist = (correctTrack?.artist || body.artist || '').trim();
    const questionType = parseQuestionType(body.questionType);

    if (!songTitle || !artist || !questionType) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: correctTrack { title, artist }, questionType SONG_NAME | ARTIST_NAME',
        },
        { status: 400 },
      );
    }

    const cacheKey = getCacheKey(songTitle, artist, questionType);
    const lastCall = recentCalls.get(cacheKey);
    if (lastCall && Date.now() - lastCall < RATE_LIMIT_MS) {
      return NextResponse.json(
        { success: false, error: 'Rate limit: please wait before requesting the same question again.' },
        { status: 429 },
      );
    }
    recentCalls.set(cacheKey, Date.now());

    for (const [key, ts] of recentCalls.entries()) {
      if (Date.now() - ts > RATE_LIMIT_MS * 10) recentCalls.delete(key);
    }

    const result = await fetchQuizOptionsFromAI({ title: songTitle, artist }, questionType);

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'AI generation failed or GROQ_API_KEY not configured.' },
        { status: 503 },
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error('[API/groq/generate-options] Error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      message: 'POST { correctTrack: { title, artist }, questionType: "SONG_NAME" | "ARTIST_NAME" }',
      schema: {
        options: 'string[] (4 items, shuffled: 3 AI distractors + correct answer)',
        correct_index: 'number (0-3)',
      },
    },
    { status: 200 },
  );
}
