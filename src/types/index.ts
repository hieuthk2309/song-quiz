export type ViewMode = 'home' | 'game' | 'results' | 'join-room' | 'create-room' | 'leagues' | 'history' | 'profile';

// ─────────────────────────────────────────────────────────────────────────────
// Deezer API Response Models
// ─────────────────────────────────────────────────────────────────────────────

export interface DeezerArtist {
  id: number;
  name: string;
  link?: string;
  share?: string;
  picture?: string;
  picture_small?: string;
  picture_medium?: string;
  picture_big?: string;
  picture_xl?: string;
  radio?: boolean;
  tracklist?: string;
  type: 'artist';
}

export interface DeezerAlbum {
  id: number;
  title: string;
  link?: string;
  cover?: string;
  cover_small?: string;
  cover_medium?: string;
  cover_big?: string;
  cover_xl?: string;
  md5_image?: string;
  release_date?: string;
  tracklist?: string;
  type: 'album';
}

export interface DeezerTrack {
  id: number;
  readable?: boolean;
  title: string;
  title_short?: string;
  title_version?: string;
  link?: string;
  duration?: number;
  rank?: number;
  explicit_lyrics?: boolean;
  preview?: string;
  bpm?: number;
  gain?: number;
  release_date?: string;
  artist: DeezerArtist;
  album?: DeezerAlbum;
  type: 'track';
}

export interface DeezerGenre {
  id: number;
  name: string;
  picture?: string;
  picture_small?: string;
  picture_medium?: string;
  picture_big?: string;
  picture_xl?: string;
  type: 'genre';
}

export interface DeezerGenreResponse {
  data: DeezerGenre[];
}

export interface DeezerSearchResponse {
  data: DeezerTrack[];
  total: number;
  next?: string;
}

export interface DeezerChartTracksResponse {
  data: DeezerTrack[];
  total: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Quiz & Application Data Models
// ─────────────────────────────────────────────────────────────────────────────

export interface QuizQuestion {
  id: string;
  category: string;
  question: string;
  promptType: 'melody' | 'artist' | 'lyric' | 'year' | 'album';
  songTitle?: string;
  artist?: string;
  releaseYear?: number;
  options: string[];
  correctIndex: number;
  explanation: string;
  deezerId?: number | string;
  deezerLink?: string;
  zingId?: string;
  previewUrl?: string;
  // Audio notes for melodic synth synthesizer preview (frequencies in Hz or note names)
  melodyNotes?: Array<{ freq: number; duration: number }>;
}

export interface QuizCategory {
  id: string;
  name: string;
  tag: 'Popular' | 'Trending' | 'Niche' | 'Classic' | 'Special';
  questionCount: number;
  icon: string;
  coverImage: string;
  description: string;
  gradient: string;
  tagBg: string;
  genreId?: number;
}

export interface UserProfile {
  id: string;
  displayName: string;
  avatarUrl: string;
  level: number;
  exp: number;
  highScore: number;
  globalRank: number;
  totalGames: number;
  correctAnswers: number;
  wrongAnswers: number;
  soundEnabled: boolean;
  musicVolume: number;
}

export interface MatchResult {
  id: string;
  date: string;
  categoryName: string;
  score: number;
  maxScore: number;
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  maxStreak: number;
  accuracy: number;
}

export interface LeaderboardPlayer {
  rank: number;
  name: string;
  avatarUrl: string;
  score: number;
  tier: 'Diamond' | 'Gold' | 'Silver' | 'Bronze';
  badge?: string;
  streak: number;
  isCurrentUser?: boolean;
}

export interface RoomParticipant {
  id: string;
  name: string;
  avatarUrl: string;
  isHost: boolean;
  ready: boolean;
  score?: number;
}

export interface GameRoom {
  roomId: string;
  pinCode: string;
  category: string;
  questionCount: number;
  hostName: string;
  participants: RoomParticipant[];
  status: 'waiting' | 'in_progress' | 'completed';
}
