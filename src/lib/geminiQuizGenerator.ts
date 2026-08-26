import { GoogleGenerativeAI } from '@google/generative-ai';
import type { QuizQuestion } from '../types';

export type AiQuestionType = 'SONG_NAME' | 'ARTIST_NAME';

export interface SongQuizInput {
  id: string | number;
  title: string;
  artist: string;
  questionType: AiQuestionType;
}

export interface BatchQuizOutputItem {
  id: string | number;
  distractors: [string, string, string];
}

const GEMINI_MODEL = 'gemini-3.5-flash-lite';
const GEMINI_FALLBACK_MODELS = ['gemini-3.5-flash-lite'];
const BATCH_SIZE = 50;

// const SYSTEM_INSTRUCTION = `You are an expert in Vietnamese music and Vietnamese linguistics.
// You receive a JSON array of up to 50 quiz items. For EACH item, generate exactly 3 WRONG answers (distractors).

// Rules by questionType:

// SONG_NAME ("Bài này là bài gì?"):
// Create 3 plausible Vietnamese song-title distractors based on the correct title. Apply these rules in PRIORITY ORDER. Prefer an earlier rule when it produces a plausible title. Use a DIFFERENT rule for each of the 3 distractors when possible:
// 1. Reverse/swap word order in the title.
// 2. Swap pronouns "Anh" ↔ "Em" (or "anh" ↔ "em").
// 3. Add OR remove exactly 1 word; the result must remain grammatically sensible Vietnamese.
// 4. Tweak Vietnamese diacritics/tones of exactly 1 word to create a different meaning (e.g. "nắng" → "nặng").
// 5. A related real Vietnamese song title (same era/genre/artist circle).

// ARTIST_NAME ("Ai hát bài này?"):
// Create 3 plausible artist-credit distractors based on the correct artist(s). Use a DIFFERENT rule for each distractor when possible:
// 1. If the credit is a duet/feat (2+ artists, joined by &, feat., ft., x, và, /), keep 1 correct artist and replace the other with a different famous Vietnamese artist.
// 2. Pick related artists in the same genre/era (V-Pop, ballad, rap Việt, indie, bolero, etc.).
// 3. Spoof the artist name slightly so it sounds funny but still meaningful in Vietnamese (near-homophone / wordplay), not gibberish.

// HARD OUTPUT RULES:
// - Return ONLY a JSON array of objects. No markdown, no code fences, no commentary.
// - Each object MUST be: {"id": <same id as input>, "distractors": ["Wrong 1", "Wrong 2", "Wrong 3"]}
// - distractors MUST contain exactly 3 unique strings.
// - Do NOT include the correct title or the exact correct artist credit.
// - Preserve every input id exactly (same type/value).
// - Return one object per input item, same order.`;

const SYSTEM_INSTRUCTION = `You are an expert in Vietnamese music and Vietnamese linguistics.
You receive a JSON array of up to 50 quiz items. For EACH item, generate exactly 3 WRONG answers (distractors).

Rules by questionType:

SONG_NAME ("Bài này là bài gì?"):
Create 3 plausible Vietnamese song-title distractors. 
CRITICAL RULE: At least ONE of the 3 distractors MUST be Rule 5 (A related real song). For the other two, pick from Rules 1-4.
1. Reverse/swap word order in the title.
2. Swap pronouns "Anh" ↔ "Em" (or "anh" ↔ "em").
3. Add OR remove exactly 1 word; the result must remain grammatically sensible.
4. Tweak Vietnamese diacritics/tones of exactly 1 word to create a different meaning.
5. A related REAL Vietnamese song title (by the same artist, same era, or same genre).
6. Make a title more meaningful than the real title.

ARTIST_NAME ("Ai hát bài này?"):
Create 3 plausible artist-credit distractors.
CRITICAL RULE: At least ONE of the 3 distractors MUST be Rule 2 (A related real artist).
1. If the credit is a duet/feat (e.g., A & B), keep 1 correct artist and replace the other with a different famous artist of the same nationality real artist (e.g., A & C).
2. Pick a same voice artist with REAL artist. 
3. Pick a related REAL artist in the same genre/era.
4. Spoof the artist name slightly so it sounds funny but still meaningful but only the international artist (this not for vietnamese artist).

HARD OUTPUT RULES:
- Return ONLY a JSON array of objects. No markdown, no code fences, no commentary.
- Each object MUST be: {"id": <same id as input>, "distractors": ["Wrong 1", "Wrong 2", "Wrong 3"]}
- distractors MUST contain exactly 3 unique strings.
- Do NOT include the correct title or the exact correct artist credit.
- Preserve every input id exactly (same type/value).
- Return one object per input item, same order.`;

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key || key === 'MY_GEMINI_API_KEY') return null;
  return key;
}

