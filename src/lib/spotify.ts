import { QuizCategory, QuizQuestion } from '../types';

let cachedToken: { token: string; expiresAt: number } | null = null;

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

export async function getSpotifyAccessToken(): Promise<string | null> {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    console.warn('Spotify Client ID or Client Secret is missing in environment variables.');
    return null;
  }

  // Use cached token if valid
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.token;
  }

  try {
    const authHeader = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Spotify token error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in * 1000),
    };

    return data.access_token;
  } catch (error) {
    console.error('Failed to retrieve Spotify access token:', error);
    return null;
  }
}

// Category search configurations — 18 diverse genres
export const CATEGORY_SEARCH_CONFIGS = [
  {
    id: 'hot-pop',
    name: 'Hot V-Pop',
    searchQueries: ['V-Pop Top Hits', 'Nhạc Trẻ Thịnh Hành', 'Hit Việt Mới Nhất', 'V-Pop 2024', 'Top Ca Khúc Vpop'],
    tag: 'Popular' as const,
    icon: 'library_music',
    description: 'Những bản hit V-pop bùng nổ hàng đầu trên Spotify hiện nay.',
    gradient: 'from-[#4f378a]/90 to-[#b70052]/90',
    tagBg: 'bg-[#b70052]',
    defaultCover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'rap-viet',
    name: 'Rap Việt & HipHop',
    searchQueries: ['Rap Việt', 'Rap Việt 2024', 'Hip Hop Việt', 'Rap Việt Mùa 3', 'Underground Việt Nam'],
    tag: 'Popular' as const,
    icon: 'mic',
    description: 'Các bản rap đỉnh cao, punchline gắt và beat bốc lửa trên Spotify.',
    gradient: 'from-[#b70052]/90 to-[#6750a4]/90',
    tagBg: 'bg-[#dd2269]',
    defaultCover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'indie',
    name: 'Indie Việt Nam',
    searchQueries: ['Indie Việt Nam', 'Indie Viet', 'Acoustic Việt', 'Chill Indie Việt', 'Nhạc Indie Việt'],
    tag: 'Niche' as const,
    icon: 'headphones',
    description: 'Âm nhạc mộc mạc, sâu lắng từ các nghệ sĩ độc lập trên Spotify.',
    gradient: 'from-[#005148]/90 to-[#17deca]/70',
    tagBg: 'bg-[#005148]',
    defaultCover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'ballad',
    name: 'Nhạc Trẻ Ballad',
    searchQueries: ['Nhạc Trẻ Ballad', 'Tình Khúc Ballad Việt', 'Ballad Buồn', 'Nhạc Tâm Trạng Việt', 'Acoustic Ballad'],
    tag: 'Classic' as const,
    icon: 'favorite',
    description: 'Giai điệu da diết, tình ca lắng đọng tuyển chọn từ Spotify.',
    gradient: 'from-[#4f378a]/90 to-[#005148]/90',
    tagBg: 'bg-[#4f378a]',
    defaultCover: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: '2010s-hits',
    name: '2010s V-Pop Hits',
    searchQueries: ['Nhạc Việt 2010', 'Hit Thanh Xuân', 'V-Pop 2000s 2010s', 'Nhạc Teen V-Pop', 'Nhạc 8x 9x Việt'],
    tag: 'Trending' as const,
    icon: 'album',
    description: 'Thời kỳ hoàng kim của Pop, Teen Pop và những giai điệu thanh xuân.',
    gradient: 'from-[#006b61]/90 to-[#4f378a]/90',
    tagBg: 'bg-[#4f378a]',
    defaultCover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'genz-viral',
    name: 'Gen Z & TikTok Hits',
    searchQueries: ['Nhạc TikTok Việt Nam', 'Hot TikTok Vpop', 'Trend TikTok Nhạc Trẻ', 'Gen Z Việt Nam'],
    tag: 'Trending' as const,
    icon: 'bolt',
    description: 'Âm nhạc xu hướng, vũ điệu viral thịnh hành hàng đầu.',
    gradient: 'from-[#dd2269]/90 to-[#17deca]/80',
    tagBg: 'bg-[#dd2269]',
    defaultCover: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'remix-edm',
    name: 'Vinahouse & EDM',
    searchQueries: ['Vinahouse Remix', 'Nhạc Sàn Việt Nam', 'EDM V-Pop', 'Bass Booster Việt', 'Nonstop Việt Mix'],
    tag: 'Special' as const,
    icon: 'speaker',
    description: 'Bản phối sôi động, bốc lửa cho những bữa tiệc âm nhạc cuồng nhiệt.',
    gradient: 'from-[#17deca]/80 to-[#b70052]/90',
    tagBg: 'bg-[#17deca]',
    defaultCover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'ost-movie',
    name: 'Nhạc Phim OST',
    searchQueries: ['Nhạc Phim Việt Nam', 'Nhạc Phim OST', 'Ca Khúc Phim Điện Ảnh', 'Mắt Biếc OST', 'Nhạc Phim Truyền Hình', 'Nhạc Phim VTV'],
    tag: 'Classic' as const,
    icon: 'movie',
    description: 'Những ca khúc nhạc phim điện ảnh và truyền hình bất hủ.',
    gradient: 'from-[#006b61]/90 to-[#dd2269]/80',
    tagBg: 'bg-[#006b61]',
    defaultCover: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
  },
  // --- 10 thể loại mới ---
  {
    id: 'nhac-vang',
    name: 'Nhạc Vàng & Bolero',
    searchQueries: ['Nhạc Vàng Bất Hủ', 'Bolero Việt Nam', 'Nhạc Vàng Trữ Tình', 'Tình Khúc Bolero', 'Nhạc Vàng Chọn Lọc'],
    tag: 'Classic' as const,
    icon: 'star',
    description: 'Những giai điệu bolero sâu lắng, nhạc vàng bất hủ của một thời vàng son.',
    gradient: 'from-[#7a5c00]/90 to-[#4f378a]/90',
    tagBg: 'bg-[#7a5c00]',
    defaultCover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'rock-viet',
    name: 'Rock Việt Nam',
    searchQueries: ['Rock Việt Nam', 'Nhạc Rock Tiếng Việt', 'Bức Tường Band', 'Rock Việt Cổ Điển', 'Alternative Việt'],
    tag: 'Niche' as const,
    icon: 'electric_bolt',
    description: 'Âm thanh mạnh mẽ, cuộn trào của dòng nhạc rock Việt huyền thoại.',
    gradient: 'from-[#1a1c1c]/90 to-[#b70052]/90',
    tagBg: 'bg-[#494551]',
    defaultCover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'lofi-chill',
    name: 'Lofi & Chill Việt',
    searchQueries: ['Lofi Việt Nam', 'Nhạc Lofi Việt', 'Chill Việt Nam', 'Study Lofi Việt', 'Lofi Hip Hop Việt'],
    tag: 'Niche' as const,
    icon: 'self_improvement',
    description: 'Giai điệu êm dịu, chuyên dành cho giờ học, làm việc và thư giãn.',
    gradient: 'from-[#005148]/90 to-[#6750a4]/90',
    tagBg: 'bg-[#005148]',
    defaultCover: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'rnb-soul',
    name: 'R&B & Soul Việt',
    searchQueries: ['R&B Việt Nam', 'Soul Việt', 'R&B V-Pop', 'Neo Soul Việt', 'Nhạc RnB Việt'],
    tag: 'Special' as const,
    icon: 'mood',
    description: 'Dòng nhạc R&B đương đại kết hợp hài hòa giữa soul và pop Việt.',
    gradient: 'from-[#6750a4]/90 to-[#dd2269]/90',
    tagBg: 'bg-[#6750a4]',
    defaultCover: 'https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'nhac-xuan',
    name: 'Nhạc Xuân & Tết',
    searchQueries: ['Nhạc Xuân Việt Nam', 'Nhạc Tết Việt Nam', 'Ca Khúc Xuân', 'Tết 2024', 'Nhạc Mừng Xuân'],
    tag: 'Special' as const,
    icon: 'celebration',
    description: 'Những giai điệu rộn ràng, vui tươi chào đón mùa xuân và Tết cổ truyền.',
    gradient: 'from-[#b70052]/90 to-[#7a5c00]/90',
    tagBg: 'bg-[#b70052]',
    defaultCover: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'nhac-thieu-nhi',
    name: 'Nhạc Thiếu Nhi',
    searchQueries: ['Nhạc Thiếu Nhi Việt Nam', 'Ca Nhạc Thiếu Nhi', 'Nhạc Cho Trẻ Em Việt', 'Bài Hát Trẻ Em Hay'],
    tag: 'Classic' as const,
    icon: 'child_care',
    description: 'Kho tàng bài hát dành cho trẻ em, giai điệu trong sáng và đáng yêu.',
    gradient: 'from-[#17deca]/80 to-[#4f378a]/90',
    tagBg: 'bg-[#17deca]',
    defaultCover: 'https://images.unsplash.com/photo-1471560090527-d1af5e4e6eb6?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'dance-pop',
    name: 'Dance Pop & K-Influenced',
    searchQueries: ['Dance Pop Việt Nam', 'Nhạc Trẻ Dance', 'K-Pop Style Việt', 'Pop Dance Việt', 'Nhạc Trẻ Sôi Động'],
    tag: 'Popular' as const,
    icon: 'nightlife',
    description: 'Những bản nhạc sôi động, pha trộn phong cách Hàn Quốc và V-Pop.',
    gradient: 'from-[#dd2269]/90 to-[#6750a4]/80',
    tagBg: 'bg-[#dd2269]',
    defaultCover: 'https://images.unsplash.com/photo-1508854710579-5cecc3a9ff17?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'acoustic-cover',
    name: 'Acoustic & Cover Việt',
    searchQueries: ['Acoustic Việt Nam', 'Cover Song Việt', 'Guitar Acoustic Việt', 'Unplugged Việt', 'Nhạc Không Lời Việt'],
    tag: 'Niche' as const,
    icon: 'piano',
    description: 'Phiên bản acoustic và cover nhạc Việt tinh tế, gần gũi và đầy cảm xúc.',
    gradient: 'from-[#7a5c00]/90 to-[#005148]/90',
    tagBg: 'bg-[#7a5c00]',
    defaultCover: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'nhac-truong',
    name: 'Nhạc Trường & Tuổi Thơ',
    searchQueries: ['Nhạc Học Đường Việt Nam', 'Ca Khúc Trường', 'Nhạc Tuổi Học Trò', 'Nhạc Thanh Niên Việt', 'Ca Khúc Về Thầy Cô'],
    tag: 'Classic' as const,
    icon: 'school',
    description: 'Những bài ca về tuổi học trò, mái trường thân yêu và tình bạn.',
    gradient: 'from-[#006b61]/90 to-[#17deca]/70',
    tagBg: 'bg-[#006b61]',
    defaultCover: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'quan-ho-dan-ca',
    name: 'Dân Ca & Quan Họ',
    searchQueries: ['Dân Ca Việt Nam', 'Quan Họ Bắc Ninh', 'Nhạc Dân Gian Việt', 'Ca Trù Việt Nam', 'Hát Then Tây Bắc'],
    tag: 'Classic' as const,
    icon: 'temple_hindu',
    description: 'Di sản âm nhạc truyền thống Việt Nam — quan họ, dân ca, ca trù bất hủ.',
    gradient: 'from-[#7a5c00]/90 to-[#b70052]/80',
    tagBg: 'bg-[#7a5c00]',
    defaultCover: 'https://images.unsplash.com/photo-1513883049090-d0b7439799bf?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'cach-mang',
    name: 'Nhạc Cách Mạng',
    searchQueries: ['Nhạc Cách Mạng Việt Nam', 'Ca Khúc Kháng Chiến', 'Nhạc Đỏ Việt Nam', 'Hành Khúc Việt Nam', 'Ca Khúc Yêu Nước Việt'],
    tag: 'Classic' as const,
    icon: 'flag',
    description: 'Những bản anh hùng ca hào hùng, ngợi ca Tổ quốc và tinh thần yêu nước.',
    gradient: 'from-[#b70052]/90 to-[#1a1c1c]/90',
    tagBg: 'bg-[#b70052]',
    defaultCover: 'https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=600&auto=format&fit=crop&q=80',
  },
];

