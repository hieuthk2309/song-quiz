// src/lib/deezer.ts
/**
 * Deezer Service for Quiz Categories, Track Fetching, and Question Generation.
 * Integrates with public Deezer REST API.
 */

import { QuizCategory, QuizQuestion, DeezerTrack, DeezerGenre } from '../types';
import { getDeezerGenres, searchDeezerTracks, getDeezerChartTracks } from './deezerClient';

// ─────────────────────────────────────────────────────────────────────────────
// Category Configurations mapped with Deezer Genres & Search Queries
// ─────────────────────────────────────────────────────────────────────────────

export interface CategorySearchConfig {
  id: string;
  name: string;
  genreId?: number; // Optional Deezer genre ID
  searchQueries: string[];
  tag: 'Popular' | 'Trending' | 'Niche' | 'Classic' | 'Special';
  icon: string;
  description: string;
  gradient: string;
  tagBg: string;
  defaultCover: string;
}

export const CATEGORY_SEARCH_CONFIGS: CategorySearchConfig[] = [
  {
    id: 'hot-pop',
    name: 'Hot V-Pop',
    genreId: 132, // Pop
    searchQueries: ['V-Pop Top Hits', 'Nhạc Trẻ Thịnh Hành', 'Hit Việt', 'V-Pop', 'Sơn Tùng M-TP', 'Wren Evans'],
    tag: 'Popular',
    icon: 'library_music',
    description: 'Những bản hit V-pop bùng nổ hàng đầu trên Deezer hiện nay.',
    gradient: 'from-[#4f378a]/90 to-[#b70052]/90',
    tagBg: 'bg-[#b70052]',
    defaultCover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'rap-viet',
    name: 'Rap Việt & Hip Hop',
    genreId: 116, // Rap/Hip Hop
    searchQueries: ['Rap Việt', 'Hip Hop Việt', 'Đen Vâu', 'HIEUTHUHAI', 'Underground Việt Nam'],
    tag: 'Popular',
    icon: 'mic',
    description: 'Các bản rap đỉnh cao, punchline gắt và beat bốc lửa trên Deezer.',
    gradient: 'from-[#b70052]/90 to-[#6750a4]/90',
    tagBg: 'bg-[#dd2269]',
    defaultCover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'indie',
    name: 'Indie Việt Nam',
    searchQueries: ['Indie Việt Nam', 'Indie Viet', 'Vũ.', 'Ngọt', 'Chill Indie Việt'],
    tag: 'Niche',
    icon: 'headphones',
    description: 'Âm nhạc mộc mạc, sâu lắng từ các nghệ sĩ độc lập trên Deezer.',
    gradient: 'from-[#005148]/90 to-[#17deca]/70',
    tagBg: 'bg-[#005148]',
    defaultCover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'ballad',
    name: 'Nhạc Trẻ Ballad',
    searchQueries: ['Nhạc Trẻ Ballad', 'Tình Khúc Ballad Việt', 'Trung Quân Idol', 'Phan Mạnh Quỳnh', 'Acoustic Ballad'],
    tag: 'Classic',
    icon: 'favorite',
    description: 'Giai điệu da diết, tình ca lắng đọng tuyển chọn từ Deezer.',
    gradient: 'from-[#4f378a]/90 to-[#005148]/90',
    tagBg: 'bg-[#4f378a]',
    defaultCover: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: '2010s-hits',
    name: '2010s V-Pop Hits',
    searchQueries: ['Nhạc Việt 2010', 'Hit Thanh Xuân', 'V-Pop 2000s', 'Nhạc Teen V-Pop', 'Noo Phước Thịnh', 'Đông Nhi'],
    tag: 'Trending',
    icon: 'album',
    description: 'Thời kỳ hoàng kim của Pop, Teen Pop và những giai điệu thanh xuân.',
    gradient: 'from-[#006b61]/90 to-[#4f378a]/90',
    tagBg: 'bg-[#4f378a]',
    defaultCover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'genz-viral',
    name: 'Gen Z & TikTok Hits',
    searchQueries: ['Nhạc TikTok Việt Nam', 'Trend TikTok V-Pop', 'MONO', 'tlinh', 'MCK'],
    tag: 'Trending',
    icon: 'bolt',
    description: 'Âm nhạc xu hướng, vũ điệu viral thịnh hành hàng đầu.',
    gradient: 'from-[#dd2269]/90 to-[#17deca]/80',
    tagBg: 'bg-[#dd2269]',
    defaultCover: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'remix-edm',
    name: 'Vinahouse & EDM',
    genreId: 113, // Dance/Electro
    searchQueries: ['Vinahouse Remix', 'EDM Việt Nam', 'Nhạc Sàn Việt Nam', 'Nonstop Việt Mix'],
    tag: 'Special',
    icon: 'speaker',
    description: 'Bản phối sôi động, bốc lửa cho những bữa tiệc âm nhạc cuồng nhiệt.',
    gradient: 'from-[#17deca]/80 to-[#b70052]/90',
    tagBg: 'bg-[#17deca]',
    defaultCover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'ost-movie',
    name: 'Nhạc Phim OST',
    genreId: 173, // Films/Games
    searchQueries: ['Nhạc Phim Việt Nam', 'Nhạc Phim OST', 'Ca Khúc Phim Điện Ảnh', 'Mắt Biếc OST'],
    tag: 'Classic',
    icon: 'movie',
    description: 'Những ca khúc nhạc phim điện ảnh và truyền hình bất hủ.',
    gradient: 'from-[#006b61]/90 to-[#dd2269]/80',
    tagBg: 'bg-[#006b61]',
    defaultCover: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'nhac-vang',
    name: 'Nhạc Vàng & Bolero',
    searchQueries: ['Nhạc Vàng Bất Hủ', 'Bolero Việt Nam', 'Như Quỳnh', 'Quang Lê', 'Tình Khúc Bolero'],
    tag: 'Classic',
    icon: 'star',
    description: 'Những giai điệu bolero sâu lắng, nhạc vàng bất hủ của một thời vàng son.',
    gradient: 'from-[#7a5c00]/90 to-[#4f378a]/90',
    tagBg: 'bg-[#7a5c00]',
    defaultCover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'rock-viet',
    name: 'Rock Việt Nam',
    genreId: 152, // Rock
    searchQueries: ['Rock Việt Nam', 'Bức Tường Band', 'Microwave Band', 'Ngũ Cung'],
    tag: 'Niche',
    icon: 'electric_bolt',
    description: 'Âm thanh mạnh mẽ, cuộn trào của dòng nhạc rock Việt huyền thoại.',
    gradient: 'from-[#1a1c1c]/90 to-[#b70052]/90',
    tagBg: 'bg-[#494551]',
    defaultCover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'asian-music',
    name: 'Asian & C-Pop/K-Pop',
    genreId: 16, // Asian Music
    searchQueries: ['Asian Hits', 'C-Pop Top', 'K-Pop Hits', 'Nhạc Hoa Lời Việt'],
    tag: 'Popular',
    icon: 'language',
    description: 'Âm nhạc châu Á đặc sắc tuyển chọn từ danh mục Deezer Asian Music.',
    gradient: 'from-[#6750a4]/90 to-[#dd2269]/90',
    tagBg: 'bg-[#6750a4]',
    defaultCover: 'https://images.unsplash.com/photo-1508854710579-5cecc3a9ff17?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'soul-funk',
    name: 'R&B, Soul & Funk',
    genreId: 169, // Soul & Funk
    searchQueries: ['R&B Việt Nam', 'Soul Việt', 'Mỹ Anh', 'Touliver', 'Nhạc RnB'],
    tag: 'Special',
    icon: 'mood',
    description: 'Dòng nhạc R&B đương đại, Soul & Funk kết hợp giai điệu hiện đại.',
    gradient: 'from-[#4f378a]/90 to-[#17deca]/80',
    tagBg: 'bg-[#4f378a]',
    defaultCover: 'https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=600&auto=format&fit=crop&q=80',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Category Fetching via Deezer API
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchDeezerCategories(): Promise<QuizCategory[]> {
  try {
    // 1. Fetch official genres from Deezer API: GET https://api.deezer.com/genre
    const deezerGenres = await getDeezerGenres();
    const genreMap = new Map<number, DeezerGenre>();
    for (const g of deezerGenres) {
      genreMap.set(g.id, g);
    }

    const categories: QuizCategory[] = [];

    // Prepend the special "Random" mode category
    categories.push({
      id: 'random',
      name: '🎲 Chế Độ Ngẫu Nhiên',
      tag: 'Special',
      questionCount: 30,
      icon: 'shuffle',
      coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
      description: 'Tổng hợp 30 câu hỏi bất ngờ từ nhiều thể loại nhạc trên Deezer!',
      gradient: 'from-[#b70052]/90 to-[#17deca]/80',
      tagBg: 'bg-gradient-to-r from-[#b70052] to-[#17deca]',
    });

    // Process configured categories
    for (const config of CATEGORY_SEARCH_CONFIGS) {
      let coverImage = config.defaultCover;

      if (config.genreId && genreMap.has(config.genreId)) {
        const genre = genreMap.get(config.genreId)!;
        if (genre.picture_medium || genre.picture_big || genre.picture) {
          coverImage = genre.picture_big || genre.picture_medium || genre.picture || config.defaultCover;
        }
      }

      categories.push({
        id: config.id,
        name: config.name,
        tag: config.tag,
        questionCount: 120,
        icon: config.icon,
        coverImage,
        description: config.description,
        gradient: config.gradient,
        tagBg: config.tagBg,
        genreId: config.genreId,
      });
    }

    return categories;
  } catch (error) {
    console.error('[Deezer] Error fetching categories:', error);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers: Track Name Cleaning & Array Shuffling
// ─────────────────────────────────────────────────────────────────────────────

export function cleanTrackName(name: string): string {
  if (!name) return '';
  return name
    .replace(/\s*-\s*(Remaster(ed)?(\s*\d+)?|Radio Edit|Remix|Live(\s*at.*)?|Acoustic(\s*Version)?|Single Version|Bonus Track|Stereo|Mono|Original Mix|Extended Mix|Instrumental).*/gi, '')
    .replace(/\s*[\(\[](feat\.|ft\.|with|remaster|remix|version|live|deluxe|mono|stereo|ost|acoustic|edit|instrumental|explicit|clean).*?[\)\]]/gi, '')
    .trim();
}

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export interface QuizOptionItem {
  label: string;
  isCorrect: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Quiz Option Generator from Deezer Track Pool
// ─────────────────────────────────────────────────────────────────────────────

export function generateQuizOptions(
  correctTrack: DeezerTrack,
  questionType: 'ARTIST_NAME' | 'SONG_NAME' | string,
  tracksPool: DeezerTrack[] = [],
): QuizOptionItem[] {
  const normalizedType = (questionType || '').toUpperCase().trim();

  // ── 1. ARTIST_NAME: "Who is the artist?" ───────────────────────────────────
  if (
    normalizedType === 'ARTIST_NAME' ||
    normalizedType === 'ARTIST' ||
    normalizedType === 'WHO_IS_THE_ARTIST'
  ) {
    const correctArtist = correctTrack.artist?.name?.trim() || 'Unknown Artist';
    const correctArtistLower = correctArtist.toLowerCase();

    const wrongArtistsPool: string[] = [];
    const seenArtists = new Set<string>([correctArtistLower]);

    for (const track of tracksPool) {
      const artistName = track.artist?.name?.trim();
      if (!artistName) continue;
      const lower = artistName.toLowerCase();
      if (!seenArtists.has(lower)) {
        seenArtists.add(lower);
        wrongArtistsPool.push(artistName);
      }
    }

    const shuffledWrong = shuffleArray(wrongArtistsPool).slice(0, 3);

    // Fallback pool in case tracksPool is small
    const fallbackArtists = [
      'Sơn Tùng M-TP', 'Đen Vâu', 'Vũ.', 'Hoàng Thùy Linh', 'AMEE',
      'Tăng Duy Tân', 'MONO', 'Wren Evans', 'Phan Mạnh Quỳnh', 'Erik',
      'HIEUTHUHAI', 'Mỹ Tâm', 'Noo Phước Thịnh', 'Bích Phương', 'Soobin'
    ];
    for (const fallback of fallbackArtists) {
      if (shuffledWrong.length >= 3) break;
      const lower = fallback.toLowerCase();
      if (!seenArtists.has(lower)) {
        seenArtists.add(lower);
        shuffledWrong.push(fallback);
      }
    }

    const options: QuizOptionItem[] = [
      { label: correctArtist, isCorrect: true },
      ...shuffledWrong.slice(0, 3).map((artist) => ({ label: artist, isCorrect: false })),
    ];

    return shuffleArray(options);
  }

  // ── 2. SONG_NAME: "What is the song name?" ────────────────────────────────
  const rawCorrectTitle = correctTrack.title || correctTrack.title_short || 'Unknown Track';
  const cleanCorrectTitle = cleanTrackName(rawCorrectTitle) || rawCorrectTitle;
  const cleanCorrectLower = cleanCorrectTitle.toLowerCase();

  const wrongTitlesPool: string[] = [];
  const seenTitles = new Set<string>([cleanCorrectLower]);

  for (const track of tracksPool) {
    const rawTitle = track.title || track.title_short;
    if (!rawTitle) continue;
    const cleanTitle = cleanTrackName(rawTitle) || rawTitle.trim();
    const lower = cleanTitle.toLowerCase();
    if (!seenTitles.has(lower)) {
      seenTitles.add(lower);
      wrongTitlesPool.push(cleanTitle);
    }
  }

  const shuffledWrong = shuffleArray(wrongTitlesPool).slice(0, 3);

  const fallbackSongs = [
    'Cắt Đôi Nỗi Sầu', 'Hãy Trao Cho Anh', 'Waiting For You', 'Bước Qua Nhau',
    'Từng Quen', 'Có Chàng Trai Viết Lên Cây', 'Ngày Chưa Giông Bão',
    'Nơi Này Có Anh', 'Chạy Ngay Đi', 'Bên Trên Tầng Lầu'
  ];
  for (const fallback of fallbackSongs) {
    if (shuffledWrong.length >= 3) break;
    const cleanFallback = cleanTrackName(fallback);
    const lower = cleanFallback.toLowerCase();
    if (!seenTitles.has(lower)) {
      seenTitles.add(lower);
      shuffledWrong.push(cleanFallback);
    }
  }

  const options: QuizOptionItem[] = [
    { label: cleanCorrectTitle, isCorrect: true },
    ...shuffledWrong.slice(0, 3).map((title) => ({ label: title, isCorrect: false })),
  ];

  return shuffleArray(options);
}

// ─────────────────────────────────────────────────────────────────────────────
// Category Questions Generator via Deezer Tracks
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchDeezerCategoryQuestions(
  categoryId: string,
  categoryName?: string,
): Promise<QuizQuestion[]> {
  const config = CATEGORY_SEARCH_CONFIGS.find((c) => c.id === categoryId);
  const queries = config ? config.searchQueries : [categoryName || categoryId];

  try {
    let rawTracks: DeezerTrack[] = [];

    // If category has a specific Deezer genreId, fetch chart tracks
    if (config?.genreId) {
      try {
        const chartTracks = await getDeezerChartTracks(config.genreId, 25);
        if (chartTracks && chartTracks.length > 0) {
          rawTracks = rawTracks.concat(chartTracks);
        }
      } catch (err) {
        console.warn(`[Deezer] Chart fetch failed for genre ${config.genreId}:`, err);
      }
    }

    // Search query batches
    const shuffledQueries = shuffleArray(queries);
    const topQueries = shuffledQueries.slice(0, 3);

    const searchResults = await Promise.all(
      topQueries.map((q) => searchDeezerTracks(q, 20)),
    );

    for (const tracks of searchResults) {
      if (tracks && tracks.length > 0) {
        rawTracks = rawTracks.concat(tracks);
      }
    }

    // Deduplicate tracks by id or title+artist
    const seen = new Set<string>();
    const deduplicatedTracks = rawTracks.filter((t) => {
      if (!t || (!t.title && !t.title_short) || !t.artist?.name) return false;
      const key = `${(t.title_short || t.title).toLowerCase()}-${t.artist.name.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const shuffledTracks = shuffleArray(deduplicatedTracks);
    if (shuffledTracks.length < 4) {
      return [];
    }

    const generatedQuestions: QuizQuestion[] = [];
    const tracksPool = shuffledTracks;

    tracksPool.slice(0, 25).forEach((track, index) => {
      const correctArtist = track.artist?.name || 'Unknown Artist';
      const rawTitle = track.title_short || track.title || 'Unknown Track';
      const cleanName = cleanTrackName(rawTitle) || rawTitle;
      const releaseYear = track.release_date
        ? parseInt(track.release_date.substring(0, 4), 10)
        : track.album?.release_date
        ? parseInt(track.album.release_date.substring(0, 4), 10)
        : 2024;

      if (index % 2 === 0) {
        // Question Type 1: "Who is the artist?"
        const optionsObjects = generateQuizOptions(track, 'ARTIST_NAME', tracksPool);
        const options = optionsObjects.map((o) => o.label);
        const correctIndex = optionsObjects.findIndex((o) => o.isCorrect);

        generatedQuestions.push({
          id: `dz-${track.id || index}-${categoryId}-${Date.now()}`,
          category: categoryId,
          question: `Ai hát bài này?`,
          promptType: 'artist',
          songTitle: cleanName,
          artist: correctArtist,
          releaseYear,
          options,
          correctIndex,
          deezerId: track.id,
          deezerLink: track.link,
          previewUrl: track.preview,
          explanation: `Ca khúc "${cleanName}" do ${correctArtist} thể hiện (${releaseYear}).`,
          melodyNotes: [
            { freq: 523.25 + ((index * 40) % 300), duration: 0.25 },
            { freq: 659.25 + ((index * 30) % 200), duration: 0.25 },
            { freq: 783.99, duration: 0.3 },
            { freq: 880.00, duration: 0.4 },
          ],
        });
      } else {
        // Question Type 2: "What is the song name?"
        const optionsObjects = generateQuizOptions(track, 'SONG_NAME', tracksPool);
        const options = optionsObjects.map((o) => o.label);
        const correctIndex = optionsObjects.findIndex((o) => o.isCorrect);

        generatedQuestions.push({
          id: `dz-${track.id || index}-${categoryId}-${Date.now()}`,
          category: categoryId,
          question: `Bài này là bài gì?`,
          promptType: 'melody',
          songTitle: cleanName,
          artist: correctArtist,
          releaseYear,
          options,
          correctIndex,
          deezerId: track.id,
          deezerLink: track.link,
          previewUrl: track.preview,
          explanation: `Bản hit "${cleanName}" của ${correctArtist} (${releaseYear}).`,
          melodyNotes: [
            { freq: 440.0 + ((index * 35) % 200), duration: 0.25 },
            { freq: 523.25, duration: 0.25 },
            { freq: 587.33, duration: 0.25 },
            { freq: 659.25, duration: 0.4 },
          ],
        });
      }
    });

    return generatedQuestions;
  } catch (error) {
    console.error('[Deezer] Error generating questions:', error);
    return [];
  }
}