function parseBatchOutput(rawText: string): BatchQuizOutputItem[] {
  const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('Gemini response was not a JSON array');
    parsed = JSON.parse(match[0]);
  }

  const list = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === 'object' && Array.isArray((parsed as { items?: unknown }).items)
      ? (parsed as { items: unknown[] }).items
      : null;

  if (!list) throw new Error('Gemini JSON did not contain an array');

  const items: BatchQuizOutputItem[] = [];
  for (const row of list) {
    if (!row || typeof row !== 'object') continue;
    const rec = row as Record<string, unknown>;
    if (rec.id === undefined || rec.id === null) continue;
    const rawDist = rec.distractors;
    if (!Array.isArray(rawDist)) continue;
    const distractors = rawDist.map((d) => String(d).trim()).filter(Boolean);
    if (distractors.length < 3) continue;
    items.push({
      id: rec.id as string | number,
      distractors: [distractors[0], distractors[1], distractors[2]],
    });
  }
  return items;
}

function uniqueDistractors(wrong: string[], correct: string): [string, string, string] | null {
  const correctLower = correct.toLowerCase();
  const seen = new Set<string>([correctLower]);
  const out: string[] = [];
  for (const option of wrong) {
    const lower = option.toLowerCase();
    if (!lower || seen.has(lower)) continue;
    seen.add(lower);
    out.push(option);
    if (out.length === 3) return [out[0], out[1], out[2]];
  }
  return null;
}

async function generateForChunk(
  modelName: string,
  apiKey: string,
  songs: SongQuizInput[],
): Promise<BatchQuizOutputItem[]> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: {
      temperature: 0.75,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    },
  });

  const result = await model.generateContent(
    `Process this quiz batch and return the JSON array described in the system instruction.\n${JSON.stringify(songs)}`,
  );
  const text = result.response.text();
  if (!text) throw new Error('Empty Gemini response');
  return parseBatchOutput(text);
}

/**
 * Generate 3 linguistic distractors per song in one Gemini call (chunks of 50).
 */
export async function fetchBatchQuizDistractors(songs: SongQuizInput[]): Promise<BatchQuizOutputItem[]> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn('[GeminiQuiz] GEMINI_API_KEY not set in .env.local, skipping AI distractors.');
    return [];
  }

  const valid = songs.filter((s) => s.title?.trim() && s.artist?.trim() && s.questionType);
  if (valid.length === 0) return [];

  const chunks: SongQuizInput[][] = [];
  for (let i = 0; i < valid.length; i += BATCH_SIZE) {
    chunks.push(valid.slice(i, i + BATCH_SIZE));
  }

  const models = [GEMINI_MODEL, ...GEMINI_FALLBACK_MODELS];
  const all: BatchQuizOutputItem[] = [];

  for (const chunk of chunks) {
    let chunkResult: BatchQuizOutputItem[] | null = null;
    for (const modelName of models) {
      try {
        chunkResult = await generateForChunk(modelName, apiKey, chunk);
        break;
      } catch (err) {
        console.warn(`[GeminiQuiz] Model ${modelName} failed:`, err);
      }
    }
    if (chunkResult) all.push(...chunkResult);
  }

  return all;
}

export function mergeDistractorsIntoQuestion(
  question: QuizQuestion,
  distractors: string[],
): QuizQuestion {
  const correct =
    question.promptType === 'artist'
      ? (question.artist || question.options[question.correctIndex] || '')
      : (question.songTitle || question.options[question.correctIndex] || '');

  const unique = uniqueDistractors(distractors, correct);
  const wrong = unique
    ? [...unique]
    : question.options.filter((o) => o.toLowerCase() !== correct.toLowerCase()).slice(0, 3);

  while (wrong.length < 3) {
    const fallback = question.options.find(
      (o) => o.toLowerCase() !== correct.toLowerCase() && !wrong.some((w) => w.toLowerCase() === o.toLowerCase()),
    );
    if (!fallback) break;
    wrong.push(fallback);
  }

  if (!correct || wrong.length < 3) return question;

  const options = shuffleArray([correct, wrong[0], wrong[1], wrong[2]]);
  return {
    ...question,
    options,
    correctIndex: options.findIndex((o) => o.toLowerCase() === correct.toLowerCase()),
  };
}

export function applyBatchDistractors(
  questions: QuizQuestion[],
  items: BatchQuizOutputItem[],
): QuizQuestion[] {
  if (!items.length) return questions;
  const byId = new Map(items.map((item) => [String(item.id), item]));
  return questions.map((q) => {
    const item = byId.get(String(q.id));
    if (!item) return q;
    return mergeDistractorsIntoQuestion(q, item.distractors);
  });
}

export async function enrichQuestionsWithGemini(questions: QuizQuestion[]): Promise<QuizQuestion[]> {
  const batch: SongQuizInput[] = questions.slice(0, BATCH_SIZE).map((q) => ({
    id: q.id,
    title: q.songTitle || '',
    artist: q.artist || '',
    questionType: q.promptType === 'artist' ? 'ARTIST_NAME' : 'SONG_NAME',
  }));

  try {
    const items = await fetchBatchQuizDistractors(batch);
    return applyBatchDistractors(questions, items);
  } catch (err) {
    console.warn('[GeminiQuiz] Batch enrich failed, keeping pool options:', err);
    return questions;
  }
}
