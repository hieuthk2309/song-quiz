export type AiQuestionType = 'SONG_NAME' | 'ARTIST_NAME';

export interface ClientQuizOptions {
  options: string[];
  correctIndex: number;
}

/**
 * Client-side caller. The LLM prompt lives on the server in groqQuizGenerator.fetchQuizOptionsFromAI.
 */
export async function fetchQuizOptionsFromAI(
  correctTrack: { title: string; artist: string },
  questionType: AiQuestionType,
): Promise<ClientQuizOptions | null> {
  try {
    const res = await fetch('/api/groq/generate-options', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correctTrack, questionType }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.success || !data?.data?.options || data.data.options.length !== 4) return null;
    return {
      options: data.data.options,
      correctIndex: data.data.correct_index,
    };
  } catch {
    return null;
  }
}
