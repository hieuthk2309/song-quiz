'use client';

import React, { useState, useEffect } from 'react';
import { ViewMode, UserProfile, MatchResult, QuizCategory } from './types';
import { CATEGORIES as DEFAULT_CATEGORIES } from './data/quizData';
import { TopHeader } from './components/common/TopHeader';
import { BottomNav } from './components/common/BottomNav';
import { MenuDrawer } from './components/modals/MenuDrawer';
import { HomeView } from './components/views/HomeView';
import { GameplayView } from './components/views/GameplayView';
import { ResultsView } from './components/views/ResultsView';
import { JoinRoomView } from './components/views/JoinRoomView';
import { CreateRoomView } from './components/views/CreateRoomView';
import { LeaguesView } from './components/views/LeaguesView';
import { HistoryView } from './components/views/HistoryView';
import { ProfileView } from './components/views/ProfileView';
import { soundEngine } from './utils/soundEngine';

const defaultUser: UserProfile = {
  id: 'usr-1',
  displayName: 'Bạn (Player)',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
  level: 5,
  exp: 1450,
  highScore: 14250,
  globalRank: 42,
  totalGames: 18,
  correctAnswers: 142,
  wrongAnswers: 28,
  soundEnabled: true,
  musicVolume: 0.8,
};

const defaultHistory: MatchResult[] = [
  {
    id: 'hist-1',
    date: '23/08/2024',
    categoryName: 'HOT POP',
    score: 950,
    maxScore: 1000,
    correctCount: 9,
    wrongCount: 1,
    totalQuestions: 10,
    timeSpentSeconds: 68,
    maxStreak: 8,
    accuracy: 90,
  },
  {
    id: 'hist-2',
    date: '22/08/2024',
    categoryName: '2010S HITS',
    score: 820,
    maxScore: 1000,
    correctCount: 8,
    wrongCount: 2,
    totalQuestions: 10,
    timeSpentSeconds: 75,
    maxStreak: 6,
    accuracy: 80,
  },
  {
    id: 'hist-3',
    date: '21/08/2024',
    categoryName: 'INDIE VIETNAM',
    score: 750,
    maxScore: 1000,
    correctCount: 7,
    wrongCount: 3,
    totalQuestions: 10,
    timeSpentSeconds: 84,
    maxStreak: 5,
    accuracy: 70,
  },
];