// Fetch categories and add the Random mode card at the top
export async function fetchSpotifyCategories(): Promise<QuizCategory[]> {
  const token = await getSpotifyAccessToken();
  if (!token) {
    return [];
  }

  try {
    const categoriesWithSpotifyData: QuizCategory[] = [];

    // Prepend the special "Random" mode category
    categoriesWithSpotifyData.push({
      id: 'random',
      name: '🎲 Chế Độ Ngẫu Nhiên',
      tag: 'Special' as const,
      questionCount: 30,
      icon: 'shuffle',
      coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
      description: 'Tổng hợp 30 câu hỏi bất ngờ từ nhiều thể loại ngẫu nhiên khác nhau!',
      gradient: 'from-[#b70052]/90 to-[#17deca]/80',
      tagBg: 'bg-gradient-to-r from-[#b70052] to-[#17deca]',
    });

    // Search playlists on Spotify for each genre configuration
    for (const config of CATEGORY_SEARCH_CONFIGS) {
      try {
        const query = config.searchQueries[0];
        const searchRes = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist,track&market=VN&limit=3`,
          {
            headers: { 'Authorization': `Bearer ${token}` },
            next: { revalidate: 1800 },
          }
        );

        if (searchRes.ok) {
          const data = await searchRes.json();
          const playlist = data.playlists?.items?.find(Boolean);
          const track = data.tracks?.items?.find(Boolean);

          const coverImage =
            playlist?.images?.[0]?.url ||
            track?.album?.images?.[0]?.url ||
            config.defaultCover;

          const questionCount = data.tracks?.total ? Math.min(Math.max(data.tracks.total, 50), 250) : 100;

          categoriesWithSpotifyData.push({
            id: config.id,
            name: config.name,
            tag: config.tag,
            questionCount,
            icon: config.icon,
            coverImage,
            description: playlist?.description || config.description,
            gradient: config.gradient,
            tagBg: config.tagBg,
          });
        } else {
          categoriesWithSpotifyData.push({
            id: config.id,
            name: config.name,
            tag: config.tag,
            questionCount: 100,
            icon: config.icon,
            coverImage: config.defaultCover,
            description: config.description,
            gradient: config.gradient,
            tagBg: config.tagBg,
          });
        }
      } catch {
        categoriesWithSpotifyData.push({
          id: config.id,
          name: config.name,
          tag: config.tag,
          questionCount: 100,
          icon: config.icon,
          coverImage: config.defaultCover,
          description: config.description,
          gradient: config.gradient,
          tagBg: config.tagBg,
        });
      }
    }

    return categoriesWithSpotifyData;
  } catch (error) {
    console.error('Error fetching categories from Spotify:', error);
    return [];
  }
}



/**
 * Utility to clean track names by removing versioning, remaster tags, parenthetical descriptors, etc.
 */
export function cleanTrackName(name: string): string {
  if (!name) return '';
  return name
    .replace(/\s*-\s*(Remaster(ed)?(\s*\d+)?|Radio Edit|Remix|Live(\s*at.*)?|Acoustic(\s*Version)?|Single Version|Bonus Track|Stereo|Mono|Original Mix|Extended Mix|Instrumental).*/gi, '')
    .replace(/\s*[\(\[](feat\.|ft\.|with|remaster|remix|version|live|deluxe|mono|stereo|ost|acoustic|edit|instrumental|explicit|clean).*?[\)\]]/gi, '')
    .trim();
}

/**
 * Shuffles an array in place or returns a shuffled copy using Fisher-Yates algorithm.
 */
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

export type QuestionType = 'ARTIST_NAME' | 'SONG_NAME' | 'artist' | 'song' | 'song_name' | 'who_is_the_artist' | 'what_is_the_song_name';

/**
 * Generates 4 quiz options (1 correct, 3 wrong distractors) mixed and shuffled.
 *
 * @param correctTrack - The target Spotify track for the question
 * @param questionType - 'ARTIST_NAME' ("Who is the artist?") | 'SONG_NAME' ("What is the song name?")
 * @param tracksPool - The cached pool of tracks (e.g. 50 tracks) to extract distractors without additional API calls
 */
export function generateQuizOptions(
  correctTrack: any,
  questionType: QuestionType | string,
  tracksPool: any[] = []
): QuizOptionItem[] {
  const normalizedType = (questionType || '').toUpperCase().trim();

  // ───────────────────────────────────────────────────────────────────────────
  // QUESTION TYPE: ARTIST_NAME ("Who is the artist?")
  // ───────────────────────────────────────────────────────────────────────────
  if (
    normalizedType === 'ARTIST_NAME' ||
    normalizedType === 'ARTIST' ||
    normalizedType === 'WHO_IS_THE_ARTIST'
  ) {
    const correctArtist = correctTrack.artists?.[0]?.name?.trim() || 'Unknown Artist';

    // Exclude all artists on the correct track (primary + featured)
    const excludedArtistsLower = new Set(
      (correctTrack.artists || []).map((a: any) => (a.name || '').trim().toLowerCase())
    );

    const wrongArtistsPool: string[] = [];
    const seenArtists = new Set<string>();

    for (const track of tracksPool) {
      if (!track?.artists) continue;
      for (const artist of track.artists) {
        const name = artist.name?.trim();
        if (!name) continue;
        const nameLower = name.toLowerCase();

        // Validate that this artist does not exist in correctTrack.artists
        if (!excludedArtistsLower.has(nameLower) && !seenArtists.has(nameLower)) {
          seenArtists.add(nameLower);
          wrongArtistsPool.push(name);
        }
      }
    }

    const shuffledPool = shuffleArray(wrongArtistsPool);
    const randomWrongArtists = shuffledPool.slice(0, 3);

    // Fallback pool in case tracksPool is small or homogeneous
    const fallbackArtists = [
      'Sơn Tùng M-TP', 'Đen Vâu', 'Vũ.', 'Hoàng Thùy Linh', 'AMEE',
      'Tăng Duy Tân', 'MONO', 'Wren Evans', 'Phan Mạnh Quỳnh', 'Erik',
      'HIEUTHUHAI', 'Mỹ Tâm', 'Noo Phước Thịnh', 'Bích Phương', 'Soobin'
    ];
    for (const fallback of fallbackArtists) {
      if (randomWrongArtists.length >= 3) break;
      const lower = fallback.toLowerCase();
      if (!excludedArtistsLower.has(lower) && !randomWrongArtists.some(d => d.toLowerCase() === lower)) {
        randomWrongArtists.push(fallback);
      }
    }

    const options: QuizOptionItem[] = [
      { label: correctArtist, isCorrect: true },
      ...randomWrongArtists.slice(0, 3).map(artistName => ({ label: artistName, isCorrect: false })),
    ];

    return shuffleArray(options);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // QUESTION TYPE: SONG_NAME ("What is the song name?")
  // ───────────────────────────────────────────────────────────────────────────
  if (
    normalizedType === 'SONG_NAME' ||
    normalizedType === 'SONG' ||
    normalizedType === 'WHAT_IS_THE_SONG_NAME' ||
    normalizedType === 'MELODY'
  ) {
    const rawCorrectName = correctTrack.name || 'Unknown Track';
    const cleanCorrectTitle = cleanTrackName(rawCorrectName) || rawCorrectName;
    const cleanCorrectLower = cleanCorrectTitle.toLowerCase();

    const wrongTitlesPool: string[] = [];
    const seenTitles = new Set<string>();

    for (const track of tracksPool) {
      if (!track?.name) continue;
      const cleanTitle = cleanTrackName(track.name) || track.name.trim();
      const cleanTitleLower = cleanTitle.toLowerCase();

      if (cleanTitleLower !== cleanCorrectLower && !seenTitles.has(cleanTitleLower)) {
        seenTitles.add(cleanTitleLower);
        wrongTitlesPool.push(cleanTitle);
      }
    }

    const shuffledTitles = shuffleArray(wrongTitlesPool);
    const randomWrongTitles = shuffledTitles.slice(0, 3);

    const fallbackSongs = [
      'Cắt Đôi Nỗi Sầu', 'Hãy Trao Cho Anh', 'Waiting For You', 'Bước Qua Nhau',
      'Từng Quen', 'Có Chàng Trai Viết Lên Cây', 'Ngày Chưa Giông Bão',
      'Nơi Này Có Anh', 'Chạy Ngay Đi', 'Bên Trên Tầng Lầu'
    ];
    for (const fallback of fallbackSongs) {
      if (randomWrongTitles.length >= 3) break;
      const cleanFallback = cleanTrackName(fallback);
      const lower = cleanFallback.toLowerCase();
      if (lower !== cleanCorrectLower && !randomWrongTitles.some(d => d.toLowerCase() === lower)) {
        randomWrongTitles.push(cleanFallback);
      }
    }

    const options: QuizOptionItem[] = [
      { label: cleanCorrectTitle, isCorrect: true },
      ...randomWrongTitles.slice(0, 3).map(title => ({ label: title, isCorrect: false })),
    ];

    return shuffleArray(options);
  }

  return [
    { label: correctTrack.name, isCorrect: true },
    { label: 'Option A', isCorrect: false },
    { label: 'Option B', isCorrect: false },
    { label: 'Option C', isCorrect: false },
  ];
}

// Fetch tracks for a category from Spotify and generate dynamic, non-repeating questions
export async function fetchSpotifyCategoryQuestions(categoryId: string, categoryName?: string): Promise<QuizQuestion[]> {
  const token = await getSpotifyAccessToken();
  if (!token) return [];

  const config = CATEGORY_SEARCH_CONFIGS.find(c => c.id === categoryId);
  const queries = config ? config.searchQueries : [categoryName || categoryId];

  try {
    // Pick up to 3 distinct queries from the pool
    const shuffledQueries = shuffleArray(queries);
    const query1 = shuffledQueries[0];
    const query2 = shuffledQueries[1] || query1;
    const query3 = shuffledQueries[2] || shuffledQueries[0];

    // Use 3 distinct offsets spread across pages to maximise track diversity
    const offsetBase = Math.floor(Math.random() * 4) * 10;
    const offset1 = offsetBase;
    const offset2 = (offsetBase + 10) % 40;
    const offset3 = (offsetBase + 20) % 40;

    const [res1, res2, res3] = await Promise.all([
      fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query1)}&type=track&limit=10&offset=${offset1}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store',
      }),
      fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query2)}&type=track&limit=10&offset=${offset2}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store',
      }),
      fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query3)}&type=track&limit=10&offset=${offset3}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store',
      }),
    ]);

    let rawTracks: any[] = [];
    for (const res of [res1, res2, res3]) {
      if (res.ok) {
        const d = await res.json();
        rawTracks = rawTracks.concat(d.tracks?.items || []);
      }
    }

    // Deduplicate tracks by id/name
    const seen = new Set<string>();
    rawTracks = rawTracks.filter((t: any) => {
      if (!t || !t.name || !t.artists?.length || !t.artists[0]?.name) return false;
      const key = `${t.name.toLowerCase()}-${t.artists[0].name.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    rawTracks = shuffleArray(rawTracks);
    if (rawTracks.length < 4) return [];

    const generatedQuestions: QuizQuestion[] = [];

    // Use the fetched tracks as tracksPool
    const tracksPool = rawTracks;

    tracksPool.slice(0, 30).forEach((track: any, index: number) => {
      const correctArtist = track.artists[0].name;
      const cleanName = cleanTrackName(track.name) || track.name;
      const releaseYear = track.album?.release_date ? parseInt(track.album.release_date.substring(0, 4), 10) : 2023;

      if (index % 2 === 0) {
        // Question Type 1: "Who is the artist?" ('ARTIST_NAME')
        const optionsObjects = generateQuizOptions(track, 'ARTIST_NAME', tracksPool);
        const options = optionsObjects.map(o => o.label);
        const correctIndex = optionsObjects.findIndex(o => o.isCorrect);

        generatedQuestions.push({
          id: `sp-${track.id || index}-${categoryId}-${Date.now()}`,
          category: categoryId,
          question: `Ca khúc "${cleanName}" do nghệ sĩ nào thể hiện?`,
          promptType: 'artist',
          songTitle: cleanName,
          artist: track.artists.map((a: any) => a.name).join(', '),
          releaseYear,
          options,
          correctIndex,
          explanation: `Ca khúc "${cleanName}" do ${track.artists.map((a: any) => a.name).join(', ')} thể hiện (${releaseYear}).`,
          melodyNotes: [
            { freq: 523.25 + (index * 40) % 300, duration: 0.25 },
            { freq: 659.25 + (index * 30) % 200, duration: 0.25 },
            { freq: 783.99, duration: 0.3 },
            { freq: 880.00, duration: 0.4 },
          ],
        });
      } else {
        // Question Type 2: "What is the song name?" ('SONG_NAME')
        const optionsObjects = generateQuizOptions(track, 'SONG_NAME', tracksPool);
        const options = optionsObjects.map(o => o.label);
        const correctIndex = optionsObjects.findIndex(o => o.isCorrect);

        generatedQuestions.push({
          id: `sp-${track.id || index}-${categoryId}-${Date.now()}`,
          category: categoryId,
          question: `Đâu là bài hát của nghệ sĩ ${correctArtist}?`,
          promptType: 'melody',
          songTitle: cleanName,
          artist: correctArtist,
          releaseYear,
          options,
          correctIndex,
          explanation: `Bản hit "${cleanName}" của ${correctArtist} (${releaseYear}).`,
          melodyNotes: [
            { freq: 440.0 + (index * 35) % 200, duration: 0.25 },
            { freq: 523.25, duration: 0.25 },
            { freq: 587.33, duration: 0.25 },
            { freq: 659.25, duration: 0.4 },
          ],
        });
      }
    });

    return generatedQuestions;
  } catch (err) {
    console.error('Error generating questions from Spotify tracks:', err);
    return [];
  }
}

