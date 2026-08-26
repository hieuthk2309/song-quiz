import { zing } from 'zingmp3-api-next';
import type { QuizQuestion } from '../types';

type ZingTrack = {
  encodeId?: string;
  title?: string;
  artistsNames?: string;
  duration?: number;
  releaseDate?: number;
};

type ZingSearchResponse = {
  err?: number;
  data?: { items?: ZingTrack[] };
};

// search by these keyword
const ZING_SEARCH_KEYWORDS = ['nhạc trẻ hot 2023', 'nhạc trẻ hot 2026', 'remix 2026', 'nhạc trẻ', 'vpop', 'thế hệ 9x', 'nhạc trẻ genz', 'soobin', 'binz', 'hieuthuhai', 'rap việt', 'nhạc trẻ hot', 'genz', 'sad', 'rap việt', 'top 100 việt nam', '9x', '9x genz', 'top 100 vpop', 'top 50 vpop', 'top 30 vpop', 'top 10 vpop', 'top 100 rap việt', 'top 50 rap việt'] as const;

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function uniqueValues(values: string[], correct: string): string[] {
  const seen = new Set([correct.toLowerCase()]);
  return values.filter((value) => {
    const normalized = value.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

export async function fetchZingMp3Questions(): Promise<QuizQuestion[]> {
  const responses = await Promise.allSettled(
    ZING_SEARCH_KEYWORDS.map((keyword) => zing.search_by_type(keyword, 'song', 1, 100)),
  );
  const tracks = responses.flatMap((result) => {
    if (result.status === 'rejected') {
      console.warn('[Zing MP3] Search request failed:', result.reason);
      return [];
    }

    const response = result.value as ZingSearchResponse;
    if (response.err !== 0) return [];
    return response.data?.items || [];
  }).filter(
    (track): track is ZingTrack & { encodeId: string; title: string; artistsNames: string } =>
      Boolean(track.encodeId && track.title && track.artistsNames),
  );

  const uniqueTracks = Array.from(new Map(tracks.map((track) => [track.encodeId, track])).values());

  if (uniqueTracks.length < 4) return [];

  const pool = shuffle(uniqueTracks).slice(0, 50);
  return pool.map((track, index) => {
    const isArtistQuestion = index % 2 === 0;
    const correct = isArtistQuestion ? track.artistsNames : track.title;
    const distractors = uniqueValues(
      pool.map((item) => (isArtistQuestion ? item.artistsNames || '' : item.title || '')),
      correct,
    ).slice(0, 3);
    const options = shuffle([correct, ...distractors]);
    const releaseYear = track.releaseDate ? new Date(track.releaseDate * 1000).getFullYear() : 2022;

    return {
      id: `zing-${track.encodeId}`,
      category: 'zingmp3-2022',
      question: isArtistQuestion ? 'Ai hát bài này?' : 'Bài này là bài gì?',
      promptType: isArtistQuestion ? ('artist' as const) : ('melody' as const),
      songTitle: track.title,
      artist: track.artistsNames,
      releaseYear,
      options,
      correctIndex: options.indexOf(correct),
      zingId: track.encodeId,
      explanation: `Ca khúc "${track.title}" do ${track.artistsNames} thể hiện (${releaseYear}).`,
    };
  }).filter((question) => question.options.length === 4);
}