export function App() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [activeCategory, setActiveCategory] = useState<string>('hot-pop');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [lastMatchResult, setLastMatchResult] = useState<MatchResult | null>(null);

  // Dynamic Spotify Categories
  const [categories, setCategories] = useState<QuizCategory[]>(DEFAULT_CATEGORIES);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(true);
  const [isSpotifyActive, setIsSpotifyActive] = useState<boolean>(false);

  // Spotify OAuth User Playlists
  const [spotifyUser, setSpotifyUser] = useState<{ displayName: string; avatar: string | null } | null>(null);
  const [myPlaylists, setMyPlaylists] = useState<any[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState<boolean>(false);

  // User Profile State with local storage persistence fallback
  const [user, setUser] = useState<UserProfile>(defaultUser);

  // History matches state
  const [matchHistory, setMatchHistory] = useState<MatchResult[]>(defaultHistory);

  // Fetch dynamic categories from Spotify API Route
  useEffect(() => {
    async function loadCategories() {
      setIsLoadingCategories(true);
      try {
        const res = await fetch('/api/spotify/categories');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.categories && data.categories.length > 0) {
            setCategories(data.categories);
            setIsSpotifyActive(data.source === 'spotify');
            return;
          }
        }
        // Fallback to default catalog if API response is invalid or empty
        setCategories(DEFAULT_CATEGORIES);
        setIsSpotifyActive(false);
      } catch (err) {
        console.warn('Could not fetch Spotify categories, using fallback catalog.', err);
        setCategories(DEFAULT_CATEGORIES);
        setIsSpotifyActive(false);
      } finally {
        setIsLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  // Check Spotify OAuth status and load user playlists
  useEffect(() => {
    async function checkSpotifyAuth() {
      try {
        // Check if spotify_user cookie exists (client-readable)
        const cookieVal = document.cookie
          .split('; ')
          .find(row => row.startsWith('spotify_user='));
        if (!cookieVal) return;

        const userData = JSON.parse(decodeURIComponent(cookieVal.split('=').slice(1).join('=')));
        setSpotifyUser({ displayName: userData.displayName, avatar: userData.avatar });

        // Load user playlists
        setIsLoadingPlaylists(true);
        const res = await fetch('/api/spotify/my-playlists', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.playlists) {
            setMyPlaylists(data.playlists.filter((pl: any) => pl.totalTracks >= 4));
          }
        } else if (res.status === 401) {
          // Not authenticated, clear user state
          setSpotifyUser(null);
        }
      } catch (err) {
        console.warn('Could not load Spotify user playlists:', err);
      } finally {
        setIsLoadingPlaylists(false);
      }
    }

    // Also check if redirected back from Spotify with ?spotify_connected=1
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('spotify_connected') === '1') {
      window.history.replaceState({}, '', window.location.pathname);
    }
    checkSpotifyAuth();
  }, []);

  // Load from localStorage on client mount
  useEffect(() => {
    setMounted(true);
    try {
      const savedUser = localStorage.getItem('vpop_quiz_user');
      if (savedUser) setUser(JSON.parse(savedUser));
    } catch {
      // safe
    }
    try {
      const savedHist = localStorage.getItem('vpop_quiz_history');
      if (savedHist) setMatchHistory(JSON.parse(savedHist));
    } catch {
      // safe
    }
  }, []);

  const handleUpdateUser = (updated: Partial<UserProfile>) => {
    setUser((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem('vpop_quiz_user', JSON.stringify(next));
      } catch {
        // safe
      }
      return next;
    });
  };

  const handleToggleSound = () => {
    const nextSound = !user.soundEnabled;
    soundEngine.setMuted(!nextSound);
    handleUpdateUser({ soundEnabled: nextSound });
  };

  const handleStartQuiz = (category: string) => {
    setActiveCategory(category);
    setCurrentView('game');
  };

  const handleFinishGame = (result: MatchResult) => {
    setLastMatchResult(result);
    setMatchHistory((prev) => {
      const next = [result, ...prev];
      try {
        localStorage.setItem('vpop_quiz_history', JSON.stringify(next));
      } catch {
        // safe
      }
      return next;
    });

    // Update career stats
    const newHigh = Math.max(user.highScore, result.score);
    handleUpdateUser({
      highScore: newHigh,
      totalGames: user.totalGames + 1,
      correctAnswers: user.correctAnswers + result.correctCount,
      wrongAnswers: user.wrongAnswers + result.wrongCount,
      exp: user.exp + Math.round(result.score / 2),
    });

    setCurrentView('results');
  };

  const handleClearHistory = () => {
    setMatchHistory([]);
    try {
      localStorage.removeItem('vpop_quiz_history');
    } catch {
      // safe
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-[#4f378a] border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-[#4f378a]">Đang tải V-Pop Music Quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] flex flex-col selection:bg-[#e9ddff] selection:text-[#4f378a]">
      {/* Top App Header (hidden during gameplay for maximum focus) */}
      {currentView !== 'game' && (
        <TopHeader
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          onOpenMenu={() => setIsMenuOpen(true)}
          user={user}
        />
      )}

      {/* Menu Drawer Modal */}
      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={(view) => setCurrentView(view)}
        user={user}
        onToggleSound={handleToggleSound}
      />

      {/* Main View Router */}
      <div className="flex-1 flex flex-col">
        {currentView === 'home' && (
          <HomeView
            user={user}
            categories={categories}
            isLoadingCategories={isLoadingCategories}
            isSpotifyActive={isSpotifyActive}
            spotifyUser={spotifyUser}
            myPlaylists={myPlaylists}
            isLoadingPlaylists={isLoadingPlaylists}
            onNavigate={(view) => setCurrentView(view)}
            onStartQuiz={handleStartQuiz}
          />
        )}

        {currentView === 'game' && (
          <GameplayView
            category={activeCategory}
            onFinishGame={handleFinishGame}
            onExit={(view) => setCurrentView(view)}
          />
        )}

        {currentView === 'results' && (
          <ResultsView
            result={lastMatchResult}
            onPlayAgain={() => setCurrentView('game')}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === 'join-room' && (
          <JoinRoomView
            onNavigate={(view) => setCurrentView(view)}
            onJoinRoom={() => {
              // Connect and start room game
              setCurrentView('game');
            }}
          />
        )}

        {currentView === 'create-room' && (
          <CreateRoomView
            user={user}
            categories={categories}
            onNavigate={(view) => setCurrentView(view)}
            onStartRoomGame={(category) => {
              setActiveCategory(category);
              setCurrentView('game');
            }}
          />
        )}

        {currentView === 'leagues' && (
          <LeaguesView
            user={user}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === 'history' && (
          <HistoryView
            history={matchHistory}
            onNavigate={(view) => setCurrentView(view)}
            onClearHistory={handleClearHistory}
          />
        )}

        {currentView === 'profile' && (
          <ProfileView
            user={user}
            onUpdateUser={handleUpdateUser}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}
      </div>

      {/* Mobile Responsive Bottom Navigation */}
      <BottomNav
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
      />
    </div>
  );
}

export default App;
