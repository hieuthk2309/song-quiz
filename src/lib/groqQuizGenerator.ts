export type AiQuestionType = 'SONG_NAME' | 'ARTIST_NAME';

export interface CorrectTrackInput {
  title: string;
  artist: string;
}

export interface AiQuizOptionsResult {
  question_type: 'song_name' | 'artist_name';
  correct_answer: string;
  options: string[];
  correct_index: number;
}

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const CANDIDATE_MODELS = ['groq/compound-mini', 'openai/gpt-oss-20b', 'qwen/qwen3.6-27b', 'groq/compound'];

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function normalizeType(questionType: string): AiQuestionType {
  const t = questionType.toUpperCase().replace(/-/g, '_');
  if (t === 'ARTIST_NAME' || t === 'ARTIST' || t === 'WHO_IS_THE_ARTIST') return 'ARTIST_NAME';
  return 'SONG_NAME';
}

function buildSongNamePrompt(title: string, artist: string): { system: string; user: string } {
  const system = `You are an expert in Vietnamese music and Vietnamese linguistics.
Your ONLY job is to generate 3 WRONG quiz answers (distractors) for the question "Bài này là bài gì?" (What is this song?).

Apply these rules IN PRIORITY ORDER. Prefer an earlier rule when it produces a plausible Vietnamese title. Use later rules only if needed to fill remaining slots. Each of the 3 distractors should use a DIFFERENT rule when possible:

1. Reverse the order of words in the correct title.
2. Swap the pronouns "Anh" ↔ "Em" (or "anh" ↔ "em") in the title.
3. Add OR remove exactly 1 word so the title still makes grammatical sense in Vietnamese.
4. Change the Vietnamese diacritics (dấu) of a word to create a different meaning (e.g. "nắng" → "nặng", "đường" → "đương").
5. Generate a related/similar real Vietnamese song name (same era, genre, or artist circle).

HARD CONSTRAINTS:
- Output MUST be a JSON array of exactly 3 unique strings: ["Wrong Option 1", "Wrong Option 2", "Wrong Option 3"]
- Do NOT include the correct title.
- Do NOT include markdown, code fences, commentary, or any keys/objects.
- Each string must be a plausible Vietnamese song title (or a well-known related title for rule 5).
- Distractors must be visually/phonetically confusable with the real title, not random English words.`;

  const user = `Correct song title: "${title}"
Artist: "${artist}"
Question type: SONG_NAME ("Bài này là bài gì?")

Return ONLY:
["Wrong Option 1", "Wrong Option 2", "Wrong Option 3"]`;

  return { system, user };
}

function buildArtistNamePrompt(title: string, artist: string): { system: string; user: string } {
  const system = `You are an expert in Vietnamese music.
Your ONLY job is to generate 3 WRONG quiz answers (distractors) for the question "Ai hát bài này?" (Who sings this song?).

Apply these rules. Each of the 3 distractors should use a DIFFERENT rule when possible:

1. If the correct credit is a duet / 2 artists (names joined by &, feat., ft., x, và, /), keep 1 correct artist and swap the other with a different famous Vietnamese artist.
2. Pick related artists in the same genre / scene (V-Pop, ballad, rap Việt, indie, bolero, etc.).
3. Spoof the artist's name slightly so it sounds funny but still meaningful in Vietnamese (play on words, near-homophone), not gibberish.

HARD CONSTRAINTS:
- Output MUST be a JSON array of exactly 3 unique strings: ["Wrong Option 1", "Wrong Option 2", "Wrong Option 3"]
- Do NOT include the exact correct artist credit.
- Do NOT include markdown, code fences, commentary, or any keys/objects.
- Names must look like real Vietnamese artist credits a quiz player might tap by mistake.`;

  const user = `Song title: "${title}"
Correct artist(s): "${artist}"
Question type: ARTIST_NAME ("Ai hát bài này?")

Return ONLY:
["Wrong Option 1", "Wrong Option 2", "Wrong Option 3"]`;

  return { system, user };
}

function extractJsonArray(rawText: string): string[] {
  const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  const tryParse = (text: string): unknown => JSON.parse(text);

  const candidates: unknown[] = [];
  try {
    candidates.push(tryParse(cleaned));
  } catch {
    const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        candidates.push(tryParse(arrayMatch[0]));
      } catch {
        /* continue */
      }
    }
    const objectMatch = cleaned.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        candidates.push(tryParse(objectMatch[0]));
      } catch {
        /* continue */
      }
    }
  }

  for (const parsed of candidates) {
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
    if (parsed && typeof parsed === 'object') {
      const record = parsed as Record<string, unknown>;
      const list = record.distractors ?? record.options ?? record.wrong_options;
      if (Array.isArray(list)) {
        return list.map((item) => String(item).trim()).filter(Boolean);
      }
    }
  }

  throw new Error(`No valid JSON array found in: ${rawText.substring(0, 120)}`);
}

function uniqueWrongOptions(wrong: string[], correct: string): string[] {
  const correctLower = correct.toLowerCase();
  const seen = new Set<string>([correctLower]);
  const out: string[] = [];
  for (const option of wrong) {
    const lower = option.toLowerCase();
    if (seen.has(lower)) continue;
    seen.add(lower);
    out.push(option);
    if (out.length === 3) break;
  }
  return out;
}

/**
 * Call Groq (OpenAI-compatible chat completions) to generate 3 linguistic distractors,
 * then append the correct answer and shuffle.
 */
export async function fetchQuizOptionsFromAI(
  correctTrack: CorrectTrackInput,
  questionType: AiQuestionType | string,
): Promise<AiQuizOptionsResult | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn('[GroqQuiz] GROQ_API_KEY not set, skipping AI generation.');
    return null;
  }

  const type = normalizeType(String(questionType));
  const title = correctTrack.title?.trim();
  const artist = correctTrack.artist?.trim();
  if (!title || !artist) return null;

  const correctAnswer = type === 'SONG_NAME' ? title : artist;
  const prompts = type === 'SONG_NAME' ? buildSongNamePrompt(title, artist) : buildArtistNamePrompt(title, artist);

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: prompts.system },
            { role: 'user', content: prompts.user },
          ],
          temperature: 0.75,
          max_tokens: 256,
        }),
        signal: AbortSignal.timeout(7000),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[GroqQuiz] Model ${model} error ${response.status}:`, errText);
        continue;
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) continue;

      const wrong = uniqueWrongOptions(extractJsonArray(content), correctAnswer);
      if (wrong.length < 3) continue;

      const options = shuffleArray([correctAnswer, wrong[0], wrong[1], wrong[2]]);
      return {
        question_type: type === 'SONG_NAME' ? 'song_name' : 'artist_name',
        correct_answer: correctAnswer,
        options,
        correct_index: options.findIndex((option) => option.toLowerCase() === correctAnswer.toLowerCase()),
      };
    } catch (err) {
      console.warn(`[GroqQuiz] Model ${model} failed:`, err);
    }
  }

  return null;
}

/** @deprecated Use fetchQuizOptionsFromAI */
export async function generateQuizOptions(
  songTitle: string,
  artist: string,
  questionType: 'song_name' | 'artist_name' | AiQuestionType,
): Promise<AiQuizOptionsResult | null> {
  const type = questionType === 'artist_name' || questionType === 'ARTIST_NAME' ? 'ARTIST_NAME' : 'SONG_NAME';
  return fetchQuizOptionsFromAI({ title: songTitle, artist }, type);
}
