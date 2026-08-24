export type ViewMode = 'home' | 'game' | 'results' | 'join-room' | 'create-room' | 'leagues' | 'history' | 'profile';

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
  spotifyUri?: string;
  spotifyId?: string;
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
